import Joi from "joi";
import express from "express";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global.js";
import authMiddleware from "../../middleware/auth-middleware.js";

import { USER_CONTRACT } from "../../dotenvConfig.js";
import userABI from "../../contractConfig/abi/UserManagement.abi.json" assert { type: "json" };
const user_contract = USER_CONTRACT.toString();
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);
const client = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

async function prepareFilesForUpload(dirPath, basePath = dirPath) {
  const files = [];
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (let item of items) {
    const itemPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      const subFiles = await prepareFilesForUpload(itemPath, basePath);
      files.push(...subFiles);
    } else {
      files.push({
        path: itemPath.replace(basePath, '').replace(/\\/g, "/").substring(1),
        content: fs.readFileSync(itemPath)
      });
    }
  }
  return files;
}