import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import AddPatientButton from "../../components/Buttons/AddPatientButton";
import { Table, Button } from "antd";
import { CONN } from "../../../../enum-global";
import { useNavigate } from "react-router-dom";

export default function NursePatientList({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  
  const [accounts, setAccounts] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/nurse/patient-list`, {
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
    { title: 'No.', dataIndex: 'key', key: 'key' },
    // { title: 'Alamat Akun', dataIndex: 'accountAddress', key: 'accountAddress' },
    { title: 'Nomor Rekam Medis', dataIndex: 'emrNumber', key: 'emrNumber' },
    { title: 'Nomor Identitas', dataIndex: 'nomorIdentitas', key: 'nomorIdentitas' },
    { title: 'Nama Lengkap', dataIndex: 'namaLengkap', key: 'namaLengkap' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Nomor Telepon', dataIndex: 'telpSelular', key: 'telpSelular' },
    { title: 'RS Asal', dataIndex: 'rumahSakitAsal', key: 'rumahSakitAsal', render: (text) => getHospitalName(text) },
    // { title: 'Dokter', dataIndex: 'namaDokter', key: 'namaDokter' },
    { title: 'Aksi', key: 'action',
      render: (_, record) => (
        <Button type="primary" ghost onClick={() => navigate('/nurse/patient-list/patient-details', { state: { record } })}>
          {role === 'nurse' ? 'Detail' : 'Lihat'}
        </Button>
      ),
    }
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
    emrNumber: profile?.emrNumber,
    nomorIdentitas: profile?.nomorIdentitas,
    namaLengkap: profile?.namaLengkap,
    email: profile?.email,
    telpSelular: profile?.telpSelular,
    rumahSakitAsal: profile?.rumahSakitAsal
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
  sessionStorage.setItem("nursePatientData", JSON.stringify(...userData));
  sessionStorage.setItem("nursePatientProfiles", JSON.stringify(profiles));

  return (
    <>
      <NavbarController type={type} page={role} color="blue" />
      <div>
        <div className="grid items-center justify-center w-3/4 grid-cols-1 pt-24 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          {role !== "nurse" && (
            <div className="flex gap-x-4 h-fit">
                <AddPatientButton token={token} />
                {/* <ListSearchBar /> */}
            </div>
          )}
        </div>
        <div className="grid justify-center w-3/4 grid-cols-1 pt-8 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="w-full">
            <Table columns={columns} dataSource={dataSource} />
          </div>
        </div>
      </div>
    </>
  );
}
