import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import { Table, Button, Card, Modal, Avatar, Empty, Form, Input, DatePicker, Upload, message } from "antd";
const  { Dragger } = Upload;
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { UserOutlined, RightOutlined, InboxOutlined } from "@ant-design/icons";
import { CONN } from "../../../../enum-global";
import BackButton from "../../components/Buttons/Navigations";
import { useLocation } from "react-router-dom";
import DoctorPatientProfile from "./DoctorPatientProfile";
import { create } from "ipfs-http-client";
import getSigner from "../../components/utils/getSigner";

const ipfsClient = create({ host: "127.0.0.1", port: 5001, protocol: "http" });

export default function DoctorPatientDetails({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  const location = useLocation();
  const record = location.state?.record;
  
  const [profile, setProfile] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadChange = ({ fileList: newFileList }) => { setFileList(newFileList) };
  const handleCancel = () => {setIsModalOpen(false) };
  const showProfileModal = () => { setSelectedData({ profile }); setIsModalOpen(true); };
  const showEMR = (appointmentId) => {
    const appointment = appointments.find(a => a.appointmentId === appointmentId);
    // const history = profile.riwayatPengobatan.find(h => h.appointmentId === appointmentId);
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
          body: JSON.stringify({ accountAddress: record.accountAddress, emrNumber: record.emrNumber }),
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
  }, [token, record.accountAddress, record.emrNumber]);

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
      dataIndex: 'emrNumber',
      key: 'emrNumber',
    },
    {
      title: 'Lokasi Berobat',
      dataIndex: 'rumahSakit',
      key: 'rumahSakit',
    },
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
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => showEMR(record.appointmentId)} icon={<RightOutlined />} />),
    },
  ];
  
  const userImage = profile?.foto;
  const appointmentDataSource = appointments?.map((appointment, index) => ({
    key: index + 1,
    appointmentId: appointment?.appointmentId,
    emrNumber: appointment?.emrNumber,
    rumahSakit: "Eka Hospital " + appointment?.rumahSakit,
    namaDokter: appointment?.namaDokter,
    tanggalTerpilih: (
      <>
        {new Date(appointment?.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}<br></br>
        {appointment?.waktuTerpilih}
      </>
    ),
    rumahSakitAsal: appointment?.rumahSakitAsal,
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
  const inputStyling = { border: "1px solid #E2E8F0", borderRadius: "6px" };

  const submitEMR = async (data, files) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    files.forEach(file => formData.append('files', file.originFileObj));

    const fileCids = await Promise.all(files.map(async file => {
      const result = await ipfsClient.add(file.originFileObj);
      return result.path;
    }));

    formData.append('fileCids', JSON.stringify(fileCids));
    const signer = await getSigner();
    const signature = await signer.signMessage(JSON.stringify(data));
    formData.append('signature', signature);

    try {
      const response = await fetch(CONN.BACKEND_LOCAL + '/submit-emr', {
        // method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Handle success
        message.success('EMR submitted successfully');
      } else {
        // Handle error
        const error = await response.json();
        message.error(`Submission failed: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to submit EMR');
    }
  };

  const EMRForm = ({ appointmentId }) => {
    const [form] = Form.useForm();
    const onFinish = async (values) => { await submitEMR(values, fileList) };
    const onRemove = (file) => { setFileList(fileList.filter(f => f.uid !== file.uid)) };
    const beforeUpload = (file) => { setFileList([...fileList, file]); return false; };
    const uploadProps = { onRemove, beforeUpload, fileList };
    console.log({fileList});
  
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
          <Form.Item label="ID Pendaftaran" name="appointmentId" >
            <Input disabled style={inputStyling} />
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
          <Form.Item label="Judul Rekam Medis" name="judulRekamMedis" >
            <Input style={inputStyling} />
          </Form.Item>
          <Form.Item label="Alergi" name="alergi" >
            <Input style={inputStyling} />
          </Form.Item>
          <Form.Item label="Anamnesa" name="anamnesa" >
            <Input style={inputStyling} />
          </Form.Item>
          <Form.Item label="Terapi" name="terapi" >
            <Input style={inputStyling} />
          </Form.Item>
        </div>
        <Form.Item label="Catatan" name="catatan" >
          <Input.TextArea style={inputStyling} rows={4} />
        </Form.Item>
        <Form.Item name="berkas" label="Berkas">
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
          Support for a single or bulk upload. Only JPG/JPEG, PNG, SVG, DOC/DOCX, XLS/XLSX, PDF, PPT, RAR, ZIP files are allowed.
          </p>
        </Dragger>
        </Form.Item>
        <Form.Item className="flex justify-center mt-12">
          <Button type="primary" ghost htmlType="submit" size="medium">Simpan Permanen</Button>
        </Form.Item>
      </Form>
    );
  };

  const EMRCard = () => {
    if (!selectedData.appointmentId) {
      return (
        <Card>
          <Empty description="Silakan pilih Appointment" />
        </Card>
      );
    }

    const doctor = {
      idDokter: selectedData.appointment?.idDokter,
      namaDokter: selectedData.appointment?.namaDokter,
      alamat: selectedData.appointment?.doctorAddress
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
            <div className="grid grid-cols-7 gap-x-8">
              <div className="grid content-start col-span-3 gap-y-8">
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
                <Table columns={columns} dataSource={appointmentDataSource} size="middle" />
              </div>
              <div className="col-span-4">
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
