/* eslint-disable react/prop-types */
import { Tag } from "antd";

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

function PatientAppointmentDisplay({data}) {
  const patientDataProps1 = [
    {
      key: "rumahSakit",
      value1: "Cabang Eka Hospital",
      value2: (
        <p>{data.appointment.data.rumahSakit}</p>
      ),
    },
    {
      key: "tanggalTerpilih",
      value1: "Hari & Tanggal",
      value2: (
        <p>{new Date(data.appointment.data.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      ),
    },
    {
      key: "nomorRekamMedis",
      value1: "Nomor Rekam Medis",
      value2: (
        <p>{data.appointment.data.nomorRekamMedis}</p>
      ),
    },
    {
      key: "waktuTerpilih",
      value1: "Waktu Praktik",
      value2: (
        <p>{data.appointment.data.waktuTerpilih}</p>
      ),
    },
    // {
    //   key: "recordAddress",
    //   value1: "Nomor Rekam Medis",
    //   value2: (
    //     <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
    //       0x66E167fDd23614b58A4459C1C875C6705f550ED6
    //     </span>
    //   ),
    // },
    // {
    //   key: "patientAddress",
    //   value1: "Nomor Rekam Medis",
    //   value2: (
    //     <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded text-center">
    //       0x66E167fDd23614b58A4459C1C875C6705f550ED6
    //     </span>
    //   ),
    // },
  ];
  const patientDataProps2 = [
    {
      key: "namaDokter",
      value1: "Nama Dokter",
      value2: (
        <p>{data.appointment.data.namaDokter}</p>
      ),
    },
    {
      key: "alamatDokter",
      value1: "Alamat Akun Dokter",
      value2: (
        <Tag color="green" className="m-0">{data.appointment.data.alamatDokter}</Tag>
      ),
    },
    {
      key: "namaPerawat",
      value1: "Nama Perawat",
      value2: (
        <p>{data.appointment.data.namaPerawat}</p>
      ),
    },
    {
      key: "alamatPerawat",
      value1: "Alamat Akun Perawat",
      value2: (
        <Tag color="green" className="m-0">{data.appointment.data.alamatPerawat}</Tag>
      ),
    },
    {
      key: "namaLengkap",
      value1: "Nama Pasien",
      value2: (
        <p>{data.appointment.data.namaLengkap}</p>
      ),
    },
    {
      key: "nomorIdentitas",
      value1: "Nomor Identitas Pasien (NIK/SIM/Paspor)",
      value2: (
        <p>{data.appointment.data.nomorIdentitas}</p>
      ),
    },
    {
      key: "email",
      value1: "Email Pasien",
      value2: (
        <p>{data.appointment.data.email}</p>
      ),
    },
    {
      key: "telpSelular",
      value1: "Nomor Telepon Pasien",
      value2: (
        <p>{data.appointment.data.telpSelular}</p>
      ),
    },
    {
      key: "createdAt",
      value1: "Pendaftaran Dibuat Pada",
      value2: (
        <p>{new Date(data.appointment.data.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      ),
    },
    {
      key: "patientGender",
      value1: "Status Rawat Jalan",
      value2: (
        <p>{data.appointment.data.status}</p>
      ),
    },
  ];
  return (
    <div className="grid p-12 gap-y-12">
      <div className="grid items-center mx-auto text-center text-gray-900 w-fit gap-y-2">
        <h1 className="text-xl font-medium">Data Pendaftaran Rawat Jalan</h1>
        {/* <Tag color="blue" className="m-0 mx-auto w-fit">{data.appointment.data.cid}</Tag> */}
        <p>ID Pendaftaran: {data.appointment.data.appointmentId}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <PatientRecordLoop data={patientDataProps1} />
        <PatientRecordLoop data={patientDataProps2} />
      </div>
    </div>
  );
}

export default PatientAppointmentDisplay;
