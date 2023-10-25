import { useState } from "react";
import dayjs from "dayjs";
import { DatePicker, Modal } from "antd";
// import Datepicker from "../Datepicker";
// import Datepicker from "../Datepicker";

export default function RegisterPatientButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      <button
        onClick={showModal}
        className="px-2 py-2 bg-blue-700 text-white rounded-lg w-full max-w-[180px] hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 text-sm"
      >
        Daftarkan Pasien Baru
      </button>

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
        <form className="col-span-2 p-8">
          <div className="grid grid-cols-2 gap-x-8">
            <div className="col-span-2 text-gray-900 text-lg mb-6 font-medium">
              Pendaftaran Pasien Baru
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
                required
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor identitas"
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
                className="text-gray-900 w-full h-auto"
                size="large"
                format={customFormat}
              />
              {/* <Datepicker />
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
                      className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                      required
                    />
                  </div> */}
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
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
              <select
                id="agama"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option>Pilih Pekerjaan</option>
                <option value="irt">Ibu Rumah Tangga</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="pns">Pegawai Negeri Sipil (PNS)</option>
                <option value="pegawai">Pegawai Swasta</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="kewarganegaraan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kewarganegaraan
              </label>
              <select
                id="kewarganegaraan"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option>Pilih Kewarganegaraan</option>
                <option value="WNA">Warga Negara Asing (WNA)</option>
                <option value="WNI">Warga Negara Indonesia (WNI)</option>
              </select>
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor telepon"
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
                required
              />
            </div>
            {/* TEMPAT TINGGAL */}
            {/* <div className="col-span-2 text-gray-900 text-lg my-6">
                Tempat Tinggal
                <hr class="h-px bg-gray-700 border-0"></hr>
              </div> */}
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
                className="block p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alamat"
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
                htmlFor="kecamatan"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Kota/Kabupaten
              </label>
              <input
                type="text"
                id="kecamatan"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kota/Kabupaten"
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
                required
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Kelurahan"
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
                required
              />
            </div>
            {/* DATA PENANGGUNG JAWAB */}
            <div className="col-span-2 text-gray-900 text-lg my-6">
              Data Kerabat/Penanggung Jawab
              <hr className="h-px bg-gray-700 border-0"></hr>
            </div>
            <div className="mb-6">
              <label
                htmlFor="nama_kerabat"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                id="nama_kerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="nomor_identitas_kerabat"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Identitas (E-KTP, SIM, atau Paspor)
              </label>
              <input
                type="text"
                id="nomor_identitas_kerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor identitas"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="jenis_kelamin"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Jenis Kelamin
              </label>
              <select
                id="jenis_kelamin_kerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option>Pilih Jenis Kelamin</option>
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="tanggal_lahir_kerabat"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Tanggal Lahir
              </label>
              <DatePicker
                className="text-gray-900 w-full h-auto text-sm"
                size="large"
                format={customFormat}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="nomor_telepon_kerabat"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="nomor_telepon_kerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nomor telepon"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="kerabat"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Hubungan dengan Pasien
              </label>
              <input
                type="text"
                id="kerabat"
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Hubungan dengan pasien"
                required
              />
            </div>
            <div className="flex items-center mb-4">
              <input
                id="checkbox-alamat"
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
                htmlFor="alamat"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Alamat
              </label>
              <textarea
                id="alamat"
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 text-center mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="text-white bg-red-700 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
            >
              Batal
            </button>
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
