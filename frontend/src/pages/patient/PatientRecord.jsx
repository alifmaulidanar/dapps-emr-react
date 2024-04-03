import "./../../index.css";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientRecordDisplay from "../../components/PatientRecordData";
import BackButton from "../../components/Buttons/Navigations";
import { useLocation } from 'react-router-dom';

function PatientRecord() {
  const location = useLocation();
  const { record, chosenPatient, appointmentData } = location.state;
  console.log({record});
  console.log({chosenPatient});
  console.log({appointmentData});
  return (
    <>
      <NavbarController type={1} page="Rekam Medis" color="blue" />
      <div className="grid justify-center w-[1650px] min-h-screen grid-cols-2 px-24 py-24 mx-auto">
        <div className="col-start-1 w-fit">
          <BackButton linkToPage={`/patient/record-list`} />
        </div>
        <div className="col-span-2">
          <div className="grid min-h-screen grid-cols-4 mx-auto mt-6 bg-white border border-gray-200 rounded-lg shadow gap-x-8">
            <PatientRecordDisplay record={record} chosenPatient={chosenPatient} appointmentData={appointmentData} />
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientRecord;
