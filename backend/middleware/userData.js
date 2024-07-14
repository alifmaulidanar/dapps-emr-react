import express from "express";
import { ethers } from "ethers";
import { CONN } from "../../enum-global.js";
import { create } from 'ipfs-http-client';
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

// Contract & ABI
import { PATIENT_CONTRACT, USER_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
import patientABI from "./../contractConfig/abi/PatientManagement.abi.json" assert { type: "json" };
import userABI from "./../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import outpatientABI from "./../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const patient_contract = PATIENT_CONTRACT.toString();
const user_contract = USER_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const patientContract = new ethers.Contract(patient_contract, patientABI, provider);
const userContract = new ethers.Contract(user_contract, userABI, provider);
const outpatientContract = new ethers.Contract(outpatient_contract, outpatientABI, provider);

const router = express.Router();
router.use(express.json());

async function getUserAccountData(address) {
  try {
    const account = await userContract.getAccountByAddress(address);
    const cid = account.cid;
    if (account.accountAddress === ethers.constants.AddressZero) { throw new Error("Account not found") }
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();

    // let appointments = [];
    // appointments = await outpatientContract.getAppointmentsByPatient(address);
    // const appointmentDetails = await Promise.all(appointments.map(async (appointment) => {
    //   const appointmentCid = appointment.cid;
    //   const appointmentIpfsUrl = `${CONN.IPFS_LOCAL}/${appointmentCid}`;
    //   const appointmentResponse = await fetch(appointmentIpfsUrl);
    //   const appointmentData = await appointmentResponse.json();
    //   return {
    //     id: appointment.id.toString(),
    //     patientAddress: appointment.patientAddress,
    //     doctorAddress: appointment.doctorAddress,
    //     nurseAddress: appointment.nurseAddress,
    //     emrNumber: appointment.emrNumber,
    //     cid: appointment.cid,
    //     data: appointmentData
    //   };
    // }));

    const responseData = {
      message: "GET User Data from IPFS Succesful",
      account: { accountAddress: ipfsData.accountAddress, accountEmail: ipfsData.accountEmail, role: ipfsData.accountRole },
      ipfs: { cid: cid, data: ipfsData },
      // appointments: appointmentDetails
    };
    // staff aman tanpa appointments
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getUserAccountDataPatient(address) {
  try {
    const [exists, account] = await patientContract.getPatientByAddress(address);
    if (!exists) throw new Error("Account not found");
    const dmrNumber = account.dmrNumber;
    const dmrCid = account.dmrCid;
    const data = await retrieveDMRData(dmrNumber, dmrCid);

    // account
    const accountJsonString = data.accountData[`J${dmrNumber}.json`];
    const accountObj = JSON.parse(accountJsonString);

    // profiles
    const accountProfiles = data.emrProfiles.map(profileInfo => {
      return JSON.parse(profileInfo.profile);
    });
    const activeProfiles = accountProfiles.filter(profile => profile.isActive === true);

    // appointments
    const appointmentDetails = data.appointmentData.map(appointmentInfo => {
      return JSON.parse(appointmentInfo.appointments);
    });

    const responseData = {
      message: "GET User Data from IPFS Succesful",
      account: {
        accountAddress: accountObj.accountAddress,
        dmrNumber: accountObj.dmrNumber,
        accountPassword: accountObj.accountPassword,
        accountRole: accountObj.accountRole,
        accountCreated: accountObj.accountCreated,
        role: "patient"
      },
      ipfs: {
        dmrCid: dmrCid,
        data: {
          accountAddress: accountObj.accountAddress,
          dmrNumber: accountObj.dmrNumber,
          accountPassword: accountObj.accountPassword,
          accountRole: accountObj.accountRole,
          accountCreated: accountObj.accountCreated,
          role: "patient",
          accountProfiles: activeProfiles
        }
      },
      appointments: appointmentDetails
    };
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPatientProfiles(address) {
  try {
    const [exists, account] = await patientContract.getPatientByAddress(address);
    if (!exists) throw new Error("Account not found");
    const dmrNumber = account.dmrNumber;
    const dmrCid = account.dmrCid;
    const data = await retrieveDMRData(dmrNumber, dmrCid);

    // account
    const accountJsonString = data.accountData[`J${dmrNumber}.json`];
    const accountObj = JSON.parse(accountJsonString);

    // profiles
    const accountProfiles = data.emrProfiles.map(profileInfo => {
      return JSON.parse(profileInfo.profile);
    });
    const activeProfiles = accountProfiles.filter(profile => profile.isActive === true);

    const responseData = { profiles: activeProfiles };
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function retrieveDMRData(dmrNumber, cid) {
  try {
    const accountData = {};
    const emrProfiles = [];
    const appointmentData = [];

    // Mendapatkan daftar isi dari CID folder
    for await (const file of client.ls(cid)) {
      // console.log({file});
      if (file.type === 'file' && file.name === `J${dmrNumber}.json`) {
        // Mengambil dan mengurai konten account.json
        const content = [];
        for await (const chunk of client.cat(file.cid)) {
          content.push(chunk);
        }
        accountData[file.name] = Buffer.concat(content).toString();
      }
      
      if (file.type === 'dir') {
        // Menggali ke dalam direktori EMR untuk mencari profile.json
        const updatedFileName = file.name.substring(16);
        const profileData = await retrieveEMRData(file.cid, updatedFileName);
        emrProfiles.push({ emrFolder: file.name, profile: profileData });
        // console.log({profileData});

        // Menggali ke dalam direktori Rawat Jalan untuk mencari appointment.json
        const appointments = await retrieveAppointmentsFromEMR(file.cid);
        appointmentData.push(...appointments);
      }
    }
    return { accountData, emrProfiles, appointmentData };
  } catch (error) {
    console.error("Failed to retrieve data from IPFS:", error);
    return { accountData: {}, emrProfiles: [] };
  }
}

async function retrieveEMRData(emrCid, emrNumber) {
  // Mencari dan mengambil profile.json di dalam folder EMR
  for await (const file of client.ls(emrCid)) {
    if (file.type === 'file' && file.name === `${emrNumber}.json`) {
      const content = [];
      for await (const chunk of client.cat(file.cid)) {
        content.push(chunk);
      }
      return Buffer.concat(content).toString();
    }
  }
  return null;
}

// Fungsi untuk mengambil data appointment dari direktori EMR di IPFS
async function retrieveAppointmentsFromEMR(emrCid) {
  const appointmentData = [];
  for await (const file of client.ls(emrCid)) {
    if (file.type === 'dir') {
      const appointments = await retrieveAppointmentData(file.cid);
      // const nonJSONAppointmentData = await retrieveNonJSONAppointmentData(file.cid);
      appointmentData.push(...appointments);
    }
  }
  return appointmentData;
}

// Fungsi untuk mengambil data appointment dari IPFS
// async function retrieveAppointmentData(appointmentCid) {
//   const appointmentData = [];
//   for await (const file of client.ls(appointmentCid)) {
//     if (file.type === 'file') {
//       const content = [];
//       for await (const chunk of client.cat(file.cid)) {
//         content.push(chunk);
//       }
//       appointmentData.push({
//         appointmentFile: file.name,
//         appointments: Buffer.concat(content).toString()
//       });
//     }
//   }
//   return appointmentData;
// }

async function retrieveAppointmentData(appointmentCid) {
  const appointmentData = [];
  for await (const file of client.ls(appointmentCid)) {
    if (file.type === 'file') {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'json') {
        const content = [];
        for await (const chunk of client.cat(file.cid)) {
          content.push(chunk);
        }
        appointmentData.push({
          appointmentFile: file.name,
          appointments: Buffer.concat(content).toString()
        });
      }
    }
  }
  return appointmentData;
}

async function retrieveNonJSONAppointmentData(appointmentCid) {
  const nonJSONAppointmentData = [];
  for await (const file of client.ls(appointmentCid)) {
    if (file.type === 'file') {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'json') {
        nonJSONAppointmentData.push({
          fileName: file.name,
          fileCid: file.cid.toString()
        });
      }
    }
  }
  return nonJSONAppointmentData;
}

export { getUserAccountData, getUserAccountDataPatient, getPatientProfiles, retrieveEMRData, retrieveDMRData, retrieveNonJSONAppointmentData };
