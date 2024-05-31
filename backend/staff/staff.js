import fs from "fs";
// import Joi from "joi";
import path from "path";
import express from "express";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { ethers, Wallet } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../enum-global.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { generatePatientDMR, generatePatientEMR } from "../patient/generatePatientCode.js";
import { formatDateTime, prepareFilesForUpload, generatePassword } from "../utils/utils.js";
import { retrieveDMRData  } from "../middleware/userData.js";
import { handleFileWrite } from "../user/appointment/appointment.js";

// Contract & ABI
import { USER_CONTRACT, PATIENT_CONTRACT, SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
import userABI from "../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import patientABI from "../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
// import scheduleABI from "../contractConfig/abi/ScheduleManagement.abi.json" assert { type: "json" };
import outpatientABI from "../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const patient_contract = PATIENT_CONTRACT.toString();
// const schedule_contract = SCHEDULE_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

const userContract = new ethers.Contract(user_contract, userABI, provider);
const patientContract = new ethers.Contract(patient_contract, patientABI, provider);
// const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
// const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../patient/data");
const accountsPath = path.join(__dirname, "../ganache/accounts.json");
const accountsJson = fs.readFileSync(accountsPath);
const accounts = JSON.parse(accountsJson);

const router = express.Router();
router.use(express.json());

// const schema = Joi.object({
//   username: Joi.string().min(3).max(50).required(),
//   nik: Joi.string().min(16).max(16).required(),
//   password: Joi.string().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$")).required(),
//   confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
// });

const currentDateTime = new Date();
const formattedDateTime = formatDateTime(currentDateTime);

// Add New Patient Account
router.post("/register/patient-account", authMiddleware, async (req, res) => {
  try {
    // const { username, nik, areaCode, password, confirmPassword } = req.body;
    const { areaCode, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto } = req.body;
    const password = generatePassword();
    const encryptedPassword = await bcrypt.hash(password, 10);
    // const { error } = schema.validate({ username, nik, password, confirmPassword });
    // if (error) return res.status(400).json({ error: error.details[0].message });

    const accountList = await provider.listAccounts();
    // const [nikExists, existingPatientData] = await patientContract.getPatientByNik(nomorIdentitas);
    // if (nikExists) {
    //   console.log({ existingPatientData });
    //   return res.status(400).json({ error: `NIK ${nomorIdentitas} sudah terdaftar.` });
    // }

    let selectedAccountAddress;
    for (let account of accountList) {
      const [exists, accountData] = await patientContract.getPatientByAddress(account);
      if (!exists) {
        selectedAccountAddress = account;
        break;
      }
    }
    if (!selectedAccountAddress) return res.status(400).json({ error: "Tidak ada akun tersedia untuk pendaftaran." });

    const privateKey = accounts[selectedAccountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);

    // generate nomor rekam medis
    const dmrNumber = await generatePatientDMR(areaCode);
    const emrNumber = await generatePatientEMR();
    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;

    // Membuat objek data akun pasien
    const dmrData = {
      accountAddress: selectedAccountAddress,
      accountPassword: encryptedPassword,
      accountRole: "patient",
      accountCreated: formattedDateTime,
      dmrNumber: dmrNumber,
    };

    // Membuat objek data profil pasien
    const patientData = { accountAddress: selectedAccountAddress, dmrNumber, emrNumber, faskesAsal: "Puskesmas Pejuang", namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto, isActive: true };

    // Prepare directory for IPFS upload
    const dmrPath = path.join(basePath, dmrFolderName);
    fs.mkdirSync(dmrPath, { recursive: true });
    fs.writeFileSync(path.join(dmrPath, `J${dmrNumber}.json`), JSON.stringify(dmrData));

    const emrPath = path.join(dmrPath, emrFolderName);
    fs.mkdirSync(emrPath);
    fs.writeFileSync(path.join(emrPath, `J${emrNumber}.json`), JSON.stringify(patientData));

    // Prepare files and directories for upload
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }

    const dmrCid = allResults[allResults.length - 1].cid.toString(); // Last item is the root directory
    const accountTX = await contractWithSigner.addPatientAccount( dmrNumber, dmrCid);
    await accountTX.wait();

    const responseData = {
      message: `Patient Registration Successful`,
      username: namaLengkap,
      nomorIdentitas: nomorIdentitas,
      dmrNumber,
      dmrCid,
      emrNumber,
      password,
      publicKey: selectedAccountAddress,
      privateKey,
    };
    console.log({ responseData });
    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

// Add New Patient Profile
router.post("/register/patient-profile", authMiddleware, async (req, res) => {
  try {
    const { accountAddress, dmrNumber, namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, signature = null, foto } = req.body;
    // console.log({ accountAddress, dmrNumber, namaLengkap, nomorIdentitas });

    // const accountList = await provider.listAccounts();
    // const [nikExists, existingPatientData] = await patientContract.getPatientByNik(nomorIdentitas);
    // if (nikExists) {
    //   console.log({ existingPatientData });
    //   return res.status(400).json({ error: `NIK ${nomorIdentitas} sudah terdaftar.` });
    // }

    const privateKey = accounts[accountAddress];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);

    // Cek apakah DMR number terdaftar di smart contract
    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });
    const emrNumber = await generatePatientEMR();
    const patientData = { accountAddress:dmrData.accountAddress, dmrNumber, emrNumber, faskesAsal: "Puskesmas Pejuang", namaLengkap, nomorIdentitas, tempatLahir, tanggalLahir, namaIbu, gender, agama, suku, bahasa, golonganDarah, telpRumah, telpSelular, email, pendidikan, pekerjaan, pernikahan, alamat, rt, rw, kelurahan, kecamatan, kota, pos, provinsi, negara, namaKerabat, nomorIdentitasKerabat, tanggalLahirKerabat, genderKerabat, telpKerabat, hubunganKerabat, alamatKerabat, rtKerabat, rwKerabat, kelurahanKerabat, kecamatanKerabat, kotaKerabat, posKerabat, provinsiKerabat, negaraKerabat, foto, isActive: true };

    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    fs.mkdirSync(emrPath);
    fs.writeFileSync(path.join(emrPath, `J${emrNumber}.json`), JSON.stringify(patientData));

    // Update IPFS dengan file baru
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const dmrCid = allResults[allResults.length - 1].cid.toString();

    // Update informasi DMR di blockchain jika perlu
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      dmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    const responseData = {
      message: `Profile Registration Successful`,
      emrNumber,
      dmrNumber,
      dmrCid,
    };
    console.log({ responseData });
    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// POST Patient Appointment
router.post("/appointment", authMiddleware, async (req, res) => {
  try {
    const { address } = req.auth;
    const { appointmentData, appointmentDataIpfs, signature } = req.body;
    if (!address) return res.status(401).json({ error: "Unauthorized" });
    if (!appointmentData || !appointmentDataIpfs) return res.status(400).json({ error: "Missing appointment data or IPFS data" });

    const privateKey = accounts[address];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(appointmentData.dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${appointmentData.dmrNumber} tidak ditemukan.` });

    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(appointmentData.dmrNumber, dmrCid);

    // profiles
    const accountProfiles = data.emrProfiles.map(profileInfo => {
      return JSON.parse(profileInfo.profile);
    });

    // Find matched profile with emrNumber
    const emrNumber = appointmentDataIpfs.emrNumber;
    const matchedProfile = accountProfiles.find(profile => profile.emrNumber === emrNumber);
    if (!matchedProfile) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${emrNumber} tidak ditemukan.` });
    }

    // hilangkan dash pada tanggal terpilih
    const selectedDate = appointmentDataIpfs.tanggalTerpilih;
    // buat const polyCode: untuk spesialisasi umum, polyCode = 1, untuk spesialisasi gigi, polyCode = 2
    // const polyCode = appointmentDataIpfs.spesialisasiDokter.toLowerCase() === "umum" ? "01" : "02";
    // generate appointmentId by using format "tanggalTerpilih-appointmentData.dmrNumber-polyCode"
    const specialization = appointmentDataIpfs.spesialisasiDokter.toLowerCase();
    // Nomor urut baru
    const newIndexString = handleFileWrite(specialization, selectedDate);
    const appointmentId = `${selectedDate.replace(/-/g, "")}${appointmentData.dmrNumber}${newIndexString}`;

    // susun patientAppointmentData
    const patientAppointmentData = {
      appointmentId,
      newIndexString,
      ...appointmentDataIpfs
    };

    const dmrFolderName = `${appointmentData.dmrNumber}J${appointmentData.dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;
    const appointmentFolderName = `${appointmentId}J${appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${appointmentId}.json`), JSON.stringify(patientAppointmentData));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();

    // Update DMR info on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      appointmentData.dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // referensi data outpatient ke doctor dan nurse terkait
    const outpatientTx = await outpatientContractWithSigner.addOutpatientData(
      appointmentData.accountAddress,
      appointmentData.doctorAddress,
      appointmentData.nurseAddress,
      appointmentId,
      appointmentDataIpfs.emrNumber,
      newDmrCid
    );
    await outpatientTx.wait();

    const addDoctorTemporary = await outpatientContractWithSigner.addTemporaryPatientData(appointmentData.doctorAddress, appointmentData.accountAddress, appointmentDataIpfs.emrNumber);
    await addDoctorTemporary.wait()
    // console.log("addDoctorTemporary successfully");
    const addNurseTemporary = await outpatientContractWithSigner.addTemporaryPatientData(appointmentData.nurseAddress, appointmentData.accountAddress, appointmentDataIpfs.emrNumber);
    await addNurseTemporary.wait()
    // console.log("addNurseTemporary successfully");
    // console.log({newIndexString, appointmentId, newDmrCid});
    res.status(200).json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Patient Appointment
router.post("/cancel-appointment", authMiddleware, async (req, res) => {
  try {
    const { address } = req.auth;
    const { dmrNumber, emrNumber, appointmentId, signature } = req.body;
    if (!address) return res.status(401).json({ error: "Unauthorized" });
    if (!dmrNumber || !emrNumber || !appointmentId) return res.status(400).json({ error: "Missing dmrNumber, emrNumber, or appointmentId" });

    // const recoveredAddress = ethers.utils.verifyMessage(JSON.stringify({ emrNumber, appointmentId }), signature);
    // const recoveredSigner = provider.getSigner(recoveredAddress);
    // const accounts = await provider.listAccounts();
    // const accountAddress = accounts.find((account) => account.toLowerCase() === recoveredAddress.toLowerCase());
    // if (!accountAddress) { return res.status(400).json({ error: "Account not found" }); }
    // if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) { return res.status(400).json({ error: "Invalid signature" }); }

    const privateKey = accounts[address];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);
    const outpatientContractWithSigner = new ethers.Contract(outpatient_contract, outpatientABI, walletWithProvider);

    const [dmrExists, dmrData] = await contractWithSigner.getPatientByDmrNumber(dmrNumber);
    if (!dmrExists) return res.status(404).json({ error: `DMR number ${dmrNumber} tidak ditemukan.` });
    const dmrCid = dmrData.dmrCid;
    const data = await retrieveDMRData(dmrNumber, dmrCid);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => {
      return JSON.parse(appointmentInfo.appointments);
    });
    const matchedAppointment = appointmentDetails.find(appointment => appointment.appointmentId === appointmentId && appointment.emrNumber === emrNumber && appointment.status === "ongoing");
    if (!matchedAppointment) {
      return res.status(404).json({ error: `Profile with nomor rekam medis ${appointmentId} tidak ditemukan.` });
    }
    matchedAppointment.status = "canceled";

    const dmrFolderName = `${dmrNumber}J${dmrNumber}`;
    const emrFolderName = `${emrNumber}J${emrNumber}`;
    const appointmentFolderName = `${appointmentId}J${appointmentId}`;
    const dmrPath = path.join(basePath, dmrFolderName);
    const emrPath = path.join(dmrPath, emrFolderName);
    const appointmentPath = path.join(emrPath, appointmentFolderName);
    fs.mkdirSync(appointmentPath, { recursive: true });
    fs.writeFileSync(path.join(appointmentPath, `J${appointmentId}.json`), JSON.stringify(matchedAppointment));

    // Update IPFS with new files
    const files = await prepareFilesForUpload(dmrPath);
    const allResults = [];
    for await (const result of client.addAll(files, { wrapWithDirectory: true })) {
      allResults.push(result);
    }
    const newDmrCid = allResults[allResults.length - 1].cid.toString();

    // Update patient data on blockchain
    const updateTX = await contractWithSigner.updatePatientAccount(
      dmrData.accountAddress,
      dmrNumber,
      newDmrCid,
      dmrData.isActive
    );
    await updateTX.wait();

    // Update outpatient data on blockchain
    const outpatientTX = await outpatientContractWithSigner.updateOutpatientData(
      appointmentId,
      address,
      matchedAppointment.doctorAddress,
      matchedAppointment.nurseAddress,
      newDmrCid
    );
    await outpatientTX.wait();

    res.status(200).json({ matchedAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// get patient profile list
router.get("/patient-data", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;
    if(!address) return res.status(401).json({ error: "Unauthorized" });

    const privateKey = accounts[address];
    const wallet = new Wallet(privateKey);
    const walletWithProvider = wallet.connect(provider);
    const contractWithSigner = new ethers.Contract(patient_contract, patientABI, walletWithProvider);

    try {
      const patientAccounts = await contractWithSigner.getAllPatients();
      const patientData = await Promise.all(patientAccounts.map(async (account) => {
        const dmrNumber = account.dmrNumber;
        const dmrCid = account.dmrCid;
        return { dmrNumber, dmrCid};
      }));

      const data = await Promise.all(patientData.map(async (data) => {
        const retrievedData = await retrieveDMRData(data.dmrNumber, data.dmrCid);
        retrievedData.dmrNumber = data.dmrNumber;
        return retrievedData;
      }));

      const accounts = data.map(data => {
        const dmrNumber = data.dmrNumber;
        const accountJsonString = data.accountData[`J${dmrNumber}.json`];
        if (!accountJsonString) {
          console.error(`No account data found for dmrNumber: ${dmrNumber}`);
          return null;
        }
        try {
          const accountObj = JSON.parse(accountJsonString);
          return accountObj;
        } catch (error) {
          console.error(`Error parsing account data for dmrNumber: ${dmrNumber}`, error);
          return null;
        }
      }).filter(account => account !== null);

      const profiles = data.flatMap(data => {
        return data.emrProfiles.map(profileInfo => JSON.parse(profileInfo.profile));
      });
      const activeProfiles = profiles.filter(profile => profile.isActive === true);

      const appointments = data.flatMap((data) => {
        return data.appointmentData.map((appointment) => JSON.parse(appointment.appointments));
      });
      const activeAppointments = appointments.filter(appointment => activeProfiles.some(profile => profile.emrNumber === appointment.emrNumber));

      res.status(200).json({ accounts, profiles: activeProfiles, appointments: activeAppointments });
    } catch (error) {
      console.log("Error fetching patient accounts:", error);
      return res.status(500).json({ message: "Failed to fetch patient accounts" });
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// get patient appointments
// router.get("/patient-appointments", authMiddleware, async (req, res) => {
//   try {
//     const address = req.auth.address;
//     const appointments = await outpatientContract.getTemporaryPatientData(address);
//     let patientAppointments = [];

//     for (const appointment of appointments) {
//       const patientAppointmentData = await outpatientContract.getAppointmentsByPatient(appointment.patientAddress);
//       for (const patientAppointment of patientAppointmentData) {
//         const cid = patientAppointment.cid;
//         const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
//         const response = await fetch(ipfsGatewayUrl);
//         const patientData = await response.json();
//         if (patientData.emrNumber === appointment.emrNumber) {
//           patientAppointments.push({
//             data: {
//               appointmentId: patientData.appointmentId,
//               accountAddress: patientData.accountAddress,
//               accountEmail: patientData.accountEmail,
//               emrNumber: patientData.emrNumber,
//               namaLengkap: patientData.namaLengkap,
//               nomorIdentitas: patientData.nomorIdentitas,
//               email: patientData.email,
//               telpSelular: patientData.telpSelular,
//               rumahSakit: patientData.rumahSakit,
//               idDokter: patientData.idDokter,
//               doctorAddress: patientData.doctorAddress,
//               namaDokter: patientData.namaDokter,
//               spesialisasiDokter: patientData.spesialisasiDokter,
//               idJadwal: patientData.idJadwal,
//               hariTerpilih: patientData.hariTerpilih,
//               tanggalTerpilih: patientData.tanggalTerpilih,
//               waktuTerpilih: patientData.waktuTerpilih,
//               idPerawat: patientData.idPerawat,
//               nurseAddress: patientData.nurseAddress,
//               namaAsisten: patientData.namaAsisten,
//               status: patientData.status,
//               createdAt: patientData.createdAt
//             },
//           });
//         }
//       }
//     }

//     const scheduleContract = new ethers.Contract(schedule_contract, scheduleABI, provider);
//     const schedules = await scheduleContract.getLatestActiveDoctorSchedule();
//     const scheduleCid = schedules.cid;
//     const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${scheduleCid}`;
//     const ipfsResponse = await fetch(ipfsGatewayUrl);
//     const ipfsData = await ipfsResponse.json();
//     res.status(200).json({ ...ipfsData, patientAppointments });
//   } catch (error) {
//     console.error("Error fetching patient appointments:", error);
//     res.status(500).json({ message: "Failed to fetch patient appointments" });
//   }
// });

export default router;
