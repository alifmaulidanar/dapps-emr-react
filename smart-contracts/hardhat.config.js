require("hardhat/config");
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
        version: "0.8.21",
      },
    ],
  },
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
  },
};

module.exports = config;
