require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    viaIR: true, // Enable IR-based compilation
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL, //.env file
      accounts: [process.env.PRIVATE_KEY], 
    },
  },
};
