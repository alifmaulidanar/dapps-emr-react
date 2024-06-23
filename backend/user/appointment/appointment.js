import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import { prepareFilesForUpload } from "../../utils/utils.js"
import { retrieveDMRData } from "../../middleware/userData.js";
import authMiddleware from "../../middleware/auth-middleware.js";
import { txChecker } from "../../ganache/txChecker.js";
// import  { performance } from 'perf_hooks';

// Contract & ABI
import { SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT, PATIENT_CONTRACT } from "../../dotenvConfig.js";
import scheduleABI from "../../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
import outpatientABI from "../../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
import patientABI from "../../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
const schedule_contract = SCHEDULE_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const patient_contract = PATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const router = express.Router();
router.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../../patient/data");
const servicesPath = path.join(__dirname, "../../patient/services");
const accountsPath = path.join(__dirname, "../../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

export const handleFileWrite = (specialization, selectedDate) => {
  // Tentukan path folder berdasarkan tanggal yang dipilih
  const dateFolderPath = path.join(servicesPath, selectedDate);
  // Buat folder jika belum ada
  if (!fs.existsSync(dateFolderPath)) {
    fs.mkdirSync(dateFolderPath, { recursive: true });
  }
  // Tentukan path file berdasarkan spesialisasi dokter
  const fileName = specialization === 'umum' ? 'umum.txt' : 'gigi.txt';
  const filePath = path.join(dateFolderPath, fileName);
  // Inisialisasi nomor urut
  let nextIndex = 1;
  // Jika file sudah ada, baca nomor urut terakhir dari file
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8').trim();
    const lastLine = fileContent.split('\n').pop();
    const lastIndex = parseInt(lastLine.substring(1), 10);
    nextIndex = lastIndex + 1;
  }
  // Buat nomor urut baru dengan format yang sesuai
  const prefix = specialization === 'umum' ? 'U' : 'G';
  const newIndexString = `${prefix}${String(nextIndex).padStart(3, '0')}`;
  // Tulis nomor urut baru ke file (tambahkan di baris baru)
  fs.appendFileSync(filePath, `${newIndexString}\n`);
  return newIndexString;
};

// GET Doctor Schedule
router.get("/:role/appointment", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    if (!address) return res.status(401).json({ error: "Unauthorized" });

    const scheduleContract = new ethers.Contract( schedule_contract, scheduleABI, provider);
    const schedules = await scheduleContract.getLatestActiveDoctorSchedule();
    const scheduleCid = schedules.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${scheduleCid}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    // const start = performance.now();
    // const end = performance.now();
    // const duration = end - start;
    // console.log(`Promise.all took ${duration} milliseconds`);
    res.status(200).json({ ...ipfsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST Patient Rawat Jalan
router.post("/:role/appointment", authMiddleware, async (req, res) => {
  try {
    const {address, dmrNumber} = req.auth;
    const { appointmentData, appointmentDataIpfs, signature } = req.body;
    if (!address || !dmrNumber) return res.status(401).json({ error: "Unauthorized" });
    if (!appointmentData || !appointmentDataIpfs) return res.status(400).json({ error: "Missing appointment data or IPFS data" });

    const privateKey = accounts[address];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });

    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(dmrNumber, dmrCid);

    // profiles
    const accountProfiles = data.emrProfiles.map(profileInfo => {
      return JSON.parse(profileInfo.profile);
    });

    // Find matched profile with emrNumber
    const emrNumber = appointmentDataIpfs.emrNumber;
    const matchedProfile = accountProfiles.find(profile => profile.emrNumber === emrNumber);
    if (!matchedProfile) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${emrNumber} tidak ditemukan.` });
    }

    // hilangkan dash pada tanggal terpilih
    const selectedDate = appointmentDataIpfs.tanggalTerpilih;
    // buat const polyCode: untuk spesialisasi umum, polyCode = 1, untuk spesialisasi gigi, polyCode = 2
    // const polyCode = appointmentDataIpfs.spesialisasi.toLowerCase() === "umum" ? "01" : "02";
    // generate appointmentId by using format "tanggalTerpilih-dmrNumber-polyCode"
    const specialization = appointmentDataIpfs.spesialisasi.toLowerCase();
    // Nomor urut baru
    const newIndexString = handleFileWrite(specialization, selectedDate);
    const appointmentId = `${selectedDate.replace(/-/g, "")}${dmrNumber}${newIndexString}`;

    // susun patientAppointmentData
    const patientAppointmentData = {
      appointmentId,
      nomorAntrean: newIndexString,
      ...appointmentDataIpfs
    };

    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;
    const appointmentFolderName = `${appointmentId}J${appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${appointmentId}.json`), JSON.stringify(patientAppointmentData));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();

    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    const updateReceipt = await updateTX.wait();
    const updateGasDetails = await txChecker(updateReceipt);

    const outpatientTx = await outpatientContractWithSigner.addOutpatientData(
      appointmentData.accountAddress,
      appointmentData.doctorAddress,
      appointmentData.nurseAddress,
      appointmentId,
      appointmentDataIpfs.emrNumber,
      newDmrCid
    );
    const outpatientReceipt = await outpatientTx.wait();
    const outpatientGasDetails = await txChecker(outpatientReceipt);

    const addDoctorTemporary = await outpatientContractWithSigner.addTemporaryPatientData(appointmentData.doctorAddress, appointmentData.accountAddress, appointmentDataIpfs.emrNumber);
    const addDoctorTemporaryReceipt = await addDoctorTemporary.wait();
    const addDoctorTemporaryGasDetails = await txChecker(addDoctorTemporaryReceipt);
    
    const addNurseTemporary = await outpatientContractWithSigner.addTemporaryPatientData(appointmentData.nurseAddress, appointmentData.accountAddress, appointmentDataIpfs.emrNumber);
    const addNurseTemporaryReceipt = await addNurseTemporary.wait();
    const addNurseTemporaryGasDetails = await txChecker(addNurseTemporaryReceipt);

    const totalGasUsed = updateReceipt.gasUsed
      .add(outpatientReceipt.gasUsed)
      .add(addDoctorTemporaryReceipt.gasUsed)
      .add(addNurseTemporaryReceipt.gasUsed);

    const totalGasFee = totalGasUsed.mul(await provider.getGasPrice());
    const totalGasUsedInUnits = totalGasUsed.toString();
    const totalGasFeeInEther = ethers.utils.formatEther(totalGasFee);
  
    console.log("appointment patient");
    console.log("Gas Price:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("----------------------------------------");
    console.log("Update Patient Account Gas Used:", updateGasDetails.gasUsed);
    console.log("Update Patient Account Gas Fee (Wei):", updateGasDetails.gasFeeWei);
    console.log("Update Patient Account Gas Fee (Gwei):", updateGasDetails.gasFeeGwei);
    console.log("Update Patient Account Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Update Patient Account Block Number:", updateGasDetails.blockNumber);
    console.log("Update Patient Account Transaction Hash:", updateGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Outpatient Data Gas Used:", outpatientGasDetails.gasUsed);
    console.log("Add Outpatient Data Gas Fee (Wei):", outpatientGasDetails.gasFeeWei);
    console.log("Add Outpatient Data Gas Fee (Gwei):", outpatientGasDetails.gasFeeGwei);
    console.log("Add Outpatient Data Gas Fee (Ether):", outpatientGasDetails.gasFeeEther);
    console.log("Add Outpatient Data Block Number:", outpatientGasDetails.blockNumber);
    console.log("Add Outpatient Data Transaction Hash:", outpatientGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Doctor Temporary Data Gas Used:", addDoctorTemporaryGasDetails.gasUsed);
    console.log("Add Doctor Temporary Data Gas Fee (Wei):", addDoctorTemporaryGasDetails.gasFeeWei);
    console.log("Add Doctor Temporary Data Gas Fee (Gwei):", addDoctorTemporaryGasDetails.gasFeeGwei);
    console.log("Add Doctor Temporary Data Gas Fee (Ether):", addDoctorTemporaryGasDetails.gasFeeEther);
    console.log("Add Doctor Temporary Data Block Number:", addDoctorTemporaryGasDetails.blockNumber);
    console.log("Add Doctor Temporary Data Transaction Hash:", addDoctorTemporaryGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Nurse Temporary Data Gas Used:", addNurseTemporaryGasDetails.gasUsed);
    console.log("Add Nurse Temporary Data Gas Fee (Wei):", addNurseTemporaryGasDetails.gasFeeWei);
    console.log("Add Nurse Temporary Data Gas Fee (Gwei):", addNurseTemporaryGasDetails.gasFeeGwei);
    console.log("Add Nurse Temporary Data Gas Fee (Ether):", addNurseTemporaryGasDetails.gasFeeEther);
    console.log("Add Nurse Temporary Data Block Number:", addNurseTemporaryGasDetails.blockNumber);
    console.log("Add Nurse Temporary Data Transaction Hash:", addNurseTemporaryGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Total Gas Used:", totalGasUsedInUnits);
    console.log("Total Gas Fee (Ether):", totalGasFeeInEther);
    console.log("----------------------------------------");
    res.status(200).json({ message: "Rawat Jalan created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Patient Rawat Jalan
router.post("/:role/appointment/cancel", authMiddleware, async (req, res) => {
  try {
    const { address, dmrNumber } = req.auth;
    const { appointmentId, emrNumber, signature } = req.body;
    if (!address || !dmrNumber) return res.status(401).json({ error: "Unauthorized" });
    if (!appointmentId || !emrNumber) return res.status(400).json({ error: "Missing appointmentId or emrNumber" });

    // const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ emrNumber, appointmentId }), signature);
    // const recoveredSigner = provider.getSigner(recoveredAddress);
    // const accounts = await provider.listAccounts();
    // const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());
    // if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    // if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const privateKey = accounts[address];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });

    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => {
      return JSON.parse(appointmentInfo.appointments);
    });

    const matchedAppointment = appointmentDetails.find(appointment => appointment.appointmentId === appointmentId && appointment.emrNumber === emrNumber && appointment.status === "ongoing");
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${appointmentId} tidak ditemukan.` });
    }
    matchedAppointment.status = "canceled";

    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;
    const appointmentFolderName = `${appointmentId}J${appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();

    // Update DMR info on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      appointmentId,
      address,
      matchedAppointment.doctorAddress,
      matchedAppointment.nurseAddress,
      newDmrCid
    );
    await outpatientTX.wait();
    console.log({matchedAppointment});
    res.status(200).json({ matchedAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
