import fs from "fs";
import Joi from "joi";
import path from "path";
import bcrypt from "bcryptjs";
import express from "express";
import { ethers } from "ethers";
import { fileURLToPath } from "url";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import { retrieveDMRData } from "../../middleware/userData.js";
import { prepareFilesForUpload } from "../../utils/utils.js";

// Contract & ABI
import { USER_CONTRACT, PATIENT_CONTRACT } from "../../dotenvConfig.js";
import userABI from "../../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import patientABI from "../../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
const contractAddress = USER_CONTRACT.toString();
const patientContractAddress = PATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../../patient/data");

const router = express.Router();
router.use(express.json());

// Update Patient Account
router.post("/patient/update", async (req, res) => {
  const { address, dmrNumber, oldPass, newPass, confirmPass, signature } = req.body;
  const schema = Joi.object({
    oldPass: Joi.string().required(),
    newPass: Joi.string().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$")).required(),
    confirmPass: Joi.string().valid(Joi.ref("newPass")).required(),
  });

  if (oldPass && newPass && confirmPass) {
    const { error } = schema.validate({ oldPass, newPass, confirmPass });
    if (error) return res.status(400).json({ error: error.details[0].message });
  }

  const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ dmrNumber, address, oldPass, newPass, confirmPass }), signature);
  const recoveredSigner = provider.getSigner(recoveredAddress);
  const accounts = await provider.listAccounts();
  const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

  if (!accountAddress) { return res.status(400).json({ error: "Account not found" }) }
  if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }) }

  const patientContractWithSigner = new ethers.Contract(patientContractAddress, patientABI, recoveredSigner);
  const [dmrExists, dmrData] = await patientContractWithSigner.getPatientByDmrNumber(dmrNumber);
  if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });
  const dmrCid = dmrData.dmrCid;
  const data = await retrieveDMRData(dmrNumber, dmrCid);

  // account
  const accountJsonString = data.accountData[`J${dmrNumber}.json`];
  const patientAccount = JSON.parse(accountJsonString);
  // Initialize updatedData with current patientAccount data
  let updatedData = { ...patientAccount };

  // Check and update password using bcrypt
  if (confirmPass && newPass && oldPass) {
    const isMatch = await bcrypt.compare(oldPass, patientAccount.accountPassword);
    if (!isMatch) return res.status(400).json({ error: "Invalid old password" });
    const encryptedPassword = await bcrypt.hash(newPass, 10);
    updatedData.accountPassword = encryptedPassword;
  }

  // Save updated patientAccount back to storage
  const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
  const dmrPath = path.join(basePath, dmrFolderName);
  fs.mkdirSync(dmrPath, { recursive: true });
  fs.writeFileSync(path.join(dmrPath, `J${dmrNumber}.json`), JSON.stringify(updatedData));

  // Update IPFS with new files
  const files = await prepareFilesForUpload(dmrPath);
  const allResults = [];
  for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
    allResults.push(result);
  }
  const newDmrCid = allResults[allResults.length - 1].cid.toString();
  
  // Update DMR info on blockchain if necessary
  const updateTX = await patientContractWithSigner.updatePatientAccount(
    dmrData.accountAddress,
    dmrNumber,
    newDmrCid,
    dmrData.isActive
  );
  await updateTX.wait();
  
  console.log({ newDmrCid, updatedData });
  res.status(200).json({ updatedData });
})

router.post("/:role/update", async (req, res) => {
  try {
    const { address, username, email, phone, oldPass, newPass, confirmPass, signature } = req.body;
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

    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ address, username, email, phone, oldPass, newPass, confirmPass }), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }) }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }) }

    const contract = new ethers.Contract(contractAddress, userABI, recoveredSigner);
    const getIpfs = await contract.getAccountByAddress(accountAddress);
    const cidFromBlockchain = getIpfs.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    // const emailRegistered = await contract.getAccountByEmail(email);
    // if (emailRegistered.accountAddress !== ethers.constants.AddressZero) {
    //   return res.status(400).json({ error: `Email ${email} sudah digunakan.` });
    // }

    let updatedData = { ...ipfsData, accountEmail: email, accountUsername: username, accountPhone: phone };

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
      const tx = await contract.updateUserAccount(getIpfs.email, username, email, phone, updatedCid);
      await tx.wait();

      // cek data baru di ipfs
      const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid}`;
      const newIpfsResponse = await fetch(newIpfsGatewayUrl);
      const newIpfsData = await newIpfsResponse.json();

      // cek data baru di blockchain
      const getUpdatedAccount = await contract.getAccountByAddress(address);
      const responseData = { account: getUpdatedAccount, ipfsData: newIpfsData };
      console.log({ responseData });
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

export default router;