import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../enum-global.js";
import authMiddleware from "../middleware/auth-middleware.js";

// Contract & ABI
import { USER_CONTRACT, SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
import userABI from "../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
// import scheduleABI from "../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
import outpatientABI from "../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
// const schedule_contract = SCHEDULE_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

const userContract = new ethers.Contract( user_contract, userABI, provider);
// const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const accountsPath = path.join(__dirname, "../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accountsPrivate = JSON.parse(accountsJson);

const router = express.Router();
router.use(express.json());

// function formatDateTime(date) {
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   const hours = String(date.getHours()).padStart(2, "0");
//   const minutes = String(date.getMinutes()).padStart(2, "0");
//   const seconds = String(date.getSeconds()).padStart(2, "0");
//   return `${hours}:${minutes}:${seconds}_${day}-${month}-${year}`;
// }
// const currentDateTime = new Date();
// const formattedDateTime = formatDateTime(currentDateTime);

// get patient profile list
router.get("/patient-list", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const appointments = await outpatientContract.getAppointmentsByDoctor(address);
    const uniquePatientProfilesMap = new Map();
    let patientAccountData = [];

    for (const appointment of appointments) {
      const patientData = await userContract.getAccountByAddress(appointment.patientAddress);
      const cid = patientData.cid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const response = await fetch(ipfsGatewayUrl);
      const accountData = await response.json();
      const { accountProfiles, ...rest } = accountData;
      if (accountProfiles) patientAccountData.push(rest);

      if (accountData.hasOwnProperty("accountProfiles") && Array.isArray(accountProfiles) && accountProfiles.length) {
        for (const profile of accountData.accountProfiles) {
          if (profile.nomorRekamMedis === appointment.emrNumber && !uniquePatientProfilesMap.has(profile.nomorRekamMedis)) {
            uniquePatientProfilesMap.set(profile.nomorRekamMedis, { ...profile, accountAddress: accountData.accountAddress });
            if (!patientAccountData.some(account => account.accountAddress === accountData.accountAddress)) {
              patientAccountData.push(rest);
            }
          }
        }
      }
    }
    const patientProfiles = Array.from(uniquePatientProfilesMap.values());
    res.status(200).json({ patientAccountData, patientProfiles });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/patient-list/patient-details", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    const { accountAddress, nomorRekamMedis } = req.body;
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
        if (profile.nomorRekamMedis === nomorRekamMedis) {
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
      if (ipfsData.nomorRekamMedis === nomorRekamMedis && ipfsData.alamatDokter === address) patientAppointments.push(ipfsData);
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
    const patientProfileIndex = ipfsData.accountProfiles.findIndex(profile => profile.nomorRekamMedis === formattedEMR.nomorRekamMedis);
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

      if (ipfsData.appointmentId === formattedEMR.appointmentId && ipfsData.nomorRekamMedis === formattedEMR.nomorRekamMedis && ipfsData.status === "ongoing") {
        ipfsData.status = "done";
        const updatedCid = await client.add(JSON.stringify(ipfsData));
        const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);
        await contractWithSigner.updateOutpatientData(appointment.id, formattedEMR.accountAddress, ipfsData.alamatDokter, ipfsData.alamatPerawat, updatedCid.path);
        const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid.path}`;
        const newIpfsResponse = await fetch(newIpfsGatewayUrl);
        const newIpfsData = await newIpfsResponse.json();
        if (formattedEMR.alamatStaf) {
          try {
            const privateKey = accountsPrivate[formattedEMR.alamatStaf];
            const staffWallet = new Wallet(privateKey);
            const walletWithProvider = staffWallet.connect(provider);
            const contractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);
            await contractWithSigner.removeTemporaryPatientData(formattedEMR.alamatStaf, formattedEMR.nomorRekamMedis);
            console.log("Temporary patient data removed successfully.");
            res.status(200).json({ message: "EMR saved", profile: profileData, newStatus: newIpfsData.status });
          } catch (error) {
            console.error("Error removing temporary patient data:", error);
            res.status(500).json({ message: "Failed to remove temporary patient data" });
          }
        }
        res.status(200).json({ message: "EMR saved", profile: profileData });
        return;
      }
    }
    res.status(200).json({ message: "EMR saved", profile: profileData });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  };
});

export default router;
