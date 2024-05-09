/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import React, { useState, useCallback } from "react";
import { DatePicker, Modal, Button, Spin, Segmented, Alert, Card, message } from "antd";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { CONN } from "../../../../enum-global";

export default function RegisterPatientButton({ buttonText }) {
  const token = sessionStorage.getItem("userToken");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [spinning, setSpinning] = React.useState(false);
  const [selectedTab, setSelectedTab] = useState("Akun Baru");
  const [finishModalOpen, setFinishModalOpen] = useState(false);

  const showLoader = () => { setSpinning(true) };
  const showModal = () => { setIsModalOpen(true) };
  const handleOk = () => { setIsModalOpen(false) };
  const handleCancel = () => { setIsModalOpen(false) };
  const hideModal = () => setFinishModalOpen(false);
  const showFinishModal = () => setFinishModalOpen(true);
  const handleTabChange = (newTab) => { setSelectedTab(newTab) };
  const dateFormat = "YYYY-MM-DD";
  const customFormat = (value) => `${value.format(dateFormat)}`;

  const copyToClipboard = () => {
    const accountInfo = `Nomor EMR: ${accountData.emrNumber}\nNo. Dok. RM: ${accountData.dmrNumber}\nNomor Identitas (NIK): ${accountData.nomorIdentitas}\nUsername: ${accountData.username}\nPassword: ${accountData.password}\nAddress: ${accountData.publicKey}\nPrivate Key: ${accountData.privateKey}`;
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

  const Tab = () => (
    <Segmented
      options={["Akun Baru", "Profil Baru"]}
      block
      value={selectedTab}
      onChange={handleTabChange}
    />
  );

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
  });

  // Menambahkan state untuk DatePicker
  const [tanggalLahir, setTanggalLahir] = useState(null);
  const [tanggalLahirKerabat, setTanggalLahirKerabat] = useState(null);

  const handleSubmit = async (event) => {
    showLoader();
    event.preventDefault();
    const formattedPatientData = {
      ...patientData,
      tanggalLahir: tanggalLahir ? tanggalLahir.format(dateFormat) : "",
      tanggalLahirKerabat: tanggalLahirKerabat
        ? tanggalLahirKerabat.format(dateFormat)
        : "",
    };
    
    if (selectedTab === "Akun Baru" && formattedPatientData.areaCode === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Wilayah tempat tinggal pasien harus diisi!",
      })
      setSpinning(false);
      return;
    }

    // Menandatangani data menggunakan signer
    const signer = await getSigner();
    const signature = await signer.signMessage(JSON.stringify(formattedPatientData));
    formattedPatientData.signature = signature;
    console.log("Register Patient Profile Signature:", signature);
    formattedPatientData.foto = null;

    let endpoint = `${CONN.BACKEND_LOCAL}/staff/register/patient-account`;
    console.log("Submitting form for", selectedTab);
    if (selectedTab === "Profil Baru") {
      console.log("Submitting form for", selectedTab);
      endpoint = `${CONN.BACKEND_LOCAL}/staff/register/patient-profile`;
      if (formattedPatientData.dmrNumber === "") {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Nomor DMR harus diisi untuk profil baru!",
        });
        setSpinning(false);
        return;
      }
    }

    try {
      const response = await fetch(endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(formattedPatientData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log({ data });
        setSpinning(false);
        Swal.fire({
          icon: "success",
          title: "Pendaftaran Profil Pasien Berhasil!",
          text: "Sekarang Anda dapat mengajukan pendaftaran Rawat Jalan.",
        }).then(() => {
          if (selectedTab === "Akun Baru") {
            setAccountData({
              emrNumber: data.emrNumber,
              dmrNumber: data.dmrNumber,
              // dmrCid: data.dmrCid,
              nomorIdentitas: data.nomorIdentitas,
              username: data.username,
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
          title: "Pendaftaran Profil Pasien Gagal",
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      setSpinning(false);
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan saat melakukan pendaftaran",
        text: error,
      });
    }
  };

  return (
    <>
      <Button
        onClick={showModal}
        type="primary"
        className="text-white bg-blue-600 blue-button"
      >
        {buttonText}
      </Button>

      {/* MODAL ANT DESIGN */}
      {/* <Button type="primary" onClick={showModal}>
        Open Modal
      </Button> */}
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1024}
        style={{ top: 20 }}
        footer={[]}
      >
        <form className="col-span-2 p-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-8">
            <div className="justify-center w-full col-span-2 mb-6 text-lg font-medium text-center text-gray-900">
              Pendaftaran Pasien Baru
            </div>
            <div className="col-span-2 py-6">
              <Tab />
            </div>

            {selectedTab === "Akun Baru" && (
              <>
                <div className="col-span-2 mb-6 text-lg font-medium text-gray-900">
                  Data Wilayah Pasien
                  <hr className="h-px bg-gray-700 border-0"></hr>
                </div>
                <div className="mb-6">
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
                    onChange={ (e) => setPatientData({ ...patientData, areaCode: e.target.value }) }
                    required
                  >
                    <option value="">Pilih Wilayah</option>
                    <option value="1">Harapan Mulya</option>
                    <option value="2">Medan Satria</option>
                    <option value="3">Pejuang</option>
                    <option value="4">Luar</option>
                  </select>
                </div>
              </>
            )}

            {selectedTab === "Profil Baru" && (
              <>
                <div className="col-span-2 mb-6 text-lg font-medium text-gray-900">
                  Data Rekam Medis Keluarga
                  <hr className="h-px bg-gray-700 border-0"></hr>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="dmrNumber"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Nomor DMR (Dokumen Rekam Medis)
                  </label>
                  <input
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
              </>
            )}

            <div className="col-span-2 mb-6 text-lg font-medium text-gray-900">
              Data Pasien
              <hr className="h-px bg-gray-700 border-0"></hr>
            </div>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nama Lengkap
              </label>
              <input
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
            <div className="mb-6">
              <label
                htmlFor="nomor_identitas"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Identitas (NIK, SIM, atau Paspor)
              </label>
              <input
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
            <div className="mb-6">
              <label
                htmlFor="tempat_lahir"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Tempat Lahir
              </label>
              <input
                type="text"
                id="tempatLahir"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Tempat lahir"
                value={patientData.tempatLahir}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    tempatLahir: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="tanggal_lahir"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Tanggal Lahir
              </label>
              <DatePicker
                id="tanggalLahir"
                className="w-full h-auto text-gray-900"
                size="large"
                format={customFormat}
                value={tanggalLahir}
                onChange={setTanggalLahir}
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="nama_ibu"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nama Ibu Kandung
              </label>
              <input
                type="text"
                id="namaIbu"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nama ibu kandung"
                value={patientData.namaIbu}
                onChange={(e) =>
                  setPatientData({ ...patientData, namaIbu: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="gender"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Jenis Kelamin
              </label>
              <select
                id="gender"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.gender}
                onChange={(e) =>
                  setPatientData({ ...patientData, gender: e.target.value })
                }
                required
              >
                <option>Pilih Jenis Kelamin</option>
                <option value="0">Tidak diketahui</option>
                <option value="1">Laki-laki</option>
                <option value="2">Perempuan</option>
                <option value="3">Tidak dapat ditentukan</option>
                <option value="4">Tidak mengisi</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="agama"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Agama
              </label>
              <select
                id="agama"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.agama}
                onChange={(e) =>
                  setPatientData({ ...patientData, agama: e.target.value })
                }
                // required
              >
                <option>Pilih Agama</option>
                <option value="1">Islam</option>
                <option value="2">Kristen (Protestan)</option>
                <option value="3">Katolik</option>
                <option value="4">Hindu</option>
                <option value="5">Budha</option>
                <option value="6">Konghuchu</option>
                <option value="7">Penghayat</option>
                <option value="8">Lain-lain</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="suku"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Suku
              </label>
              <input
                type="text"
                id="suku"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Suku"
                value={patientData.suku}
                onChange={(e) =>
                  setPatientData({ ...patientData, suku: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="bahasa"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Bahasa yang Dikuasai
              </label>
              <input
                type="text"
                id="bahasa"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Bahasa yang Dikuasai"
                value={patientData.bahasa}
                onChange={(e) =>
                  setPatientData({ ...patientData, bahasa: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="golonganDarah"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Golongan Darah
              </label>
              <select
                id="golonganDarah"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.golonganDarah}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    golonganDarah: e.target.value,
                  })
                }
                // required
              >
                <option>Pilih Golongan Darah</option>
                <option value="1">A</option>
                <option value="2">B</option>
                <option value="3">AB</option>
                <option value="4">O</option>
                <option value="5">A+</option>
                <option value="6">A-</option>
                <option value="7">B+</option>
                <option value="8">B-</option>
                <option value="9">AB+</option>
                <option value="10">AB-</option>
                <option value="11">O+</option>
                <option value="12">O-</option>
                <option value="7">B+</option>
                <option value="13">Tidak tahu</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="tel"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Telepon Rumah
              </label>
              <input
                type="tel"
                id="telpRumah"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor telepon rumah"
                value={patientData.telpRumah}
                onChange={(e) =>
                  setPatientData({ ...patientData, telpRumah: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="tel"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Telepon Selular
              </label>
              <input
                type="tel"
                id="telpSelular"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor telepon selular"
                value={patientData.telpSelular}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    telpSelular: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Email"
                value={patientData.email}
                onChange={(e) =>
                  setPatientData({ ...patientData, email: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="pendidikan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Pendidikan
              </label>
              <select
                id="pendidikan"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.pendidikan}
                onChange={(e) =>
                  setPatientData({ ...patientData, pendidikan: e.target.value })
                }
                // required
              >
                <option>Pilih Pendidikan</option>
                <option value="0">Tidak sekolah</option>
                <option value="1">SD</option>
                <option value="2">SLTP sederajat</option>
                <option value="3">SLTA sederajat</option>
                <option value="4">D1-D3 sederajat</option>
                <option value="5">D4</option>
                <option value="6">S1</option>
                <option value="7">S2</option>
                <option value="8">S3</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="pekerjaan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Pekerjaan
              </label>
              <select
                id="pekerjaan"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.pekerjaan}
                onChange={(e) =>
                  setPatientData({ ...patientData, pekerjaan: e.target.value })
                }
                // required
              >
                <option>Pilih Pekerjaan</option>
                <option value="0">Tidak Bekerja</option>
                <option value="1">PNS</option>
                <option value="2">TNI/POLRI</option>
                <option value="3">BUMN</option>
                <option value="4">Pegawai Swasta/Wirausaha</option>
                <option value="5">Lain-lain</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="pernikahan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Status Pernikahan
              </label>
              <select
                id="pernikahan"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.pernikahan}
                onChange={(e) =>
                  setPatientData({ ...patientData, pernikahan: e.target.value })
                }
                // required
              >
                <option>Pilih Status Pernikahan</option>
                <option value="1">Belum Kawin</option>
                <option value="2">Kawin</option>
                <option value="3">Cerai Hidup</option>
                <option value="4">Cerai Mati</option>
              </select>
            </div>
            <div className="col-span-2 mb-6">
              <label
                htmlFor="address"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Alamat
              </label>
              <textarea
                id="alamat"
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alamat"
                value={patientData.alamat}
                onChange={(e) =>
                  setPatientData({ ...patientData, alamat: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="rt"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Rukun Tetangga (RT)
              </label>
              <input
                type="text"
                id="rt"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Rukun Tetangga (RT)"
                value={patientData.rt}
                onChange={(e) =>
                  setPatientData({ ...patientData, rt: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="rw"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Rukun Warga (RW)
              </label>
              <input
                type="text"
                id="rw"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Rukun Warga (RW)"
                value={patientData.rw}
                onChange={(e) =>
                  setPatientData({ ...patientData, rw: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="kelurahan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kelurahan / Desa
              </label>
              <input
                type="text"
                id="kelurahan"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kelurahan / Desa"
                value={patientData.kelurahan}
                onChange={(e) =>
                  setPatientData({ ...patientData, kelurahan: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="kecamatan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kecamatan
              </label>
              <input
                type="text"
                id="kecamatan"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kecamatan"
                value={patientData.kecamatan}
                onChange={(e) =>
                  setPatientData({ ...patientData, kecamatan: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="kota"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kota Madya / Kabupaten
              </label>
              <input
                type="text"
                id="kota"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kota Madya / Kabupaten"
                value={patientData.kota}
                onChange={(e) =>
                  setPatientData({ ...patientData, kota: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="pos"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kode Pos
              </label>
              <input
                type="text"
                id="pos"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kode Pos"
                value={patientData.pos}
                onChange={(e) =>
                  setPatientData({ ...patientData, pos: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="provinsi"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Provinsi
              </label>
              <select
                id="provinsi"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.provinsi}
                onChange={(e) =>
                  setPatientData({ ...patientData, provinsi: e.target.value })
                }
                // required
              >
                <option>Pilih Provinsi</option>
                <option value="Aceh">Aceh</option>
                <option value="Bali">Bali</option>
                <option value="Banten">Banten</option>
                <option value="Bengkulu">Bengkulu</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Daerah Istimewa Yogyakarta">
                  Daerah Istimewa Yogyakarta
                </option>
                <option value="Gorontalo">Gorontalo</option>
                <option value="Jambi">Jambi</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
                <option value="Jawa Timur">Jawa Timur</option>
                <option value="Kalimantan Barat">Kalimantan Barat</option>
                <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                <option value="Kalimantan Tengah">Kalimantan Tengah</option>
                <option value="Kalimantan Timur">Kalimantan Timur</option>
                <option value="Kalimantan Utara">Kalimantan Utara</option>
                <option value="Kepulauan Bangka Belitung">
                  Kepulauan Bangka Belitung
                </option>
                <option value="Kepulauan Riau">Kepulauan Riau</option>
                <option value="Lampung">Lampung</option>
                <option value="Maluku">Maluku</option>
                <option value="Maluku Utara">Maluku Utara</option>
                <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
                <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
                <option value="Papua">Papua</option>
                <option value="Papua Barat">Papua Barat</option>
                <option value="Riau">Riau</option>
                <option value="Sulawesi Barat">Sulawesi Barat</option>
                <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                <option value="Sulawesi Tengah">Sulawesi Tengah</option>
                <option value="Sulawesi Tenggara">Sulawesi Tenggara</option>
                <option value="Sulawesi Utara">Sulawesi Utara</option>
                <option value="Sumatera Barat">Sumatera Barat</option>
                <option value="sumatera_selatan">Sumatera Selatan</option>
                <option value="Sumatera Utara">Sumatera Utara</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="negara"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Negara
              </label>
              <input
                type="text"
                id="negara"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Negara"
                value={patientData.negara}
                onChange={(e) =>
                  setPatientData({ ...patientData, negara: e.target.value })
                }
                // required
              />
            </div>

            {/* DATA PENANGGUNG JAWAB */}
            <div className="col-span-2 my-6 text-lg font-medium text-gray-900">
              Data Kerabat/Penanggung Jawab
              <hr className="h-px bg-gray-700 border-0"></hr>
            </div>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                id="namaKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nama lengkap"
                value={patientData.namaKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    namaKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="nomor_identitas"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Identitas (ENIK, SIM, atau Paspor)
              </label>
              <input
                type="text"
                id="nomorIdentitasKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor identitas"
                value={patientData.nomorIdentitasKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    nomorIdentitasKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="tanggal_lahir_kerabat"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Tanggal Lahir
              </label>
              <DatePicker
                id="tanggalLahirKerabat"
                className="w-full h-auto text-sm text-gray-900"
                size="large"
                format={customFormat}
                value={tanggalLahirKerabat}
                onChange={setTanggalLahirKerabat}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="gender"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Jenis Kelamin
              </label>
              <select
                id="genderKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.genderKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    genderKerabat: e.target.value,
                  })
                }
                // required
              >
                <option>Pilih Jenis Kelamin</option>
                <option value="0">Tidak diketahui</option>
                <option value="1">Laki-laki</option>
                <option value="2">Perempuan</option>
                <option value="3">Tidak dapat ditentukan</option>
                <option value="4">Tidak mengisi</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="tel"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="telpKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor telepon"
                value={patientData.telpKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    telpKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="hubungan_kerabat"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Hubungan dengan Pasien
              </label>
              <input
                type="text"
                id="hubunganKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Hubungan dengan pasien"
                value={patientData.hubunganKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    hubunganKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="flex items-center mb-4">
              <input
                id="checkboxAlamat"
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor="checkbox-2"
                className="ml-2 text-sm font-medium text-gray-900"
              >
                Alamat sama dengan pasien.
              </label>
            </div>
            <div className="col-span-2 mb-6">
              <label
                htmlFor="address"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Alamat
              </label>
              <textarea
                id="alamatKerabat"
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alamat"
                value={patientData.alamatKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    alamatKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="rt"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Rukun Tetangga (RT)
              </label>
              <input
                type="text"
                id="rtKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Rukun Tetangga (RT)"
                value={patientData.rtKerabat}
                onChange={(e) =>
                  setPatientData({ ...patientData, rtKerabat: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="rw"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Rukun Warga (RW)
              </label>
              <input
                type="text"
                id="rwKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Rukun Warga (RW)"
                value={patientData.rwKerabat}
                onChange={(e) =>
                  setPatientData({ ...patientData, rwKerabat: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="kelurahan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kelurahan / Desa
              </label>
              <input
                type="text"
                id="kelurahanKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kelurahan / Desa"
                value={patientData.kelurahanKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    kelurahanKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="kecamatan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kecamatan
              </label>
              <input
                type="text"
                id="kecamatanKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kecamatan"
                value={patientData.kecamatanKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    kecamatanKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="kota"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kota Madya / Kabupaten
              </label>
              <input
                type="text"
                id="kotaKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kota Madya / Kabupaten"
                value={patientData.kotaKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    kotaKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="pos"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kode Pos
              </label>
              <input
                type="text"
                id="posKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kode Pos"
                value={patientData.posKerabat}
                onChange={(e) =>
                  setPatientData({ ...patientData, posKerabat: e.target.value })
                }
                // required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="provinsi"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Provinsi
              </label>
              <select
                id="provinsiKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.provinsiKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    provinsiKerabat: e.target.value,
                  })
                }
                // required
              >
                <option>Pilih Provinsi</option>
                <option value="Aceh">Aceh</option>
                <option value="Bali">Bali</option>
                <option value="Banten">Banten</option>
                <option value="Bengkulu">Bengkulu</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Daerah Istimewa Yogyakarta">
                  Daerah Istimewa Yogyakarta
                </option>
                <option value="Gorontalo">Gorontalo</option>
                <option value="Jambi">Jambi</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
                <option value="Jawa Timur">Jawa Timur</option>
                <option value="Kalimantan Barat">Kalimantan Barat</option>
                <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                <option value="Kalimantan Tengah">Kalimantan Tengah</option>
                <option value="Kalimantan Timur">Kalimantan Timur</option>
                <option value="Kalimantan Utara">Kalimantan Utara</option>
                <option value="Kepulauan Bangka Belitung">
                  Kepulauan Bangka Belitung
                </option>
                <option value="Kepulauan Riau">Kepulauan Riau</option>
                <option value="Lampung">Lampung</option>
                <option value="Maluku">Maluku</option>
                <option value="Maluku Utara">Maluku Utara</option>
                <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
                <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
                <option value="Papua">Papua</option>
                <option value="Papua Barat">Papua Barat</option>
                <option value="Riau">Riau</option>
                <option value="Sulawesi Barat">Sulawesi Barat</option>
                <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                <option value="Sulawesi Tengah">Sulawesi Tengah</option>
                <option value="Sulawesi Tenggara">Sulawesi Tenggara</option>
                <option value="Sulawesi Utara">Sulawesi Utara</option>
                <option value="Sumatera Barat">Sumatera Barat</option>
                <option value="sumatera_selatan">Sumatera Selatan</option>
                <option value="Sumatera Utara">Sumatera Utara</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="negara"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Negara
              </label>
              <input
                type="text"
                id="negaraKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Negara"
                value={patientData.negaraKerabat}
                onChange={(e) =>
                  setPatientData({
                    ...patientData,
                    negaraKerabat: e.target.value,
                  })
                }
                // required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 mt-8 text-center gap-x-4">
            <Button
              type="button"
              onClick={handleCancel}
              className="px-5 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 w-fit sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              htmlType="submit"
              className="px-5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 w-fit sm:w-auto"
            >
              Simpan Data Pasien
            </Button>
            <Spin spinning={spinning} fullscreen />
          </div>
        </form>
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
              <p>Nomor EMR: {accountData?.emrNumber}</p>
              <p>No. Dok. RM: {accountData?.dmrNumber}</p>
              {/* <p>CID Dok. RM: {accountData?.dmrCid}</p> */}
              <p>Nomor Identitas: {accountData?.nomorIdentitas}</p>
              <p>Username: {accountData?.username}</p>
              <p>Password: {accountData?.password}</p>
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
    </>
  );
}
