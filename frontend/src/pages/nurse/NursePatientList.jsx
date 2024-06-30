import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientData from "../staff/PatientData";
import PatientRME from "../staff/PatientRME";
import { Table, Button, Modal, Tag, Select, Input } from "antd";
const { Search } = Input;
import { CONN } from "../../../../enum-global";
import { ConvertData, FormatDate2 } from "../../components/utils/Formating";

export default function NursePatientList({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);

  const [accounts, setAccounts] = useState();
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRMEModalOpen, setIsRMEModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFaskesAsal, setSelectedFaskesAsal] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

  const handleCancel = () => {setIsModalOpen(false) };
  const handleRMECancel = () => {setIsRMEModalOpen(false) };
  const showModal = (emrNumber) => {
    const selectedProfile = profiles.find(profile => profile.emrNumber === emrNumber);
    const selectedAccount = accounts.find(account => account.accountAddress === selectedProfile.accountAddress);
    setSelectedData({
      ...selectedAccount,
      profile: selectedProfile
    });
    setIsModalOpen(true);
  };
  const showRMEModal = (emrNumber) => {
    const selectedProfile = profiles.find(profile => profile.emrNumber === emrNumber);
    const selectedAccount = accounts.find(account => account.accountAddress === selectedProfile.accountAddress);
    const appointmentsData = appointments.filter(appointment => appointment.emrNumber === emrNumber);
    setSelectedData({
      ...selectedAccount,
      profile: selectedProfile,
      appointments: appointmentsData
    });
    setIsRMEModalOpen(true);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/nurse/patient-data`, {
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
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [token]);

  let type = 3; // nurse
  const columns = [
    {
      title: 'No.',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Alamat Akun',
      dataIndex: 'accountAddress',
      key: 'accountAddress',
      render: (text) => text ? <Tag color="blue">{text}</Tag> : '-',
    },
    {
      title: 'Nomor DRM',
      dataIndex: 'dmrNumber',
      key: 'dmrNumber',
    },
    {
      title: 'Nomor RME',
      dataIndex: 'emrNumber',
      key: 'emrNumber',
    },
    {
      title: 'Nomor Identitas',
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
    },
    {
      title: 'Tanggal Lahir',
      dataIndex: 'tanggalLahir',
      key: 'tanggalLahir',
      render: (text) => text || '-',
    },
    {
      title: 'Nomor Telepon/HP',
      dataIndex: 'nomorTelepon',
      key: 'nomorTelepon',
      render: (text) => text || '-',
    },
    {
      title: 'Alamat',
      dataIndex: 'alamat',
      key: 'alamat',
      render: (text) => text || '-',
    },
    {
      title: 'Faskes Asal',
      dataIndex: 'faskesAsal',
      key: 'faskesAsal'
    },
    {
      title: 'Profil',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => showModal(record.emrNumber)}>Lihat</Button>),
    },
    {
      title: 'Riwayat Pelayanan',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => showRMEModal(record.emrNumber)}>Lihat</Button>),
    },
  ];

  const dataSource = profiles?.map((profile, index) => ({
    key: index + 1,
    accountAddress: profile?.accountAddress,
    dmrNumber: profile?.dmrNumber,
    emrNumber: profile?.emrNumber,
    nomorIdentitas: profile?.nomorIdentitas,
    namaLengkap: profile?.namaLengkap,
    gender: ConvertData(profile)?.gender,
    tanggalLahir: FormatDate2(profile?.tanggalLahir),
    alamat: profile?.alamat,
    nomorTelepon: profile?.nomorTelepon,
    faskesAsal: profile?.faskesAsal,
  }));

  const filteredDataSource = dataSource
    ?.filter((record) => {
      const matchesSearchText =
        (record.accountAddress && record.accountAddress.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.dmrNumber && record.dmrNumber.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.emrNumber && record.emrNumber.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.nomorIdentitas && record.nomorIdentitas.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.namaLengkap && record.namaLengkap.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.gender && record.gender.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.tanggalLahir && record.tanggalLahir.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.alamat && record.alamat.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.nomorTelepon && record.nomorTelepon.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.faskesAsal && record.faskesAsal.toLowerCase().includes(searchText.toLowerCase()))

      const matchesFaskesAsal = selectedFaskesAsal ? record.faskesAsal === selectedFaskesAsal : true;
      const matchesGender = selectedGender ? record.gender === selectedGender : true;
      return matchesSearchText && matchesGender && matchesFaskesAsal;
    });

  sessionStorage.setItem("nursePatientProfiles", JSON.stringify(profiles));
  sessionStorage.setItem("nursePelayananMedis", JSON.stringify(appointments));

  const userAccountData = {
    role: "nurse",
  }

  return (
    <>
      <NavbarController type={type} page="data-pasien" color="blue" />
      <div>
        <div className="grid items-center justify-center w-11/12 grid-cols-1 pt-24 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="flex gap-x-4 h-fit">
            <div className="flex justify-end gap-x-8 w-full pb-4">
              <Select
                placeholder="Pilih Faskes Asal"
                allowClear
                onChange={(value) => setSelectedFaskesAsal(value)}
                style={{ width: 180 }}
              >
                <Select.Option value="Puskesmas Pejuang">Puskesmas Pejuang</Select.Option>
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
              <Search
                placeholder="Cari berdasarkan teks"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
            </div>
          </div>
        </div>
        <div className="grid justify-center w-12/12 grid-cols-1 pt-8 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="w-full">
            <Table columns={columns} dataSource={filteredDataSource} pagination={false} />
          </div>
        </div>
      </div>
      <Modal width={1000} open={isModalOpen} onCancel={handleCancel} footer={null} style={{top: 20}}>
        {selectedData.profile && (
          <>
            <PatientData dmrNumber={selectedData.profile.dmrNumber} userDataProps={selectedData.profile} userAccountData={userAccountData} userData={selectedData} prerole="nurse" />
          </>
        )}
      </Modal>
      <Modal width={1800} open={isRMEModalOpen} onCancel={handleRMECancel} footer={null} style={{top: 20}}>
        {selectedData.profile && (
          <>
            <PatientRME dmrNumber={selectedData.profile.dmrNumber} userDataProps={selectedData.profile} userAccountData={userAccountData} userData={selectedData} appointments={selectedData.appointments} />
          </>
        )}
      </Modal>
    </>
  );
}
