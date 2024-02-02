/* eslint-disable prettier/prettier */
// Import dependencies
import Joi from "joi";
import express from "express";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { CONTRACT_ADDRESS } from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };

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

// Update Profile Patient
router.patch("/patient/update-profile", async (req, res) => {
  try {
    const {
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
        tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
        rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
        negaraKerabat, patientAccountData, role, signature
    } = req.body;

    // Validasi input menggunakan Joi
    const { error } = patientSchema.validate({
      namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
      golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
      kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
      tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
      rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
      negaraKerabat, patientAccountData
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verifikasi tanda tangan
    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:7545/"
    );

    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
        tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
        rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat,
        negaraKerabat, patientAccountData, role
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

    // Mengambil CID dari blockchain
    const getIpfs = await contract.getIpfsByAddress(accountAddress);
    const cidFromBlockchain = getIpfs.cid;

    // Mengambil data dari IPFS
    const ipfsGatewayUrl = `http://127.0.0.1:8080/ipfs/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    // Mencari dan memperbarui profil pasien dalam array accountProfiles
    const indexToUpdate = ipfsData.accountProfiles.findIndex(
      (profile) => profile.nomorIdentitas === nomorIdentitas
    );

    if (indexToUpdate !== -1) {
      ipfsData.accountProfiles[indexToUpdate] = {
        namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa,
        golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw,
        kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat,
        tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat,
        rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat,
      };
    } else {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Menyimpan data yang diperbarui ke IPFS
    const updatedResult = await client.add(JSON.stringify(ipfsData));
    const updatedCid = updatedResult.cid.toString();
    console.log({cidFromBlockchain});
    console.log({updatedCid});


    // Update CID di blockchain
    // const updateIpfsTX = await contract.updateIpfsAccount(accountAddress, updatedCid);
    // await updateIpfsTX.wait();

    // Update user account di blockchain (Jika perlu)
    // const updateUserAccountTX = await contract.updateUserAccount(...);
    // await updateUserAccountTX.wait();

    // Response
    res.status(200).json({
      message: "Patient profile updated successfully",
      ipfs: {
        newCid: updatedCid,
        size: updatedResult.size,
        data: ipfsData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
      message: "Failed updating patient profile",
    });
  }
});

export default router;