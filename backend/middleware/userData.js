import express from "express";
import { ethers } from "ethers";
import { CONN } from "../../enum-global.js";

// Contract & ABI
import { USER_CONTRACT, OUTPATIENT_CONTRACT } from "../dotenvConfig.js";
import userABI from "./../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
import outpatientABI from "./../contractConfig/abi/OutpatientManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const outpatient_contract = OUTPATIENT_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
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

    let appointments = [];
    appointments = await outpatientContract.getAppointmentsByPatient(address);
    const appointmentDetails = await Promise.all(appointments.map(async (appointment) => {
      const appointmentCid = appointment.cid;
      const appointmentIpfsUrl = `${CONN.IPFS_LOCAL}/${appointmentCid}`;
      const appointmentResponse = await fetch(appointmentIpfsUrl);
      const appointmentData = await appointmentResponse.json();
      return {
        id: appointment.id.toString(),
        patientAddress: appointment.patientAddress,
        doctorAddress: appointment.doctorAddress,
        nurseAddress: appointment.nurseAddress,
        emrNumber: appointment.emrNumber,
        cid: appointment.cid,
        data: appointmentData
      };
    }));

    const responseData = {
      message: "GET User Data from IPFS Succesful",
      account: { accountAddress: ipfsData.accountAddress, accountEmail: ipfsData.accountEmail, role: ipfsData.accountRole },
      ipfs: { cid: cid, data: ipfsData },
      appointments: appointmentDetails
    };
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { getUserAccountData };
