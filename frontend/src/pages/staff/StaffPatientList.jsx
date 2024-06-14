import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientData from "../staff/PatientData";
import { Table, Button, Modal, Tag } from "antd";
import { CONN } from "../../../../enum-global";
import RegisterPatientButton from "../../components/Buttons/RegisterPatientStaff";

export default function StaffPatientList({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);

  const [accounts, setAccounts] = useState();
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancel = () => {setIsModalOpen(false) };
  const showModal = (emrNumber) => {
    const selectedProfile = profiles.find(profile => profile.emrNumber === emrNumber);
    const selectedAccount = accounts.find(account => account.accountAddress === selectedProfile.accountAddress);
    setSelectedData({
      ...selectedAccount,
      profile: selectedProfile
    });
    setIsModalOpen(true);
  };

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
        setAccounts(data.accounts);
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
      title: 'Nomor Telepon/HP',
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
      render: (_, record) => (<Button type="primary" ghost onClick={() => showModal(record.emrNumber)}>Lihat</Button>),
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

  // const mergeAccountAndProfileData = (accounts, profiles) => {
  //   const accountMap = new Map();
  //   if (accounts) {
  //     accounts.forEach(account => {
  //       accountMap.set(account.accountAddress, { ...account, accountProfiles: [] });
  //     });
  //   }
  //   if (profiles) {
  //     profiles.forEach(profile => {
  //       const account = accountMap.get(profile.accountAddress);
  //       if (account) {
  //         account.accountProfiles.push(profile);
  //       }
  //     });
  //   }
  //   return Array.from(accountMap.values());
  // };
  
  // const userData = mergeAccountAndProfileData(profiles);
  // sessionStorage.setItem("staffPatientData", JSON.stringify(...userData));
  sessionStorage.setItem("staffPatientProfiles", JSON.stringify(profiles));
  sessionStorage.setItem("StaffPelayananMedis", JSON.stringify(appointments));

  const userAccountData = {
    role: "staff",
  }

  return (
    <>
      <NavbarController type={type} page="data-pasien" color="blue" />
      <div>
        <div className="grid items-center justify-center w-4/5 grid-cols-1 pt-24 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="flex gap-x-4 h-fit">
            <RegisterPatientButton buttonText={"Daftarkan Pasien Baru"} />
            {/* <ListSearchBar /> */}
          </div>
        </div>
        <div className="grid justify-center w-4/5 grid-cols-1 pt-8 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="w-full">
            {/* <div className="w-full px-8 py-4 bg-white border border-gray-200 rounded-lg shadow"> */}
              <Table columns={columns} dataSource={dataSource} pagination={false} />
            {/* </div> */}
          </div>
        </div>
      </div>
      <Modal width={1000} open={isModalOpen} onCancel={handleCancel} footer={null} style={{top: 20}}>
        {selectedData.profile && (
          <>
            <PatientData dmrNumber={selectedData.profile.dmrNumber} userDataProps={selectedData.profile} userAccountData={userAccountData} userData={selectedData} />
          </>
        )}
      </Modal>
    </>
  );
}
