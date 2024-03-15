const { ethers } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // SIMPLE EMR
    // const SimpleEMR = await ethers.getContractFactory("SimpleEMR");
    // const contract = await SimpleEMR.deploy();
    // await contract.waitForDeployment();
    // console.log(`Deployed! Contract address: ${contract.target}`);

    // Admin
    // const AdminManagement = await ethers.getContractFactory("AdminManagement");
    // const adminManagement = await AdminManagement.deploy();
    // await adminManagement.waitForDeployment();
    // console.log(`AdminManagement deployed! Contract address: ${adminManagement.target}`);

    // User Management
    // const UserManagement = await ethers.getContractFactory("UserManagement");
    // const userManagement = await UserManagement.deploy();
    // await userManagement.waitForDeployment();
    // console.log(`UserManagement deployed! Contract address: ${userManagement.target}`);

    //  Schedule Management
    // const ScheduleManagement = await ethers.getContractFactory("ScheduleManagement");
    // const scheduleManagement = await ScheduleManagement.deploy();
    // await scheduleManagement.waitForDeployment();
    // console.log(`ScheduleManagement deployed! Contract address: ${scheduleManagement.target}`);

    // Outpatient Data Management
    const OutpatientManagement = await ethers.getContractFactory("OutpatientManagement");
    const outpatientManagement = await OutpatientManagement.deploy();
    await outpatientManagement.waitForDeployment();
    console.log(`OutpatientManagement deployed! Contract address: ${outpatientManagement.target}`);
  } catch (err) {
    console.error(err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
