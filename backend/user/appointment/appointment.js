import express from "express";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import authMiddleware from "../../middleware/auth-middleware.js";
// import  { performance } from 'perf_hooks';

// Contract & ABI
import { SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } from "../../dotenvConfig.js";
import scheduleABI from "../../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
import outpatientABI from "../../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const schedule_contract = SCHEDULE_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const router = express.Router();
router.use(express.json());

// GET Doctor Schedule
router.get("/:role/appointment", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const role = req.params.role;
    if (!address) return res.status(401).json({ error: "Unauthorized" });

    const scheduleContract = new ethers.Contract( schedule_contract, scheduleABI, provider);
    const schedules = await scheduleContract.getLatestActiveDoctorSchedule();
    const scheduleCid = schedules.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${scheduleCid}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider)
    let appointments = [];
    if (role == "patient") {
      appointments = await outpatientContract.getAppointmentsByPatient(address);
    } else if (role == "doctor") {
      appointments = await outpatientContract.getAppointmentsByDoctor(address);
    } else if (role == "nurse") {
      appointments = await outpatientContract.getAppointmentsByNurse(address);
    } else if (role == "staff") {
      appointments = await outpatientContract.getAppointmentsByStaff(address);
    }
    // const start = performance.now();
    const appointmentDetails = await Promise.all(appointments.map(async (appointment) => {
      const appointmentCid = appointment.cid;
      const appointmentIpfsUrl = `${CONN.IPFS_LOCAL}/${appointmentCid}`;
      const appointmentResponse = await fetch(appointmentIpfsUrl);
      const appointmentData = await appointmentResponse.json();
      return {
        id: appointment.id.toString(),
        ownerAddress: appointment.owner,
        cid: appointment.cid,
        data: appointmentData
      };
    }));
    // const end = performance.now();
    // const duration = end - start;
    // console.log(`Promise.all took ${duration} milliseconds`);
    // console.log({appointmentDetails});
    // console.log({...appointmentDetails});
    res.status(200).json({ ...ipfsData, appointments: appointmentDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST Patient Appointment
router.post("/:role/appointment", authMiddleware, async (req, res) => {
  try {
    const {address, email} = req.auth;
    const { appointmentData, appointmentDataIpfs, signature } = req.body;
    if (!address || !email) return res.status(401).json({ error: "Unauthorized" });
    if (!appointmentData || !appointmentDataIpfs) return res.status(400).json({ error: "Missing appointment data or IPFS data" });

    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ appointmentData, appointmentDataIpfs }), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    // check if patient already made the same appointment before
    const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);
    const appointments = await contractWithSigner.getAppointmentsByPatient(accountAddress);
    let foundAppointment = false;
    for (let i = 0; i < appointments.length; i++) {
      const appointmentCid = appointments[i].cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${appointmentCid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      const ipfsData = await ipfsResponse.json();
      if (
        ipfsData.nomorRekamMedis == appointmentDataIpfs.nomorRekamMedis &&
        ipfsData.idDokter == appointmentDataIpfs.idDokter &&
        ipfsData.idJadwal == appointmentDataIpfs.idJadwal &&
        ipfsData.tanggalTerpilih == appointmentDataIpfs.tanggalTerpilih &&
        ipfsData.waktuTerpilih == appointmentDataIpfs.waktuTerpilih &&
        ipfsData.status == "ongoing"
      ) {
        foundAppointment = true;
        break;
      }
    }
    if (foundAppointment) return res.status(400).json({ error: "You already made an appointment with this doctor" });

    // Save appointment data to IPFS
    const newCid = await client.add(JSON.stringify(appointmentDataIpfs));
    console.log({newCid: newCid.path});

    // Save appointment data to blockchain
    const outpatientTx = await contractWithSigner.addOutpatientData(
      appointmentData.accountAddress,
      appointmentData.doctorAddress,
      appointmentData.nurseAddress,
      appointmentDataIpfs.nomorRekamMedis,
      newCid.path
    );
    await outpatientTx.wait();

    const addDoctorTemporary = await contractWithSigner.addTemporaryPatientData(appointmentData.doctorAddress, appointmentData.accountAddress, appointmentDataIpfs.nomorRekamMedis);
    await addDoctorTemporary.wait()
    console.log("addDoctorTemporary successfully");
    const addNurseTemporary = await contractWithSigner.addTemporaryPatientData(appointmentData.nurseAddress, appointmentData.accountAddress, appointmentDataIpfs.nomorRekamMedis);
    await addNurseTemporary.wait()
    console.log("addNurseTemporary successfully");
    res.status(200).json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Patient Appointment
router.post("/:role/appointment/cancel", authMiddleware, async (req, res) => {
  try {
    const { address, email } = req.auth;
    const { appointmentId, nomorRekamMedis, signature } = req.body;
    if (!address || !email) return res.status(401).json({ error: "Unauthorized" });
    if (!appointmentId || !nomorRekamMedis) return res.status(400).json({ error: "Missing appointmentId or nomorRekamMedis" });

    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ nomorRekamMedis, appointmentId }), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);
    const appointments = await outpatientContract.getAppointmentsByPatient(address);

    for (const appointment of appointments) {
      const cid = appointment.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      const ipfsData = await ipfsResponse.json();

      if (ipfsData.appointmentId === appointmentId && ipfsData.nomorRekamMedis === nomorRekamMedis && ipfsData.status === "ongoing") {
        ipfsData.status = "canceled";
        const updatedCid = await client.add(JSON.stringify(ipfsData));
        const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);
        await contractWithSigner.updateOutpatientData(appointment.id, address, ipfsData.alamatDokter, ipfsData.alamatPerawat, updatedCid.path);
        const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid.path}`;
        const newIpfsResponse = await fetch(newIpfsGatewayUrl);
        const newIpfsData = await newIpfsResponse.json();
        res.status(200).json({newStatus: newIpfsData.status});
        return;
      }
    }
    res.status(404).json({ error: "Appointment not found or already canceled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
