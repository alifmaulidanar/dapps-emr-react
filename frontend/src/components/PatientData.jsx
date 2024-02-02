import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Select, Checkbox, DatePicker, Spin } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { ethers } from "ethers";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function PatientData({ patientDataProps, patientAccountData }) {
  const [form] = Form.useForm();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [spinning, setSpinning] = React.useState(false);

  const showLoader = () => {
    setSpinning(true);
  };

  const dateFormat = "DD/MM/YYYY";
  // const customFormat = (value) => `${value.format(dateFormat)}`;

  useEffect(() => {
    form.setFieldsValue({
      ...patientDataProps,
      tanggalLahir: patientDataProps.tanggalLahir
        ? dayjs(patientDataProps.tanggalLahir, dateFormat)
        : null,
      tanggalLahirKerabat: patientDataProps.tanggalLahirKerabat
        ? dayjs(patientDataProps.tanggalLahirKerabat, dateFormat)
        : null,
    });
  }, [patientDataProps, form]);

  const handleEditClick = () => setIsEditing(true);
  const handleCancelClick = () => {
    setIsEditing(false);
    form.resetFields();
  };

  // const handleCheckboxChange = () => {
  //   setIsChecked(!isChecked);
  // };

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
          rpcUrls: ["http://127.0.0.1:7545"],
        },
      ]);

      const signer = provider.getSigner(selectedAccount);
      return signer;
    } catch (error) {
      console.error("Error setting up Web3Provider:", error);
    }
  }, []);

  const handleFormSubmit = async (values) => {
    if (window.ethereum) {
      try {
        const updatedValues = {
          ...values,
          tanggalLahir: values.tanggalLahir
            ? dayjs(values.tanggalLahir).format(dateFormat)
            : "",
          tanggalLahirKerabat: values.tanggalLahirKerabat
            ? dayjs(values.tanggalLahirKerabat).format(dateFormat)
            : "",
          patientAccountData: patientAccountData,
        };

        // Menandatangani data menggunakan signer
        const signer = await getSigner();
        const signature = await signer.signMessage(
          JSON.stringify(updatedValues)
        );
        console.log(signature);
        updatedValues.signature = signature;
        console.log(updatedValues);

        const response = await fetch(
          "http://localhost:3000/patient/update-profile",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedValues),
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          console.log({ responseData });
          setSpinning(false);
          Swal.fire({
            icon: "success",
            title: "Pendaftaran Profil Pasien Berhasil!",
            text: "Sekarang Anda dapat mengajukan pendaftaran Rawat Jalan.",
          }).then(() => {
            window.location.reload();
          });
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
    }
    setIsEditing(false);
  };

  const handleDateChange = (date, dateString, fieldName) => {
    form.setFieldsValue({ [fieldName]: date });
  };

  const provinsiOptions = [
    { value: "Aceh", label: "Aceh" },
    { value: "Bali", label: "Bali" },
    { value: "Banten", label: "Banten" },
    { value: "Bengkulu", label: "Bengkulu" },
    { value: "Gorontalo", label: "Gorontalo" },
    { value: "Jakarta", label: "DKI Jakarta" },
    { value: "Jambi", label: "Jambi" },
    { value: "Jawa Barat", label: "Jawa Barat" },
    { value: "Jawa Tengah", label: "Jawa Tengah" },
    { value: "Jawa Timur", label: "Jawa Timur" },
    { value: "Kalimantan Barat", label: "Kalimantan Barat" },
    { value: "Kalimantan Selatan", label: "Kalimantan Selatan" },
    { value: "Kalimantan Tengah", label: "Kalimantan Tengah" },
    { value: "Kalimantan Timur", label: "Kalimantan Timur" },
    { value: "Kalimantan Utara", label: "Kalimantan Utara" },
    {
      value: "Kepulauan Bangka Belitung",
      label: "Kepulauan Bangka Belitung",
    },
    { value: "Kepulauan Riau", label: "Kepulauan Riau" },
    { value: "Lampung", label: "Lampung" },
    { value: "Maluku", label: "Maluku" },
    { value: "Maluku Utara", label: "Maluku Utara" },
    { value: "Nusa Tenggara Barat", label: "Nusa Tenggara Barat" },
    { value: "Nusa Tenggara Timur", label: "Nusa Tenggara Timur" },
    { value: "Papua", label: "Papua" },
    { value: "Papua Barat", label: "Papua Barat" },
    { value: "Riau", label: "Riau" },
    { value: "Sulawesi Barat", label: "Sulawesi Barat" },
    { value: "Sulawesi Selatan", label: "Sulawesi Selatan" },
    { value: "Sulawesi Tengah", label: "Sulawesi Tengah" },
    { value: "Sulawesi Tenggara", label: "Sulawesi Tenggara" },
    { value: "Sulawesi Utara", label: "Sulawesi Utara" },
    { value: "Sumatera Barat", label: "Sumatera Barat" },
    { value: "Sumatera Selatan", label: "Sumatera Selatan" },
    { value: "Sumatera Utara", label: "Sumatera Utara" },
    { value: "Yogyakarta", label: "Daerah Istimewa Yogyakarta" },
  ];

  const inputStyling = {
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className="col-span-2 p-8"
      onFinish={handleFormSubmit}
      disabled={!isEditing}
    >
      <div className="grid grid-cols-2 gap-x-8">
        <div className="col-span-2 mb-6 text-lg text-gray-900">
          Data Pasien
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <Form.Item
          label="Nama Lengkap"
          name="namaLengkap"
          rules={[
            { required: true, message: "Silakan masukkan nama lengkap!" },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>
        <Form.Item
          label="Nomor Identitas (NIK, SIM, atau Paspor)"
          name="nomorIdentitas"
          rules={[
            { required: true, message: "Silakan masukkan nomor identitas!" },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Tempat Lahir"
          name="tempatLahir"
          rules={[
            { required: true, message: "Silakan masukkan tempat lahir!" },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>
        <Form.Item
          label="Tanggal Lahir"
          name="tanggalLahir"
          rules={[
            { required: true, message: "Silakan masukkan tanggal lahir!" },
          ]}
        >
          <DatePicker
            id="tanggal_lahir"
            // defaultValue={dayjs("2015/01/01", dateFormat)}
            className="w-full h-auto text-gray-900"
            style={inputStyling}
            size="large"
            format={dateFormat}
            disabled={!isEditing}
            onChange={(date, dateString) =>
              handleDateChange(date, dateString, "tanggalLahir")
            }
            // onSelect={onSelectTanggalLahir}
            // onChange={(value) => setTanggalLahir(value)}
            required
          />
        </Form.Item>
        <Form.Item
          label="Nama Ibu Kandung"
          name="namaIbu"
          rules={[
            { required: true, message: "Silakan masukkan nama ibu kandung!" },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Jenis Kelamin"
          name="gender"
          rules={[{ required: true, message: "Silakan pilih jenis kelamin!" }]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={[
              { value: "0", label: "Tidak diketahui" },
              { value: "1", label: "Laki-laki" },
              { value: "2", label: "Perempuan" },
              { value: "3", label: "Tidak dapat ditentukan" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Agama"
          name="agama"
          rules={[{ required: true, message: "Silakan pilih agama!" }]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={[
              { value: "1", label: "Islam" },
              { value: "2", label: "Kristen (Protestan)" },
              { value: "3", label: "Katolik" },
              { value: "4", label: "Hindu" },
              { value: "5", label: "Budha" },
              { value: "6", label: "Konghuchu" },
              { value: "7", label: "Penghayat" },
              { value: "8", label: "Lain-lain" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Suku"
          name="suku"
          rules={[{ required: true, message: "Silakan masukkan suku!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Bahasa yang Dikuasai"
          name="bahasa"
          rules={[
            {
              required: true,
              message: "Silakan masukkan bahasa yang dikuasai!",
            },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Golongan Darah"
          name="golonganDarah"
          rules={[{ required: true, message: "Silakan pilih golongan darah!" }]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={[
              { value: "1", label: "A" },
              { value: "2", label: "B" },
              { value: "3", label: "AB" },
              { value: "4", label: "O" },
              { value: "5", label: "A+" },
              { value: "6", label: "A-" },
              { value: "7", label: "B+" },
              { value: "8", label: "B-" },
              { value: "9", label: "AB+" },
              { value: "10", label: "AB-" },
              { value: "11", label: "O+" },
              { value: "12", label: "O-" },
              { value: "13", label: "Tidak tahu" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Nomor Telepon Rumah"
          name="telpRumah"
          rules={[
            {
              required: true,
              message: "Silakan masukkan nomor telepon rumah!",
            },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Nomor Telepon Selular"
          name="telpSelular"
          rules={[
            {
              required: true,
              message: "Silakan masukkan nomor telepon selular!",
            },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Silakan masukkan email!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>
        <Form.Item
          label="Pendidikan"
          name="pendidikan"
          rules={[{ required: true, message: "Silakan pilih pendidikan!" }]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={[
              { value: "0", label: "Tidak sekolah" },
              { value: "1", label: "SD" },
              { value: "2", label: "SLTP sederajat" },
              { value: "3", label: "SLTA sederajat" },
              { value: "4", label: "D1-D3 sederajat" },
              { value: "5", label: "D4" },
              { value: "6", label: "S1" },
              { value: "7", label: "S2" },
              { value: "8", label: "S3" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Pekerjaan"
          name="pekerjaan"
          rules={[{ required: true, message: "Silakan pilih pekerjaan!" }]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={[
              { value: "0", label: "Tidak Bekerja" },
              { value: "1", label: "PNS" },
              { value: "2", label: "TNI/POLRI" },
              { value: "3", label: "BUMN" },
              { value: "4", label: "Pegawai Swasta/Wirausaha" },
              { value: "5", label: "Lain-lain" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Status Pernikahan"
          name="pernikahan"
          rules={[
            { required: true, message: "Silakan pilih status pernikahan!" },
          ]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={[
              { value: "1", label: "Belum Kawin" },
              { value: "2", label: "Kawin" },
              { value: "3", label: "Cerai Hidup" },
              { value: "4", label: "Cerai Mati" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Alamat"
          name="alamat"
          rules={[{ required: true, message: "Silakan masukkan alamat!" }]}
        >
          <Input.TextArea disabled={!isEditing} style={inputStyling} rows={4} />
        </Form.Item>

        <Form.Item
          label="RT"
          name="rt"
          rules={[{ required: true, message: "Silakan masukkan RT!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="RW"
          name="rw"
          rules={[{ required: true, message: "Silakan masukkan RW!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Kelurahan / Desa"
          name="kelurahan"
          rules={[
            { required: true, message: "Silakan masukkan kelurahan / desa!" },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Kecamatan"
          name="kecamatan"
          rules={[{ required: true, message: "Silakan masukkan kecamatan!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Kota Madya / Kabupaten"
          name="kota"
          rules={[
            { required: true, message: "Silakan masukkan kota / kabupaten!" },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Kode Pos"
          name="pos"
          rules={[{ required: true, message: "Silakan masukkan kode pos!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        <Form.Item
          label="Provinsi"
          name="provinsi"
          rules={[{ required: true, message: "Silakan pilih provinsi!" }]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={provinsiOptions}
          />
        </Form.Item>

        <Form.Item
          label="Negara"
          name="negara"
          rules={[{ required: true, message: "Silakan masukkan negara!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* DATA PENANGGUNG JAWAB */}
        <div className="col-span-2 my-6 text-lg text-gray-900">
          Data Kerabat/Penanggung Jawab
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <Form.Item
          label="Nama Lengkap"
          name="namaKerabat"
          rules={[
            { required: true, message: "Silakan masukkan nama lengkap!" },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>
        {/* Nomor Identitas Kerabat */}
        <Form.Item
          label="Nomor Identitas (NIK, SIM, atau Paspor)"
          name="nomorIdentitasKerabat"
          rules={[
            {
              required: true,
              message: "Silakan masukkan nomor identitas kerabat!",
            },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* Tanggal Lahir Kerabat */}
        <Form.Item
          label="Tanggal Lahir"
          name="tanggalLahirKerabat"
          rules={[
            { required: true, message: "Silakan pilih tanggal lahir kerabat!" },
          ]}
        >
          <DatePicker
            id="tanggal_lahir_kerabat"
            // defaultValue={parsedTanggalLahirKerabat}
            className="w-full h-auto text-gray-900"
            size="large"
            format={dateFormat}
            disabled={!isEditing}
            onChange={(date, dateString) =>
              handleDateChange(date, dateString, "tanggalLahirKerabat")
            }
            // onSelect={onSelectTanggalLahirKerabat}
            // onChange={(value) => setTanggalLahirKerabat(value)}
            required
          />
        </Form.Item>

        {/* Jenis Kelamin Kerabat */}
        <Form.Item
          label="Jenis Kelamin"
          name="genderKerabat"
          rules={[{ required: true, message: "Silakan pilih jenis kelamin!" }]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={[
              { value: "0", label: "Tidak diketahui" },
              { value: "1", label: "Laki-laki" },
              { value: "2", label: "Perempuan" },
              { value: "3", label: "Tidak dapat ditentukan" },
              { value: "4", label: "Tidak mengisi" },
            ]}
          />
        </Form.Item>

        {/* Nomor Telepon Kerabat */}
        <Form.Item
          label="Nomor Telepon"
          name="telpKerabat"
          rules={[
            {
              required: true,
              message: "Silakan masukkan nomor telepon kerabat!",
            },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* Hubungan dengan Pasien */}
        <Form.Item
          label="Hubungan dengan Pasien"
          name="hubunganKerabat"
          rules={[
            {
              required: true,
              message: "Silakan masukkan hubungan dengan pasien!",
            },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* Alamat Kerabat */}
        <Form.Item
          label="Alamat"
          name="alamatKerabat"
          rules={[{ required: true, message: "Silakan masukkan alamat!" }]}
        >
          <Input.TextArea disabled={!isEditing} style={inputStyling} rows={4} />
        </Form.Item>

        {/* RT Kerabat */}
        <Form.Item
          label="Rukun Tetangga (RT)"
          name="rtKerabat"
          rules={[{ required: true, message: "Silakan masukkan RT!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* RW Kerabat */}
        <Form.Item
          label="Rukun Warga (RW)"
          name="rwKerabat"
          rules={[{ required: true, message: "Silakan masukkan RW!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* Kelurahan/Desa Kerabat */}
        <Form.Item
          label="Kelurahan/Desa"
          name="kelurahanKerabat"
          rules={[
            { required: true, message: "Silakan masukkan kelurahan/desa!" },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* Kecamatan Kerabat */}
        <Form.Item
          label="Kecamatan"
          name="kecamatanKerabat"
          rules={[{ required: true, message: "Silakan masukkan kecamatan!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* Kota/Kabupaten Kerabat */}
        <Form.Item
          label="Kota Madya/Kabupaten"
          name="kotaKerabat"
          rules={[
            {
              required: true,
              message: "Silakan masukkan kota madya/kabupaten!",
            },
          ]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* Kode Pos Kerabat */}
        <Form.Item
          label="Kode Pos"
          name="posKerabat"
          rules={[{ required: true, message: "Silakan masukkan kode pos!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>

        {/* Provinsi Kerabat */}
        <Form.Item
          label="Provinsi"
          name="provinsiKerabat"
          rules={[{ required: true, message: "Silakan pilih provinsi!" }]}
        >
          <Select
            disabled={!isEditing}
            size="large"
            options={provinsiOptions}
          />
        </Form.Item>

        {/* Negara Kerabat */}
        <Form.Item
          label="Negara"
          name="negaraKerabat"
          rules={[{ required: true, message: "Silakan masukkan negara!" }]}
        >
          <Input disabled={!isEditing} style={inputStyling} />
        </Form.Item>
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
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
            onClick={showLoader}
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
          <Spin spinning={spinning} fullscreen />
        </div>
      )}
    </Form>
  );
}
