import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import { Tag, Table, Button } from "antd";
import { CONN } from "../../../../enum-global";
// import ListSearchBar from "../../components/Forms/ListSearchBar";

export default function DoctorPatientList({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  
  const [accounts, setAccounts] = useState();
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const saveDataToSessionStorage = (emrNumber) => {
    const selectedProfile = profiles.find(profile => profile.emrNumber === emrNumber);
    const selectedAccount = accounts.find(account => account.accountAddress === selectedProfile.accountAddress);
    sessionStorage.setItem("selectedProfile", JSON.stringify(selectedProfile));
    sessionStorage.setItem("selectedAccount", JSON.stringify(selectedAccount));
    window.location.assign("/nurse/patient-list/patient-details");
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
        setSchedules(data.schedules);
        sessionStorage.setItem("doctorSchedules", JSON.stringify(data.schedules));
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || '-',
    },
    {
      title: 'Nomor Telepon',
      dataIndex: 'nomorTelepon',
      key: 'nomorTelepon',
      render: (text) => text || '-',
    },
    {
      title: 'Faskes Asal',
      dataIndex: 'faskesAsal',
      key: 'faskesAsal'
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => saveDataToSessionStorage(record.emrNumber)}>Lihat</Button>),
    },
  ];

  const dataSource = profiles?.map((profile, index) => ({
    key: index + 1,
    accountAddress: profile?.accountAddress,
    dmrNumber: profile?.dmrNumber,
    emrNumber: profile?.emrNumber,
    nomorIdentitas: profile?.nomorIdentitas,
    namaLengkap: profile?.namaLengkap,
    email: profile?.email,
    nomorTelepon: profile?.nomorTelepon,
    faskesAsal: profile?.faskesAsal,
  }));
  
  sessionStorage.setItem("staffPatientProfiles", JSON.stringify(profiles));
  sessionStorage.setItem("StaffPelayananMedis", JSON.stringify(appointments));

  return (
    <>
      <NavbarController type={type} page={role} color="blue" />
      <div>
        <div className="grid items-center justify-center w-4/5 grid-cols-1 pt-24 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          {/* <div className="flex gap-x-4 h-fit">
            <ListSearchBar />
          </div> */}
        </div>
        <div className="grid justify-center w-4/5 grid-cols-1 pt-8 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="w-full">
            <Table columns={columns} dataSource={dataSource} pagination={false} />
          </div>
        </div>
      </div>
    </>
  );
}
