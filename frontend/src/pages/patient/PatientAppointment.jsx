import "./../../index.css";
import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import RecordControl from "../../components/RecordControl";
import RecordList from "../../components/RecordList";
import { AllPatient } from "../../data/patientData";
import MakeAppointmentButton from "../../components/Buttons/MakeAppointment";
import { CONN } from "../../../../enum-global";

export default function PatientAppointment({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const [scheduleData, setScheduleData] = useState([]);
  // const [fetchData, setFetchData] = useState([]);
  const [chosenIndex, setChosenIndex] = useState(0);

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
          setScheduleData(data);
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error);
        }
      };
      fetchDataAsync();
    }
  }, []);

  // Mengambil data pasien dari AllPatient
  const patientListProps = AllPatient.map((patient, index) => ({
    patientName: patient.patientName,
    patientImage: patient.patientImage,
    patientAddress: patient.patientAddress,
    patientIsChosen: index === chosenIndex,
    patientRecords: patient.patientRecords,
  }));

  // Mencari pasien yang memiliki patientIsChosen bernilai true
  const chosenPatient = patientListProps.find(
    (patient) => patient.patientIsChosen
  );

  // Mendapatkan data rekam medis dari patientRecords pasien yang dipilih
  const recordItems = chosenPatient
    ? chosenPatient.patientRecords.flatMap((record) => ({
        recordAddress: record.recordAddress,
        recordTitle: record.recordTitle,
        recordDate: record.recordDate,
        recordDoctorName: record.recordDoctorName,
      }))
    : [];

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
          />
        </div>
        <div className="grid items-center grid-cols-1">
          <RecordControl search={"Cari Appointment"} />
        </div>
      </div>
      <div className="grid justify-center w-1/2 grid-cols-3 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="w-full col-span-3">
          {chosenPatient && (
            <RecordList
              recordItems={recordItems}
              accountAddress={accountAddress}
            />
          )}
        </div>
      </div>
    </>
  );
}
