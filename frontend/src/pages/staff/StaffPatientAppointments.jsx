import { CONN } from "../../../../enum-global";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Tag, Select } from "antd";
import NavbarController from "../../components/Navbar/NavbarController";
import MakeAppointmentButton from "../../components/Buttons/MakeAppointment";
import PatientAppointmentDisplayStaff from "./PatientAppointmentDisplayStaff";

export default function StaffPatientAppointments({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const userData = JSON.parse(sessionStorage.getItem("staffPatientData"));
  const profiles = JSON.parse(sessionStorage.getItem("staffPatientProfiles"));
  if (!token || !accountAddress) window.location.assign(`/staff/signin`);

  const [scheduleData, setScheduleData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState("Semua");

  const handleProfileChange = (value) => { setSelectedProfile(value); };
  // const handleOk = () => { setIsModalOpen(false) };
  const handleCancel = () => {setIsModalOpen(false) };
  const showModal = (appointmentId) => {
    const selected = appointmentData.find(a => a.data.appointmentId === appointmentId);
    setSelectedAppointment(selected.data);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (token && accountAddress) {
      const fetchDataAsync = async () => {
        try {
          const responseAppointment = await fetch(
            `${CONN.BACKEND_LOCAL}/staff/patient-appointments`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          const data = await responseAppointment.json();
          setScheduleData(data.dokter);
          setAppointmentData(data.patientAppointments);
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error);
        }
      };
      fetchDataAsync();
    }
  }, []);

  let type;
  switch (role) {
    case "patient": type = 1;
      break;
    case "doctor": type = 2;
      break;
    case "nurse": type = 3;
      break;
    case "staff": type = 4;
      break;
  }

  const columns = [
    { title: 'No.', dataIndex: 'key', key: 'key' },
    { title: 'ID Pendaftaran', dataIndex: 'appointmentId', key: 'appointmentId' },
    { title: 'Nama Pasien', dataIndex: 'namaLengkap', key: 'namaLengkap' },
    { title: 'Nama Dokter', dataIndex: 'namaDokter', key: 'namaDokter' },
    { title: 'Spesialisasi', dataIndex: 'spesialisasiDokter', key: 'spesialisasiDokter' },
    { title: 'Rumah Sakit', dataIndex: 'rumahSakit', key: 'rumahSakit' },
    { title: 'Waktu', dataIndex: 'waktuTerpilih', key: 'waktuTerpilih' },
    { title: 'Tanggal', dataIndex: 'tanggalTerpilih', key: 'tanggalTerpilih' },
    { title: 'Status', dataIndex: 'status',
      render: (status) => (
        <Tag color={ status === "ongoing" ? "blue" : status === "done" ? "green" : "red" }>
          { status === "ongoing" ? "Sedang berjalan" : status === "done" ? "Selesai" : "Batal"}
        </Tag>
      ),
    },
    { title: 'Aksi', key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => showModal(record.appointmentId)}>Lihat</Button>),
    },
  ];

  const filteredAppointmentData = selectedProfile === "Semua" ? appointmentData : appointmentData.filter(appointment => appointment.data.nomorRekamMedis === selectedProfile);
  const sortedAppointmentData = [...filteredAppointmentData].sort((a, b) => { return new Date(b.data.createdAt) - new Date(a.data.createdAt); });
  const dataSource = sortedAppointmentData?.map((appointment, index) => ({
    key: index + 1,
    appointmentId: appointment.data.appointmentId,
    namaLengkap: appointment.data.namaLengkap,
    namaDokter: appointment.data.namaDokter,
    spesialisasiDokter: `Dokter ${appointment.data.spesialisasiDokter}`,
    waktuTerpilih: appointment.data.waktuTerpilih,
    tanggalTerpilih: new Date(appointment.data.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    rumahSakit: appointment.data.rumahSakit,
    status: appointment.data.status,
  }));

  return (
    <>
      <NavbarController type={type} page="Profil Pasien" color="blue" accountAddress={accountAddress} />
      <div className="grid grid-cols-1 py-24 mx-12 min-h-fit">
        <div className="grid justify-between grid-cols-5 gap-x-8">
          <div className="grid items-start grid-cols-2 col-span-5">
            <div className="grid mb-8">
              <MakeAppointmentButton
                buttonText={"Buat Appointment"}
                scheduleData={scheduleData || []}
                userData={userData}
                token={token}
                alamatStaf={accountAddress}
              />
            </div>
            <div className="grid mb-8 ml-auto">
              <Select style={{ width: 200, marginLeft: 20 }} onChange={handleProfileChange} defaultValue="Semua"
              >
                <Select.Option value="Semua">Semua</Select.Option>
                {profiles.map(profile => (
                  <Select.Option key={profile.nomorRekamMedis} value={profile.nomorRekamMedis}>{profile.namaLengkap}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid items-start col-span-5">
            <Table columns={columns} dataSource={dataSource} />
          </div>
        </div>
      </div>
      <Modal width={800} open={isModalOpen} onCancel={handleCancel} footer={null}>
        {selectedAppointment && (
          <>
            <PatientAppointmentDisplayStaff data={{appointment: {data: selectedAppointment}}} token={token} />
          </>
        )}
      </Modal>
    </>
  );
}
