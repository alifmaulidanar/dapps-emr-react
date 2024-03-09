import Joi from "joi";
import express from "express";
import bcrypt from "bcryptjs";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONTRACT_ADDRESS } from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import { CONN } from "../../../enum-global.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Dapatkan __dirname yang setara
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountsPath = path.join(__dirname, "../../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

const contractAddress = CONTRACT_ADDRESS.toString();
const client = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http",
});

const router = express.Router();
router.use(express.json());

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
    // const recoveredAddress = ethers.utils.verifyMessage(
    //   JSON.stringify({
    //     username,
    //     email,
    //     phone,
    //     password,
    //     confirmPassword,
    //   }),
    //   signature
    // );

    // const recoveredSigner = provider.getSigner(recoveredAddress);
    const accountList = await provider.listAccounts();
    // const accountAddress = accounts.find(
    //   (account) => account.toLowerCase() === recoveredAddress.toLowerCase()
    // );

    // if (!accountAddress) {
    //   return res.status(400).json({ error: "Account not found" });
    // }

    // if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) {
    //   return res.status(400).json({ error: "Invalid signature" });
    // }

    // Koneksi ke Smart Contract
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );

    // Pengecekan apakah email sudah terdaftar
    // const getAccountByEmail = await contract.getAccountByEmail(email);
    // if (getAccountByEmail.accountAddress !== ethers.constants.AddressZero) {
    //   return res.status(400).json({
    //     error: `Akun dengan email ${email} sudah terdaftar.`,
    //   });
    // }

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

    // Cek email sudah terdaftar atau belum
    const emailRegistered = await contract.getAccountByEmail(email);
    if (emailRegistered.accountAddress !== ethers.constants.AddressZero) {
      return res.status(400).json({ error: `Email ${email} sudah terdaftar.` });
    }

    // Iterasi pada daftar akun untuk menemukan yang belum terdaftar
    let selectedAccountAddress;
    for (let account of accountList) {
      const accountByAddress = await contract.getAccountByAddress(account);
      if (accountByAddress.accountAddress === ethers.constants.AddressZero) {
        selectedAccountAddress = account;
        break;
      }
    }

    if (!selectedAccountAddress) {
      return res
        .status(400)
        .json({ error: "Tidak ada akun tersedia untuk pendaftaran." });
    }

    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(
      contractAddress,
      contractAbi,
      walletWithProvider
    );

    // Membuat objek untuk akun pasien
    const newAccount = {
      accountAddress: selectedAccountAddress,
      accountUsername: username,
      accountEmail: email,
      accountPhone: phone,
      accountPassword: encryptedPassword,
      accountRole: role,
      accountCreated: formattedDateTime,
      accountProfiles: [],
    };

    // add to ipfs
    const result = await client.add(JSON.stringify(newAccount));
    const cid = result.cid.toString();
    await client.pin.add(cid);

    // fetch dari ipfs
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();

    const accountTX = await contractWithSigner.addUserAccount(
      username,
      email,
      role,
      phone,
      cid
    );
    await accountTX.wait();
    const getAccount = await contractWithSigner.getAccountByAddress(
      selectedAccountAddress
    );

    const responseData = {
      message: `${role} Registration Successful`,
      role,
      username,
      email,
      phone,
      password,
      createdAt: getAccount.createdAt,
      publicKey: selectedAccountAddress,
      privateKey,
      cid,
      data: ipfsData,
    };

    console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    console.log(error);
    res.status(500).json({
      error: error,
      message: `${role} Registration Failed`,
    });
  }
});

export default router;
