import express from "express";
import { ethers } from "ethers";
import contractAbi from "./../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import { CONTRACT_ADDRESS } from "../dotenvConfig.js";
import { CONN } from "../../enum-global.js";

const router = express.Router();
router.use(express.json());

const contractAddress = CONTRACT_ADDRESS.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const contract = new ethers.Contract(contractAddress, contractAbi, provider);

async function getUserAccountData(address) {
  try {
    const account = await contract.getAccountByAddress(address);
    const cid = account.cid;

    if (account.accountAddress === ethers.constants.AddressZero) {
      throw new Error("Account not found");
    }

    // Fetch data dari Dedicated Gateway IPFS Desktop untuk mengakses data di IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();
    const responseData = {
      message: "GET User Data from IPFS Succesful",
      account: {
        accountAddress: ipfsData.accountAddress,
        accountEmail: ipfsData.accountEmail,
        role: ipfsData.accountRole,
      },
      ipfs: {
        cid: cid,
        data: ipfsData,
      },
    };
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { getUserAccountData };
