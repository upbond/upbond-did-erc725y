require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  networks: {
    localhost: {
      url: "http://localhost:8545/"
    },
    mumbai: {
      url: "https://polygon-testnet.public.blastapi.io",
      accounts: [process.env.PK]
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.PK]
    }
  },
  etherscan: {
    apiKey: "EP56D8EPKQTQP8ZUQGI7ZJSCR5ND83UHZG" // polygonscan.com
  },
  gasReporter: {
    gasPrice: 10,
    currency: "USD",
    enabled: (process.env.GAS_REPORT) ? true : false
  },
};
