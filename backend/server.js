import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import signupRouter from "./user/auth/signup.js";
import signinRouter from "./user/auth/signin.js";
import account from "./user/account/account.js";
import updateAccount from "./user/account/updateAccount.js";
import addProfile from "./user/profile/addProfile.js";
import updateProfile from "./user/profile/updateProfile.js";

import adminRouter from "./admin/admin.js";
import { CONN } from "../enum-global.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/admin", adminRouter);
app.use(
  "/",
  signupRouter,
  signinRouter,
  account,
  updateAccount,
  addProfile,
  updateProfile
);

// Menjalankan server pada port 3000
app.listen(CONN.SERVER, () => {
  console.log(`Server berjalan pada port ${CONN.SERVER}`);
});
