import { CONN } from "../../../../enum-global";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Tag, Select } from "antd";
import NavbarController from "../../components/Navbar/NavbarController";
// import MakeAppointmentButton from "../../components/Buttons/MakeAppointment";
import PatientAppointmentDisplayStaff from "./PatientAppointmentDisplayStaff";

export default function StaffPelayananMedis({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  // const userData = JSON.parse(sessionStorage.getItem("staffPatientData"));
  // const profilesStorage = JSON.parse(sessionStorage.getItem("staffPatientProfiles"));
  // const appointmentData = JSON.parse(sessionStorage.getItem("StaffPelayananMedis"));
  if (!token || !accountAddress) window.location.assign(`/staff/signin`);

  // const [scheduleData, setScheduleData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [appointmentData, setAppointments] = useState([]);
  // const [appointmentData, setAppointmentData] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState("Semua");

  const handleProfileChange = (value) => { setSelectedProfile(value); };
  // const handleOk = () => { setIsModalOpen(false) };
  const handleCancel = () => {setIsModalOpen(false) };
  const showModal = (appointmentId) => {
    const selected = appointmentData.find(a => a.appointmentId === appointmentId);
    setSelectedAppointment(selected);
    setIsModalOpen(true);
  };

  // useEffect(() => {
  //   if (token && accountAddress) {
  //     const fetchDataAsync = async () => {
  //       try {
  //         const responseAppointment = await fetch(
  //           `${CONN.BACKEND_LOCAL}/staff/patient-appointments`,
  //           {
  //             method: "GET",
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: "Bearer " + token,
  //             },
  //           }
  //         );
  //         const data = await responseAppointment.json();
  //         setScheduleData(data.dokter);
  //         setAppointmentData(data.patientAppointments);
  //       } catch (error) {
  //         console.error(`Error fetching ${role} data:`, error);
  //       }
  //     };
  //     fetchDataAsync();
  //   }
  // }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/patient-data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
        const data = await response.json();
        if (!response.ok) console.log(data.error, data.message);
        // setAccounts(data.patientAccountData);
        setProfiles(data.profiles);
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [token]);

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
    { title: 'Spesialisasi', dataIndex: 'spesialisasi', key: 'spesialisasi' },
    { title: 'Faskes Asal', dataIndex: 'faskesAsal', key: 'faskesAsal' },
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

  const filteredAppointmentData = selectedProfile === "Semua" ? appointmentData : appointmentData.filter(appointment => appointment.emrNumber === selectedProfile);
  const sortedAppointmentData = [...filteredAppointmentData].sort((a, b) => { return new Date(b.appointmentCreatedAt) - new Date(a.appointmentCreatedAt); });
  const dataSource = sortedAppointmentData?.map((appointment, index) => ({
    key: index + 1,
    appointmentId: appointment.appointmentId,
    namaLengkap: appointment.namaLengkap,
    namaDokter: appointment.namaDokter,
    spesialisasi: `Dokter ${appointment.spesialisasi}`,
    waktuTerpilih: appointment.waktuTerpilih,
    tanggalTerpilih: new Date(appointment.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    faskesAsal: appointment.faskesAsal,
    status: appointment.status,
  }));

  sessionStorage.setItem("staffPatientProfiles", JSON.stringify(profiles));
  sessionStorage.setItem("StaffPelayananMedis", JSON.stringify(appointmentData));

  return (
    <>
      <NavbarController type={type} page="pelayanan-medis" color="blue" accountAddress={accountAddress} />
      <div className="grid grid-cols-1 py-24 mx-12 min-h-fit">
        <div className="grid justify-between grid-cols-5 gap-x-8">
          <div className="grid items-start grid-cols-2 col-span-5">
            <div className="grid mb-8">
            </div>
            <div className="grid mb-8 ml-auto">
              <Select style={{ width: 200, marginLeft: 20 }} onChange={handleProfileChange} defaultValue="Semua"
              >
                <Select.Option value="Semua">Semua</Select.Option>
                {profiles.map(profile => (
                  <Select.Option key={profile.emrNumber} value={profile.emrNumber}>{profile.namaLengkap}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid items-start col-span-5">
            <Table columns={columns} dataSource={dataSource} pagination={false} />
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
