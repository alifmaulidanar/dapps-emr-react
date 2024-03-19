import MetaConnect from "../Buttons/MetaMaskButton";
import InstallMetaMask from "../Buttons/InstallMetaMask";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Button, Form, Input, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import React, { useState, useCallback } from "react";
import { ethers } from "ethers";
import { CONN } from "../../../../enum-global";

export default function SignInForm({ role, resetLink, signupLink }) {
  const [form] = useForm();
  const [spinning, setSpinning] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  let displayRole;
  switch (role) {
    case "patient":
      displayRole = "Pasien";
      break;
    case "doctor":
      displayRole = "Dokter";
      break;
    case "staff":
      displayRole = "Staff";
      break;
    case "nurse":
      displayRole = "Perawat";
      break;
  }

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

  // Connect MetaMask to Ganache VPS
  // const getSigner = useCallback(async () => {
  //   const win = window;
  //   if (!win.ethereum) {
  //     console.error("Metamask not detected");
  //     return;
  //   }

  //   try {
  //     await win.ethereum.request({ method: "eth_requestAccounts" });
  //     const provider = new ethers.providers.Web3Provider(win.ethereum);
  //     const signer = provider.getSigner();
  //     return signer;
  //   } catch (error) {
  //     console.error("Error setting up Web3Provider:", error);
  //   }
  // }, []);

  // Lakukan validasi formulir
  const handleSubmit = async (values) => {
    showLoader();
    if (window.ethereum) {
      try {
        if (!values) {
          setSpinning(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Email dan password harus diisi!",
          });
          return;
        }

        // Buat objek data pasien dari formulir
        const newPatient = {
          email: values.email,
          password: values.password,
        };

        // Menandatangani data menggunakan signer
        const signer = await getSigner();
        const signature = await signer.signMessage(JSON.stringify(newPatient));
        newPatient.signature = signature;
        console.log("Signature:", signature);
        newPatient.signature = signature;

        // Kirim permintaan POST ke endpoint yang sesuai
        if (role) {
          try {
            const response = await fetch(
              `${CONN.BACKEND_LOCAL}/${role}/signin`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newPatient),
              }
            );

            if (response.ok) {
              const data = await response.json();
              const accountAddress = data.account.accountAddress;

              console.log(data.message, data);
              sessionStorage.setItem("userToken", data.token);
              sessionStorage.setItem("accountAddress", accountAddress);
              setSpinning(false);
              Swal.fire({
                icon: "success",
                title: "Sign In Successful!",
              }).then(() => {
                // nanti mendingan samain first page setiap role, misalnya, home atau dashboard
                if (role === "patient") {
                  window.location.assign(`/patient/record-list`);
                } else if (role === "staff") {
                  window.location.assign(`/staff/patient-list`);
                } else if (role === "doctor") {
                  window.location.assign(`/doctor/patient-list`);
                } else if (role === "nurse") {
                  window.location.assign(`/nurse/patient-list`);
                }
              });
            } else {
              const data = await response.json();
              console.log(data.error, data.message);
              setSpinning(false);
              Swal.fire({
                icon: "error",
                title: "Sign In Failed",
                text: data.error,
              });
            }
          } catch (error) {
            console.error("Terjadi kesalahan:", error);
            setSpinning(false);
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Terjadi kesalahan saat melakukan registrasi. Silakan coba lagi!",
            });
          }
        } else {
          console.error("Role tidak valid");
          setSpinning(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Role tidak valid. Silakan coba lagi!",
          });
        }
      } catch (error) {
        console.error(error);
        setSpinning(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Pendaftaran telah dibatalkan.",
        });
      }
    } else {
      console.error("Metamask not detected");
      setSpinning(false);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Metamask tidak terdeteksi. Tolong pasang MetaMask terlebih dahulu!",
      });
    }
  };

  return (
    <div className="col-span-2 col-start-2 h-fit">
      <div className="px-12 py-8 bg-white border border-gray-200 rounded-lg shadow h-fit">
        <h1 className="text-2xl font-semibold text-center text-gray-900">
          Masuk sebagai {displayRole}
        </h1>
        <div className="flex justify-center w-full my-8 gap-x-2">
          <InstallMetaMask />
          <MetaConnect />
        </div>
        <Form
          form={form}
          className="grid grid-cols-1 gap-x-12"
          onFinish={handleSubmit}
        >
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Alamat Email
            </label>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Harap isi Email.",
                },
              ]}
            >
              <Input
                type="email"
                name="email"
                placeholder="Email"
                className="border-gray-300 text-sm rounded-lg py-2 px-2.5"
              />
            </Form.Item>
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Harap isi password Anda.",
                },
              ]}
            >
              <Input.Password
                type="password"
                name="password"
                placeholder="Password"
                className="border-gray-300 text-sm rounded-lg py-1.5 px-2.5"
              />
            </Form.Item>
          </div>
          <div className="text-right">
            <Button
              type="primary"
              htmlType="submit"
              className="px-6 mr-3 text-sm font-medium text-center text-white bg-blue-600 blue-button hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 md:mr-0"
            >
              Masuk
            </Button>
            <Spin spinning={spinning} fullscreen />
          </div>
        </Form>
        <div className="flex items-center mt-8 text-center justify-evenly">
          <div>
            <a href={resetLink}>
              <Button type="primary" danger className="font-medium red-button">
                Lupa Password
              </Button>
            </a>
          </div>
          <div>
            <p className="text-gray-900 text-l">atau</p>
          </div>
          <div>
            <a href={signupLink}>
              <Button
                type="primary"
                className="px-6 mr-3 text-sm font-medium text-center text-white bg-blue-600 blue-button hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 md:mr-0"
              >
                Daftar Baru
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
