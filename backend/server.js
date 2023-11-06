import express from "express";
import bodyParser from "body-parser";
import { create } from "ipfs-http-client";
import { API_KEY, API_KEY_SECRET } from "./dotenvConfig.js";

const authorization =
  "Basic " + Buffer.from(API_KEY + ":" + API_KEY_SECRET).toString("base64");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inisialisasi koneksi ke IPFS Infura
const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: authorization,
  },
});

app.get("/patient/signup", (req, res) => {
  res.status(200).json({ message: "Sign Up Pasien" });
});

// Endpoint untuk pendaftaran pasien
app.post("/patient/signup", async (req, res) => {
  try {
    // Mendapatkan data dari request body
    const { username, email, phone, password, confirmPassword } = req.body;

    // Validasi data
    if (
      !username ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      password != confirmPassword
    ) {
      return res.status(400).json({ error: "Semua kolom harus diisi" });
    }

    // Membuat objek data pasien
    const newPatient = {
      accountUsername: username,
      accountEmail: email,
      accountPhone: phone,
      accountPassword: password,
      accountRole: "patient",
      accountCreated: new Date(),
      accountProfiles: [],
    };

    // Menggunakan IPFS untuk menyimpan data sebagai JSON
    const result = await client.add(JSON.stringify(newPatient));
    console.log("IPFS Result:", result);

    // Mengembalikan CID dari data yang disimpan di IPFS
    res.status(200).json({
      message: "Pendaftaran pasien berhasil",
      ipfsCID: result.cid,
      ipfsPath: result.path,
      ipfsSize: result.size,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat memproses pendaftaran" });
  }
});

// Menjalankan server pada port 3000
app.listen(3000, () => {
  console.log("Server berjalan pada port 3000");
});
