import express from "express";
import Joi from "joi";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { CONTRACT_ADDRESS } from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };
import { CONN } from "../../../enum-global.js";
import authMiddleware from "../../middleware/auth-middleware.js";

const contractAddress = CONTRACT_ADDRESS.toString();
const client = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http",
});

const router = express.Router();
router.use(express.json());

router.post("/:role/update", async (req, res) => {
  try {
    const {
      address,
      username,
      email,
      phone,
      oldPass,
      newPass,
      confirmPass,
      signature,
    } = req.body;

    const schema = Joi.object({
      username: Joi.string()
        .pattern(/^\S.*$/)
        .alphanum()
        .min(3)
        .max(50)
        .required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(new RegExp("^[0-9]{10,12}$")).required(),
      oldPass: Joi.string().required(),
      newPass: Joi.string()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"))
        .required(),
      confirmPass: Joi.string().valid(Joi.ref("newPass")).required(),
    });

    if (username && email && phone && oldPass && newPass && confirmPass) {
      const { error } = schema.validate({
        username,
        email,
        phone,
        oldPass,
        newPass,
        confirmPass,
      });

      if (error)
        return res.status(400).json({ error: error.details[0].message });
    }

    const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        address,
        username,
        email,
        phone,
        oldPass,
        newPass,
        confirmPass,
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

    const getIpfs = await contract.getAccountByAddress(accountAddress);
    const cidFromBlockchain = getIpfs.cid;

    // data awal yang ada di ipfs
    const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cidFromBlockchain}`;
    const ipfsResponse = await fetch(ipfsGatewayUrl);
    const ipfsData = await ipfsResponse.json();

    // Update email, username, phone, password, and store new cid
    // const emailRegistered = await contract.getAccountByEmail(email);
    // if (emailRegistered.accountAddress !== ethers.constants.AddressZero) {
    //   return res.status(400).json({ error: `Email ${email} sudah digunakan.` });
    // }

    let updatedData = {
      ...ipfsData,
      accountEmail: email,
      accountUsername: username,
      accountPhone: phone,
    };

    // update password
    if (confirmPass && newPass && oldPass) {
      let encryptedPassword;
      if (oldPass && newPass && confirmPass) {
        const isMatch = await bcrypt.compare(oldPass, ipfsData.accountPassword);
        if (!isMatch) {
          return res.status(400).json({ error: "Invalid old password" });
        }
        encryptedPassword = await bcrypt.hash(newPass, 10);
      }

      updatedData = {
        ...updatedData,
        accountPassword: encryptedPassword,
      };
    }

    const updatedResult = await client.add(JSON.stringify(updatedData));
    const updatedCid = updatedResult.cid.toString();
    await client.pin.add(updatedCid);

    // Update account details
    try {
      const tx = await contract.updateUserAccount(
        getIpfs.email,
        username,
        email,
        phone,
        updatedCid
      );
      await tx.wait();

      // cek data baru di ipfs
      const newIpfsGatewayUrl = `${CONN.IPFS_LOCAL}/${updatedCid}`;
      const newIpfsResponse = await fetch(newIpfsGatewayUrl);
      const newIpfsData = await newIpfsResponse.json();

      // cek data baru di blockchain
      const getUpdatedAccount = await contract.getAccountByAddress(address);

      const responseData = {
        account: getUpdatedAccount,
        ipfsData: newIpfsData,
      };

      console.log({ responseData });
      res.status(200).json({ responseData });
    } catch (error) {
      let message = "Transaction failed for an unknown reason";
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        message = "New email is already in use";
      }
      res.status(400).json({ error: message });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

export default router;
