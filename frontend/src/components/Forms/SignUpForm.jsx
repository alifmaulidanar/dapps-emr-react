import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Button, Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useState } from "react";

export default function SignUpForm({ role }) {
  const [form] = useForm();
  const [accountAddress, setaccountAddress] = useState(null);

  // Lakukan validasi formulir
  const handleSubmit = async (values) => {
    if (window.ethereum) {
      try {
        // Mendapatkan alamat wallet Ethereum dari Metamask
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setaccountAddress(accounts[0]); // Set alamat wallet ke state

        // Buat objek data pasien dari formulir
        const newPatient = {
          accountAddress: accounts[0],
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          confirmPassword: values.confirmPassword,
          role: role,
        };

        let endpoint = "";
        if (role === "Pasien") {
          endpoint = "http://localhost:3000/patient/signup";
        } else if (role === "Dokter") {
          endpoint = "http://localhost:3000/doctor/signup";
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

            if (response.ok) {
              const data = await response.json();
              console.log(data.message, data);
              Swal.fire({
                icon: "success",
                title: "Registrasi Akun Berhasil!",
                text: "Gunakan Email dan Password untuk melakukan Sign In.",
              });
            } else {
              const data = await response.json();
              console.log(data.error, data.message);
              Swal.fire({
                icon: "error",
                title: "Registrasi Gagal",
                text: data.error,
              });
            }
          } catch (error) {
            console.error("Terjadi kesalahan:", error);
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Terjadi kesalahan saat melakukan registrasi. Silakan coba lagi!",
            });
          }
        } else {
          console.error("Role tidak valid");
        }
      } catch (error) {
        console.error(error);
        setaccountAddress(null);
      }
    } else {
      console.error("Metamask not detected");
      setaccountAddress(null);
    }
  };

  return (
    <div className="w-90 h-fit grid col-start-2 col-span-2 pt-12 pb-8">
      <div className="h-fit px-12 py-8 bg-white border border-gray-200 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
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
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 text-center mt-4"
            >
              Daftarkan Akun
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
