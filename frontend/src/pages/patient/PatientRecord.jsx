import "./../../index.css";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientRecordDisplay from "../../components/PatientRecordData";
import BackButton from "../../components/Buttons/Navigations";

const accountAddress = "0x1e6b98a582Fdd23614b58A4459C1C875C6705f55";

function PatientRecord() {
  return (
    <>
      <NavbarController type={1} page="Rekam Medis" color="blue" />
      <div className="grid justify-center w-9/12 min-h-screen grid-cols-5 px-4 py-24 mx-auto">
        <div className="col-start-2 w-fit">
          <BackButton linkToPage={`/patient/${accountAddress}/record-list`} />
        </div>
        <div className="col-span-3 col-start-2">
          <div className="grid w-full grid-cols-2 mt-6 bg-white border border-gray-200 rounded-lg shadow gap-x-8">
            <PatientRecordDisplay />
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientRecord;
