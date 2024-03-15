require("hardhat/config");
// require("@nomiclabs/hardhat-ganache");
require("@nomicfoundation/hardhat-toolbox");
const DotEnv = require("dotenv");
DotEnv.config({ path: ".env" });

const { ACCOUNT_PRIVATE_KEY = "", ALCHEMY_KEY = "" } = process.env;

// const base64PrivateKey = "abGComMlU009f2u2aLeIswIKOaBnREowMX0PtNLBwc8="; // node1 private key
// const buffer = Buffer.from(base64PrivateKey, "base64");
// const hexPrivateKey = buffer.toString("hex");

const config = {
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
      chainId: 1337,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.22",
        settings: {
          evmVersion: "london",
          // optimizer: {
          //   enabled: true,
          //   runs: 200,
          // },
        },
      },
    ],
  },
  defaultNetwork: "ganache",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        // windows --> VPS dan lokal sama
        "0xad44c6613c71be716aea9e6e0233e0f4d4e535c7f0f6ea4209d66545df0b1a2e",

        // linux
        // "0xc3aa469ddbd8e3753f296b489af316c4e9acd38a307c693ca9adddc85da11d1f",
      ],
    },
    // quorum: {
    //   url: "http://localhost:20100", // Ganti dengan URL RPC node Quorum Anda
    //   accounts: ["0xCc43569E7F06EF3450325dCc1abA457e4390a5A4"], // node1 private key
    //   chainId: 18392, // Chain ID untuk jaringan Quorum Anda, sesuaikan jika berbeda
    //   gasPrice: 0, // Quorum biasanya tidak memerlukan gas untuk transaksi
    // },
  },
};

module.exports = config;
