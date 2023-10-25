import "../../index.css";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientData from "../../components/PatientData";
import PatientIdentifier from "../../components/PatientIdentifier";
import { AllPatient } from "../../data/patientData";

function PatientProfile() {
  const firstPatient = AllPatient[0];

  const patientIdentifierProps = {
    patientName: firstPatient.patientName,
    patientImage: firstPatient.patientImage,
    patientAddress: firstPatient.patientAddress,
  };

  const patientDataProps = {
    // Menggunakan data pasien pertama
    ...firstPatient,
  };

  return (
    <>
      <NavbarController type={2} page="Profil Pasien" color="blue" />
      <div className="grid grid-cols-1 justify-center min-h-screen w-9/12 mx-auto px-4 py-24">
        <div>
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow grid grid-cols-3 gap-x-8">
            <PatientIdentifier {...patientIdentifierProps} />
            <PatientData {...patientDataProps} />
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientProfile;
