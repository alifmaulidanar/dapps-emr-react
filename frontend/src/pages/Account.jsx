import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Spin } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import NavbarController from "../components/Navbar/NavbarController";
import CopyIDButton from "../components/Buttons/CopyIDButton";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { CONN } from "../../../enum-global";
import getSigner from "../components/utils/getSigner";

export default function UserAccount({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const navigate = useNavigate();
  if (!token || !accountAddress) { window.location.assign(`/${role}/signin`) }

  const [form] = Form.useForm();
  const [fetchData, setFetchData] = useState([]);
  const [spinning, setSpinning] = React.useState(false);
  const [userAccountData, setUserAccountData] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const showLoader = () => { setSpinning(true) };

  useEffect(() => {
    if (token && accountAddress) {
      const fetchDataAsync = async () => {
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
          const { dmrNumber, accountUsername, accountNik } =
            data.ipfs.data;
          const formattedData = {
            dmrNumber: dmrNumber,
            address: accountAddress,
            username: accountUsername,
            nik: accountNik,
            // email: accountEmail,
            // phone: accountPhone,
          };
          setFetchData(formattedData);
          form.setFieldsValue(formattedData);
          setUserAccountData(data);
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error);
        }
      };
      fetchDataAsync();
    }
  }, [token, accountAddress, form]);

  const toggleEdit = () => setIsEditing(!isEditing);
  const handleCancel = () => {
    form.setFieldsValue(fetchData);
    setIsEditing(false);
  };

  const onFinish = async (values) => {
    showLoader();
    let dataToSend = values;

    if (!values.newPass && !values.confirmPass) {
      dataToSend.oldPass = null;
      dataToSend.newPass = null;
      dataToSend.confirmPass = null;
    }

    const signer = await getSigner();
    const signature = await signer.signMessage(JSON.stringify(dataToSend));
    dataToSend.signature = signature;
    console.log("Register Patient Profile Signature:", signature);
    console.log({ dataToSend });

    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/${role}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setSpinning(false);
        Swal.fire({
          icon: "success",
          title: "Informasi Akun Berhasil Diperbarui!",
        }).then((result) => {
          if (result.isConfirmed) {
            setIsEditModalOpen(false);
            window.location.reload();
          }
        });
      } else {
        const data = await response.json();
        setSpinning(false);
        Swal.fire({
          icon: "error",
          title: "Registrasi Gagal",
          text: data.error,
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      setSpinning(false);
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan saat melakukan registrasi",
        text: error,
      });
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
    case "doctor":
      type = 2;
      break;
    case "nurse":
      type = 3;
      break;
    case "staff":
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
            onFinish={onFinish}
          >
            {/* Address Pengguna */}
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
              {/* Nama Pengguna / Username */}
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
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: "Mohon isi nama pengguna" },
                  ]}
                >
                  <Input
                    type="text"
                    name="username"
                    className="bg-white-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </div>

              {/* password */}
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
                    type="password"
                    name="password"
                    placeholder="input password"
                    disabled={!isEditing}
                  />
                </Form.Item>
                <Form.Item
                  name="newPass"
                  label="Kata Sandi Baru"
                  className="mb-6"
                >
                  <Input.Password
                    type="password"
                    name="password"
                    placeholder="input password"
                    disabled={!isEditing}
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPass"
                  label="Konfirmasi Kata Sandi Baru"
                  className="mb-6"
                >
                  <Input.Password
                    type="password"
                    name="confirmPassword"
                    placeholder="input password"
                    disabled={!isEditing}
                  />
                </Form.Item>
              </div>

              {/* edit button */}
              <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
                <div className="flex gap-x-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleCancel} danger>
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="text-white bg-blue-600 blue-button"
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={toggleEdit}
                      type="primary"
                      className="text-white bg-blue-600 blue-button"
                    >
                      Edit Information
                    </Button>
                  )}
                </div>
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
