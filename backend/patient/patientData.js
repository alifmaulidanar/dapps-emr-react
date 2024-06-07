import fs from "fs";
// import Joi from "joi";
import path from "path";
import express from "express";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../enum-global.js";
import authMiddleware from "../middleware/auth-middleware.js";
// import { generatePatientDMR, generatePatientEMR } from "../patient/generatePatientCode.js";
import { formatDateTime, prepareFilesForUpload, generatePassword } from "../utils/utils.js";
import { retrieveDMRData } from "../middleware/userData.js";
// import { handleFileWrite } from "../user/appointment/appointment.js";

// Contract & ABI
import { USER_CONTRACT, PATIENT_CONTRACT, SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
import userABI from "../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import patientABI from "../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
import scheduleABI from "../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
import outpatientABI from "../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const patient_contract = PATIENT_CONTRACT.toString();
const schedule_contract = SCHEDULE_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

const userContract = new ethers.Contract(user_contract, userABI, provider);
const patientContract = new ethers.Contract(patient_contract, patientABI, provider);
// const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
// const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../patient/data");
const accountsPath = path.join(__dirname, "../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

const router = express.Router();
router.use(express.json());

// const schema = Joi.object({
//   username: Joi.string().min(3).max(50).required(),
//   nik: Joi.string().min(16).max(16).required(),
//   password: Joi.string().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$")).required(),
//   confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
// });

const currentDateTime = new Date();
const formattedDateTime = formatDateTime(currentDateTime);

// get patient active accounts, profiles, and appointments lists
router.get("/:role/patient-data", authMiddleware, async (req, res) => {
  try {
    const role = req.params.role;
    const address = req.auth.address;
    if(!address) return res.status(401).json({ error: "Unauthorized" });

    const scheduleContract = new ethers.Contract( schedule_contract, scheduleABI, provider);
    const schedules = await scheduleContract.getLatestActiveDoctorSchedule();
    const scheduleCid = schedules.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${scheduleCid}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    const privateKey = accounts[address];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);

    try {
      const patientAccounts = await contractWithSigner.getAllPatients();
      const patientData = await Promise.all(patientAccounts.map(async (account) => {
        const dmrNumber = account.dmrNumber;
        const dmrCid = account.dmrCid;
        return { dmrNumber, dmrCid};
      }));

      const data = await Promise.all(patientData.map(async (data) => {
        const retrievedData = await retrieveDMRData(data.dmrNumber, data.dmrCid);
        retrievedData.dmrNumber = data.dmrNumber;
        return retrievedData;
      }));

      const accounts = data.map(data => {
        const dmrNumber = data.dmrNumber;
        const accountJsonString = data.accountData[`J${dmrNumber}.json`];
        if (!accountJsonString) {
          console.error(`No account data found for dmrNumber: ${dmrNumber}`);
          return null;
        }
        try {
          const accountObj = JSON.parse(accountJsonString);
          return accountObj;
        } catch (error) {
          console.error(`Error parsing account data for dmrNumber: ${dmrNumber}`, error);
          return null;
        }
      }).filter(account => account !== null);

      const profiles = data.flatMap(data => {
        return data.emrProfiles.map(profileInfo => JSON.parse(profileInfo.profile));
      });
      const activeProfiles = profiles.filter(profile => profile.isActive === true);

      // const appointments = data.flatMap((data) => {
      //   return data.appointmentData.map((appointment) => JSON.parse(appointment.appointments));
      // });
      // const activeAppointments = appointments.filter(appointment => activeProfiles.some(profile => profile.emrNumber === appointment.emrNumber));

      const jsonAppointments = data.flatMap(data => {
        return data.appointmentData.filter(appointment => appointment.appointments).map(appointment => {
          try {
            return JSON.parse(appointment.appointments);
          } catch (error) {
            console.error('Error parsing JSON appointment data:', error);
            return null;
          }
        }).filter(appointment => appointment !== null);
      });
      const activeAppointments = jsonAppointments.filter(appointment => activeProfiles.some(profile => profile.emrNumber === appointment.emrNumber));

      res.status(200).json({ accounts, profiles: activeProfiles, appointments: activeAppointments, schedules: ipfsData });
    } catch (error) {
      console.log("Error fetching patient accounts:", error);
      return res.status(500).json({ message: "Failed to fetch patient accounts" });
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// get specific patient profile and appointments data
router.post("/:role/patient-data/details", authMiddleware, async (req, res) => {
  const { address } = req.auth;
  const { accountAddress, dmrNumber, emrNumber, nomorIdentitas, namaLengkap } = req.body;
  if (!address) return res.status(401).json({ error: "Unauthorized" });
  if (!accountAddress || !dmrNumber || !emrNumber || !nomorIdentitas || !namaLengkap) return res.status(400).json({ error: "Bad Request" });

  const privateKey = accounts[address];
  const wallet = new Wallet(privateKey);
  const walletWithProvider = wallet.connect(provider);
  // const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);

  const [exists, account] = await patientContract.getPatientByAddress(accountAddress);
    if (!exists) throw new Error("Account not found");
    const dmrCid = account.dmrCid;
    const data = await retrieveDMRData(dmrNumber, dmrCid);

    // account
    const accountJsonString = data.accountData[`J${dmrNumber}.json`];
    const accountObj = JSON.parse(accountJsonString);

    // profiles
    const accountProfiles = data.emrProfiles.map(profileInfo => {
      return JSON.parse(profileInfo.profile);
    });
    const filteredProfile = accountProfiles.filter(profile => profile.isActive === true && profile.emrNumber === emrNumber);

    // appointments
    const jsonAppointments = data.appointmentData
      .filter((appointment) => appointment.appointments)
      .map((appointment) => {
        try {
          return JSON.parse(appointment.appointments);
        } catch (error) {
          console.error('Error parsing JSON appointment data:', error);
          return null;
        }
      })
      .filter((appointment) => appointment !== null);
    
    const activeAppointments = jsonAppointments.filter((appointment) =>
      filteredProfile.some((profile) => profile.emrNumber === appointment.emrNumber)
    );

  res.status(200).json({ patientAppointments: activeAppointments });
});

export default router;
