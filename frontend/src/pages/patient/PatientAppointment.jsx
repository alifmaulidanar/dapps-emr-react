import "./../../index.css";
import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import RecordControl from "../../components/RecordControl";
import AppointmentList from "../../components/AppointmentList";
import MakeAppointmentButton from "../../components/Buttons/MakeAppointment";
import { CONN } from "../../../../enum-global";

export default function PatientAppointment({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  
  if (!token || !accountAddress) {
    window.location.assign(`/patient/signin`);
  }
  
  const [scheduleData, setScheduleData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [chosenIndex, setChosenIndex] = useState(0);
  // const [fetchData, setFetchData] = useState([]);

  // console.log("scheduleData", scheduleData);
  // console.log("appointmentData", appointmentData);

  useEffect(() => {
    if (token && accountAddress) {
      const fetchDataAsync = async () => {
        try {
          const response = await fetch(
            `${CONN.BACKEND_LOCAL}/${role}/appointment`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          const data = await response.json();
          setScheduleData(data.doctors);
          setAppointmentData(data.appointments);
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error);
        }
      };
      fetchDataAsync();
    }
  }, []);

  // Mencari pasien yang memiliki patientIsChosen bernilai true
  // const chosenPatient = patientListProps.find(
  //   (patient) => patient.patientIsChosen
  // );

  // Mendapatkan data rekam medis dari patientRecords pasien yang dipilih
  // const recordItems = chosenPatient
  //   ? chosenPatient.patientRecords.flatMap((record) => ({
  //       recordAddress: record.recordAddress,
  //       recordTitle: record.recordTitle,
  //       recordDate: record.recordDate,
  //       recordDoctorName: record.recordDoctorName,
  //     }))
  //   : [];

  return (
    <>
      <NavbarController
        type={1}
        page="Appointment"
        color="blue"
        accountAddress={accountAddress}
      />
      <div className="grid items-center justify-center w-1/2 grid-cols-3 px-4 pt-24 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
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
          <AppointmentList
            appointmentData={appointmentData || []}
          />
        </div>
      </div>
    </>
  );
}
