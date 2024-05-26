/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Button, Form, Input, Spin, Modal, Card, Alert, Segmented, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import React, { useState } from "react";
import { CONN } from "../../../../enum-global";

export default function SignUpFormPatient({ role }) {
  const [form] = useForm();
  const [spinning, setSpinning] = React.useState(false);
  const [open, setOpen] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Akun Baru");

  const showModal = () => setOpen(true);
  const hideModal = () => setOpen(false);
  const handleTabChange = (newTab) => { setSelectedTab(newTab) };

  const copyToClipboard = () => {
    const accountInfo = `Nomor DRM: ${accountData.dmrNumber}\nNomor RME: ${accountData.emrNumber}\nKata Sandi: ${accountData.password}\nPublic Key: ${accountData.publicKey}\nPrivate Key: ${accountData.privateKey}`;
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
    window.location.assign(`/patient/signin`);
  };

  const Tab = () => (
    <Segmented
      options={["Akun Baru", "Profil Baru"]}
      block
      value={selectedTab}
      onChange={handleTabChange}
    />
  );

  const [patientData, setPatientData] = useState({
    areaCode: "",
    dmrNumber: "",
    namaLengkap: "",
    nomorIdentitas: "",
    tempatLahir: "",
    tanggalLahir: "",
    namaIbu: "",
    gender: "",
    agama: "",
    suku: "",
    bahasa: "",
    golonganDarah: "",
    telpRumah: "",
    telpSelular: "",
    email: "",
    pendidikan: "",
    pekerjaan: "",
    pernikahan: "",
    alamat: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    pos: "",
    provinsi: "",
    negara: "",
    namaKerabat: "",
    nomorIdentitasKerabat: "",
    tanggalLahirKerabat: "",
    genderKerabat: "",
    telpKerabat: "",
    hubunganKerabat: "",
    alamatKerabat: "",
    rtKerabat: "",
    rwKerabat: "",
    kelurahanKerabat: "",
    kecamatanKerabat: "",
    kotaKerabat: "",
    posKerabat: "",
    provinsiKerabat: "",
    negaraKerabat: "",
    foto: null,
  });

  const getKelurahan = (areaCode) => {
    switch (areaCode) {
      case "1":
        return "Harapan Mulya";
      case "2":
        return "Medan Satria";
      case "3":
        return "Pejuang";
      case "4":
        return "Luar";
      default:
        return "";
    }
  };

  const getKelurahanByDMR = (dmrNumber) => {
    const fourthChar = dmrNumber[3];
    switch (fourthChar) {
      case "H":
        return "Harapan Mulya";
      case "M":
        return "Medan Satria";
      case "P":
        return "Pejuang";
      case "L":
        return "Luar";
      default:
        return "";
    }
  };

  const showLoader = () => setSpinning(true);
  const handleSubmit = async () => {
    showLoader();
    // event.preventDefault();
    let kelurahan = getKelurahan(patientData.areaCode);
    if (selectedTab === "Profil Baru") {
      kelurahan = getKelurahanByDMR(patientData.dmrNumber);
    }
    const formattedPatientData = {
      ...patientData,
      kelurahan,
    };

    if (selectedTab === "Akun Baru" && formattedPatientData.areaCode === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Wilayah tempat tinggal pasien harus diisi!",
      });
      setSpinning(false);
      return;
    }

    console.log({formattedPatientData});
    try {
      if (role) {
        let endpoint = `${CONN.BACKEND_LOCAL}/patient/register-account`;
        console.log("Submitting form for", selectedTab);
        if (selectedTab === "Profil Baru") {
          console.log("Submitting form for", selectedTab);
          endpoint = `${CONN.BACKEND_LOCAL}/patient/register-profile`;
          if (formattedPatientData.dmrNumber === "") {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Nomor DRM harus diisi untuk profil baru!",
            });
            setSpinning(false);
            return;
          }
        }
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedPatientData),
          });

          if (response.ok) {
            const data = await response.json();
            console.log(data.message, data);
            setSpinning(false);
            if (selectedTab === "Akun Baru") {
              Swal.fire({
                icon: "success",
                title: "Pendaftaran Akun Pasien Berhasil!",
                text: "Gunakan Nomor DRM dan Kata Sandi untuk melakukan Sign In.",
              }).then(() => {
                setAccountData({
                  dmrNumber: data.dmrNumber,
                  emrNumber: data.emrNumber,
                  password: data.password,
                  publicKey: data.publicKey,
                  privateKey: data.privateKey,
                });
                showModal();
                // window.location.assign(`/${role}/signin`);
              });
            }
            if (selectedTab === "Profil Baru") {
              Swal.fire({
                icon: "success",
                title: "Pendaftaran Profil Pasien Berhasil!",
                text: "Gunakan Nomor DRM dan Kata Sandi untuk melakukan Sign In.",
              }).then(() => {
                window.location.assign(`/${role}/signin`);
              });
            }
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
  };

  return (
    <div className="grid col-span-2 col-start-2 pt-12 pb-8 w-90 h-fit">
      <div className="px-12 py-8 bg-white border border-gray-200 rounded-lg shadow h-fit">
        <h1 className="mb-8 text-2xl font-semibold text-center text-gray-900">
          Pendaftaran Akun Pasien Baru
        </h1>
        <div className="col-span-2 pb-12">
          <Tab />
        </div>
        <Form
          form={form}
          className="grid grid-cols-1 gap-x-12 gap-y-6"
          onFinish={handleSubmit}
        >
          {selectedTab === "Akun Baru" && (
            <div className="grid mb-2">
              <label
                htmlFor="areaCode"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Pilih Wilayah Tempat Tinggal Pasien:
              </label>
              <select
                id="areaCode"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.areaCode}
                onChange={(e) =>
                  setPatientData({ ...patientData, areaCode: e.target.value })
                }
                required
              >
                <option value="">Pilih Wilayah</option>
                <option value="1">Harapan Mulya</option>
                <option value="2">Medan Satria</option>
                <option value="3">Pejuang</option>
                <option value="4">Luar</option>
              </select>
            </div>
          )}
          {selectedTab === "Profil Baru" && (
            <div className="grid mb-2">
              <label
                htmlFor="dmrNumber"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Dokumen Rekam Medis (DRM)
              </label>
              <Input
                type="text"
                id="dmrNumber"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor DMR"
                value={patientData.dmrNumber}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    dmrNumber: e.target.value,
                  })
                }
                required
              />
            </div>
          )}
          <div className="grid mb-2">
            <label
              htmlFor="namaLengkap"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Nama Lengkap
            </label>
            <Input
              type="text"
              id="namaLengkap"
              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Nama lengkap"
              value={patientData.namaLengkap}
              onChange={(e) =>
                setPatientData({
                  ...patientData,
                  namaLengkap: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="grid mb-2">
            <label
              htmlFor="nomorIdentitas"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Nomor Identitas (NIK, SIM, atau Paspor)
            </label>
            <Input
              type="text"
              id="nomorIdentitas"
              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Nomor identitas"
              value={patientData.nomorIdentitas}
              onChange={(e) =>
                setPatientData({
                  ...patientData,
                  nomorIdentitas: e.target.value,
                })
              }
              required
            />
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
              <p>Nomor DRM: {accountData?.dmrNumber}</p>
              <p>Nomor RME: {accountData?.emrNumber}</p>
              <p>Kata Sandi: {accountData?.password}</p>
              <p>Public Key: {accountData?.publicKey}</p>
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
    </div>
  );
}
