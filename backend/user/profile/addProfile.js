import fs from "fs";
import Joi from "joi";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import authMiddleware from "../../middleware/auth-middleware.js";
import { generatePatientEMR } from "../../patient/generatePatientCode.js";
import { getPatientProfiles } from "../../middleware/userData.js";
import { prepareFilesForUpload } from "../../utils/utils.js"

import { USER_CONTRACT, PATIENT_CONTRACT } from "../../dotenvConfig.js";
import userABI from "../../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import patientABI from "../../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
import { txChecker } from "../../ganache/txChecker.js";
const user_contract = USER_CONTRACT.toString();
const patient_contract = PATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const patientContract = new ethers.Contract(patient_contract, patientABI, provider);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const router = express.Router();
router.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../../patient/data");
const accountsPath = path.join(__dirname, "../../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

// Skema validasi Joi untuk data pasien
// const patientSchema = Joi.object({
//   rumahSakitAsal: Joi.string().required(),
//   namaLengkap: Joi.string().required(),
//   nomorIdentitas: Joi.string().required(),
//   tempatLahir: Joi.string(),
//   tanggalLahir: Joi.string(),
//   namaIbu: Joi.string(),
//   gender: Joi.string(),
//   agama: Joi.string(),
//   suku: Joi.string(),
//   bahasa: Joi.string(),
//   golonganDarah: Joi.string(),
//   nomorTelepon: Joi.string(),
//   email: Joi.string().email(),
//   pendidikan: Joi.string(),
//   pekerjaan: Joi.string(),
//   pernikahan: Joi.string(),
//   alamat: Joi.string(),
//   rt: Joi.string(),
//   rw: Joi.string(),
//   kelurahan: Joi.string(),
//   kecamatan: Joi.string(),
//   kota: Joi.string(),
//   pos: Joi.string(),
//   provinsi: Joi.string(),
//   negara: Joi.string(),
//   namaKerabat: Joi.string(),
//   nomorIdentitasKerabat: Joi.string(),
//   tanggalLahirKerabat: Joi.string(),
//   genderKerabat: Joi.string(),
//   telpKerabat: Joi.string(),
//   hubunganKerabat: Joi.string(),
//   alamatKerabat: Joi.string(),
//   rtKerabat: Joi.string(),
//   rwKerabat: Joi.string(),
//   kelurahanKerabat: Joi.string(),
//   kecamatanKerabat: Joi.string(),
//   kotaKerabat: Joi.string(),
//   posKerabat: Joi.string(),
//   provinsiKerabat: Joi.string(),
//   negaraKerabat: Joi.string(),
//   patientAccountData: Joi.object(),
// });

// Skema validasi Joi untuk data dokter
const userSchema = Joi.object({
  namaLengkap: Joi.string().required(),
  nomorIdentitas: Joi.string().required(),
  tempatLahir: Joi.string().required(),
  tanggalLahir: Joi.string().required(),
  namaIbu: Joi.string().required(),
  gender: Joi.string().required(),
  agama: Joi.string().required(),
  suku: Joi.string().required(),
  bahasa: Joi.string().required(),
  golonganDarah: Joi.string().required(),
  nomorTelepon: Joi.string().required(),
  email: Joi.string().email().required(),
  pendidikan: Joi.string().required(),
  pekerjaan: Joi.string().required(),
  pernikahan: Joi.string().required(),
  alamat: Joi.string().required(),
  rt: Joi.string().required(),
  rw: Joi.string().required(),
  kelurahan: Joi.string().required(),
  kecamatan: Joi.string().required(),
  kota: Joi.string().required(),
  pos: Joi.string().required(),
  provinsi: Joi.string().required(),
  negara: Joi.string().required(),
  userAccountData: Joi.object().required(),
});

// Add New Patient Profile
router.post("/patient/register-profile", async (req, res) => {
  try {
    const { accountAddress, dmrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, signature = null, foto } = req.body;

    const allPatients = await patientContract.getAllPatients();
    const existingPatientsData = [];
    for (const patient of allPatients) {
      const accountAddress = patient.accountAddress;
      const patientsData = await getPatientProfiles(accountAddress);
      existingPatientsData.push(patientsData);
    }

    // Iterasi melalui existingPatientsData
    for (const patientData of existingPatientsData) {
      // Iterasi melalui setiap profile dalam profiles
      for (const profile of patientData.profiles) {
        if (profile.nomorIdentitas === nomorIdentitas) {
          return res.status(400).json({ error: `NIK yang Anda masukkan sudah terdaftar.` });
        }
      }
    }

    const privateKey = accounts[accountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);

    // Cek apakah DMR number terdaftar di smart contract
    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });
    const emrNumber = await generatePatientEMR();
    const patientData = { accountAddress: dmrData.accountAddress, dmrNumber, emrNumber, faskesAsal: "Puskesmas Pejuang", namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto, isActive: true };

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
    const emrFiles = await prepareFilesForUpload(emrPath);
    const emrResults = [];
    for await (const result of client.addAll(emrFiles, { wrapWithDirectory: true })) { emrResults.push(result) }
    const emrCid = emrResults[emrResults.length - 1].cid.toString();

    // Update informasi DMR di blockchain jika perlu
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      dmrCid,
      dmrData.isActive
    );
    const updateReceipt = await updateTX.wait();
    const updateGasDetails = await txChecker(updateReceipt);

    console.log("----------------------------------------");
    console.log("Penambahan Profil Pasien oleh Pasien @ addProfile.js");
    console.log("CID Tingkat Akun:", dmrCid);
    console.log("CID Tingkat Profil:", emrCid);
    console.log("Gas Price Quorum:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Gas Price Sepolia: 0.000000000009346783");
    console.log("----------------------------------------");
    console.log("Add Patient Profile Gas Used:", updateGasDetails.gasUsed);
    console.log("Add Patient Profile Gas Fee (Wei):", updateGasDetails.gasFeeWei);
    console.log("Add Patient Profile Gas Fee (Gwei):", updateGasDetails.gasFeeGwei);
    console.log("Add Patient Profile Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Add Patient Profile Gas Fee Sepolia (Wei):", updateGasDetails.gasFeeWeiSepolia);
    console.log("Add Patient Profile Gas Fee Sepolia (Gwei):", updateGasDetails.gasFeeGweiSepolia);
    console.log("Add Patient Profile Gas Fee Sepolia (Ether):", updateGasDetails.gasFeeEtherSepolia);
    console.log("Block Number:", updateGasDetails.blockNumber);
    console.log("Transaction Hash:", updateGasDetails.transactionHash);
    console.log("----------------------------------------");
    console.log("Total Gas Used:", updateGasDetails.gasUsed);
    console.log("Total Gas Fee (Ether):", updateGasDetails.gasFeeEther);
    console.log("Total Gas Fee Sepolia (Ether):", updateGasDetails.gasFeeEtherSepolia);
    console.log("----------------------------------------");

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

// Add Profile Doctor/Nurse/Staff
router.post("/:role/add-profile", authMiddleware, async (req, res) => {
  try {
    const {
      rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, userAccountData, role, signature, foto
    } = req.body;

    // Validasi input menggunakan Joi
    const { error } = userSchema.validate({
      rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, userAccountData,
    });
    if (error) { return res.status(400).json({ error: error.details[0].message }); }

    // Verifikasi tanda tangan
    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, userAccountData
      }),
      signature
    );

    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) return res.status(400).json({ error: "Account not found" });
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) return res.status(400).json({ error: "Invalid signature" });

    // Membuat objek data
    const userData = {
      emrNumber, rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, nomorTelepon, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, foto
    };

    // Fisrt fetch IPFS data to retrieve accountProfiles array value
    // const earlyCid = userAccountData.ipfs.cid;
    // const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/ipfs/${earlyCid}`;
    // const earlyResponse = await fetch(ipfsGatewayUrl);
    // const earlyData = await earlyResponse.json();

    const accountData = {
      accountAddress: userAccountData.accountAddress,
      accountUsername: userAccountData.accountUsername,
      accountEmail: userAccountData.accountEmail,
      // ipfsAddress: userAccountData.ipfs.ipfsAddress,
      // cid: userAccountData.ipfs.cid,
      accountPhone: userAccountData.accountPhone,
      accountPassword: userAccountData.accountPassword,
      accountRole: userAccountData.accountRole,
      accountCreated: userAccountData.accountCreated,
      accountProfiles: [...(userAccountData.accountProfiles || [])],
    };

    accountData.accountProfiles.push(userData);
    const existingProfile = accountData.accountProfiles.findIndex((profile) => profile.nomorIdentitas === userData.nomorIdentitas);

    if (existingProfile !== -1) {
      console.log(`Profile with ${nomorIdentitas} already exists`);
      return res.status(400).json({ error: "Nomor Identitas telah digunakan" });
    } else {
      accountData.accountProfiles.push(userData);
    }

    // Menyimpan data pasien ke IPFS
    const result = await client.add(JSON.stringify(accountData));
    const cid = result.cid.toString();

    // Fetch data dari Dedicated Gateway IPFS Infura untuk mengakses data di IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();
    
    // Koneksi ke Smart Contract
    const contract = new ethers.Contract(user_contract, userABI, recoveredSigner);
    const tx = await contract.updateUserAccount(
      userAccountData.accountEmail,
      userAccountData.accountUsername,
      userAccountData.accountEmail,
      userAccountData.accountPhone,
      cid
    );
    await tx.wait();
    const getAccount = await contract.getAccountByAddress(accountAddress);

    const responseData = { message: `User Profile added successfully`, account: getAccount, ipfs: ipfsData };
    console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, message: "User registration failed" });
  }
});

export default router;
