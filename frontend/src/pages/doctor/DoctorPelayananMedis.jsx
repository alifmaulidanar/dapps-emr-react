import { useState, useEffect } from "react";
import dayjs from 'dayjs';
import NavbarController from "../../components/Navbar/NavbarController";
import { Tag, Table, Button, DatePicker, Select, Input, Modal } from "antd";
const { Search } = Input;
import { CONN } from "../../../../enum-global";
import { ConvertData, FormatDate2 } from "../../components/utils/Formating";
import PatientAppointmentDisplayStaff from "../staff/PatientAppointmentDisplayStaff";

export default function DoctorPelayananMedis({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  
  const [accounts, setAccounts] = useState();
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPoli, setSelectedPoli] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const saveDataToSessionStorage = (emrNumber) => {
    const selectedProfile = profiles.find(profile => profile.emrNumber === emrNumber);
    const selectedAccount = accounts.find(account => account.accountAddress === selectedProfile.accountAddress);
    sessionStorage.setItem("selectedProfile", JSON.stringify(selectedProfile));
    sessionStorage.setItem("selectedAccount", JSON.stringify(selectedAccount));
    window.location.assign("/doctor/pelayanan-medis/detail-pasien");
  };

  const showModal = (appointmentId) => {
    const selected = appointments.find(a => a.appointmentId === appointmentId);
    setSelectedAppointment(selected);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/doctor/patient-data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
        const data = await response.json();
        if (!response.ok) console.log(data.error, data.message);
        setAccounts(data.accounts);
        setProfiles(data.profiles);
        setAppointments(data.appointments);
        setSchedules(data.schedules);
        sessionStorage.setItem("doctorSchedules", JSON.stringify(data.schedules));
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [token]);

  let type = 2; // doctor
  const columns = [
    {
      title: 'No.',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Nomor Antrean',
      dataIndex: 'nomorAntrean',
      key: 'nomorAntrean',
    },
    {
      title: 'ID Pendaftaran',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
    },
    {
      title: 'Tanggal Pendaftaran',
      dataIndex: 'tanggalTerpilih',
      key: 'tanggalTerpilih',
    },
    {
      title: 'Nomor RME',
      dataIndex: 'emrNumber',
      key: 'emrNumber',
    },
    {
      title: 'NIK',
      dataIndex: 'nomorIdentitas',
      key: 'nomorIdentitas',
    },
    {
      title: 'Nama Lengkap',
      dataIndex: 'namaLengkap',
      key: 'namaLengkap',
    },
    {
      title: 'Jenis Kelamin',
      dataIndex: 'gender',
      key: 'gender',
      render: (text) => text || '-',
    },
    {
      title: 'Poli/Ruangan',
      dataIndex: 'spesialisasi',
      key: 'spesialisasi'
    },
    {
      title: 'Nama Dokter/Tenaga Medis',
      dataIndex: 'namaDokter',
      key: 'namaDokter',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color;
        let displayText;
        switch (text) {
          case 'ongoing':
            color = 'blue';
            displayText = 'Sedang berjalan';
            break;
          case 'active':
            color = 'gold';
            displayText = 'Sedang diperiksa';
            break;
          case 'done':
            color = 'green';
            displayText = 'Selesai';
            break;
          case 'canceled':
            color = 'red';
            displayText = 'Batal';
            break;
          default:
            color = 'default';
            displayText = '-';
        }
        return <Tag color={color}>{displayText}</Tag>;
      },
    },
    {
      title: 'RME',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => saveDataToSessionStorage(record.emrNumber)}>Lihat</Button>),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => showModal(record.appointmentId)}>Lihat</Button>),
    },
  ];

  const combinedDataSource = appointments
    ?.filter(appointment => appointment.tanggalTerpilih === selectedDate.format('YYYY-MM-DD'))
    ?.map((appointment, index) => {
    const profile = profiles?.find(profile => profile.emrNumber === appointment.emrNumber);
    return {
      key: index + 1,
      appointmentId: appointment?.appointmentId,
      tanggalTerpilih: FormatDate2(appointment?.tanggalTerpilih),
      accountAddress: profile?.accountAddress,
      nomorAntrean: appointment?.nomorAntrean,
      dmrNumber: profile?.dmrNumber,
      emrNumber: profile?.emrNumber,
      nomorIdentitas: profile?.nomorIdentitas,
      namaLengkap: profile?.namaLengkap,
      namaDokter: appointment?.namaDokter,
      gender: ConvertData(profile)?.gender,
      spesialisasi: appointment?.spesialisasi,
      status: appointment?.status,
    };
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
      const matchesGender = selectedGender ? record.gender === selectedGender : true;
      return matchesSearchText && matchesStatus && matchesPoli && matchesGender;
    });
  
  sessionStorage.setItem("doctorPatientProfiles", JSON.stringify(profiles));
  sessionStorage.setItem("doctorPelayananMedis", JSON.stringify(appointments));

  return (
    <>
      <NavbarController type={type} page="pelayanan-medis" color="blue" />
      <div>
        <div className="grid items-center justify-center w-11/12 grid-cols-1 pt-24 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="flex justify-end gap-x-8 w-full pb-4">
            <Select
              placeholder="Pilih Status"
              allowClear
              onChange={(value) => setSelectedStatus(value)}
              style={{ width: 150 }}
            >
              <Select.Option value="ongoing">Sedang berjalan</Select.Option>
              <Select.Option value="active">Sedang diperiksa</Select.Option>
              <Select.Option value="done">Selesai</Select.Option>
              <Select.Option value="canceled">Batal</Select.Option>
            </Select>
            <Select
              placeholder="Pilih Poli/Ruangan"
              allowClear
              onChange={(value) => setSelectedPoli(value)}
              style={{ width: 150 }}
            >
              <Select.Option value="Umum">Umum</Select.Option>
              <Select.Option value="TB Paru">TB Paru</Select.Option>
              <Select.Option value="KIA">KIA</Select.Option>
            </Select>
            <Select
              placeholder="Pilih Jenis Kelamin"
              allowClear
              onChange={(value) => setSelectedGender(value)}
              style={{ width: 150 }}
            >
              <Select.Option value="Laki-laki">Laki-laki</Select.Option>
              <Select.Option value="Perempuan">Perempuan</Select.Option>
            </Select>
            <DatePicker
              defaultValue={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              format="YYYY-MM-DD"
              allowClear={false}
            />
            <Search
              placeholder="Cari berdasarkan teks"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </div>
        </div>
        <div className="grid justify-center w-11/12 grid-cols-1 pt-8 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="w-full">
            <Table columns={columns} dataSource={filteredDataSource} pagination={false} />
          </div>
        </div>
      </div>
      <Modal width={800} open={isModalOpen} onCancel={handleCancel} footer={null}>
        {selectedAppointment && (
          <PatientAppointmentDisplayStaff data={{appointment: {data: selectedAppointment}}} token={token} prerole="doctor" />
        )}
      </Modal>
    </>
  );
}
