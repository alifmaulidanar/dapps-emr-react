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

// function formatDateTime(date) {
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   const hours = String(date.getHours()).padStart(2, "0");
//   const minutes = String(date.getMinutes()).padStart(2, "0");
//   const seconds = String(date.getSeconds()).padStart(2, "0");
//   return `${hours}:${minutes}:${seconds}_${day}-${month}-${year}`;
// }
// const currentDateTime = new Date();
// const formattedDateTime = formatDateTime(currentDateTime);

// get patient profile list
router.get("/patient-list", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const appointments = await outpatientContract.getAppointmentsByDoctor(address);
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
    const appointments = await outpatientContract.getTemporaryPatientDataByStaff(address);
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
