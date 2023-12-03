import express from "express";
import { ethers } from "ethers";
import contractAbi from "./../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import { CONTRACT_ADDRESS } from "../dotenvConfig.js";

const router = express.Router();
router.use(express.json());

const contractAddress = CONTRACT_ADDRESS.toString();
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545/");
const contract = new ethers.Contract(contractAddress, contractAbi, provider);

async function getUserAccountData(address) {
  try {
    const account = await contract.getUserAccountByAddress(address);
    if (account.accountAddress === ethers.constants.AddressZero) {
      throw new Error("Account not found");
    }
    const ipfs = await contract.getIpfsByAddress(address);

    const responseData = {
      message: "GET Succesful",
      account: {
        accountAddress: account.accountAddress,
        email: account.email,
        role: account.role,
      },
      ipfs: {
        ipfsAddress: account.ipfsHash,
        cid: ipfs.cid,
      },
    };

    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

router.get("/patient/:address/record-list", async (req, res) => {
  try {
    const address = req.params.address;
    const data = await getUserAccountData(address);
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tinggal ambil data json dari IPFS pake cid
// Lempar json ke frontend

export default router;
