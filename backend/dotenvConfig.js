import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const { API_KEY, API_KEY_SECRET, PRIVATE_KEY, SECRET_KEY, CONTRACT_ADDRESS, ADMIN_CONTRACT, USER_CONTRACT, SCHEDULE_CONTRACT, OUTPATIENT_CONTRACT } = process.env;
