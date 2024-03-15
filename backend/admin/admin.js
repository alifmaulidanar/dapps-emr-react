
import fs from "fs";
import Joi from "joi";
import path from "path";
import multer from "multer";
import express from "express";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../enum-global.js";
const upload = multer({ dest: "uploads/" });
import authMiddleware from "../middleware/auth-middleware.js";
import { generateToken } from "../middleware/auth.js";

// Contract & ABI
import { USER_CONTRACT, ADMIN_CONTRACT, SCHEDULE_CONTRACT } from "../dotenvConfig.js";
import adminABI from "../contractConfig/abi/AdminManagement.abi.json" assert { type: "json" };
import userABI from "../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import scheduleABI from "../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
const admin_contract = ADMIN_CONTRACT.toString();
const user_contract = USER_CONTRACT.toString();
const schedule_contract = SCHEDULE_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountsPath = path.join(__dirname, "../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

// user
const userContract = new ethers.Contract( user_contract, userABI, provider);
// schedule
const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
// IPFS
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

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

// Admin Sign In
router.post("/signin", async (req, res) => {
  try {
    const { username, password, signature } = req.body;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ username, password }), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) return res.status(400).json({ error: "Account not found" });
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) return res.status(400).json({ error: "Invalid signature" });

    // admin
    const adminContract = new ethers.Contract(admin_contract, adminABI, recoveredSigner);
    const getAccountByEmail = await adminContract.getAdminByAddress(accountAddress);
    if (getAccountByEmail.accountAddress === ethers.constants.AddressZero) {
      return res.status(404).json({ error: `Admin account with address ${getAccountByEmail.address} not found` });
    }
    const validPassword = await bcrypt.compare(password, getAccountByEmail.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid password" });
    res.status(200).json({ token: generateToken({ address: accountAddress, username }) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET Dashboard (multiplequery, filter, sort)
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const role = req.query.role;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    if (req.query.accounts === "true") {
      let accounts = [];
      if (role === "all") {
        accounts = await userContract.getAllActiveAccounts();
      } else {
        accounts = await userContract.getAccountsByRole(role);
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
      res.status(200).json({ data });
    } else if (req.query.schedules === "true") {
      const schedules = await scheduleContract.getLatestActiveDoctorSchedule();
      const scheduleCid = schedules.cid;
      res.status(200).json({ scheduleCid });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Add New Account
router.post("/new", async (req, res) => {
  try {
    const { role, username, email, phone, password, confirmPassword } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    const { error } = schema.validate({
      username,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (error) return res.status(400).json({ error: error.details[0].message });

    const accountList = await provider.listAccounts();
    const emailRegistered = await userContract.getAccountByEmail(email);
    if (emailRegistered.accountAddress !== ethers.constants.AddressZero) {
      return res.status(400).json({ error: `Email ${email} sudah terdaftar.` });
    }

    let selectedAccountAddress;
    for (let account of accountList) {
      const accountByAddress = await userContract.getAccountByAddress(account);
      if (accountByAddress.accountAddress === ethers.constants.AddressZero) {
        selectedAccountAddress = account;
        break;
      }
    }

    if (!selectedAccountAddress) return res.status(400).json({ error: "Tidak ada akun tersedia untuk pendaftaran." });

    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(
      user_contract,
      userABI,
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
    const getAccount = await contractWithSigner.getAccountByAddress(selectedAccountAddress);

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
      username: Joi.string().pattern(/^\S.*$/).alphanum().min(3).max(50).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(new RegExp("^[0-9]{10,12}$")).required(),
      oldPass: Joi.string().required(),
      newPass: Joi.string().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$")).required(),
      confirmPass: Joi.string().valid(Joi.ref("newPass")).required(),
    });

    if (username && email && phone && oldPass && newPass && confirmPass) {
      const { error } = schema.validate({ username, email, phone, oldPass, newPass, confirmPass });
      if (error) return res.status(400).json({ error: error.details[0].message });
    }

    const accountList = await provider.listAccounts();
    const accountAddress = accountList.find((account) => account.toLowerCase() === address.toLowerCase());

    if (!accountAddress) return res.status(400).json({ error: "Account not found" });

    let selectedAccountAddress;
    for (let account of accountList) {
      const accountByAddress = await userContract.getAccountByAddress(account);
      if (accountByAddress.accountAddress === address) {
        selectedAccountAddress = account;
        break;
      }
    }

    if (!selectedAccountAddress) return res.status(404).json({ error: "Akun tidak ditemukan." });

    // koneksi smart contract dengan private key
    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(
      user_contract,
      userABI,
      walletWithProvider
    );

    const getIpfs = await contractWithSigner.getAccountByAddress(accountAddress);
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
        if (!isMatch) return res.status(400).json({ error: "Invalid old password" });
        encryptedPassword = await bcrypt.hash(newPass, 10);
      }
      updatedData = { ...updatedData, accountPassword: encryptedPassword };
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
      const getUpdatedAccount = await contractWithSigner.getAccountByAddress(address);
      const responseData = { account: getUpdatedAccount, ipfsData: newIpfsData };
      res.status(200).json({ responseData });
    } catch (error) {
      let message = "Transaction failed for an unknown reason";
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") message = "New email is already in use";
      res.status(400).json({ error: message });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

// Delete Account
router.post("/delete", async (req, res) => {
  try {
    const { address, email } = req.body;
    const accountList = await provider.listAccounts();
    const accountAddress = accountList.find((account) => account.toLowerCase() === address.toLowerCase());

    if (!accountAddress) return res.status(400).json({ error: "Account not found" });

    let selectedAccountAddress;
    for (let account of accountList) {
      const accountByAddress = await userContract.getAccountByAddress(account);
      if (accountByAddress.accountAddress === address) {
        selectedAccountAddress = account;
        break;
      }
    }

    if (!selectedAccountAddress) return res.status(404).json({ error: "Akun tidak ditemukan." });

    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(
      user_contract,
      userABI,
      walletWithProvider
    );

    const deleteTx = await contractWithSigner.deactivateAccount();
    await deleteTx.wait();
    res.status(200).json({ address, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Add Doctor Schedule
router.post("/schedule", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const ipfsResponse = await client.add({ path: file.originalname, content: fs.createReadStream(file.path) });
    const cid = ipfsResponse.cid.toString();
    const privateKey = accounts["admin"];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(
      schedule_contract,
      scheduleABI,
      walletWithProvider
    );

    const tx = await contractWithSigner.addDoctorSchedule(cid);
    await tx.wait();
    console.log({ cid });
    res.json({ cid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
