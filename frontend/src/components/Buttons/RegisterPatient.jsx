import React, { useState } from "react";
import { DatePicker, Modal, Button, Spin } from "antd";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { CONN } from "../../../../enum-global";
import getSigner from "../utils/getSigner";

export default function RegisterPatientButton({ buttonText, mainNeighborhood }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const dmrNumber = sessionStorage.getItem("dmrNumber");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinning, setSpinning] = React.useState(false);

  const showLoader = () => { setSpinning(true) };
  const showModal = () => { setIsModalOpen(true) };
  const handleOk = () => { setIsModalOpen(false) };
  const handleCancel = () => { setIsModalOpen(false) };

  const dateFormat = "YYYY-MM-DD";
  const customFormat = (value) => `${value.format(dateFormat)}`;
  const [patientData, setPatientData] = useState({
    accountAddress,
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
    nomorTelepon: "",
    email: "",
    pendidikan: "",
    pekerjaan: "",
    pernikahan: "",
    alamat: "",
    rt: "",
    rw: "",
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
    event.preventDefault();
    showLoader();
    const formattedPatientData = {
      accountAddress,
      dmrNumber,
      ...patientData,
      kelurahan: mainNeighborhood,
      tanggalLahir: tanggalLahir ? tanggalLahir.format(dateFormat) : "",
      tanggalLahirKerabat: tanggalLahirKerabat
        ? tanggalLahirKerabat.format(dateFormat)
        : "",
    };

    // Cek apakah semua field yang diperlukan sudah terisi
    const requiredFields = ['namaLengkap', 'nomorIdentitas', 'tempatLahir', 'tanggalLahir', 'gender', 'agama', 'nomorTelepon', 'alamat', 'pekerjaan', 'pernikahan'];
    const fieldNames = {
      namaLengkap: 'Nama Lengkap',
      nomorIdentitas: 'Nomor Identitas',
      tempatLahir: 'Tempat Lahir',
      tanggalLahir: 'Tanggal Lahir',
      gender: 'Jenis Kelamin',
      agama: 'Agama',
      nomorTelepon: 'Nomor Telepon',
      alamat: 'Alamat',
      pekerjaan: 'Pekerjaan',
      pernikahan: 'Status Pernikahan',
    };

    const missingFields = requiredFields.filter(field => !formattedPatientData[field]);
    const missingFieldNames = missingFields.map(field => fieldNames[field]);

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Data Profil Tidak Lengkap',
        html: `Silahkan lengkapi data profil pasien berikut:<br><ul>${missingFieldNames.map(field => `<li>${field}</li>`).join('')}</ul>`,
      });
      setSpinning(false);
      return;
    }

    // Menandatangani data menggunakan signer
    const signer = await getSigner();
    const signature = await signer.signMessage(JSON.stringify(formattedPatientData));
    formattedPatientData.signature = signature;
    console.log("Register Patient Profile Signature:", signature);
    formattedPatientData.foto = null;

    try {
      const response = await fetch(
        `${CONN.BACKEND_LOCAL}/patient/register-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(formattedPatientData),
        }
      );

      const responseData = await response.json();
      if (response.ok) {
        setSpinning(false);
        Swal.fire({
          icon: "success",
          title: "Pendaftaran Profil Pasien Berhasil!",
          text: "Sekarang Anda dapat mengajukan pendaftaran Rawat Jalan.",
        }).then(() => { window.location.reload() });
      } else {
        console.log(responseData.error, responseData.message);
        setSpinning(false);
        Swal.fire({
          icon: "error",
          title: "Pendaftaran Profil Pasien Gagal",
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
              Pendaftaran Profil Pasien Baru
            </div>
            <div className="col-span-2 mb-6 text-lg font-medium text-gray-900">
              Data Rekam Medis Keluarga
              <hr className="h-px bg-gray-700 border-0"></hr>
            </div>
            <div className="mb-6">
              <label
                htmlFor="dmrNumber"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Dokumen Rekam Medis (DRM)
              </label>
              <input
                type="text"
                id="dmrNumber"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor DMR"
                value={dmrNumber}
                disabled
                required
              />
            </div>
            {/* <div className="col-span-2 mb-6 text-lg font-medium text-gray-900">
              Data Rumah Sakit
              <hr className="h-px bg-gray-700 border-0"></hr>
            </div>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Pilih Wilayah Tempat Tinggal Pasien:
              </label>
              <select
                id="gender"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={patientData.rumahSakitAsal}
                onChange={ (e) => setPatientData({ ...patientData, rumahSakitAsal: e.target.value }) }
                required
              >
                <option value="">Pilih Wilayah</option>
                <option value="1">Harapan Mulya</option>
                <option value="2">Medan Satria</option>
                <option value="3">Pejuang</option>
                <option value="4">Luar</option>
              </select>
            </div> */}
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
                onChange={(e) => setPatientData({ ...patientData, gender: e.target.value }) }
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
                value={patientData.suku}
                onChange={(e) =>
                  setPatientData({ ...patientData, suku: e.target.value })
                }
                // required
              />
            </div>
            {/* <div className="mb-6">
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
            </div> */}
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
                Nomor Telepon/HP
              </label>
              <input
                type="tel"
                id="nomorTelepon"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor telepon/HP"
                value={patientData.nomorTelepon}
                onChange={(e) =>
                  setPatientData({ ...patientData, nomorTelepon: e.target.value })
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
                onChange={(e) => setPatientData({ ...patientData, pekerjaan: e.target.value }) }
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
                value={patientData.pernikahan}
                onChange={(e) => setPatientData({ ...patientData, pernikahan: e.target.value }) }
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
                value={patientData.alamat}
                onChange={(e) => setPatientData({ ...patientData, alamat: e.target.value }) }
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
                value={patientData.rt}
                onChange={(e) => setPatientData({ ...patientData, rt: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, rw: e.target.value }) }
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
                value={mainNeighborhood}
                disabled
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
                value={patientData.kecamatan}
                onChange={(e) => setPatientData({ ...patientData, kecamatan: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, kota: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, pos: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, provinsi: e.target.value }) }
                // required
              >
                <option>Pilih Provinsi</option>
                <option value="Aceh">Aceh</option>
                <option value="Bali">Bali</option>
                <option value="Banten">Banten</option>
                <option value="Bengkulu">Bengkulu</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Daerah Istimewa Yogyakarta">Daerah Istimewa Yogyakarta</option>
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
                <option value="Kepulauan Bangka Belitung">Kepulauan Bangka Belitung</option>
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
                onChange={(e) => setPatientData({ ...patientData, negara: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, namaKerabat: e.target.value }) }
                // required
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
                id="nomorIdentitasKerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor identitas"
                value={patientData.nomorIdentitasKerabat}
                onChange={(e) => setPatientData({ ...patientData, nomorIdentitasKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, genderKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, telpKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, hubunganKerabat: e.target.value }) }
                // required
              />
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
                onChange={(e) => setPatientData({ ...patientData, alamatKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, rtKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, rwKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, kelurahanKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, kecamatanKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, kotaKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, posKerabat: e.target.value }) }
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
                onChange={(e) => setPatientData({ ...patientData, provinsiKerabat: e.target.value }) }
                // required
              >
                <option>Pilih Provinsi</option>
                <option value="Aceh">Aceh</option>
                <option value="Bali">Bali</option>
                <option value="Banten">Banten</option>
                <option value="Bengkulu">Bengkulu</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Daerah Istimewa Yogyakarta">Daerah Istimewa Yogyakarta</option>
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
                <option value="Kepulauan Bangka Belitung">Kepulauan Bangka Belitung</option>
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
                onChange={(e) => setPatientData({ ...patientData, negaraKerabat: e.target.value }) }
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
    </>
  );
}
