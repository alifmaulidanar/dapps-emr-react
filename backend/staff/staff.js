import express from "express";
import { ethers } from "ethers";
// import { create } from "ipfs-http-client";
import { CONN } from "../../enum-global.js";
import authMiddleware from "../middleware/auth-middleware.js";

// Contract & ABI
import { USER_CONTRACT, SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
// import userABI from "../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
// import scheduleABI from "../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
import outpatientABI from "../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
// const user_contract = USER_CONTRACT.toString();
// const schedule_contract = SCHEDULE_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

// const userContract = new ethers.Contract( user_contract, userABI, provider);
// const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);
// const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

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

// check patient appointment
router.post("/check-patient-appointment", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const { patientAddress, emrNumber } = req.body;
    if (!address) return res.status(401).json({ message: "Unauthorized" });

    const appointments = await outpatientContract.getAppointmentsByPatient(patientAddress);
    let foundProfile = false;
    let foundPatientProfile;
    for (let i = 0; i < appointments.length; i++) {
      const appointmentCid = appointments[i].cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${appointmentCid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      const ipfsData = await ipfsResponse.json();
      if (ipfsData.nomorRekamMedis == emrNumber) {
        foundProfile = true;
        foundPatientProfile = ipfsData;
        break;
      }
    }
    return res.status(200).json({ foundPatientProfile });
  } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// add patient appointment
router.post("/add-patient-appointment", authMiddleware, async (req, res) => {
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
    const addPatientTx = await contract.addTemporaryPatientData(address, patientAddress, emrNumber);
    await addPatientTx.wait()
    const getNewestData = await contract.getTemporaryPatientDataByStaff(address);
    console.log({getNewestData});
    res.status(200).json({ message: "Patient appointment added successfully" });
  } catch (error) {
    console.error("Error adding patient appointment:", error);
    return res.status(500).json({ message: "Failed to add patient appointment" });
  }
});

router.get("/patient-appointment", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const appointments = await outpatientContract.getTemporaryPatientDataByStaff(address);
    const patientProfiles = [];
    for (const appointment of appointments) {
      const patientAppointments = await outpatientContract.getAppointmentsByPatient(appointment.patientAddress);
      for (const patientAppointment of patientAppointments) {
        const cid = patientAppointment.cid;
        const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
        const response = await fetch(ipfsGatewayUrl);
        const patientData = await response.json();
        if (patientData.nomorRekamMedis === appointment.emrNumber) patientProfiles.push(patientData);
      }
    }
    res.status(200).json({ patientProfiles });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

export default router;
