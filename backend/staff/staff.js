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
import { generatePatientDMR, generatePatientEMR } from "../patient/generatePatientCode.js";
import { formatDateTime, prepareFilesForUpload, generatePassword } from "../utils/utils.js";
import { retrieveDMRData  } from "../middleware/userData.js";
import { handleFileWrite } from "../user/appointment/appointment.js";
import { txChecker } from "../ganache/txChecker.js";

// Contract & ABI
import { USER_CONTRACT, PATIENT_CONTRACT, SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
import userABI from "../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import patientABI from "../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
import outpatientABI from "../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const patient_contract = PATIENT_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const userContract = new ethers.Contract(user_contract, userABI, provider);
const patientContract = new ethers.Contract(patient_contract, patientABI, provider);
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

// Add New Patient Account
router.post("/register/patient-account", authMiddleware, async (req, res) => {
  try {
    // const { username, nik, areaCode, password, confirmPassword } = req.body;
    const { areaCode, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto } = req.body;
    const password = generatePassword();
    const encryptedPassword = await bcrypt.hash(password, 10);
    // const { error } = schema.validate({ username, nik, password, confirmPassword });
    // if (error) return res.status(400).json({ error: error.details[0].message });

    const accountList = await provider.listAccounts();
    // const [nikExists, existingPatientData] = await patientContract.getPatientByNik(nomorIdentitas);
    // if (nikExists) {
    //   console.log({ existingPatientData });
    //   return res.status(400).json({ error: `NIK ${nomorIdentitas} sudah terdaftar.` });
    // }

    let selectedAccountAddress;
    for (let account of accountList) {
      const [exists, accountData] = await patientContract.getPatientByAddress(account);
      if (!exists) {
        selectedAccountAddress = account;
        break;
      }
    }
    if (!selectedAccountAddress) return res.status(400).json({ error: "Tidak ada akun tersedia untuk pendaftaran." });

    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);

    // generate nomor rekam medis
    const dmrNumber = await generatePatientDMR(areaCode);
    const emrNumber = await generatePatientEMR();
    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;

    // Membuat objek data akun pasien
    const dmrData = {
      accountAddress: selectedAccountAddress,
      accountPassword: encryptedPassword,
      accountRole: "patient",
      accountCreated: formattedDateTime,
      dmrNumber: dmrNumber,
    };

    // Membuat objek data profil pasien
    const patientData = { accountAddress: selectedAccountAddress, dmrNumber, emrNumber, faskesAsal: "Puskesmas Pejuang", namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto, isActive: true };

    // Prepare directory for IPFS upload
    const dmrPath = path.join(basePath, dmrFolderName);
    fs.mkdirSync(dmrPath, { recursive: true });
    fs.writeFileSync(path.join(dmrPath, `J${dmrNumber}.json`), JSON.stringify(dmrData));

    const emrPath = path.join(dmrPath, emrFolderName);
    fs.mkdirSync(emrPath);
    fs.writeFileSync(path.join(emrPath, `J${emrNumber}.json`), JSON.stringify(patientData));

    // Prepare files and directories for upload
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }

    const dmrCid = allResults[allResults.length - 1].cid.toString(); // Last item is the root directory
    const accountTX = await contractWithSigner.addPatientAccount( dmrNumber, dmrCid);
    await accountTX.wait();

    const accountReceipt = await accountTX.wait();
    const accountGasDetails = await txChecker(accountReceipt);

    console.log("Admin / Staff")
    console.log("Gas Price:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Add Patient Account Gas Used:", accountGasDetails.gasUsed);
    console.log("Add Patient Account Gas Fee (Wei):", accountGasDetails.gasFeeWei);
    console.log("Add Patient Account Gas Fee (Gwei):", accountGasDetails.gasFeeGwei);
    console.log("Add Patient Account Gas Fee (Ether):", accountGasDetails.gasFeeEther);
    console.log("Block Number:", accountGasDetails.blockNumber);
    console.log("Transaction Hash:", accountGasDetails.transactionHash);

    const responseData = {
      message: `Patient Registration Successful`,
      username: namaLengkap,
      nomorIdentitas: nomorIdentitas,
      dmrNumber,
      dmrCid,
      emrNumber,
      password,
      publicKey: selectedAccountAddress,
      privateKey,
    };
    console.log({ responseData });
    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

// Add New Patient Profile
router.post("/register/patient-profile", authMiddleware, async (req, res) => {
  try {
    const { accountAddress, dmrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, signature = null, foto } = req.body;
    // console.log({ accountAddress, dmrNumber, namaLengkap, nomorIdentitas });

    // const accountList = await provider.listAccounts();
    // const [nikExists, existingPatientData] = await patientContract.getPatientByNik(nomorIdentitas);
    // if (nikExists) {
    //   console.log({ existingPatientData });
    //   return res.status(400).json({ error: `NIK ${nomorIdentitas} sudah terdaftar.` });
    // }

    const privateKey = accounts[accountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);

    // Cek apakah DMR number terdaftar di smart contract
    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });
    const emrNumber = await generatePatientEMR();
    const patientData = { accountAddress:dmrData.accountAddress, dmrNumber, emrNumber, faskesAsal: "Puskesmas Pejuang", namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto, isActive: true };

    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    fs.mkdirSync(emrPath);
    fs.writeFileSync(path.join(emrPath, `J${emrNumber}.json`), JSON.stringify(patientData));

    // Update IPFS dengan file baru
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const dmrCid = allResults[allResults.length - 1].cid.toString();

    // Update informasi DMR di blockchain jika perlu
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      dmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    const responseData = {
      message: `Profile Registration Successful`,
      emrNumber,
      dmrNumber,
      dmrCid,
    };
    console.log({ responseData });
    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// Update Profile Patient by Staff
router.post("/update-profile", authMiddleware, async (req, res) => {
  try {
    const {
      dmrNumber, newDmrNumber, emrNumber, faskesAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
      negaraKerabat, signature, foto,
    } = req.body;

    // Validasi input menggunakan Joi
    // const { error } = patientSchema.validate({
    //   emrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
    //   golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
    //   kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
    //   tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
    //   rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
    //   negaraKerabat, userAccountData
    // });
    // if (error) { return res.status(400).json({ error: error.details[0].message }) }

    // Verifikasi tanda tangan
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        dmrNumber, newDmrNumber, emrNumber, faskesAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
        tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
        rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
        negaraKerabat
      }),
      signature
    );

    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const patientContractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const [dmrExists, dmrData] = await patientContractWithSigner.getPatientByDmrNumber(dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });

    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(dmrNumber, dmrCid);

    // profiles
    const accountProfiles = data.emrProfiles.map(profileInfo => {
      return JSON.parse(profileInfo.profile);
    });

    // Find matched profile with emrNumber
    const matchedProfile = accountProfiles.find(profile => profile.emrNumber === emrNumber);
    if (!matchedProfile) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${emrNumber} tidak ditemukan.` });
    }

    const updatedPatientData = {
      accountAddress: dmrData.accountAddress, dmrNumber: newDmrNumber, emrNumber, faskesAsal: "Puskesmas Pejuang", namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
      negaraKerabat, foto, isActive: matchedProfile.isActive
    }

    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    fs.mkdirSync(emrPath, { recursive: true });
    fs.writeFileSync(path.join(emrPath, `J${emrNumber}.json`), JSON.stringify(updatedPatientData));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    
    // Update DMR info on blockchain
    const updateTX = await patientContractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    res.status(200).json({ updatedPatientData });
  } catch (error) {
    console.error(error);
    const stackLines = error.stack.split("\n");
    console.log("Error pada file dan baris:", stackLines[1].trim());
    res.status(500).json({
      error: error.message,
      message: "Failed updating patient profile",
    });
  }
});

// Delete Profile Patient by Staff
router.post("/delete-profile", authMiddleware, async (req, res) => {
  try {
    // const { address } = req.auth;
    const { accountAddress, dmrNumber, emrNumber, faskesAsal, nomorIdentitas, namaLengkap, signature } = req.body;

    // Validasi input menggunakan Joi
    // const { error } = patientSchema.validate({
    //   emrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
    //   golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
    //   kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
    //   tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
    //   rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
    //   negaraKerabat, userAccountData
    // });
    // if (error) { return res.status(400).json({ error: error.details[0].message }) }

    // Verifikasi tanda tangan
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ accountAddress, dmrNumber, emrNumber, faskesAsal, nomorIdentitas, namaLengkap }), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const staffAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!staffAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== staffAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const patientContractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const [dmrExists, dmrData] = await patientContractWithSigner.getPatientByDmrNumber(dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });

    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(dmrNumber, dmrCid);

    // profiles
    const accountProfiles = data.emrProfiles.map(profileInfo => {
      return JSON.parse(profileInfo.profile);
    });

    // Find matched profile with emrNumber
    const matchedProfile = accountProfiles.find(profile => profile.emrNumber === emrNumber && profile.isActive === true);
    if (!matchedProfile) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${emrNumber} tidak ditemukan.` });
    }
    const updatedPatientData = { ...matchedProfile, isActive: false }

    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    fs.mkdirSync(emrPath, { recursive: true });
    fs.writeFileSync(path.join(emrPath, `J${emrNumber}.json`), JSON.stringify(updatedPatientData));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    
    // Update DMR info on blockchain
    const updateTX = await patientContractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    res.status(200).json({ updatedPatientData });
  } catch (error) {
    console.error(error);
    const stackLines = error.stack.split("\n");
    console.log("Error pada file dan baris:", stackLines[1].trim());
    res.status(500).json({
      error: error.message,
      message: "Failed updating patient profile",
    });
  }
});

export default router;
