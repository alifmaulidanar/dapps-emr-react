/* eslint-disable react/prop-types */
import { ethers } from "ethers";
import { Tag, Button } from "antd";
import { CONN } from "../../../enum-global";
import { useState, useCallback } from "react";

const PatientRecordLoop = ({ data }) => {
  return (
    <>
      {data.map(({ key, value1, value2 }) => (
        <div key={key}>
          <h3 className="block text-sm font-medium text-gray-900">
            {value1}
          </h3>
          <p className="text-sm text-gray-900">{value2}</p>
        </div>
      ))}
    </>
  );
};

function PatientAppointmentDisplay({ data, token }) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [appointmentStatus, setAppointmentStatus] = useState(data.appointment.data.status);
  const getSigner = useCallback(async () => {
    const win = window;
    if (!win.ethereum) { console.error("Metamask not detected"); return; }
    try {
      const accounts = await win.ethereum.request({ method: "eth_requestAccounts" });
      const selectedAccount = accounts[0];
      setSelectedAccount(selectedAccount);
      const provider = new ethers.providers.Web3Provider(win.ethereum);
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: "0x539",
          chainName: "Ganache",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
          },
          rpcUrls: [CONN.GANACHE_LOCAL],
        },
      ]);
      const signer = provider.getSigner(selectedAccount);
      return signer;
    } catch (error) {
      console.error("Error setting up Web3Provider:", error);
    }
  }, []);

  const patientDataProps1 = [
    { key: "rumahSakit", value1: "Cabang Eka Hospital", value2: (<p>{data.appointment.data.rumahSakit}</p>), },
    { key: "tanggalTerpilih", value1: "Hari & Tanggal", value2: (<p>{new Date(data.appointment.data.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>), },
    { key: "nomorRekamMedis", value1: "Nomor Rekam Medis", value2: (<p>{data.appointment.data.nomorRekamMedis}</p>), },
    { key: "waktuTerpilih", value1: "Waktu Praktik", value2: (<p>{data.appointment.data.waktuTerpilih}</p>), },
  ];
  const patientDataProps2 = [
    { key: "namaDokter", value1: "Nama Dokter", value2: (<p>{data.appointment.data.namaDokter}</p>), },
    { key: "alamatDokter", value1: "Alamat Akun Dokter", value2: (<Tag color="gold" className="m-0">{data.appointment.data.alamatDokter}</Tag>), },
    { key: "namaPerawat", value1: "Nama Perawat", value2: (<p>{data.appointment.data.namaPerawat}</p>), },
    { key: "alamatPerawat", value1: "Alamat Akun Perawat", value2: (<Tag color="gold" className="m-0">{data.appointment.data.alamatPerawat}</Tag>), },
    { key: "namaLengkap", value1: "Nama Pasien", value2: (<p>{data.appointment.data.namaLengkap}</p>), },
    { key: "nomorIdentitas", value1: "Nomor Identitas Pasien (NIK/SIM/Paspor)", value2: (<p>{data.appointment.data.nomorIdentitas}</p>), },
    { key: "email", value1: "Email Pasien", value2: (<p>{data.appointment.data.email}</p>), },
    { key: "telpSelular", value1: "Nomor Telepon Pasien", value2: (<p>{data.appointment.data.telpSelular}</p>), },
    { key: "createdAt", value1: "Pendaftaran Dibuat Pada", value2: (<p>{new Date(data.appointment.data.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>), },
    { key: "patientGender", value1: "Status Rawat Jalan", value2: (<Tag color={ appointmentStatus === "ongoing" ? "blue" : appointmentStatus === "done" ? "green" : "red" }>{ appointmentStatus === "ongoing" ? "Sedang berjalan" : appointmentStatus === "done" ? "Selesai" : "Batal" }</Tag>), },
  ];

  const cancelAppointment = async () => {
    const signedData = { nomorRekamMedis: data.appointment.data.nomorRekamMedis, appointmentId: data.appointment.data.appointmentId }
    const signer = await getSigner();
    const signature = await signer.signMessage(JSON.stringify(signedData));
    signedData.signature = signature;
    console.log("Appointment signature:", signature);
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/patient/appointment/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...signedData }),
      });
  
      const result = await response.json();
      if (response.ok) {
        setAppointmentStatus(result.newStatus);
      } else {
        console.error("Failed to cancel appointment:", result.error);
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  return (
    <div className="grid px-12 py-8 gap-y-8">
      <div className="grid items-center mx-auto text-center text-gray-900 w-fit gap-y-2">
        <h1 className="text-xl font-medium">Data Pendaftaran Rawat Jalan</h1>
        <p>ID Pendaftaran: <Tag color="green" className="m-0">{data.appointment.data.appointmentId}</Tag></p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <PatientRecordLoop data={patientDataProps1} />
        <PatientRecordLoop data={patientDataProps2} />
      </div>
      <div className="justify-center w-1/3 mx-auto">
      {data.appointment.data.status === "ongoing" ? <Button type="primary" danger onClick={cancelAppointment}>Batalkan Pendaftaran</Button> : null}
      </div>
    </div>
  );
}

export default PatientAppointmentDisplay;
