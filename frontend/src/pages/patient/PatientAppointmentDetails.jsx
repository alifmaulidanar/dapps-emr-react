import { useLocation } from 'react-router-dom';
import BackButton from "../../components/Buttons/Navigations";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientAppointmentDisplay from "../../components/PatientAppointmentDisplay";

export default function AppointmentDetails({linkToPage}) {
  const token = sessionStorage.getItem("userToken");
  const location = useLocation();
  if (location.state === null) window.location.assign('/patient/appointment-list');
  const appointment = location.state;
  return (
    <>
      <NavbarController type={1} page="Rekam Medis" color="blue" />
      <div className="grid justify-center w-9/12 min-h-screen grid-cols-5 px-4 py-24 mx-auto">
        <div className="col-start-2 w-fit">
          <BackButton linkToPage={linkToPage} />
        </div>
        <div className="col-span-3 col-start-2">
          <div className="grid w-[800px] mt-6 bg-white border border-gray-200 rounded-lg shadow gap-x-8">
            <PatientAppointmentDisplay data={{...appointment}} token={token} />
          </div>
        </div>
      </div>
    </>
  );
}
