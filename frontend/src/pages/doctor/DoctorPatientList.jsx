import "./../../index.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavbarController from "../../components/Navbar/NavbarController";
import PatientList from "../../components/PatientList";
import ListSearchBar from "../../components/Forms/ListSearchBar";
import AddPatientButton from "../../components/Buttons/AddPatientButton";
import { Empty } from "antd";
import { CONN } from "../../../../enum-global";

function DoctorPatientList() {
  const { accountAddress } = useParams();
  const [patientAccountData, setPatientAccountData] = useState(null);
  const [chosenIndex, setChosenIndex] = useState(0);

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
      <NavbarController
        type={4}
        page="Daftar Pasien"
        color="blue"
        accountAddress={accountAddress}
      />
      <div>
        <div className="grid items-center justify-center w-1/2 grid-cols-1 pt-24 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="grid items-center grid-cols-2 h-fit">
            <AddPatientButton />
            <ListSearchBar />
          </div>
        </div>
        <div className="grid justify-center w-1/2 grid-cols-1 pt-8 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="w-full">
            <div className="w-full px-8 py-4 bg-white border border-gray-200 rounded-lg shadow">
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
