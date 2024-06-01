import { createRoot } from 'react-dom/client';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { Buffer } from 'buffer';
import { create } from "ipfs-http-client";
import { CONN } from "../../../../enum-global";
import { useState, useEffect } from "react";
import { InboxOutlined, UserOutlined, RightOutlined, FileOutlined } from "@ant-design/icons";
import { Upload, Table, Button, Card, Modal, Avatar, Empty, Form, Input, DatePicker, Tag, Divider, Select, Slider, Checkbox, Radio, message } from "antd";
const { Dragger } = Upload;
import DoctorPatientProfile from "../../components/Cards/NakesPatientProfile";
import BackButton from "../../components/Buttons/Navigations";
import NavbarController from "../../components/Navbar/NavbarController";
import getSigner from '../../components/utils/getSigner';
const ipfsClient = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

export default function DoctorPatientDetails({ role }) {
  const token = sessionStorage.getItem("userToken");
  const schedules = JSON.parse(sessionStorage.getItem("doctorSchedules"));
  const accountAddress = sessionStorage.getItem("accountAddress");
  const patientProfile = JSON.parse(sessionStorage.getItem("selectedProfile"));
  const patientAccount = JSON.parse(sessionStorage.getItem("selectedAccount"));
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  
  const [profile, setProfile] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('anamnesis');
  const [selectedDoctor, setSelectedDoctor] = useState({});
  const [selectedNurse, setSelectedNurse] = useState({});
  const [form] = Form.useForm();

  const handleDoctorChange = (value) => {
    const selected = schedules.dokter.find(dokter => dokter.namaDokter === value);
    if (selected) {
      setSelectedDoctor({ doctorAddress: selected.doctorAddress, namaDokter: selected.namaDokter });
      form.setFieldsValue({ namaDokter: value });
    }
  };
  
  const handleNurseChange = (value) => {
    const selected = uniqueNurses.find(perawat => perawat.namaAsisten === value);
    if (selected) { 
      setSelectedNurse({ nurseAddress: selected.nurseAddress, namaAsisten: selected.namaAsisten });
      form.setFieldsValue({ namaAsisten: value });
    }
  };

  useEffect(() => {
    form.setFieldsValue({ namaDokter: selectedDoctor.namaDokter, namaAsisten: selectedNurse.namaAsisten });
  }, [selectedDoctor, selectedNurse, form]);

  const handleCancel = () => {setIsModalOpen(false) };
  const showProfileModal = () => { setSelectedData({ profile }); setIsModalOpen(true); };
  const showEMR = (appointmentId) => {
    const appointment = appointments.find(a => a.appointmentId === appointmentId);
    setSelectedData({ appointmentId, appointment });
    handleDoctorChange(appointment.namaDokter);
    handleNurseChange(appointment.namaAsisten);
  };

  const getUniqueNurses = (schedules) => {
    const nurseMap = new Map();
    schedules.dokter.forEach(dokter => {
      dokter.jadwal.forEach(jadwal => {
        if (!nurseMap.has(jadwal.idPerawat)) { nurseMap.set(jadwal.namaAsisten, jadwal)} });
    });
    return Array.from(nurseMap.values());
  };
  const uniqueNurses = getUniqueNurses(schedules);

  const patientIdentifier = {
    accountAddress: patientProfile.accountAddress,
    dmrNumber: patientProfile.dmrNumber,
    emrNumber: patientProfile.emrNumber,
    nomorIdentitas: patientProfile.nomorIdentitas,
    namaLengkap: patientProfile.namaLengkap,
  }
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/doctor/patient-data/details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(patientIdentifier),
        });
        const data = await response.json();
        if (!response.ok) console.log(data.error, data.message);
        setProfile(patientProfile);
        setAppointments(data.patientAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [token]);

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
    { title: 'No. Rekam Medis', dataIndex: 'emrNumber', key: 'emrNumber' },
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
    emrNumber: appointment?.emrNumber,
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
    const genderMap = { '0': 'Tidak diketahui', '1': 'Laki-laki', '2': 'Perempuan', '3': 'Tidak dapat ditentukan', '4': 'Tidak mengisi' };
    const agamaMap = { '1': 'Islam', '2': 'Kristen (Protestan)', '3': 'Katolik', '4': 'Hindu', '5': 'Budha', '6': 'Konghuchu', '7': 'Penghayat', '8': 'Lain-lain' };
    const golonganDarahMap = { '1': 'A', '2': 'B', '3': 'AB', '4': 'O', '5': 'A+', '6': 'A-', '7': 'B+', '8': 'B-', '9': 'AB+', '10': 'AB-', '11': 'O+', '12': 'O-', '13': 'Tidak tahu' };
    const pendidikanMap = { '0': 'Tidak sekolah', '1': 'SD', '2': 'SLTP sederajat', '3': 'SLTA sederajat', '4': 'D1-D3 sederajat', '5': 'D4', '6': 'S1', '7': 'S2', '8': 'S3' };
    const pekerjaanMap = { '0': 'Tidak Bekerja', '1': 'PNS', '2': 'TNI/POLRI', '3': 'BUMN', '4': 'Pegawai Swasta/Wirausaha', '5': 'Lain-lain' };
    const pernikahanMap = { '1': 'Belum Kawin', '2': 'Kawin', '3': 'Cerai Hidup', '4': 'Cerai Mati' };
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

  const EMRForm = ({ appointmentId, selectedCategory }) => {
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

    // const filesToUpload = fileList.map((file) =>
    //   new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.onload = (event) => { resolve({ path: file.name, content: Buffer.from(event.target.result) }) };
    //     reader.onerror = (error) => reject(error);
    //     reader.readAsArrayBuffer(file);
    //   })
    // );

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
      const dmrNumber = profile.dmrNumber;
      const emrNumber = profile.emrNumber;
      const selectedAppointment = appointments.find(a => a.appointmentId === appointmentId);
      const accountAddress = selectedAppointment ? selectedAppointment.accountAddress : null;

      if (!emrNumber || !accountAddress) {
        message.error("Missing required patient or appointment information.");
        return;
      }

      // bundle lampiran rekam medis
      // const filesData = await Promise.all(filesToUpload);
      // const bundleContent = JSON.stringify(filesData);
      // const result = await ipfsClient.add(bundleContent);
      // const cid = result.cid.toString();

      const commonData = {
        accountAddress,
        dmrNumber,
        emrNumber,
        appointmentId,
        doctorAddress: selectedDoctor.doctorAddress || selectedAppointment.doctorAddress,
        namaDokter: selectedDoctor.namaDokter || selectedAppointment.namaDokter,
        nurseAddress: selectedNurse.nurseAddress || selectedAppointment.nurseAddress,
        namaAsisten: selectedNurse.namaAsisten || selectedAppointment.namaAsisten,
      };

      let endpoint;
      let specificData;
      switch (selectedCategory) {
        case 'anamnesis':
          endpoint = '/doctor/patient-list/patient-details/emr-anamnesis';
          specificData = { ...commonData, ...transformedValues };
          break;
        case 'diagnosis':
          endpoint = '/doctor/patient-list/patient-details/emr-diagnosis';
          specificData = {
            ...commonData,
            ...transformedValues,
            waktuPenjelasanTindakan: dayjs().format("HH:mm:ss"),
            tanggalPenjelasanTindakan: transformedValues.tanggalPenjelasanTindakan ? transformedValues.tanggalPenjelasanTindakan.format(dateFormat) : '',
            tanggalRekamMedis: dayjs().format("YYYY-MM-DD"),
            waktuRekamMedis: dayjs().format("HH:mm:ss"),
            datetimeEMR: dayjs().tz(dayjs.tz.guess()).format(),
            isDokter: true,
            alamatStaf: selectedData.appointment.alamatStaf,
            // lampiranRekamMedis: cid,
          };
          break;
        case 'gigi':
          endpoint = '/doctor/patient-list/patient-details/emr-gigi';
          specificData = { ...commonData, ...transformedValues };
          break;
        case 'anak':
          endpoint = '/doctor/patient-list/patient-details/emr-anak';
          specificData = { ...commonData, ...transformedValues };
          break;
        default:
          endpoint = '/doctor/patient-list/patient-details/emr';
          specificData = { ...commonData, ...transformedValues };
      }

      console.log({commonData})
      console.log({specificData});
      // const signer = await getSigner();
      // const signature = await signer.signMessage(JSON.stringify(specificData));
      // specificData.signature = signature;

      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}${endpoint}`,
          {
            // method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(specificData),
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
      if (selectedData) {
        const cid = selectedData ? selectedData.lampiranRekamMedis : null;
        const initialValues = {
          appointmentId: selectedData.appointmentId,
          appointmentCreatedAt: dayjs(selectedData.appointment.appointmentCreatedAt).format("DD-MM-YYYY"),
          namaDokter: selectedData.appointment.namaDokter,
          namaAsisten: selectedData.appointment.namaAsisten,
          tanggalRekamMedis: dayjs(selectedData.tanggalRekamMedis),
          namaLengkap: selectedData.namaLengkap,
          keluhanUtama: selectedData.keluhanUtama,
          riwayatPenyakit: selectedData.riwayatPenyakit,
          riwayatAlergi: selectedData.riwayatAlergi,
          riwayatAlergiLainnya: selectedData.riwayatAlergiLainnya,
          riwayatPengobatan: selectedData.riwayatPengobatan,
          tingkatKesadaran: selectedData.tingkatKesadaran,
          denyutJantung: selectedData.denyutJantung,
          pernapasan: selectedData.pernapasan,
          tekananDarahSistole: selectedData.tekananDarahSistole,
          tekananDarahDiastole: selectedData.tekananDarahDiastole,
          suhuTubuh: selectedData.suhuTubuh,
          kepala: selectedData.kepala,
          mata: selectedData.mata,
          telinga: selectedData.telinga,
          hidung: selectedData.hidung,
          rambut: selectedData.rambut,
          bibir: selectedData.bibir,
          gigiGeligi: selectedData.gigiGeligi,
          lidah: selectedData.lidah,
          langitLangit: selectedData.langitLangit,
          leher: selectedData.leher,
          tenggorokan: selectedData.tenggorokan,
          tonsil: selectedData.tonsil,
          dada: selectedData.dada,
          payudara: selectedData.payudara,
          punggung: selectedData.punggung,
          perut: selectedData.perut,
          genital: selectedData.genital,
          anusDubur: selectedData.anusDubur,
          lenganAtas: selectedData.lenganAtas,
          lenganBawah: selectedData.lenganBawah,
          jariTangan: selectedData.jariTangan,
          kukuTangan: selectedData.kukuTangan,
          persendianTangan: selectedData.persendianTangan,
          tungkaiAtas: selectedData.tulangAtas,
          tulangBawah: selectedData.tulangBawah,
          jariKaki: selectedData.jariKaki,
          kukuKaki: selectedData.kukuKaki,
          persendianKaki: selectedData.persendianKaki,
          statusPsikologis: selectedData.statusPsikologis,
          statusPsikologisLainnya: selectedData.statusPsikologisLainnya,
          sosialEkonomi: selectedData.sosialEkonomi,
          spiritual: selectedData.spiritual,
          namaObat: selectedData.namaObat,
          dosisObat: selectedData.dosisObat,
          waktuPenggunaanObat: selectedData.WaktuPenggunaanObat,
          diagnosisAwal: selectedData.diagnosisAwal,
          diagnosisAkhirPrimer: selectedData.diagnosisAkhirPrimer,
          diagnosisAkhirSekunder: selectedData.diagnosisAkhirSekunder,
          namaKerabat: selectedData.namaKerabat,
          dokterPenjelasanTindakan: selectedData.dokterPenjelasanTindakan,
          petugasPendampingTindakan: selectedData.petugasPendampingTindakan,
          namaTindakan: selectedData.namaTindakan,
          konsekuensiTindakan: selectedData.konsekuensiTindakan,
          konfirmasiTindakan: selectedData.konfirmasiTindakan,
          tanggalPenjelasanTindakan: dayjs(selectedData.tanggalPenjelasanTindakan),
          pasienPenjelasanTindakan: selectedData.pasienPenjelasanTindakan,
          saksi1PenjelasanTindakan: selectedData.saksi1PenjelasanTindakan,
          saksi2PenjelasanTindakan: selectedData.saksi2PenjelasanTindakan,
          lampiranRekamMedis: selectedData.lampiranRekamMedis,
          judulRekamMedis: selectedData.judulRekamMedis,
          catatanRekamMedis: selectedData.catatanRekamMedis,
        };
        // Check isDokter & isPerawat
        if (selectedData.isDokter) {
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
        } else if (selectedData.isPerawat) {
          // if isPerawat
          setIsEdit(false);
          form.setFieldsValue({
            appointmentId: selectedData.appointmentId,
            appointmentCreatedAt: dayjs(selectedData.appointment.appointmentCreatedAt).format("DD-MM-YYYY"),
            // namaDokter: selectedData.appointment.namaDokter,
            // namaAsisten: selectedData.appointment.namaAsisten,
            tanggalRekamMedis: dayjs(selectedData.appointment.tanggalRekamMedis),
            namaLengkap: selectedData.appointment.namaLengkap,
            keluhanUtama: selectedData.keluhanUtama,
            riwayatPenyakit: selectedData.riwayatPenyakit,
            riwayatAlergi: selectedData.riwayatAlergi,
            riwayatAlergiLainnya: selectedData.riwayatAlergiLainnya,
            riwayatPengobatan: selectedData.riwayatPengobatan,
            tingkatKesadaran: selectedData.tingkatKesadaran,
            denyutJantung: selectedData.denyutJantung,
            pernapasan: selectedData.pernapasan,
            tekananDarahSistole: selectedData.tekananDarahSistole,
            tekananDarahDiastole: selectedData.tekananDarahDiastole,
            suhuTubuh: selectedData.suhuTubuh,
            kepala: selectedData.kepala,
            mata: selectedData.mata,
            telinga: selectedData.telinga,
            hidung: selectedData.hidung,
            rambut: selectedData.rambut,
            bibir: selectedData.bibir,
            gigiGeligi: selectedData.gigiGeligi,
            lidah: selectedData.lidah,
            langitLangit: selectedData.langitLangit,
            leher: selectedData.leher,
            tenggorokan: selectedData.tenggorokan,
            tonsil: selectedData.tonsil,
            dada: selectedData.dada,
            payudara: selectedData.payudara,
            punggung: selectedData.punggung,
            perut: selectedData.perut,
            genital: selectedData.genital,
            anusDubur: selectedData.anusDubur,
            lenganAtas: selectedData.lenganAtas,
            lenganBawah: selectedData.lenganBawah,
            jariTangan: selectedData.jariTangan,
            kukuTangan: selectedData.kukuTangan,
            persendianTangan: selectedData.persendianTangan,
            tungkaiAtas: selectedData.tulangAtas,
            tulangBawah: selectedData.tulangBawah,
            jariKaki: selectedData.jariKaki,
            kukuKaki: selectedData.kukuKaki,
            persendianKaki: selectedData.persendianKaki,
            statusPsikologis: selectedData.statusPsikologis,
            statusPsikologisLainnya: selectedData.statusPsikologisLainnya,
            sosialEkonomi: selectedData.sosialEkonomi,
            spiritual: selectedData.spiritual,
            namaKerabat: profile.namaKerabat,
            dokterPenjelasanTindakan: selectedData.appointment.namaDokter,
            petugasPendampingTindakan: selectedData.appointment.namaAsisten,
            pasienPenjelasanTindakan: selectedData.appointment.namaLengkap,
            tanggalPenjelasanTindakan: dayjs(),
            lampiranRekamMedis: selectedData.lampiranRekamMedis,
            judulRekamMedis: selectedData.judulRekamMedis,
            catatanRekamMedis: selectedData.catatanRekamMedis,
          });
        } else {
          // if !isDokter dan !isPerawat
          form.resetFields();
          form.setFieldsValue({
            appointmentId: selectedData.appointmentId,
            appointmentCreatedAt: dayjs(selectedData.appointment.appointmentCreatedAt).format("DD-MM-YYYY"),
            namaDokter: selectedData.appointment.namaDokter,
            namaAsisten: selectedData.appointment.namaAsisten,
            tanggalRekamMedis: dayjs(selectedData.appointment.tanggalRekamMedis),
            namaLengkap: selectedData.appointment.namaLengkap,
            namaKerabat: profile.namaKerabat,
            dokterPenjelasanTindakan: selectedData.appointment.namaDokter,
            petugasPendampingTindakan: selectedData.appointment.namaAsisten,
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
          // namaDokter: selectedData.appointment.namaDokter,
          // namaAsisten: selectedData.appointment.namaAsisten,
          tanggalRekamMedis: dayjs(selectedData.appointment.tanggalRekamMedis),
          namaLengkap: selectedData.appointment.namaLengkap,
          namaKerabat: profile.namaKerabat,
          dokterPenjelasanTindakan: selectedData.appointment.namaDokter,
          petugasPendampingTindakan: selectedData.appointment.namaAsisten,
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
          { selectedCategory === 'anamnesis' && (
            <>
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

              {/* PENGKAJIAN AWAL */}
              <div className="col-span-2 text-lg text-gray-900">
                Pengkajian Awal
                <hr className="h-px bg-gray-700 border-0"/>
              </div>

              {/* Anamnesis */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">1. Anamnesis</Divider>
              </div>
              <Form.Item label="Dokter / Tenaga Medis" name="namaDokter">
                <Select
                  showSearch
                  placeholder="Pilih Dokter"
                  optionFilterProp="children"
                  onChange={handleDoctorChange}
                  value={selectedDoctor.namaDokter}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={schedules.dokter.map(dokter => ({ value: dokter.namaDokter, label: dokter.namaDokter }))}
                />
              </Form.Item>
              <Form.Item label="Perawat / Bidan / Nutrisionist / Sanitarian" name="namaAsisten">
                <Select
                  showSearch
                  placeholder="Pilih Perawat"
                  optionFilterProp="children"
                  onChange={handleNurseChange}
                  value={selectedNurse.namaAsisten}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={uniqueNurses.map(nurse => ({
                    value: nurse.namaAsisten,
                    label: nurse.namaAsisten,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Keluhan Utama" name="keluhanUtama" >
                <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
              </Form.Item>
              <Form.Item label="Keluhan Tambahan" name="keluhanTambahan">
                <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
              </Form.Item>
              <Form.Item label="Lama Sakit" required>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Input style={inputStyling} placeholder="0" />
                  <span>Thn</span>
                  <Input style={inputStyling} placeholder="0" />
                  <span>Bln</span>
                  <Input style={inputStyling} placeholder="0" />
                  <span>Hr</span>
                </div>
              </Form.Item>
              <Form.Item label="Riwayat Penyakit" name="riwayatPenyakit">
                <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
              </Form.Item>
              {/* <Form.Item label="Riwayat Pengobatan" name="riwayatPengobatan">
                <Input.TextArea style={inputStyling} className="content-center" disabled={isEdit} autoSize/>
              </Form.Item> */}
              <Form.Item label="Riwayat Alergi" name="riwayatAlergi" >
                <Select size="middle" onChange={onAlergiChange} disabled={isEdit && !!form.getFieldValue('riwayatAlergi')} options={[
                  { value: '1', label: <span>Tidak ada</span> },
                  { value: '2', label: <span>1. Obat</span> },
                  { value: '3', label: <span>2. Makanan</span> },
                  { value: '4', label: <span>3. Udara</span> },
                  { value: '5', label: <span>4. Lain-lain</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Riwayat Alergi Lainnya" name="riwayatAlergiLainnya">
                <Input.TextArea className="content-center" disabled={selectedAlergi !== '4'} autoSize/>
              </Form.Item>

              {/* PEMERIKSAAN FISIS */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">2. Pemeriksaan Psikologis, Sosial Ekonomi, Spiritual</Divider>
              </div>
              <Form.Item label="Penggunaan alat bantu ketika beraktivitas" name="alatBantu" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('alatBantu')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Mengalami kendala komunikasi" name="kendalaKomunikasi" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('kendalaKomunikasi')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Ada yang merawat di rumah" name="perawatRumah" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('perawatRumah')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Membutuhkan bantuan orang lain ketika beraktivitas" name="bantuanOrangLain" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('bantuanOrangLain')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Ekspresi dan emosi" name="ekspresiDanEmosi" >
                <Select size="middle" disabled={isEdit && !!form.getFieldValue('ekspresiDanEmosi')} onChange={onPsikologisChange} options={[
                  { value: '1', label: <span>1. Tidak ada kelainan</span> },
                  { value: '2', label: <span>2. Cemas</span> },
                  { value: '3', label: <span>3. Takut</span> },
                  { value: '4', label: <span>4. Marah</span> },
                  { value: '5', label: <span>5. Sedih</span> },
                  { value: '6', label: <span>6. Lain-lain</span> },
                ]}/>
              </Form.Item>
              {/* <Form.Item label="Status Psikologis Lainnya" name="statusPsikologisLainnya">
                <Input.TextArea className="content-center" disabled={selectedPsikologis !== '6'} autoSize placeholder="Tuliskan status psikologis lainnya"/>
              </Form.Item> */}
              <Form.Item label="Bahasa yang digunakan" name="bahasa" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('bahasa')}>
                  <Radio value="1">Indonesia</Radio>
                  <Radio value="2">Daerah</Radio>
                  <Radio value="3">Lainnya</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Pekerjaan" name="pekerjaan">
                <Input style={inputStyling} disabled={isEdit}/>
              </Form.Item>
              <Form.Item label="Tinggal dengan" name="tinggalBersama">
                <Radio.Group disabled={isEdit && !!form.getFieldValue('tinggalBersama')}>
                  <Radio value="1">Sendiri</Radio>
                  <Radio value="2">Suami/Istri</Radio>
                  <Radio value="3">Orang tua</Radio>
                  <Radio value="4">Lainnya</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Gangguan jiwa di masa lalu" name="gangguanJiwaLampau" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('gangguanJiwaLampau')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Sosial Ekonomi" name="sosialEkonomi" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('sosialEkonomi')}>
                  <Radio value="1">Baik</Radio>
                  <Radio value="2">Cukup</Radio>
                  <Radio value="3">Kurang</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Status Ekonomi" name="statusEkonomi" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('statusEkonomi')}>
                  <Radio value="1">Baik</Radio>
                  <Radio value="2">Cukup</Radio>
                  <Radio value="3">Kurang</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Jaminan Pengobatan" name="jaminanPengobatan" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('jaminanPengobatan')}>
                  <Radio value="1">BPJS</Radio>
                  <Radio value="2">Umum / Mandiri</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Hubungan dengan keluarga" name="hubunganKeluarga" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('hubunganKeluarga')}>
                  <Radio value="1">Orang Tua</Radio>
                  <Radio value="2">Anak</Radio>
                  <Radio value="3">Kerabat</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Pemeriksaan Fisik */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">3. Pemeriksaan Fisik</Divider>
              </div>
              <div className="col-span-2">
                <Divider orientation="left">A. Keadaan Umum</Divider>
              </div>
              <Form.Item label="Tingkat Kesadaran" name="tingkatKesadaran" >
                <Select size="middle" disabled={isEdit && !!form.getFieldValue('tingkatKesadaran')} options={[
                  { value: '1', label: <span>1. Sadar Baik/Alert</span> },
                  { value: '2', label: <span>2. Berespons dengan kata-kata/Voice</span> },
                  { value: '3', label: <span>3. Hanya berespons jika dirangsang nyeri/Pain</span> },
                  { value: '4', label: <span>4. Pasien tidak sadar/Unresponsive</span> },
                  { value: '5', label: <span>5. Gelisah atau bingung</span> },
                  { value: '6', label: <span>6. Acute Confusional States</span> }
                ]}/>
              </Form.Item>
              <div className="col-span-2">
                <Divider orientation="left">B. Organ Vital</Divider>
              </div>
              <Form.Item label="Detak Nadi" name="detakNadi">
                <Input style={inputStyling} disabled={isEdit} placeholder="/menit"/>
              </Form.Item>
              <Form.Item label="Pernapasan" name="pernapasan">
                <Input style={inputStyling} disabled={isEdit} placeholder="/menit"/>
              </Form.Item>
              <Form.Item label="Tekanan Darah Sistole" name="tekananDarahSistole">
                <Input style={inputStyling} disabled={isEdit} placeholder="/mm"/>
              </Form.Item>
              <Form.Item label="Tekanan Darah Diastole" name="tekananDarahDiastole">
                <Input style={inputStyling} disabled={isEdit} placeholder="/Hg"/>
              </Form.Item>
              <Form.Item label="MAP" name="map">
                <Input style={inputStyling} disabled={isEdit} placeholder="/mmHg"/>
              </Form.Item>
              <Form.Item label="Berat Badan" name="beratBadan">
                <Input style={inputStyling} disabled={isEdit} placeholder="kg"/>
              </Form.Item>
              <Form.Item label="Tinggi Badan" name="tinggiBadan">
                <Input style={inputStyling} disabled={isEdit} placeholder="cm"/>
              </Form.Item>
              <Form.Item label="Cara ukur tinggi badan" name="caraUkurTinggiBadan" >
                <Select size="middle" disabled={isEdit && !!form.getFieldValue('caraUkurTinggiBadan')} options={[
                  { value: '1', label: <span>1. Berdiri</span> },
                  { value: '2', label: <span>2. Duduk</span> },
                  { value: '3', label: <span>3. Berbaring</span> }
                ]}/>
              </Form.Item>
              <Form.Item label="Suhu Tubuh" name="suhuTubuh">
                <Input style={inputStyling} disabled={isEdit} placeholder="°C"/>
              </Form.Item>
              <Form.Item label="Saturasi (Sp02)" name="saturasi">
                <Input style={inputStyling} disabled={isEdit} placeholder="%"/>
              </Form.Item>
              <Form.Item label="Status hamil" name="statusHamil" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('statusHamil')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Detak Jantung" name="detakJantung" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('detakJantung')}>
                  <Radio value="1">Regular</Radio>
                  <Radio value="2">Iregular</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Triage" name="triage" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('triage')}>
                  <Radio value="1">Gawat Darurat</Radio>
                  <Radio value="2">Darurat</Radio>
                  <Radio value="3">Tidak Gawat Darurat</Radio>
                  <Radio value="4">Meninggal</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Asesmen Nyeri */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">4. Asesmen Nyeri</Divider>
              </div>
              <Form.Item label="Pasien merasakan nyeri" name="nyeriTubuh" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('nyeriTubuh')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Pencetus nyeri" name="pencetusNyeri">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Lokasi nyeri" name="lokasiNyeri">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Skala nyeri (0 = Tidak Nyeri, 10 = Sangat Nyeri)" name="skalaNyeri">
                <Slider
                  min={1}
                  max={10}
                  // onChange={onChange}
                  // value={typeof inputValue === 'number' ? inputValue : 0}
                />
              </Form.Item>
              <Form.Item label="Waktu nyeri" name="waktuNyeri" >
                <Radio.Group disabled={isEdit && !!form.getFieldValue('waktuNyeri')}>
                  <Radio value="1">Intermiten</Radio>
                  <Radio value="2">Hilang timbul</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Asesmen Risiko Jatuh */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">5. Asesmen Risiko Jatuh</Divider>
              </div>
              <div className="col-span-2">
                <Form.Item label="Perhatikan cara berjalan pasien saat akan duduk di kursi. Apakah pasien tampak tidak seimbang?" name="pasienTidakSeimbang">
                  <Radio.Group disabled={isEdit && !!form.getFieldValue('pasienTidakSeimbang')}>
                    <Radio value="1">Ya</Radio>
                    <Radio value="0">Tidak</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
              <div className="col-span-2">
                <Form.Item label="Apakah pasien memegang benda sekitar untuk penopang tubuh?" name="pasienButuhPenopang">
                  <Radio.Group disabled={isEdit && !!form.getFieldValue('pasienButuhPenopang')}>
                    <Radio value="1">Ya</Radio>
                    <Radio value="0">Tidak</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>

              {/* Lainnya */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">6. Lainnya</Divider>
              </div>
              <Form.Item label="Terapi" name="terapi">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Rencana Tindakan" name="rencanaTindakan">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Tipe Asuhan Keperawatan" name="tipeAskep">
                <Radio.Group disabled={isEdit && !!form.getFieldValue('tipeAskep')}>
                  <Radio value="1">Text</Radio>
                  <Radio value="2">SOAP</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Edukasi" name="edukasi">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Deskripsi Asuhan Keperawatan" name="deskripsiAskep">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Observasi" name="observasi">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Keterangan Lainnya" name="keteranganLainnya">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Biopsikososial" name="biopsikososial">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Tindakan Keperawatan" name="tindakanKeperawatan">
                <Input style={inputStyling} disabled={isEdit} />
              </Form.Item>
              <Form.Item label="Merokok" name="merokok">
                <Radio.Group disabled={isEdit && !!form.getFieldValue('merokok')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="2">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Konsumsi alkohol" name="konsumsiAlkohol">
                <Radio.Group disabled={isEdit && !!form.getFieldValue('konsumsiAlkohol')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Kurang sayur/buah" name="kurangSayurBuah">
                <Radio.Group disabled={isEdit && !!form.getFieldValue('kurangSayurBuah')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Keadaan Fisik */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">7. Keadaan Fisik</Divider>
              </div>
              <Form.Item name="pemeriksaanKulit" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Kulit</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanLeher" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Leher</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanKuku" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Kuku</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanDadaPunggung" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Dada dan Punggung</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanKepala" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Kepala</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanKardiovaskuler" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Kardiovaskuler</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanWajah" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Wajah</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanDadaAksila" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Dada dan Aksila</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanMata" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Mata</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanAbdomenPerut" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Abdomen Perut</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanTelinga" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Telinga</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanEktermitasAtas" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Ekstermitas Atas (Bahu, Siku, Tangan)</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanHidungSinus" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Hidung dan Sinus</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanEkstermitasBawah" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Ekstermitas Bawah (Panggul, Lutut, Pergelangan Kaki dan Telapak Kaki)</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanMulutBibir" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Mulut dan Bibir</Checkbox>
              </Form.Item>
              <Form.Item name="pemeriksaanGenitaliaWanita" valuePropName="checked">
                <Checkbox disabled={isEdit}>Pemeriksaan Genitalia Wanita</Checkbox>
              </Form.Item>

            </>
          )}

          { selectedCategory === 'diagnosis' && (
            <>
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
            </>
          )}

          {/* Dummy Form for Gigi */}
          { selectedCategory === 'gigi' && (
            <>
              <div className="col-span-2 text-lg text-gray-900">
                Dummy Form Gigi
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Contoh Input Gigi" name="contohInputGigi">
                <Input style={inputStyling} disabled={isEdit}/>
              </Form.Item>
            </>
          )}

          {/* Dummy Form for Anak */}
          { selectedCategory === 'anak' && (
            <>
              <div className="col-span-2 text-lg text-gray-900">
                Dummy Form Anak
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Contoh Input Anak" name="contohInputAnak">
                <Input style={inputStyling} disabled={isEdit}/>
              </Form.Item>
            </>
          )}
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
    const doctor = { idDokter: selectedData.appointment?.idDokter, namaDokter: selectedData.appointment?.namaDokter, alamat: selectedData.appointment?.doctorAddress };
    const patient = { gender: profile.gender, usia: calculateAge(profile.tanggalLahir), golonganDarah: profile.golonganDarah };
    return (
      <Card>
        {selectedData.history ? (
          <>
            <p>Detail Riwayat Pengobatan:</p>
            <p>{selectedData.history.detail}</p>
          </>
        ) : (
          <EMRForm appointmentId={selectedData.appointmentId} doctor={doctor} patient={patient} selectedCategory={selectedCategory} />
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
  );

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
                      <p>{convertProfileData(profile).emrNumber}</p>
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
              <div>
                <div className='grid grid-cols-4 w-full gap-x-8 pb-4'>
                  <Button
                    type="default"
                    className={selectedCategory === 'anamnesis' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                    onClick={() => setSelectedCategory('anamnesis')}
                  >
                    Anamnesis
                  </Button>
                  <Button
                    type="default"
                    className={selectedCategory === 'diagnosis' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                    onClick={() => setSelectedCategory('diagnosis')}
                  >
                    Diagnosis
                  </Button>
                  <Button
                    type="default"
                    className={selectedCategory === 'gigi' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                    onClick={() => setSelectedCategory('gigi')}
                  >
                    Gigi
                  </Button>
                  <Button
                    type="default"
                    className={selectedCategory === 'anak' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                    onClick={() => setSelectedCategory('anak')}
                  >
                    Anak
                  </Button>
                </div>
                <div className='scrollable-column'>
                  <EMRCard/>
                </div>
              </div>
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
