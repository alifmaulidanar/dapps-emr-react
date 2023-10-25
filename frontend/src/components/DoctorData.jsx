import { useState } from "react";

export default function DoctorData({
  doctorName,
  doctorIdNumber,
  doctorBirthLocation,
  doctorBirthDate,
  doctorGender,
  doctorBloodType,
  doctorMaritalStatus,
  doctorReligion,
  doctorJob,
  doctorCitizenship,
  doctorPhone,
  doctorEmail,
  doctorHomeAddress,
  doctorProvince,
  doctorCity,
  doctorSubdistrict,
  doctorVillage,
  doctorPostalCode,
}) {
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

  // const handleCheckboxChange = () => {
  //   setIsChecked(!isChecked);
  // };

  return (
    <form className="col-span-2 p-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="col-span-2 text-gray-900 text-lg mb-6">
          Data Dokter
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorName}
            required
            disabled={!isEditing}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="nomor_identitas"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Nomor Identitas (E-KTP, SIM, atau Paspor)
          </label>
          <input
            type="text"
            id="nomor_identitas"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorIdNumber}
            required
            disabled={!isEditing}
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorBirthLocation}
            required
            disabled={!isEditing}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="tanggal_lahir"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Tanggal Lahir
          </label>
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
              </svg>
            </div>
            <input
              datepicker
              datepicker-format="dd/mm/yyyy"
              datepicker-autohide="true"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              defaultValue={doctorBirthDate}
              required
              disabled={!isEditing}
            />
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="jenis_kelamin"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Jenis Kelamin
          </label>
          <select
            id="jenis_kelamin"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorGender}
            disabled={!isEditing}
            required
          >
            <option>Pilih Jenis Kelamin</option>
            <option value="Pria">Pria</option>
            <option value="Wanita">Wanita</option>
          </select>
        </div>
        <div className="mb-6">
          <label
            htmlFor="golongan_darah"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Golongan Darah
          </label>
          <select
            id="golongan_darah"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorBloodType}
            disabled={!isEditing}
            required
          >
            <option>Pilih Golongan Darah</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="O">O</option>
            <option value="AB">AB</option>
          </select>
        </div>
        <div className="mb-6">
          <label
            htmlFor="status_perkawinan"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Status Perkawinan
          </label>
          <select
            id="status_perkawinan"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorMaritalStatus}
            disabled={!isEditing}
            required
          >
            <option>Pilih Status Perkawinan</option>
            <option value="Menikah">Menikah</option>
            <option value="Tidak/Belum Menikah">Tidak/Belum Menikah</option>
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorReligion}
            required
            disabled={!isEditing}
          >
            <option>Pilih Agama</option>
            <option value="Budha">Budha</option>
            <option value="Hindu">Hindu</option>
            <option value="Islam">Islam</option>
            <option value="Katolik">Kristen Katolik</option>
            <option value="Protestan">Kristen Protestan</option>
            <option value="Konghucu">Konghuchu</option>
          </select>
        </div>
        <div className="mb-6">
          <label
            htmlFor="pekerjaan"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Pekerjaan
          </label>
          <input
            type="text"
            id="pekerjaan"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={`${doctorJob}`}
            required
            disabled={!isEditing}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="kewarganegaraan"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Kewarganegaraan
          </label>
          <input
            type="text"
            id="kewarganegaraan"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={`${doctorCitizenship}`}
            required
            disabled={!isEditing}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="nomor_telepon"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Nomor Telepon
          </label>
          <input
            type="tel"
            id="nomor_telepon"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorPhone}
            required
            disabled={!isEditing}
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorEmail}
            required
            disabled={!isEditing}
          />
        </div>
        <div className="col-span-2 mb-6">
          <label
            htmlFor="alamat"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Alamat
          </label>
          <textarea
            id="alamat"
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            defaultValue={doctorHomeAddress}
            disabled={!isEditing}
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorProvince}
            disabled={!isEditing}
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
            htmlFor="kecamatan"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Kota/Kabupaten
          </label>
          <input
            type="text"
            id="kecamatan"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorCity}
            required
            disabled={!isEditing}
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorSubdistrict}
            required
            disabled={!isEditing}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="kelurahan"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Kelurahan
          </label>
          <input
            type="text"
            id="kelurahan"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorVillage}
            required
            disabled={!isEditing}
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={doctorPostalCode}
            required
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* UBAH DATA */}
      {isEditing ? (
        // Tampilan tombol saat sedang dalam mode pengeditan
        <div className="grid grid-cols-2 gap-x-4 text-center mt-8">
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
        <div className="col-span-2 text-center mt-8">
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
