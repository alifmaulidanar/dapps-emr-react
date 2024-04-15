import { createRoot } from 'react-dom/client';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { ethers } from "ethers";
import { Buffer } from 'buffer';
import { create } from "ipfs-http-client";
import { CONN } from "../../../../enum-global";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { InboxOutlined, UserOutlined, RightOutlined, FileOutlined } from "@ant-design/icons";
import { Upload, Table, Button, Card, Modal, Avatar, Empty, Form, Input, DatePicker, Tag, Divider, Select, message } from "antd";
const { Dragger } = Upload;
import DoctorPatientProfile from "../../components/Cards/NakesPatientProfile";
import BackButton from "../../components/Buttons/Navigations";
import NavbarController from "../../components/Navbar/NavbarController";

const ipfsClient = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

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
      const accounts = await win.ethereum.request({ method: "eth_requestAccounts" });
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
    { title: 'No.', dataIndex: 'key', key: 'key' },
    { title: 'ID Pendaftaran', dataIndex: 'appointmentId', key: 'appointmentId' },
    { title: 'No. Rekam Medis', dataIndex: 'nomorRekamMedis', key: 'nomorRekamMedis' },
    { title: 'Dokter', dataIndex: 'namaDokter', key: 'namaDokter' },
    { title: 'Jadwal Berobat', dataIndex: 'tanggalTerpilih', key: 'tanggalTerpilih' },
    { title: 'Status', dataIndex: 'status',
      render: (status) => (
        <Tag color={ status === "ongoing" ? "blue" :  status === "done" ? "green" : "red" }>
          { status === "ongoing" ? "Sedang berjalan" :  status === "done" ? "Selesai" : "Batal" }
        </Tag>
      ) },
    { title: 'Aksi', key: 'action', render: (_, record) => (<Button type="primary" ghost onClick={() => showEMR(record.appointmentId)} icon={<RightOutlined/>}/>) },
  ];
  
  const userImage = profile?.foto;
  const appointmentDataSource = appointments?.map((appointment, index) => ({
    key: index + 1,
    appointmentId: appointment?.appointmentId,
    nomorRekamMedis: appointment?.nomorRekamMedis,
    namaDokter: appointment?.namaDokter,
    tanggalTerpilih: (
      <>
        {new Date(appointment?.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}<br></br>
        {appointment?.waktuTerpilih}
      </>
    ),
    status: appointment?.status,
    tanggalTerpilihRaw: new Date(appointment?.tanggalTerpilih)
  })).sort((a, b) => b.tanggalTerpilihRaw - a.tanggalTerpilihRaw);

  function convertProfileData(originalProfile) {
    const profile = {...originalProfile};
    const rumahSakitAsalMap = { '1': 'Eka Hospital Bekasi', '2': 'Eka Hospital BSD', '3': 'Eka Hospital Jakarta', '4': 'Eka Hospital Lampung' };
    const genderMap = { '0': 'Tidak diketahui', '1': 'Laki-laki', '2': 'Perempuan', '3': 'Tidak dapat ditentukan', '4': 'Tidak mengisi' };
    const agamaMap = { '1': 'Islam', '2': 'Kristen (Protestan)', '3': 'Katolik', '4': 'Hindu', '5': 'Budha', '6': 'Konghuchu', '7': 'Penghayat', '8': 'Lain-lain' };
    const golonganDarahMap = { '1': 'A', '2': 'B', '3': 'AB', '4': 'O', '5': 'A+', '6': 'A-', '7': 'B+', '8': 'B-', '9': 'AB+', '10': 'AB-', '11': 'O+', '12': 'O-', '13': 'Tidak tahu' };
    const pendidikanMap = { '0': 'Tidak sekolah', '1': 'SD', '2': 'SLTP sederajat', '3': 'SLTA sederajat', '4': 'D1-D3 sederajat', '5': 'D4', '6': 'S1', '7': 'S2', '8': 'S3' };
    const pekerjaanMap = { '0': 'Tidak Bekerja', '1': 'PNS', '2': 'TNI/POLRI', '3': 'BUMN', '4': 'Pegawai Swasta/Wirausaha', '5': 'Lain-lain' };
    const pernikahanMap = { '1': 'Belum Kawin', '2': 'Kawin', '3': 'Cerai Hidup', '4': 'Cerai Mati' };
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
  const inputStylingTextArea = { border: "1px solid #E2E8F0", borderRadius: "6px" };

  const EMRForm = ({ appointmentId }) => {
    const [form] = Form.useForm();
    const [isEdit, setIsEdit] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [selectedAlergi, setSelectedAlergi] = useState('');
    const [selectedPsikologis, setSelectedPsikologis] = useState('');
    const [history, setHistory] = useState({});

    const props = {
      name: 'file',
      multiple: true,
      fileList,
      accept: '.docx,.xlsx,.ppt,.png,.jpg,.jpeg,.pdf',
      beforeUpload: (file) => {
        setFileList((prevList) => [...prevList, file]);
        return false;
      },
      onRemove: (file) => {
        const newFileList = fileList.filter((f) => f !== file);
        setFileList(newFileList);
      },
    };

    const filesToUpload = fileList.map((file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => { resolve({ path: file.name, content: Buffer.from(event.target.result) }) };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      })
    );

    const onAlergiChange = value => { setSelectedAlergi(value) };
    const onPsikologisChange = value => { setSelectedPsikologis(value) };
    const onValuesChange = (changedValues, allValues) => {
      const keys = Object.keys(changedValues);
      keys.forEach(key => { if (isEdit && changedValues[key] === '') { form.setFieldsValue({ [key]: null }) } });
    };
    const onFinish = async (values) => {
      const transformedValues = Object.entries(values).reduce((acc, [key, value]) => {
        acc[key] = value === undefined ? null : value;
        return acc;
      }, {});
      const nomorRekamMedis = profile.nomorRekamMedis;
      const selectedAppointment = appointments.find(a => a.appointmentId === appointmentId);
      const accountAddress = selectedAppointment ? selectedAppointment.accountAddress : null;

      if (!nomorRekamMedis || !accountAddress) {
        message.error("Missing required patient or appointment information.");
        return;
      }

      // bundle lampiran rekam medis
      const filesData = await Promise.all(filesToUpload);
      const bundleContent = JSON.stringify(filesData);
      const result = await ipfsClient.add(bundleContent);
      const cid = result.cid.toString();

      const formattedEMR = {
        accountAddress,
        nomorRekamMedis,
        alamatDokter: selectedData.appointment.alamatDokter,
        ...transformedValues,
        waktuPenjelasanTindakan: dayjs().format("HH:mm:ss"),
        tanggalPenjelasanTindakan: transformedValues.tanggalPenjelasanTindakan ? transformedValues.tanggalPenjelasanTindakan.format(dateFormat) : '',
        tanggalRekamMedis: dayjs().format("YYYY-MM-DD"),
        waktuRekamMedis: dayjs().format("HH:mm:ss"),
        datetimeEMR: dayjs().tz(dayjs.tz.guess()).format(),
        isDokter: true,
        alamatStaf: selectedData.appointment.alamatStaf,
        lampiranRekamMedis: cid,
      };
      const signer = await getSigner();
      const signature = await signer.signMessage(JSON.stringify(formattedEMR));
      formattedEMR.signature = signature;

      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/doctor/patient-list/patient-details/emr`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(formattedEMR),
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

    useEffect(() => {
      const selectedHistory = profile.riwayatPengobatan.find(h => h.appointmentId === appointmentId);
      setHistory(selectedHistory);
      if (selectedHistory) {
        const cid = selectedHistory ? selectedHistory.lampiranRekamMedis : null;
        // Set initial values
        const initialValues = {
          appointmentId: selectedHistory.appointmentId,
          appointmentCreatedAt: dayjs(selectedData.appointment.appointmentCreatedAt).format("DD-MM-YYYY"),
          namaDokter: selectedData.appointment.namaDokter,
          namaPerawat: selectedData.appointment.namaPerawat,
          tanggalRekamMedis: dayjs(selectedHistory.tanggalRekamMedis),
          namaLengkap: selectedHistory.namaLengkap,
          keluhanUtama: selectedHistory.keluhanUtama,
          riwayatPenyakit: selectedHistory.riwayatPenyakit,
          riwayatAlergi: selectedHistory.riwayatAlergi,
          riwayatAlergiLainnya: selectedHistory.riwayatAlergiLainnya,
          riwayatPengobatan: selectedHistory.riwayatPengobatan,
          tingkatKesadaran: selectedHistory.tingkatKesadaran,
          denyutJantung: selectedHistory.denyutJantung,
          pernapasan: selectedHistory.pernapasan,
          tekananDarahSistole: selectedHistory.tekananDarahSistole,
          tekananDarahDiastole: selectedHistory.tekananDarahDiastole,
          suhuTubuh: selectedHistory.suhuTubuh,
          kepala: selectedHistory.kepala,
          mata: selectedHistory.mata,
          telinga: selectedHistory.telinga,
          hidung: selectedHistory.hidung,
          rambut: selectedHistory.rambut,
          bibir: selectedHistory.bibir,
          gigiGeligi: selectedHistory.gigiGeligi,
          lidah: selectedHistory.lidah,
          langitLangit: selectedHistory.langitLangit,
          leher: selectedHistory.leher,
          tenggorokan: selectedHistory.tenggorokan,
          tonsil: selectedHistory.tonsil,
          dada: selectedHistory.dada,
          payudara: selectedHistory.payudara,
          punggung: selectedHistory.punggung,
          perut: selectedHistory.perut,
          genital: selectedHistory.genital,
          anusDubur: selectedHistory.anusDubur,
          lenganAtas: selectedHistory.lenganAtas,
          lenganBawah: selectedHistory.lenganBawah,
          jariTangan: selectedHistory.jariTangan,
          kukuTangan: selectedHistory.kukuTangan,
          persendianTangan: selectedHistory.persendianTangan,
          tungkaiAtas: selectedHistory.tulangAtas,
          tulangBawah: selectedHistory.tulangBawah,
          jariKaki: selectedHistory.jariKaki,
          kukuKaki: selectedHistory.kukuKaki,
          persendianKaki: selectedHistory.persendianKaki,
          statusPsikologis: selectedHistory.statusPsikologis,
          statusPsikologisLainnya: selectedHistory.statusPsikologisLainnya,
          sosialEkonomi: selectedHistory.sosialEkonomi,
          spiritual: selectedHistory.spiritual,
          namaObat: selectedHistory.namaObat,
          dosisObat: selectedHistory.dosisObat,
          waktuPenggunaanObat: selectedHistory.WaktuPenggunaanObat,
          diagnosisAwal: selectedHistory.diagnosisAwal,
          diagnosisAkhirPrimer: selectedHistory.diagnosisAkhirPrimer,
          diagnosisAkhirSekunder: selectedHistory.diagnosisAkhirSekunder,
          namaKerabat: selectedHistory.namaKerabat,
          dokterPenjelasanTindakan: selectedHistory.dokterPenjelasanTindakan,
          petugasPendampingTindakan: selectedHistory.petugasPendampingTindakan,
          namaTindakan: selectedHistory.namaTindakan,
          konsekuensiTindakan: selectedHistory.konsekuensiTindakan,
          konfirmasiTindakan: selectedHistory.konfirmasiTindakan,
          tanggalPenjelasanTindakan: dayjs(selectedHistory.tanggalPenjelasanTindakan),
          pasienPenjelasanTindakan: selectedHistory.pasienPenjelasanTindakan,
          saksi1PenjelasanTindakan: selectedHistory.saksi1PenjelasanTindakan,
          saksi2PenjelasanTindakan: selectedHistory.saksi2PenjelasanTindakan,
          lampiranRekamMedis: selectedHistory.lampiranRekamMedis,
          judulRekamMedis: selectedHistory.judulRekamMedis,
          catatanRekamMedis: selectedHistory.catatanRekamMedis,
        };
        // Check isDokter & isPerawat
        if (selectedHistory.isDokter) {
          // if isDokter
          setIsEdit(true);
          form.setFieldsValue(initialValues);
          fetch(`${CONN.IPFS_LOCAL}/${cid}`)
            .then(response => response.json())
            .then(bundleContent => {
              const root = createRoot(document.getElementById("lampiran"));
              const cards = bundleContent.map(fileData => {
                const blob = new Blob([new Uint8Array(fileData.content.data)]);
                const url = URL.createObjectURL(blob);
                let attachmentElement;
                let previewElement;
                if (fileData.path.endsWith('.png') || fileData.path.endsWith('.jpg') || fileData.path.endsWith('.jpeg')) {
                  // Display image file
                  attachmentElement = document.createElement('img');
                  attachmentElement.src = url;
                  attachmentElement.alt = fileData.path;
                  previewElement = <img alt={fileData.path} src={url} style={{ width: '28px', height: 'auto' }} />;
                } else {
                  // Display other file types as download links
                  attachmentElement = document.createElement('img');
                  attachmentElement.src = url;
                  attachmentElement.alt = fileData.path;
                  previewElement = <FileOutlined style={{ fontSize: '28px' }} />;
                }
                const fileName = fileData.path.split('.').slice(0, -1).join('.');
                const fileExtension = fileData.path.split('.').pop();
                const cardContent = (
                  <>
                    {previewElement}
                  </>
                );
                return (
                  <Card key={fileData.path} className="w-[115px] h-fit hover:shadow">
                    <a href={url} download={fileData.path} className="grid justify-items-center gap-y-2 hover:text-gray-900">
                      {cardContent}
                      <p>{fileName}.{fileExtension}</p>
                    </a>
                  </Card>
                );
              });
              root.render(cards, document.createElement('div'));
            })
            .catch(error => {
              console.error('Error fetching data:', error);
            });
        } else if (selectedHistory.isPerawat) {
          // if isPerawat
          setIsEdit(false);
          form.setFieldsValue({
            appointmentId: selectedData.appointmentId,
            appointmentCreatedAt: dayjs(selectedData.appointment.appointmentCreatedAt).format("DD-MM-YYYY"),
            namaDokter: selectedData.appointment.namaDokter,
            namaPerawat: selectedData.appointment.namaPerawat,
            tanggalRekamMedis: dayjs(selectedData.appointment.tanggalRekamMedis),
            namaLengkap: selectedData.appointment.namaLengkap,
            keluhanUtama: selectedHistory.keluhanUtama,
            riwayatPenyakit: selectedHistory.riwayatPenyakit,
            riwayatAlergi: selectedHistory.riwayatAlergi,
            riwayatAlergiLainnya: selectedHistory.riwayatAlergiLainnya,
            riwayatPengobatan: selectedHistory.riwayatPengobatan,
            tingkatKesadaran: selectedHistory.tingkatKesadaran,
            denyutJantung: selectedHistory.denyutJantung,
            pernapasan: selectedHistory.pernapasan,
            tekananDarahSistole: selectedHistory.tekananDarahSistole,
            tekananDarahDiastole: selectedHistory.tekananDarahDiastole,
            suhuTubuh: selectedHistory.suhuTubuh,
            kepala: selectedHistory.kepala,
            mata: selectedHistory.mata,
            telinga: selectedHistory.telinga,
            hidung: selectedHistory.hidung,
            rambut: selectedHistory.rambut,
            bibir: selectedHistory.bibir,
            gigiGeligi: selectedHistory.gigiGeligi,
            lidah: selectedHistory.lidah,
            langitLangit: selectedHistory.langitLangit,
            leher: selectedHistory.leher,
            tenggorokan: selectedHistory.tenggorokan,
            tonsil: selectedHistory.tonsil,
            dada: selectedHistory.dada,
            payudara: selectedHistory.payudara,
            punggung: selectedHistory.punggung,
            perut: selectedHistory.perut,
            genital: selectedHistory.genital,
            anusDubur: selectedHistory.anusDubur,
            lenganAtas: selectedHistory.lenganAtas,
            lenganBawah: selectedHistory.lenganBawah,
            jariTangan: selectedHistory.jariTangan,
            kukuTangan: selectedHistory.kukuTangan,
            persendianTangan: selectedHistory.persendianTangan,
            tungkaiAtas: selectedHistory.tulangAtas,
            tulangBawah: selectedHistory.tulangBawah,
            jariKaki: selectedHistory.jariKaki,
            kukuKaki: selectedHistory.kukuKaki,
            persendianKaki: selectedHistory.persendianKaki,
            statusPsikologis: selectedHistory.statusPsikologis,
            statusPsikologisLainnya: selectedHistory.statusPsikologisLainnya,
            sosialEkonomi: selectedHistory.sosialEkonomi,
            spiritual: selectedHistory.spiritual,
            namaKerabat: profile.namaKerabat,
            dokterPenjelasanTindakan: selectedData.appointment.namaDokter,
            petugasPendampingTindakan: selectedData.appointment.namaPerawat,
            pasienPenjelasanTindakan: selectedData.appointment.namaLengkap,
            tanggalPenjelasanTindakan: dayjs(),
            lampiranRekamMedis: selectedHistory.lampiranRekamMedis,
            judulRekamMedis: selectedHistory.judulRekamMedis,
            catatanRekamMedis: selectedHistory.catatanRekamMedis,
          });
        } else {
          // if !isDokter dan !isPerawat
          form.resetFields();
          form.setFieldsValue({
            appointmentId: selectedData.appointmentId,
            appointmentCreatedAt: dayjs(selectedData.appointment.appointmentCreatedAt).format("DD-MM-YYYY"),
            namaDokter: selectedData.appointment.namaDokter,
            namaPerawat: selectedData.appointment.namaPerawat,
            tanggalRekamMedis: dayjs(selectedData.appointment.tanggalRekamMedis),
            namaLengkap: selectedData.appointment.namaLengkap,
            namaKerabat: profile.namaKerabat,
            dokterPenjelasanTindakan: selectedData.appointment.namaDokter,
            petugasPendampingTindakan: selectedData.appointment.namaPerawat,
            pasienPenjelasanTindakan: selectedData.appointment.namaLengkap,
            tanggalPenjelasanTindakan: dayjs(),
          });
          setIsEdit(false);
        }
      } else {
        form.resetFields();
        form.setFieldsValue({
          appointmentId: selectedData.appointmentId,
          appointmentCreatedAt: dayjs(selectedData.appointment.appointmentCreatedAt).format("DD-MM-YYYY"),
          namaDokter: selectedData.appointment.namaDokter,
          namaPerawat: selectedData.appointment.namaPerawat,
          tanggalRekamMedis: dayjs(selectedData.appointment.tanggalRekamMedis),
          namaLengkap: selectedData.appointment.namaLengkap,
          namaKerabat: profile.namaKerabat,
          dokterPenjelasanTindakan: selectedData.appointment.namaDokter,
          petugasPendampingTindakan: selectedData.appointment.namaPerawat,
          pasienPenjelasanTindakan: selectedData.appointment.namaLengkap,
          tanggalPenjelasanTindakan: dayjs(),
        });
        setIsEdit(false);
      }
    }, [appointmentId, form, profile.riwayatPengobatan, selectedData.appointment]);

    return (
      <Form
        form={form}
        name="medical_form"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ appointmentId: appointmentId, tanggalRekamMedis: dayjs() }}
        onValuesChange={onValuesChange}
        size="small"
    >
        <div className="grid grid-cols-2 p-4 gap-x-4">
          {/* DATA PENDAFTARAN */}
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Data Pendaftaran
            <hr className="h-px bg-gray-700 border-0"/>
          </div>
          <Form.Item label="ID Pendaftaran" name="appointmentId">
            <Input disabled style={inputStyling}/>
          </Form.Item>
          <Form.Item label="Tanggal Pendaftaran" name="appointmentCreatedAt">
            <Input disabled style={inputStyling}/>
          </Form.Item>
          <Form.Item label="Dokter" name="namaDokter">
            <Input disabled style={inputStyling}/>
          </Form.Item>
          <Form.Item label="Perawat" name="namaPerawat">
            <Input disabled style={inputStyling}/>
          </Form.Item>

          {/* FORMULIR UMUM / ASESEMEN AWAL RAWAT JALAN */}
          <div className="col-span-2 text-lg text-gray-900">
            Formulir Umum
            <hr className="h-px bg-gray-700 border-0"/>
          </div>

          {/* Anamnesis */}
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">1. Anamnesis</Divider>
          </div>
          <Form.Item label="Keluhan Utama" name="keluhanUtama" rules={[{ required: true, message: 'Harap isi keluhan utama!' }]}>
            <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>
          <Form.Item label="Riwayat Penyakit" name="riwayatPenyakit">
              <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>
          <Form.Item label="Riwayat Alergi" name="riwayatAlergi" rules={[{ required: true, message: 'Harap pilih riwayat alergi!' }]}>
            <Select size="middle" onChange={onAlergiChange} disabled={isEdit && !!form.getFieldValue('riwayatAlergi')} options={[
              { value: '0', label: <span>Tidak ada</span> },
              { value: '1', label: <span>1. Obat</span> },
              { value: '2', label: <span>2. Makanan</span> },
              { value: '3', label: <span>3. Udara</span> },
              { value: '4', label: <span>4. Lain-lain</span> },
            ]}/>
          </Form.Item>
          <Form.Item label="Riwayat Alergi Lainnya" name="riwayatAlergiLainnya">
            <Input.TextArea className="content-center" disabled={selectedAlergi !== '4'} autoSize/>
          </Form.Item>
          <Form.Item label="Riwayat Pengobatan" name="riwayatPengobatan">
              <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>

          {/* Pemeriksaan Fisik */}
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">2. Pemeriksaan Fisik</Divider>
          </div>
          <div className="col-span-2">
            <Divider orientation="left">A. Keadaan Umum</Divider>
          </div>
          <Form.Item label="Tingkat Kesadaran" name="tingkatKesadaran" rules={[{ required: true, message: 'Harap pilih tingkat kesadaran!' }]}>
            <Select size="middle" disabled={isEdit && !!form.getFieldValue('tingkatKesadaran')} options={[
              { value: '0', label: <span>1. Sadar Baik/Alert</span> },
              { value: '1', label: <span>2. Berespons dengan kata-kata/Voice</span> },
              { value: '2', label: <span>3. Hanya berespons jika dirangsang nyeri/Pain</span> },
              { value: '3', label: <span>4. Pasien tidak sadar/Unresponsive</span> },
              { value: '4', label: <span>5. Gelisah atau bingung</span> },
              { value: '5', label: <span>6. Acute Confusional States</span> }
            ]}/>
          </Form.Item>
          <div className="col-span-2">
            <Divider orientation="left">B. Organ Vital</Divider>
          </div>
          <Form.Item label="Denyut Jantung" name="denyutJantung">
            <Input style={inputStyling} disabled={isEdit} placeholder="satuan per menit"/>
          </Form.Item>
          <Form.Item label="Pernapasan" name="pernapasan">
            <Input style={inputStyling} disabled={isEdit} placeholder="satuan per menit"/>
          </Form.Item>
          <Form.Item label="Tekanan Darah Sistole" name="tekananDarahSistole">
            <Input style={inputStyling} disabled={isEdit} placeholder="per mmHg"/>
          </Form.Item>
          <Form.Item label="Tekanan Darah Diastole" name="tekananDarahDiastole">
            <Input style={inputStyling} disabled={isEdit} placeholder="per mmHg"/>
          </Form.Item>
          <Form.Item label="Suhu Tubuh" name="suhuTubuh">
            <Input style={inputStyling} disabled={isEdit} placeholder="derajat Celcius"/>
          </Form.Item>
          <Form.Item label="Kepala" name="kepala">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Mata" name="mata">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Telinga" name="telinga">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Hidung" name="hidung">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Rambut" name="rambut">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Bibir" name="bibir">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Gigi Geligi" name="gigiGeligi">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Lidah" name="lidah">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Langit-Langit" name="langitLangit">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Leher" name="leher">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Tenggorokan" name="tenggorokan">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Tonsil" name="tonsil">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Dada" name="dada">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Payudara" name="payudara">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Punggung" name="punggung">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Perut" name="perut">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Genital" name="genital">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Anus/Dubur" name="anusDubur">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Lengan Atas" name="lenganAtas">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Lengan Bawah" name="lenganBawah">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Jari Tangan" name="jariTangan">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Kuku Tangan" name="kukuTangan">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Persendian Tangan" name="persendianTangan">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Tungkai Atas" name="tungkaiAtas">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Tungkai Bawah" name="tungkaiBawah">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Jari Kaki" name="jariKaki">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Kuku Kaki" name="kukuKaki">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Persendian Kaki" name="persendianKaki">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">3. Pemeriksaan Psikologis, Sosial Ekonomi, Spiritual</Divider>
          </div>
          <Form.Item label="Status Psikologis" name="statusPsikologis" rules={[{ required: true, message: 'Harap pilih status psikologis!' }]}>
            <Select size="middle" disabled={isEdit && !!form.getFieldValue('statusPsikologis')} onChange={onPsikologisChange} options={[
              { value: '1', label: <span>1. Tidak ada kelainan</span> },
              { value: '2', label: <span>2. Cemas</span> },
              { value: '3', label: <span>3. Takut</span> },
              { value: '4', label: <span>4. Marah</span> },
              { value: '5', label: <span>5. Sedih</span> },
              { value: '6', label: <span>6. Lain-lain</span> },
            ]}/>
          </Form.Item>
          <Form.Item label="Status Psikologis Lainnya" name="statusPsikologisLainnya">
            <Input.TextArea className="content-center" disabled={selectedPsikologis !== '6'} autoSize placeholder="Tuliskan status psikologis lainnya"/>
          </Form.Item>
          <Form.Item label="Sosial Ekonomi" name="sosialEkonomi">
            <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>
          <Form.Item label="Spiritual" name="spiritual">
            <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>

          {/* PEMERIKSAAN SPESIALISTIK */}
          <div className="col-span-2 text-lg text-gray-900">
            Pemeriksaan Spesialistik
            <hr className="h-px bg-gray-700 border-0"/>
          </div>

          {/* Riwayat Penggunaan Obat */}
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">1. Riwayat Penggunaan Obat</Divider>
          </div>
          <Form.Item label="Nama Obat" name="namaObat">
              <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>
          <Form.Item label="Dosis" name="dosisObat">
              <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>
          <Form.Item label="Waktu Penggunaan" name="waktuPenggunaanObat">
              <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>

          {/* Diagnosis */}
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">2. Diagnosis</Divider>
          </div>
          <Form.Item label="Diagnosis Awal / Masuk" name="diagnosisAwal">
              <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>
          <Form.Item label="Diagnosis Akhir Primer" name="diagnosisAkhirPrimer">
              <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>
          <Form.Item label="Diagnosis Akhir Sekunder" name="diagnosisAkhirSekunder">
              <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
          </Form.Item>

          {/* Tindakan / Penolakan Tindakan (Informed Consent) */}
          <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">3. Persetujuan Tindakan / Penolakan Tindakan (Informed Consent)</Divider>
          </div>
          <Form.Item label="Nama Lengkap Pasien" name="namaLengkap">
            <Input style={inputStyling} disabled/>
          </Form.Item>
          <Form.Item label="Nama Kerabat Pendamping Pasien" name="namaKerabat">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Dokter yang Memberi Penjelasan" name="dokterPenjelasanTindakan">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Petugas yang Mendampingi" name="petugasPendampingTindakan">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Tindakan yang Dilakukan" name="namaTindakan">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Konsekuensi dari Tindakan" name="konsekuensiTindakan">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Persetujuan / Penolakan Tindakan" name="konfirmasiTindakan">
            <Select size="middle" disabled={isEdit && !!form.getFieldValue('konfirmasiTindakan')} options={[
              { value: '1', label: <span>Ya</span> },
              { value: '2', label: <span>Tidak</span> }
            ]}/>
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
          <div className="col-span-2">
            <Divider orientation="left">Pernyataan Tindakan (Tanda Tangan)</Divider>
          </div>
          <Form.Item label="Dokter yang Memberi Penjelasan" name="dokterPenjelasanTindakan">
              <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Pasien/Keluarga yang Menerima Penjelasan" name="pasienPenjelasanTindakan">
              <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Saksi 1" name="saksi1PenjelasanTindakan">
              <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Saksi 2" name="saksi2PenjelasanTindakan">
              <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>

          {/* LAMPIRAN BERKAS */}
          <div className="col-span-2">
            <Divider orientation="left">Lampiran Berkas</Divider>
          </div>
          <div className="col-span-2">
          {history?.isDokter ? (
            <>
              <div id="lampiran" className="flex flex-wrap w-full gap-4"></div>
            </>
          ) : (
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
              </p>
            </Dragger>
          )}
          </div>

          {/* JUDUL REKAM MEDIS */}
          <div className="col-span-2">
            <Divider orientation="left">Judul Rekam Medis</Divider>
          </div>
          <div className="col-span-2">
            <Form.Item label="Judul Rekam Medis" name="judulRekamMedis">
                <Input style={inputStyling} disabled={isEdit} rules={[{ required: true, message: 'Harap isi judul rekam medis!' }]}/>
            </Form.Item>
            <Form.Item label="Catatan" name="catatanRekamMedis">
              <Input.TextArea style={inputStylingTextArea} disabled={isEdit} rows={4}/>
            </Form.Item>
          </div>

          {/* TERAPI -PENDING- */}
          {/* <div className="col-span-2">
            <Divider orientation="left" orientationMargin="0">4. Terapi</Divider>
          </div>
          <div className="col-span-2">
            <Divider orientation="left">A. Tindakan</Divider>
          </div>
          <div className="col-span-2">
            <Divider orientation="left">B. Obat</Divider>
          </div> */}

          {/* <Form.Item label="Judul Rekam Medis" name="judulRekamMedis">
            <Input style={inputStyling} disabled={isEdit}/>
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
          <Form.Item label="Alergi" name="alergi">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Anamnesa" name="anamnesa">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item>
          <Form.Item label="Terapi" name="terapi">
            <Input style={inputStyling} disabled={isEdit}/>
          </Form.Item> */}
        </div>
        {!isEdit && (
          <Form.Item className="flex justify-center">
            <Button type="primary" ghost htmlType="submit" size="medium">Simpan Permanen</Button>
          </Form.Item>
        )}
      </Form>
    );
  };

  const EMRCard = () => {
    if (!selectedData.appointmentId) return <Card><Empty description="Silakan pilih Appointment"/></Card>;
    const doctor = { idDokter: selectedData.appointment?.idDokter, namaDokter: selectedData.appointment?.namaDokter, alamat: selectedData.appointment?.alamatDokter };
    const patient = { gender: profile.gender, usia: calculateAge(profile.tanggalLahir), golonganDarah: profile.golonganDarah };
    return (
      <Card>
        {selectedData.history ? (
          <>
            <p>Detail Riwayat Pengobatan:</p>
            <p>{selectedData.history.detail}</p>
          </>
        ) : (
          <EMRForm appointmentId={selectedData.appointmentId} doctor={doctor} patient={patient}/>
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
          style={{ backgroundColor: "#87d068", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
          icon={<UserOutlined/>}
      />
      )}
    </>
  )

  return (
    <>
      <NavbarController type={type} page={role} color="blue"/>
      <div className="grid grid-cols-1 py-24 mx-12 min-h-fit">
        <div className="grid justify-between grid-cols-5 gap-x-8">
          <div className="grid items-start col-span-5">
            <div className="grid mb-4"><BackButton linkToPage="/doctor/patient-list"/></div>
          </div>
          <div className="grid items-start col-span-5">
            <div className="grid grid-cols-2 gap-x-8">
              <div className="grid content-start gap-y-8">
                <Card className="w-full" actions={[<Button key="profilDetail" type="link" onClick={showProfileModal}>Detail Profil Pasien</Button>]}>
                  <div className="grid grid-cols-4 gap-y-8">
                    <div className="grid items-center justify-center row-span-2">{fotoProfil}</div>
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
                <div>
                  <Table columns={columns} dataSource={appointmentDataSource} size="middle"/>
                </div>
              </div>
              <div className="scrollable-column"><EMRCard/></div>
            </div>
          </div>
        </div>
      </div>
      <Modal width={1000} open={isModalOpen} onCancel={handleCancel} footer={null} style={{top: 20}}>
        <DoctorPatientProfile data={selectedData.profile} convert={convertProfileData} foto={fotoProfil}/>
      </Modal>
    </>
  );
}
