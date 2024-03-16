import "./../index.css";

// Komponen untuk daftar pasien
export default function AppointmentList({ appointmentData }) {
  console.log({appointmentData});
  return (
    <>
      <div className="grid gap-4">
        {appointmentData.map((appointment, index) => (
          <a
            key={index}
            href={`#`}
          >
            <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
              <div className="grid grid-cols-2 items-center">
                <h5 className="mb-2 text-2xl font-bold text-gray-900">
                {appointment.data.emrNumber}
                </h5>
                <p className="text-base text-gray-900 text-right">
                {new Date(appointment.data.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
                <p className="text-base text-gray-900 text-right">
                {appointment.data.hospitalLocation}
                </p>
              </div>
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {appointment.cid}
                </span>
              </div>
              <div className="flex flex-nowrap">
                <p className="text-gray-900">{appointment.data.doctorName}</p>
                <p className="text-gray-900">{appointment.data.doctorAddress}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
