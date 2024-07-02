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
  const dateFolderPath = path.join(servicesPath, selectedDate);
  if (!fs.existsSync(dateFolderPath)) {
    fs.mkdirSync(dateFolderPath, { recursive: true });
  }
  const fileName = `${specialization}.txt`;
  const filePath = path.join(dateFolderPath, fileName);

  let nextIndex = 1;
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8').trim();
    const lastLine = fileContent.split('\n').pop();
    const lastIndex = parseInt(lastLine.substring(1), 10);
    nextIndex = lastIndex + 1;
  }

  let prefix;
  switch (specialization) {
    case 'umum':
      prefix = 'U';
      break;
    case 'tbparu':
      prefix = 'P';
      break;
    case 'kia':
      prefix = 'K';
      break;
    default:
      prefix = '';
      break;
  }
  const queueNumber = `${prefix}${String(nextIndex).padStart(3, '0')}`;
  fs.appendFileSync(filePath, `${queueNumber}\n`);
  return queueNumber;
};

// GET Queue
router.post("/:role/queue", authMiddleware, async (req, res) => {
  try {
    const { selectedDate } = req.body;
    const basePath = path.join(__dirname, '../../patient/services', selectedDate);

    const readLines = (filePath) => {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            if (err.code === 'ENOENT') {
              return resolve([]);
            }
            return reject(err);
          }
          const lines = data.trim().split('\n');
          resolve(lines);
        });
      });
    };

    const kiaPath = path.join(basePath, 'kia.txt');
    const tbparuPath = path.join(basePath, 'tbparu.txt');
    const umumPath = path.join(basePath, 'umum.txt');
    const donePath = path.join(basePath, 'outpatientDone.txt');

    if (!fs.existsSync(basePath)) {
      return res.status(200).json({ 
        message: "Queue fetched successfully",
        queues: { kia: [], tbparu: [], umum: [] },
        stats: { total: 0, perPoli: { kia: 0, tbparu: 0, umum: 0 }, called: 0, notCalled: 0, perPoliCalled: { kia: 0, tbparu: 0, umum: 0 }, perPoliNotCalled: { kia: 0, tbparu: 0, umum: 0 } }
      });
    }

    const [linesKia, linesTbparu, linesUmum, doneLines] = await Promise.all([
      readLines(kiaPath),
      readLines(tbparuPath),
      readLines(umumPath),
      readLines(donePath)
    ]);

    const filterDone = (lines) => lines.filter(line => !doneLines.includes(line));
    const filteredKia = filterDone(linesKia);
    const filteredTbparu = filterDone(linesTbparu);
    const filteredUmum = filterDone(linesUmum);

    const totalPatients = linesKia.length + linesTbparu.length + linesUmum.length;
    const calledPatients = doneLines.length;
    const notCalledPatients = totalPatients - calledPatients;

    const perPoliCalled = {
      kia: linesKia.filter(line => doneLines.includes(line)).length,
      tbparu: linesTbparu.filter(line => doneLines.includes(line)).length,
      umum: linesUmum.filter(line => doneLines.includes(line)).length
    };

    const perPoliNotCalled = {
      kia: filteredKia.length,
      tbparu: filteredTbparu.length,
      umum: filteredUmum.length
    };

    res.status(200).json({ 
      message: "Queue fetched successfully",
      queues: {
        kia: filteredKia,
        tbparu: filteredTbparu,
        umum: filteredUmum
      },
      stats: {
        total: totalPatients,
        perPoli: { kia: linesKia.length, tbparu: linesTbparu.length, umum: linesUmum.length },
        called: calledPatients,
        notCalled: notCalledPatients,
        perPoliCalled,
        perPoliNotCalled
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/:role/next-queue", authMiddleware, async (req, res) => {
  try {
    const { currentQueue, selectedDate } = req.body;
    const basePath = path.join(__dirname, '../../patient/services', selectedDate);
    const donePath = path.join(basePath, 'outpatientDone.txt');

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    fs.appendFile(donePath, currentQueue + '\n', (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return res.status(500).json({ error: "Error writing to file" });
      }
      console.log(`Appended ${currentQueue} to outpatientDone.txt`);
      res.status(200).json({ message: "Queue updated successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

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

    res.status(200).json({ ...ipfsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST Patient Rawat Jalan (ONLY FOR PATIENT)
router.post("/patient/appointment", authMiddleware, async (req, res) => {
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
    const accountProfiles = data.emrProfiles.map(profileInfo => { return JSON.parse(profileInfo.profile) });

    // Find matched profile with emrNumber
    const emrNumber = appointmentDataIpfs.emrNumber;
    const matchedProfile = accountProfiles.find(profile => profile.emrNumber === emrNumber);
    if (!matchedProfile) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${emrNumber} tidak ditemukan.` });
    }

    const selectedDate = appointmentDataIpfs.tanggalTerpilih;
    const existingAppointment = data.appointmentData.find(appointment => {
      const appointmentDetails = JSON.parse(appointment.appointments);
      return appointmentDetails.tanggalTerpilih === selectedDate;
    });

    if (existingAppointment) {
      return res.status(400).json({ error: `Pasien ${appointmentDataIpfs.namaLengkap} sudah mendaftar rawat jalan pada ${new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}.` });
    }

    const specialization = appointmentDataIpfs.spesialisasi.trim().replace(/\s+/g, '').toLowerCase();
    const queueNumber = handleFileWrite(specialization, selectedDate);
    const appointmentId = `${selectedDate.replace(/-/g, "")}${dmrNumber}${queueNumber}`;

    // susun patientAppointmentData
    const patientAppointmentData = {
      appointmentId,
      nomorAntrean: queueNumber,
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
    console.log({newDmrCid});

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
    console.log("appointment creation from patient")
    res.status(200).json({ message: "Rawat Jalan created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Patient Rawat Jalan (ONLY FOR PATIENT)
router.post("/patient/appointment/cancel", authMiddleware, async (req, res) => {
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
    console.log("appointment cancelation from patient")
    res.status(200).json({ matchedAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST Patient Rawat Jalan
router.post("/:role/appointment", authMiddleware, async (req, res) => {
  try {
    const { address } = req.auth;
    const { role } = req.params;
    const { appointmentData, appointmentDataIpfs, signature } = req.body;
    if (!address) return res.status(401).json({ error: "Unauthorized" });
    if (!appointmentData || !appointmentDataIpfs) return res.status(400).json({ error: "Missing appointment data or IPFS data" });

    const privateKey = accounts[address];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(appointmentData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${appointmentData.dmrNumber} tidak ditemukan.` });

    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(appointmentData.dmrNumber, dmrCid);

    // profiles
    const accountProfiles = data.emrProfiles.map(profileInfo => { return JSON.parse(profileInfo.profile) });

    // Find matched profile with emrNumber
    const emrNumber = appointmentDataIpfs.emrNumber;
    const matchedProfile = accountProfiles.find(profile => profile.emrNumber === emrNumber);
    if (!matchedProfile) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${emrNumber} tidak ditemukan.` });
    }

    const selectedDate = appointmentDataIpfs.tanggalTerpilih;
    const existingAppointment = data.appointmentData.find(appointment => {
      const appointmentDetails = JSON.parse(appointment.appointments);
      return appointmentDetails.tanggalTerpilih === selectedDate;
    });

    if (existingAppointment) {
      return res.status(400).json({ error: `Pasien ${appointmentDataIpfs.namaLengkap} sudah mendaftar rawat jalan pada ${new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}.` });
    }

    const specialization = appointmentDataIpfs.spesialisasi.trim().replace(/\s+/g, '').toLowerCase();
    const queueNumber = handleFileWrite(specialization, selectedDate);
    const appointmentId = `${selectedDate.replace(/-/g, "")}${appointmentData.dmrNumber}${queueNumber}`;

    // susun patientAppointmentData
    const patientAppointmentData = {
      appointmentId,
      nomorAntrean: queueNumber,
      ...appointmentDataIpfs
    };

    const dmrFolderName = `${appointmentData.dmrNumber}J${appointmentData.dmrNumber}`;
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
      appointmentData.dmrNumber,
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

    console.log("appointment staff");
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
    console.log(`appointment creation from ${role}`)
    res.status(200).json({ message: "Rawat Jalan created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Patient Rawat Jalan
router.post("/:role/cancel-appointment", authMiddleware, async (req, res) => {
  try {
    const { address } = req.auth;
    const { role } = req.params;
    const { dmrNumber, emrNumber, appointmentId, signature } = req.body;
    if (!address) return res.status(401).json({ error: "Unauthorized" });
    if (!dmrNumber || !emrNumber || !appointmentId) return res.status(400).json({ error: "Missing dmrNumber, emrNumber, or appointmentId" });

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

    // Update patient data on blockchain
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
    console.log(`appointment cancelation from ${role}`)
    res.status(200).json({ matchedAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
