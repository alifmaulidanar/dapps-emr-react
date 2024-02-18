/* eslint-disable prettier/prettier */
// Import dependencies
import Joi from "joi";
import express from "express";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { CONTRACT_ADDRESS } from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import { CONN } from "../../../enum-global.js";

const contractAddress = CONTRACT_ADDRESS.toString();
const client = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http",
});

const router = express.Router();
router.use(express.json());

// Skema validasi Joi untuk data pasien
const patientSchema = Joi.object({
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
  patientAccountData: Joi.object().required(),
});

// Skema validasi Joi untuk data dokter
const doctorSchema = Joi.object({
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
  doctorAccountData: Joi.object().required(),
});

// Add Profile Patient
router.post("/patient/add-profile", async (req, res) => {
  try {
    const {
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
      negaraKerabat, patientAccountData, role, signature, foto
    } = req.body;

    // Validasi input menggunakan Joi
    const { error } = patientSchema.validate({
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
      negaraKerabat, patientAccountData,
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verifikasi tanda tangan
    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
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
    const accountAddress = accounts.find(
      (account) => account.toLowerCase() === recoveredAddress.toLowerCase()
    );

    if (!accountAddress) {
      return res.status(400).json({ error: "Account not found" });
    }

    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Koneksi ke Smart Contract
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      recoveredSigner
    );

    // Membuat objek data pasien
    const patientData = {
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto
    };

    // const earlyCid = patientAccountData.ipfs.cid;

    // Fisrt fetch IPFS data to retrieve accountProfiles array value
    // const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/ipfs/${earlyCid}`;
    // const earlyResponse = await fetch(ipfsGatewayUrl);
    // const earlyData = await earlyResponse.json();

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
      accountProfiles: [
        ...(patientAccountData.ipfs.data.accountProfiles || []),
      ],
    };

    // Cek apakah sudah ada profil dengan nomorIdentitas yang sama
    const existingProfile = accountData.accountProfiles.findIndex(
      (profile) => profile.nomorIdentitas === patientData.nomorIdentitas
    );

    if (existingProfile !== -1) {
      console.log(`Profile with ${nomorIdentitas} already exists`);
    } else {
      accountData.accountProfiles.push(patientData);
    }

    // Menyimpan data pasien ke IPFS
    const result = await client.add(JSON.stringify(accountData));
    const cid = result.cid.toString();
    console.log({ cid });

    // Fetch data dari Dedicated Gateway IPFS Infura untuk mengakses data di IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();

    // Menambahkan CID dan detail akun ke Smart Contract
    const ipfsTX = await contract.addIpfsAccount(cid);
    await ipfsTX.wait();
    const getIpfs = await contract.getIpfsByAddress(accountAddress);

    const accountTX = await contract.addUserAccount(
      patientAccountData.account.accountEmail,
      patientAccountData.account.role,
      getIpfs.ipfsAddress
    );
    await accountTX.wait();
    const getAccount = await contract.getAccountByAddress(accountAddress);

    // Menyusun objek data yang ingin ditampilkan dalam response body
    const responseData = {
      message: `Patient Profile added successfully`,
      account: {
        accountAddress: getAccount.accountAddress,
        email: getAccount.email,
        role: getAccount.role,
        ipfsHash: getAccount.ipfsHash,
      },
      ipfs: {
        ipfsAddress: getIpfs.ipfsAddress,
        cid: cid,
        size: result.size,
        data: ipfsData,
      },
    };

    console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
      message: "Patient registration failed",
    });
  }
});

// Add Profile Doctor
router.post("/doctor/add-profile", async (req, res) => {
  try {
    const {
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, doctorAccountData, role, signature, foto
    } = req.body;

    // Validasi input menggunakan Joi
    const { error } = doctorSchema.validate({
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, doctorAccountData,
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verifikasi tanda tangan
    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, doctorAccountData
      }),
      signature
    );

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

    // Koneksi ke Smart Contract
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      recoveredSigner
    );

    // Membuat objek data pasien
    const doctorData = {
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, foto
    };

    // const earlyCid = doctorAccountData.ipfs.cid;

    // Fisrt fetch IPFS data to retrieve accountProfiles array value
    // const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/ipfs/${earlyCid}`;
    // const earlyResponse = await fetch(ipfsGatewayUrl);
    // const earlyData = await earlyResponse.json();

    const accountData = {
      accountAddress: doctorAccountData.accountAddress,
      accountUsername: doctorAccountData.accountUsername,
      accountEmail: doctorAccountData.accountEmail,
      // ipfsAddress: doctorAccountData.ipfs.ipfsAddress,
      // cid: doctorAccountData.ipfs.cid,
      accountPhone: doctorAccountData.accountPhone,
      accountRole: doctorAccountData.accountRole,
      accountProfiles: [
        ...(doctorAccountData.accountProfiles || []),
      ],
    };

    accountData.accountProfiles.push(doctorData);

    // Cek apakah sudah ada profil dengan nomorIdentitas yang sama
    // const existingProfile = accountData.accountProfiles.findIndex(
    //   (profile) => profile.nomorIdentitas === doctorData.nomorIdentitas
    // );

    // if (existingProfile !== -1) {
    //   console.log(`Profile with ${nomorIdentitas} already exists`);
    // } else {
    //   accountData.accountProfiles.push(doctorData);
    // }

    // Menyimpan data pasien ke IPFS
    const result = await client.add(JSON.stringify(accountData));
    const cid = result.cid.toString();
    console.log({ cid });

    // Fetch data dari Dedicated Gateway IPFS Infura untuk mengakses data di IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();

    // Menambahkan CID dan detail akun ke Smart Contract
    const ipfsTX = await contract.addIpfsAccount(cid);
    await ipfsTX.wait();
    const getIpfs = await contract.getIpfsByAddress(accountAddress);

    const accountTX = await contract.addUserAccount(
      doctorAccountData.accountEmail,
      doctorAccountData.accountRole,
      getIpfs.ipfsAddress
    );
    await accountTX.wait();
    const getAccount = await contract.getAccountByAddress(accountAddress);

    // Menyusun objek data yang ingin ditampilkan dalam response body
    const responseData = {
      message: `Doctor Profile added successfully`,
      account: {
        accountAddress: getAccount.accountAddress,
        email: getAccount.email,
        role: getAccount.role,
        ipfsHash: getAccount.ipfsHash,
      },
      ipfs: {
        ipfsAddress: getIpfs.ipfsAddress,
        cid: cid,
        size: result.size,
        data: ipfsData,
      },
    };

    console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
      message: "Doctor registration failed",
    });
  }
});

export default router;
