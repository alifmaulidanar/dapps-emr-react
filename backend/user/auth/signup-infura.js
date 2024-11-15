import Joi from "joi";
import express from "express";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import {
  API_KEY,
  API_KEY_SECRET,
  CONTRACT_ADDRESS,
} from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import { CONN } from "../../../enum-global.js";

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
    .required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(new RegExp("^[0-9]{10,12}$")).required(),
  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"))
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

// POST Sign Up Account Patient & Doctor
router.post("/:role/signup", async (req, res) => {
  const { role } = req.params;

  try {
    const { username, email, phone, password, confirmPassword, signature } =
      req.body;

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

    // Verifikasi tanda tangan
    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

    // const signer = provider.getSigner();
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        username,
        email,
        phone,
        password,
        confirmPassword,
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

    // Pengecekan apakah email sudah terdaftar
    const getAccountByEmail = await contract.getAccountByEmail(email);
    if (getAccountByEmail.accountAddress !== ethers.constants.AddressZero) {
      return res.status(400).json({
        error: `Akun dengan email ${email} sudah terdaftar.`,
      });
    }

    // Pengecekan apakah address dari signature sudah terdaftar dengan email lain
    // const getAccountByAddress = await contract.getAccountByAddress(
    //   recoveredAddress
    // );
    // if (
    //   getAccountByAddress.accountAddress !== ethers.constants.AddressZero &&
    //   getAccountByAddress.email !== email
    // ) {
    //   return res.status(400).json({
    //     error: `Akun wallet MetaMask ini sudah terdaftar dengan email yang berbeda.`,
    //   });
    // }

    // Membuat objek untuk akun pasien
    const newAccount = {
      accountAddress,
      accountUsername: username,
      accountEmail: email,
      accountPhone: phone,
      accountPassword: encryptedPassword,
      accountRole: role,
      accountCreated: formattedDateTime,
      accountProfiles: [],
    };

    // Menyimpan objek akun pasien ke IPFS
    const result = await client.add(JSON.stringify(newAccount));
    const cid = result.cid.toString();

    // Fetch data dari Dedicated Gateway IPFS Infura untuk mengakses data di IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_INFURA}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();

    // Menambahkan CID dan detail akun ke Smart Contract
    const ipfsTX = await contract.addIpfsAccount(cid);
    await ipfsTX.wait();
    const getIpfs = await contract.getIpfsByAddress(accountAddress);

    const accountTX = await contract.addUserAccount(
      email,
      role,
      getIpfs.ipfsAddress
    );
    await accountTX.wait();
    const getAccount = await contract.getAccountByAddress(accountAddress);

    // Menyusun objek data yang ingin ditampilkan dalam response body
    const responseData = {
      message: `${role} Registration Successful`,
      account: {
        accountAddress: getAccount.accountAddress,
        email: getAccount.email,
        role: getAccount.role,
        ipfsHash: getAccount.ipfsHash,
      },
      ipfs: {
        ipfsAddress: getIpfs.ipfsAddress,
        cid: getIpfs.cid,
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
      message: `${role} Registration Failed`,
    });
  }
});

export default router;
