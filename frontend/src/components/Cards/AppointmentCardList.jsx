import { useNavigate } from "react-router-dom";
import { Tag, Empty } from 'antd';

export default function AppointmentList({ appointmentData }) {
  const navigate = useNavigate();
  const handleNavigate = (appointment) => { navigate('/patient/appointment-list/details', { state: { appointment } }) };
  return (
    <>
      <div className="grid gap-4">
        {appointmentData.length > 0 ? (
          appointmentData.map((appointment, index) => (
            <div key={index} onClick={() => handleNavigate(appointment)} className="cursor-pointer" >
              <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
                <div className="grid items-center justify-between grid-cols-3 mb-4">
                  <div className="flex flex-nowrap gap-x-4 col-span-2">
                    <h5 className="font-bold text-gray-900">
                      {appointment.namaDokter}
                    </h5>
                    <Tag color="magenta" className="m-0">{appointment.doctorAddress}</Tag>
                  </div>
                  <div className="grid justify-end w-full mr-auto">
                  <Tag className="m-0" color={
                    appointment.status === "ongoing" ? "blue" : 
                    appointment.status === "active" ? "gold" : 
                    appointment.status === "done" ? "green" : 
                    "red"
                  }>
                    {
                      appointment.status === "ongoing" ? "Sedang berjalan" : 
                      appointment.status === "active" ? "Sedang diperiksa" : 
                      appointment.status === "done" ? "Selesai" : 
                      "Batal"
                    }
                  </Tag>
                  </div>
                </div>
                <div className="flex justify-between mb-4 flex-nowrap">
                  <p className="w-full text-base text-gray-900">
                    Dokter {appointment.spesialisasi}
                  </p>
                  <p className="w-full text-right text-gray-900">
                    {new Date(appointment.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex justify-between w-full m-0 flex-nowrap">
                  <p className="w-full text-base text-gray-900">
                    {appointment.faskesTujuan}
                  </p>
                  <p className="w-full text-right text-gray-900">
                    {appointment.waktuTerpilih}
                  </p>
                  {/* <Tag color="blue" className="m-0">{appointment.cid}</Tag> */}
                </div>
              </div>
            </div>
          ))
        ) : (
          <Empty description="Tidak ada Rawat Jalan" />
        )}
      </div>
    </>
  );
}
