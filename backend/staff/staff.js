import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../enum-global.js";
import authMiddleware from "../middleware/auth-middleware.js";

// Contract & ABI
import { USER_CONTRACT, SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
import userABI from "../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import scheduleABI from "../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
import outpatientABI from "../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const schedule_contract = SCHEDULE_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

const userContract = new ethers.Contract( user_contract, userABI, provider);
const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountsPath = path.join(__dirname, "../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

const router = express.Router();
router.use(express.json());

// check patient profile
router.post("/check-patient-profile", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const { patientAddress, emrNumber } = req.body;
    if (!address) return res.status(401).json({ message: "Unauthorized" });

    const account = await userContract.getAccountByAddress(patientAddress);
    if (!account) return res.status(404).json({ error: "Pasien tidak ditemukan", message: "Alamat pasien tidak ditemukan." });

    let foundProfile = false;
    let foundPatientProfile;
    const accountCid = account.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${accountCid}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    if (ipfsData.accountProfiles) {
      for (const profile of ipfsData.accountProfiles) {
        if (profile.nomorRekamMedis === emrNumber) {
          foundProfile = true;
          foundPatientProfile = profile;
          break;
        }
      }
    }

    if (!foundProfile) return res.status(404).json({ error: "Profil pasien tidak ditemukan", message: "Nomor rekam medis pasien tidak ditemukan." });
    return res.status(200).json({ foundPatientProfile });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// add patient profile
router.post("/add-patient-profile", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const { patientAddress, emrNumber, signature } = req.body;
    if (!address) return res.status(401).json({ message: "Unauthorized" });

    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ patientAddress, emrNumber }), signature)
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());
    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contract = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);
    const addStaffTemporary = await contract.addTemporaryPatientData(address, patientAddress, emrNumber);
    await addStaffTemporary.wait()
    res.status(200).json({ message: "Patient profile added successfully" });
  } catch (error) {
    console.error("Error adding patient profile:", error);
    return res.status(500).json({ message: "Failed to add patient profile" });
  }
});

// Cancel Patient Appointment
router.post("/cancel-patient-appointment", authMiddleware, async (req, res) => {
  try {
    const { address, email } = req.auth;
    const { accountAddress, appointmentId, nomorRekamMedis, signature } = req.body;
    if (!address || !email) return res.status(401).json({ error: "Unauthorized" });
    if (!appointmentId || !nomorRekamMedis) return res.status(400).json({ error: "Missing appointmentId or nomorRekamMedis" });

    const accountList = await provider.listAccounts();
    let selectedAccountAddress;
    for (let account of accountList) {
      const accountByAddress = await userContract.getAccountByAddress(accountAddress);
      if (accountByAddress.accountAddress === accountAddress) {
        selectedAccountAddress = account;
        break;
      }
    }

    if (!selectedAccountAddress) return res.status(400).json({ error: "Tidak ada akun tersedia untuk pendaftaran." });

    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);
    const appointments = await outpatientContract.getAppointmentsByPatient(accountAddress);

    for (const appointment of appointments) {
      const cid = appointment.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      const ipfsData = await ipfsResponse.json();

      if (ipfsData.appointmentId === appointmentId && ipfsData.nomorRekamMedis === nomorRekamMedis && ipfsData.status === "ongoing") {
        ipfsData.status = "canceled";
        const updatedCid = await client.add(JSON.stringify(ipfsData));
        const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);
        await contractWithSigner.updateOutpatientData(appointment.id, accountAddress, ipfsData.alamatDokter, ipfsData.alamatPerawat, updatedCid.path);
        const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid.path}`;
        const newIpfsResponse = await fetch(newIpfsGatewayUrl);
        const newIpfsData = await newIpfsResponse.json();

        if (ipfsData.alamatStaf) {
          await contractWithSigner.removeTemporaryPatientData(ipfsData.alamatStaf, ipfsData.accountAddress, ipfsData.nomorRekamMedis, {gasLimit: 1000000});
          console.log("Temporary patient data in staff from staff removed successfully.");
        } 
        if (ipfsData.alamatPerawat) {
          await contractWithSigner.removeTemporaryPatientData(ipfsData.alamatPerawat, ipfsData.accountAddress, ipfsData.nomorRekamMedis, {gasLimit: 1000000});
          console.log("Temporary patient data in nurse from staff removed successfully.");
        }
        if (ipfsData.alamatDokter) {
          await contractWithSigner.removeTemporaryPatientData(ipfsData.alamatDokter, ipfsData.accountAddress, ipfsData.nomorRekamMedis, {gasLimit: 1000000});
          console.log("Temporary patient data in doctor from staff removed successfully.");
        }
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

// get patient profile list
router.get("/patient-list", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const appointments = await outpatientContract.getTemporaryPatientData(address);
    let patientAccountData = [];
    let patientProfiles = [];

    for (const appointment of appointments) {
      const patientData = await userContract.getAccountByAddress(appointment.patientAddress);
      const cid = patientData.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const response = await fetch(ipfsGatewayUrl);
      const accountData = await response.json();
      const { accountProfiles, ...rest } = accountData;
      patientAccountData.push(rest);
      for (const profile of accountData.accountProfiles) {
        if (profile.nomorRekamMedis === appointment.emrNumber) {
          const profileWithAddress = { ...profile, accountAddress: rest.accountAddress };
          patientProfiles.push(profileWithAddress);
          break;
        }
      }
    }
    res.status(200).json({ patientAccountData, patientProfiles });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// get patient appointments
router.get("/patient-appointments", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const appointments = await outpatientContract.getTemporaryPatientData(address);
    let patientAppointments = [];

    for (const appointment of appointments) {
      const patientAppointmentData = await outpatientContract.getAppointmentsByPatient(appointment.patientAddress);
      for (const patientAppointment of patientAppointmentData) {
        const cid = patientAppointment.cid;
        const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
        const response = await fetch(ipfsGatewayUrl);
        const patientData = await response.json();
        if (patientData.nomorRekamMedis === appointment.emrNumber) {
          patientAppointments.push({
            data: {
              appointmentId: patientData.appointmentId,
              accountAddress: patientData.accountAddress,
              accountEmail: patientData.accountEmail,
              nomorRekamMedis: patientData.nomorRekamMedis,
              namaLengkap: patientData.namaLengkap,
              nomorIdentitas: patientData.nomorIdentitas,
              email : patientData.email,
              telpSelular: patientData.telpSelular,
              rumahSakit: patientData.rumahSakit,
              idDokter: patientData.idDokter,
              alamatDokter: patientData.alamatDokter,
              namaDokter: patientData.namaDokter,
              spesialisasiDokter: patientData.spesialisasiDokter,
              idJadwal: patientData.idJadwal,
              hariTerpilih: patientData.hariTerpilih,
              tanggalTerpilih: patientData.tanggalTerpilih,
              waktuTerpilih: patientData.waktuTerpilih,
              idPerawat: patientData.idPerawat,
              alamatPerawat: patientData.alamatPerawat,
              namaPerawat: patientData.namaPerawat,
              status: patientData.status,
              createdAt: patientData.createdAt
            },
          });
        }
      }
    }

    const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
    const schedules = await scheduleContract.getLatestActiveDoctorSchedule();
    const scheduleCid = schedules.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${scheduleCid}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();
    res.status(200).json({ ...ipfsData, patientAppointments });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ message: "Failed to fetch patient appointments" });
  }
});

export default router;
