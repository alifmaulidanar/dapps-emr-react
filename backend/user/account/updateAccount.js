import express from "express";
import Joi from "joi";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { CONTRACT_ADDRESS } from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import { CONN } from "../../../enum-global.js";

const contractAddress = CONTRACT_ADDRESS.toString();
const client = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http",
});

const router = express.Router();
router.use(express.json());

// Endpoint untuk memperbarui username
router.post("/patient/update-username", async (req, res) => {
  try {
    const { field, value, signature } = req.body;

    const { error } = Joi.object({
      field: Joi.string().required(),
      value: Joi.string().required(),
      signature: Joi.string().required(),
    }).validate({ field, value, signature });

    if (error) return res.status(400).json({ error: error.details[0].message });

    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        field,
        value,
      }),
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

    // Koneksi ke Smart Contract
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      recoveredSigner
    );

    // Mengambil CID dari blockchain
    const getIpfs = await contract.getIpfsByAddress(accountAddress);
    const cidFromBlockchain = getIpfs.cid;

    // Mengambil data dari IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    const updatedData = {
      ...ipfsData,
      accountUsername: value,
    };

    // Menyimpan data yang diperbarui ke IPFS
    const updatedResult = await client.add(JSON.stringify(updatedData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);

    // Fetch data dari IPFS Desktop untuk mengakses data baru di IPFS
    const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid}`;
    const newIpfsResponse = await fetch(newIpfsGatewayUrl);
    const newIpfsData = await newIpfsResponse.json();

    // Update CID di blockchain
    const updateIpfsTX = await contract.addIpfsAccount(updatedCid);
    await updateIpfsTX.wait();
    const getUpdatedIpfs = await contract.getIpfsByAddress(accountAddress);

    // Update user account di blockchain
    const updateAccountTX = await contract.addUserAccount(
      ipfsData.accountEmail,
      ipfsData.accountRole,
      getUpdatedIpfs.ipfsAddress
    );
    await updateAccountTX.wait();
    const getUpdatedAccount = await contract.getUserAccountByAddress(
      accountAddress
    );

    // Response
    const responseData = {
      message: `Account Updated`,
      account: {
        accountAddress: getUpdatedAccount.accountAddress,
        email: getUpdatedAccount.email,
        role: getUpdatedAccount.role,
        ipfsHash: getUpdatedAccount.ipfsHash,
      },
      ipfs: {
        ipfsAddress: getUpdatedIpfs.ipfsAddress,
        cid: updatedCid,
        data: newIpfsData,
      },
    };

    res.status(200).json(responseData);
    console.log(responseData);
  } catch (error) {
    console.error(error);
    const stackLines = error.stack.split("\n");
    console.log("Error pada file dan baris:", stackLines[1].trim());
    res.status(500).json({
      error: error.message,
      message: "Failed updating patient profile",
    });
  }
});

// Endpoint untuk memperbarui email
router.post("/patient/update-email", async (req, res) => {
  try {
    const { field, value, signature } = req.body;

    const { error } = Joi.object({
      field: Joi.string().required(),
      value: Joi.string().required(),
      signature: Joi.string().required(),
    }).validate({ field, value, signature });

    if (error) return res.status(400).json({ error: error.details[0].message });

    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        field,
        value,
      }),
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

    // Koneksi ke Smart Contract
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      recoveredSigner
    );

    // Mengambil CID dari blockchain
    const getIpfs = await contract.getIpfsByAddress(accountAddress);
    const cidFromBlockchain = getIpfs.cid;

    // Mengambil data dari IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    const updatedData = {
      ...ipfsData,
      accountEmail: value,
    };

    // Menyimpan data yang diperbarui ke IPFS
    const updatedResult = await client.add(JSON.stringify(updatedData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);

    // Fetch data dari IPFS Desktop untuk mengakses data baru di IPFS
    const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid}`;
    const newIpfsResponse = await fetch(newIpfsGatewayUrl);
    const newIpfsData = await newIpfsResponse.json();

    // Update CID di blockchain
    const updateIpfsTX = await contract.addIpfsAccount(updatedCid);
    await updateIpfsTX.wait();
    const getUpdatedIpfs = await contract.getIpfsByAddress(accountAddress);

    // Update user account di blockchain
    const updateAccountTX = await contract.updateUserEmail(value);
    await updateAccountTX.wait();
    const getUpdatedAccount = await contract.getUserAccountByAddress(
      accountAddress
    );

    // Response
    const responseData = {
      message: `Account Updated`,
      account: {
        accountAddress: getUpdatedAccount.accountAddress,
        email: getUpdatedAccount.email,
        role: getUpdatedAccount.role,
        ipfsHash: getUpdatedAccount.ipfsHash,
      },
      ipfs: {
        ipfsAddress: getUpdatedIpfs.ipfsAddress,
        cid: updatedCid,
        data: newIpfsData,
      },
    };

    res.status(200).json(responseData);
    console.log(responseData);
  } catch (error) {
    console.error(error);
    const stackLines = error.stack.split("\n");
    console.log("Error pada file dan baris:", stackLines[1].trim());
    res.status(500).json({
      error: error.message,
      message: "Failed updating patient profile",
    });
  }
});

// Endpoint untuk memperbarui nomor telepon
router.post("/patient/update-phone", async (req, res) => {
  try {
    const { field, value, signature } = req.body;

    const { error } = Joi.object({
      field: Joi.string().required(),
      value: Joi.string().required(),
      signature: Joi.string().required(),
    }).validate({ field, value, signature });

    if (error) return res.status(400).json({ error: error.details[0].message });

    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        field,
        value,
      }),
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

    // Koneksi ke Smart Contract
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      recoveredSigner
    );

    // Mengambil CID dari blockchain
    const getIpfs = await contract.getIpfsByAddress(accountAddress);
    const cidFromBlockchain = getIpfs.cid;

    // Mengambil data dari IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    const updatedData = {
      ...ipfsData,
      accountPhone: value,
    };

    // Menyimpan data yang diperbarui ke IPFS
    const updatedResult = await client.add(JSON.stringify(updatedData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);

    // Fetch data dari IPFS Desktop untuk mengakses data baru di IPFS
    const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid}`;
    const newIpfsResponse = await fetch(newIpfsGatewayUrl);
    const newIpfsData = await newIpfsResponse.json();

    // Update CID di blockchain
    const updateIpfsTX = await contract.addIpfsAccount(updatedCid);
    await updateIpfsTX.wait();
    const getUpdatedIpfs = await contract.getIpfsByAddress(accountAddress);

    // Update user account di blockchain
    const updateAccountTX = await contract.addUserAccount(
      ipfsData.accountEmail,
      ipfsData.accountRole,
      getUpdatedIpfs.ipfsAddress
    );
    await updateAccountTX.wait();
    const getUpdatedAccount = await contract.getUserAccountByAddress(
      accountAddress
    );

    // Response
    const responseData = {
      message: `Account Updated`,
      account: {
        accountAddress: getUpdatedAccount.accountAddress,
        email: getUpdatedAccount.email,
        role: getUpdatedAccount.role,
        ipfsHash: getUpdatedAccount.ipfsHash,
      },
      ipfs: {
        ipfsAddress: getUpdatedIpfs.ipfsAddress,
        cid: updatedCid,
        data: newIpfsData,
      },
    };

    res.status(200).json(responseData);
    console.log(responseData);
  } catch (error) {
    console.error(error);
    const stackLines = error.stack.split("\n");
    console.log("Error pada file dan baris:", stackLines[1].trim());
    res.status(500).json({
      error: error.message,
      message: "Failed updating patient profile",
    });
  }
});

// Endpoint untuk memperbarui kata sandi
router.post("/patient/update-password", async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword, signature } = req.body;

    const { error } = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"))
        .required(),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
      signature: Joi.string().required(),
    }).validate({ oldPassword, newPassword, signature });

    if (error) return res.status(400).json({ error: error.details[0].message });

    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        oldPassword,
        newPassword,
      }),
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

    // Koneksi ke Smart Contract
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      recoveredSigner
    );

    // Mengambil CID dari blockchain
    const getIpfs = await contract.getIpfsByAddress(accountAddress);
    const cidFromBlockchain = getIpfs.cid;

    // Mengambil data dari IPFS
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();
    const isMatch = await bcrypt.compare(oldPassword, ipfsData.accountPassword);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid old password" });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedData = {
      ...ipfsData,
      accountPassword: encryptedPassword,
    };

    // Menyimpan data yang diperbarui ke IPFS
    const updatedResult = await client.add(JSON.stringify(updatedData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);

    // Fetch data dari IPFS Desktop untuk mengakses data baru di IPFS
    const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid}`;
    const newIpfsResponse = await fetch(newIpfsGatewayUrl);
    const newIpfsData = await newIpfsResponse.json();

    // Update CID di blockchain
    const updateIpfsTX = await contract.addIpfsAccount(updatedCid);
    await updateIpfsTX.wait();
    const getUpdatedIpfs = await contract.getIpfsByAddress(accountAddress);

    // Update user account di blockchain
    const updateAccountTX = await contract.addUserAccount(
      ipfsData.accountEmail,
      ipfsData.accountRole,
      getUpdatedIpfs.ipfsAddress
    );
    await updateAccountTX.wait();
    const getUpdatedAccount = await contract.getUserAccountByAddress(
      accountAddress
    );

    // Response
    const responseData = {
      message: `Account Updated`,
      account: {
        accountAddress: getUpdatedAccount.accountAddress,
        email: getUpdatedAccount.email,
        role: getUpdatedAccount.role,
        ipfsHash: getUpdatedAccount.ipfsHash,
      },
      ipfs: {
        ipfsAddress: getUpdatedIpfs.ipfsAddress,
        cid: updatedCid,
        data: newIpfsData,
      },
    };

    res.status(200).json(responseData);
    console.log(responseData);
  } catch (error) {
    console.error(error);
    const stackLines = error.stack.split("\n");
    console.log("Error pada file dan baris:", stackLines[1].trim());
    res.status(500).json({
      error: error.message,
      message: "Failed updating patient profile",
    });
  }
});

export default router;
