import { useState } from "react";
import { DatePicker } from "antd";

export default function PatientData() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const dateFormat = "DD/MM/YYYY";
  const customFormat = (value) => `${value.format(dateFormat)}`;

  return (
    <form className="col-span-2 p-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="col-span-2 mb-6 text-lg text-gray-900">
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
            id="nama"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Nama lengkap"
            disabled={!isEditing}
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
            type="number"
            id="nomor_identitas"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Nomor identitas"
            disabled={!isEditing}
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
            id="tempat_lahir"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Tempat lahir"
            // defaultValue={patientBirthLocation}
            disabled={!isEditing}
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
            id="tanggal_lahir"
            className="w-full h-auto text-gray-900"
            size="large"
            format={customFormat}
            disabled={!isEditing}
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
            id="nama_ibu"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Nama ibu kandung"
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="darah"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Golongan Darah
          </label>
          <select
            id="darah"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            disabled={!isEditing}
            required
          >
            <option>Pilih Agama</option>
            <option value="1">A</option>
            <option value="2">B</option>
            <option value="3">AB</option>
            <option value="4">0</option>
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
            id="telp_rumah"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Nomor telepon rumah"
            disabled={!isEditing}
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
            id="telp_selular"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Nomor telepon selular"
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
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
            disabled={!isEditing}
            required
          />
        </div>

        {/* DATA PENANGGUNG JAWAB */}
        <div className="col-span-2 my-6 text-lg text-gray-900">
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
            id="nama_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Nama lengkap"
            disabled={!isEditing}
            required
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
            id="nomor_identitas_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Nomor identitas"
            disabled={!isEditing}
            required
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
            id="tanggal_lahir_kerabat"
            className="w-full h-auto text-sm text-gray-900"
            size="large"
            format={customFormat}
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
            id="gender_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            disabled={!isEditing}
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
            htmlFor="tel"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Nomor Telepon
          </label>
          <input
            type="tel"
            id="tel_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Nomor telepon selular"
            disabled={!isEditing}
            required
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
            id="hubungan_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Hubungan dengan pasien"
            disabled={!isEditing}
            required
          />
        </div>
        <div className="flex items-center mb-4">
          <input
            id="checkbox-alamat"
            type="checkbox"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            onChange={handleCheckboxChange}
            disabled={!isEditing}
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
            id="alamat_kerabat"
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Alamat"
            disabled={!isEditing}
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
            id="rt_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Rukun Tetangga (RT)"
            disabled={!isEditing}
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
            id="rw_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Rukun Warga (RW)"
            disabled={!isEditing}
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
            id="kelurahan_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Kelurahan / Desa"
            disabled={!isEditing}
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
            id="kecamatan_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Kecamatan"
            disabled={!isEditing}
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
            id="kota_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Kota Madya / Kabupaten"
            disabled={!isEditing}
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
            id="pos_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Kode Pos"
            disabled={!isEditing}
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
            id="provinsi_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            disabled={!isEditing}
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
            id="negara_kerabat"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Negara"
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      {/* UBAH DATA */}
      {isEditing ? (
        // Tampilan tombol saat sedang dalam mode pengeditan
        <div className="grid grid-cols-2 mt-8 text-center gap-x-4">
          <button
            type="button"
            className="text-white bg-red-700 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
            onClick={handleCancelClick}
          >
            Batal
          </button>
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
            onClick={handleSaveClick}
          >
            Simpan Perubahan
          </button>
        </div>
      ) : (
        // Tampilan tombol saat tidak dalam mode pengeditan
        <div className="col-span-2 mt-8 text-center">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            onClick={handleEditClick}
          >
            Ubah Data
          </button>
        </div>
      )}
    </form>
  );
}
