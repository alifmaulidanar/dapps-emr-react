import { useState } from "react";
import PatientData from "./PatientData";
import { Table, Button, Modal } from "antd";
import { useLocation } from 'react-router-dom';
import BackButton from "../../components/Buttons/Navigations";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientAppointmentDisplay from "../../components/PatientAppointmentDisplay";

export default function PatientDetails({ role, linkToPage }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const location = useLocation();
  const {account, profile, appointment} = location.state;

  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // const handleOk = () => { setIsModalOpen(false) };
  const handleCancel = () => {setIsModalOpen(false) };
  const showModal = (appointmentId) => {
    const selected = appointment.find(a => a.appointmentId === appointmentId);
    setSelectedAppointment({ ...selected, data: { ...selected } });
    setIsModalOpen(true);
  };

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
      title: 'Tanggal',
      dataIndex: 'tanggalTerpilih',
      key: 'tanggalTerpilih',
    },
    {
      title: 'Rumah Sakit',
      dataIndex: 'rumahSakit',
      key: 'rumahSakit',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => showModal(record.appointmentId)}>Lihat</Button>),
    },
  ];

  const dataSource = appointment?.map((appointment, index) => ({
    key: index + 1,
    appointmentId: appointment?.appointmentId,
    namaDokter: appointment?.namaDokter,
    spesialisasiDokter: `Dokter ${appointment?.spesialisasiDokter}`,
    tanggalTerpilih: new Date(appointment?.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    rumahSakit: appointment?.rumahSakit,
    status: appointment?.status,
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
        <div className="mb-8">
          <BackButton linkToPage={linkToPage} />
        </div>
        <div className="grid grid-cols-5 gap-x-8">
            <div className="grid col-span-2 bg-white border border-gray-200 rounded-lg shadow gap-x-8">
              <PatientData userDataProps={profile[0]} userAccountData={account} />
            </div>
            <div className="grid col-span-3">
              <Table columns={columns} dataSource={dataSource} />
            </div>
        </div>
      </div>
      <Modal title="Data Pendaftaran Rawat Jalan" width={800} open={isModalOpen} onCancel={handleCancel} footer={null}>
        {selectedAppointment && (<PatientAppointmentDisplay data={{appointment: {data: selectedAppointment}}} />)}
      </Modal>
    </>
  );
}
