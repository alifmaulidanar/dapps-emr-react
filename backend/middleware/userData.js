import express from "express";
import { ethers } from "ethers";
import { CONN } from "../../enum-global.js";

// Contract & ABI
import { USER_CONTRACT } from "../dotenvConfig.js";
import userABI from "./../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
const contractAddress = USER_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const contract = new ethers.Contract(contractAddress, userABI, provider);

const router = express.Router();
router.use(express.json());

async function getUserAccountData(address) {
  try {
    const account = await contract.getAccountByAddress(address);
    const cid = account.cid;
    if (account.accountAddress === ethers.constants.AddressZero) { throw new Error("Account not found") }
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();
    const responseData = {
      message: "GET User Data from IPFS Succesful",
      account: { accountAddress: ipfsData.accountAddress, accountEmail: ipfsData.accountEmail, role: ipfsData.accountRole },
      ipfs: { cid: cid, data: ipfsData },
    };
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { getUserAccountData };
