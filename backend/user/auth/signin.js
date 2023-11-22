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

const contractAddress = CONTRACT_ADDRESS.toString();

// Koneksi ke IPFS Infura
const authorization =
  "Basic " + Buffer.from(API_KEY + ":" + API_KEY_SECRET).toString("base64");

// const client = create({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
//   headers: {
//     authorization: authorization,
//   },
// });

const router = express.Router();
router.use(express.json());

// Membuat format validasi menggunakan Joi
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
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
router.post("/:role/signin", async (req, res) => {
  const { role } = req.params;

  try {
    const { email, password, signature } = req.body;

    // Enkripsi password menggunakan bcrypt.js
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Validasi input menggunakan Joi
    const { error } = schema.validate({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verifikasi tanda tangan
    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:7545/"
    );

    // const signer = provider.getSigner();
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        email,
        password,
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
    const getAccountByEmail = await contract.getUserAccountByEmail(email);
    if (getAccountByEmail.accountAddress === ethers.constants.AddressZero) {
      return res.status(404).json({
        error: `Account with email ${email} not found`,
      });
    }

    const getIpfs = await contract.getIpfsByAddress(accountAddress);
    const cid = getIpfs.cid;

    // Fetch data dari Dedicated Gateway IPFS Infura untuk mengakses data di IPFS
    const ipfsGatewayUrl = `https://dapp-emr.infura-ipfs.io/ipfs/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();

    const validPassword = await bcrypt.compare(
      password,
      ipfsData.accountPassword
    );
    if (!validPassword) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }

    // Menyusun objek data yang ingin ditampilkan dalam response body
    const responseData = {
      message: "Sign In Succesful",
      account: {
        accountAddress: ipfsData.accountAddress,
        email: ipfsData.accountEmail,
        role: ipfsData.accountRole,
      },
      ipfs: {
        ipfsAddress: getIpfs.ipfsAddress,
        cid: getIpfs.cid,
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
