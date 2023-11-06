import "./../../index.css";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientRecordDisplay from "../../components/PatientRecordData";
import BackButton from "../../components/Buttons/Navigations";

const accountAddress = "0x1e6b98a582Fdd23614b58A4459C1C875C6705f55";

function PatientRecord() {
  return (
    <>
      <NavbarController type={2} page="Rekam Medis" color="blue" />
      <div className="grid grid-cols-5 justify-center min-h-screen w-9/12 mx-auto px-4 py-24">
        <div className="col-start-2 w-fit">
          <BackButton linkToPage={`/patient/${accountAddress}/record-list`} />
        </div>
        <div className="col-start-2 col-span-3">
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow grid grid-cols-2 gap-x-8 mt-6">
            <PatientRecordDisplay />
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientRecord;
