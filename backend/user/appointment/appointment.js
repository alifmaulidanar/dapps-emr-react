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

// POST Patient Appointment
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
    // const polyCode = appointmentDataIpfs.spesialisasiDokter.toLowerCase() === "umum" ? "01" : "02";
    // generate appointmentId by using format "tanggalTerpilih-dmrNumber-polyCode"
    const specialization = appointmentDataIpfs.spesialisasiDokter.toLowerCase();
    // Nomor urut baru
    const newIndexString = handleFileWrite(specialization, selectedDate);
    const appointmentId = `${selectedDate.replace(/-/g, "")}${dmrNumber}${newIndexString}`;

    // susun patientAppointmentData
    const patientAppointmentData = {
      appointmentId,
      newIndexString,
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

    // Update DMR info on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // referensi data outpatient ke doctor dan nurse terkait
    const outpatientTx = await outpatientContractWithSigner.addOutpatientData(
      appointmentData.accountAddress,
      appointmentData.doctorAddress,
      appointmentData.nurseAddress,
      appointmentId,
      appointmentDataIpfs.emrNumber,
      newDmrCid
    );
    await outpatientTx.wait();

    const addDoctorTemporary = await outpatientContractWithSigner.addTemporaryPatientData(appointmentData.doctorAddress, appointmentData.accountAddress, appointmentDataIpfs.emrNumber);
    await addDoctorTemporary.wait()
    // console.log("addDoctorTemporary successfully");
    const addNurseTemporary = await outpatientContractWithSigner.addTemporaryPatientData(appointmentData.nurseAddress, appointmentData.accountAddress, appointmentDataIpfs.emrNumber);
    await addNurseTemporary.wait()
    // console.log("addNurseTemporary successfully");
    // console.log({newIndexString, appointmentId, newDmrCid});
    res.status(200).json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Patient Appointment
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
    console.log({matchedAppointment});

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

    res.status(200).json({ matchedAppointment });

    // for (const appointment of appointments) {
    //   const cid = appointment.cid;
    //   const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    //   const ipfsResponse = await fetch(ipfsGatewayUrl);
    //   const ipfsData = await ipfsResponse.json();

    //   if (ipfsData.appointmentId === appointmentId && ipfsData.emrNumber === emrNumber && ipfsData.status === "ongoing") {
    //     ipfsData.status = "canceled";
    //     const updatedCid = await client.add(JSON.stringify(ipfsData));
    //     const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);
    //     await contractWithSigner.updateOutpatientData(appointment.id, address, ipfsData.doctorAddress, ipfsData.nurseAddress, updatedCid.path);
    //     const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid.path}`;
    //     const newIpfsResponse = await fetch(newIpfsGatewayUrl);
    //     const newIpfsData = await newIpfsResponse.json();
    //     res.status(200).json({newStatus: newIpfsData.status});
    //     return;
    //   }
    // }
    // res.status(404).json({ error: "Appointment not found or already canceled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
