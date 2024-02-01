require("hardhat/config");
// require("@nomiclabs/hardhat-ganache");
require("@nomicfoundation/hardhat-toolbox");
const DotEnv = require("dotenv");

DotEnv.config({ path: ".env" });

const { ACCOUNT_PRIVATE_KEY = "", ALCHEMY_KEY = "" } = process.env;

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
        // windows
        // "0xc0abcc13006c2ce19381eab5e168536a93041110c507b13537cf3450dbfb3b77",

        // linux
        "0xc3aa469ddbd8e3753f296b489af316c4e9acd38a307c693ca9adddc85da11d1f",
      ],
    },
  },
};

module.exports = config;
