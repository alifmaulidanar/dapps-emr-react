import "../../index.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientData from "../../components/PatientData";
import PatientIdentifier from "../../components/PatientIdentifier";
// import { AllPatient } from "../../data/patientData";
import ProfileDropdown from "../../components/Buttons/ProfileDropdown";

function PatientProfile() {
  const { accountAddress } = useParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const capitalizedAccountAddress =
      accountAddress.charAt(0) +
      accountAddress.charAt(1) +
      accountAddress.substring(2).toUpperCase();
    console.log({ capitalizedAccountAddress });

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/patient/${capitalizedAccountAddress}/record-list`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        const profiles =
          data.ipfs?.data?.accountProfiles?.map((profile) => ({
            nomorIdentitas: profile.nomorIdentitas,
            namaLengkap: profile.namaLengkap,
          })) || [];
        setPatients(profiles);
        if (profiles.length > 0) {
          setSelectedPatient(profiles[0]);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchData();
  }, []);

  // const accountProfiles = patients?.ipfs?.data?.accountProfiles;
  // console.log({ accountProfiles });

  const handlePatientChange = (nomorIdentitas) => {
    const patient = patients.find((p) => p.nomorIdentitas === nomorIdentitas);
    setSelectedPatient(patient);
  };

  const patientIdentifierProps = selectedPatient
    ? {
        patientName: selectedPatient.namaLengkap,
        patientIdentification: selectedPatient.nomorIdentitas,
        // patientImage: selectedPatient.patientImage,
        // patientAddress: selectedPatient.alamat,
      }
    : {};

  const patientDataProps = selectedPatient
    ? {
        ...selectedPatient,
      }
    : {};

  return (
    <>
      <NavbarController
        type={2}
        page="Profil Pasien"
        color="blue"
        accountAddress={accountAddress}
      />
      <div className="grid justify-center w-9/12 min-h-screen grid-cols-1 px-4 py-24 mx-auto">
        <div className="grid gap-y-4">
          <ProfileDropdown
            patients={patients}
            onChange={handlePatientChange}
            defaultValue={selectedPatient?.nomorIdentitas}
          />
          <div className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-lg shadow gap-x-8">
            <PatientIdentifier {...patientIdentifierProps} />
            <PatientData {...patientDataProps} />
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientProfile;
