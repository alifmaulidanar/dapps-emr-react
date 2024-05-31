/* eslint-disable react/prop-types */
import { ethers } from "ethers";
import { Tag, Button } from "antd";
import { useState, useCallback } from "react";
import { CONN } from "../../../../enum-global";

const PatientRecordLoop = ({ data }) => {
  return (
    <>
      {data.map(({ key, value1, value2 }) => (
        <div key={key}>
          <h3 className="block text-sm font-medium text-gray-900">{value1}</h3>
          <p className="text-sm text-gray-900">{value2}</p>
        </div>
      ))}
    </>
  );
};

function PatientAppointmentDisplayStaff({ data, token }) {
  const [selectedAccount, setSelectedAccount] = useState(null);
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
    { key: "tanggalTerpilih", value1: "Hari & Tanggal",
      value2: (
        <p>{new Date(data.appointment.data.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      ),
    },
    { key: "waktuTerpilih", value1: "Waktu Praktik", value2: (<p>{data.appointment.data.waktuTerpilih}</p>) },
    { key: "emrNumber", value1: "Nomor Rekam Medis", value2: (<p>{data.appointment.data.emrNumber}</p>) },
    { key: "nomorIdentitas", value1: "Nomor Identitas Pasien (NIK/SIM/Paspor)", value2: (<p>{data.appointment.data.nomorIdentitas}</p>) },
    // { key: "faskesAsal", value1: "Faskes Asal", value2: (<p>{data.appointment.data.faskesAsal}</p>) },
  ];
  const patientDataProps2 = [
    { key: "namaLengkap", value1: "Nama Pasien", value2: (<p>{data.appointment.data.namaLengkap}</p>) },
    { key: "accountAddress", value1: "Alamat Akun Pasien", value2: (<Tag color="green" className="m-0">{data.appointment.data.accountAddress}</Tag>), },
    { key: "email", value1: "Email Pasien", value2: (<p>{data.appointment.data.email  || "-"}</p>) },
    { key: "telpSelular", value1: "Nomor Telepon Pasien", value2: (<p>{data.appointment.data.telpSelular || "-"}</p>) },
    { key: "namaDokter", value1: "Nama Dokter", value2: (<p>{data.appointment.data.namaDokter}</p>) },
    { key: "doctorAddress", value1: "Alamat Akun Dokter", value2: (<Tag color="gold" className="m-0">{data.appointment.data.doctorAddress}</Tag>) },
    { key: "namaAsisten", value1: "Nama Perawat", value2: (<p>{data.appointment.data.namaAsisten}</p>) },
    { key: "nurseAddress", value1: "Alamat Akun Perawat", value2: (<Tag color="gold" className="m-0">{data.appointment.data.nurseAddress}</Tag>) },
    { key: "appointmentCreatedAt", value1: "Pendaftaran Dibuat Pada",
      value2: (
        <p>{new Date(data.appointment.data.appointmentCreatedAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      ),
    },
    { key: "patientGender", value1: "Status Rawat Jalan",
      value2: (
        <Tag color={ data.appointment.data.status === "ongoing" ? "blue" :  data.appointment.data.status === "done" ? "green" : "red" } >
          { data.appointment.data.status === "ongoing" ? "Sedang berjalan" :  data.appointment.data.status === "done" ? "Selesai" : "Batal" }
        </Tag>
      ),
    },
  ];

  const cancelAppointment = async () => {
    const patientAppointment = { accountAddress: data.appointment.data.accountAddress, dmrNumber: data.appointment.data.dmrNumber, emrNumber: data.appointment.data.emrNumber, appointmentId: data.appointment.data.appointmentId }
    const signer = await getSigner();
    const signature = await signer.signMessage(JSON.stringify(patientAppointment));
    patientAppointment.signature = signature;
    console.log("Appointment signature:", signature);
    console.log({ patientAppointment });
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/cancel-appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...patientAppointment }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log("Appointment canceled successfully:", result);
        window.location.reload();
      } else {
        console.error("Failed to cancel appointment:", result.error);
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  return (
    <div className="grid p-8 gap-y-12">
      <div className="grid items-center mx-auto text-center text-gray-900 w-fit gap-y-2">
        <h1 className="text-xl font-medium">Data Pendaftaran Rawat Jalan</h1>
        {/* <p>ID Pendaftaran: <Tag color="green" className="m-0">{data.appointment.data.appointmentId}</Tag></p> */}
        <p className="text-[16px]">ID Pendaftaran: <span className="font-semibold">{data.appointment.data.appointmentId}</span></p>
        <p className="text-[16px]">{data.appointment.data.faskesTujuan}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <PatientRecordLoop data={patientDataProps1} />
        <PatientRecordLoop data={patientDataProps2} />
      </div>
      <div className="justify-center mx-auto">
        {data.appointment.data.status === "ongoing" ? <Button type="primary" danger onClick={cancelAppointment}>Batalkan Pendaftaran</Button> : null}
      </div>
    </div>
  );
}

export default PatientAppointmentDisplayStaff;
