import "./../index.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavbarController from "../components/Navbar/NavbarController";
import PatientList from "../components/PatientList";
import ListSearchBar from "../components/Forms/ListSearchBar";
import AddPatientButton from "../components/Buttons/AddPatientButton";
import { Avatar, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { CONN } from "../../../enum-global";

export default function NakesPatientList({ role }) {
  const { accountAddress } = useParams();
  const [patientAccountData, setPatientAccountData] = useState(null);
  const [chosenIndex, setChosenIndex] = useState(0);

  // cek PatientRecordList.jsx untuk contoh penggunaan
  const patientListProps = [];

  let type;
  switch (role) {
    case "staff":
      type = 2;
      break;
    case "nurse":
      type = 3;
      break;
    case "doctor":
      type = 4;
      break;
  }

  return (
    <>
      <NavbarController
        type={type}
        page={role}
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
                {patientListProps.length > 0 ? (
                  <ul role="list" className="divide-y divide-gray-200">
                    {patientListProps.map((patient, index) => (
                      <PatientList key={index} {...patient} />
                    ))}
                  </ul>
                ) : (
                  <Empty description="Tidak ada pasien" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
