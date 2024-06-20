import React from "react";
import { Button, Form, Input, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import { CONN } from "../../../../enum-global";
import getSigner from "../utils/getSigner";

export default function AdminSignIn() {
  const [form] = useForm();
  const [spinning, setSpinning] = React.useState(false);
  const showLoader = () => { setSpinning(true) };

  const handleSubmit = async (values) => {
    showLoader();
    if (window.ethereum) {
      try {
        if (!values) {
          setSpinning(false);
          console.error("Form data tidak ditemukan");
          return;
        }
        const admin = {
          username: values.username,
          password: values.password,
        };
        const signer = await getSigner();
        const signature = await signer.signMessage(JSON.stringify(admin));
        admin.signature = signature;
        try {
          const response = await fetch(`${CONN.BACKEND_LOCAL}/admin/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(admin),
          });

          if (response.ok) {
            const data = await response.json();
            // console.log(data.message, data);
            sessionStorage.setItem("adminToken", data.token);
            sessionStorage.setItem("accountAddress", data.accountAddress);
            setSpinning(false);
            // console.log("Sign In Successful!");
            window.location.assign(`/admin/dashboard`);
          } else {
            const data = await response.json();
            console.log(data.error, data.message);
            setSpinning(false);
          }
        } catch (error) {
          console.error("Terjadi kesalahan:", error);
          setSpinning(false);
        }
      } catch (error) {
        console.error(error);
        setSpinning(false);
      }
    }
  };

  return (
    <div className="col-span-2 col-start-2 h-fit">
      <div className="px-12 py-8 bg-white border border-gray-200 rounded-lg shadow h-fit">
        <h1 className="pb-8 text-2xl font-semibold text-center text-gray-900">
          Login Admin
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
              Username
            </label>
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Harap isi username.",
                },
              ]}
            >
              <Input
                type="text"
                name="username"
                placeholder="Username"
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
      </div>
    </div>
  );
}
