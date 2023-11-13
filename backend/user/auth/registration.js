import Joi from "joi";
import express from "express";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import {
  API_KEY,
  API_KEY_SECRET,
  CONTRACT_ADDRESS,
  PRIVATE_KEY,
} from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };

const contractAddress = CONTRACT_ADDRESS.toString();

// Koneksi ke IPFS Infura
const authorization =
  "Basic " + Buffer.from(API_KEY + ":" + API_KEY_SECRET).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: authorization,
  },
});

const router = express.Router();
router.use(express.json());

// Membuat format validasi menggunakan Joi
const schema = Joi.object({
  username: Joi.string()
    .pattern(/^\S.*$/)
    .alphanum()
    .min(3)
    .max(50)
    .messages({
      "string.pattern.base": "Nama Penguna tidak boleh diawali dengan spasi.",
      "string.alphanum": "Nama pengguna hanya dapat berisi huruf dan angka.",
      "string.min": "Nama pengguna harus memiliki setidaknya 3 karakter.",
      "string.max": "Nama pengguna tidak boleh lebih dari 50 karakter.",
    })
    .required(),
  email: Joi.string()
    .email()
    .messages({
      "string.email": "Format alamat email tidak valid.",
    })
    .required(),
  phone: Joi.string()
    .pattern(new RegExp("^[0-9]{10,12}$"))
    .messages({
      "string.pattern.base":
        "Nomor telepon harus berisi angka sepanjang 10-12 karakter",
    })
    .required(),
  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"))
    .messages({
      "string.pattern.base":
        "Password harus memiliki setidaknya 1 huruf kapital, 1 huruf kecil, dan 1 angka.",
    })
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

// Format Tanggal dan Waktu
function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}_${day}-${month}-${year}`;
}

const currentDateTime = new Date();
const formattedDateTime = formatDateTime(currentDateTime);

// GET Sign Up
router.get("/:role/signup", (req, res) => {
  const { role } = req.params;

  function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
  }

  const capitalizedRole = capitalize(role);

  res.status(200).json({ message: `${capitalizedRole} Sign Up Page✅` });
});

// POST Sign Up Account Patient & Doctor
router.post("/:role/signup", async (req, res) => {
  const { role } = req.params;
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

  try {
    const {
      accountAddress,
      username,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;

    // Enkripsi password menggunakan bcrypt.js
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Validasi input menggunakan Joi
    const { error } = schema.validate({
      username,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Mmebuat objek untuk akun pasien
    const newPatient = {
      accountAddress: accountAddress,
      accountUsername: username,
      accountEmail: email,
      accountPhone: phone,
      accountPassword: encryptedPassword,
      accountRole: role,
      accountCreated: formattedDateTime,
      accountProfiles: [],
    };

    // Menyimpan objek akun pasien ke IPFS
    const result = await client.add(JSON.stringify(newPatient));

    // Ambil CID dari hasil IPFS
    const cid = result.cid.toString();

    // Dedicated gateway Infura untuk mengakses data di IPFS
    const ipfsGatewayUrl = `https://dapp-emr.infura-ipfs.io/ipfs/${cid}`;

    // Fetch data dari IPFS
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();
    console.log(ipfsData);

    // Menambahkan CID ke Smart Contract
    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:7545/"
    );
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    const ipfsTX = await contract.addIpfs(cid);
    await ipfsTX.wait();
    const getIpfs = await contract.getIpfsByAddress(accountAddress);
    const ipfsHash = getIpfs.ipfsAddress;

    const accountTX = await contract.addPatientAccount(email, role, ipfsHash);
    await accountTX.wait();
    const getAccount = await contract.getPatientAccountByAddress(
      accountAddress
    );

    // Menyusun objek data yang ingin ditampilkan dalam response body
    const responseData = {
      message: `${capitalizedRole} Registration Successful`,
      patientAccount: {
        accountAddress: getAccount.accountAddress,
        email: getAccount.email,
        role: getAccount.role,
        ipfsHash: getAccount.ipfsHash,
      },
      ipfs: {
        ipfsAddress: ipfsHash,
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
      error: error,
      message: `${capitalizedRole} Registration Failed`,
    });
  }
});

export default router;
