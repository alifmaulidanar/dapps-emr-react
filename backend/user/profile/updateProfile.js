/* eslint-disable prettier/prettier */
import fs from "fs";
import Joi from "joi";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import authMiddleware from "../../middleware/auth-middleware.js";
import { prepareFilesForUpload } from "../../utils/utils.js";
import { retrieveDMRData } from "../../middleware/userData.js";

// Contract & ABI
import { USER_CONTRACT, PATIENT_CONTRACT } from "../../dotenvConfig.js";
import userABI from "../../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import patientABI from "../../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const patient_contract = PATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const router = express.Router();
router.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../../patient/data");

// Skema validasi Joi untuk data pasien
const patientSchema = Joi.object({
  emrNumber: Joi.string().required(),
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
  namaKerabat: Joi.string().required(),
  nomorIdentitasKerabat: Joi.string().required(),
  tanggalLahirKerabat: Joi.string().required(),
  genderKerabat: Joi.string().required(),
  telpKerabat: Joi.string().required(),
  hubunganKerabat: Joi.string().required(),
  alamatKerabat: Joi.string().required(),
  rtKerabat: Joi.string().required(),
  rwKerabat: Joi.string().required(),
  kelurahanKerabat: Joi.string().required(),
  kecamatanKerabat: Joi.string().required(),
  kotaKerabat: Joi.string().required(),
  posKerabat: Joi.string().required(),
  provinsiKerabat: Joi.string().required(),
  negaraKerabat: Joi.string().required(),
  userAccountData: Joi.object().required(),
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

// Update Profile Patient
router.post("/patient/update-profile", authMiddleware, async (req, res) => {
  try {
    const {
      dmrNumber, emrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
      negaraKerabat, signature, foto,
    } = req.body;

    // Validasi input menggunakan Joi
    // const { error } = patientSchema.validate({
    //   emrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
    //   golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
    //   kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
    //   tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
    //   rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
    //   negaraKerabat, userAccountData
    // });
    // if (error) { return res.status(400).json({ error: error.details[0].message }) }

    // Verifikasi tanda tangan
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        dmrNumber, emrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
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
      emrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
      negaraKerabat, foto
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

// Update Profile Doctor/Nurse/Staff
router.post("/:role/update-profile", authMiddleware, async (req, res) => {
  try {
    const {
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, userAccountData, role, signature, foto
    } = req.body;

    // Validasi input menggunakan Joi
    const { error } = userSchema.validate({
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, userAccountData
    });
    if (error) { return res.status(400).json({ error: error.details[0].message }) }

    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, userAccountData
      }),
      signature
    );

    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }) }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }) }

    // Mengambil CID dari blockchain
    const contract = new ethers.Contract(user_contract, userABI, recoveredSigner);
    const getIpfs = await contract.getAccountByAddress(accountAddress);
    const cidFromBlockchain = getIpfs.cid;

    // Mengambil data dari IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    // Mencari dan memperbarui profil pasien dalam array accountProfiles
    const indexToUpdate = ipfsData.accountProfiles.findIndex((profile) => profile.nomorIdentitas === nomorIdentitas);
    if (indexToUpdate !== -1) {
      ipfsData.accountProfiles[indexToUpdate] = {
        namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, foto
      };
    } else {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Menyimpan data yang diperbarui ke IPFS
    const updatedResult = await client.add(JSON.stringify(ipfsData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);

    // Fetch data dari IPFS Desktop untuk mengakses data baru di IPFS
    const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid}`;
    const newIpfsResponse = await fetch(newIpfsGatewayUrl);
    const newIpfsData = await newIpfsResponse.json();
    
    // Update user account di blockchain
    const tx = await contract.updateUserAccount(
      getIpfs.email,
      getIpfs.username,
      getIpfs.email,
      getIpfs.phone,
      updatedCid
    );
    await tx.wait();
    const getAccount = await contract.getAccountByAddress(accountAddress);
    const responseData = {
      message: `${userAccountData.accountRole.charAt(0).toUpperCase() + userAccountData.accountRole.slice(1)} Profile Updated`,
      account: getAccount,
      ipfs: newIpfsData,
    };
    res.status(200).json(responseData);
    console.log(responseData)
  } catch (error) {
    console.error(error);
    const stackLines = error.stack.split("\n");
    console.log("Error pada file dan baris:", stackLines[1].trim());
    res.status(500).json({ error: error.message, message: "Failed updating patient profile" });
  }
});

export default router;
