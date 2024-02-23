import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Spin } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import NavbarController from "../components/Navbar/NavbarController";
import CopyIDButton from "../components/Buttons/CopyIDButton";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { CONN } from "../../../enum-global";

export default function UserAccount({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const navigate = useNavigate();

  if (!token || !accountAddress) {
    window.location.assign(`/${role}/signin`);
  }

  const [form] = Form.useForm();
  const [initialData, setInitialData] = useState({});
  const [spinning, setSpinning] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [userAccountData, setUserAccountData] = useState({});
  const [isEditing, setIsEditing] = useState({
    username: false,
    email: false,
    phone: false,
    password: false,
  });

  const showLoader = () => {
    setSpinning(true);
  };

  // Connect MetaMask to Ganache lokal
  const getSigner = useCallback(async () => {
    const win = window;
    if (!win.ethereum) {
      console.error("Metamask not detected");
      return;
    }

    try {
      const accounts = await win.ethereum.request({
        method: "eth_requestAccounts",
      });
      const selectedAccount = accounts[0];
      setSelectedAccount(selectedAccount);
      console.log(selectedAccount);

      const provider = new ethers.providers.Web3Provider(win.ethereum);
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: "0x539",
          chainName: "Ganache",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
          },
          rpcUrls: [CONN.GANACHE_LOCAL],
        },
      ]);

      const signer = provider.getSigner(selectedAccount);
      return signer;
    } catch (error) {
      console.error("Error setting up Web3Provider:", error);
    }
  }, []);

  useEffect(() => {
    if (token && accountAddress) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${CONN.BACKEND_LOCAL}/${role}/account`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          const data = await response.json();
          const { accountUsername, accountEmail, accountPhone } =
            data.ipfs.data;
          const formattedData = {
            address: accountAddress,
            username: accountUsername,
            email: accountEmail,
            phone: accountPhone,
          };
          setInitialData(formattedData);
          form.setFieldsValue(formattedData);
          setUserAccountData(data);
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error);
        }
      };
      fetchData();
    }
  }, [token, accountAddress, form]);

  const handleEditClick = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleCancelClick = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    form.setFieldsValue({ [field]: initialData[field] });
  };

  const handleSaveClick = async (field) => {
    showLoader();
    if (window.ethereum) {
      try {
        const value = await form.getFieldValue(field);

        let errorMessage;
        if (!value.trim()) {
          switch (field) {
            case "username":
              errorMessage = "Nama pengguna tidak boleh kosong";
              break;
            case "email":
              errorMessage = "Email tidak boleh kosong";
              break;
            case "phone":
              errorMessage = "Nomor telepon tidak boleh kosong";
              break;
            default:
              errorMessage = "Field tidak boleh kosong";
          }

          setSpinning(false);
          Swal.fire({
            icon: "error",
            title: "Pembaruan Gagal",
            text: errorMessage,
          });
          return;
        }

        const dataToSign = JSON.stringify({
          field,
          value,
        });
        const signer = await getSigner();
        const signature = await signer.signMessage(dataToSign);
        const updatedData = {
          field,
          value,
          signature,
        };

        const response = await fetch(
          `${CONN.BACKEND_LOCAL}/${role}/update-${field}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(updatedData),
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          console.log({ responseData });
          setSpinning(false);
          Swal.fire({
            icon: "success",
            title: "Profil Pasien Berhasil Diperbarui!",
            text: "Periksa kembali informasi profil Anda.",
          }).then(() => {
            window.location.reload();
          });
        } else {
          console.log(responseData.error, responseData.message);
          setSpinning(false);
          Swal.fire({
            icon: "error",
            title: "Pembaruan Profil Pasien Gagal",
            text: responseData.error,
          }).then(() => {
            window.location.reload();
          });
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
        setSpinning(false);
        Swal.fire({
          icon: "error",
          title: "Terjadi kesalahan saat melakukan pembaruan profil",
          text: error,
        });
      }
    }
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleChangePassword = async () => {
    const oldPassword = await form.getFieldValue("oldPass");
    const newPassword = await form.getFieldValue("newPass");
    const confirmPassword = await form.getFieldValue("confirmPass");

    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan Input",
        text: "Tidak boleh ada kolom yang kosong",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Kata Sandi Tidak Cocok",
        text: "Kata sandi baru dan konfirmasi kata sandi harus sama!",
      });
      return;
    }

    showLoader();
    try {
      const dataToSign = JSON.stringify({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      const signer = await getSigner();
      const signature = await signer.signMessage(dataToSign);

      const updatedData = {
        oldPassword,
        newPassword,
        confirmPassword,
        signature,
      };

      const response = await fetch(
        `${CONN.BACKEND_LOCAL}/${role}/update-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setSpinning(false);
        Swal.fire({
          icon: "success",
          title: "Kata Sandi Berhasil Diperbarui!",
          text: "Kata sandi Anda telah berhasil diperbarui.",
        }).then(() => {
          window.location.reload();
        });
      } else {
        setSpinning(false);
        Swal.fire({
          icon: "error",
          title: "Gagal Memperbarui Kata Sandi",
          text:
            responseData.error ||
            "Terjadi kesalahan saat memperbarui kata sandi.",
        });
      }
    } catch (error) {
      setSpinning(false);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error.toString(),
      });
      console.error("Terjadi kesalahan:", error);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Apakah Anda yakin ingin keluar?",
      text: "Anda akan dikembalikan ke halaman masuk.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, keluar!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("userToken");
        sessionStorage.removeItem("accountAddress");
        navigate(`/${role}/signin`, { replace: true });
        Swal.fire("Logged Out!", "Anda telah berhasil keluar.", "success");
      }
    });
  };

  let type;
  switch (role) {
    case "patient":
      type = 1;
      break;
    case "staff":
      type = 2;
      break;
    case "nurse":
      type = 3;
      break;
    case "doctor":
      type = 4;
      break;
  }

  return (
    <>
      <NavbarController
        type={type}
        page={`${role}-account`}
        color="blue"
        accountAddress={accountAddress}
      />
      <div className="grid justify-center w-9/12 min-h-screen grid-cols-7 px-4 py-24 mx-auto">
        <div className="col-span-3 col-start-3">
          <Form
            form={form}
            layout="vertical"
            className="grid items-center max-w-4xl grid-cols-1 mx-auto rounded gap-y-8 h-fit"
          >
            {/* ID Pengguna */}
            <div className="grid w-full max-w-full grid-cols-1 pb-0 bg-white border border-gray-200 divide-y shadow rounded-xl md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid items-center grid-cols-1 mb-4">
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

                    <h5 className="ml-2 font-bold tracking-tight text-gray-900 text-md">
                      Alamat <span className="italic">E-Wallet</span>
                    </h5>
                  </div>
                  <p className="my-2 text-md">
                    Alamat akun <span className="italic">e-wallet</span> Anda.
                  </p>
                </div>
                <Form.Item name="address">
                  <div className="flex items-center gap-x-2">
                    <Input
                      id="accountAddress"
                      className="flex-1 bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                      disabled
                      value={accountAddress}
                    />
                    <CopyIDButton textToCopy={accountAddress} />
                  </div>
                </Form.Item>
              </div>
            </div>

            {/* Nama Pengguna */}
            <div className="grid w-full max-w-full grid-cols-1 pb-0 bg-white border border-gray-200 divide-y shadow rounded-xl md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid items-center grid-cols-1 mb-4">
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
                    <h5 className="ml-2 font-bold tracking-tight text-gray-900 text-md">
                      Nama Pengguna
                    </h5>
                  </div>
                  <p className="my-2 text-md">Nama pengguna akun Anda.</p>
                </div>
                <Form.Item name="username">
                  <Input
                    id="username"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    disabled={!isEditing.username}
                  />
                </Form.Item>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                {isEditing.username ? (
                  <div className="flex gap-x-4">
                    <Button
                      danger
                      onClick={() => handleCancelClick("username")}
                    >
                      Batal
                    </Button>
                    <Button
                      type="primary"
                      ghost
                      onClick={() => handleSaveClick("username")}
                    >
                      Simpan
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    className="text-white bg-blue-600 blue-button"
                    onClick={() => handleEditClick("username")}
                  >
                    Ganti Nama Pengguna
                  </Button>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className="grid w-full max-w-full grid-cols-1 pb-0 bg-white border border-gray-200 divide-y shadow rounded-xl md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid items-center grid-cols-1 mb-4">
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
                      <h5 className="ml-2 font-bold tracking-tight text-gray-900 text-md">
                        Email
                      </h5>
                    </div>
                    <p className="my-2 text-md">
                      Alamat email yang terdaftar untuk akun Anda.
                    </p>
                  </div>
                </div>
                <Form.Item name="email">
                  <Input
                    id="userEmail"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    disabled={!isEditing.email}
                  />
                </Form.Item>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                {isEditing.email ? (
                  <div className="flex gap-x-4">
                    <Button danger onClick={() => handleCancelClick("email")}>
                      Batal
                    </Button>
                    <Button
                      type="primary"
                      ghost
                      onClick={() => handleSaveClick("email")}
                    >
                      Simpan
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    className="text-white bg-blue-600 blue-button"
                    onClick={() => handleEditClick("email")}
                  >
                    Ganti Email
                  </Button>
                )}
              </div>
            </div>

            {/* NOMOR TELEPON */}
            <div className="grid w-full max-w-full grid-cols-1 pb-0 bg-white border border-gray-200 divide-y shadow rounded-xl md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid items-center grid-cols-1 mb-4">
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

                      <h5 className="ml-2 font-bold tracking-tight text-gray-900 text-md">
                        Nomor Telepon
                      </h5>
                    </div>
                    <p className="my-2 text-md">
                      Nomor telepon yang terdaftar untuk akun Anda.
                    </p>
                  </div>
                </div>
                <Form.Item name="phone">
                  <Input
                    id="userPhone"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    disabled={!isEditing.phone}
                  />
                </Form.Item>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                {isEditing.phone ? (
                  <div className="flex gap-x-4">
                    <Button danger onClick={() => handleCancelClick("phone")}>
                      Batal
                    </Button>
                    <Button
                      type="primary"
                      ghost
                      onClick={() => handleSaveClick("phone")}
                    >
                      Simpan
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    className="text-white bg-blue-600 blue-button"
                    onClick={() => handleEditClick("phone")}
                  >
                    Ganti Nomor Telepon
                  </Button>
                )}
              </div>
            </div>

            {/* CHANGE PASSWORD */}
            <div className="grid w-full max-w-full grid-cols-1 pb-0 bg-white border border-gray-200 divide-y shadow rounded-xl md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid items-center grid-cols-1 mb-4">
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
                      <h5 className="ml-2 font-bold tracking-tight text-gray-900 text-md">
                        Ganti Kata Sandi
                      </h5>
                    </div>
                    <p className="my-2">
                      Pastikan kata sandi terdiri atas setidaknya 8 karakter.
                    </p>
                  </div>
                </div>
                <Form.Item
                  name="oldPass"
                  label="Kata Sandi Lama"
                  className="mb-6"
                >
                  <Input.Password
                    id="userOldPass"
                    placeholder="input password"
                  />
                </Form.Item>
                <Form.Item
                  name="newPass"
                  label="Kata Sandi Baru"
                  className="mb-6"
                >
                  <Input.Password
                    id="userNewPass"
                    placeholder="input password"
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPass"
                  label="Konfirmasi Kata Sandi Baru"
                  className="mb-6"
                >
                  <Input.Password
                    id="confirmPass"
                    placeholder="input password"
                  />
                </Form.Item>
              </div>
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                <Button
                  type="primary"
                  className="text-white bg-blue-600 blue-button"
                  onClick={handleChangePassword}
                >
                  Konfirmasi
                </Button>
              </div>
            </div>

            {/* LOG OUT */}
            <div className="grid w-full max-w-full grid-cols-1 pb-0 bg-white border border-gray-200 divide-y shadow rounded-xl md:min-h-full md:max-w-full">
              <div className="p-8">
                <div className="grid items-center grid-cols-1">
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
                      <h5 className="ml-2 font-bold tracking-tight text-gray-900 text-md">
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
                <Button
                  type="primary"
                  danger
                  className="red-button"
                  onClick={handleLogout}
                >
                  <div className="flex gap-x-2">
                    Keluar <LogoutOutlined />
                  </div>
                </Button>
              </div>
            </div>
            <Spin spinning={spinning} fullscreen />
          </Form>
        </div>
      </div>
    </>
  );
}
