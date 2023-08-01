// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(await ethers.provider.getBlockNumber());
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  let verifier, contractWallet;

  verifier = await ethers.deployContract("Groth16Verifier", []);
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();

  contractWallet = await ethers.deployContract("ContractWallet", [verifierAddr]);
  await contractWallet.waitForDeployment();
  const contractWalletAddr = await contractWallet.getAddress();
  console.log(contractWalletAddr, "ContractWallet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

