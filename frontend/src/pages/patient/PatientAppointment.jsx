import "./../../index.css";
import { useState } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import RecordControl from "../../components/RecordControl";
import RecordList from "../../components/RecordList";
import { AllPatient } from "../../data/patientData";
import MakeAppointmentButton from "../../components/Buttons/MakeAppointment";
import { useParams } from "react-router-dom";

export default function PatientAppointment() {
  const { accountAddress } = useParams();
  const [chosenIndex, setChosenIndex] = useState(0);

  const handlePatientClick = (index) => {
    setChosenIndex(index);
  };

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
      <NavbarController type={2} page="Appointment" color="blue" />
      <div className="grid items-center justify-center w-1/2 grid-cols-3 px-4 pt-24 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="grid items-center grid-cols-1 col-span-3 h-fit">
          <h5 className="text-xl font-semibold text-gray-900">
            Daftar Apointment
            <hr className="h-px bg-gray-700 border-0"></hr>
          </h5>
        </div>
      </div>
      <div className="grid items-baseline justify-center w-1/2 grid-cols-2 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-y-4">
        <div className="grid items-center grid-cols-1">
          <MakeAppointmentButton buttonText={"Buat Appointment"} />
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
