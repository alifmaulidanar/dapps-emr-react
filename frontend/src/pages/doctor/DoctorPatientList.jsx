import "./../../index.css";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientList from "../../components/PatientList";
import ListSearchBar from "../../components/Forms/ListSearchBar";
import AddPatientButton from "../../components/Buttons/AddPatientButton";

function DoctorPatientList() {
  const patientListProps = [
    {
      patientName: "Alif Maulidanar",
      patientImage: "/Alif.jpg",
      patientAddress: "0x66E167fDd23614b58A4459C1C875C6705f550ED6",
    },
    {
      patientName: "Alif Zaki",
      patientImage: "/Alif.jpg",
      patientAddress: "0x66E167fDd23614b58A4459C1C875C6705f550ED6",
    },
    {
      patientName: "Elham Herlambang",
      patientImage: "/Alif.jpg",
      patientAddress: "0x66E167fDd23614b58A4459C1C875C6705f550ED6",
    },
  ];

  return (
    <>
      <NavbarController type={3} page="Daftar Pasien" color="blue" />
      <div>
        <div className="grid grid-cols-1 justify-center min-h-fit max-h-fit w-1/2 min-w-screen mx-auto px-14 pt-24 gap-x-8 gap-y-4 items-center">
          <div className="grid grid-cols-2 items-center h-fit">
            <AddPatientButton />
            <ListSearchBar />
          </div>
        </div>
        <div className="grid grid-cols-1 justify-center min-h-fit max-h-fit w-1/2 min-w-screen mx-auto px-14 pt-8 gap-x-8 gap-y-4">
          <div className="w-full">
            <div className="w-full py-4 px-8 bg-white border border-gray-200 rounded-lg shadow">
              <div className="flow-root">
                <ul role="list" className="divide-y divide-gray-200">
                  {patientListProps.map((patient, index) => (
                    <PatientList key={index} {...patient} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorPatientList;
