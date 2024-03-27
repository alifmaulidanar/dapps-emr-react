/* eslint-disable react/prop-types */
import { Tag } from "antd"

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

function DoctorPatientProfile({ data, convert, foto }) {
  const convertedData = convert(data);

  const patientDataProps1 = [
    {
      key: "namaLengkap",
      value1: "Nama Lengkap",
      value2: (
        <p>{convertedData.namaLengkap}</p>
      ),
    },
    {
      key: "nomorIdentitas",
      value1: "Nomor Identitas",
      value2: (
        <p>{convertedData.nomorIdentitas}</p>
      ),
    },
    {
      key: "tempatLahir",
      value1: "Nomor Rekam Medis",
      value2: (
        <p>{convertedData.tempatLahir}</p>
      ),
    },
    {
      key: "tanggalLahir",
      value1: "Tanggal Lahir",
      value2: (
        <p>{new Date(convertedData.tanggalLahir).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      ),
    },
    {
      key: "namaIbu",
      value1: "Nama Ibu",
      value2: <p>{convertedData.namaIbu}</p>,
    },
    {
      key: "gender",
      value1: "Jenis Kelamin",
      value2: <p>{convertedData.gender}</p>
    },
    {
      key: "agama",
      value1: "Agama",
      value2: <p>{convertedData.agama}</p>
    },
    {
      key: "suku",
      value1: "Suku",
      value2: <p>{convertedData.suku}</p>,
    },
    {
      key: "bahasa",
      value1: "Bahasa",
      value2: <p>{convertedData.bahasa}</p>,
    },
    {
      key: "golonganDarah",
      value1: "Golongan Darah",
      value2: <p>{convertedData.golonganDarah}</p>
    },
    {
      key: "telpRumah",
      value1: "Telepon Rumah",
      value2: <p>{convertedData.telpRumah}</p>,
    },
    {
      key: "telpSelular",
      value1: "Telepon Selular",
      value2: <p>{convertedData.telpSelular}</p>,
    },
    {
      key: "email",
      value1: "Email",
      value2: <p>{convertedData.email}</p>,
    },
    {
      key: "pendidikan",
      value1: "Pendidikan",
      value2: <p>{convertedData.pendidikan}</p>
    },
    {
      key: "pekerjaan",
      value1: "Pekerjaan",
      value2: <p>{convertedData.pekerjaan}</p>
    },
    {
      key: "pernikahan",
      value1: "Status Pernikahan",
      value2: <p>{convertedData.pernikahan}</p>
    },
    {
      key: "alamat",
      value1: "Alamat",
      value2: <p>{convertedData.alamat}</p>,
    },
    {
      key: "rt",
      value1: "RT",
      value2: <p>{convertedData.rt}</p>,
    },
    {
      key: "rw",
      value1: "RW",
      value2: <p>{convertedData.rw}</p>,
    },
    {
      key: "kelurahan",
      value1: "Kelurahan",
      value2: <p>{convertedData.kelurahan}</p>,
    },
    {
      key: "kecamatan",
      value1: "Kecamatan",
      value2: <p>{convertedData.kecamatan}</p>,
    },
    {
      key: "kota",
      value1: "Kota",
      value2: <p>{convertedData.kota}</p>,
    },
    {
      key: "pos",
      value1: "Kode Pos",
      value2: <p>{convertedData.pos}</p>,
    },
    {
      key: "provinsi",
      value1: "Provinsi",
      value2: <p>{convertedData.provinsi}</p>,
    },
    {
      key: "negara",
      value1: "Negara",
      value2: <p>{convertedData.negara}</p>,
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
      key: "namaKerabat",
      value1: "Nama Kerabat",
      value2: <p>{convertedData.namaKerabat}</p>,
    },
    {
      key: "nomorIdentitasKerabat",
      value1: "Nomor Identitas Kerabat",
      value2: <p>{convertedData.nomorIdentitasKerabat}</p>,
    },
    {
      key: "tanggalLahirKerabat",
      value1: "Tanggal Lahir Kerabat",
      value2: <p>{new Date(convertedData.tanggalLahirKerabat).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>,
    },
    {
      key: "genderKerabat",
      value1: "Jenis Kelamin Kerabat",
      value2: <p>{convertedData.genderKerabat}</p>
    },
    {
      key: "telpKerabat",
      value1: "Telepon Kerabat",
      value2: <p>{convertedData.telpKerabat}</p>,
    },
    {
      key: "hubunganKerabat",
      value1: "Hubungan dengan Kerabat",
      value2: <p>{convertedData.hubunganKerabat}</p>,
    },
    {
      key: "alamatKerabat",
      value1: "Alamat Kerabat",
      value2: <p>{convertedData.alamatKerabat}</p>,
    },
    {
      key: "rtKerabat",
      value1: "RT Kerabat",
      value2: <p>{convertedData.rtKerabat}</p>,
    },
    {
      key: "rwKerabat",
      value1: "RW Kerabat",
      value2: <p>{convertedData.rwKerabat}</p>,
    },
    {
      key: "kelurahanKerabat",
      value1: "Kelurahan Kerabat",
      value2: <p>{convertedData.kelurahanKerabat}</p>,
    },
    {
      key: "kecamatanKerabat",
      value1: "Kecamatan Kerabat",
      value2: <p>{convertedData.kecamatanKerabat}</p>,
    },
    {
      key: "kotaKerabat",
      value1: "Kota Kerabat",
      value2: <p>{convertedData.kotaKerabat}</p>,
    },
    {
      key: "posKerabat",
      value1: "Kode Pos Kerabat",
      value2: <p>{convertedData.posKerabat}</p>,
    },
    {
      key: "provinsiKerabat",
      value1: "Provinsi Kerabat",
      value2: <p>{convertedData.provinsiKerabat}</p>,
    },
    {
      key: "negaraKerabat",
      value1: "Negara Kerabat",
      value2: <p>{convertedData.negaraKerabat}</p>,
    }
  ];

  return (
    <div className="grid p-8 gap-y-8">
      <div className="grid items-center mx-auto text-center text-gray-900 justify-items-center w-fit gap-y-4">
        <h1 className="text-xl font-medium">Data Profil Pasien</h1>
        {foto}
        {/* <p>Nomor Rekam Medis: {convertedData.nomorRekamMedis}</p> */}
        <Tag color="blue" className="m-0 mx-auto w-fit">{convertedData.nomorRekamMedis}</Tag>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-2 text-lg text-gray-900">
            Data Pasien
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
        <PatientRecordLoop data={patientDataProps1} />
          <div className="col-span-2 mt-4 text-lg text-gray-900">
            Data Penanggung Jawab
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
        <PatientRecordLoop data={patientDataProps2} />
      </div>
    </div>
  );
}

export default DoctorPatientProfile;
