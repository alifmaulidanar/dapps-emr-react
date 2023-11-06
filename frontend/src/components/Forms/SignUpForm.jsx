import React, { useState } from "react";

export default function SignUpForm({ role }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordMatchError, setPasswordMatchError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Lakukan validasi formulir jika diperlukan
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatchError("Password dan Konfirmasi Password harus sama");
      return;
    }
    setPasswordMatchError("");

    // Buat objek data pasien dari formulir
    const newPatient = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    let endpoint = "";
    if (role === "Pasien") {
      endpoint = "/patient/signup";
    } else if (role === "Dokter") {
      endpoint = "/doctor/signup";
    }

    // Kirim permintaan POST ke endpoint yang sesuai
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPatient),
        });

        const data = await response.json();
        console.log("Pendaftaran berhasil:", data);
        // Tambahkan logika penanganan respons di sini
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
        // Tambahkan logika penanganan kesalahan di sini
      }
    } else {
      console.error("Role tidak valid");
      // Tambahkan logika penanganan kesalahan jika role tidak valid
    }
  };

  const handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <div className="w-90 h-fit grid col-start-2 col-span-2 pt-12 pb-8">
      <div className="h-fit px-12 py-8 bg-white border border-gray-200 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Pendaftaran Akun {role}
        </h1>
        <form className="grid grid-cols-1 gap-x-12" onSubmit={handleSubmit}>
          <div className="grid mb-6">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Nama Pengguna
            </label>
            <input
              type="text"
              name="username"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              placeholder="Nama Pengguna"
              required
            />
          </div>
          <div className="grid mb-6">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Alamat Email"
              required
            />
          </div>
          <div className="grid mb-6">
            <label
              htmlFor="phone"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Nomor Telepon
            </label>
            <input
              type="tel"
              name="phone"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              placeholder="Nomor Telepon"
              required
            />
          </div>
          <div className="grid mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Ketik password baru Anda"
              required
            />
          </div>
          <div className="grid mb-6">
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Ketik Ulang Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Ketik ulang password baru Anda"
              required
            />
          </div>
          <div className="text-red-500">{passwordMatchError}</div>
          <div className="mx-auto">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center mt-4"
            >
              Daftarkan Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
