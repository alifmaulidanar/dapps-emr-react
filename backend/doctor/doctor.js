import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../enum-global.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { prepareFilesForUpload } from "../utils/utils.js";
import { retrieveDMRData } from "../middleware/userData.js";
import { handleFileWrite } from "../user/appointment/appointment.js";
import { txChecker } from "../ganache/txChecker.js";

// Contract & ABI
import { USER_CONTRACT, PATIENT_CONTRACT, SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
import userABI from "../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import patientABI from "../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
// import scheduleABI from "../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
import outpatientABI from "../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const patient_contract = PATIENT_CONTRACT.toString();
// const schedule_contract = SCHEDULE_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

const userContract = new ethers.Contract(user_contract, userABI, provider);
// const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../patient/data");
const accountsPath = path.join(__dirname, "../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accountsPrivate = JSON.parse(accountsJson);

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

async function fetchAndSaveFiles(files, appointmentPath) {
  if (files.length > 0) {
    for (let file of files) {
      const { name, path: ipfsPath } = file;
      const fileStream = client.cat(ipfsPath);
      const chunks = [];
      for await (const chunk of fileStream) { chunks.push(chunk) }
      const fileBuffer = Buffer.concat(chunks);
      const filePath = path.join(appointmentPath, name);
      fs.writeFileSync(filePath, fileBuffer);
    }
  }
  console.log("Files saved");
}

// get patient profile list
router.get("/patient-list", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const tempAppointments = await outpatientContract.getTemporaryPatientData(address);
    const uniquePatientProfilesMap = new Map();
    let patientAccountData = [];

    for (const appointment of tempAppointments) {
      const patientData = await userContract.getAccountByAddress(appointment.patientAddress);
      const cid = patientData.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const response = await fetch(ipfsGatewayUrl);
      const accountData = await response.json();
      const { accountProfiles, ...rest } = accountData;
      if (accountProfiles) patientAccountData.push(rest);

      if (accountData.hasOwnProperty("accountProfiles") && Array.isArray(accountProfiles) && accountProfiles.length) {
        for (const profile of accountData.accountProfiles) {
          if (profile.emrNumber === appointment.emrNumber && !uniquePatientProfilesMap.has(profile.emrNumber)) {
            uniquePatientProfilesMap.set(profile.emrNumber, { ...profile, accountAddress: accountData.accountAddress });
            if (!patientAccountData.some(account => account.accountAddress === accountData.accountAddress)) {
              patientAccountData.push(rest);
            }
          }
        }
      }
    }
    const patientProfiles = Array.from(uniquePatientProfilesMap?.values()) || [];
    res.status(200).json({ patientAccountData, patientProfiles });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const { accountAddress, emrNumber } = req.body;
    if (!address) return res.status(401).json({ message: "Unauthorized" });

    const account = await userContract.getAccountByAddress(accountAddress);
    if (!account) return res.status(404).json({ error: "Pasien tidak ditemukan", message: "Alamat pasien tidak ditemukan." });

    let foundProfile = false;
    let foundPatientProfile;
    const accountCid = account.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${accountCid}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    if (ipfsData.accountProfiles) {
      for (const profile of ipfsData.accountProfiles) {
        if (profile.emrNumber === emrNumber) {
          foundProfile = true;
          foundPatientProfile = profile;
          break;
        }
      }
    }
    if (!foundProfile) return res.status(404).json({ error: "Profil pasien tidak ditemukan", message: "Nomor rekam medis pasien tidak ditemukan." });

    const appointments = await outpatientContract.getAppointmentsByPatient(accountAddress);
    let patientAppointments = [];
    for (const appointment of appointments) {
      const cid = appointment.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      const ipfsData = await ipfsResponse.json();
      if (ipfsData.emrNumber === emrNumber && ipfsData.doctorAddress === address) patientAppointments.push(ipfsData);
    }
    res.status(200).json({ foundPatientProfile, patientAppointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    if (!address) return res.status(401).json({ message: "Unauthorized" });
    const { ...formattedEMR } = req.body;
    const { signature, ...rest } = formattedEMR;

    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ ...rest }), signature);
    const accounts = await provider.listAccounts();
    const doctorAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!doctorAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== doctorAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const getIpfs = await userContract.getAccountByAddress(formattedEMR.accountAddress);
    const cidFromBlockchain = getIpfs.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    // Finding the patient profile
    const patientProfileIndex = ipfsData.accountProfiles.findIndex(profile => profile.emrNumber === formattedEMR.emrNumber);
    if (patientProfileIndex === -1) return res.status(404).json({ message: "Patient profile not found" });

    // Checking for existing EMR entry
    const profileData = ipfsData.accountProfiles[patientProfileIndex];
    const emrIndex = profileData.riwayatPengobatan.findIndex(emr => emr.appointmentId === formattedEMR.appointmentId);
    const emrExists = emrIndex !== -1;
    const isDoctorTrue = emrExists && profileData.riwayatPengobatan[emrIndex].isDokter === true;

    // Push new EMR entry
    if (emrExists && isDoctorTrue) {
      return res.status(409).json({ message: "EMR sudah pernah diisi" });
    } else if (emrExists) {
      profileData.riwayatPengobatan[emrIndex] = { ...profileData.riwayatPengobatan[emrIndex], ...rest };
    } else {
      const lastEmr = profileData.riwayatPengobatan.reduce((prev, current) => (prev.id > current.id) ? prev : current, { id: 0 });
      const newId = lastEmr.id + 1;
      profileData.riwayatPengobatan.push({ id: newId, ...rest });
    };

    const updatedResult = await client.add(JSON.stringify(ipfsData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);
    console.log({ updatedCid });

    const patientAddress = accounts.find((account) => account.toLowerCase() === formattedEMR.accountAddress.toLowerCase());
    if (!patientAddress) return res.status(400).json({ error: "Account not found" });
    let selectedAccountAddress;
    for (let account of accounts) {
      const accountByAddress = await userContract.getAccountByAddress(account);
      if (accountByAddress.accountAddress === patientAddress) {
        selectedAccountAddress = account;
        break;
      }
    }
    
    if (!selectedAccountAddress) return res.status(400).json({ error: "Tidak ada akun tersedia untuk pendaftaran." });
    const privateKey = accountsPrivate[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(user_contract, userABI, walletWithProvider);

    // push data emr ke blockchain
    const tx = await contractWithSigner.updateUserAccount(
      ipfsData.accountEmail,
      ipfsData.accountUsername,
      ipfsData.accountEmail,
      ipfsData.accountPhone,
      updatedCid
    );
    await tx.wait();

    // update status appointment to done if emr is filled
    const appointments = await outpatientContract.getAppointmentsByPatient(formattedEMR.accountAddress);
    for (const appointment of appointments) {
      const cid = appointment.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      const ipfsData = await ipfsResponse.json();

      if (ipfsData.appointmentId === formattedEMR.appointmentId && ipfsData.emrNumber === formattedEMR.emrNumber && ipfsData.status === "ongoing") {
        ipfsData.status = "done";
        const updatedCid = await client.add(JSON.stringify(ipfsData));
        const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);
        // push updated status ke blockchain
        await contractWithSigner.updateOutpatientData(appointment.id, formattedEMR.accountAddress, ipfsData.doctorAddress, ipfsData.nurseAddress, updatedCid.path);

        if (formattedEMR.alamatStaf) {
          await contractWithSigner.removeTemporaryPatientData(formattedEMR.alamatStaf, formattedEMR.accountAddress, formattedEMR.emrNumber, {gasLimit: 1000000});
          console.log("Temporary patient data in staff from doctor removed successfully.");
        } 
        if (ipfsData.nurseAddress) {
          await contractWithSigner.removeTemporaryPatientData(ipfsData.nurseAddress, formattedEMR.accountAddress, formattedEMR.emrNumber, {gasLimit: 1000000});
          console.log("Temporary patient data in nurse from doctor removed successfully.");
        }
        if (ipfsData.doctorAddress) {
          await contractWithSigner.removeTemporaryPatientData(ipfsData.doctorAddress, formattedEMR.accountAddress, formattedEMR.emrNumber, {gasLimit: 1000000});
          console.log("Temporary patient data in doctor from doctor removed successfully.");
        }
        res.status(200).json({ message: "EMR saved", profile: profileData });
        return;
      }
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  };
});

router.post("/patient-list/patient-details/emr-anamnesis", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.anamnesis = { ...rest };
    matchedAppointment.status = "active"

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    const emrFiles = await prepareFilesForUpload(emrPath);
    const emrResults = [];
    for await (const result of client.addAll(emrFiles, { wrapWithDirectory: true })) { emrResults.push(result) }
    const emrCid = emrResults[emrResults.length - 1].cid.toString();
    const appointmentFiles = await prepareFilesForUpload(appointmentPath);
    const appointmentResults = [];
    for await (const result of client.addAll(appointmentFiles, { wrapWithDirectory: true })) { appointmentResults.push(result) }
    const appointmentCid = appointmentResults[appointmentResults.length - 1].cid.toString();

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    const updateReceipt = await updateTX.wait();
    const updateGasDetails = await txChecker(updateReceipt);

    // Update outpatient data on blockchain
    const outpatientTx = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    const outpatientReceipt = await outpatientTx.wait();
    const outpatientGasDetails = await txChecker(outpatientReceipt);

    const totalGasUsed = updateReceipt.gasUsed.add(outpatientReceipt.gasUsed)
    const totalGasFee = totalGasUsed.mul(await provider.getGasPrice());
    const totalGasFeeSepolia = totalGasUsed.mul(9346783);
    const totalGasUsedInUnits = totalGasUsed.toString();
    const totalGasFeeInEther = ethers.utils.formatEther(totalGasFee);
    const totalGasFeeInSepolia = ethers.utils.formatEther(totalGasFeeSepolia);

    console.log("----------------------------------------");
    console.log("Pengisian RME Anamnesis oleh Dokter @ doctor.js")
    console.log("Update CID Tingkat Akun:", newDmrCid);
    console.log("Update CID Tingkat Profil:", emrCid);
    console.log("Update CID Tingkat Pengobatan:", appointmentCid);
    console.log("Gas Price Quorum:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Gas Price Sepolia: 0.000000000009346783");
    console.log("----------------------------------------");
    console.log("Update Patient Account Gas Used:", updateGasDetails.gasUsed);
    console.log("Update Patient Account Gas Fee (Wei):", updateGasDetails.gasFeeWei);
    console.log("Update Patient Account Gas Fee (Gwei):", updateGasDetails.gasFeeGwei);
    console.log("Update Patient Account Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Update Patient Account Gas Fee Sepolia (Wei):", updateGasDetails.gasFeeWeiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Gwei):", updateGasDetails.gasFeeGweiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Ether):", updateGasDetails.gasFeeEtherSepolia);
    console.log("Update Patient Account Block Number:", updateGasDetails.blockNumber);
    console.log("Update Patient Account Transaction Hash:", updateGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Outpatient Data Gas Used:", outpatientGasDetails.gasUsed);
    console.log("Add Outpatient Data Gas Fee (Wei):", outpatientGasDetails.gasFeeWei);
    console.log("Add Outpatient Data Gas Fee (Gwei):", outpatientGasDetails.gasFeeGwei);
    console.log("Add Outpatient Data Gas Fee (Ether):", outpatientGasDetails.gasFeeEther);
    console.log("Add Outpatient Data Gas Fee Sepolia (Wei):", outpatientGasDetails.gasFeeWeiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Gwei):", outpatientGasDetails.gasFeeGweiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Ether):", outpatientGasDetails.gasFeeEtherSepolia);
    console.log("Add Outpatient Data Block Number:", outpatientGasDetails.blockNumber);
    console.log("Add Outpatient Data Transaction Hash:", outpatientGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Total Gas Used:", totalGasUsedInUnits);
    console.log("Total Gas Fee (Ether):", totalGasFeeInEther);
    console.log("Total Gas Fee Sepolia (Ether):", totalGasFeeInSepolia);
    console.log("----------------------------------------");

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-diagnosis", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber 
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.diagnosis = { ...rest };
    matchedAppointment.status = "active"

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    const emrFiles = await prepareFilesForUpload(emrPath);
    const emrResults = [];
    for await (const result of client.addAll(emrFiles, { wrapWithDirectory: true })) { emrResults.push(result) }
    const emrCid = emrResults[emrResults.length - 1].cid.toString();
    const appointmentFiles = await prepareFilesForUpload(appointmentPath);
    const appointmentResults = [];
    for await (const result of client.addAll(appointmentFiles, { wrapWithDirectory: true })) { appointmentResults.push(result) }
    const appointmentCid = appointmentResults[appointmentResults.length - 1].cid.toString();

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    const updateReceipt = await updateTX.wait();
    const updateGasDetails = await txChecker(updateReceipt);

    // Update outpatient data on blockchain
    const outpatientTx = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    const outpatientReceipt = await outpatientTx.wait();
    const outpatientGasDetails = await txChecker(outpatientReceipt);

    const totalGasUsed = updateReceipt.gasUsed.add(outpatientReceipt.gasUsed)
    const totalGasFee = totalGasUsed.mul(await provider.getGasPrice());
    const totalGasFeeSepolia = totalGasUsed.mul(9346783);
    const totalGasUsedInUnits = totalGasUsed.toString();
    const totalGasFeeInEther = ethers.utils.formatEther(totalGasFee);
    const totalGasFeeInSepolia = ethers.utils.formatEther(totalGasFeeSepolia);

    console.log("----------------------------------------");
    console.log("Pengisian RME Diagnosis oleh Dokter @ doctor.js")
    console.log("Update CID Tingkat Akun:", newDmrCid);
    console.log("Update CID Tingkat Profil:", emrCid);
    console.log("Update CID Tingkat Pengobatan:", appointmentCid);
    console.log("Gas Price Quorum:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Gas Price Sepolia: 0.000000000009346783");
    console.log("----------------------------------------");
    console.log("Update Patient Account Gas Used:", updateGasDetails.gasUsed);
    console.log("Update Patient Account Gas Fee (Wei):", updateGasDetails.gasFeeWei);
    console.log("Update Patient Account Gas Fee (Gwei):", updateGasDetails.gasFeeGwei);
    console.log("Update Patient Account Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Update Patient Account Gas Fee Sepolia (Wei):", updateGasDetails.gasFeeWeiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Gwei):", updateGasDetails.gasFeeGweiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Ether):", updateGasDetails.gasFeeEtherSepolia);
    console.log("Update Patient Account Block Number:", updateGasDetails.blockNumber);
    console.log("Update Patient Account Transaction Hash:", updateGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Outpatient Data Gas Used:", outpatientGasDetails.gasUsed);
    console.log("Add Outpatient Data Gas Fee (Wei):", outpatientGasDetails.gasFeeWei);
    console.log("Add Outpatient Data Gas Fee (Gwei):", outpatientGasDetails.gasFeeGwei);
    console.log("Add Outpatient Data Gas Fee (Ether):", outpatientGasDetails.gasFeeEther);
    console.log("Add Outpatient Data Gas Fee Sepolia (Wei):", outpatientGasDetails.gasFeeWeiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Gwei):", outpatientGasDetails.gasFeeGweiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Ether):", outpatientGasDetails.gasFeeEtherSepolia);
    console.log("Add Outpatient Data Block Number:", outpatientGasDetails.blockNumber);
    console.log("Add Outpatient Data Transaction Hash:", outpatientGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Total Gas Used:", totalGasUsedInUnits);
    console.log("Total Gas Fee (Ether):", totalGasFeeInEther);
    console.log("Total Gas Fee Sepolia (Ether):", totalGasFeeInSepolia);
    console.log("----------------------------------------");

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-kehamilan", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.kehamilan = { ...rest };
    matchedAppointment.status = "active"

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    const emrFiles = await prepareFilesForUpload(emrPath);
    const emrResults = [];
    for await (const result of client.addAll(emrFiles, { wrapWithDirectory: true })) { emrResults.push(result) }
    const emrCid = emrResults[emrResults.length - 1].cid.toString();
    const appointmentFiles = await prepareFilesForUpload(appointmentPath);
    const appointmentResults = [];
    for await (const result of client.addAll(appointmentFiles, { wrapWithDirectory: true })) { appointmentResults.push(result) }
    const appointmentCid = appointmentResults[appointmentResults.length - 1].cid.toString();

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    const updateReceipt = await updateTX.wait();
    const updateGasDetails = await txChecker(updateReceipt);

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    const outpatientReceipt = await outpatientTX.wait();
    const outpatientGasDetails = await txChecker(outpatientReceipt);

    const totalGasUsed = updateReceipt.gasUsed.add(outpatientReceipt.gasUsed)
    const totalGasFee = totalGasUsed.mul(await provider.getGasPrice());
    const totalGasFeeSepolia = totalGasUsed.mul(9346783);
    const totalGasUsedInUnits = totalGasUsed.toString();
    const totalGasFeeInEther = ethers.utils.formatEther(totalGasFee);
    const totalGasFeeInSepolia = ethers.utils.formatEther(totalGasFeeSepolia);

    console.log("----------------------------------------");
    console.log("Pengisian RME Kehamilan oleh Dokter @ doctor.js")
    console.log("Update CID Tingkat Akun:", newDmrCid);
    console.log("Update CID Tingkat Profil:", emrCid);
    console.log("Update CID Tingkat Pengobatan:", appointmentCid);
    console.log("Gas Price Quorum:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Gas Price Sepolia: 0.000000000009346783");
    console.log("----------------------------------------");
    console.log("Update Patient Account Gas Used:", updateGasDetails.gasUsed);
    console.log("Update Patient Account Gas Fee (Wei):", updateGasDetails.gasFeeWei);
    console.log("Update Patient Account Gas Fee (Gwei):", updateGasDetails.gasFeeGwei);
    console.log("Update Patient Account Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Update Patient Account Gas Fee Sepolia (Wei):", updateGasDetails.gasFeeWeiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Gwei):", updateGasDetails.gasFeeGweiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Ether):", updateGasDetails.gasFeeEtherSepolia);
    console.log("Update Patient Account Block Number:", updateGasDetails.blockNumber);
    console.log("Update Patient Account Transaction Hash:", updateGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Outpatient Data Gas Used:", outpatientGasDetails.gasUsed);
    console.log("Add Outpatient Data Gas Fee (Wei):", outpatientGasDetails.gasFeeWei);
    console.log("Add Outpatient Data Gas Fee (Gwei):", outpatientGasDetails.gasFeeGwei);
    console.log("Add Outpatient Data Gas Fee (Ether):", outpatientGasDetails.gasFeeEther);
    console.log("Add Outpatient Data Gas Fee Sepolia (Wei):", outpatientGasDetails.gasFeeWeiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Gwei):", outpatientGasDetails.gasFeeGweiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Ether):", outpatientGasDetails.gasFeeEtherSepolia);
    console.log("Add Outpatient Data Block Number:", outpatientGasDetails.blockNumber);
    console.log("Add Outpatient Data Transaction Hash:", outpatientGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Total Gas Used:", totalGasUsedInUnits);
    console.log("Total Gas Fee (Ether):", totalGasFeeInEther);
    console.log("Total Gas Fee Sepolia (Ether):", totalGasFeeInSepolia);
    console.log("----------------------------------------");

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-tb", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.tb = { ...rest };
    matchedAppointment.status = "active"

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    const emrFiles = await prepareFilesForUpload(emrPath);
    const emrResults = [];
    for await (const result of client.addAll(emrFiles, { wrapWithDirectory: true })) { emrResults.push(result) }
    const emrCid = emrResults[emrResults.length - 1].cid.toString();
    const appointmentFiles = await prepareFilesForUpload(appointmentPath);
    const appointmentResults = [];
    for await (const result of client.addAll(appointmentFiles, { wrapWithDirectory: true })) { appointmentResults.push(result) }
    const appointmentCid = appointmentResults[appointmentResults.length - 1].cid.toString();

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    const updateReceipt = await updateTX.wait();
    const updateGasDetails = await txChecker(updateReceipt);

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    const outpatientReceipt = await outpatientTX.wait();
    const outpatientGasDetails = await txChecker(outpatientReceipt);

    const totalGasUsed = updateReceipt.gasUsed.add(outpatientReceipt.gasUsed)
    const totalGasFee = totalGasUsed.mul(await provider.getGasPrice());
    const totalGasFeeSepolia = totalGasUsed.mul(9346783);
    const totalGasUsedInUnits = totalGasUsed.toString();
    const totalGasFeeInEther = ethers.utils.formatEther(totalGasFee);
    const totalGasFeeInSepolia = ethers.utils.formatEther(totalGasFeeSepolia);

    console.log("----------------------------------------");
    console.log("Pengisian RME TB Paru oleh Dokter @ doctor.js")
    console.log("Update CID Tingkat Akun:", newDmrCid);
    console.log("Update CID Tingkat Profil:", emrCid);
    console.log("Update CID Tingkat Pengobatan:", appointmentCid);
    console.log("Gas Price Quorum:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Gas Price Sepolia: 0.000000000009346783");
    console.log("----------------------------------------");
    console.log("Update Patient Account Gas Used:", updateGasDetails.gasUsed);
    console.log("Update Patient Account Gas Fee (Wei):", updateGasDetails.gasFeeWei);
    console.log("Update Patient Account Gas Fee (Gwei):", updateGasDetails.gasFeeGwei);
    console.log("Update Patient Account Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Update Patient Account Gas Fee Sepolia (Wei):", updateGasDetails.gasFeeWeiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Gwei):", updateGasDetails.gasFeeGweiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Ether):", updateGasDetails.gasFeeEtherSepolia);
    console.log("Update Patient Account Block Number:", updateGasDetails.blockNumber);
    console.log("Update Patient Account Transaction Hash:", updateGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Outpatient Data Gas Used:", outpatientGasDetails.gasUsed);
    console.log("Add Outpatient Data Gas Fee (Wei):", outpatientGasDetails.gasFeeWei);
    console.log("Add Outpatient Data Gas Fee (Gwei):", outpatientGasDetails.gasFeeGwei);
    console.log("Add Outpatient Data Gas Fee (Ether):", outpatientGasDetails.gasFeeEther);
    console.log("Add Outpatient Data Gas Fee Sepolia (Wei):", outpatientGasDetails.gasFeeWeiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Gwei):", outpatientGasDetails.gasFeeGweiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Ether):", outpatientGasDetails.gasFeeEtherSepolia);
    console.log("Add Outpatient Data Block Number:", outpatientGasDetails.blockNumber);
    console.log("Add Outpatient Data Transaction Hash:", outpatientGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Total Gas Used:", totalGasUsedInUnits);
    console.log("Total Gas Fee (Ether):", totalGasFeeInEther);
    console.log("Total Gas Fee Sepolia (Ether):", totalGasFeeInSepolia);
    console.log("----------------------------------------");

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-lab", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber 
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.lab = { ...rest };
    matchedAppointment.status = "active"

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));
    await fetchAndSaveFiles(specificData.files, appointmentPath);

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    const emrFiles = await prepareFilesForUpload(emrPath);
    const emrResults = [];
    for await (const result of client.addAll(emrFiles, { wrapWithDirectory: true })) { emrResults.push(result) }
    const emrCid = emrResults[emrResults.length - 1].cid.toString();
    const appointmentFiles = await prepareFilesForUpload(appointmentPath);
    const appointmentResults = [];
    for await (const result of client.addAll(appointmentFiles, { wrapWithDirectory: true })) { appointmentResults.push(result) }
    const appointmentCid = appointmentResults[appointmentResults.length - 1].cid.toString();

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    const updateReceipt = await updateTX.wait();
    const updateGasDetails = await txChecker(updateReceipt);

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    const outpatientReceipt = await outpatientTX.wait();
    const outpatientGasDetails = await txChecker(outpatientReceipt);

    const totalGasUsed = updateReceipt.gasUsed.add(outpatientReceipt.gasUsed)
    const totalGasFee = totalGasUsed.mul(await provider.getGasPrice());
    const totalGasFeeSepolia = totalGasUsed.mul(9346783);
    const totalGasUsedInUnits = totalGasUsed.toString();
    const totalGasFeeInEther = ethers.utils.formatEther(totalGasFee);
    const totalGasFeeInSepolia = ethers.utils.formatEther(totalGasFeeSepolia);

    console.log("----------------------------------------");
    console.log("Pengisian RME Laboratorium oleh Dokter @ doctor.js")
    console.log("Update CID Tingkat Akun:", newDmrCid);
    console.log("Update CID Tingkat Profil:", emrCid);
    console.log("Update CID Tingkat Pengobatan:", appointmentCid);
    console.log("Gas Price Quorum:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Gas Price Sepolia: 0.000000000009346783");
    console.log("----------------------------------------");
    console.log("Update Patient Account Gas Used:", updateGasDetails.gasUsed);
    console.log("Update Patient Account Gas Fee (Wei):", updateGasDetails.gasFeeWei);
    console.log("Update Patient Account Gas Fee (Gwei):", updateGasDetails.gasFeeGwei);
    console.log("Update Patient Account Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Update Patient Account Gas Fee Sepolia (Wei):", updateGasDetails.gasFeeWeiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Gwei):", updateGasDetails.gasFeeGweiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Ether):", updateGasDetails.gasFeeEtherSepolia);
    console.log("Update Patient Account Block Number:", updateGasDetails.blockNumber);
    console.log("Update Patient Account Transaction Hash:", updateGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Outpatient Data Gas Used:", outpatientGasDetails.gasUsed);
    console.log("Add Outpatient Data Gas Fee (Wei):", outpatientGasDetails.gasFeeWei);
    console.log("Add Outpatient Data Gas Fee (Gwei):", outpatientGasDetails.gasFeeGwei);
    console.log("Add Outpatient Data Gas Fee (Ether):", outpatientGasDetails.gasFeeEther);
    console.log("Add Outpatient Data Gas Fee Sepolia (Wei):", outpatientGasDetails.gasFeeWeiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Gwei):", outpatientGasDetails.gasFeeGweiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Ether):", outpatientGasDetails.gasFeeEtherSepolia);
    console.log("Add Outpatient Data Block Number:", outpatientGasDetails.blockNumber);
    console.log("Add Outpatient Data Transaction Hash:", outpatientGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Total Gas Used:", totalGasUsedInUnits);
    console.log("Total Gas Fee (Ether):", totalGasFeeInEther);
    console.log("Total Gas Fee Sepolia (Ether):", totalGasFeeInSepolia);
    console.log("----------------------------------------");

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-selesai", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find(
      (account) => account.toLowerCase() === recoveredAddress.toLowerCase()
    );

    if (!accountAddress) {
      return res.status(400).json({ error: "Account not found" });
    }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const contractWithSigner = new ethers.Contract(
      patient_contract,
      patientABI,
      recoveredSigner
    );
    const outpatientContractWithSigner = new ethers.Contract(
      outpatient_contract,
      outpatientABI,
      recoveredSigner
    );

    const [dmrExists, dmrData] =
      await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists)
      return res.status(404).json({
        error: `DMR number ${commonData.dmrNumber} tidak ditemukan.`,
      });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map((appointmentInfo) => {
      return JSON.parse(appointmentInfo.appointments);
    });
    const matchedAppointment = appointmentDetails.find(
      (appointment) =>
        appointment.appointmentId === commonData.appointmentId &&
        appointment.emrNumber === commonData.emrNumber
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({
        error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.`,
      });
    }

    matchedAppointment.selesai = { ...rest };
    if (specificData.statusPulang === "1") {
      matchedAppointment.status = "done";
    } else if (specificData.statusPulang === "5") {
      matchedAppointment.status = "cancelled";
    } else {
      matchedAppointment.status = "done";
    }

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(
      path.join(appointmentPath, `J${commonData.appointmentId}.json`),
      JSON.stringify(matchedAppointment)
    );

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, {
      wrapWithDirectory: true,
    })) {
      allResults.push(result);
    }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    const emrFiles = await prepareFilesForUpload(emrPath);
    const emrResults = [];
    for await (const result of client.addAll(emrFiles, { wrapWithDirectory: true })) { emrResults.push(result) }
    const emrCid = emrResults[emrResults.length - 1].cid.toString();
    const appointmentFiles = await prepareFilesForUpload(appointmentPath);
    const appointmentResults = [];
    for await (const result of client.addAll(appointmentFiles, { wrapWithDirectory: true })) { appointmentResults.push(result) }
    const appointmentCid = appointmentResults[appointmentResults.length - 1].cid.toString();

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    const updateReceipt = await updateTX.wait();
    const updateGasDetails = await txChecker(updateReceipt);

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      commonData.nurseAddress,
      newDmrCid
    );
    const outpatientReceipt = await outpatientTX.wait();
    const outpatientGasDetails = await txChecker(outpatientReceipt);

    const totalGasUsed = updateReceipt.gasUsed.add(outpatientReceipt.gasUsed)
    const totalGasFee = totalGasUsed.mul(await provider.getGasPrice());
    const totalGasFeeSepolia = totalGasUsed.mul(9346783);
    const totalGasUsedInUnits = totalGasUsed.toString();
    const totalGasFeeInEther = ethers.utils.formatEther(totalGasFee);
    const totalGasFeeInSepolia = ethers.utils.formatEther(totalGasFeeSepolia);

    console.log("----------------------------------------");
    console.log("Pengisian RME Selesai oleh Dokter @ doctor.js")
    console.log("Update CID Tingkat Akun:", newDmrCid);
    console.log("Update CID Tingkat Profil:", emrCid);
    console.log("Update CID Tingkat Pengobatan:", appointmentCid);
    console.log("Gas Price Quorum:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Gas Price Sepolia: 0.000000000009346783");
    console.log("----------------------------------------");
    console.log("Update Patient Account Gas Used:", updateGasDetails.gasUsed);
    console.log("Update Patient Account Gas Fee (Wei):", updateGasDetails.gasFeeWei);
    console.log("Update Patient Account Gas Fee (Gwei):", updateGasDetails.gasFeeGwei);
    console.log("Update Patient Account Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Update Patient Account Gas Fee Sepolia (Wei):", updateGasDetails.gasFeeWeiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Gwei):", updateGasDetails.gasFeeGweiSepolia);
    console.log("Update Patient Account Gas Fee Sepolia (Ether):", updateGasDetails.gasFeeEtherSepolia);
    console.log("Update Patient Account Block Number:", updateGasDetails.blockNumber);
    console.log("Update Patient Account Transaction Hash:", updateGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Add Outpatient Data Gas Used:", outpatientGasDetails.gasUsed);
    console.log("Add Outpatient Data Gas Fee (Wei):", outpatientGasDetails.gasFeeWei);
    console.log("Add Outpatient Data Gas Fee (Gwei):", outpatientGasDetails.gasFeeGwei);
    console.log("Add Outpatient Data Gas Fee (Ether):", outpatientGasDetails.gasFeeEther);
    console.log("Add Outpatient Data Gas Fee Sepolia (Wei):", outpatientGasDetails.gasFeeWeiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Gwei):", outpatientGasDetails.gasFeeGweiSepolia);
    console.log("Add Outpatient Data Gas Fee Sepolia (Ether):", outpatientGasDetails.gasFeeEtherSepolia);
    console.log("Add Outpatient Data Block Number:", outpatientGasDetails.blockNumber);
    console.log("Add Outpatient Data Transaction Hash:", outpatientGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Total Gas Used:", totalGasUsedInUnits);
    console.log("Total Gas Fee (Ether):", totalGasFeeInEther);
    console.log("Total Gas Fee Sepolia (Ether):", totalGasFeeInSepolia);
    console.log("----------------------------------------");
    console.log("Outpatient Done✅");
    res.status(200).json({ message: "Outpatient Done✅" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

export default router;
