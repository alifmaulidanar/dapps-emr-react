import express from "express";
import { ethers } from "ethers";
import contractAbi from "./../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import { CONTRACT_ADDRESS } from "../dotenvConfig.js";

const router = express.Router();
router.use(express.json());

const contractAddress = CONTRACT_ADDRESS.toString();
const provider = new ethers.providers.JsonRpcProvider(
  "http://103.175.217.196:8545/"
);
const contract = new ethers.Contract(contractAddress, contractAbi, provider);

async function getUserAccountData(address) {
  try {
    const account = await contract.getUserAccountByAddress(address);

    if (account.accountAddress === ethers.constants.AddressZero) {
      throw new Error("Account not found");
    }

    const getIpfs = await contract.getIpfsByAddress(address);
    const cid = getIpfs.cid;

    // Fetch data dari Dedicated Gateway IPFS Desktop untuk mengakses data di IPFS
    const ipfsGatewayUrl = `http://127.0.0.1:8081/ipfs/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();
    // console.log(ipfsData);

    const responseData = {
      message: "GET User Data from IPFS Succesful",
      account: {
        accountAddress: ipfsData.accountAddress,
        accountEmail: ipfsData.accountEmail,
        role: ipfsData.accountRole,
      },
      ipfs: {
        ipfsAddress: getIpfs.ipfsAddress,
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
