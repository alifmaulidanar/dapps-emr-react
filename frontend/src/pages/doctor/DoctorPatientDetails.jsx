import { useState, useEffect, useCallback } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import { Table, Button, Card, Modal, Avatar, Empty, Form, Input, DatePicker, Tag, Divider, Select, message } from "antd";
// const  { Dragger } = Upload;
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { UserOutlined, RightOutlined } from "@ant-design/icons";
import { CONN } from "../../../../enum-global";
import BackButton from "../../components/Buttons/Navigations";
import { useLocation } from "react-router-dom";
import DoctorPatientProfile from "./DoctorPatientProfile";
import { ethers } from "ethers";

export default function DoctorPatientDetails({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  const location = useLocation();
  const record = location.state?.record;
  
  const [profile, setProfile] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleCancel = () => {setIsModalOpen(false) };
  const showProfileModal = () => { setSelectedData({ profile }); setIsModalOpen(true); };
  const showEMR = (appointmentId) => {
    const appointment = appointments.find(a => a.appointmentId === appointmentId);
    // console.log({appointment});
    setSelectedData({ appointmentId, appointment });
  };
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/doctor/patient-list/patient-details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ accountAddress: record.accountAddress, nomorRekamMedis: record.nomorRekamMedis }),
        });
        const data = await response.json();
        if (!response.ok) console.log(data.error, data.message);
        setProfile(data.foundPatientProfile);
        setAppointments(data.patientAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [token, record.accountAddress, record.nomorRekamMedis]);

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

  let type;
  switch (role) {
    case "doctor":
      type = 2;
      break;
    case "nurse":
      type = 3;
      break;
    case "staff":
      type = 4;
      break;
  }

  const columns = [
    {
      title: 'No.',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'ID Pendaftaran',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
    },
    {
      title: 'No. Rekam Medis',
      dataIndex: 'nomorRekamMedis',
      key: 'nomorRekamMedis',
    },
    // {
    //   title: 'Lokasi Berobat',
    //   dataIndex: 'rumahSakit',
    //   key: 'rumahSakit',
    // },
    {
      title: 'Dokter',
      dataIndex: 'namaDokter',
      key: 'namaDokter',
    },
    {
      title: 'Jadwal Berobat',
      dataIndex: 'tanggalTerpilih',
      key: 'tanggalTerpilih',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={
          status === "ongoing" ? "blue" : 
          status === "done" ? "green" : "red"
        }>
          {
            status === "ongoing" ? "Sedang berjalan" : 
            status === "done" ? "Selesai" : "Batal"
          }
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => showEMR(record.appointmentId)} icon={<RightOutlined />} />),
    },
  ];
  
  const userImage = profile?.foto;
  const appointmentDataSource = appointments?.map((appointment, index) => ({
    key: index + 1,
    appointmentId: appointment?.appointmentId,
    nomorRekamMedis: appointment?.nomorRekamMedis,
    // rumahSakit: "Eka Hospital " + appointment?.rumahSakit,
    namaDokter: appointment?.namaDokter,
    tanggalTerpilih: (
      <>
        {new Date(appointment?.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}<br></br>
        {appointment?.waktuTerpilih}
      </>
    ),
    status: appointment?.status,
  }));

  function convertProfileData(originalProfile) {
    const profile = {...originalProfile};
    const rumahSakitAsalMap = { '1': 'Eka Hospital Bekasi', '2': 'Eka Hospital BSD', '3': 'Eka Hospital Jakarta', '4': 'Eka Hospital Lampung' };
    const genderMap = { '0': 'Tidak diketahui', '1': 'Laki-laki', '2': 'Perempuan', '3': 'Tidak dapat ditentukan', '4': 'Tidak mengisi' };
    const agamaMap = { '1': 'Islam', '2': 'Kristen (Protestan)', '3': 'Katolik', '4': 'Hindu', '5': 'Budha', '6': 'Konghuchu', '7': 'Penghayat', '8': 'Lain-lain' };
    const golonganDarahMap = { '1': 'A', '2': 'B', '3': 'AB', '4': 'O', '5': 'A+', '6': 'A-', '7': 'B+', '8': 'B-', '9': 'AB+', '10': 'AB-', '11': 'O+', '12': 'O-', '13': 'Tidak tahu' };
    const pendidikanMap = { '0': 'Tidak sekolah', '1': 'SD', '2': 'SLTP sederajat', '3': 'SLTA sederajat', '4': 'D1-D3 sederajat', '5': 'D4', '6': 'S1', '7': 'S2', '8': 'S3' };
    const pekerjaanMap = { '0': 'Tidak Bekerja', '1': 'PNS', '2': 'TNI/POLRI', '3': 'BUMN', '4': 'Pegawai Swasta/Wirausaha', '5': 'Lain-lain' };
    const pernikahanMap = { '1': 'Belum Kawin', '2': 'Kawin', '3': 'Cerai Hidup', '4': 'Cerai Mati' };

    // Konversi nilai angka menjadi teks yang sesuai
    profile.rumahSakitAsal = rumahSakitAsalMap[profile.rumahSakitAsal];
    profile.gender = genderMap[profile.gender];
    profile.agama = agamaMap[profile.agama];
    profile.golonganDarah = golonganDarahMap[profile.golonganDarah];
    profile.pendidikan = pendidikanMap[profile.pendidikan];
    profile.pekerjaan = pekerjaanMap[profile.pekerjaan];
    profile.pernikahan = pernikahanMap[profile.pernikahan];
    profile.genderKerabat = genderMap[profile.genderKerabat];
    return profile;
  }

  const dateFormat = "YYYY-MM-DD";
  const inputStyling = { border: "1px solid #E2E8F0", borderRadius: "6px", height: "32px" };
  
  const EMRForm = ({ appointmentId }) => {
    const [form] = Form.useForm();
    const [isEdit, setIsEdit] = useState(false);
    
    const onFinish = async (values) => {
      const nomorRekamMedis = profile.nomorRekamMedis;
      const selectedAppointment = appointments.find(a => a.appointmentId === appointmentId);
      const accountAddress = selectedAppointment ? selectedAppointment.accountAddress : null;
      
      if (!nomorRekamMedis || !accountAddress) {
        message.error("Missing required patient or appointment information.");
        return;
      }
      
      const submissionValues = {
        ...values,
        nomorRekamMedis,
        accountAddress,
        tanggalRekamMedis: values.tanggalRekamMedis
          ? values.tanggalRekamMedis.format(dateFormat)
          : '',
        };
        
        const signer = await getSigner();
        const signature = await signer.signMessage(JSON.stringify(submissionValues));
        submissionValues.signature = signature;
        
        try {
          const response = await fetch(`${CONN.BACKEND_LOCAL}/doctor/patient-list/patient-details/emr`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(submissionValues),
          }
        );
        if (!response.ok) { throw new Error('Network response was not ok') }
        const data = await response.json();
        console.log('EMR berhasil disimpan:', data);
        window.location.reload();
        message.success('EMR berhasil disimpan');
      } catch (error) {
        console.error('Terdapat kesalahan:', error);
        message.error('Gagal menyimpan EMR');
      }
    };
    // console.log({selectedData});
    // console.log({profile})

    useEffect(() => {
      const selectedHistory = profile.riwayatPengobatan.find(h => h.appointmentId === appointmentId);
      if (selectedHistory) {
        form.setFieldsValue({
          appointmentId: selectedHistory.appointmentId,
          createdAt: dayjs(selectedData.appointment.createdAt).format("DD-MM-YYYY"),
          namaDokter: selectedData.appointment.namaDokter,
          namaPerawat: selectedData.appointment.namaPerawat,
          tanggalRekamMedis: dayjs(selectedHistory.tanggalRekamMedis),
          namaLengkap: selectedData.appointment.namaLengkap,
          judulRekamMedis: selectedHistory.judulRekamMedis,
          alergi: selectedHistory.alergi,
          anamnesa: selectedHistory.anamnesa,
          tindakan: selectedHistory.tindakan,
          terapi: selectedHistory.terapi,
          catatan: selectedHistory.catatan
        });
        setIsEdit(true);
      } else {
        form.resetFields();
        form.setFieldsValue({
          appointmentId: selectedData.appointmentId,
          createdAt: dayjs(selectedData.appointment.createdAt).format("DD-MM-YYYY"),
          namaDokter: selectedData.appointment.namaDokter,
          namaPerawat: selectedData.appointment.namaPerawat,
          tanggalRekamMedis: dayjs(selectedData.appointment.tanggalRekamMedis),
          namaLengkap: selectedData.appointment.namaLengkap,
          namaKerabat: profile.namaKerabat
        });
        setIsEdit(false);
      }
    }, [appointmentId, form, profile.riwayatPengobatan]);

    return (
      <Form
      form={form}
      name="medical_form"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ appointmentId: appointmentId, tanggalRekamMedis: dayjs() }}
        size="small"
      >
        <div className="grid grid-cols-2 gap-x-4">
          {/* DATA PENDAFTARAN */}
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Data Pendaftaran
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <Form.Item label="ID Pendaftaran" name="appointmentId" >
            <Input disabled style={inputStyling} />
          </Form.Item>
          <Form.Item label="Tanggal Pendaftaran" name="createdAt" >
            <Input disabled style={inputStyling} />
          </Form.Item>
          <Form.Item label="Dokter" name="namaDokter" >
            <Input disabled style={inputStyling} />
          </Form.Item>
          <Form.Item label="Perawat" name="namaPerawat" >
            <Input disabled style={inputStyling} />
          </Form.Item>

          {/* FORMULIR UMUM / ASESEMEN AWAL RAWAT JALAN */}
          <div className="col-span-2 text-lg text-gray-900">
            Formulir Umum
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">
              1. Anamnesis
            </Divider>
          </div>
          <Form.Item label="Keluhan Utama" name="keluhanUtama" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Riwayat Penyakit" name="riwayatPenyakit" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Riwayat Alergi" name="riwayatAlergi" >
            <Select size="middle" options={[
              { value: '1', label: <span>Obat</span> },
              { value: '2', label: <span>Makanan</span> },
              { value: '3', label: <span>Udara</span> },
              { value: '4', label: <span>Lain-lain</span> }
            ]} />
          </Form.Item>
          <Form.Item label="Riwayat Pengobatan" name="riwayatPengobatan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">
              2. Pemeriksaan Fisik
            </Divider>
          </div>
          <div className="col-span-2">
            <Divider orientation="left">
              A. Keadaan Umum
            </Divider>
          </div>
          <Form.Item label="Tingkat Kesadaran" name="tingkatKesadaran" >
            <Select size="middle" options={[{ value: 'sample', label: <span>sample</span> }]} />
          </Form.Item>
          <div className="col-span-2">
            <Divider orientation="left">
              B. Organ Vital
            </Divider>
          </div>
          <Form.Item label="Denyut Jantung" name="denyutJantung" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Pernapasan" name="pernapasan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Tekanan Darah Sistole" name="tekananDarahSistole" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Tekanan Darah Diastole" name="tekananDarahDiastole" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Suhu Tubuh" name="suhuTubuh" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Kepala" name="kepala" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Mata" name="mata" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Telinga" name="telinga" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Hidung" name="hidung" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Rambut" name="rambut" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Bibir" name="bibir" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Gigi Geligi" name="gigiGeligi" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Lidah" name="lidah" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Langit-Langit" name="langitLangit" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Leher" name="leher" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Tenggorokan" name="tenggorokan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Tonsil" name="tonsil" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Dada" name="dada" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Payudara" name="payudara" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Punggung" name="punggung" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Perut" name="perut" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Genital" name="genital" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Anus/Dubur" name="anusDubur" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Lengan Atas" name="lenganAtas" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Lengan Bawah" name="lenganBawah" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Jari Tangan" name="jariTangan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Kuku Tangan" name="kukuTangan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Persendian Tangan" name="persendianTangan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Tungkai Atas" name="tungkaiAtas" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Tungkai Bawah" name="tungkaiBawah" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Jari Kaki" name="jariKaki" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Kuku Kaki" name="kukuKaki" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Persendian Kaki" name="persendianKaki" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">
              3. Pemeriksaan Psikologis, Sosial Ekonomi, Spiritual
            </Divider>
          </div>
          <Form.Item label="Status Psikologis" name="statusPsikologis" >
            <Select size="middle" options={[{ value: 'sample', label: <span>sample</span> }]} />
          </Form.Item>
          <Form.Item label="Sosial Ekonomi" name="sosialEkonomi" >
            <Select size="middle" options={[{ value: 'sample', label: <span>sample</span> }]} />
          </Form.Item>
          <Form.Item label="Spiritual" name="spiritual" >
            <Select size="middle" options={[{ value: 'sample', label: <span>sample</span> }]} />
          </Form.Item>

          {/* PEMERIKSAAN SPESIALISTIK */}
          <div className="col-span-2 text-lg text-gray-900">
            Pemeriksaan Spesialistik
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">
              1. Riwayat Penggunaan Obat
            </Divider>
          </div>
          <Form.Item label="Nama Obat" name="namaObat" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Dosis" name="dosisObat" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Waktu Penggunaan" name="waktuPenggunaanObat" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>

          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">
              2. Diagnosis
            </Divider>
          </div>
          <Form.Item label="Diagnosis Awal / Masuk" name="diagnosisAwal" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Diagnosis Akhir Primer" name="diagnosisAkhirPrimer" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Diagnosis Akhir Sekunder" name="diagnosisAkhirSekunder" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>

          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">
              3. Persetujuan Tindakan / Penolakan Tindakan (Informed Consent)
            </Divider>
          </div>
          <Form.Item label="Nama Lengkap Pasien" name="namaLengkap" >
            <Input style={inputStyling} disabled />
          </Form.Item>
          <Form.Item label="Nama Kerabat Pendamping Pasien" name="namaKerabat" >
            <Input style={inputStyling} disabled />
          </Form.Item>
          <Form.Item label="Tindakan yang Dilakukan" name="namaTindakan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Konsekuensi dari Tindakan" name="konsekuensiTindakan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Persetujuan / Penolakan Tindakan" name="konfirmasiTindakan" >
            <Select size="middle" options={[{ value: 'sample', label: <span>sample</span> }]} />
          </Form.Item>
          <Form.Item label="Tanggal Pemberian Penjelasan Tindakan" name="tanggalPenjelasanTindakan"
          >
            <DatePicker
              id="tanggalPenjelasanTindakan"
              className="w-full h-auto text-gray-900"
              style={inputStyling}
              size="large"
              format={dateFormat}
              inputReadOnly={true}
              disabled
            />
          </Form.Item>
          {/* <Form.Item label="Jam Pemberian Penjelasan Tindakan" name="waktuPenjelasanTindakan"
          >
            <DatePicker
              id="waktuPenjelasanTindakan"
              className="w-full h-auto text-gray-900"
              style={inputStyling}
              size="large"
              format={dateFormat}
              inputReadOnly={true}
              disabled
            />
          </Form.Item> */}
          <Form.Item label="Dokter yang Memberi Penjelasan" name="dokterPenjelasanTindakan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Pasien/Keluarga yang Menerima Penjelasan" name="pasienPenjelasanTindakan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Saksi 1" name="saksi1PenjelasanTindakan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Saksi 2" name="saksi2PenjelasanTindakan" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>

          {/* <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">
              4. Terapi
            </Divider>
          </div>
          <div className="col-span-2">
            <Divider orientation="left">
              A. Tindakan
            </Divider>
          </div>
          <div className="col-span-2">
            <Divider orientation="left">
              B. Obat
            </Divider>
          </div> */}

          {/* <Form.Item label="Judul Rekam Medis" name="judulRekamMedis" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Tanggal Rekam Medis" name="tanggalRekamMedis"
          >
            <DatePicker
              id="tanggalRekamMedis"
              className="w-full h-auto text-gray-900"
              style={inputStyling}
              size="large"
              format={dateFormat}
              inputReadOnly={true}
              disabled
            />
          </Form.Item>
          <Form.Item label="Alergi" name="alergi" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Anamnesa" name="anamnesa" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item>
          <Form.Item label="Terapi" name="terapi" >
            <Input style={inputStyling} disabled={isEdit} />
          </Form.Item> */}
        </div>
        {/* <Form.Item label="Catatan" name="catatan" >
          <Input.TextArea style={inputStyling} disabled={isEdit} rows={4} />
        </Form.Item> */}
        {!isEdit && (
          <Form.Item className="flex justify-center mt-12">
            <Button type="primary" ghost htmlType="submit" size="medium">Simpan Permanen</Button>
          </Form.Item>
        )}
      </Form>
    );
  };

  const EMRCard = () => {
    if (!selectedData.appointmentId) return <Card><Empty description="Silakan pilih Appointment" /></Card>;
    const doctor = {
      idDokter: selectedData.appointment?.idDokter,
      namaDokter: selectedData.appointment?.namaDokter,
      alamat: selectedData.appointment?.alamatDokter
    };
    const patient = {
      gender: profile.gender,
      usia: calculateAge(profile.tanggalLahir),
      golonganDarah: profile.golonganDarah
    };
    return (
      <Card>
        {selectedData.history ? (
          <>
            <p>Detail Riwayat Pengobatan:</p>
            <p>{selectedData.history.detail}</p>
          </>
        ) : (
          <EMRForm appointmentId={selectedData.appointmentId} doctor={doctor} patient={patient} />
        )}
      </Card>
    );
  };

  const calculateAge = (tanggalLahir) => {
    const birthDate = new Date(tanggalLahir);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    return age;
  };

  const fotoProfil = (
    <>
      {userImage ? (
        <img
          className="w-24 h-24 mb-3 rounded-full shadow-lg"
          width={96}
          height={96}
          src={`${CONN.IPFS_LOCAL}/${userImage}`}
          alt={`${convertProfileData(profile).namaLengkap} image`}
        />
      ) : (
        <Avatar
          size={96}
          style={{
            backgroundColor: "#87d068",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          }}
          icon={<UserOutlined />}
        />
      )}
    </>
  )

  return (
    <>
      <NavbarController type={type} page={role} color="blue" />
      <div className="grid grid-cols-1 py-24 mx-12 min-h-fit">
        <div className="grid justify-between grid-cols-5 gap-x-8">
          <div className="grid items-start col-span-5">
            <div className="grid mb-4">
              <BackButton linkToPage="/doctor/patient-list" />
            </div>
          </div>
          <div className="grid items-start col-span-5">
            <div className="grid grid-cols-2 gap-x-8">
              <div className="grid content-start gap-y-8">
                <Card
                  className="w-full"
                  actions={[
                    <Button key="profilDetail" type="link" onClick={showProfileModal}>
                      Detail Profil Pasien
                    </Button>,
                  ]}
                >
                  <div className="grid grid-cols-4 gap-y-8">
                    <div className="grid items-center justify-center row-span-2">
                      {fotoProfil}
                    </div>
                    <div>
                      <p className="font-medium">Nomor Identitas</p>
                      <p>{convertProfileData(profile).nomorIdentitas}</p>
                    </div>
                    <div>
                      <p className="font-medium">Nomor Rekam Medis</p>
                      <p>{convertProfileData(profile).nomorRekamMedis}</p>
                    </div>
                    <div>
                      <p className="font-medium">Tanggal Lahir</p>
                      <p>{new Date(convertProfileData(profile).tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      {/* <p>{convertProfileData(profile).tanggalLahir}</p> */}
                    </div>
                    <div>
                      <p className="font-medium">Nama Lengkap</p>
                      <p>{convertProfileData(profile).namaLengkap}</p>
                    </div>
                    <div>
                      <p className="font-medium">Jenis Kelamin</p>
                      <p>{convertProfileData(profile).gender}</p>
                    </div>
                    <div>
                      <p className="font-medium">Golongan Darah</p>
                      <p>{convertProfileData(profile).golonganDarah}</p>
                    </div>
                  </div>
                </Card>
                <Table columns={columns} dataSource={appointmentDataSource} size="middle" />
              </div>
              <div className="">
                <EMRCard />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal width={1000} open={isModalOpen} onCancel={handleCancel} footer={null} style={{top: 20}}>
        <DoctorPatientProfile data={selectedData.profile} convert={convertProfileData} foto={fotoProfil} />
      </Modal>
    </>
  );
}
