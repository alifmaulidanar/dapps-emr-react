import { useState, useEffect } from "react";
import { Empty, Input } from "antd";
const { Search } = Input;
import { CONN } from "../../../../enum-global";
import ProfileDropdown from "../../components/Buttons/ProfileDropdown";
import NavbarController from "../../components/Navbar/NavbarController";
import AppointmentCardList from "../../components/Cards/AppointmentCardList";
import MakeAppointmentButton from "../../components/Buttons/MakeAppointment";
import { fetchAndStorePatientData } from "./utils";

export default function PatientAppointmentList({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  if (!token || !accountAddress) window.location.assign(`/patient/signin`);
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [patientAccountData, setPatientAccountData] = useState(null);
  const [appointmentData, setAppointmentsData] = useState([]);
  const [filteredAppointmentData, setFilteredAppointmentData] = useState([]);
  const [searchText, setSearchText] = useState("");
  
  useEffect(() => {
    if (token && accountAddress) {
      const fetchDataAsync = async () => {
        try {
          const responseAppointment = await fetch(
            `${CONN.BACKEND_LOCAL}/${role}/appointment`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          const dataAppointment = await responseAppointment.json();
          setScheduleData(dataAppointment.dokter);
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error);
        }
      };
      fetchDataAsync();
    }
  }, []);

  useEffect(() => {
    if (token && accountAddress) {
      fetchAndStorePatientData(token, accountAddress, setAppointmentsData, setPatientAccountData);
    }
  }, [token, accountAddress]);

  useEffect(() => {
    if (token && accountAddress) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${CONN.BACKEND_LOCAL}/${role}/account`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          const data = await response.json();
          const profiles = data.ipfs?.data?.accountProfiles?.map((profile) => ({ ...profile })) || [];
          setUsers(profiles);
          if (profiles.length > 0) setSelectedUser(profiles[0]);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchData();
    }
  }, [token, accountAddress]);

  useEffect(() => {
    if (selectedUser && appointmentData) {
      const filteredData = appointmentData.filter((appointment) => appointment.nomorIdentitas === selectedUser.nomorIdentitas);
      setFilteredAppointmentData(filteredData);
    }
  }, [selectedUser, appointmentData]);

  const sortedAppointmentData = [...filteredAppointmentData].sort((a, b) => { return new Date(b.createdAt) - new Date(a.createdAt); });

  useEffect(() => {
    if (searchText) {
      const filteredData = sortedAppointmentData.filter((appointment) =>
        (appointment.namaDokter && appointment.namaDokter.toLowerCase().includes(searchText.toLowerCase())) ||
        (appointment.doctorAddress && appointment.doctorAddress.toLowerCase().includes(searchText.toLowerCase())) ||
        (appointment.spesialisasi && appointment.spesialisasi.toLowerCase().includes(searchText.toLowerCase())) ||
        (appointment.faskesTujuan && appointment.faskesTujuan.toLowerCase().includes(searchText.toLowerCase())) ||
        (appointment.appointmentId && appointment.appointmentId.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredAppointmentData(filteredData);
    } else if (selectedUser) {
      const filteredData = appointmentData.filter((appointment) => appointment.nomorIdentitas === selectedUser.nomorIdentitas);
      setFilteredAppointmentData(filteredData);
    }
  }, [searchText, sortedAppointmentData, selectedUser]);
  
  const handleUserChange = (nomorIdentitas) => {
    const user = users.find((p) => p.nomorIdentitas === nomorIdentitas);
    setSelectedUser(user);
  };

  return (
    <>
      <NavbarController type={1} page="Rawat Jalan" color="blue" accountAddress={accountAddress}/>
      <div className="grid items-center justify-center w-1/2 grid-cols-3 px-4 pt-24 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="grid items-center grid-cols-1 col-span-3">
          <ProfileDropdown
            users={users}
            onChange={handleUserChange}
            defaultValue={selectedUser?.nomorIdentitas || "Tidak ada pasien"}
          />
        </div>
        <div className="grid items-center grid-cols-1 col-span-3 h-fit">
          <h5 className="text-xl font-semibold text-gray-900">
            Daftar Rawat Jalan
            <hr className="h-px bg-gray-700 border-0"></hr>
          </h5>
        </div>
      </div>
      <div className="grid items-baseline justify-center w-1/2 grid-cols-2 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-y-4">
        <div className="grid items-center grid-cols-1">
          <MakeAppointmentButton
            buttonText={"Buat Rawat Jalan"}
            scheduleData={scheduleData || []}
            userData={userData}
            token={token}
          />
        </div>
        <div className="grid items-center justify-end">
          <Search
            placeholder="ID pendaftaran, nama dokter, poli, dll."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
      </div>
      <div className="grid justify-center w-1/2 grid-cols-3 px-4 pt-4 pb-8 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="w-full col-span-3">
          {filteredAppointmentData.length > 0 ? (
            <AppointmentCardList appointmentData={filteredAppointmentData} />
          ) : (
            <Empty description="Tidak ada pendaftaran rawat jalan ditemukan" />
          )}
        </div>
      </div>
    </>
  );
}
