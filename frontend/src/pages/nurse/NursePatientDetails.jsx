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
import { SaveOutlined, InboxOutlined, UserOutlined, RightOutlined, FileOutlined } from "@ant-design/icons";
import { Upload, Table, Button, Card, Modal, Avatar, Empty, Form, Input, Row, Col, DatePicker, Tag, Divider, Select, Slider, Checkbox, Radio, InputNumber, message } from "antd";
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
const { TextArea, Search } = Input;
const { Dragger } = Upload;
import DoctorPatientProfile from "../../components/Cards/NakesPatientProfile";
import BackButton from "../../components/Buttons/Navigations";
import NavbarController from "../../components/Navbar/NavbarController";
import getSigner from '../../components/utils/getSigner';
const ipfsClient = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

export default function NursePatientDetails({ role }) {
  const token = sessionStorage.getItem("userToken");
  const schedules = JSON.parse(sessionStorage.getItem("doctorSchedules"));
  const accountAddress = sessionStorage.getItem("accountAddress");
  const patientProfile = JSON.parse(sessionStorage.getItem("selectedProfile"));
  const patientAccount = JSON.parse(sessionStorage.getItem("selectedAccount"));
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPoli, setSelectedPoli] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('anamnesis');
  const [selectedDoctor, setSelectedDoctor] = useState({});
  const [selectedNurse, setSelectedNurse] = useState({});
  const [isNoDisease, setIsNoDisease] = useState(selectedData?.appointment?.anamnesis?.rps == null && selectedData?.appointment?.anamnesis?.rpd && selectedData?.appointment?.anamnesis?.rpk == null);
  const [isNoAllergy, setIsNoAllergy] = useState(selectedData?.appointment?.anamnesis?.alergiObat == null && selectedData?.appointment?.anamnesis?.alergiMakanan == null && selectedData?.appointment?.anamnesis?.alergiLainnya == null);
  const [isEdit, setIsEdit] = useState(false);
  const [isDataFinished, setIsDataFinished] = useState(false);
  const [form] = Form.useForm();
  const dateFormat = 'DD/MM/YYYY';
  const onChange = (date, dateString) => { console.log(date, dateString) };

  const disableCategories = (appointment) => {
    const disabled = { anamnesis: false, diagnosis: false, kehamilan: false, tbParu: false, lab: false, selesai: false };
    if (appointment?.diagnosis) {
      disabled.kehamilan = true;
      disabled.tbParu = true;
    } else if (appointment?.kehamilan) {
      disabled.diagnosis = true;
      disabled.tbParu = true;
    } else if (appointment?.tb) {
      disabled.diagnosis = true;
      disabled.kehamilan = true;
    } else if (appointment?.status === "canceled") {
      disabled.anamnesis = true;
      disabled.diagnosis = true;
      disabled.kehamilan = true;
      disabled.tbParu = true;
      disabled.lab = true;
      disabled.selesai = true;
    }
    return disabled;
  };
  const disabledCategories = disableCategories(selectedData?.appointment);

useEffect(() => {
  if (selectedData) {
    const appointment = selectedData.appointment || {};
    if (appointment.selesai) {
      setIsDataFinished(true);
      setIsEdit(false);
    } else {
      setIsDataFinished(false);
    }
  }
}, [selectedData]);

  const LabAttachments = ({ files }) => {
    useEffect(() => {
      if (files && files.length > 0) {
        Promise.all(files.map(file => 
          fetch(`${CONN.IPFS_LOCAL}/${file.path}`)
            .then(response => response.arrayBuffer())
            .then(buffer => ({
              name: file.name,
              path: file.path,
              blob: new Blob([buffer])
            }))
        ))
        .then(fileDataArray => {
          const root = createRoot(document.getElementById("lampiran"));
          const cards = fileDataArray.map(fileData => {
            const url = URL.createObjectURL(fileData.blob);
            let attachmentElement;
            let previewElement;
  
            if (fileData.name.endsWith('.png') || fileData.name.endsWith('.jpg') || fileData.name.endsWith('.jpeg')) {
              attachmentElement = document.createElement('img');
              attachmentElement.src = url;
              attachmentElement.alt = fileData.name;
              previewElement = <img alt={fileData.name} src={url} style={{ width: '28px', height: 'auto' }} />;
            } else {
              attachmentElement = document.createElement('img');
              attachmentElement.src = url;
              attachmentElement.alt = fileData.name;
              previewElement = <FileOutlined style={{ fontSize: '28px' }} />;
            }
  
            const fileName = fileData.name.split('.').slice(0, -1).join('.');
            const fileExtension = fileData.name.split('.').pop();
  
            const cardContent = (
              <>
                {previewElement}
              </>
            );
  
            return (
              <Card key={fileData.name} className="w-[115px] h-fit hover:shadow">
                <a href={url} download={fileData.name} className="grid justify-items-center gap-y-2 hover:text-gray-900">
                  {cardContent}
                  <p>{fileName}.{fileExtension}</p>
                </a>
              </Card>
            );
          });
          root.render(cards);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      }
    }, [files]);
  
    return <div id="lampiran" className="flex flex-wrap w-full gap-4"></div>;
  };

  const handleDiseaseCheckbox = (e) => {
    setIsNoDisease(e.target.checked);
    if (e.target.checked) {
      form.setFieldsValue({
        rps: null,
        rpd: null,
        rpk: null,
      });
    }
  };

  const handleAllergyCheckbox = (e) => {
    setIsNoAllergy(e.target.checked);
    if (e.target.checked) {
      form.setFieldsValue({
        alergiObat: null,
        alergiMakanan: null,
        alergiLainnya: null,
      });
    }
  };

  const handleDoctorChange = (value) => {
    const selected = schedules.dokter.find(dokter => dokter.namaDokter === value);
    if (selected) {
      setSelectedDoctor({ doctorAddress: selected.doctorAddress, namaDokter: selected.namaDokter, namaDokterAnamnesis: selected.namaDokter, namaDokterDiagnosis: selected.namaDokter, namaDokterKia: selected.namaDokter, namaDokterTb: selected.namaDokter, namaDokterSelesai: selected.namaDokter});
      form.setFieldsValue({ namaDokter: value, namaDokterKia: value, namaDokterTb: value, namaDokterSelesai: value});
    }
  };
  
  const handleNurseChange = (value) => {
    const selected = uniqueNurses.find(perawat => perawat.namaAsisten === value);
    if (selected) { 
      setSelectedNurse({ nurseAddress: selected.nurseAddress, namaAsisten: selected.namaAsisten, namaAsistenAnamnesis: selected.namaAsisten, namaAsistenDiagnosis: selected.namaAsisten, namaAsistenKia: selected.namaAsisten, namaAsistenTb: selected.namaAsisten});
      form.setFieldsValue({ namaAsisten: value, namaAsistenKia: value, namaAsistenTb: value});
    }
  };

  useEffect(() => {
    if (selectedData) {
      const anamnesis = selectedData?.appointment?.anamnesis || {};
      const noDisease = anamnesis.rps == null && anamnesis.rpd == null && anamnesis.rpk == null;
      const noAllergy = anamnesis.alergiObat == null && anamnesis.alergiMakanan == null && anamnesis.alergiLainnya == null;
      setIsNoDisease(noDisease);
      setIsNoAllergy(noAllergy);
    }
  }, [selectedData]);

  useEffect(() => {
    form.setFieldsValue({ namaDokter: selectedDoctor.namaDokter, namaAsisten: selectedNurse.namaAsisten, namaDokterAnamnesis: selectedDoctor.namaDokter, namaAsistenAnamnesis: selectedNurse.namaAsisten, namaDokterDiagnosis: selectedDoctor.namaDokterDiagnosis, namaAsistenDiagnosis: selectedNurse.namaAsistenDiagnosis, namaDokterKia: selectedDoctor.namaDokterKia, namaAsistenKia: selectedNurse.namaAsistenKia, namaDokterTb: selectedDoctor.namaDokterTb, namaAsistenTb: selectedNurse.namaAsistenTb, namaDokterSelesai: selectedDoctor.namaDokterSelesai});
  }, [selectedDoctor, selectedNurse, form]);

  const handleCancel = () => {setIsModalOpen(false) };
  const showProfileModal = () => { setSelectedData({ profile }); setIsModalOpen(true); };

  const showEMR = (appointmentId) => {
    const appointment = appointments.find(a => a.appointmentId === appointmentId);
    setSelectedData({ appointmentId, appointment });
    setStatus(appointment.status);
    if (appointment.status === "done") {
      setIsDataFinished(true);
      setIsEdit(false);
    } else if (appointment.status === "active") {
      setIsDataFinished(false);
      setIsEdit(true);
    } else if (appointment.status === "ongoing") {
      setIsDataFinished(false);
      setIsEdit(true);
    } else if (appointment.status === "canceled") {
      setIsDataFinished(true);
      setIsEdit(false);
    }
    handleDoctorChange(appointment.namaDokter);
    handleNurseChange(appointment.namaAsisten);
  };

  const getUniqueNurses = (schedules) => {
    const nurseMap = new Map();
    schedules.dokter.forEach(dokter => {
      dokter.jadwal.forEach(jadwal => {
        if (!nurseMap.has(jadwal.idPerawat)) { nurseMap.set(jadwal.namaAsisten, jadwal)}
      });
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

  // initially get patient data with POST
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/nurse/patient-data/details`, {
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
    { title: 'Dokter', dataIndex: 'namaDokter', key: 'namaDokter' },
    { title: 'Poli', dataIndex: 'spesialisasi',
      render: (spesialisasi) => (
        <Tag color={ spesialisasi === "Umum" ? "blue" :  spesialisasi === "TB Paru" ? "green" : "purple" }>
          {spesialisasi}
        </Tag>
      ) },
    { title: 'Jadwal Berobat', dataIndex: 'tanggalTerpilih', key: 'tanggalTerpilih' },
    { title: 'Status', dataIndex: 'status',
      render: (status) => (
        <Tag color={ 
          status === "ongoing" ? "blue" : 
          status === "active" ? "gold" : 
          status === "done" ? "green" : 
          "red" 
        }>
          { 
            status === "ongoing" ? "Sedang berjalan" : 
            status === "active" ? "Sedang diperiksa" : 
            status === "done" ? "Selesai" : 
            "Batal" 
          }
        </Tag>
      ) },
    { title: 'Aksi', key: 'action', render: (_, record) => (<Button type="primary" ghost onClick={() => showEMR(record.appointmentId)} icon={<RightOutlined/>}/>) },
  ];
  const userImage = profile?.foto;

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
    profile.tanggalLahir = profile.tanggalLahir ? new Date(profile.tanggalLahir).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
    profile.tanggalLahirKerabat = profile.tanggalLahirKerabat ? new Date(profile.tanggalLahirKerabat).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
    return profile;
  }

  // const dateFormat = "YYYY-MM-DD";
  const inputStyling = { border: "1px solid #E2E8F0", borderRadius: "6px", height: "32px" };
  const inputStylingTextArea = { border: "1px solid #E2E8F0", borderRadius: "6px" };

  const EMRForm = ({ appointmentId, selectedCategory }) => {
    const [fileList, setFileList] = useState([]);
    const [selectedPsikologis, setSelectedPsikologis] = useState('');
    const [selectedstatusPemeriksaanLab, setSelectedstatusPemeriksaanLab] = useState('');
    const [selectedStatusPulang, setSelectedStatusPulang] = useState('');
    const [selectedPenolongPersalinan, setSelectedPenolongPersalinan] = useState('');
    const [selectedPendampingPersalinan, setSelectedPendampingPersalinan] = useState('');
    const [selectedTransportasiPersalinan, setSelectedTransportasiPersalinan] = useState('');
    const [selectedPendonorPersalinan, setSelectedPendonorPersalinan] = useState('');
    const [selectedHasilPengobatanTb, setSelectedHasilPengobatanTb] = useState('');
    const [selectedRujukanDari, setSelectedRujukanDari] = useState('');
    const [selectedTempatPersalinan, setSelectedTempatPersalinan] = useState('');

    const handleEdit = () => { setIsEdit(true) };
    const handleCancel = () => { setIsEdit(false) };

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

    const uploadFiles = async (files) => {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
              try {
                const result = await ipfsClient.add(Buffer.from(event.target.result));
                resolve({ name: file.name, path: result.path });
              } catch (error) {
                reject(error);
              }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
          });
        })
      );
      return uploadedFiles;
    };

    const onPsikologisChange = value => { setSelectedPsikologis(value) };
    const onstatusPemeriksaanLabChange = value => { setSelectedstatusPemeriksaanLab(value) };
    const onStatusPulangChange = value => { setSelectedStatusPulang(value) };
    const onPenolongPersalinanChange = value => { setSelectedPenolongPersalinan(value) };
    const onPendampingPersalinanChange = value => { setSelectedPendampingPersalinan(value) };
    const onTransportasiPersalinanChange = value => { setSelectedTransportasiPersalinan(value) };
    const onPendonorPersalinanChange = value => { setSelectedPendonorPersalinan(value) };
    const onHasilPengobatanTbChange = value => { setSelectedHasilPengobatanTb(value) };
    const onRujukanDariChange = value => { setSelectedRujukanDari(value) };
    const onTempatPersalinanChange = value => { setSelectedTempatPersalinan(value) };
    const onValuesChange = (changedValues, allValues) => {
      const keys = Object.keys(changedValues);
      keys.forEach(key => { if (isEdit && changedValues[key] === '') { form.setFieldsValue({ [key]: null }) } });
    };
    const onFinish = async (values) => {
      const uploadedFiles = await uploadFiles(fileList);
      let transformedValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (value instanceof dayjs) {
          acc[key] = value.format('DD/MM/YYYY');
        } else {
          acc[key] = value === undefined ? null : value;
        }
        return acc;
      }, {});

      if (selectedCategory === 'anamnesis') {
        transformedValues = {
          ...transformedValues,
          rps: isNoDisease ? "" : transformedValues.rps,
          rpd: isNoDisease ? "" : transformedValues.rpd,
          rpk: isNoDisease ? "" : transformedValues.rpk,
          alergiObat: isNoAllergy ? "" : transformedValues.alergiObat,
          alergiMakanan: isNoAllergy ? "" : transformedValues.alergiMakanan,
          alergiLainnya: isNoAllergy ? "" : transformedValues.alergiLainnya,
        };
      } else if (selectedCategory === 'lab') {
        transformedValues = {
          ...transformedValues,
          hematology: hematologyCheckedList,
          clinicalChemistry: clinicalChemistryCheckedList,
          urinalysis: urinalysisCheckedList,
          microbiology: microbiologyCheckedList,
          immunology: immunologyCheckedList
        };
      }

      const dmrNumber = profile.dmrNumber;
      const emrNumber = profile.emrNumber;
      const selectedAppointment = appointments.find(a => a.appointmentId === appointmentId);
      const accountAddress = selectedAppointment ? selectedAppointment.accountAddress : null;

      if (!emrNumber || !accountAddress) {
        message.error("Missing required patient or appointment information.");
        return;
      }

      const commonData = {
        accountAddress,
        dmrNumber,
        emrNumber,
        appointmentId,
        doctorAddress: selectedAppointment.doctorAddress,
        namaDokter: selectedAppointment.namaDokter,
        nurseAddress: selectedAppointment.nurseAddress,
        namaAsisten: selectedAppointment.namaAsisten,
        tanggalRekamMedis: dayjs().format("DD/MM/YYYY"),
        waktuRekamMedis: dayjs().format("HH:mm:ss"),
        datetimeEMR: dayjs().tz(dayjs.tz.guess()).format(),
      };

      // HARUS GANTI / REVISI
      let endpoint;
      let specificData;
      switch (selectedCategory) {
        case 'anamnesis':
          endpoint = '/nurse/patient-list/patient-details/emr-anamnesis';
          specificData = { doctorAddress: selectedDoctor.doctorAddress, nurseAddress: selectedNurse.nurseAddress, anamnesisCreatedAt: new Date().toISOString(),...transformedValues };
          break;
        case 'diagnosis':
          endpoint = '/nurse/patient-list/patient-details/emr-diagnosis';
          specificData = { doctorAddress: selectedDoctor.doctorAddress, nurseAddress: selectedNurse.nurseAddress, diagnosisCreatedAt: new Date().toISOString(), ...transformedValues, };
          break;
        case 'kehamilan':
          endpoint = '/nurse/patient-list/patient-details/emr-kehamilan';
          specificData = { doctorAddress: selectedDoctor.doctorAddress, nurseAddress: selectedNurse.nurseAddress,kehamilanCreatedAt: new Date().toISOString(), ...transformedValues };
          break;
        case 'tbParu':
          endpoint = '/nurse/patient-list/patient-details/emr-tb';
          specificData = { doctorAddress: selectedDoctor.doctorAddress, nurseAddress: selectedNurse.nurseAddress, tbCreatedAt: new Date().toISOString(), ...transformedValues };
          break;
        case 'lab':
          endpoint = '/nurse/patient-list/patient-details/emr-lab';
          specificData = { doctorAddress: selectedDoctor.doctorAddress, nurseAddress: selectedNurse.nurseAddress, labCreatedAt: new Date().toISOString(), ...transformedValues, files: uploadedFiles };
          break;
        case 'selesai':
          endpoint = '/nurse/patient-list/patient-details/emr-selesai';
          specificData = { doctorAddress: selectedDoctor.doctorAddress, selesaiCreatedAt: new Date().toISOString(), ...transformedValues };
          break;
        default:
          endpoint = '/nurse/patient-list/patient-details/emr';
          specificData = { doctorAddress: selectedDoctor.doctorAddress, nurseAddress: selectedNurse.nurseAddress, ...transformedValues };
      }

      console.log({ commonData, specificData });
      const signer = await getSigner();
      const signature = await signer.signMessage(JSON.stringify(specificData));
      specificData.signature = signature;

      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}${endpoint}`,
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({commonData, specificData}),
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
        const appointment = selectedData.appointment || {};
        const anamnesis = appointment.anamnesis || {};
        const diagnosis = appointment.diagnosis || {};
        const kehamilan = appointment.kehamilan || {};
        const tb = appointment.tb || {};
        const lab = appointment.lab || {};
        const selesai = appointment.selesai || {};

        setHematologyCheckedList(lab.hematology || []);
        setClinicalChemistryCheckedList(lab.clinicalChemistry || []);
        setUrinalysisCheckedList(lab.urinalysis || []);
        setMicrobiologyCheckedList(lab.microbiology || []);
        setImmunologyCheckedList(lab.immunology || []);
        setSelectedNurseLab({ namaAsisten: lab.pemeriksaLab, nurseAddress: lab.nurseAddress });
        setSelectedDoctorLab({ namaDokter: lab.perujukLab, doctorAddress: lab.doctorAddress });

        const initialValues = {
          // === start anamnesis ===
          appointmentId: selectedData.appointmentId,
          appointmentCreatedAt: dayjs(selectedData.appointment.appointmentCreatedAt).format("DD-MM-YYYY") || '',
          // namaDokter: anamnesis.namaDokter || '',
          // namaAsisten: anamnesis.namaAsisten || '',
          tanggalRekamMedis: dayjs(selectedData.tanggalRekamMedis) || '',
          keluhanUtama: anamnesis.keluhanUtama || '',
          keluhanTambahan: anamnesis.keluhanTambahan || '',
          lamaSakitTahun: anamnesis.lamaSakitTahun || '',
          lamaSakitBulan: anamnesis.lamaSakitBulan || '',
          lamaSakitHari: anamnesis.lamaSakitHari || '',
          cekRiwayatPenyakit: anamnesis.cekRiwayatPenyakit || '',
          cekRiwayatAlergi: anamnesis.cekRiwayatAlergi || '',
          rps: anamnesis.rps || '',
          rpd: anamnesis.rpd || '',
          rpk: anamnesis.rpk || '',
          alergiObat: anamnesis.alergiObat || '',
          alergiMakanan: anamnesis.alergiMakanan || '',
          alergiLainnya: anamnesis.alergiLainnya || '',
          riwayatAlergiLainnya: anamnesis.riwayatAlergiLainnya || '',
          alatBantu: anamnesis.alatBantu || '',
          kendalaKomunikasi: anamnesis.kendalaKomunikasi || '',
          perawatRumah: anamnesis.perawatRumah || '',
          bantuanOrangLain: anamnesis.bantuanOrangLain || '',
          ekspresiDanEmosi: anamnesis.ekspresiDanEmosi || '',
          bahasa: anamnesis.bahasa || '',
          pekerjaan: anamnesis.pekerjaan || '',
          tinggalBersama: anamnesis.tinggalBersama || '',
          gangguanJiwaLampau: anamnesis.gangguanJiwaLampau || '',
          sosialEkonomi: anamnesis.sosialEkonomi || '',
          statusEkonomi: anamnesis.statusEkonomi || '',
          jaminanPengobatan: anamnesis.jaminanPengobatan || '',
          hubunganKeluarga: anamnesis.hubunganKeluarga || '',
          tingkatKesadaran: anamnesis.tingkatKesadaran || '',
          detakNadi: anamnesis.detakNadi || '',
          pernapasan: anamnesis.pernapasan || '',
          tekananDarahSistole: anamnesis.tekananDarahSistole || '',
          tekananDarahDiastole: anamnesis.tekananDarahDiastole || '',
          map: anamnesis.map || '',
          beratBadan: anamnesis.beratBadan || '',
          tinggiBadan: anamnesis.tinggiBadan || '',
          caraUkurTinggiBadan: anamnesis.caraUkurTinggiBadan || '',
          suhuTubuh: anamnesis.suhuTubuh || '',
          saturasi: anamnesis.saturasi || '',
          statusHamil: anamnesis.statusHamil || '',
          detakJantung: anamnesis.detakJantung || '',
          triage: anamnesis.triage || '',
          nyeriTubuh: anamnesis.nyeriTubuh || '',
          pencetusNyeri: anamnesis.pencetusNyeri || '',
          kualitasNyeri: anamnesis.kualitasNyeri || '',
          lokasiNyeri: anamnesis.lokasiNyeri || '',
          skalaNyeri: anamnesis.skalaNyeri || '',
          waktuNyeri: anamnesis.waktuNyeri || '',
          pasienTidakSeimbang: anamnesis.pasienTidakSeimbang || '',
          pasienButuhPenopang: anamnesis.pasienButuhPenopang || '',
          terapi: anamnesis.terapi || '',
          rencanaTindakan: anamnesis.rencanaTindakan || '',
          tipeAskep: anamnesis.tipeAskep || '',
          edukasi: anamnesis.edukasi || '',
          deskripsiAskep: anamnesis.deskripsiAskep || '',
          observasi: anamnesis.observasi || '',
          keteranganPerawatLainnya: anamnesis.keteranganPerawatLainnya || '',
          biopsikososial: anamnesis.biopsikososial || '',
          tindakanKeperawatan: anamnesis.tindakanKeperawatan || '',
          merokok: anamnesis.merokok || '',
          konsumsiAlkohol: anamnesis.konsumsiAlkohol || '',
          kurangSayurBuah: anamnesis.kurangSayurBuah || '',
          pemeriksaanKulit: anamnesis.pemeriksaanKulit || '',
          pemeriksaanLeher: anamnesis.pemeriksaanLeher || '',
          pemeriksaanKuku: anamnesis.pemeriksaanKuku || '',
          pemeriksaanDadaPunggung: anamnesis.pemeriksaanDadaPunggung || '',
          pemeriksaanKepala: anamnesis.pemeriksaanKepala || '',
          pemeriksaanKardiovaskuler: anamnesis.pemeriksaanKardiovaskuler || '',
          pemeriksaanWajah: anamnesis.pemeriksaanWajah || '',
          pemeriksaanDadaAksila: anamnesis.pemeriksaanDadaAksila || '',
          pemeriksaanMata: anamnesis.pemeriksaanMata || '',
          pemeriksaanAbdomenPerut: anamnesis.pemeriksaanAbdomenPerut || '',
          pemeriksaanTelinga: anamnesis.pemeriksaanTelinga || '',
          pemeriksaanEkstermitasAtas: anamnesis.pemeriksaanEkstermitasAtas || '',
          pemeriksaanHidungSinus: anamnesis.pemeriksaanHidungSinus || '',
          pemeriksaanEkstermitasBawah: anamnesis.pemeriksaanEkstermitasBawah || '',
          pemeriksaanMulutBibir: anamnesis.pemeriksaanMulutBibir || '',
          pemeriksaanGenitaliaWanita: anamnesis.pemeriksaanGenitaliaWanita || '',
          // === end anamnesis ===

          // === start diagnosis ===
          diagnosis: diagnosis.diagnosis ? diagnosis.diagnosis.map(d => ({
            namaDokterDiagnosis: d.namaDokterDiagnosis || '',
            namaAsistenDiagnosis: d.namaAsistenDiagnosis || '',
            icdx: d.icdx || '',
            diagnosis: d.diagnosis || '',
            jenisDiagnosis: d.jenisDiagnosis || '',
            kasusDiagnosis: d.kasusDiagnosis || ''
        })) : [{}],
          // === end diagnosis ===

          // === start kia ===
          // namaDokterKia: kia.namaDokterKia || '',
          // namaAsistenKia: kia.namaAsistenKia || '',
          posyanduKia: kehamilan.posyanduKia || '',
          namaKaderKia: kehamilan.namaKaderKia || '',
          namaDukunKia: kehamilan.namaDukunKia || '',
          golonganDarahKia: kehamilan.golonganDarahKia || '',
          riwayatKomplikasiKebidananKia: kehamilan.riwayatKomplikasiKebidananKia || '',
          penyakitKronisAlergiKia: kehamilan.penyakitKronisAlergiKia || '',
          riwayatPenyakitKia: kehamilan.riwayatPenyakitKia || '',
          gravida: kehamilan.gravida || '',
          abortus: kehamilan.abortus || '',
          partus: kehamilan.partus || '',
          hidup: kehamilan.hidup || '',
          tanggalRencanaPersalinan: kehamilan.tanggalRencanaPersalinan ? dayjs(kehamilan.tanggalRencanaPersalinan, dateFormat) : null,
          penolongPersalinan: kehamilan.penolongPersalinan || '',
          tempatPersalinan: kehamilan.tempatPersalinan || '',
          pendampingPersalinan: kehamilan.pendampingPersalinan || '',
          transportasiPersalinan: kehamilan.transportasiPersalinan || '',
          pendonorPersalinan: kehamilan.pendonorPersalinan || '',
          tanggalHpht: kehamilan.tanggalHpht ? dayjs(kehamilan.tanggalHpht, dateFormat) : null,
          taksiranPersalinan: kehamilan.taksiranPersalinan ? dayjs(kehamilan.taksiranPersalinan, dateFormat) : null,
          persalinanSebelumnya: kehamilan.persalinanSebelumnya ? dayjs(kehamilan.persalinanSebelumnya, dateFormat) : null,
          bukuKia: kehamilan.bukuKia || '',
          beratBadanSebelumHamil: kehamilan.beratBadanSebelumHamil || '',
          tinggiBadanHamil: kehamilan.tinggiBadanHamil || '',
          skorKspr: kehamilan.skorKspr || '',
          tingkatRisiko: kehamilan.tingkatRisiko || '',
          jenisRisikoTinggi: kehamilan.jenisRisikoTinggi || '',
          risikoKasuistik: kehamilan.risikoKasuistik || '',
          // === end kia ===

          // === start tb ===
          // namaDokterTb: tb.namaDokterTb || '',
          // namaAsistenTb: tb.namaAsistenTb || '',
          beratBadanTb: tb.beratBadanTb || '',
          tinggiBadanTb: tb.tinggiBadanTb || '',
          parutBcg: tb.parutBcg || '',
          wanitaUsiaSubur: tb.wanitaUsiaSubur || '',
          skoringTbAnak: tb.skoringTbAnak || '',
          namaPmo: tb.namaPmo || '',
          nomorTeleponPmo: tb.nomorTeleponPmo || '',
          alamatPmo: tb.alamatPmo || '',
          namaFaskesPmo: tb.namaFaskesPmo || '',
          tahunPmo: tb.tahunPmo || '',
          provinsiPmo: tb.provinsiPmo || '',
          kotaKabPmo: tb.kotaKabPmo || '',
          tipeDiagnosis: tb.tipeDiagnosis || '',
          klasifikasiByAnatomi: tb.klasifikasiByAnatomi || '',
          klasifikasiByRiwayat: tb.klasifikasiByRiwayat || '',
          klasifikasiByHiv: tb.klasifikasiByHiv || '',
          riwayatDm: tb.riwayatDm || '',
          tesDm: tb.tesDm || '',
          terapiDm: tb.terapiDm || '',
          ujiTuberkulin: tb.ujiTuberkulin || '',
          tanggalFotoToraks: tb.tanggalFotoToraks ? dayjs(tb.tanggalFotoToraks, dateFormat) : null,
          nomorSeriFotoToraks: tb.nomorSeriFotoToraks || '',
          kesanFotoToraks: tb.kesanFotoToraks || '',
          tanggalFnab: tb.tanggalFnab ? dayjs(tb.tanggalFnab, dateFormat) : null,
          hasilUjiSelainDahak: tb.hasilUjiSelainDahak || '',
          hasilFnab: tb.hasilFnab || '',
          deskripsiFnab: tb.deskripsiFnab || '',
          tanggalSelesaiPengobatanTb: tb.tanggalSelesaiPengobatanTb ? dayjs(tb.tanggalSelesaiPengobatanTb, dateFormat) : null,
          hasilPengobatanTb: tb.hasilPengobatanTb || '',
          catatanHasilPengobatanTb: tb.catatanHasilPengobatanTb || '',
          // === end tb ===

          // === start lab ===
          pemeriksaLab: lab.pemeriksaLab || '',
          rujukanDari: lab.rujukanDari || '',
          perujukLab: lab.perujukLab || '',
          statusPemeriksaanLab: lab.statusPemeriksaanLab || '',
          saranLab: lab.saranLab || '',
          // === end lab ===

          // === start selesai ===
          namaDokterSelesai: selesai.namaDokterSelesai || '',
          judulRekamMedis: selesai.judulRekamMedis || '',
          catatanRekamMedis: selesai.catatanRekamMedis || '',
          statusPulang: selesai.statusPulang || '',
          tanggalRencanaKontrol: selesai.tanggalRencanaKontrol ? dayjs(selesai.tanggalRencanaKontrol, dateFormat) : null,
          keteranganPulang: selesai.keteranganPulang || '',
          // === end selesai ===
        };

        form.setFieldsValue(initialValues);
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

    const [selectedDoctorLab, setSelectedDoctorLab] = useState({});
    const [selectedNurseLab, setSelectedNurseLab] = useState({});
    const [hematologyCheckedList, setHematologyCheckedList] = useState([]);
    const [hematologyCheckAll, setHematologyCheckAll] = useState(false);
    const [clinicalChemistryCheckedList, setClinicalChemistryCheckedList] = useState([]);
    const [clinicalChemistryCheckAll, setClinicalChemistryCheckAll] = useState(false);
    const [urinalysisCheckedList, setUrinalysisCheckedList] = useState([]);
    const [urinalysisCheckAll, setUrinalysisCheckAll] = useState(false);
    const [microbiologyCheckedList, setMicrobiologyCheckedList] = useState([]);
    const [microbiologyCheckAll, setMicrobiologyCheckAll] = useState(false);
    const [immunologyCheckedList, setImmunologyCheckedList] = useState([]);
    const [immunologyCheckAll, setImmunologyCheckAll] = useState(false);
    const labFiles = selectedData?.appointment?.lab?.files || [];
    const hematologyOptions = [
      'Hemoglobin', 'Hematokrit', 'Hitung Eritrosit', 'Hitung Trombosit', 'Hitung Leukosit',
      'Hitung Jenis leukosit', 'Laju Endap Darah', 'MCV', 'MCH', 'MCHC', 'Golongan Darah'
    ]
    const clinicalChemistryOptions = [
      'Glukosa Sewaktu', 'Glukosa Puasa', 'Glukosa 2 Jam PP', 'SGOT', 'SGPT', 'Asam Urat', 'Trigliserida',
      'Cholesterol', 'Cholesterol HDL', 'Cholesterol LDL', 'Ureum', 'Creatinin', 'Protein, Reduksi'
    ]
    const urinalysisOptions = ['Urin Rutin']
    const microbiologyOptions = [
      'Mycobacterium Tuberculosis', 'Neisseria Gonnorhoeae',
      'Trichomonas Vaginalis', 'Candida Albicans', 'Bacterial Vaginosis'
    ]
    const immunologyOptions = [
      'Tes Kehamilan', 'Widal', 'VDRL', 'HBsAg', 'TPHA', 'Sifilis', 'Anti HIV', 'Antigen Dengue',
      'Antibody Dengue', 'Rapid Covid 19', 'Salmonella'
    ]

    const handlePerujukLabChange = (value) => {
      const selectedDoctorLab = schedules.dokter.find(dokter => dokter.namaDokter === value);
      const selectedNurseLab = uniqueNurses.find(nurse => nurse.namaAsisten === value);
    
      if (selectedDoctorLab) {
        setSelectedDoctorLab({ doctorAddress: selectedDoctorLab.doctorAddress, namaDokter: selectedDoctorLab.namaDokter });
        form.setFieldsValue({ perujukLab: value });
      } else if (selectedNurseLab) {
        setSelectedNurseLab({ nurseAddress: selectedNurseLab.nurseAddress, namaAsisten: selectedNurseLab.namaAsisten });
        form.setFieldsValue({ perujukLab: value });
      }
    };
    
    const handlePemeriksaLabChange = (value) => {
      const selectedNurseLab = uniqueNurses.find(nurse => nurse.namaAsisten === value);
      if (selectedNurseLab) {
        setSelectedNurseLab({ nurseAddress: selectedNurseLab.nurseAddress, namaAsisten: selectedNurseLab.namaAsisten });
        form.setFieldsValue({ pemeriksaLab: value });
      }
    };

  useEffect(() => {
    form.setFieldsValue({
      namaDokter: selectedDoctorLab.namaDokter,
      namaAsisten: selectedNurseLab.namaAsisten,
      pemeriksaLab: selectedNurseLab.namaAsisten,
      perujukLab: selectedDoctorLab.namaDokter,
    });
  }, [selectedDoctorLab, selectedNurseLab, form]);

  useEffect(() => {
    form.setFieldsValue({
      hematologyCheckedList,
      clinicalChemistryCheckedList,
      urinalysisCheckedList,
      microbiologyCheckedList,
      immunologyCheckedList
    });
  }, [hematologyCheckedList, clinicalChemistryCheckedList, urinalysisCheckedList, microbiologyCheckedList, immunologyCheckedList, form]);

    const CheckboxGroup = Checkbox.Group;
    const LabCategory = ({ category, options, checkedList, setCheckedList, checkAll, setCheckAll, disabled  }) => {
      const onChange = (list) => {
        setCheckedList(list);
        setCheckAll(list.length === options.length);
      };

      const onCheckAllChange = (e) => {
        setCheckedList(e.target.checked ? options : []);
        setCheckAll(e.target.checked);
      };

      return (
        <div className="mb-4">
        <div className='flex gap-x-4'>
          <p className='font-bold'>{category}</p>
          <Checkbox
            indeterminate={checkedList.length > 0 && checkedList.length < options.length}
            onChange={onCheckAllChange}
            checked={checkAll}
            disabled={disabled}
          >
            <i>Pilih Semua</i>
          </Checkbox>
        </div>
        <CheckboxGroup value={checkedList} onChange={onChange} disabled={disabled}>
          <Row>
            {options.map(option => (
              <Col span={8} key={option}>
                <Checkbox value={option}>{option}</Checkbox>
              </Col>
            ))}
          </Row>
        </CheckboxGroup>
      </div>
      );
    };

    return (
      <Form
        form={form}
        name="medical_form"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ appointmentId: appointmentId, tanggalRekamMedis: dayjs() }}
        onValuesChange={onValuesChange}
        size="small"
        className='w-full h-full overflow-y-auto'
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
              <Form.Item label="Dokter / Tenaga Medis" name="namaDokterAnamnesis">
                <Select
                  showSearch
                  placeholder="Pilih Dokter"
                  optionFilterProp="children"
                  onChange={handleDoctorChange}
                  value={selectedDoctor.namaDokterAnamnesis}
                  size='middle'
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={schedules.dokter.map(dokter => ({ value: dokter.namaDokter, label: dokter.namaDokter }))}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              <Form.Item label="Perawat / Bidan / Nutrisionist / Sanitarian" name="namaAsistenAnamnesis">
                <Select
                  showSearch
                  placeholder="Pilih Perawat"
                  optionFilterProp="children"
                  onChange={handleNurseChange}
                  value={selectedNurse.namaAsistenAnamnesis}
                  size='middle'
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={uniqueNurses.map(nurse => ({
                    value: nurse.namaAsisten,
                    label: nurse.namaAsisten,
                  }))}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              <Form.Item label="Keluhan Utama" name="keluhanUtama" rules={[{ required: true, message: 'Harap isi keluhan utama!' }]}>
                <Input style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} autoSize />
              </Form.Item>
              <Form.Item label="Keluhan Tambahan" name="keluhanTambahan">
                <Input.TextArea style={inputStylingTextArea} className="content-center" disabled={isDataFinished && !isEdit} autoSize/>
              </Form.Item>
              <div>
                <Form.Item label="Riwayat Penyakit" valuePropName="checked">
                  <Checkbox
                    name='cekRiwayatPenyakit'
                    checked={isNoDisease}
                    onChange={handleDiseaseCheckbox}
                    disabled={isDataFinished && !isEdit}
                  >
                    Tidak ada
                  </Checkbox>
                </Form.Item>

                {!isNoDisease && (
                  <>
                    <Form.Item label="RPS" name="rps">
                      <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
                    </Form.Item>
                    <Form.Item label="RPD" name="rpd">
                      <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
                    </Form.Item>
                    <Form.Item label="RPK" name="rpk">
                      <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
                    </Form.Item>
                  </>
                )}
              </div>
              <div>
                <Form.Item label="Alergi Pasien" valuePropName="checked">
                  <Checkbox
                    name="cekRiwayatAlergi"
                    checked={isNoAllergy}
                    onChange={handleAllergyCheckbox}
                    disabled={isDataFinished && !isEdit}
                  >
                    Tidak ada
                  </Checkbox>
                </Form.Item>

                {!isNoAllergy && (
                  <>
                    <Form.Item label="Obat" name="alergiObat">
                      <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
                    </Form.Item>
                    <Form.Item label="Makanan" name="alergiMakanan">
                      <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
                    </Form.Item>
                    <Form.Item label="Lainnya" name="alergiLainnya">
                      <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
                    </Form.Item>
                  </>
                )}
              </div>
              <div className='grid gap-y-2 content-center'>
                <div>Lama Sakit</div>
                <div className='flex gap-x-4'>
                  <Form.Item name="lamaSakitTahun" >
                    <Input disabled={isDataFinished && !isEdit} style={inputStyling} placeholder="0" defaultValue={0} />
                  </Form.Item>
                  <span className='mt-1'>Tahun</span>
                  <Form.Item label="" name="lamaSakitBulan" >
                    <Input disabled={isDataFinished && !isEdit} style={inputStyling} placeholder="0" defaultValue={0} />
                  </Form.Item>
                  <span className='mt-1'>Bulan</span>
                  <Form.Item label="" name="lamaSakitHari" rules={[{ required: true, message: 'Harap isi lama sakit!' }]} >
                    <Input disabled={isDataFinished && !isEdit} style={inputStyling} placeholder="0" defaultValue={0} />
                  </Form.Item>
                  <span className='mt-1'>Hari</span>
                </div>
              </div>

              {/* PEMERIKSAAN FISIS */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">2. Pemeriksaan Psikologis, Sosial Ekonomi, Spiritual</Divider>
              </div>
              <Form.Item label="Penggunaan alat bantu ketika beraktivitas" name="alatBantu" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('alatBantu')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Mengalami kendala komunikasi" name="kendalaKomunikasi" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('kendalaKomunikasi')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Ada yang merawat di rumah" name="perawatRumah" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('perawatRumah')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Membutuhkan bantuan orang lain ketika beraktivitas" name="bantuanOrangLain" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('bantuanOrangLain')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Ekspresi dan emosi" name="ekspresiDanEmosi" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Select size="middle" disabled={isDataFinished && !isEdit && !!form.getFieldValue('ekspresiDanEmosi')} onChange={onPsikologisChange} options={[
                  { value: '1', label: <span>1. Tenang</span> },
                  { value: '2', label: <span>2. Cemas</span> },
                  { value: '3', label: <span>3. Takut</span> },
                  { value: '4', label: <span>4. Gelisah</span> },
                  { value: '5', label: <span>5. Sedih</span> },
                  { value: '6', label: <span>6. Marah</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Bahasa yang digunakan" name="bahasa" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('bahasa')}>
                  <Radio value="1">Indonesia</Radio>
                  <Radio value="2">Daerah</Radio>
                  <Radio value="3">Lainnya</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Pekerjaan" name="pekerjaan" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit}/>
              </Form.Item>
              <Form.Item label="Tinggal dengan" name="tinggalBersama" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('tinggalBersama')}>
                  <Radio value="1">Sendiri</Radio>
                  <Radio value="2">Suami/Istri</Radio>
                  <Radio value="3">Orang tua</Radio>
                  <Radio value="4">Lainnya</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Gangguan jiwa di masa lalu" name="gangguanJiwaLampau" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('gangguanJiwaLampau')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Sosial Ekonomi" name="sosialEkonomi" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('sosialEkonomi')}>
                  <Radio value="1">Baik</Radio>
                  <Radio value="2">Cukup</Radio>
                  <Radio value="3">Kurang</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Status Ekonomi" name="statusEkonomi" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('statusEkonomi')}>
                  <Radio value="1">Baik</Radio>
                  <Radio value="2">Cukup</Radio>
                  <Radio value="3">Kurang</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Jaminan Pengobatan" name="jaminanPengobatan" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('jaminanPengobatan')}>
                  <Radio value="1">BPJS</Radio>
                  <Radio value="2">Umum / Mandiri</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Hubungan dengan keluarga" name="hubunganKeluarga" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Select size="middle" disabled={isDataFinished && !isEdit && !!form.getFieldValue('hubunganKeluarga')} options={[
                  { value: '1', label: <span>1. Harmonis</span> },
                  { value: '2', label: <span>2. Kurang Harmonis</span> },
                  { value: '3', label: <span>3. Tidak Harmonis</span> },
                  { value: '4', label: <span>4. Konflik Besar</span> },
                ]}/>
              </Form.Item>

              {/* Pemeriksaan Fisik */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">3. Pemeriksaan Fisik</Divider>
              </div>
              <div className="col-span-2">
                <Divider orientation="left">A. Keadaan Umum</Divider>
              </div>
              <Form.Item label="Tingkat Kesadaran" name="tingkatKesadaran" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Select size="middle" disabled={isDataFinished && !isEdit && !!form.getFieldValue('tingkatKesadaran')} options={[
                  { value: '1', label: <span>1. Compos Mentis</span> },
                  { value: '2', label: <span>2. Somnolen</span> },
                  { value: '3', label: <span>3. Sopor</span> },
                  { value: '4', label: <span>4. Coma</span> },
                ]}/>
              </Form.Item>
              <div className="col-span-2">
                <Divider orientation="left">B. Organ Vital</Divider>
              </div>
              <Form.Item label="Detak Nadi" name="detakNadi" rules={[{ required: true, message: 'Harap isi detak nadi!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="/menit"/>
              </Form.Item>
              <Form.Item label="Pernapasan" name="pernapasan" rules={[{ required: true, message: 'Harap isi pernapasan!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="/menit"/>
              </Form.Item>
              <Form.Item label="Tekanan Darah Sistole" name="tekananDarahSistole" rules={[{ required: true, message: 'Harap isi tekanan darah sistole!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="/mm"/>
              </Form.Item>
              <Form.Item label="Tekanan Darah Diastole" name="tekananDarahDiastole" rules={[{ required: true, message: 'Harap isi diastole!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="/Hg"/>
              </Form.Item>
              <Form.Item label="MAP" name="map" rules={[{ required: true, message: 'Harap isi MAP!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="/mmHg"/>
              </Form.Item>
              <Form.Item label="Berat Badan" name="beratBadan" rules={[{ required: true, message: 'Harap isi berat badan!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="kg"/>
              </Form.Item>
              <Form.Item label="Tinggi Badan" name="tinggiBadan" rules={[{ required: true, message: 'Harap isi tinggi badan!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="cm"/>
              </Form.Item>
              <Form.Item label="Cara ukur tinggi badan" name="caraUkurTinggiBadan" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Select size="middle" disabled={isDataFinished && !isEdit && !!form.getFieldValue('caraUkurTinggiBadan')} options={[
                  { value: '1', label: <span>1. Berdiri</span> },
                  { value: '2', label: <span>2. Telentang</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Suhu Tubuh" name="suhuTubuh" rules={[{ required: true, message: 'Harap isi suhu tubuh!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="°C"/>
              </Form.Item>
              <Form.Item label="Saturasi (Sp02)" name="saturasi" rules={[{ required: true, message: 'Harap isi saturasi!' }]}>
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="%"/>
              </Form.Item>
              <Form.Item label="Status hamil" name="statusHamil" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('statusHamil')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Detak Jantung" name="detakJantung" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('detakJantung')}>
                  <Radio value="1">Regular</Radio>
                  <Radio value="2">Iregular</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Triage" name="triage" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('triage')}>
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
              <Form.Item label="Pasien merasakan nyeri" name="nyeriTubuh" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('nyeriTubuh')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Pencetus nyeri" name="pencetusNyeri">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Kualitas Nyeri" name="kualitasNyeri" >
                <Select size="middle" disabled={isDataFinished && !isEdit && !!form.getFieldValue('kualitasNyeri')} options={[
                  { value: '1', label: <span>1. Tekanan</span> },
                  { value: '2', label: <span>2. Terbakar</span> },
                  { value: '3', label: <span>3. Melilit</span> },
                  { value: '4', label: <span>4. Tertusuk</span> },
                  { value: '5', label: <span>5. Diiris</span> },
                  { value: '6', label: <span>6. Mencengkram</span> }
                ]}/>
              </Form.Item>
              <Form.Item label="Lokasi nyeri" name="lokasiNyeri">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Skala nyeri (0 = Tidak Nyeri, 10 = Sangat Nyeri)" name="skalaNyeri">
                <Slider disabled={isDataFinished && !isEdit} min={1} max={10} />
              </Form.Item>
              <Form.Item label="Waktu nyeri" name="waktuNyeri" >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('waktuNyeri')}>
                  <Radio value="1">Intermiten</Radio>
                  <Radio value="2">Hilang timbul</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Asesmen Risiko Jatuh */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">5. Asesmen Risiko Jatuh</Divider>
              </div>
              <div className="col-span-2">
                <Form.Item label="Perhatikan cara berjalan pasien saat akan duduk di kursi. Apakah pasien tampak tidak seimbang?" name="pasienTidakSeimbang" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                  <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('pasienTidakSeimbang')}>
                    <Radio value="1">Ya</Radio>
                    <Radio value="0">Tidak</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
              <div className="col-span-2">
                <Form.Item label="Apakah pasien memegang benda sekitar untuk penopang tubuh?" name="pasienButuhPenopang" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                  <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('pasienButuhPenopang')}>
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
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Rencana Tindakan" name="rencanaTindakan">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Tipe Asuhan Keperawatan" name="tipeAskep">
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('tipeAskep')}>
                  <Radio value="1">Text</Radio>
                  <Radio value="2">SOAP</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Edukasi" name="edukasi">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Deskripsi Asuhan Keperawatan" name="deskripsiAskep">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Observasi" name="observasi">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Keterangan Lainnya" name="keteranganPerawatLainnya">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Biopsikososial" name="biopsikososial">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Tindakan Keperawatan" name="tindakanKeperawatan">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Merokok" name="merokok">
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('merokok')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Konsumsi alkohol" name="konsumsiAlkohol">
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('konsumsiAlkohol')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Kurang sayur/buah" name="kurangSayurBuah">
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('kurangSayurBuah')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Keadaan Fisik */}
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">7. Keadaan Fisik</Divider>
              </div>
              <Form.Item label="Pemeriksaan Kulit" name="pemeriksaanKulit">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Leher" name="pemeriksaanLeher">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Kuku" name="pemeriksaanKuku">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Dada dan Punggung" name="pemeriksaanDadaPunggung">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Kepala" name="pemeriksaanKepala">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Kardiovaskuler" name="pemeriksaanKardiovaskuler">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Wajah" name="pemeriksaanWajah">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Dada dan Aksila" name="pemeriksaanDadaAksila">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Mata" name="pemeriksaanMata">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Abdomen Perut" name="pemeriksaanAbdomenPerut">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Telinga" name="pemeriksaanTelinga">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Ekstermitas Atas (Bahu, Siku, Tangan)" name="pemeriksaanEkstermitasAtas">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Hidung dan Sinus" name="pemeriksaanHidungSinus">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Ekstermitas Bawah (Panggul, Lutut, Pergelangan Kaki dan Telapak Kaki)" name="pemeriksaanEkstermitasBawah">
                <TextArea rows={3} style={inputStylingTextArea}  disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Mulut dan Bibir" name="pemeriksaanMulutBibir">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Pemeriksaan Genitalia Wanita" name="pemeriksaanGenitaliaWanita">
                <TextArea rows={3} style={inputStylingTextArea} disabled={isDataFinished && !isEdit} />
              </Form.Item>
            </>
          )}

          { selectedCategory === 'diagnosis' && (
            <>
              {/* PEMERIKSAAN SPESIALISTIK */}
              <div className="col-span-2 text-lg text-gray-900">
                Diagnosis
                <hr className="h-px bg-gray-700 border-0"/>
              </div>

              <Form.List name="diagnosis" initialValue={appointmentId || [{}]} >
                {(fields, { add, remove }) => (
                  <>
                    <div className='grid col-span-2 w-full'>
                      <Table
                        dataSource={fields.length ? fields : [{}]}
                        pagination={false}
                        rowKey={(record) => record.key}
                        columns={[
                          {
                            title: 'Dokter / Tenaga Medis',
                            dataIndex: ['namaDokterDiagnosis'],
                            key: 'namaDokterDiagnosis',
                            render: (text, field) => (
                              <Form.Item
                                {...field}
                                name={[field.name, 'namaDokterDiagnosis']}
                                fieldKey={[field.fieldKey, 'namaDokterDiagnosis']}
                                rules={[{ required: true, message: 'Harap pilih dokter' }]}
                                initialValue={
                                  form.getFieldValue(['diagnosis', field.name, 'namaDokterDiagnosis']) ||
                                  selectedDoctor.namaDokterDiagnosis || ''
                                }
                              >
                                <Select
                                  showSearch
                                  placeholder="Pilih Dokter"
                                  optionFilterProp="children"
                                  size='middle'
                                  filterOption={(input, option) =>
                                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  options={schedules.dokter.map(dokter => ({ value: dokter.namaDokter, label: dokter.namaDokter }))}
                                  disabled={isDataFinished && !isEdit}
                                />
                              </Form.Item>
                            ),
                          },
                          {
                            title: 'Perawat / Bidan / Nutrisionist / Sanitarian',
                            dataIndex: ['namaAsistenDiagnosis'],
                            key: 'namaAsistenDiagnosis',
                            render: (text, field) => (
                              <Form.Item
                                {...field}
                                name={[field.name, 'namaAsistenDiagnosis']}
                                fieldKey={[field.fieldKey, 'namaAsistenDiagnosis']}
                                rules={[{ required: true, message: 'Harap pilih perawat' }]}
                                initialValue={
                                  form.getFieldValue(['diagnosis', field.name, 'namaAsistenDiagnosis']) ||
                                  selectedNurse.namaAsistenDiagnosis || ''
                                }
                              >
                                <Select
                                  showSearch
                                  placeholder="Pilih Perawat"
                                  optionFilterProp="children"
                                  size='middle'
                                  filterOption={(input, option) =>
                                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                  options={uniqueNurses.map(nurse => ({ value: nurse.namaAsisten, label: nurse.namaAsisten }))}
                                  disabled={isDataFinished && !isEdit}
                                />
                              </Form.Item>
                            ),
                          },
                          {
                            title: 'ICD-X',
                            dataIndex: ['icdx'],
                            key: 'icdx',
                            render: (text, field) => (
                              <Form.Item
                                {...field}
                                name={[field.name, 'icdx']}
                                fieldKey={[field.fieldKey, 'icdx']}
                                rules={[{ required: true, message: 'Harap isi ICD-X' }]}
                              >
                                <Input placeholder="ICD-X" style={inputStyling} disabled={isDataFinished && !isEdit} />
                              </Form.Item>
                            ),
                          },
                          {
                            title: 'Diagnosis',
                            dataIndex: ['diagnosis'],
                            key: 'diagnosis',
                            render: (text, field) => (
                              <Form.Item
                                {...field}
                                name={[field.name, 'diagnosis']}
                                fieldKey={[field.fieldKey, 'diagnosis']}
                                rules={[{ required: true, message: 'Harap isi diagnosis' }]}
                              >
                                <TextArea style={inputStylingTextArea} rows={3} placeholder="Diagnosis" disabled={isDataFinished && !isEdit} />
                              </Form.Item>
                            ),
                          },
                          {
                            title: 'Jenis',
                            dataIndex: ['jenisDiagnosis'],
                            key: 'jenisDiagnosis',
                            render: (text, field) => (
                              <Form.Item
                                {...field}
                                name={[field.name, 'jenisDiagnosis']}
                                fieldKey={[field.fieldKey, 'jenisDiagnosis']}
                                rules={[{ required: true, message: 'Harap pilih jenis' }]}
                              >
                                <Select placeholder="Jenis" size='middle' disabled={isDataFinished && !isEdit} >
                                  <Select.Option value="1">Primer</Select.Option>
                                  <Select.Option value="2">Sekunder</Select.Option>
                                  <Select.Option value="3">Komplikasi</Select.Option>
                                </Select>
                              </Form.Item>
                            ),
                          },
                          {
                            title: 'Kasus',
                            dataIndex: ['kasusDiagnosis'],
                            key: 'kasusDiagnosis',
                            render: (text, field) => (
                              <Form.Item
                                {...field}
                                name={[field.name, 'kasusDiagnosis']}
                                fieldKey={[field.fieldKey, 'kasusDiagnosis']}
                                rules={[{ required: true, message: 'Harap pilih kasus' }]}
                              >
                                <Select placeholder="Kasus" disabled={isDataFinished && !isEdit} >
                                  <Select.Option value="1">Baru</Select.Option>
                                  <Select.Option value="2">Lama</Select.Option>
                                </Select>
                              </Form.Item>
                            ),
                          },
                          {
                            title: 'Aksi',
                            dataIndex: 'aksi',
                            key: 'aksi',
                            render: (_, field) => (
                              <MinusCircleOutlined onClick={() => { if (fields.length > 1) remove(field.name) }} />
                            ),
                          },
                        ]}
                      />
                    </div>
                    <div></div>
                    <div className='grid pt-6 justify-end'>
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Tambah Diagnosis
                        </Button>
                      </Form.Item>
                    </div>
                  </>
                )}
              </Form.List>
            </>
          )}

          {/* Pengamatan KIA */}
          { selectedCategory === 'kehamilan' && (
            <>
              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Pengamatan Kehamilan
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Dokter / Tenaga Medis" name="namaDokterKia">
                <Select
                  showSearch
                  placeholder="Pilih Dokter"
                  optionFilterProp="children"
                  onChange={handleDoctorChange}
                  value={selectedDoctor.namaDokterKia}
                  size='middle'
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={schedules.dokter.map(dokter => ({ value: dokter.namaDokter, label: dokter.namaDokter }))}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              <Form.Item label="Perawat / Bidan / Nutrisionist / Sanitarian" name="namaAsistenKia">
                <Select
                  showSearch
                  placeholder="Pilih Perawat"
                  optionFilterProp="children"
                  onChange={handleNurseChange}
                  value={selectedNurse.namaAsistenKia}
                  size='middle'
                  filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
                  options={uniqueNurses.map(nurse => ({ value: nurse.namaAsisten, label: nurse.namaAsisten }))}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              <Form.Item label="Posyandu" name="posyanduKia" >
                <Input style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Nama Kader" name="namaKaderKia">
                <Input style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Nama Dukun" name="namaDukunKia" >
                <Input style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Golongan Darah" name="golonganDarahKia">
                <Input style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Riwayat Pasien
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Riwayat Komplikasi Kebidanan" name="riwayatKomplikasiKebidananKia">
                <Input style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Penyakit Kronis dan Alergi" name="penyakitKronisAlergiKia" >
                <Input style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Riwayat Penyakit" name="riwayatPenyakitKia">
                <Input style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Riwayat Obstetrik
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Gravida" name="gravida" rules={[{ required: true, message: 'Harap isi gravida!' }]}>
                <InputNumber style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Partus" name="partus" rules={[{ required: true, message: 'Harap isi partus!' }]}>
                <InputNumber style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Abortus" name="abortus" rules={[{ required: true, message: 'Harap isi abortus!' }]}>
                <InputNumber style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Hidup" name="hidup" rules={[{ required: true, message: 'Harap isi hidup!' }]}>
                <InputNumber style={inputStyling} className="content-center" disabled={isDataFinished && !isEdit} />
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Rencana Persalinan
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Tanggal" name="tanggalRencanaPersalinan" rules={[{ required: true, message: 'Harap isi rencana persalinan!' }]} >
                <DatePicker onChange={onChange} size='middle' format={dateFormat} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Penolong" name="penolongPersalinan" rules={[{ required: true, message: 'Harap isi penolong persalinan!' }]} >
                <Select size="middle" onChange={onPenolongPersalinanChange} disabled={isDataFinished && !isEdit && !!form.getFieldValue('penolongPersalinan')} options={[
                  { value: '1', label: <span>1. Keluarga</span> },
                  { value: '2', label: <span>2. Dukun</span> },
                  { value: '3', label: <span>3. Bidan</span> },
                  { value: '4', label: <span>4. dr. Umum</span> },
                  { value: '5', label: <span>5. dr. Spesialis</span> },
                  { value: '6', label: <span>6. Lainnya</span> },
                  { value: '7', label: <span>7. Tidak ada</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Tempat" name="tempatPersalinan" rules={[{ required: true, message: 'Harap isi tempat persalinan!' }]} >
                <Select size="middle" onChange={onTempatPersalinanChange} disabled={isDataFinished && !isEdit && !!form.getFieldValue('tempatPersalinan')} options={[
                  { value: '1', label: <span>1. Rumah</span> },
                  { value: '2', label: <span>2. Polides</span> },
                  { value: '3', label: <span>3. Pustu</span> },
                  { value: '4', label: <span>4. Puskesmas</span> },
                  { value: '5', label: <span>5. Klinik</span> },
                  { value: '6', label: <span>6. Rumah Bersalin (RB)</span> },
                  { value: '7', label: <span>7. Rumah Sakit (RS)</span> },
                  { value: '8', label: <span>8. Rumah Sakit Ibu dan Anak (RSIA)</span> },
                  { value: '9', label: <span>9. Rumah Sakit Orang Dengan HIV AIDS (RS ODHA)</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Pendamping" name="pendampingPersalinan" rules={[{ required: true, message: 'Harap isi pendamping persalinan!' }]} >
                <Select size="middle" onChange={onPendampingPersalinanChange} disabled={isDataFinished && !isEdit && !!form.getFieldValue('pendampingPersalinan')} options={[
                  { value: '1', label: <span>1. Suami</span> },
                  { value: '2', label: <span>2. Keluarga</span> },
                  { value: '3', label: <span>3. Teman</span> },
                  { value: '4', label: <span>4. Tetangga</span> },
                  { value: '5', label: <span>5. Lainnya</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Transportasi" name="transportasiPersalinan" rules={[{ required: true, message: 'Harap isi transportasi persalinan!' }]} >
                <Select size="middle" onChange={onTransportasiPersalinanChange} disabled={isDataFinished && !isEdit && !!form.getFieldValue('transportasiPersalinan')} options={[
                  { value: '1', label: <span>1. Ambulans Desa</span> },
                  { value: '2', label: <span>2. Ambulans Puskesmas</span> },
                  { value: '3', label: <span>3. Ambulans Swasta</span> },
                  { value: '4', label: <span>4. Kendaraan Pribadi</span> },
                  { value: '5', label: <span>5. Kendaraan Umum</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Pendonor" name="pendonorPersalinan" rules={[{ required: true, message: 'Harap isi pendonor persalinan!' }]} >
                <Select size="middle" onChange={onPendonorPersalinanChange} disabled={isDataFinished && !isEdit && !!form.getFieldValue('pendonorPersalinan')} options={[
                  { value: '1', label: <span>1. Suami</span> },
                  { value: '2', label: <span>2. Keluarga</span> },
                  { value: '3', label: <span>3. Teman</span> },
                  { value: '4', label: <span>4. Tetangga</span> },
                  { value: '5', label: <span>5. Lainnya</span> },
                ]}/>
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Pemeriksaan Bidan
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Tanggal Hari Pertama Haid Terakhir (HPHT)" name="tanggalHpht" rules={[{ required: true, message: 'Harap isi tanggal HPHT!' }]} >
                <DatePicker onChange={onChange} size='middle' format={dateFormat} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Taksiran Persalinan" name="taksiranPersalinan" rules={[{ required: true, message: 'Harap isi taksiran persalinan!' }]} >
                <DatePicker onChange={onChange} size='middle' format={dateFormat} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Persalinan Sebelumnya" name="persalinanSebelumnya" >
                <DatePicker onChange={onChange} size='middle' format={dateFormat} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Buku Kesehatan Ibu dan Anak (KIA)" name="bukuKia" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('bukuKia')}>
                  <Radio value="1">Memiliki</Radio>
                  <Radio value="0">Tidak memiliki</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Berat Badan sebelum hamil" name="beratBadanSebelumHamil" rules={[{ required: true, message: 'Harap isi berat badan!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="kg"/>
              </Form.Item>
              <Form.Item label="Tinggi Badan" name="tinggiBadanHamil" rules={[{ required: true, message: 'Harap isi tinggi badan!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="cm"/>
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Risiko
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Skor Ibu Kartu Skor Poedji Rochjati (KSPR)" name="skorKspr" rules={[{ required: true, message: 'Harap isi skor KSPR!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Tingkat Risiko" name="tingkatRisiko" rules={[{ required: true, message: 'Harap isi tingkat risiko!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Sebutkan jenis risiko tinggi" name="jenisRisikoTinggi" >
                <Input.TextArea style={inputStylingTextArea} rows={4} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Risiko Kasuistik" name="risikoKasuistik" rules={[{ required: true, message: 'Harap isi risiko kasuistik!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
            </>
          )}

          {/* Pemeriksaan TB Paru */}
          { selectedCategory === 'tbParu' && (
            <>
              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Pemeriksaan TB Paru
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Dokter / Tenaga Medis" name="namaDokterTb">
                <Select
                  showSearch
                  placeholder="Pilih Dokter"
                  optionFilterProp="children"
                  onChange={handleDoctorChange}
                  value={selectedDoctor.namaDokterTb}
                  size='middle'
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={schedules.dokter.map(dokter => ({ value: dokter.namaDokter, label: dokter.namaDokter }))}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              <Form.Item label="Perawat / Bidan / Nutrisionist / Sanitarian" name="namaAsistenTb">
                <Select
                  showSearch
                  placeholder="Pilih Perawat"
                  optionFilterProp="children"
                  onChange={handleNurseChange}
                  value={selectedNurse.namaAsistenTb}
                  size='middle'
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={uniqueNurses.map(nurse => ({ value: nurse.namaAsisten, label: nurse.namaAsisten }))}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              <Form.Item label="Berat Badan" name="beratBadanTb" rules={[{ required: true, message: 'Harap isi berat badan!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="kg"/>
              </Form.Item>
              <Form.Item label="Tinggi Badan" name="tinggiBadanTb" rules={[{ required: true, message: 'Harap isi tinggi badan!' }]} >
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="cm"/>
              </Form.Item>
              <Form.Item label={<span>Parut <i>Bacillus Calmette-Guerin</i> (BCG)</span>} name="parutBcg" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('parutBcg')}>
                  <Radio value="1">Jelas</Radio>
                  <Radio value="2">Tidak ada</Radio>
                  <Radio value="3">Meragukan</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Jika wanita usia subur" name="wanitaUsiaSubur" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('wanitaUsiaSubur')}>
                  <Radio value="1">Hamil</Radio>
                  <Radio value="2">Tidak hamil</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Jumlah Skoring TB Anak" name="skoringTbAnak">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Data Pengawas Menelan Obat (PMO)
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Nama PMO" name="namaPmo">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Nomor Telepon PMO" name="nomorTeleponPmo">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Alamat PMO" name="alamatPmo">
                <Input.TextArea style={inputStylingTextArea} rows={4} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Nama Faskes" name="namaFaskesPmo">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Tahun" name="tahunPmo">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Provinsi" name="provinsiPmo">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Kota/Kab" name="kotaKabPmo">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Tipe Diagnosis dan Klasifikasi Pasien
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Tipe Diagnosis" name="tipeDiagnosis" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('tipeDiagnosis')}>
                  <Radio value="1">Terkontaminasi Bakteriologis</Radio>
                  <Radio value="2">Terdiagnosa klinis</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Klasifikasi berdasarkan lokasi anatomi" name="klasifikasiByAnatomi" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('klasifikasiByAnatomi')}>
                  <Radio value="1">Paru</Radio>
                  <Radio value="2">Ekstra Paru</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Klasifikasi berdasarkan riwayat pengobatan sebelumnya" name="klasifikasiByRiwayat" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('klasifikasiByRiwayat')}>
                  <Radio value="1">Baru</Radio>
                  <Radio value="2">Kambuh</Radio>
                  <Radio value="3">Diobati setelah gagal</Radio>
                  <Radio value="4">Diobati setelah putus berobat</Radio>
                  <Radio value="5">Riwayat tidak diketahui</Radio>
                  <Radio value="6">Lain-lain</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Klasifikasi berdasarkan status HIV" name="klasifikasiByHiv" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('klasifikasiByHiv')}>
                  <Radio value="1">Positif</Radio>
                  <Radio value="2">Negatif</Radio>
                  <Radio value="3">Tidak diketahui</Radio>
                </Radio.Group>
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Kegiatan TB <i>Diabetes Mellitus</i> (DM)
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Riwayat DM" name="riwayatDm" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('riwayatDm')}>
                  <Radio value="1">Ya</Radio>
                  <Radio value="0">Tidak</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Hasil Tes DM" name="tesDm" rules={[{ required: true, message: 'Harap pilih salah satu!' }]} >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('tesDm')}>
                  <Radio value="1">Positif</Radio>
                  <Radio value="2">Negatif</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Terapi DM" name="terapiDm" >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('terapiDm')}>
                  <Radio value="1">Obat Hipoglikemik Oral (OHO)</Radio>
                  <Radio value="2">Injeksi Insulsin</Radio>
                </Radio.Group>
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Pemeriksaan Lain-Lain
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Uji Tuberkulin" name="ujiTuberkulin">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} placeholder="mm (indurasi)" />
              </Form.Item>
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">Foto Toraks</Divider>
              </div>
              <Form.Item label="Tanggal" name="tanggalFotoToraks" >
                <DatePicker onChange={onChange} size='middle' disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Nomor Seri" name="nomorSeriFotoToraks">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Kesan" name="kesanFotoToraks">
                <Input.TextArea style={inputStylingTextArea} rows={4} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <div className="col-span-2">
                <Divider orientation="left" orientationMargin="0">Biopsi Jarum Halus / <i>Fine Needle Aspiration Biopsy</i> (FNAB)</Divider>
              </div>
              <Form.Item label="Tanggal" name="tanggalFnab" >
                <DatePicker onChange={onChange} size='middle' disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Hasil" name="hasilFnab">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Biakan hasil contoh uji selain dahak" name="hasilUjiSelainDahak" >
                <Radio.Group disabled={isDataFinished && !isEdit && !!form.getFieldValue('hasilUjiSelainDahak')}>
                  <Radio value="1"><i>Mycobacterium Tuberculosis</i> (MTB)</Radio>
                  <Radio value="2">Bukan MTB</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Deskripsi" name="deskripsiFnab">
                <Input style={inputStyling} disabled={isDataFinished && !isEdit} />
              </Form.Item>

              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Pengobatan Selesai
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Tanggal Selesai" name="tanggalSelesaiPengobatanTb" >
                <DatePicker onChange={onChange} size='middle' disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Hasil Pengobatan" name="hasilPengobatanTb" >
                <Select size="middle" onChange={onHasilPengobatanTbChange} disabled={isDataFinished && !isEdit && !!form.getFieldValue('hasilPengobatanTb')} options={[
                  { value: '1', label: <span>Sembuh</span> },
                  { value: '2', label: <span>Pengobatan Selesai</span> },
                  { value: '3', label: <span>Gagal</span> },
                  { value: '4', label: <span>Meninggal</span> },
                  { value: '5', label: <span>Putus Berobat</span> },
                  { value: '6', label: <span>Tidak Dievaluasi</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Catatan" name="catatanHasilPengobatanTb">
                <Input.TextArea style={inputStylingTextArea} disabled={isDataFinished && !isEdit} rows={4}/>
              </Form.Item>
            </>
          )}

          {/* Laboratorium */}
          { selectedCategory === 'lab' && (
            <>
              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Pemeriksaan Laboratorium
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Pemeriksa" name="pemeriksaLab" rules={[{ required: true, message: 'Harap pilih pemeriksa lab!' }]} >
                <Select
                  showSearch
                  placeholder="Pilih Pemeriksa"
                  optionFilterProp="children"
                  onChange={handlePemeriksaLabChange}
                  value={selectedNurseLab.namaAsisten}
                  size='middle'
                  filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
                  options={uniqueNurses.map(nurse => ({ value: nurse.namaAsisten, label: nurse.namaAsisten }))}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              <Form.Item label="Rujukan dari" name="rujukanDari" rules={[{ required: true, message: 'Harap pilih sumber rujukan!' }]} >
                <Select size="middle" onChange={onRujukanDariChange} disabled={isDataFinished && !isEdit} options={[
                  { value: 'Sendiri', label: <span>1. Sendiri</span> },
                  { value: 'Dokter', label: <span>2. Dokter</span> },
                  { value: 'Perawat/Bidan', label: <span>3. Perawat/Bidan</span> },
                  { value: 'Eksternal', label: <span>4. Eksternal</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Perujuk" name="perujukLab" >
                <Select
                  showSearch
                  placeholder="Pilih Dokter / Perawat / Bidan Perujuk"
                  optionFilterProp="children"
                  onChange={handlePerujukLabChange}
                  value={selectedDoctorLab.namaDokter}
                  size='middle'
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={schedules.dokter.map(dokter => ({ value: dokter.namaDokter, label: dokter.namaDokter })).concat(
                    uniqueNurses.map(nurse => ({ value: nurse.namaAsisten, label: nurse.namaAsisten }))
                  )}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              <div></div>

              <div className="col-span-2">
                <Divider orientation="left">Laboratorium</Divider>
              </div>
              {/* Hematology */}
              <LabCategory
                category="HAEMATOLOGI"
                options={hematologyOptions}
                checkedList={hematologyCheckedList}
                setCheckedList={setHematologyCheckedList}
                checkAll={hematologyCheckAll}
                setCheckAll={setHematologyCheckAll}
                disabled={isDataFinished && !isEdit}
              />
              {/* Clinical Chemistry */}
              <LabCategory
                category="KIMIA KLINIK"
                options={clinicalChemistryOptions}
                checkedList={clinicalChemistryCheckedList}
                setCheckedList={setClinicalChemistryCheckedList}
                checkAll={clinicalChemistryCheckAll}
                setCheckAll={setClinicalChemistryCheckAll}
                disabled={isDataFinished && !isEdit}
              />
              {/* Urinalysis */}
              <LabCategory
                category="URINALISA"
                options={urinalysisOptions}
                checkedList={urinalysisCheckedList}
                setCheckedList={setUrinalysisCheckedList}
                checkAll={urinalysisCheckAll}
                setCheckAll={setUrinalysisCheckAll}
                disabled={isDataFinished && !isEdit}
              />
              {/* Microbiology */}
              <LabCategory
                category="MIKROBIOLOGI DAN PARASITOLOGI"
                options={microbiologyOptions}
                checkedList={microbiologyCheckedList}
                setCheckedList={setMicrobiologyCheckedList}
                checkAll={microbiologyCheckAll}
                setCheckAll={setMicrobiologyCheckAll}
                disabled={isDataFinished && !isEdit}
              />
              {/* Immunology */}
              <LabCategory
                category="IMUNOLOGI"
                options={immunologyOptions}
                checkedList={immunologyCheckedList}
                setCheckedList={setImmunologyCheckedList}
                checkAll={immunologyCheckAll}
                setCheckAll={setImmunologyCheckAll}
                disabled={isDataFinished && !isEdit}
              />

              <div className="col-span-2">
                <Divider orientation="left">Kesimpulan / Saran</Divider>
              </div>
              <Form.Item label="Status Pemeriksaan" name="statusPemeriksaanLab" rules={[{ required: true, message: 'Harap isi status lab!' }]} >
                <Select size="middle" onChange={onstatusPemeriksaanLabChange} disabled={isDataFinished && !isEdit} options={[
                  { value: '1', label: <span>1. Urgent</span> },
                  { value: '2', label: <span>2. Tidak Urgent</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Saran" name="saranLab" >
                <Input.TextArea style={inputStylingTextArea} rows={4} disabled={isDataFinished && !isEdit} />
              </Form.Item>

              {/* LAMPIRAN BERKAS */}
              <div className="col-span-2">
                <Divider orientation="left">Lampiran Berkas</Divider>
              </div>
              <div className="col-span-2">
                <div className="flex flex-wrap w-full gap-4"></div>
                {(!isDataFinished || isEdit) && (
                  <div className='grid gap-y-4'>
                    <div>
                      <Dragger {...props} >
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p className="ant-upload-text">Klik atau seret berkas ke area ini untuk mengunggah</p>
                        <p className="ant-upload-hint">
                          Dapat menerima berkas dengan format .pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png, .zip, .rar, .7z.
                        </p>
                      </Dragger>
                    </div>
                    <div id='lampiran' className="flex gap-x-8"></div>
                  </div>
                )}
              </div>
              <LabAttachments files={labFiles} />
            </>
          )}

          {/* Selesai / Pasien Pulang */}
          { selectedCategory === 'selesai' && (
            <>
              <div className="col-span-2 mb-6 text-lg text-gray-900">
                Pengobatan Selesai
                <hr className="h-px bg-gray-700 border-0"/>
              </div>
              <Form.Item label="Dokter / Tenaga Medis" name="namaDokterTb">
                <Select
                  showSearch
                  placeholder="Pilih Dokter"
                  optionFilterProp="children"
                  onChange={handleDoctorChange}
                  value={selectedDoctor.namaDokterTb}
                  size='middle'
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={schedules.dokter.map(dokter => ({ value: dokter.namaDokter, label: dokter.namaDokter }))}
                  disabled={isDataFinished && !isEdit}
                />
              </Form.Item>
              {/* JUDUL REKAM MEDIS */}
              <div className="col-span-2">
                <Divider orientation="left">Judul Rekam Medis</Divider>
              </div>
              <div className="col-span-2">
                <Form.Item label="Judul Rekam Medis" name="judulRekamMedis" rules={[{ required: true, message: 'Harap isi judul pemeriksaan!' }]} >
                  <Input style={inputStyling} disabled={isDataFinished && !isEdit} rules={[{ required: true, message: 'Harap isi judul rekam medis!' }]}/>
                </Form.Item>
                <Form.Item label="Catatan" name="catatanRekamMedis">
                  <Input.TextArea style={inputStylingTextArea} disabled={isDataFinished && !isEdit} rows={4}/>
                </Form.Item>
              </div>
              <div className="col-span-2">
                <Divider orientation="left">Status Pulang</Divider>
              </div>
              <Form.Item label="Status Pulang" name="statusPulang" rules={[{ required: true, message: 'Harap pilih status pulang!' }]} >
                <Select size="middle" onChange={onStatusPulangChange} disabled={isDataFinished && !isEdit && !!form.getFieldValue('statusPulang')} options={[
                  { value: '1', label: <span>1. Berobat Jalan</span> },
                  { value: '2', label: <span>2. Rujuk Internal</span> },
                  { value: '3', label: <span>3. Rujuk Lanjut</span> },
                  { value: '4', label: <span>4. Meninggal</span> },
                  { value: '5', label: <span>5. Batal Berobat</span> },
                ]}/>
              </Form.Item>
              <Form.Item label="Rencana Kontrol" name="tanggalRencanaKontrol" >
                <DatePicker onChange={onChange} size='middle' format={dateFormat} disabled={isDataFinished && !isEdit} />
              </Form.Item>
              <Form.Item label="Keterangan" name="keteranganPulang">
                <Input.TextArea style={inputStylingTextArea} rows={4} disabled={isDataFinished && !isEdit} />
              </Form.Item>
            </>
          )}
        </div>
        <Form.Item className="flex justify-center">
        {(status === "ongoing" || status === "active") ? (
          <Button type="primary" ghost htmlType="submit" size="medium">Simpan</Button>
        ) : status === "done" ? (
          isEdit ? (
            <>
              <Button type="default" onClick={handleCancel} size="medium">Batal</Button>
              <Button type="primary" ghost htmlType="submit" size="medium">Simpan</Button>
            </>
          ) : (
            <Button type="primary" ghost onClick={handleEdit} size="medium">Ubah Data</Button>
          )
        ) : null}
        </Form.Item>
      </Form>
    );
  };

  const EMRCard = () => {
    if (!selectedData.appointmentId) return <Card><Empty description="Silakan pilih Rawat Jalan"/></Card>;
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

  const combinedDataSource = appointments
    ?.map((appointment, index) => {
      return {
        key: index + 1,
        appointmentId: appointment?.appointmentId,
        tanggalTerpilih: (
          <>
            {new Date(appointment?.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}<br></br>
            {appointment?.waktuTerpilih}
          </>
        ),
        originalTanggalTerpilih: appointment?.tanggalTerpilih,
        accountAddress: appointment?.accountAddress,
        nomorAntrean: appointment?.nomorAntrean,
        dmrNumber: appointment?.dmrNumber,
        emrNumber: appointment?.emrNumber,
        nomorIdentitas: appointment?.nomorIdentitas,
        namaLengkap: appointment?.namaLengkap,
        namaDokter: appointment?.namaDokter,
        gender: appointment?.gender,
        spesialisasi: appointment?.spesialisasi,
        status: appointment?.status,
      };
    })
    ?.sort((a, b) => {
      if (selectedOrder === "newest") {
        return new Date(b.originalTanggalTerpilih) - new Date(a.originalTanggalTerpilih);
      } else {
        return new Date(a.originalTanggalTerpilih) - new Date(b.originalTanggalTerpilih);
      }
    });

  const filteredDataSource = combinedDataSource
    ?.filter((record) => {
      const matchesSearchText =
        (record.appointmentId && record.appointmentId.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.nomorAntrean && record.nomorAntrean.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.dmrNumber && record.dmrNumber.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.emrNumber && record.emrNumber.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.namaLengkap && record.namaLengkap.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.namaDokter && record.namaDokter.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.spesialisasi && record.spesialisasi.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.nomorIdentitas && record.nomorIdentitas.toLowerCase().includes(searchText.toLowerCase()))

      const matchesStatus = selectedStatus ? record.status === selectedStatus : true;
      const matchesPoli = selectedPoli ? record.spesialisasi === selectedPoli : true;
      return matchesSearchText && matchesStatus && matchesPoli;
    });

  return (
    <>
      <NavbarController type={type} page={role} color="blue"/>
      <div className="grid grid-cols-1 py-24 mx-12 min-h-fit">
        <div className="grid justify-between grid-cols-5 gap-x-8">
          <div className="grid items-start col-span-5">
            <div className="grid mb-4"><BackButton linkToPage="/nurse/pelayanan-medis"/></div>
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
                      <p>{convertProfileData(profile).tanggalLahir}</p>
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
                <div className="flex justify-end gap-x-8 w-full">
                  <Select
                    placeholder="Pilih Status"
                    onChange={(value) => setSelectedStatus(value)}
                    style={{ width: 150 }}
                    allowClear
                  >
                    <Select.Option value="ongoing">Sedang berjalan</Select.Option>
                    <Select.Option value="active">Sedang diperiksa</Select.Option>
                    <Select.Option value="done">Selesai</Select.Option>
                    <Select.Option value="canceled">Batal</Select.Option>
                  </Select>
                  <Select
                    placeholder="Pilih Poli/Ruangan"
                    onChange={(value) => setSelectedPoli(value)}
                    style={{ width: 150 }}
                    allowClear
                  >
                    <Select.Option value="Umum">Umum</Select.Option>
                    <Select.Option value="TB Paru">TB Paru</Select.Option>
                    <Select.Option value="KIA">KIA</Select.Option>
                  </Select>
                  <Select
                    placeholder="Urutkan"
                    onChange={(value) => setSelectedOrder(value)}
                    style={{ width: 120 }}
                    defaultValue="newest"
                  >
                    <Select.Option value="newest">Terbaru</Select.Option>
                    <Select.Option value="oldest">Terlama</Select.Option>
                  </Select>
                  <Search
                    placeholder="Cari berdasarkan teks"
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                    />
                </div>
                <div>
                  <Table columns={columns} dataSource={filteredDataSource} size="middle" pagination={false} />
                </div>
              </div>
              <div>
                <div className='grid grid-cols-4 w-full gap-x-8 gap-y-4 pb-4'>
                <Button
                  type="default"
                  className={selectedCategory === 'anamnesis' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                  onClick={() => setSelectedCategory('anamnesis')}
                  disabled={disabledCategories.anamnesis}
                >
                  Anamnesis
                </Button>
                <Button
                  type="default"
                  className={selectedCategory === 'diagnosis' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                  onClick={() => setSelectedCategory('diagnosis')}
                  disabled={disabledCategories.diagnosis}
                >
                  Diagnosis
                </Button>
                <Button
                  type="default"
                  className={selectedCategory === 'kehamilan' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                  onClick={() => setSelectedCategory('kehamilan')}
                  disabled={disabledCategories.kehamilan}
                >
                  Pengamatan Kehamilan
                </Button>
                <Button
                  type="default"
                  className={selectedCategory === 'tbParu' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                  onClick={() => setSelectedCategory('tbParu')}
                  disabled={disabledCategories.tbParu}
                >
                  Pemeriksaan TB Paru
                </Button>
                <Button
                  type="default"
                  className={selectedCategory === 'lab' ? "bg-blue-600 text-white" : "bg-default border-1 border-gray-300"}
                  onClick={() => setSelectedCategory('lab')}
                  disabled={disabledCategories.lab}
                >
                  Laboratorium
                </Button>
                <Button
                  type="ghost"
                  className={selectedCategory === 'selesai' ? "bg-green-500 hover:bg-green-400 text-white" : "bg-default border-1 border-gray-300 hover:bg-green-400 hover:border-green-400 hover:text-white"}
                  onClick={() => setSelectedCategory('selesai')}
                  disabled={disabledCategories.selesai}
                >
                  <div className='flex justify-center gap-x-2'>
                    <SaveOutlined />
                    <p>Selesai</p>
                  </div>
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
