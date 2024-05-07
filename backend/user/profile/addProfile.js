import fs from "fs";
import Joi from "joi";
import path from "path";
import express from "express";
import { ethers } from "ethers";
import { fileURLToPath } from "url";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import authMiddleware from "../../middleware/auth-middleware.js";
import { generatePatientDMR, generatePatientEMR } from "./generatePatientCode.js";

import { USER_CONTRACT } from "../../dotenvConfig.js";
import userABI from "../../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const router = express.Router();
router.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prepareFilesForUpload(dirPath, basePath = dirPath) {
  const files = [];
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (let item of items) {
    const itemPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      const subFiles = await prepareFilesForUpload(itemPath, basePath);
      files.push(...subFiles);
    } else {
      files.push({
        path: itemPath.replace(basePath, '').replace(/\\/g, "/").substring(1),
        content: fs.readFileSync(itemPath)
      });
    }
  }
  return files;
}


// Skema validasi Joi untuk data pasien
const patientSchema = Joi.object({
  rumahSakitAsal: Joi.string().required(),
  namaLengkap: Joi.string().required(),
  nomorIdentitas: Joi.string().required(),
  tempatLahir: Joi.string(),
  tanggalLahir: Joi.string(),
  namaIbu: Joi.string(),
  gender: Joi.string(),
  agama: Joi.string(),
  suku: Joi.string(),
  bahasa: Joi.string(),
  golonganDarah: Joi.string(),
  telpRumah: Joi.string(),
  telpSelular: Joi.string(),
  email: Joi.string().email(),
  pendidikan: Joi.string(),
  pekerjaan: Joi.string(),
  pernikahan: Joi.string(),
  alamat: Joi.string(),
  rt: Joi.string(),
  rw: Joi.string(),
  kelurahan: Joi.string(),
  kecamatan: Joi.string(),
  kota: Joi.string(),
  pos: Joi.string(),
  provinsi: Joi.string(),
  negara: Joi.string(),
  namaKerabat: Joi.string(),
  nomorIdentitasKerabat: Joi.string(),
  tanggalLahirKerabat: Joi.string(),
  genderKerabat: Joi.string(),
  telpKerabat: Joi.string(),
  hubunganKerabat: Joi.string(),
  alamatKerabat: Joi.string(),
  rtKerabat: Joi.string(),
  rwKerabat: Joi.string(),
  kelurahanKerabat: Joi.string(),
  kecamatanKerabat: Joi.string(),
  kotaKerabat: Joi.string(),
  posKerabat: Joi.string(),
  provinsiKerabat: Joi.string(),
  negaraKerabat: Joi.string(),
  patientAccountData: Joi.object(),
});

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
  telpRumah: Joi.string().required(),
  telpSelular: Joi.string().required(),
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

// Add Profile Patient
router.post("/patient/add-profile", authMiddleware, async (req, res) => {
  try {
    const {
      rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
      negaraKerabat, patientAccountData, role, signature, foto
    } = req.body;

    // Validasi input menggunakan Joi
    // const { error } = patientSchema.validate({
    //   rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
    //   golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
    //   kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
    //   tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
    //   rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
    //   negaraKerabat, patientAccountData,
    // });
    // if (error) { return res.status(400).json({ error: error.details[0].message }); }

    // Verifikasi tanda tangan
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
        tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
        rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
        negaraKerabat, patientAccountData, role,
      }),
      signature
    );

    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    // Membuat objek data pasien
    let nomorRekamMedis;
    let riwayatPengobatan = [];
    const patientData = {
      nomorRekamMedis, rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto, riwayatPengobatan
    };

    const accountData = {
      accountAddress: patientAccountData.account.accountAddress,
      accountUsername: patientAccountData.ipfs.data.accountUsername,
      accountEmail: patientAccountData.account.accountEmail,
      // ipfsAddress: patientAccountData.ipfs.ipfsAddress,
      // cid: patientAccountData.ipfs.cid,
      accountPhone: patientAccountData.ipfs.data.accountPhone,
      accountPassword: patientAccountData.ipfs.data.accountPassword,
      accountRole: patientAccountData.account.role,
      accountCreated: patientAccountData.ipfs.data.accountCreated,
      accountProfiles: [...(patientAccountData.ipfs.data.accountProfiles || [])],
    };

    const dmrData = {
      accountAddress: patientAccountData.account.accountAddress,
      accountUsername: patientAccountData.ipfs.data.accountUsername,
      accountEmail: patientAccountData.account.accountEmail,
      accountPhone: patientAccountData.ipfs.data.accountPhone,
      accountPassword: patientAccountData.ipfs.data.accountPassword,
      accountRole: patientAccountData.account.role,
      accountCreated: patientAccountData.ipfs.data.accountCreated,
    }

    // Cek apakah sudah ada profil dengan nomorIdentitas yang sama
    const contract = new ethers.Contract(user_contract, userABI, recoveredSigner);
    const existingProfile = accountData.accountProfiles.findIndex((profile) => profile.nomorIdentitas === patientData.nomorIdentitas);

    const emrNumber = await generatePatientEMR();
    if (existingProfile !== -1) {
      console.log(`Profile with ${nomorIdentitas} already exists`);
      return res.status(400).json({ error: "Nomor Identitas telah digunakan" });
    } else {
      patientData.nomorRekamMedis = emrNumber;
      console.log("emrNumber:", patientData.nomorRekamMedis);
      accountData.accountProfiles.push(patientData);
    }

    // Prepare directory for IPFS upload
    const dmrNumber = await generatePatientDMR(rumahSakitAsal);
    console.log({dmrNumber})
    const dmrPath = path.join(__dirname, dmrNumber);
    fs.mkdirSync(dmrPath, { recursive: true });
    fs.writeFileSync(path.join(dmrPath, "account.json"), JSON.stringify(dmrData));

    const emrPath = path.join(dmrPath, emrNumber);
    fs.mkdirSync(emrPath);
    fs.writeFileSync(path.join(emrPath, "profile.json"), JSON.stringify(patientData));

    // Prepare files and directories for upload
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const dmrCid = allResults[allResults.length - 1].cid.toString(); // Last item is the root directory
    console.log({ dmrCid });
    
    // NOTES:
    // direktori DMR berhasil diupload ke IPFS dengan sempurna secara hirarkis
    // belum melakukan penyimpanan CID DMR ke blockchain







    
    // Menyimpan data pasien ke IPFS
    // const result = await client.add(JSON.stringify(accountData));
    // const cid = result.cid.toString();

    // Fetch data dari Dedicated Gateway IPFS Infura untuk mengakses data di IPFS
    // const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    // const response = await fetch(ipfsGatewayUrl);
    // const ipfsData = await response.json();

    // Koneksi ke Smart Contract
    // const tx = await contract.updateUserAccount(
    //   patientAccountData.account.accountEmail,
    //   patientAccountData.ipfs.data.accountUsername,
    //   patientAccountData.account.accountEmail,
    //   patientAccountData.ipfs.data.accountPhone,
    //   cid
    // );
    // await tx.wait();
    // const patient = await contract.addPatient(
    //   patientAccountData.account.accountAddress,
    //   patientData.nomorRekamMedis,
    //   patientData.nomorIdentitas
    // );
    // await patient.wait();

    // const getAccount = await contract.getAccountByAddress(accountAddress);
    // const responseData = { message: `Patient Profile added successfully`, account: getAccount, ipfs: ipfsData };
    const responseData = {
      message: `${role} Registration Successful`,
      dmrNumber,
      dmrCid,
    };
    console.log({responseData});
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, message: "Patient registration failed" });
  }
});

// Add Profile Doctor/Nurse/Staff
router.post("/:role/add-profile", authMiddleware, async (req, res) => {
  try {
    const {
      rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, userAccountData, role, signature, foto
    } = req.body;

    // Validasi input menggunakan Joi
    const { error } = userSchema.validate({
      rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, userAccountData,
    });
    if (error) { return res.status(400).json({ error: error.details[0].message }); }

    // Verifikasi tanda tangan
    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
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
      nomorRekamMedis, rumahSakitAsal, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
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
