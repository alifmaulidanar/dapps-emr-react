import { CONN } from "../../../../enum-global";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Tag } from "antd";
import ProfileDropdown from "../../components/Buttons/ProfileDropdown";
import NavbarController from "../../components/Navbar/NavbarController";
import MakeAppointmentButton from "../../components/Buttons/MakeAppointment";
import PatientAppointmentDisplayStaff from "./PatientAppointmentDisplayStaff";

export default function StaffPatientAppointments({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const userData = JSON.parse(sessionStorage.getItem("staffPatientData"));
  const profiles = JSON.parse(sessionStorage.getItem("staffPatientProfiles"));
  if (!token || !accountAddress) window.location.assign(`/staff/signin`);

  const [users, setUsers] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointmentData, setAppointmentData] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filteredAppointmentData, setFilteredAppointmentData] = useState([]);

  // const handleOk = () => { setIsModalOpen(false) };
  const handleCancel = () => {setIsModalOpen(false) };
  const showModal = (appointmentId) => {
    const selected = appointmentData.find(a => a.data.appointmentId === appointmentId);
    setSelectedAppointment(selected.data);
    setIsModalOpen(true);
  };

  const handleUserChange = (nomorIdentitas) => {
    const user = users.find((p) => p.nomorIdentitas === nomorIdentitas);
    setSelectedUser(user);
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

  useEffect(() => {
    if (selectedUser) {
      const filteredData = appointmentData.filter(
        (appointment) => appointment.data.nomorIdentitas === selectedUser.nomorIdentitas
      );
      setFilteredAppointmentData(filteredData);
    }
  }, [selectedUser, appointmentData]);

  let type;
  switch (role) {
    case "patient":
      type = 1;
      break;
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
      title: 'Nama Pasien',
      dataIndex: 'namaLengkap',
      key: 'namaLengkap',
    },
    {
      title: 'Nama Dokter',
      dataIndex: 'namaDokter',
      key: 'namaDokter',
    },
    {
      title: 'Spesialisasi',
      dataIndex: 'spesialisasiDokter',
      key: 'spesialisasiDokter',
    },
    {
      title: 'Rumah Sakit',
      dataIndex: 'rumahSakit',
      key: 'rumahSakit',
    },
    {
      title: 'Tanggal',
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
      render: (_, record) => (<Button type="primary" ghost onClick={() => showModal(record.appointmentId)}>Lihat</Button>),
    },
  ];

  const dataSource = appointmentData?.map((appointment, index) => ({
    key: index + 1,
    appointmentId: appointment.data.appointmentId,
    namaLengkap: appointment.data.namaLengkap,
    namaDokter: appointment.data.namaDokter,
    spesialisasiDokter: `Dokter ${appointment.data.spesialisasiDokter}`,
    tanggalTerpilih: new Date(appointment.data.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    rumahSakit: appointment.data.rumahSakit,
    status: appointment.data.status,
  }));

  return (
    <>
      <NavbarController
        type={type}
        page="Profil Pasien"
        color="blue"
        accountAddress={accountAddress}
      />
      <div className="grid min-h-screen grid-cols-1 py-24 mx-12">
        <div className="grid grid-cols-5 gap-x-8">
            <div className="grid col-span-5 mb-8">
              <MakeAppointmentButton
                buttonText={"Buat Appointment"}
                scheduleData={scheduleData || []}
                userData={userData}
                token={token}
              />
              <ProfileDropdown
                users={users}
                onChange={handleUserChange}
                defaultValue={selectedUser?.nomorIdentitas || "Tidak ada pasien"}
              />
            </div>
            <div className="grid col-span-5">
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
