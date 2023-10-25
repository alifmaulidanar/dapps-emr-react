import "./../../index.css";
import { Button } from "antd";
import NavbarController from "../../components/Navbar/NavbarController";
// import PatientRecordDisplay from "../../components/PatientRecordData";
import CopyIDButton from "../../components/Buttons/CopyIDButton";
// import Card from "../../components/Cards/Card";

function PatientAccount() {
  const userId = "0x1e6b98a582Fdd23614b58A4459C1C875C6705f55";

  return (
    <>
      <NavbarController type={2} page="Akun Pasien" color="blue" />
      <div className="grid grid-cols-7 justify-center min-h-screen w-9/12 mx-auto px-4 py-24">
        <div className="col-start-3 col-span-3">
          <div className="grid grid-cols-1 gap-y-8 max-w-4xl items-center rounded h-fit mx-auto">
            {/* ID Pengguna */}
            <div className="grid grid-cols-1 divide-y max-w-full w-full pb-0 bg-white border border-gray-200 rounded-xl shadow md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid grid-cols-1 mb-4 items-center">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
                      />
                    </svg>

                    <h5 className="ml-2 text-md font-bold tracking-tight text-gray-900">
                      ID Pengguna
                    </h5>
                  </div>
                  <p className="my-2 text-md">
                    Nomor identitas akun pasien Anda.
                  </p>
                </div>
                <div className="flex flex-nowrap items-center gap-x-4">
                  <input
                    type="text"
                    id="userId"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                    value={userId}
                    disabled
                  />
                  <CopyIDButton textToCopy={userId} />
                </div>
              </div>
            </div>

            {/* Nama Pengguna */}
            <div className="grid grid-cols-1 divide-y max-w-full w-full pb-0 bg-white border border-gray-200 rounded-xl shadow md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid grid-cols-1 mb-4 items-center">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12.72 2.03A9.991 9.991 0 0 0 2.03 12.72C2.39 18.01 7.01 22 12.31 22H16c.55 0 1-.45 1-1s-.45-1-1-1h-3.67c-3.73 0-7.15-2.42-8.08-6.03c-1.49-5.8 3.91-11.21 9.71-9.71C17.58 5.18 20 8.6 20 12.33v1.1c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57v-1.25c0-2.51-1.78-4.77-4.26-5.12a5.008 5.008 0 0 0-5.66 5.87a4.996 4.996 0 0 0 3.72 3.94c1.84.43 3.59-.16 4.74-1.33c.89 1.22 2.67 1.86 4.3 1.21c1.34-.53 2.16-1.9 2.16-3.34v-1.09c0-5.31-3.99-9.93-9.28-10.29zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3z"
                      />
                    </svg>
                    <h5 className="ml-2 text-md font-bold tracking-tight text-gray-900">
                      Nama Pengguna
                    </h5>
                  </div>
                  <p className="my-2 text-md">Nama pengguna akun Anda.</p>
                </div>
                <div>
                  <input
                    type="text"
                    id="username"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="Alif Maulidanar"
                    disabled
                  />
                </div>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
                >
                  Ganti Nama Pengguna
                </button>
              </div>
            </div>

            {/* EMAIL */}
            <div className="grid grid-cols-1 divide-y max-w-full w-full pb-0 bg-white border border-gray-200 rounded-xl shadow md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid grid-cols-1 mb-4 items-center">
                  <div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-6.54 4.09c-.65.41-1.47.41-2.12 0L4.4 8.25a.85.85 0 1 1 .9-1.44L12 11l6.7-4.19a.85.85 0 1 1 .9 1.44z"
                        />
                      </svg>
                      <h5 className="ml-2 text-md font-bold tracking-tight text-gray-900">
                        Email
                      </h5>
                    </div>
                    <p className="my-2 text-md">
                      Gunakan alamat email untuk masuk atau memulihkan akun.
                    </p>
                  </div>
                </div>
                <div>
                  <input
                    type="email"
                    id="userEmail"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="alifmaulidanr@gmail.com"
                    disabled
                  />
                </div>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
                >
                  Ganti Email
                </button>
              </div>
            </div>

            {/* NOMOR TELEPON */}
            <div className="grid grid-cols-1 divide-y max-w-full w-full pb-0 bg-white border border-gray-200 rounded-xl shadow md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid grid-cols-1 mb-4 items-center">
                  <div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>

                      <h5 className="ml-2 text-md font-bold tracking-tight text-gray-900">
                        Nomor Telepon
                      </h5>
                    </div>
                    <p className="my-2 text-md">
                      Cantumkan nomor telepon yang aktif.
                    </p>
                  </div>
                </div>
                <div>
                  <input
                    type="tel"
                    id="userPhone"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value="alifmaulidanr@gmail.com"
                    disabled
                  />
                </div>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
                >
                  Ganti Nomor Telepon
                </button>
              </div>
            </div>

            {/* CHANGE PASSWORD */}
            <div className="grid grid-cols-1 divide-y max-w-full w-full pb-0 bg-white border border-gray-200 rounded-xl shadow md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid grid-cols-1 mb-4 items-center">
                  <div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"
                        />
                      </svg>
                      <h5 className="ml-2 text-md font-bold tracking-tight text-gray-900">
                        Ganti Kata Sandi
                      </h5>
                    </div>
                    <p className="my-2">
                      Pastikan kata sandi terdiri atas setidaknya 8 karakter.
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="userOldPass"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Kata Sandi Lama
                  </label>
                  <input
                    type="password"
                    id="userOldPass"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="userNewPass"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    id="userNewPass"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPass"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="pass"
                    id="confirmPass"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                <div className="flex items-center mt-4">
                  <input
                    id="showPassCheckBox"
                    type="checkbox"
                    defaultValue=""
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor="showPassCheckBox"
                    className="ml-2 text-sm font-medium text-gray-900"
                  >
                    Tampilkan kata sandi
                  </label>
                </div>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
                >
                  Konfirmasi
                </button>
              </div>
            </div>

            {/* LOG OUT */}
            <div className="grid grid-cols-1 divide-y max-w-full w-full pb-0 bg-white border border-gray-200 rounded-xl shadow md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid grid-cols-1 items-center">
                  <div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M6 2h9a2 2 0 0 1 2 2v1a1 1 0 0 1-2 0V4H6v16h9v-1a1 1 0 0 1 2 0v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
                        />
                        <path
                          fill="currentColor"
                          d="M16.795 16.295c.39.39 1.02.39 1.41 0l3.588-3.588a1 1 0 0 0 0-1.414l-3.588-3.588a.999.999 0 0 0-1.411 1.411L18.67 11H10a1 1 0 0 0 0 2h8.67l-1.876 1.884a.999.999 0 0 0 .001 1.411z"
                        />
                      </svg>
                      <h5 className="ml-2 text-md font-bold tracking-tight text-gray-900">
                        Keluar
                      </h5>
                    </div>
                    <p className="mt-2">
                      Perintah ini akan mengeluarkan Anda dari akun. Anda perlu
                      Masuk kembali untuk menggunakan layanan ini.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                <Button type="primary" danger>
                  Keluar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientAccount;
