import Joi from "joi";
import express from "express";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import { CONN } from "../../../enum-global.js";
import { generateToken } from "../../middleware/auth.js";
import { retrieveFolderData } from "../../middleware/userData.js";

// Contract & ABI
import { USER_CONTRACT, PATIENT_CONTRACT } from "../../dotenvConfig.js";
import userABI from "../../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import patientABI from "../../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
const userContract = USER_CONTRACT.toString();
const patient_contract = PATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const patientContract = new ethers.Contract(patient_contract, patientABI, provider);

const router = express.Router();
router.use(express.json());

// POST Sign In Account Patient
router.post("/patient/signin", async (req, res) => {
  const schema = Joi.object({ nik: Joi.string().max(16).required(), password: Joi.string().min(8).max(12).required() });

  try {
    const { nik, password, signature } = req.body;
    const { error } = schema.validate({ nik, password });
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Verifikasi tanda tangan
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ nik, password }), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) return res.status(400).json({ error: "Account not found" });
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) return res.status(400).json({ error: "Invalid signature" });

    // get account info by NIK
    const [exists, account] = await patientContract.getPatientByNik(nik);
    if (!exists) throw new Error("Account not found");
    const dmrCid = account.dmrCid;
    const dmrNumber = account.dmrNumber;
    const data = await retrieveFolderData(dmrNumber, dmrCid);

    // account
    const accountJsonString = data.accountData[`J${dmrNumber}.json`];
    const accountObj = JSON.parse(accountJsonString);
    const { accountNik, accountPassword, accountRole } = accountObj;

    // Cek password
    const validPassword = await bcrypt.compare(password, accountPassword);
    if (!validPassword) return res.status(400).json({ error: "Invalid password" });

    const token = generateToken({ address: accountAddress, nik: accountNik, dmrNumber: dmrNumber, role: accountRole });
    const responseData = {
      message: "Sign In Succesful",
      token: token,
      account: {
        accountAddress,
        accountNik,
        dmrNumber,
        accountRole,
      },
    };
    // console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: `Patient Sign In Failed` });
  }
});

// POST Sign In Other Roles Account
router.post("/:role/signin", async (req, res) => {
  const { role } = req.params;
  const schema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().min(8).required() });
  try {
    const { email, password, signature } = req.body;
    const { error } = schema.validate({ email, password });
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Verifikasi tanda tangan
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ email, password }), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) return res.status(400).json({ error: "Account not found" });
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) return res.status(400).json({ error: "Invalid signature" });

    // Pengecekan apakah email sudah terdaftar
    const contract = new ethers.Contract(userContract, userABI, recoveredSigner);
    const getAccountByEmail = await contract.getAccountByEmail(email);
    if (getAccountByEmail.accountAddress === ethers.constants.AddressZero) {
      return res.status(404).json({ error: `Account with email ${email} not found` });
    }

    // Fetch data dari IPFS Desktop
    const cid = getAccountByEmail.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();

    // Cek accountRole
    if (role !== ipfsData.accountRole) {
      if (role === "patient") {
        return res.status(400).json({ error: `Akun Pasien tersebut belum terdaftar.` });
      } else if (role === "doctor") {
        return res.status(400).json({ error: `Akun Dokter tersebut belum terdaftar.` }); 
      } else if (role === "nurse") {
        return res.status(400).json({ error: `Akun Perawat tersebut belum terdaftar.` });
      } else if (role === "staff") {
        return res.status(400).json({ error: "Akun Staf tersebut belum terdaftar." });
      }
    }

    // Cek password
    const validPassword = await bcrypt.compare(password, ipfsData.accountPassword);
    if (!validPassword) return res.status(400).json({ error: "Invalid password" });

    const token = generateToken({ address: ipfsData.accountAddress, email: ipfsData.accountEmail, role: ipfsData.accountRole });
    const responseData = {
      message: "Sign In Succesful",
      token: token,
      account: {
        accountAddress: ipfsData.accountAddress,
        email: ipfsData.accountEmail,
        role: ipfsData.accountRole,
        cid: getAccountByEmail.cid,
        isActive: getAccountByEmail.isActive,
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
