import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import { CONN } from "../enum-global.js";
import adminRouter from "./admin/admin.js";
import staffRouter from "./staff/staff.js";
import doctorRouter from "./doctor/doctor.js";
import nurseRouter from "./nurse/nurse.js";
import account from "./user/account/account.js";
import signupRouter from "./user/auth/signup.js";
import signinRouter from "./user/auth/signin.js";
import addProfile from "./user/profile/addProfile.js";
import updateProfile from "./user/profile/updateProfile.js";
import updateAccount from "./user/account/updateAccount.js";
import appointmentRouter from "./user/appointment/appointment.js";

const app = express();
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Routes
app.use("/admin", adminRouter);
app.use("/staff", staffRouter);
app.use("/doctor", doctorRouter);
app.use("/nurse", nurseRouter);
app.use(
  "/",
  account,
  addProfile,
  signupRouter,
  signinRouter,
  updateProfile,
  updateAccount,
  appointmentRouter
);

app.listen(CONN.SERVER, () => { console.log(`Server berjalan pada port ${CONN.SERVER}`) });
