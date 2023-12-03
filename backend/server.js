import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import signupRouter from "./user/auth/signup.js";
import signinRouter from "./user/auth/signin.js";
import recordListRouter from "./pages/record-list.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/", signupRouter, signinRouter, recordListRouter);

// Menjalankan server pada port 3000
app.listen(3000, () => {
  console.log("Server berjalan pada port 3000");
});
