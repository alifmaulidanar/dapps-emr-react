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
      },
    ],
  },
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "0xc0abcc13006c2ce19381eab5e168536a93041110c507b13537cf3450dbfb3b77",
        "0xc0abcc13006c2ce19381eab5e168536a93041110c507b13537cf3450dbfb3b77",
      ],
    },
  },
};

module.exports = config;
