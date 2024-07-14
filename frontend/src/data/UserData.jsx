import React, { useState, useEffect } from "react";
import { Avatar, Upload, message, Button, Form, Input, Select, DatePicker, Spin } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { create } from "ipfs-http-client";
import { CONN } from "../../../enum-global";
import getSigner from "../components/utils/getSigner";

const ipfsClient = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

export default function UserData({ userDataProps, userAccountData }) {
  const token = sessionStorage.getItem("userToken");
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  // const [isChecked, setIsChecked] = useState(false);
  const [spinning, setSpinning] = React.useState(false);
  const [initialData, setInitialData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  let role;
  switch (userAccountData.accountRole) {
    case "patient":
      role = "Pasien";
      break;
    case "doctor":
      role = "Dokter";
      break;
    case "staff":
      role = "Staff";
      break;
    case "nurse":
      role = "Perawat";
      break;
  }

  // user identifier
  const dmrNmber = userAccountData.dmrNumber;
  const emrNumber = userDataProps.emrNumber;
  const userName = userDataProps.namaLengkap;
  const userImage = userDataProps.foto;
  // const neighborhood = userDataProps.kelurahan;
  const faskesAsal = userDataProps.faskesAsal;

  const handleFileChange = async (info) => { if (info.file.status === "done") setSelectedFile(info.file.originFileObj) };
  const handleDateChange = (date, dateString, fieldName) => { form.setFieldsValue({ [fieldName]: date }) };
  const handleEditClick = () => setIsEditing(true);
  const handleCancelClick = () => {
    setIsEditing(false);
    setSpinning(false)
    form.setFieldsValue(initialData);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isAccepted = file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png";
      if (!isAccepted) message.error("You can only upload JPEG/JPG/PNG file!");
      setSelectedFile(file);
      return false;
    },
    onChange: handleFileChange,
  };

  const showLoader = () => { setSpinning(true) };
  const dateFormat = "YYYY-MM-DD";
  // const customFormat = (value) => `${value.format(dateFormat)}`;

  useEffect(() => {
    const initialFormData = {
      ...userDataProps,
      dmrNmber: userAccountData.dmrNumber || null,
      tanggalLahir: userDataProps.tanggalLahir
        ? dayjs(userDataProps.tanggalLahir, dateFormat)
        : null,
      tanggalLahirKerabat: userDataProps.tanggalLahirKerabat
        ? dayjs(userDataProps.tanggalLahirKerabat, dateFormat)
        : null,
    };
    setInitialData(initialFormData);
    form.setFieldsValue(initialFormData);
  }, [userDataProps, userAccountData, form]);

  // const handleCheckboxChange = () => {
  //   setIsChecked(!isChecked);
  // };

  const handleFormSubmit = async (values) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin ingin menyimpan perubahan?",
      text: "Pastikan data yang Anda masukkan sudah benar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1c64f2",
      confirmButtonText: "Ya, simpan!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    showLoader();

    if (window.ethereum) {
      try {
        let cid;
        if (selectedFile) {
          try {
            const result = await ipfsClient.add(selectedFile);
            cid = result.path;
          } catch (error) {
            console.error("Error uploading file to IPFS:", error);
            message.error("Failed to upload image to IPFS.");
          }
        }

        const updatedValues = {
          dmrNumber: userAccountData.dmrNumber,
          emrNumber: emrNumber,
          ...values,
          tanggalLahir: values.tanggalLahir
          ? dayjs(values.tanggalLahir).format(dateFormat)
          : "",
          ...(values.tanggalLahirKerabat && { tanggalLahirKerabat: dayjs(values.tanggalLahirKerabat).format(dateFormat) }),
        };

        // Menandatangani data menggunakan signer
        const signer = await getSigner();
        console.log({updatedValues});
        const signature = await signer.signMessage(JSON.stringify(updatedValues));
        updatedValues.signature = signature;

        if (!cid) {
          updatedValues.foto = userImage;
        } else {
          updatedValues.foto = cid;
        }

        const response = await fetch(
          `${CONN.BACKEND_LOCAL}/${userAccountData.accountRole}/update-profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(updatedValues),
          }
        );

        const responseData = await response.json();
        if (response.ok) {
          setSpinning(false);
          Swal.fire({
            icon: "success",
            title: "Profil Pasien Berhasil Diperbarui!",
            text: "Periksa kembali informasi profil Anda.",
          }).then(() => {
            window.location.reload();
          });
        } else {
          console.log(responseData.error, responseData.message);
          setSpinning(false);
          Swal.fire({
            icon: "error",
            title: "Pembaruan Profil Pasien Gagal",
            text: responseData.error,
          });
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
        setSpinning(false);
        Swal.fire({
          icon: "error",
          title: "Terjadi kesalahan saat melakukan pembaruan profil",
          text: error,
        });
      }
    }
    setIsEditing(false);
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
    { value: "Kepulauan Bangka Belitung", label: "Kepulauan Bangka Belitung" },
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

  const inputStyling = { border: "1px solid #E2E8F0", borderRadius: "6px" };
  const renderUploadButton = () =>
    isEditing ? (
      <div className="pb-4 upload-profile-picture">
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Ganti Foto</Button>
        </Upload>
      </div>
    ) : null;

  return (
    <>
      <div className="flex flex-col items-center p-8">
        {userImage ? (
          <img
            className="w-24 h-24 mb-3 rounded-full shadow-lg"
            width={96}
            height={96}
            src={`${CONN.IPFS_LOCAL}/${userImage}`}
            alt={`${userName} image`}
          />
        ) : (
          <Avatar
            size={96}
            style={{
              backgroundColor: "#87d068",
              marginBottom: ".75rem",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            }}
            icon={<UserOutlined />}
          />
        )}
        {renderUploadButton()}
        <h5 className="mb-1 text-xl font-medium text-gray-900">{userName}</h5>
        <div className="text-center">
          {/* <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded text-center">{emrNumber}</span> */}
          {/* <h5 className="mb-1 text-lg text-gray-900">Kel. {neighborhood || null }</h5> */}
          <h5 className="mb-1 text-lg text-gray-900">{faskesAsal || null }</h5>
        </div>
      </div>
      <Form form={form} layout="vertical" className="col-span-2 p-8" onFinish={handleFormSubmit} disabled={!isEditing}>
        <div className="grid grid-cols-2 gap-x-8">
          {role === "Pasien" && (
            <>
              <div className="col-span-2 mb-6 text-lg font-medium text-gray-900">
              Data Rekam Medis
              <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <Form.Item label="Nomor Dokumen Rekam Medis (DRM)">
                <Input disabled style={inputStyling} defaultValue={dmrNmber} />
              </Form.Item>
              <Form.Item label="Nomor Rekam Medis Elektronik (RME)" name="emrNumber" >
                <Input disabled style={inputStyling} defaultValue={emrNumber} />
              </Form.Item>
            </>
          )}
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Data {role}
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <Form.Item label="Nama Lengkap" name="namaLengkap" rules={[{ required: true, message: "Silakan masukkan nama lengkap!" }]}>
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="Nomor Identitas (NIK, SIM, atau Paspor)" name="nomorIdentitas" rules={[{ required: true, message: "Silakan masukkan nomor identitas!" }]}>
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="Tempat Lahir" name="tempatLahir" >
            <Input disabled={!isEditing} style={inputStyling} required />
          </Form.Item>
          <Form.Item label="Tanggal Lahir" name="tanggalLahir" >
            <DatePicker
              id="tanggal_lahir"
              className="w-full h-auto text-gray-900"
              style={inputStyling}
              size="large"
              format={dateFormat}
              disabled={!isEditing}
              onChange={(date, dateString) => handleDateChange(date, dateString, "tanggalLahir")}
              required
            />
          </Form.Item>
          <Form.Item label="Nama Ibu Kandung" name="namaIbu" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="Jenis Kelamin" name="gender" rules={[{ required: true }]} >
            <Select disabled={!isEditing} size="large"
              options={[
                { value: "0", label: "Tidak diketahui" },
                { value: "1", label: "Laki-laki" },
                { value: "2", label: "Perempuan" },
                { value: "3", label: "Tidak dapat ditentukan" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Agama" name="agama" rules={[{ required: true }]} >
            <Select disabled={!isEditing} size="large"
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
          <Form.Item label="Suku" name="suku" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          {/* <Form.Item label="Bahasa yang Dikuasai" name="bahasa" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item> */}
          <Form.Item label="Golongan Darah" name="golonganDarah" >
            <Select disabled={!isEditing} size="large"
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
          <Form.Item label="Nomor Telepon/HP" name="nomorTelepon" >
            <Input disabled={!isEditing} style={inputStyling} required />
          </Form.Item>
          <Form.Item label="Email" name="email" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="Pendidikan" name="pendidikan" >
            <Select disabled={!isEditing} size="large"
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
          <Form.Item label="Pekerjaan" name="pekerjaan" rules={[{ required: true }]} >
            <Select disabled={!isEditing} size="large"
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
          <Form.Item label="Status Pernikahan" name="pernikahan" rules={[{ required: true }]} >
            <Select disabled={!isEditing} size="large"
              options={[
                { value: "1", label: "Belum Kawin" },
                { value: "2", label: "Kawin" },
                { value: "3", label: "Cerai Hidup" },
                { value: "4", label: "Cerai Mati" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Alamat" name="alamat" >
            <Input.TextArea disabled={!isEditing} style={inputStyling} rows={4} required />
          </Form.Item>
          <Form.Item label="RT" name="rt" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="RW" name="rw" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="Kelurahan" name="kelurahan" rules={[{ required: true }]}>
            <Input disabled={!isEditing} style={inputStyling} required />
          </Form.Item>
          <Form.Item label="Kecamatan" name="kecamatan" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="Kota Madya/Kabupaten" name="kota" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="Kode Pos" name="pos" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>
          <Form.Item label="Provinsi" name="provinsi" >
            <Select disabled={!isEditing} size="large" options={provinsiOptions} />
          </Form.Item>
          <Form.Item label="Negara" name="negara" >
            <Input disabled={!isEditing} style={inputStyling} />
          </Form.Item>

          {/* DATA PENANGGUNG JAWAB */}
          {userAccountData.accountRole === "patient" ? (
            <>
              <div className="col-span-2 my-6 text-lg text-gray-900">
                Data Kerabat/Penanggung Jawab
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <Form.Item label="Nama Lengkap" name="namaKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Nomor Identitas Kerabat */}
              <Form.Item label="Nomor Identitas (NIK, SIM, atau Paspor)" name="nomorIdentitasKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Tanggal Lahir Kerabat */}
              <Form.Item label="Tanggal Lahir" name="tanggalLahirKerabat" >
                <DatePicker
                  id="tanggal_lahir_kerabat"
                  className="w-full h-auto text-gray-900"
                  size="large"
                  format={dateFormat}
                  disabled={!isEditing}
                  onChange={(date, dateString) => handleDateChange(date, dateString, "tanggalLahirKerabat")}
                />
              </Form.Item>
              {/* Jenis Kelamin Kerabat */}
              <Form.Item label="Jenis Kelamin" name="genderKerabat" >
                <Select disabled={!isEditing} size="large"
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
              <Form.Item label="Nomor Telepon" name="nomorTeleponKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Hubungan dengan Pasien */}
              <Form.Item label="Hubungan dengan Pasien" name="hubunganKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Alamat Kerabat */}
              <Form.Item label="Alamat" name="alamatKerabat" >
                <Input.TextArea disabled={!isEditing} style={inputStyling} rows={4}
                />
              </Form.Item>
              {/* RT Kerabat */}
              <Form.Item label="RT" name="rtKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* RW Kerabat */}
              <Form.Item label="RW" name="rwKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Kelurahan Kerabat */}
              <Form.Item label="Kelurahan" name="kelurahanKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Kecamatan Kerabat */}
              <Form.Item label="Kecamatan" name="kecamatanKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Kota/Kabupaten Kerabat */}
              <Form.Item label="Kota Madya/Kabupaten" name="kotaKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Kode Pos Kerabat */}
              <Form.Item label="Kode Pos" name="posKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
              {/* Provinsi Kerabat */}
              <Form.Item label="Provinsi" name="provinsiKerabat" >
                <Select disabled={!isEditing} size="large" options={provinsiOptions} />
              </Form.Item>
              {/* Negara Kerabat */}
              <Form.Item label="Negara" name="negaraKerabat" >
                <Input disabled={!isEditing} style={inputStyling} />
              </Form.Item>
            </>
          ) : (
            <></>
          )}
        </div>

        {/* TOMBOL UBAH DATA */}
        {isEditing ? (
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
    </>
  );
}
