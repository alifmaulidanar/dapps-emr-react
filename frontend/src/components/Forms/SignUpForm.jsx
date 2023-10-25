// import { useState } from "react";
// import pinataSDK from "@pinata/sdk";
// import DotEnv from "dotenv";
// DotEnv.config({ path: "../../.env" });
// const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

export default function SignUpForm({ role }) {
  // const [confirmPassword, setConfirmPassword] = useState("");
  // const [patientData, setPatientData] = useState({
  //   username: "",
  //   email: "",
  //   phone: "",
  //   password: "",
  //   patients: [],
  //   role: role,
  // });

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setPatientData((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // };

  // const handleConfirmPasswordChange = (e) => {
  //   const { value } = e.target;
  //   setConfirmPassword(value);
  // };

  // const handleSignUp = async (e) => {
  //   e.preventDefault();

  //   try {
  //     if (patientData.password !== confirmPassword) {
  //       console.error("Password dan konfirmasi password tidak cocok.");
  //       return;
  //     }

  //     const res = await pinata.pinJSONToIPFS(patientData);

  //     // Print the IPFS hash for testing (you can store it for reference)
  //     const ipfsHash = res.data;
  //     console.log("IPFS Hash:", ipfsHash);

  //     // Retrieve data from IPFS using IPFS Hash
  //     const response = await fetch(
  //       `https://pink-ruling-damselfly-201.mypinata.cloud/ipfs/${ipfsHash}`
  //     );
  //     const data = await response.json();
  //     console.log("Data:\n", data);

  //     // After this, you can perform actions like storing the IPFS hash on the blockchain or other necessary steps.
  //   } catch (error) {
  //     console.error("Error uploading to IPFS:", error);
  //   }
  // };

  return (
    <div className="w-90 h-fit grid col-start-2 col-span-2 pt-12 pb-8">
      <div className="h-fit px-12 py-8 bg-white border border-gray-200 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Pendaftaran Akun {role}
        </h1>
        <form className="grid grid-cols-1 gap-x-12">
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
              // value={patientData.username}
              // onChange={handleInputChange}
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
              // value={patientData.email}
              // onChange={handleInputChange}
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
              // value={patientData.phone}
              // onChange={handleInputChange}
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
              // value={patientData.password}
              // onChange={handleInputChange}
            />
          </div>
          <div className="grid mb-6">
            <label
              htmlFor="repassword"
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
              // value={confirmPassword}
              // onChange={handleConfirmPasswordChange}
            />
          </div>
          <div className="mx-auto">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center mt-4"
              // onSubmit={handleSignUp}
            >
              Daftarkan Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
