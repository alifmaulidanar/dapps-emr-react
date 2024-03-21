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
      key: "recordDoctorName",
      value1: "Cabang Eka Hospital",
      value2: (
        <p>{data.rumahSakit}</p>
      ),
    },
    {
      key: "recordDate",
      value1: "Hari & Tanggal",
      value2: (
        <p>{new Date(data.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      ),
    },
    {
      key: "patientAddress",
      value1: "Nomor Rekam Medis",
      value2: (
        <p>{data.nomorRekamMedis}</p>
      ),
    },
    {
      key: "recordDoctorName",
      value1: "Waktu Praktik",
      value2: (
        <p>{data.waktuTerpilih}</p>
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
      key: "recordAddress",
      value1: "Nama Dokter",
      value2: (
        <p>{data.namaDokter}</p>
      ),
    },
    {
      key: "recordAddress",
      value1: "Alamat Akun Dokter",
      value2: (
        <Tag color="green" className="m-0">{data.alamatDokter}</Tag>
      ),
    },
    {
      key: "recordAddress",
      value1: "Nama Perawat",
      value2: (
        <p>{data.namaPerawat}</p>
      ),
    },
    {
      key: "recordAddress",
      value1: "Alamat Akun Perawat",
      value2: (
        <Tag color="green" className="m-0">{data.alamatPerawat}</Tag>
      ),
    },
    {
      key: "patientName",
      value1: "Nama Pasien",
      value2: (
        <p>{data.namaLengkap}</p>
      ),
    },
    {
      key: "patientIdNumber",
      value1: "Nomor Identitas Pasien (NIK/SIM/Paspor)",
      value2: (
        <p>{data.nomorIdentitas}</p>
      ),
    },
    {
      key: "patientGender",
      value1: "Email Pasien",
      value2: (
        <p>{data.email}</p>
      ),
    },
    {
      key: "patientGender",
      value1: "Email Pasien",
      value2: (
        <p>{data.telpSelular}</p>
      ),
    },
    {
      key: "patientName",
      value1: "Pendaftaran Dibuat Pada",
      value2: (
        <p>{new Date(data.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      ),
    },
    {
      key: "patientGender",
      value1: "Status Rawat Jalan",
      value2: (
        <p>{data.status}</p>
      ),
    },
  ];
  return (
    <div className="grid p-12 gap-y-12">
      <div className="grid items-center mx-auto text-center text-gray-900 w-fit gap-y-2">
        <h1 className="text-xl font-medium">Data Pendaftaran Rawat Jalan</h1>
        {/* <Tag color="blue" className="m-0 mx-auto w-fit">{data.cid}</Tag> */}
        <p>ID Pendaftaran: {data.appointmentId}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <PatientRecordLoop data={patientDataProps1} />
        <PatientRecordLoop data={patientDataProps2} />
      </div>
    </div>
  );
}

export default PatientAppointmentDisplay;
