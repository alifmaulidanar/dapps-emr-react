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

function PatientAppointmentDisplay({data}) {
  const patientDataProps1 = [
    {
      key: "recordTitle",
      value1: "ID Pendaftaran",
      value2: (
        <p>{data.appointment.data.appointmentId}</p>
      ),
    },
    {
      key: "recordDate",
      value1: "Hari & Tanggal",
      value2: (
        <p>{data.appointment.data.selectedDay}, {data.appointment.data.selectedDate}</p>
      ),
    },
    {
      key: "recordAddress",
      value1: "Nama Dokter",
      value2: (
        <p>{data.appointment.data.doctorName}</p>
      ),
    },
    {
      key: "recordDoctorName",
      value1: "Waktu Praktik",
      value2: (
        <p>{data.appointment.data.selectedTime}</p>
      ),
    },
    {
      key: "recordAddress",
      value1: "Nama Perawat",
      value2: (
        <p>{data.appointment.data.nurseName}</p>
      ),
    },
    {
      key: "recordDoctorName",
      value1: "Cabang Eka Hospital",
      value2: (
        <p>{data.appointment.data.hospitalLocation}</p>
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
      key: "patientAddress",
      value1: "Nomor Rekam Medis",
      value2: (
        <p>{data.appointment.data.emrNumber}</p>
      ),
    },
    {
      key: "patientIdNumber",
      value1: "Nomor Identitas Pasien (NIK/SIM/Paspor)",
      value2: (
        <p>{data.appointment.data.patientIdentityNumber}</p>
      ),
    },
    {
      key: "patientName",
      value1: "Nama Pasien",
      value2: (
        <p>{data.appointment.data.patientName}</p>
      ),
    },
    {
      key: "patientGender",
      value1: "Email Pasien",
      value2: (
        <p>{data.appointment.data.patientEmail}</p>
      ),
    },
    {
      key: "patientName",
      value1: "Alamat Akun",
      value2: (
        <p>{data.appointment.data.accountAddress}</p>
      ),
    },
    {
      key: "patientGender",
      value1: "Email Akun",
      value2: (
        <p>{data.appointment.data.accountEmail}</p>
      ),
    },
    {
      key: "patientName",
      value1: "Pendaftaran Dibuat Pada",
      value2: (
        <p>{data.appointment.data.createdAt}</p>
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
    <div className="col-span-2 p-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="col-span-2 mt-4 mb-12 text-xl font-medium text-center text-gray-900">
          Data Pendaftaran Rawat Jalan
        </div>
        {/* DATA PENDAFTARAN RAWAT JALAN / OUTPATIENT */}
        <PatientRecordLoop data={patientDataProps1} />
        <PatientRecordLoop data={patientDataProps2} />
      </div>
    </div>
  );
}

export default PatientAppointmentDisplay;
