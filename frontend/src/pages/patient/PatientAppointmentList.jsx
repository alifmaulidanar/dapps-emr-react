import "./../../index.css";
import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import RecordControl from "../../components/RecordControl";
import AppointmentCardList from "../../components/Cards/AppointmentCardList";
import MakeAppointmentButton from "../../components/Buttons/MakeAppointment";
import ProfileDropdown from "../../components/Buttons/ProfileDropdown";
import { CONN } from "../../../../enum-global";

export default function PatientAppointmentList({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  if (!token || !accountAddress) window.location.assign(`/patient/signin`);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [filteredAppointmentData, setFilteredAppointmentData] = useState([]);

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
          setAppointmentData(dataAppointment.appointments);
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error);
        }
      };
      fetchDataAsync();
    }
  }, []);

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
      const filteredData = appointmentData.filter(
        (appointment) => appointment.data.nomorIdentitas === selectedUser.nomorIdentitas
      );
      setFilteredAppointmentData(filteredData);
    }
  }, [selectedUser, appointmentData]);

  const sortedAppointmentData = [...filteredAppointmentData].sort((a, b) => { return new Date(b.data.createdAt) - new Date(a.data.createdAt); });

  const handleUserChange = (nomorIdentitas) => {
    const user = users.find((p) => p.nomorIdentitas === nomorIdentitas);
    setSelectedUser(user);
  };

  return (
    <>
      <NavbarController
        type={1}
        page="Appointment"
        color="blue"
        accountAddress={accountAddress}
      />
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
            Daftar Appointment
            <hr className="h-px bg-gray-700 border-0"></hr>
          </h5>
        </div>
      </div>
      <div className="grid items-baseline justify-center w-1/2 grid-cols-2 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-y-4">
        <div className="grid items-center grid-cols-1">
          <MakeAppointmentButton
            buttonText={"Buat Appointment"}
            scheduleData={scheduleData || []}
            userData={userData}
            token={token}
          />
        </div>
        <div className="grid items-center grid-cols-1">
          <RecordControl search={"Cari Appointment"} />
        </div>
      </div>
      <div className="grid justify-center w-1/2 grid-cols-3 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="w-full col-span-3">
          <AppointmentCardList
            appointmentData={sortedAppointmentData || []}
          />
        </div>
      </div>
    </>
  );
}
