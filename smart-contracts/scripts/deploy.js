const { ethers } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // MEDICAL RECORDS
    // const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
    // const contract = await MedicalRecords.deploy();

    // SIMPLE EMR
    const SimpleEMR = await ethers.getContractFactory("SimpleEMR");
    const contract = await SimpleEMR.deploy();

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
