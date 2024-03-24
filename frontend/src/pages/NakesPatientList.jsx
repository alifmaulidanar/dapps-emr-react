import "./../index.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarController from "../components/Navbar/NavbarController";
import AddPatientButton from "../components/Buttons/AddPatientButton";
import PatientData from "./staff/PatientData";
import { Table, Button, Modal } from "antd";
import { CONN } from "../../../enum-global";

export default function NakesPatientList({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  
  const [accounts, setAccounts] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancel = () => {setIsModalOpen(false) };
  const showModal = (nomorRekamMedis) => {
    const selectedProfile = profiles.find(profile => profile.nomorRekamMedis === nomorRekamMedis);
    const selectedAccount = accounts.find(account => account.accountAddress === selectedProfile.accountAddress);
    setSelectedData({
      account: selectedAccount,
      profile: selectedProfile
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/patient-list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
        const data = await response.json();
        if (!response.ok) console.log(data.error, data.message);
        setAccounts(data.patientAccountData);
        setProfiles(data.patientProfiles);
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
    },
    {
      title: 'Nomor Rekam Medis',
      dataIndex: 'nomorRekamMedis',
      key: 'nomorRekamMedis',
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
    },
    {
      title: 'Nomor Telepon',
      dataIndex: 'telpSelular',
      key: 'telpSelular',
    },
    {
      title: 'RS Asal',
      dataIndex: 'rumahSakitAsal',
      key: 'rumahSakitAsal',
      render: (text) => getHospitalName(text),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (<Button type="primary" ghost onClick={() => showModal(record.nomorRekamMedis)}>Lihat</Button>),
    },
  ];

  const getHospitalName = (hospitalCode) => {
    switch (hospitalCode) {
      case "1":
        return "Bekasi";
      case "2":
        return "BSD";
      case "3":
        return "Jakarta";
      case "4":
        return "Lampung";
      default:
        return "Tidak diketahui";
    }
  };

  const dataSource = profiles?.map((profile, index) => ({
    key: index + 1,
    accountAddress: profile?.accountAddress,
    nomorRekamMedis: profile?.nomorRekamMedis,
    nomorIdentitas: profile?.nomorIdentitas,
    namaLengkap: profile?.namaLengkap,
    email: profile?.email,
    telpSelular: profile?.telpSelular,
    rumahSakitAsal: profile?.rumahSakitAsal,
  }));

  const mergeAccountAndProfileData = (accounts, profiles) => {
    const accountMap = new Map();
    if (accounts) {
      accounts.forEach(account => {
        accountMap.set(account.accountAddress, { ...account, accountProfiles: [] });
      });
    }
    if (profiles) {
      profiles.forEach(profile => {
        const account = accountMap.get(profile.accountAddress);
        if (account) {
          account.accountProfiles.push(profile);
        }
      });
    }
    return Array.from(accountMap.values());
  };
  
  const userData = mergeAccountAndProfileData(accounts, profiles);
  sessionStorage.setItem("staffPatientData", JSON.stringify(...userData));
  sessionStorage.setItem("staffPatientProfiles", JSON.stringify(profiles));

  return (
    <>
      <NavbarController type={type} page={role} color="blue" />
      <div>
        <div className="grid items-center justify-center w-3/4 grid-cols-1 pt-24 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="flex gap-x-4 h-fit">
            <AddPatientButton token={token} />
            {/* <ListSearchBar /> */}
          </div>
        </div>
        <div className="grid justify-center w-3/4 grid-cols-1 pt-8 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="w-full">
            {/* <div className="w-full px-8 py-4 bg-white border border-gray-200 rounded-lg shadow"> */}
              <Table columns={columns} dataSource={dataSource} />
            {/* </div> */}
          </div>
        </div>
      </div>
      <Modal width={1000} open={isModalOpen} onCancel={handleCancel} footer={null} style={{top: 20}}>
        {selectedData.profile && (
          <>
            <PatientData userDataProps={selectedData.profile} userAccountData={selectedData.account} />
          </>
        )}
      </Modal>
    </>
  );
}
