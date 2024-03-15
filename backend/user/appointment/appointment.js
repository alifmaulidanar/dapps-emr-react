import express from "express";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import authMiddleware from "../../middleware/auth-middleware.js";

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

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}_${day}-${month}-${year}`;
}
const currentDateTime = new Date();
const formattedDateTime = formatDateTime(currentDateTime);

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
    let data = [];
    if (role == "patient") {
      data = await outpatientContract.getAppointmentsByPatient(address);
    } else if (role == "doctor") {
      data = await outpatientContract.getAppointmentsByDoctor(address);
    } else if (role == "nurse") {
      data = await outpatientContract.getAppointmentsByNurse(address);
    } else if (role == "staff") {
      data = await outpatientContract.getAppointmentsByStaff(address);
    }

    const appointments = data.map((appointment) => {
      return {
        id: appointment.id,
        patientAddress: appointment.patientAddress,
        patientProfileId: appointment.patientProfileId,
        doctor: appointment.doctor,
        nurse: appointment.nurse,
        cid: appointment.cid,
        createdAt: appointment.createdAt
      };
    })
    res.status(200).json({ ...ipfsData, appointments });
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

    // save appointment data ipfs to ipfs
    const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);
    const { cid } = await client.add(JSON.stringify(appointmentDataIpfs));
    const appointmentDataIpfsCid = cid.toString();

    // save appointment data to blockchain
    const appointmentTx = await contractWithSigner.addOutpatientData(
      appointmentData.accountAddress,
      appointmentData.nomorIdentitas,
      appointmentData.doctorAddress,
      appointmentData.nurseAddress,
      appointmentDataIpfsCid
    );
    const response = await appointmentTx.wait();
    console.log({ response });
    console.log({appointmentData})
    console.log({appointmentDataIpfs})
    console.log({signature})
    console.log({appointmentDataIpfsCid})
    res.status(200).json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
