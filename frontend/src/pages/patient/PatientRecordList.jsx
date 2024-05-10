import { Empty } from "antd";
import { useState, useEffect } from "react";
import { CONN } from "../../../../enum-global";
import RecordList from "../../components/RecordList";
import PatientList from "../../components/PatientList";
import RecordControl from "../../components/RecordControl";
import NavbarController from "../../components/Navbar/NavbarController";
import RegisterPatientButton from "../../components/Buttons/RegisterPatient";

export default function PatientRecordList() {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/patient/signin`);

  const [patientAccountData, setPatientAccountData] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [chosenIndex, setChosenIndex] = useState(0);

  useEffect(() => {
    if (token && accountAddress) {
      const fetchData = async () => {
        try {
          const response = await fetch(`${CONN.BACKEND_LOCAL}/patient/account`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          const data = await response.json();
          setAppointmentsData(data.appointments);
          setPatientAccountData(data);
          sessionStorage.setItem("userData", JSON.stringify(data.ipfs.data));
        } catch (error) {
          console.error("Error fetching patient data:", error);
        }
      };
      fetchData();
    }
  }, [token, accountAddress]);

  const dmrNumber = patientAccountData?.ipfs?.data?.dmrNumber;
  const handlePatientClick = (index) => { setChosenIndex(index) };
  const accountProfiles = patientAccountData?.ipfs?.data?.accountProfiles;
  const patientListProps = accountProfiles?.length > 0 ? accountProfiles.map((patient, index) => ({ patientIsChosen: index === chosenIndex, ...patient })) : [];
  const chosenPatient = patientListProps.find((patient) => patient.patientIsChosen);
  const recordItems = chosenPatient && Array.isArray(chosenPatient.riwayatPengobatan) ? chosenPatient.riwayatPengobatan.map((record) => ({ ...record, })) : [];
  const relatedAppointments = appointmentsData.filter(appointment => appointment.data.nomorRekamMedis === chosenPatient?.nomorRekamMedis);

  return (
    <>
      <NavbarController type={1} page="Daftar Rekam Medis" color="blue" />
      <div className="grid items-center justify-center w-9/12 grid-cols-5 px-4 pt-24 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="grid items-center grid-cols-1 col-span-3 h-fit">
          <h5 className="text-xl font-semibold text-gray-900">
            Daftar Rekam Medis
            <hr className="h-px bg-gray-700 border-0"/>
          </h5>
        </div>
        <div className="grid items-center col-span-2 h-fit">
          <h5 className="text-xl font-semibold text-gray-900">
            Daftar Pasien di Akun Anda
            <hr className="h-px bg-gray-700 border-0"/>
          </h5>
        </div>
      </div>
      <div className="grid items-center justify-center w-9/12 grid-cols-5 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="grid items-center grid-cols-1 col-span-3 h-fit"><RecordControl search={"Cari rekam medis"} /></div>
        <div className="grid items-center col-span-2 h-fit">
          <div className="flex justify-end">
            <RegisterPatientButton buttonText={"Daftarkan Pasien Baru"} patientAccountData={patientAccountData} dmrNumber={dmrNumber} />
          </div>
        </div>
      </div>
      <div className="grid justify-center w-9/12 grid-cols-5 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="w-full col-span-3">
          {chosenPatient ? (
            recordItems.length > 0 ? (
              <RecordList recordItems={recordItems} chosenPatient={chosenPatient} appointmentData={relatedAppointments} />
            ) : (<Empty description="Tidak ada rekam medis" />)
          ) : (<Empty description="Pilih pasien untuk melihat rekam medis" />)}
        </div>
        <div className="w-full col-span-2">
          <div className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg shadow">
            <div className="flow-root">
              {patientListProps.length > 0 ? (
                <ul role="list" className="divide-y divide-gray-200">
                  {patientListProps.map((patient, index) => (
                    <PatientList key={index} {...patient} onClick={() => handlePatientClick(index)} />
                  ))}
                </ul>
              ) : (<Empty description="Tidak ada pasien" />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
