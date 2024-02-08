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
  const [patientAccountData, setPatientAccountData] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState(null);

  // Handle Foto Profil Pasien dari PatientIdentifier
  const handleImageChange = (base64Image) => {
    setSelectedImageBase64(base64Image);
  };

  useEffect(() => {
    const capitalizedAccountAddress =
      accountAddress.charAt(0) +
      accountAddress.charAt(1) +
      accountAddress.substring(2).toUpperCase();
    // console.log({ capitalizedAccountAddress });

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/patient/${capitalizedAccountAddress}/account`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        const profiles =
          data.ipfs?.data?.accountProfiles?.map((profile) => ({
            ...profile,
          })) || [];
        setPatients(profiles);
        const accountData = {
          accountAddress: data.ipfs.data.accountAddress,
          accountEmail: data.ipfs.data.accountEmail,
          accountPhone: data.ipfs.data.accountPhone,
          accountRole: data.ipfs.data.accountRole,
          accountUsername: data.ipfs.data.accountUsername,
        };
        setPatientAccountData(accountData);
        // console.log({ profiles });
        // console.log({ accountData });
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
  console.log({ patientAccountData });

  const handlePatientChange = (nomorIdentitas) => {
    const patient = patients.find((p) => p.nomorIdentitas === nomorIdentitas);
    setSelectedPatient(patient);
  };

  const patientIdentifierProps = selectedPatient
    ? {
        patientName: selectedPatient.namaLengkap,
        patientIdentification: selectedPatient.nomorIdentitas,
        patientImage: selectedPatient.foto,
        // patientAddress: selectedPatient.alamat,
      }
    : {};

  const patientDataProps = selectedPatient
    ? {
        ...selectedPatient,
      }
    : {};

  // console.log({ patientIdentifierProps });
  // console.log({ patientDataProps });

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
            {/* <PatientIdentifier {...patientIdentifierProps} /> */}
            <PatientData
              patientDataProps={patientDataProps}
              patientAccountData={patientAccountData}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientProfile;
