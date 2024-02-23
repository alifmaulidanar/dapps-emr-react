import React, { useState, useCallback } from "react";
import { DatePicker, Modal, Button, Spin } from "antd";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { CONN } from "../../../../enum-global";

export default function RegisterDoctorButton({ buttonText, userAccountData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [spinning, setSpinning] = React.useState(false);

  const showLoader = () => {
    setSpinning(true);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const dateFormat = "DD/MM/YYYY";
  const customFormat = (value) => `${value.format(dateFormat)}`;

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

  const [doctorData, setDoctorData] = useState({
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
  });

  // Menambahkan state untuk DatePicker
  const [tanggalLahir, setTanggalLahir] = useState(null);

  const handleSubmit = async (event) => {
    showLoader();
    event.preventDefault();
    const formattedDoctorData = {
      ...doctorData,
      tanggalLahir: tanggalLahir ? tanggalLahir.format(dateFormat) : "",
      userAccountData: userAccountData,
    };

    // Menandatangani data menggunakan signer
    const signer = await getSigner();
    const signature = await signer.signMessage(
      JSON.stringify(formattedDoctorData)
    );
    formattedDoctorData.signature = signature;
    console.log({ signature });
    formattedDoctorData.signature = signature;
    formattedDoctorData.role = userAccountData.accountRole;
    formattedDoctorData.foto = null;

    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/doctor/add-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedDoctorData),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log({ responseData });
        setSpinning(false);
        Swal.fire({
          icon: "success",
          title: "Pendaftaran Profil Dokter Berhasil!",
          text: "Informasi Anda telah tersimpan.",
        }).then(() => {
          window.location.reload();
        });
      } else {
        console.log(responseData.error, responseData.message);
        setSpinning(false);
        Swal.fire({
          icon: "error",
          title: "Pendaftaran Profil Dokter Gagal",
          text: responseData.error,
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
            {/* <div className="w-full">
              <Tab />
            </div> */}
            <div className="col-span-2 mb-6 text-lg font-medium text-gray-900">
              Profil Dokter
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
                value={doctorData.namaLengkap}
                onChange={(e) =>
                  setDoctorData({
                    ...doctorData,
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
                value={doctorData.nomorIdentitas}
                onChange={(e) =>
                  setDoctorData({
                    ...doctorData,
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
                value={doctorData.tempatLahir}
                onChange={(e) =>
                  setDoctorData({
                    ...doctorData,
                    tempatLahir: e.target.value,
                  })
                }
                required
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
                required
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
                value={doctorData.namaIbu}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, namaIbu: e.target.value })
                }
                required
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
                value={doctorData.gender}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, gender: e.target.value })
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
                value={doctorData.agama}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, agama: e.target.value })
                }
                required
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
                value={doctorData.suku}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, suku: e.target.value })
                }
                required
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
                value={doctorData.bahasa}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, bahasa: e.target.value })
                }
                required
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
                value={doctorData.golonganDarah}
                onChange={(e) =>
                  setDoctorData({
                    ...doctorData,
                    golonganDarah: e.target.value,
                  })
                }
                required
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
                value={doctorData.telpRumah}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, telpRumah: e.target.value })
                }
                required
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
                value={doctorData.telpSelular}
                onChange={(e) =>
                  setDoctorData({
                    ...doctorData,
                    telpSelular: e.target.value,
                  })
                }
                required
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
                value={doctorData.email}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, email: e.target.value })
                }
                required
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
                value={doctorData.pendidikan}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, pendidikan: e.target.value })
                }
                required
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
                value={doctorData.pekerjaan}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, pekerjaan: e.target.value })
                }
                required
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
                value={doctorData.pernikahan}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, pernikahan: e.target.value })
                }
                required
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
                value={doctorData.alamat}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, alamat: e.target.value })
                }
                required
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
                value={doctorData.rt}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, rt: e.target.value })
                }
                required
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
                value={doctorData.rw}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, rw: e.target.value })
                }
                required
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
                value={doctorData.kelurahan}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, kelurahan: e.target.value })
                }
                required
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
                value={doctorData.kecamatan}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, kecamatan: e.target.value })
                }
                required
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
                value={doctorData.kota}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, kota: e.target.value })
                }
                required
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
                value={doctorData.pos}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, pos: e.target.value })
                }
                required
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
                value={doctorData.provinsi}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, provinsi: e.target.value })
                }
                required
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
                value={doctorData.negara}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, negara: e.target.value })
                }
                required
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
              Simpan Data Dokter
            </Button>
            <Spin spinning={spinning} fullscreen />
          </div>
        </form>
      </Modal>
    </>
  );
}