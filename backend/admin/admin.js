import Joi from "joi";
import express from "express";
import bcrypt from "bcryptjs";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONTRACT_ADDRESS } from "../dotenvConfig.js";
import contractAbi from "../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import authMiddleware from "../middleware/auth-middleware.js";
import { CONN } from "../../enum-global.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountsPath = path.join(__dirname, "../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

const contractAddress = CONTRACT_ADDRESS.toString();
const client = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http",
});

// signin admin
import { adminData } from "../db/adminData.js";
import { generateToken } from "../middleware/auth.js";

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

// GET Dashboard (multiplequery, filter, sort)
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const role = req.query.role;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractAbi,
      provider
    );

    let accounts = [];
    if (role === "all") {
      accounts = await contract.getAllAccounts();
    } else {
      accounts = await contract.getAccountsByRole(role);
    }

    const data = accounts.map((account) => {
      return {
        address: account.accountAddress,
        username: account.username,
        email: account.email,
        phone: account.phone,
        role: account.role,
        createdAt: new Date(account.createdAt * 1000).toISOString(),
      };
    });
    console.log(data);
    res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Sign In
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (email !== adminData.email && password !== adminData.password) {
    return res.status(400).json({ error: "Invalid email or password" });
  }
  return res.status(200).json({ token: generateToken({ email }) });
});

// Add New Account
router.post("/new", async (req, res) => {
  try {
    const { role, username, email, phone, password, confirmPassword } =
      req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);

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

    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const accountList = await provider.listAccounts();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractAbi,
      provider
    );

    const emailRegistered = await contract.getAccountByEmail(email);
    if (emailRegistered.accountAddress !== ethers.constants.AddressZero) {
      return res.status(400).json({ error: `Email ${email} sudah terdaftar.` });
    }

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
    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

// Update Account
router.post("/update", async (req, res) => {
  try {
    const {
      address,
      username,
      email,
      phone,
      oldPass = null,
      newPass = null,
      confirmPass = null,
    } = req.body;

    const schema = Joi.object({
      username: Joi.string()
        .pattern(/^\S.*$/)
        .alphanum()
        .min(3)
        .max(50)
        .required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(new RegExp("^[0-9]{10,12}$")).required(),
      oldPass: Joi.string().required(),
      newPass: Joi.string()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"))
        .required(),
      confirmPass: Joi.string().valid(Joi.ref("newPass")).required(),
    });

    if (username && email && phone && oldPass && newPass && confirmPass) {
      const { error } = schema.validate({
        username,
        email,
        phone,
        oldPass,
        newPass,
        confirmPass,
      });

      if (error)
        return res.status(400).json({ error: error.details[0].message });
    }

    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractAbi,
      provider
    );

    const accountList = await provider.listAccounts();
    const accountAddress = accountList.find(
      (account) => account.toLowerCase() === address.toLowerCase()
    );
    if (!accountAddress) {
      return res.status(400).json({ error: "Account not found" });
    }
    let selectedAccountAddress;
    for (let account of accountList) {
      const accountByAddress = await contract.getAccountByAddress(account);
      if (accountByAddress.accountAddress === address) {
        selectedAccountAddress = account;
        break;
      }
    }

    if (!selectedAccountAddress) {
      return res.status(404).json({ error: "Akun tidak ditemukan." });
    }

    // koneksi smart contract dengan private key
    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(
      contractAddress,
      contractAbi,
      walletWithProvider
    );

    const getIpfs = await contractWithSigner.getAccountByAddress(
      accountAddress
    );
    const cidFromBlockchain = getIpfs.cid;

    // data awal yang ada di ipfs
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    // Update email, username, phone, password, and store new cid
    // const emailRegistered = await contractWithSigner.getAccountByEmail(email);
    // if (emailRegistered.accountAddress !== ethers.constants.AddressZero) {
    //   return res.status(400).json({ error: `Email ${email} sudah digunakan.` });
    // }

    let updatedData = {
      ...ipfsData,
      accountEmail: email,
      accountUsername: username,
      accountPhone: phone,
    };

    // update password
    if (confirmPass && newPass && oldPass) {
      let encryptedPassword;
      if (oldPass && newPass && confirmPass) {
        const isMatch = await bcrypt.compare(oldPass, ipfsData.accountPassword);
        if (!isMatch) {
          return res.status(400).json({ error: "Invalid old password" });
        }
        encryptedPassword = await bcrypt.hash(newPass, 10);
      }

      updatedData = {
        ...updatedData,
        accountPassword: encryptedPassword,
      };
    }

    const updatedResult = await client.add(JSON.stringify(updatedData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);

    // Update account details
    try {
      const tx = await contractWithSigner.updateUserAccount(
        getIpfs.email,
        username,
        email,
        phone,
        updatedCid
      );
      await tx.wait();

      // cek data baru di ipfs
      const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid}`;
      const newIpfsResponse = await fetch(newIpfsGatewayUrl);
      const newIpfsData = await newIpfsResponse.json();

      // cek data baru di blockchain
      const getUpdatedAccount = await contractWithSigner.getAccountByAddress(
        address
      );

      const responseData = {
        account: getUpdatedAccount,
        ipfsData: newIpfsData,
      };

      console.log({ responseData });
      res.status(200).json({ responseData });
    } catch (error) {
      let message = "Transaction failed for an unknown reason";
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        message = "New email is already in use";
      }
      res.status(400).json({ error: message });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

export default router;