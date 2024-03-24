import fs from "fs";
import Joi from "joi";
import path from "path";
import express from "express";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";

// Contract & ABI
import { USER_CONTRACT } from "../../dotenvConfig.js";
import userABI from "../../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
const userContract = USER_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const contract = new ethers.Contract(userContract, userABI, provider);

// IPFS
const client = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http",
});

// Dapatkan __dirname yang setara
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountsPath = path.join(__dirname, "../../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

const router = express.Router();
router.use(express.json());

const schema = Joi.object({
  username: Joi.string().pattern(/^\S.*$/).alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(new RegExp("^[0-9]{10,12}$")).required(),
  password: Joi.string().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$")).required(),
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
    const { username, email, phone, password, confirmPassword } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    const { error } = schema.validate({ username, email, phone, password, confirmPassword });
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Cek akun
    const accountList = await provider.listAccounts();
    const emailRegistered = await contract.getAccountByEmail(email);
    if (emailRegistered.accountAddress !== ethers.constants.AddressZero) return res.status(400).json({ error: `Email ${email} sudah terdaftar.` });

    // Iterasi pada daftar akun untuk menemukan yang belum terdaftar
    let selectedAccountAddress;
    for (let account of accountList) {
      const accountByAddress = await contract.getAccountByAddress(account);
      if (accountByAddress.accountAddress === ethers.constants.AddressZero) {
        selectedAccountAddress = account;
        break;
      }
    }

    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(userContract, userABI, walletWithProvider);

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

    const accountTX = await contractWithSigner.addUserAccount( username, email, role, phone, cid);
    await accountTX.wait();
    const getAccount = await contractWithSigner.getAccountByAddress(selectedAccountAddress);

    // Menyusun objek data yang ingin ditampilkan dalam response body
    const responseData = {
      message: `${role} Registration Successful`,
      email: email,
      publicKey: selectedAccountAddress,
      privateKey: privateKey,
      account: {
        accountAddress: getAccount.accountAddress,
        email: getAccount.email,
        role: getAccount.role,
        cid: getAccount.cid,
        isActive: getAccount.isActive,
      },
      ipfs: { cid: cid, data: ipfsData },
    };
    // console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: `${role} Registration Failed` });
  }
});

export default router;
