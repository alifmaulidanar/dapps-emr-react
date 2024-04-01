const PatientRecordLoop = ({ data }) => {
  return (
    <>
      {data.map(({ key, value1, value2 }) => (
        <div key={key} className="mb-6">
          <h3 className="block mb-2 text-sm font-medium text-gray-900">
            {value1}
          </h3>
          <p className="text-sm text-gray-900">{value2}</p>
        </div>
      ))}
    </>
  );
};

function PatientRecordDisplay({ appointment }) {
  console.log({appointment});
  const patientDataProps1 = [
    {
      key: "recordAddress",
      value1: "No Rekam Medis",
      value2: (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          0x66E167fDd23614b58A4459C1C875C6705f550ED6
        </span>
      ),
    },
    {
      key: "recordDate",
      value1: "Tanggal",
      value2: "Selasa, 11 September 2023",
    },
    {
      key: "recordTitle",
      value1: "Judul Rekam Medis",
      value2: "Medical Checkup Rutin",
    },
    {
      key: "recordDoctorName",
      value1: "Nama Dokter",
      value2: "Dokter Suryono",
    },
  ];

  const patientDataProps2 = [
    {
      key: "patientAddress",
      value1: "Kode Pasien",
      value2: (
        <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded text-center">
          0x66E167fDd23614b58A4459C1C875C6705f550ED6
        </span>
      ),
    },
    {
      key: "patientIdNumber",
      value1: "Nomor Identitas Pasien (NIK/SIM/Paspor)",
      value2: "18310893018601",
    },
    {
      key: "patientName",
      value1: "Nama Pasien",
      value2: "Alif Maulidanar",
    },
    {
      key: "patientGender",
      value1: "Jenis Kelamin",
      value2: "Pria",
    },
    {
      key: "patientMaritalStatus",
      value1: "Status Perkawinan",
      value2: "Tidak/Belum Menikah",
    },
    {
      key: "patientBirthDate",
      value1: "Tanggal Lahir",
      value2: "04/06/2002",
    },
    {
      key: "patientAge",
      value1: "Usia",
      value2: "21 tahun",
    },
    {
      key: "patientLastEdu",
      value1: "Pendidikan Terakhir",
      value2: "SMA",
    },
    {
      key: "patientJob",
      value1: "Pekerjaan",
      value2: "Mahasiswa",
    },
    {
      key: "patientHomeAddress",
      value1: "Alamat",
      value2: "Jalan Melati",
    },
    {
      key: "patientPhone",
      value1: "Nomor Teleon",
      value2: "085819130187",
    },
    {
      key: "patientReligion",
      value1: "Agama",
      value2: "Islam",
    },
    {
      key: "patientBloodType",
      value1: "Golongan Darah",
      value2: "A",
    },
    {
      key: "patientAllergic",
      value1: "Alergi",
      value2: "Tidak ada",
    },
  ];

  const patientDataProps3 = [
    {
      key: "patientAnamnesa",
      value1: "Anamnesa",
      value2: "Merasa pusing berkepanjangan",
    },
    {
      key: "patientDiagnosa",
      value1: "Diagnosa",
      value2: "Kurangnya jam tidur dan makan tidak teratur",
    },
    {
      key: "patientTherapy",
      value1: "Terapi",
      value2: "Perbanyak minum air mineral dan makan dnegan teratur",
    },
  ];

  const patientDataProps4 = [
    {
      key: "patientAdditionalNotes",
      value1: "Catatan",
      value2: "Kurangnya jam tidur dan makan tidak teratur",
    },
  ];

  const patientDataProps5 = [
    {
      key: "patientFiles",
      value1: "Lampiran Berkas",
      value2: "*file uploaded*",
    },
  ];

  return (
    <div className="col-span-2 p-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="col-span-2 my-12 mt-4 text-xl font-medium text-center text-gray-900">
          Rekam Medis Pasien
        </div>

        {/* DATA REKAM MEDIS */}
        <PatientRecordLoop data={patientDataProps1} />
        <div className="col-span-2 mb-6 text-lg text-gray-900">
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <PatientRecordLoop data={patientDataProps2} />
        <div className="col-span-2 mb-6 text-lg text-gray-900">
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <PatientRecordLoop data={patientDataProps3} />
        <div className="col-span-2 mb-6 text-lg text-gray-900">
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <PatientRecordLoop data={patientDataProps4} />
        <div className="col-span-2 mb-6 text-lg text-gray-900">
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <PatientRecordLoop data={patientDataProps5} />
      </div>
    </div>
  );
}

export default PatientRecordDisplay;
