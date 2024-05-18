import fs from "fs";
import path from "path";

export function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  // console.log("format datetime from utils")
  return `${hours}:${minutes}:${seconds}_${day}-${month}-${year}`;
}

export async function prepareFilesForUpload(dirPath, basePath = dirPath) {
  const files = [];
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (let item of items) {
    const itemPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      const subFiles = await prepareFilesForUpload(itemPath, basePath);
      files.push(...subFiles);
    } else {
      files.push({
        path: itemPath.replace(basePath, "").replace(/\\/g, "/").substring(1),
        content: fs.readFileSync(itemPath),
      });
    }
  }
  // console.log("file upload from utils")
  return files;
}

export function generatePassword() {
  const length = 8;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  // console.log("generatePassword from utils")
  return password;
}
