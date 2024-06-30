import { Empty, Input, Select } from "antd";
const { Search } = Input;
import { useState, useEffect, useMemo } from "react";
import RecordList from "../../components/RecordList";
import PatientList from "../../components/PatientList";
import NavbarController from "../../components/Navbar/NavbarController";
import RegisterPatientButton from "../../components/Buttons/RegisterPatient";
import { fetchAndStorePatientData } from "./utils";

export default function PatientRecordList() {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/patient/signin`);

  const [patientAccountData, setPatientAccountData] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [chosenIndex, setChosenIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("newest");
  const [selectedPoli, setSelectedPoli] = useState("");

  useEffect(() => {
    if (token && accountAddress) {
      fetchAndStorePatientData(token, accountAddress, setAppointmentsData, setPatientAccountData);
    }
  }, [token, accountAddress]);

  const mainNeighborhood = patientAccountData?.ipfs?.data?.accountProfiles[0]?.kelurahan;
  const dmrNumber = patientAccountData?.account?.dmrNumber;
  sessionStorage.setItem("dmrNumber", dmrNumber);
  const handlePatientClick = (index) => {
    setChosenIndex(index);
  };
  const accountProfiles = patientAccountData?.ipfs?.data?.accountProfiles;
  const patientListProps =
    accountProfiles?.length > 0
      ? accountProfiles.map((patient, index) => ({
          patientIsChosen: index === chosenIndex,
          ...patient,
        }))
      : [];
  const chosenPatient = patientListProps.find(
    (patient) => patient.patientIsChosen
  );
  const relatedAppointments = appointmentsData.filter(
    (appointment) =>
      appointment.emrNumber === chosenPatient?.emrNumber
  );

  const filteredAndSortedAppointments = useMemo(() => {
    let filteredData = relatedAppointments;

    if (searchText) {
      filteredData = filteredData.filter(
        (appointment) =>
          (appointment.selesai?.judulRekamMedis && appointment.selesai?.judulRekamMedis.toLowerCase().includes(searchText.toLowerCase())) ||
          (appointment.spesialisasi && appointment.spesialisasi.toLowerCase().includes(searchText.toLowerCase())) ||
          (appointment.namaDokter && appointment.namaDokter.toLowerCase().includes(searchText.toLowerCase())) ||
          (appointment.doctorAddress && appointment.doctorAddress.toLowerCase().includes(searchText.toLowerCase())) ||
          (appointment.faskesTujuan && appointment.faskesTujuan.toLowerCase().includes(searchText.toLowerCase())) ||
          (appointment.appointmentId && appointment.appointmentId.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    if (selectedPoli) {
      filteredData = filteredData.filter((appointment) => appointment.spesialisasi === selectedPoli);
    }

    return filteredData.sort((a, b) => {
      if (selectedOrder === "newest") {
        return new Date(b.tanggalTerpilih) - new Date(a.tanggalTerpilih);
      } else {
        return new Date(a.tanggalTerpilih) - new Date(b.tanggalTerpilih);
      }
    });
  }, [relatedAppointments, searchText, selectedOrder, selectedPoli]);

  return (
    <>
      <NavbarController type={1} page="Daftar Rekam Medis" color="blue" />
      <div className="grid items-center justify-center w-9/12 grid-cols-5 px-4 pt-24 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="grid items-center grid-cols-1 col-span-3 h-fit">
          <h5 className="text-xl font-semibold text-gray-900">
            Daftar Rekam Medis
            <hr className="h-px bg-gray-700 border-0" />
          </h5>
        </div>
        <div className="grid items-center col-span-2 h-fit">
          <h5 className="text-xl font-semibold text-gray-900">
            Daftar Pasien di Akun Anda
            <hr className="h-px bg-gray-700 border-0" />
          </h5>
        </div>
      </div>
      <div className="grid items-center justify-center w-9/12 grid-cols-5 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="flex items-center col-span-3 h-fit justify-end gap-x-4">
          <Select
            placeholder="Pilih Poli/Ruangan"
            onChange={(value) => setSelectedPoli(value)}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="Umum">Umum</Select.Option>
            <Select.Option value="TB Paru">TB Paru</Select.Option>
            <Select.Option value="KIA">KIA</Select.Option>
          </Select>
          <Select
            placeholder="Urutkan"
            onChange={(value) => setSelectedOrder(value)}
            style={{ width: 120 }}
            defaultValue="newest"
          >
            <Select.Option value="newest">Terbaru</Select.Option>
            <Select.Option value="oldest">Terlama</Select.Option>
          </Select>
          <Search
            placeholder="ID pendaftaran, nama dokter, poli, dll."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <div className="grid items-center col-span-2 h-fit">
          <div className="flex justify-end">
            <RegisterPatientButton buttonText={"Daftarkan Pasien Baru"} mainNeighborhood={mainNeighborhood} />
          </div>
        </div>
      </div>
      <div className="grid justify-center w-9/12 grid-cols-5 px-4 pt-4 mx-auto min-h-fit max-h-fit gap-x-8 gap-y-4">
        <div className="w-full col-span-3">
          {chosenPatient ? (
            filteredAndSortedAppointments.length > 0 ? (
              <RecordList
                chosenPatient={chosenPatient}
                appointmentData={filteredAndSortedAppointments}
              />
            ) : (
              <Empty description="Tidak ada riwayat pengobatan yang ditemukan." />
            )
          ) : (
            <Empty description="Pilih pasien untuk melihat rekam medis" />
          )}
        </div>
        <div className="w-full col-span-2">
          <div className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg shadow">
            <div className="flow-root">
              {patientListProps.length > 0 ? (
                <ul role="list" className="divide-y divide-gray-200">
                  {patientListProps.map((patient, index) => (
                    <PatientList
                      key={index}
                      {...patient}
                      onClick={() => handlePatientClick(index)}
                    />
                  ))}
                </ul>
              ) : (
                <Empty description="Tidak ada pasien" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
