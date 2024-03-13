import bcrypt from "bcrypt";
import express from "express";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import authMiddleware from "../../middleware/auth-middleware.js";
import { CONTRACT_ADDRESS } from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };

const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const client = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http",
});

const router = express.Router();
router.use(express.json());

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

// GET Doctor Schedule
router.get("/:role/appointment", authMiddleware, async (req, res) => {
  try {
    const address = req.auth.address;

    if (!address) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractAbi,
      provider
    );

    const schedules = await contract.getLatestActiveDoctorSchedule();
    const scheduleCid = schedules.cid;

    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${scheduleCid}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();
    res.status(200).json({ ...ipfsData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
