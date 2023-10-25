const { ethers } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
    const contract = await MedicalRecords.deploy();

    await contract.waitForDeployment();
    console.log(`Deployed! Contract address: ${contract.target}`);
  } catch (err) {
    console.error(err);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
