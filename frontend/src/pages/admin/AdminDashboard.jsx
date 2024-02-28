/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import "../../index.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import React, { useState, useEffect } from "react";
// prettier-ignore
import { Button, Form, Input, Table, Tag, Space, Select, Modal, Spin, Card, Alert, message, Dropdown, Menu } from "antd";
import {
  LogoutOutlined,
  EllipsisOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { CONN } from "../../../../enum-global";

export default function AdminDashboard() {
  const [form] = Form.useForm();
  const [editableForm] = Form.useForm();
  const token = sessionStorage.getItem("adminToken");
  const [fetchData, setFetchData] = useState([]);
  const [role, setRole] = useState("all");
  const [accountData, setAccountData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [spinning, setSpinning] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  if (!token) {
    window.location.assign("/admin/signin");
  }

  useEffect(() => {
    const fetchDataAsync = async () => {
      if (!token) {
        window.location.assign("/admin/signin");
        return;
      }
      setSpinning(true);
      try {
        const response = await fetch(
          `${CONN.BACKEND_LOCAL}/admin/dashboard?role=${role}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setFetchData(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setSpinning(false);
      }
    };
    fetchDataAsync();
  }, [role, token]);

  const showLoader = () => setSpinning(true);
  const showModal = () => setIsModalOpen(true);
  const hideModal = () => setFinishModalOpen(false);
  const showFinishModal = () => setFinishModalOpen(true);
  const handleOk = () => {
    setIsModalOpen(false);
    setCurrent(0);
  };

  const handleRoleChange = (value) => {
    setRole(value);
  };

  const copyToClipboard = () => {
    const accountInfo = `Role: ${accountData.role}\nUsername: ${accountData.username}\nEmail: ${accountData.email}\nPhone: ${accountData.phone}\nPassword: ${accountData.password}\nAddress: ${accountData.publicKey}\nPrivate Key: ${accountData.privateKey}`;
    navigator.clipboard.writeText(accountInfo).then(
      () => {
        setCopySuccess(true);
        message.success("Account information copied to clipboard!");
      },
      () => {
        message.error("Failed to copy account information.");
      }
    );
  };

  const onConfirmAndClose = () => {
    hideModal();
    window.location.reload();
  };

  // const testHandle = async (values) => {
  //   console.log(values);
  // };

  const handleSubmit = async (values) => {
    showLoader();
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/admin/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        setSpinning(false);
        Swal.fire({
          icon: "success",
          title: "Registrasi Akun Berhasil!",
          text: "Gunakan Email dan Password untuk melakukan Sign In.",
        }).then((result) => {
          if (result.isConfirmed) {
            setAccountData({
              role: data.role,
              username: data.username,
              email: data.email,
              phone: data.phone,
              password: data.password,
              publicKey: data.publicKey,
              privateKey: data.privateKey,
            });
            setIsModalOpen(false);
            showFinishModal();
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
        title: "Terjadi kesalahan saat melakukan registrasi",
        text: error,
      });
    }
  };

  const handleSubmitEdit = async (values) => {
    showLoader();
    const dataToSend = {
      address: values.address,
      username:
        values.username !== fetchData?.username ? values.username : null,
      email: values.email !== fetchData?.email ? values.email : null,
      phone: values.phone !== fetchData?.phone ? values.phone : null,
      oldPass: values.oldPass ? values.oldPass : null,
      newPass: values.newPass ? values.newPass : null,
      confirmPass: values.confirmPass ? values.confirmPass : null,
    };

    if (!values.newPass && !values.confirmPass) {
      delete dataToSend.oldPass;
      delete dataToSend.newPass;
      delete dataToSend.confirmPass;
    }

    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/admin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setSpinning(false);
        Swal.fire({
          icon: "success",
          title: "Informasi Akun Berhasil Diperbarui!",
          // text: "Gunakan Email dan Password untuk melakukan Sign In.",
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

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setCurrent(0);
  };

  const handleMenuClick = (record, e) => {
    editableForm.setFieldsValue(record);
    console.log("menu item clicked", e.key, record);
  };

  const dropdownMenu = (record) => (
    <Menu onClick={(e) => handleMenuClick(record, e)}>
      <Menu.Item key="edit" onClick={setIsEditModalOpen}>
        <div className="flex gap-x-2">
          <EditOutlined />
          <p>Edit</p>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" danger>
        <div className="flex gap-x-2">
          <DeleteOutlined />
          <p>Delete</p>
        </div>
      </Menu.Item>
    </Menu>
  );

  const adminName = "Admin";
  const columns = [
    {
      title: "No.",
      dataIndex: "key",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      key: "role",
      dataIndex: "role",
      render: (role) => {
        let color =
          {
            patient: "green",
            doctor: "blue",
            nurse: "gold",
            staff: "volcano",
          }[role] || "cyan";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (created) => new Date(created).toLocaleString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Dropdown overlay={dropdownMenu(record)} trigger={["click"]}>
            <Button icon={<EllipsisOutlined />}></Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const extras = [
    {
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          1st menu item
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.aliyun.com"
        >
          2nd menu item
        </a>
      ),
      key: "1",
    },
    {
      type: "divider",
    },
    {
      label: "3rd menu item（disabled）",
      key: "3",
      disabled: true,
    },
  ];

  const handleLogout = () => {
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin keluar? Anda akan dikembalikan ke halaman masuk."
    );
    if (isConfirmed) {
      sessionStorage.removeItem("adminToken");
      window.location.assign("/admin/signin");
    }
  };

  return (
    <>
      <div className="grid justify-center w-9/12 max-h-screen grid-cols-1 px-4 py-24 mx-auto">
        <div className="grid gap-y-8">
          <div className="flex items-stretch justify-between">
            <h1 className="text-2xl font-bold">Halo, {adminName}</h1>
            <Button
              type="primary"
              danger
              className="red-button w-fit"
              onClick={handleLogout}
            >
              <div className="flex gap-x-2">
                Logout <LogoutOutlined />
              </div>
            </Button>
          </div>
          <div className="flex justify-between">
            <div className="justify-self-start">
              <Button type="default" onClick={showModal}>
                Add New
              </Button>
            </div>
            {/* <div>
              <Search
                placeholder="input search text"
                // onSearch={onSearch}
                style={{
                  width: 200,
                }}
              />
            </div> */}

            {/* Tampilkan berdasarkan role */}
            <div className="justify-self-end w-[150px]">
              <Select
                defaultValue="all"
                onChange={handleRoleChange}
                options={[
                  { value: "all", label: "Semua role" },
                  { value: "patient", label: "Pasien" },
                  { value: "doctor", label: "Dokter" },
                  { value: "nurse", label: "Perawat" },
                  { value: "staff", label: "Staf" },
                ]}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={fetchData}
            rowKey="address"
            loading={spinning}
            size="middle"
          />
        </div>
        <Modal
          // title="Daftarkan Akun Baru"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
          width={700}
        >
          <div className="grid w-full">
            <h3 className="mx-auto my-8 text-xl font-bold">
              Daftarkan Akun Baru
            </h3>
            <Form
              form={form}
              className="grid grid-cols-1 gap-x-12"
              onFinish={handleSubmit}
            >
              <div className="grid mb-2">
                <label
                  htmlFor="role"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Role
                </label>
                <Form.Item
                  name="role"
                  rules={[
                    {
                      required: true,
                      message: "Harap pilih role.",
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih Role"
                    options={[
                      {
                        value: "patient",
                        label: "Pasien",
                      },
                      {
                        value: "doctor",
                        label: "Dokter",
                      },
                      {
                        value: "nurse",
                        label: "Perawat",
                      },
                      {
                        value: "staff",
                        label: "Staf",
                      },
                    ]}
                  />
                </Form.Item>
              </div>
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
          </div>
        </Modal>
        <Modal
          title="Simpan data akun Anda"
          centered
          open={finishModalOpen}
          onOk={hideModal}
          width={700}
          footer={[
            <div className="flex flex-col items-center pt-4 gap-y-4">
              <Button
                type="default"
                key="copy"
                onClick={copyToClipboard}
                className="flex items-stretch justify-center w-1/2 gap-x-2"
                disabled={!accountData}
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
            <Card className="w-full">
              <p>Role: {accountData?.role}</p>
              <p>Username: {accountData?.username}</p>
              <p>Email: {accountData?.email}</p>
              <p>Phone: {accountData?.phone}</p>
              <p>Password: {accountData?.password}</p>
              <p>Address: {accountData?.publicKey}</p>
              <p>Private Key: {accountData?.privateKey}</p>
            </Card>
            <Alert
              message="Private Key akan digunakan untuk konfirmasi saat Sign In menggunakan e-wallet MetaMask"
              type="warning"
            />
            <Alert
              message="Jangan berikan Private Key ke orang lain"
              type="error"
            />
          </div>
        </Modal>
        <Modal
          // title="Daftarkan Akun Baru"
          centered
          open={isEditModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
          width={700}
        >
          <div className="grid w-full">
            <h3 className="mx-auto my-8 text-xl font-bold">
              Edit Informasi Akun
            </h3>
            <Form
              form={editableForm}
              className="grid grid-cols-1 gap-x-12"
              onFinish={handleSubmitEdit}
            >
              <div className="grid mb-2">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Alamat E-Wallet
                </label>
                <Form.Item name="address">
                  <Input
                    disabled
                    type="text"
                    className="border-gray-300 text-sm rounded-lg py-2 px-2.5"
                  />
                </Form.Item>
              </div>
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
                  Kata Sandi Lama
                </label>
                <Form.Item
                  name="oldPass"
                  rules={[
                    {
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
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Kata Sandi Baru
                </label>
                <Form.Item
                  name="newPass"
                  rules={[
                    {
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
                  Konfirmasi Kata Sandi Baru
                </label>
                <Form.Item
                  name="confirmPass"
                  rules={[
                    {
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
                  className="w-full px-5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 sm:w-auto"
                >
                  Simpan Perubahan
                </Button>
                <Spin spinning={spinning} fullscreen />
              </div>
            </Form>
          </div>
        </Modal>
        <Modal
          title="Simpan data akun Anda"
          centered
          open={finishModalOpen}
          onOk={hideModal}
          width={700}
          footer={[
            <div className="flex flex-col items-center pt-4 gap-y-4">
              <Button
                type="default"
                key="copy"
                onClick={copyToClipboard}
                className="flex items-stretch justify-center w-1/2 gap-x-2"
                disabled={!accountData}
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
            <Card className="w-full">
              <p>Role: {accountData?.role}</p>
              <p>Username: {accountData?.username}</p>
              <p>Email: {accountData?.email}</p>
              <p>Phone: {accountData?.phone}</p>
              <p>Password: {accountData?.password}</p>
              <p>Address: {accountData?.publicKey}</p>
              <p>Private Key: {accountData?.privateKey}</p>
            </Card>
            <Alert
              message="Private Key akan digunakan untuk konfirmasi saat Sign In menggunakan e-wallet MetaMask"
              type="warning"
            />
            <Alert
              message="Jangan berikan Private Key ke orang lain"
              type="error"
            />
          </div>
        </Modal>
      </div>
    </>
  );
}
