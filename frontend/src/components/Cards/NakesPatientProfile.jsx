import { Tag } from "antd"

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

function NakesPatientProfile({ data, convert, foto }) {
  const convertedData = convert(data);
  const patientDataProps1 = [
    { key: "namaLengkap", value1: "Nama Lengkap", value2: <p>{convertedData.namaLengkap || '-'}</p> },
    { key: "nomorIdentitas", value1: "Nomor Identitas", value2: (<p>{convertedData.nomorIdentitas || '-'}</p>) },
    { key: "namaIbu", value1: "Nama Ibu", value2: <p>{convertedData.namaIbu || '-'}</p> },
    { key: "gender", value1: "Jenis Kelamin", value2: <p>{convertedData.gender || '-'}</p> },
    { key: "agama", value1: "Agama", value2: <p>{convertedData.agama || '-'}</p> },
    { key: "tempatLahir", value1: "Tempat Lahir", value2: <p>{convertedData.tempatLahir || '-'}</p> },
    { key: "suku", value1: "Suku", value2: <p>{convertedData.suku || '-'}</p> },
    { key: "bahasa", value1: "Bahasa", value2: <p>{convertedData.bahasa || '-'}</p> },
    { key: "tanggalLahir", value1: "Tanggal Lahir", value2: <p>{convertedData.tanggalLahir}</p> },
    { key: "email", value1: "Email", value2: <p>{convertedData.email || '-'}</p> },
    { key: "telpSelular", value1: "Telepon Selular", value2: <p>{convertedData.telpSelular || '-'}</p> },
    { key: "golonganDarah", value1: "Golongan Darah", value2: <p>{convertedData.golonganDarah || '-'}</p> },
    { key: "pendidikan", value1: "Pendidikan", value2: <p>{convertedData.pendidikan || '-'}</p> },
    { key: "pekerjaan", value1: "Pekerjaan", value2: <p>{convertedData.pekerjaan || '-'}</p> },
    { key: "pernikahan", value1: "Status Pernikahan", value2: <p>{convertedData.pernikahan || '-'}</p> },
    { key: "alamat", value1: "Alamat", value2: <p>{convertedData.alamat || '-'}</p> },
    { key: "rt", value1: "RT", value2: <p>{convertedData.rt || '-'}</p> },
    { key: "rw", value1: "RW", value2: <p>{convertedData.rw || '-'}</p> },
    { key: "kelurahan", value1: "Kelurahan", value2: <p>{convertedData.kelurahan || '-'}</p> },
    { key: "kecamatan", value1: "Kecamatan", value2: <p>{convertedData.kecamatan || '-'}</p> },
    { key: "kota", value1: "Kota", value2: <p>{convertedData.kota || '-'}</p> },
    { key: "pos", value1: "Kode Pos", value2: <p>{convertedData.pos || '-'}</p> },
    { key: "provinsi", value1: "Provinsi", value2: <p>{convertedData.provinsi || '-'}</p> },
    { key: "negara", value1: "Negara", value2: <p>{convertedData.negara || '-'}</p> },
  ];
  const patientDataProps2 = [
    { key: "namaKerabat", value1: "Nama", value2: <p>{convertedData.namaKerabat || '-'}</p> },
    { key: "nomorIdentitasKerabat", value1: "Nomor Identitas", value2: <p>{convertedData.nomorIdentitasKerabat || '-'}</p> },
    { key: "tanggalLahirKerabat", value1: "Tanggal Lahir", value2: <p>{convertedData.tanggalLahirKerabat}</p> },
    { key: "genderKerabat", value1: "Jenis Kelamin", value2: <p>{convertedData.genderKerabat || '-'}</p> },
    { key: "telpKerabat", value1: "Telepon", value2: <p>{convertedData.telpKerabat || '-'}</p> },
    { key: "hubunganKerabat", value1: "Hubungan dengan", value2: <p>{convertedData.hubunganKerabat || '-'}</p> },
    { key: "alamatKerabat", value1: "Alamat", value2: <p>{convertedData.alamatKerabat || '-'}</p> },
    { key: "rtKerabat", value1: "RT", value2: <p>{convertedData.rtKerabat || '-'}</p> },
    { key: "rwKerabat", value1: "RW", value2: <p>{convertedData.rwKerabat || '-'}</p> },
    { key: "kelurahanKerabat", value1: "Kelurahan", value2: <p>{convertedData.kelurahanKerabat || '-'}</p> },
    { key: "kecamatanKerabat", value1: "Kecamatan", value2: <p>{convertedData.kecamatanKerabat || '-'}</p> },
    { key: "kotaKerabat", value1: "Kota", value2: <p>{convertedData.kotaKerabat || '-'}</p> },
    { key: "posKerabat", value1: "Kode Pos", value2: <p>{convertedData.posKerabat || '-'}</p> },
    { key: "provinsiKerabat", value1: "Provinsi", value2: <p>{convertedData.provinsiKerabat || '-'}</p> },
    { key: "negaraKerabat", value1: "Negara", value2: <p>{convertedData.negaraKerabat || '-'}</p> },
  ];
  return (
    <div className="grid p-8 gap-y-8">
      <div className="grid items-center mx-auto text-center text-gray-900 justify-items-center w-fit gap-y-4">
        <h1 className="text-xl font-medium">Data Profil Pasien</h1>
        {foto}
        {/* <p>Nomor Rekam Medis: {convertedData.emrNumber}</p> */}
        <p>Nomor DRM: <Tag color="red" className="m-0 mx-auto w-fit">{convertedData.dmrNumber}</Tag></p>
        <p>Nomor RME: <Tag color="blue" className="m-0 mx-auto w-fit">{convertedData.emrNumber}</Tag></p>
      </div>
      <div className="grid grid-cols-3 gap-x-8 gap-y-6">
        <div className="col-span-3 text-lg text-gray-900">
          Data Pasien
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <PatientRecordLoop data={patientDataProps1} />
          <div className="col-span-3 mt-4 text-lg text-gray-900">
            Data Penanggung Jawab / Kerabat
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
        <PatientRecordLoop data={patientDataProps2} />
      </div>
    </div>
  );
}

export default NakesPatientProfile;
