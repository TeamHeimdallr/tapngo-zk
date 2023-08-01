require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    polygonzk: {
      url: "https://rpc.public.zkevm-test.net",
      chainId: 1442,
      gasPrice: 4300000000,
      accounts: ["86f03ee6042e9e1a9c5d87050c62555e706b9f1b547ca1797542d82dac7d41f0"],
    },
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
