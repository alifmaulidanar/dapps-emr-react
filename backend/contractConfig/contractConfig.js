import { ethers } from "ethers";
import SimpleEMR_ABI from "./SimpleEMR.abi.json";
import dotenv from "dotenv";
dotenv.config();

export { SimpleEMR_ABI };

export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // Ganti dengan alamat smart contract Anda
export const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganti dengan URL RPC Ethereum Anda

export function getSimpleEMRContract(provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, SimpleEMR_ABI, provider);
}

export async function addPatientAccount(email, role, ipfsHash) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const tx = await contract.addPatientAccount(email, role, ipfsHash);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error saat menambahkan akun pasien:", error);
    throw error;
  }
}

export async function getPatientAccounts() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const patientAccounts = await contract.getPatientAccounts();
    return patientAccounts;
  } catch (error) {
    console.error("Error saat mendapatkan akun pasien:", error);
    throw error;
  }
}

export async function getPatientAccountByEmail(email) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const patientAccount = await contract.getPatientAccountByAddress(email);
    return patientAccount;
  } catch (error) {
    console.error(
      "Error saat mendapatkan akun pasien berdasarkan email:",
      error
    );
    throw error;
  }
}

export async function getPatientAccountByAddress(address) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const patientAccount = await contract.getPatientAccountByAddress(address);
    return patientAccount;
  } catch (error) {
    console.error(
      "Error saat mendapatkan akun pasien berdasarkan alamat:",
      error
    );
    throw error;
  }
}

export async function getNumberOfPatients() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const numberOfPatients = await contract.getNumberOfPatients();
    return numberOfPatients.toNumber();
  } catch (error) {
    console.error("Error saat mendapatkan jumlah total pasien:", error);
    throw error;
  }
}

export async function addIpfs(cid) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const tx = await contract.addIpfs(cid);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error saat menambahkan IPFS:", error);
    throw error;
  }
}

export async function getIpfs() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const ipfsRecords = await contract.getIpfs();
    return ipfsRecords;
  } catch (error) {
    console.error("Error saat mendapatkan rekam IPFS:", error);
    throw error;
  }
}

export async function getIpfsByAddress(address) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const ipfs = await contract.getIpfsByAddress(address);
    return ipfs;
  } catch (error) {
    console.error("Error saat mendapatkan IPFS berdasarkan alamat:", error);
    throw error;
  }
}

export async function getNumberOfIpfs() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    const contract = getSimpleEMRContract(provider);
    const numberOfIpfs = await contract.getNumberOfIpfs();
    return numberOfIpfs.toNumber();
  } catch (error) {
    console.error("Error saat mendapatkan jumlah total IPFS:", error);
    throw error;
  }
}
