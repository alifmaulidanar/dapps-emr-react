import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Button, Form, Input, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import React, { useState, useCallback } from "react";
import { ethers } from "ethers";

export default function SignUpForm({ role }) {
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
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          confirmPassword: values.confirmPassword,
        };

        // Menandatangani data menggunakan signer
        const signer = await getSigner();
        const signature = await signer.signMessage(JSON.stringify(newPatient));
        newPatient.signature = signature;
        console.log("Signature:", signature);

        let endpoint = "";
        if (roleLowerCase === "pasien") {
          endpoint = "http://localhost:3000/patient/signup";
        } else if (roleLowerCase === "dokter") {
          endpoint = "http://localhost:3000/doctor/signup";
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
                title: "Registrasi Akun Berhasil!",
                text: "Gunakan Email dan Password untuk melakukan Sign In.",
              }).then(() => {
                if (roleLowerCase === "pasien") {
                  window.location.assign("/patient/signin");
                } else if (roleLowerCase === "dokter") {
                  window.location.assign("/doctor/signin");
                }
              });
            } else {
              const data = await response.json();
              console.log(data.error, data.message);
              setSpinning(false);
              Swal.fire({
                icon: "error",
                title: "Registrasi Gagal",
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
    <div className="grid col-span-2 col-start-2 pt-12 pb-8 w-90 h-fit">
      <div className="px-12 py-8 bg-white border border-gray-200 rounded-lg shadow h-fit">
        <h1 className="mb-8 text-2xl font-semibold text-center text-gray-900">
          Pendaftaran Akun {role}
        </h1>
        <Form
          form={form}
          className="grid grid-cols-1 gap-x-12"
          onFinish={handleSubmit}
        >
          <div className="grid mb-2">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Nama Pengguna
            </label>
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Harap isi Nama Pengguna.",
                },
              ]}
            >
              <Input
                type="text"
                name="username"
                placeholder="Nama Pengguna"
                className="border-gray-300 text-sm rounded-lg py-2 px-2.5"
              />
            </Form.Item>
          </div>
          <div className="grid mb-2">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Email
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
          <div className="grid mb-2">
            <label
              htmlFor="phone"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Nomor Telepon
            </label>
            <Form.Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Harap isi Nomor Telepon.",
                },
              ]}
            >
              <Input
                type="tel"
                name="phone"
                placeholder="Nomor Telepon"
                className="border-gray-300 text-sm rounded-lg py-2 px-2.5"
              />
            </Form.Item>
          </div>
          <div className="grid mb-2">
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
          <div className="grid mb-2">
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Konfirmasi Password
            </label>
            <Form.Item
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: "Harap konfirmasi password Anda.",
                },
              ]}
            >
              <Input.Password
                type="password"
                name="confirmPassword"
                placeholder="Konfirmasi Password"
                className="border-gray-300 text-sm rounded-lg py-1.5 px-2.5"
              />
            </Form.Item>
          </div>
          <div className="mx-auto">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full px-5 mt-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 sm:w-auto"
              onClick={showLoader}
            >
              Daftarkan Akun
            </Button>
            <Spin spinning={spinning} fullscreen />
          </div>
        </Form>
      </div>
    </div>
  );
}
