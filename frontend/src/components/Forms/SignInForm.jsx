import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Button, Form, Input, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import React, { useState, useCallback } from "react";
import { ethers } from "ethers";

export default function SignInForm({ role, resetLink, signupLink }) {
  const [form] = useForm();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [spinning, setSpinning] = React.useState(false);

  const showLoader = () => {
    setSpinning(true);
  };

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
          rpcUrls: ["http://127.0.0.1:7545"],
        },
      ]);

      const signer = provider.getSigner(selectedAccount);
      return signer;
    } catch (error) {
      console.error("Error setting up Web3Provider:", error);
    }
  }, []);

  // Lakukan validasi formulir
  const handleSubmit = async (values) => {
    if (window.ethereum) {
      try {
        const roleLowerCase = role.toLowerCase();

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

        let endpoint = "";
        if (roleLowerCase === "pasien") {
          endpoint = "http://localhost:3000/patient/signin";
        } else if (roleLowerCase === "dokter") {
          endpoint = "http://localhost:3000/doctor/signin";
        }

        // Include the signature in the req.body
        newPatient.signature = signature;

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

            if (response.ok) {
              const data = await response.json();
              console.log(data.message, data);
              setSpinning(false);
              Swal.fire({
                icon: "success",
                title: "Sign In Successful!",
              }).then(() => {
                if (roleLowerCase === "pasien") {
                  window.location.assign(
                    `/patient/${selectedAccount}/record-list`
                  );
                } else if (roleLowerCase === "dokter") {
                  window.location.assign(
                    `/doctor/${selectedAccount}/patient-list`
                  );
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
    <div className="col-start-2 col-span-2 h-fit">
      <div className="h-fit px-12 py-8 bg-white border border-gray-200 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Masuk sebagai {role}
        </h1>
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
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 text-center mt-4"
              onClick={showLoader}
            >
              Masuk
            </Button>
            <Spin spinning={spinning} fullscreen />
          </div>
        </Form>
        <div className="flex mt-8 justify-evenly items-center text-center">
          <div>
            <a href={resetLink}>
              <button
                type="submit"
                className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
              >
                Lupa Password
              </button>
            </a>
          </div>
          <div>
            <p className="text-l text-gray-900">atau</p>
          </div>
          <div>
            <a href={signupLink}>
              <button
                type="submit"
                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
              >
                Daftar Baru
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}