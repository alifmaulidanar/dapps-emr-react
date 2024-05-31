/* eslint-disable react/jsx-key */
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Button, Form, Input, Spin, Modal } from "antd";
const { TextArea } = Input;
import { useForm } from "antd/lib/form/Form";
import React, { useState } from "react";
import { CONN } from "../../../../enum-global";
import getSigner from "../../components/utils/getSigner";

export default function SignUpForm({ role }) {
  const [form] = useForm();
  const [spinning, setSpinning] = React.useState(false);
  const [open, setOpen] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const showModal = () => setOpen(true);
  const hideModal = () => setOpen(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(document.getElementById("accountData").value);
    setCopySuccess(true); // Aktifkan tombol 'Oke, sudah disimpan!'
  };

  const onConfirmAndClose = () => {
    hideModal();
    window.location.assign(`/${role}/signin`);
  };

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

  const handleSubmit = async (values) => {
    showLoader();
    // if (window.ethereum) {
    try {
      // const newPatient = {
      //   username: values.username,
      //   email: values.email,
      //   phone: values.phone,
      //   password: values.password,
      //   confirmPassword: values.confirmPassword,
      // };

      // Menandatangani data
      // const signer = await getSigner();
      // const signature = await signer.signMessage(JSON.stringify(newPatient));
      // newPatient.signature = signature;
      // console.log("Signature:", signature);
      // newPatient.signature = signature;

      // console.log({ newPatient });

      if (role) {
        try {
          const response = await fetch(`${CONN.BACKEND_LOCAL}/${role}/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });

          if (response.ok) {
            const data = await response.json();
            console.log(data.message, data);
            setSpinning(false);
            Swal.fire({
              icon: "success",
              title: "Registrasi Akun Berhasil!",
              text: "Gunakan Email dan Password untuk melakukan Sign In.",
            }).then((result) => {
              if (result.isConfirmed) {
                setAccountData(
                  `Email: ${data.email}\nAddress: ${data.publicKey}\nPrivate Key: ${data.privateKey}`
                );
                showModal();
              }
              // window.location.assign(`/${role}/signin`);
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
            title: "Terjadi kesalahan saat melakukan registrasi",
            text: error,
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
    // } else {
    //   console.error("Metamask not detected");
    //   setSpinning(false);
    //   Swal.fire({
    //     icon: "error",
    //     title: "Oops...",
    //     text: "Metamask tidak terdeteksi. Tolong pasang MetaMask terlebih dahulu!",
    //   });
    // }
  };

  return (
    <div className="grid col-span-2 col-start-2 pt-12 pb-8 w-90 h-fit">
      <div className="px-12 py-8 bg-white border border-gray-200 rounded-lg shadow h-fit">
        <h1 className="mb-8 text-2xl font-semibold text-center text-gray-900">
          Pendaftaran Akun {displayRole}
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
            >
              Daftarkan Akun
            </Button>
            <Spin spinning={spinning} fullscreen />
          </div>
        </Form>
        <Modal
          title="Simpan data akun Anda"
          centered
          open={open}
          onOk={hideModal}
          width={650}
          footer={[
            <div className="flex flex-col items-center pt-4 gap-y-4">
              <Button
                type="default"
                key="copy"
                onClick={copyToClipboard}
                className="flex items-stretch justify-center w-1/2 gap-x-2"
              >
                <p>Salin informasi akun</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </Button>
              <Button
                key="submit"
                type="primary"
                disabled={!copySuccess}
                className="w-1/2 text-white bg-blue-600"
                onClick={onConfirmAndClose}
              >
                Oke, sudah disimpan!
              </Button>
            </div>,
          ]}
        >
          <div className="grid gap-y-4">
            <p>
              Salin dan simpan data akun Anda berikut ini di tempat yang aman
              dan mudah diakses.
            </p>
            <TextArea
              id="accountData"
              value={accountData}
              disabled
              style={{
                height: 80,
                resize: "none",
              }}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}
