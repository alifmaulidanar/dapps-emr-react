import { useNavigate } from "react-router-dom";
import { Tag, Empty } from 'antd';

export default function RecordList({ recordItems, chosenPatient, appointmentData }) {
  // console.log({recordItems});
  // console.log({chosenPatient});
  // console.log({appointmentData});
  const navigate = useNavigate();
  const handleNavigate = (record) => { navigate('/patient/record-list/details', { state: { record } }) };
  const getHospitalName = (hospitalCode) => {
    switch (hospitalCode) {
      case "1":
        return 'Eka Hospital Bekasi';
      case "2":
        return 'Eka Hospital BSD';
      case "3":
        return 'Eka Hospital Jakarta';
      case "4":
        return 'Eka Hospital Lampung';
      default:
        return '';
    }
  };
  return (
    <div className="grid gap-4">
      {recordItems.length > 0 ? (
        recordItems.map((record, index) => (
          <div key={index} onClick={() => handleNavigate(record)} >
            <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
              <div className="grid items-center justify-between grid-cols-4 mb-4">
                <div className="flex col-span-3 flex-nowrap gap-x-4">
                  <h5 className="font-bold text-gray-900">
                    {record.judulRekamMedis}
                  </h5>
                  <Tag color="green" className="m-0">{record.appointmentId}</Tag>
                </div>
              </div>
              <div className="flex justify-between mb-4 flex-nowrap">
                <p className="w-full text-base text-gray-900">
                  {record.namaDokter} (Dokter {appointmentData.find(appointment => appointment.data.appointmentId === record.appointmentId).data.spesialisasiDokter})
                </p>
                <div className="grid justify-end w-full mr-auto">
                  {new Date(record.tanggalRekamMedis).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="flex justify-between w-full m-0 flex-nowrap">
                <p className="w-full text-base text-gray-900">
                  {getHospitalName(chosenPatient.rumahSakitAsal)}
                </p>
                <p className="w-full text-right text-gray-900">
                  Pukul {record.waktuPenjelasanTindakan?.split(":").slice(0, 2).join(":")}
                </p>
              </div>
            </div>
            </div>
        ))
      ) : (<Empty description="Tidak ada Appointment" />)}
    </div>
  );
}
