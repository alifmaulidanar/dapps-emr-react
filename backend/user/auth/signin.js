import Joi from "joi";
import express from "express";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../../dotenvConfig.js";
import contractAbi from "../../contractConfig/abi/SimpleEMR.abi.json" assert { type: "json" };

const contractAddress = CONTRACT_ADDRESS.toString();
const router = express.Router();
router.use(express.json());

// Membuat format validasi menggunakan Joi
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// POST Sign Up Account Patient & Doctor
router.post("/:role/signin", async (req, res) => {
  const { role } = req.params;

  try {
    const { email, password, signature } = req.body;
    const { error } = schema.validate({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verifikasi tanda tangan
    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:7545/"
    );

    // const signer = provider.getSigner();
    const recoveredAddress = ethers.utils.verifyMessage(
      JSON.stringify({
        email,
        password,
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

    // Pengecekan apakah email sudah terdaftar
    const getAccountByEmail = await contract.getUserAccountByEmail(email);
    if (getAccountByEmail.accountAddress === ethers.constants.AddressZero) {
      return res.status(404).json({
        error: `Account with email ${email} not found`,
      });
    }

    const getIpfs = await contract.getIpfsByAddress(accountAddress);
    const cid = getIpfs.cid;

    // Fetch data dari Dedicated Gateway IPFS Infura untuk mengakses data di IPFS
    const ipfsGatewayUrl = `https://dapp-emr.infura-ipfs.io/ipfs/${cid}`;
    const response = await fetch(ipfsGatewayUrl);
    const ipfsData = await response.json();

    // Cek accountRole
    if (role !== ipfsData.accountRole) {
      if (role === "patient") {
        return res.status(400).json({
          error: `Akun Pasien tersebut belum terdaftar.`,
        });
      } else {
        return res.status(400).json({
          error: "Akun Dokter tersebut belum terdaftar.",
        });
      }
    };

    // Cek password
    const validPassword = await bcrypt.compare(
      password,
      ipfsData.accountPassword
    );

    if (!validPassword) {
      return res.status(400).json({
        error: "Invalid password",
      });
    };

    // Menyusun objek data yang ingin ditampilkan dalam response body
    const responseData = {
      message: "Sign In Succesful",
      account: {
        accountAddress: ipfsData.accountAddress,
        email: ipfsData.accountEmail,
        role: ipfsData.accountRole,
      },
      ipfs: {
        ipfsAddress: getIpfs.ipfsAddress,
        cid: getIpfs.cid,
        data: ipfsData,
      },
    };

    console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error,
      message: `${role} Registration Failed`,
    });
  }
});

export default router;
