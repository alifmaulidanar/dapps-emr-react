import { useNavigate } from "react-router-dom";
import { Tag, Empty } from 'antd';

export default function AppointmentList({ appointmentData }) {
  const navigate = useNavigate();
  const handleNavigate = (appointment) => { navigate('/patient/appointment/details', { state: { appointment } }) };
  return (
    <>
      <div className="grid gap-4">
        {appointmentData.length > 0 ? (
          appointmentData.map((appointment, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(appointment)}
            >
              <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
                <div className="grid items-center grid-cols-2 mb-4">
                  <div className="flex flex-nowrap gap-x-4">
                    <h5 className="font-bold text-gray-900">
                      {appointment.data.doctorName}
                    </h5>
                    <Tag color="green" className="m-0">{appointment.data.doctorAddress}</Tag>
                  </div>
                  <p className="text-right text-gray-900">
                    {new Date(appointment.data.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex justify-between mb-4 flex-nowrap">
                  <p className="w-full text-base text-gray-900">
                    Dokter {appointment.data.doctorSpecialization}
                  </p>
                  <p className="w-full text-base text-right text-gray-900">
                    Eka Hospital {appointment.data.hospitalLocation}
                  </p>
                </div>
                <div className="flex justify-end w-full m-0 flex-nowrap">
                  <Tag color="blue" className="m-0">{appointment.cid}</Tag>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Empty description="Tidak ada Appointment" />
        )}
      </div>
    </>
  );
}
