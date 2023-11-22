import "./../../index.css";
import { useState } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import RecordControl from "../../components/RecordControl";
import RecordList from "../../components/RecordList";
import PatientList from "../../components/PatientList";
import { AllPatient } from "../../data/patientData";
import RegisterPatientButton from "../../components/Buttons/RegisterPatient";

export default function PatientRecordList() {
  const accountAddress = "0xf7C9Bd049Cc6e4538033AEa5254136F1DF9A4A6D";
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
      <NavbarController type={2} page="Daftar Rekam Medis" color="blue" />
      <div className="grid grid-cols-5 justify-center min-h-fit max-h-fit w-9/12 mx-auto px-4 pt-24 gap-x-8 gap-y-4 items-center">
        <div className="grid grid-cols-1 col-span-3 items-center h-fit">
          <h5 className="text-xl font-semibold text-gray-900">
            Daftar Rekam Medis
            <hr className="h-px bg-gray-700 border-0"></hr>
          </h5>
        </div>
        <div className="grid col-span-2 items-center h-fit">
          <h5 className="text-xl font-semibold text-gray-900">
            Daftar Pasien di Akun Anda
            <hr className="h-px bg-gray-700 border-0"></hr>
          </h5>
        </div>
      </div>
      <div className="grid grid-cols-5 justify-center min-h-fit max-h-fit w-9/12 mx-auto px-4 pt-4 gap-x-8 gap-y-4 items-center">
        <div className="grid grid-cols-1 col-span-3 items-center h-fit">
          <RecordControl />
        </div>
        <div className="grid col-span-2 items-center h-fit">
          <div className="flex justify-end">
            <RegisterPatientButton />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 justify-center min-h-fit max-h-fit w-9/12 mx-auto px-4 pt-4 gap-x-8 gap-y-4">
        <div className="col-span-3 w-full">
          {chosenPatient && (
            <RecordList
              recordItems={recordItems}
              accountAddress={accountAddress}
            />
          )}
        </div>
        <div className="col-span-2 w-full">
          <div className="w-full py-4 px-8 bg-white border border-gray-200 rounded-lg shadow">
            <div className="flow-root">
              <ul role="list" className="divide-y divide-gray-200">
                {patientListProps.map((patient, index) => (
                  <PatientList
                    key={index}
                    {...patient}
                    onClick={() => handlePatientClick(index)}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
