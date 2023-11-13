import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const { API_KEY, API_KEY_SECRET, CONTRACT_ADDRESS, PRIVATE_KEY } =
  process.env;
