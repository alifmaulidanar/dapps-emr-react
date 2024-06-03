import { useNavigate } from "react-router-dom";
import { Tag, Empty } from 'antd';

export default function RecordList({ recordItems, chosenPatient, appointmentData }) {
  const navigate = useNavigate();
  const handleNavigate = (record) => {
    const matchedAppointment = appointmentData.find(appointment => appointment.appointmentId === record.appointmentId)?.data;
    navigate('/patient/record-list/details', { state: {record, chosenPatient, appointmentData: matchedAppointment} });
  };
  console.log({appointmentData});
  return (
    <div className="grid gap-4">
      {appointmentData.length > 0 ? (
        appointmentData.map((appointment, index) => (
          <div key={index} onClick={() => handleNavigate(appointment)} className="cursor-pointer" >
            <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
              <div className="grid items-center justify-between grid-cols-4 mb-4">
                <div className="flex col-span-3 flex-nowrap gap-x-4">
                  <h5 className="font-bold text-gray-900">{appointment.judulRekamMedis}</h5>
                  <Tag color="green" className="m-0">{appointment.appointmentId}</Tag>
                </div>
              </div>
              <div className="flex justify-between mb-4 flex-nowrap">
                <p className="w-full text-base text-gray-900">
                  {appointment.namaDokter} (Dokter {appointmentData.find(appointment => appointment.appointmentId === appointment.appointmentId)?.spesialisasiDokter})
                </p>
                <div className="grid justify-end w-full mr-auto">
                  {new Date(appointment.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="flex justify-between w-full m-0 flex-nowrap">
                <p className="w-full text-base text-gray-900">
                  {appointment.faskesTujuan}
                </p>
                <p className="w-full text-right text-gray-900">
                  Pukul {appointment.waktuTerpilih?.split(":").slice(0, 2).join(":")}
                </p>
              </div>
            </div>
            </div>
        ))
      ) : (<Empty description="Tidak ada Appointment" />)}
    </div>
  );
}
