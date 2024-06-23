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
import { txChecker } from "../ganache/txChecker.js";

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
  username: Joi.string().min(3).max(50).required(),
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
    res.status(200).json({ token: generateToken({ address: accountAddress, username }), accountAddress });
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
    let privateKey;
    let wallet;

    if (role === 'admin') {
      selectedAccountAddress = CONN.ADMIN_PUBLIC_KEY;
      privateKey = CONN.ADMIN_PRIVATE_KEY;
      wallet = new Wallet(privateKey);
    } else {
      const accountList = await provider.listAccounts();
      for (let account of accountList) {
        const accountByAddress = await userContract.getAccountByAddress(account);
        if (accountByAddress.accountAddress === ethers.constants.AddressZero) {
          selectedAccountAddress = account;
          privateKey = accounts[selectedAccountAddress];
          wallet = new Wallet(privateKey);
          break;
        }
      }
      if (!selectedAccountAddress) {
        return res.status(400).json({ error: "Tidak ada akun tersedia untuk pendaftaran." });
      }
    }

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

    const scheduleTX = await contractWithSigner.addDoctorSchedule(cid);
    const scheduleReceipt = await scheduleTX.wait();
    const scheduleGasDetails = await txChecker(scheduleReceipt);

    console.log("Gas Price:", ethers.utils.formatEther(await provider.getGasPrice()));
    console.log("Add Doctor Schedule Gas Used:", scheduleGasDetails.gasUsed);
    console.log("Add Doctor Schedule Gas Fee (Wei):", scheduleGasDetails.gasFeeWei);
    console.log("Add Doctor Schedule Gas Fee (Gwei):", scheduleGasDetails.gasFeeGwei);
    console.log("Add Doctor Schedule Gas Fee (Ether):", scheduleGasDetails.gasFeeEther);
    console.log("Add Doctor Schedule Block Number:", scheduleGasDetails.blockNumber);
    console.log("Add Doctor Schedule Transaction Hash:", scheduleGasDetails.transactionHash);
    console.log({ cid });
    res.json({ cid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// get patient profile list
router.get("/patient-list", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const tempAppointments = await outpatientContract.getTemporaryPatientData(address);
    const uniquePatientProfilesMap = new Map();
    let patientAccountData = [];

    for (const appointment of tempAppointments) {
      const patientData = await userContract.getAccountByAddress(appointment.patientAddress);
      const cid = patientData.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const response = await fetch(ipfsGatewayUrl);
      const accountData = await response.json();
      const { accountProfiles, ...rest } = accountData;
      if (accountProfiles) patientAccountData.push(rest);

      if (accountData.hasOwnProperty("accountProfiles") && Array.isArray(accountProfiles) && accountProfiles.length) {
        for (const profile of accountData.accountProfiles) {
          if (profile.emrNumber === appointment.emrNumber && !uniquePatientProfilesMap.has(profile.emrNumber)) {
            uniquePatientProfilesMap.set(profile.emrNumber, { ...profile, accountAddress: accountData.accountAddress });
            if (!patientAccountData.some(account => account.accountAddress === accountData.accountAddress)) {
              patientAccountData.push(rest);
            }
          }
        }
      }
    }
    const patientProfiles = Array.from(uniquePatientProfilesMap?.values()) || [];
    res.status(200).json({ patientAccountData, patientProfiles });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const { accountAddress, emrNumber } = req.body;
    if (!address) return res.status(401).json({ message: "Unauthorized" });

    const account = await userContract.getAccountByAddress(accountAddress);
    if (!account) return res.status(404).json({ error: "Pasien tidak ditemukan", message: "Alamat pasien tidak ditemukan." });

    let foundProfile = false;
    let foundPatientProfile;
    const accountCid = account.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${accountCid}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    if (ipfsData.accountProfiles) {
      for (const profile of ipfsData.accountProfiles) {
        if (profile.emrNumber === emrNumber) {
          foundProfile = true;
          foundPatientProfile = profile;
          break;
        }
      }
    }
    if (!foundProfile) return res.status(404).json({ error: "Profil pasien tidak ditemukan", message: "Nomor rekam medis pasien tidak ditemukan." });

    const appointments = await outpatientContract.getAppointmentsByPatient(accountAddress);
    let patientAppointments = [];
    for (const appointment of appointments) {
      const cid = appointment.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      const ipfsData = await ipfsResponse.json();
      if (ipfsData.emrNumber === emrNumber && ipfsData.doctorAddress === address) patientAppointments.push(ipfsData);
    }
    res.status(200).json({ foundPatientProfile, patientAppointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    if (!address) return res.status(401).json({ message: "Unauthorized" });
    const { ...formattedEMR } = req.body;
    const { signature, ...rest } = formattedEMR;

    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ ...rest }), signature);
    const accounts = await provider.listAccounts();
    const doctorAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!doctorAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== doctorAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const getIpfs = await userContract.getAccountByAddress(formattedEMR.accountAddress);
    const cidFromBlockchain = getIpfs.cid;
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    // Finding the patient profile
    const patientProfileIndex = ipfsData.accountProfiles.findIndex(profile => profile.emrNumber === formattedEMR.emrNumber);
    if (patientProfileIndex === -1) return res.status(404).json({ message: "Patient profile not found" });

    // Checking for existing EMR entry
    const profileData = ipfsData.accountProfiles[patientProfileIndex];
    const emrIndex = profileData.riwayatPengobatan.findIndex(emr => emr.appointmentId === formattedEMR.appointmentId);
    const emrExists = emrIndex !== -1;
    const isDoctorTrue = emrExists && profileData.riwayatPengobatan[emrIndex].isDokter === true;

    // Push new EMR entry
    if (emrExists && isDoctorTrue) {
      return res.status(409).json({ message: "EMR sudah pernah diisi" });
    } else if (emrExists) {
      profileData.riwayatPengobatan[emrIndex] = { ...profileData.riwayatPengobatan[emrIndex], ...rest };
    } else {
      const lastEmr = profileData.riwayatPengobatan.reduce((prev, current) => (prev.id > current.id) ? prev : current, { id: 0 });
      const newId = lastEmr.id + 1;
      profileData.riwayatPengobatan.push({ id: newId, ...rest });
    };

    const updatedResult = await client.add(JSON.stringify(ipfsData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);
    console.log({ updatedCid });

    const patientAddress = accounts.find((account) => account.toLowerCase() === formattedEMR.accountAddress.toLowerCase());
    if (!patientAddress) return res.status(400).json({ error: "Account not found" });
    let selectedAccountAddress;
    for (let account of accounts) {
      const accountByAddress = await userContract.getAccountByAddress(account);
      if (accountByAddress.accountAddress === patientAddress) {
        selectedAccountAddress = account;
        break;
      }
    }
    
    if (!selectedAccountAddress) return res.status(400).json({ error: "Tidak ada akun tersedia untuk pendaftaran." });
    const privateKey = accountsPrivate[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(user_contract, userABI, walletWithProvider);

    // push data emr ke blockchain
    const tx = await contractWithSigner.updateUserAccount(
      ipfsData.accountEmail,
      ipfsData.accountUsername,
      ipfsData.accountEmail,
      ipfsData.accountPhone,
      updatedCid
    );
    await tx.wait();

    // update status appointment to done if emr is filled
    const appointments = await outpatientContract.getAppointmentsByPatient(formattedEMR.accountAddress);
    for (const appointment of appointments) {
      const cid = appointment.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      const ipfsData = await ipfsResponse.json();

      if (ipfsData.appointmentId === formattedEMR.appointmentId && ipfsData.emrNumber === formattedEMR.emrNumber && ipfsData.status === "ongoing") {
        ipfsData.status = "done";
        const updatedCid = await client.add(JSON.stringify(ipfsData));
        const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);
        // push updated status ke blockchain
        await contractWithSigner.updateOutpatientData(appointment.id, formattedEMR.accountAddress, ipfsData.doctorAddress, ipfsData.nurseAddress, updatedCid.path);

        if (formattedEMR.alamatStaf) {
          await contractWithSigner.removeTemporaryPatientData(formattedEMR.alamatStaf, formattedEMR.accountAddress, formattedEMR.emrNumber, {gasLimit: 1000000});
          console.log("Temporary patient data in staff from doctor removed successfully.");
        } 
        if (ipfsData.nurseAddress) {
          await contractWithSigner.removeTemporaryPatientData(ipfsData.nurseAddress, formattedEMR.accountAddress, formattedEMR.emrNumber, {gasLimit: 1000000});
          console.log("Temporary patient data in nurse from doctor removed successfully.");
        }
        if (ipfsData.doctorAddress) {
          await contractWithSigner.removeTemporaryPatientData(ipfsData.doctorAddress, formattedEMR.accountAddress, formattedEMR.emrNumber, {gasLimit: 1000000});
          console.log("Temporary patient data in doctor from doctor removed successfully.");
        }
        res.status(200).json({ message: "EMR saved", profile: profileData });
        return;
      }
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  };
});

router.post("/patient-list/patient-details/emr-anamnesis", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.anamnesis = { ...rest };

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    console.log(`anamnesis cid: ${newDmrCid}`);

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    await outpatientTX.wait();

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-diagnosis", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber 
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.diagnosis = { ...rest };

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    console.log(`diagnosis cid: ${newDmrCid}`);

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    await outpatientTX.wait();

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-kehamilan", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.kehamilan = { ...rest };

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    console.log(`kehamilan cid: ${newDmrCid}`);

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    await outpatientTX.wait();

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-tb", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.tb = { ...rest };

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    console.log(`tb cid: ${newDmrCid}`);

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    await outpatientTX.wait();

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-lab", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify(rest), signature);
    const recoveredSigner = provider.getSigner(recoveredAddress);
    const accounts = await provider.listAccounts();
    const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());

    if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, recoveredSigner);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, recoveredSigner);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${commonData.dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => { return JSON.parse(appointmentInfo.appointments) });
    const matchedAppointment = appointmentDetails.find(
      appointment => appointment.appointmentId === commonData.appointmentId &&
      appointment.emrNumber === commonData.emrNumber 
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.` });
    }

    matchedAppointment.lab = { ...rest };

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${commonData.appointmentId}.json`), JSON.stringify(matchedAppointment));
    await fetchAndSaveFiles(specificData.files, appointmentPath);

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) { allResults.push(result) }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    console.log(`lab cid: ${newDmrCid}`);

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      commonData.appointmentId,
      commonData.accountAddress,
      specificData.doctorAddress,
      specificData.nurseAddress,
      newDmrCid
    );
    await outpatientTX.wait();

    res.status(200).json({ message: "EMR saved" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details/emr-selesai", authMiddleware, async (req, res) => {
  try {
    const { commonData, specificData } = req.body;

    // Verifikasi tanda tangan
    const { signature, ...rest } = specificData;
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify(rest),
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

    const contractWithSigner = new ethers.Contract(
      patient_contract,
      patientABI,
      recoveredSigner
    );
    const outpatientContractWithSigner = new ethers.Contract(
      outpatient_contract,
      outpatientABI,
      recoveredSigner
    );

    const [dmrExists, dmrData] =
      await contractWithSigner.getPatientByDmrNumber(commonData.dmrNumber);
    if (!dmrExists)
      return res.status(404).json({
        error: `DMR number ${commonData.dmrNumber} tidak ditemukan.`,
      });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(commonData.dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map((appointmentInfo) => {
      return JSON.parse(appointmentInfo.appointments);
    });
    const matchedAppointment = appointmentDetails.find(
      (appointment) =>
        appointment.appointmentId === commonData.appointmentId &&
        appointment.emrNumber === commonData.emrNumber
      // appointment.status === "ongoing"
    );
    if (!matchedAppointment) {
      return res.status(404).json({
        error: `Profile with nomor rekam medis ${commonData.appointmentId} tidak ditemukan.`,
      });
    }

    matchedAppointment.selesai = { ...rest };
    if (specificData.statusPulang === "1") {
      matchedAppointment.status = "done";
    } else if (specificData.statusPulang === "5") {
      matchedAppointment.status = "cancelled";
    } else {
      matchedAppointment.status = "done";
    }

    const dmrFolderName = `${commonData.dmrNumber}J${commonData.dmrNumber}`;
    const emrFolderName = `${commonData.emrNumber}J${commonData.emrNumber}`;
    const appointmentFolderName = `${commonData.appointmentId}J${commonData.appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(
      path.join(appointmentPath, `J${commonData.appointmentId}.json`),
      JSON.stringify(matchedAppointment)
    );

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, {
      wrapWithDirectory: true,
    })) {
      allResults.push(result);
    }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();
    console.log(`selesai cid: ${newDmrCid}`);

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      commonData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // Update outpatient data on blockchain
    const outpatientTX =
      await outpatientContractWithSigner.updateOutpatientData(
        commonData.appointmentId,
        commonData.accountAddress,
        specificData.doctorAddress,
        commonData.nurseAddress,
        newDmrCid
      );
    await outpatientTX.wait();

    console.log("Outpatient Done✅");
    res.status(200).json({ message: "Outpatient Done✅" });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

export default router;
