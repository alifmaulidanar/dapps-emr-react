import { useNavigate } from "react-router-dom";

export default function AppointmentList({ appointmentData }) {
  const navigate = useNavigate();  // Tambahkan ini
  const handleNavigate = (appointment) => {
    navigate('/patient/appointment/details', { state: { appointment } });
  };
  console.log({appointmentData})
  return (
    <>
      <div className="grid gap-4">
        {appointmentData.map((appointment, index) => (
          <div
            key={index}
            onClick={() => handleNavigate(appointment)}
          >
            <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
              <div className="grid items-center grid-cols-2 mb-4">
                <h5 className="text-xl font-bold text-gray-900">
                  {appointment.data.doctorName}
                </h5>
                <p className="text-base text-right text-gray-900">
                  {new Date(appointment.data.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
              <div className="flex justify-between mb-4 flex-nowrap">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {appointment.data.doctorAddress}
                </span>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {appointment.cid}
                </span>
              </div>
              <div className="flex justify-between flex-nowrap">
                <p className="w-full text-base text-gray-900">
                  Dokter {appointment.data.doctorSpecialization}
                </p>
                <p className="w-full text-base text-right text-gray-900">
                  {appointment.data.hospitalLocation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
