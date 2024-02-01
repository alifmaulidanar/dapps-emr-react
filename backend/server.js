import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import signupRouter from "./user/auth/signup.js";
import signinRouter from "./user/auth/signin.js";
import recordListRouter from "./pages/patient/record-list.js";
import account from "./pages/patient/account.js";
import addProfile from "./user/profile/addProfile.js";
import updateProfile from "./user/profile/updateProfile.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use(
  "/",
  signupRouter,
  signinRouter,
  recordListRouter,
  account,
  addProfile,
  updateProfile
);

// Menjalankan server pada port 3000
app.listen(3000, () => {
  console.log("Server berjalan pada port 3000");
});
