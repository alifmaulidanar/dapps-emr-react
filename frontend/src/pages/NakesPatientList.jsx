import "./../index.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarController from "../components/Navbar/NavbarController";
import ListSearchBar from "../components/Forms/ListSearchBar";
import AddPatientButton from "../components/Buttons/AddPatientButton";
import { Table, Button } from "antd";
import { CONN } from "../../../enum-global";

export default function NakesPatientList({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const handleDetailClick = (index) => {
    const selectedAppointment = appointments.patientProfiles[index];
    const appointment = {
      id: selectedAppointment.appointmentId,
      ownerAddress: selectedAppointment.accountAddress,
      data: {
        ...selectedAppointment
      }
    };
    navigate('/staff/patient-list/appointment-details', { state: { appointment } });
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/patient-appointment`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
        const data = await response.json();
        if (!response.ok) console.log(data.error, data.message);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [token]);

  let type;
  switch (role) {
    case "doctor":
      type = 2;
      break;
    case "nurse":
      type = 3;
      break;
    case "staff":
      type = 4;
      break;
  }

  const columns = [
    {
      title: 'No.',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'ID Pendaftaran',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
    },
    {
      title: 'Alamat Akun',
      dataIndex: 'accountAddress',
      key: 'accountAddress',
    },
    {
      title: 'Nomor Rekam Medis',
      dataIndex: 'nomorRekamMedis',
      key: 'nomorRekamMedis',
    },
    {
      title: 'Nama Pasien',
      dataIndex: 'namaLengkap',
      key: 'namaLengkap',
    },
    {
      title: 'Rumah Sakit',
      dataIndex: 'rumahSakit',
      key: 'rumahSakit',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record, index) => (
        <Button type="primary" ghost onClick={() => handleDetailClick(index)}>Detail</Button>
      ),
    },
  ];

  const dataSource = appointments?.patientProfiles?.map((appointment, index) => ({
    key: index + 1,
    accountAddress: appointment?.accountAddress,
    appointmentId: appointment?.appointmentId,
    namaLengkap: appointment?.namaLengkap,
    rumahSakit: appointment?.rumahSakit,
    nomorRekamMedis: appointment?.nomorRekamMedis,
    status: appointment?.status,
  }));

  return (
    <>
      <NavbarController type={type} page={role} color="blue" />
      <div>
        <div className="grid items-center justify-center w-3/4 grid-cols-1 pt-24 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="flex gap-x-4 h-fit">
            <AddPatientButton token={token} />
            <AddPatientButton token={token} />
            {/* <ListSearchBar /> */}
          </div>
        </div>
        <div className="grid justify-center w-3/4 grid-cols-1 pt-8 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <div className="w-full">
            {/* <div className="w-full px-8 py-4 bg-white border border-gray-200 rounded-lg shadow"> */}
              <Table columns={columns} dataSource={dataSource} />
            {/* </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
