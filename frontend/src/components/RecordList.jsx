import { useNavigate } from "react-router-dom";
import { Tag, Empty } from 'antd';

export default function RecordList({ recordItems, chosenPatient, appointmentData }) {
  console.log({ chosenPatient });
  console.log({ appointmentData });
  const navigate = useNavigate();
  const handleNavigate = (record) => { navigate('/patient/record-list/details', { state: { record } }) };
  return (
    <>
      <div className="grid gap-4">
        {recordItems.length > 0 ? (
          recordItems.map((record, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(record)}
            >
              <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
                <div className="grid items-center grid-cols-2">
                  <h5 className="mb-2 text-2xl font-bold text-gray-900">
                    {record.judulRekamMedis}
                  </h5>
                  <p className="text-base text-right text-gray-900">
                    {record.tanggalRekamMedis}
                  </p>
                </div>
                <div className="mb-4">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {record.appointmentId}
                  </span>
                </div>
                <p className="text-gray-900">{record.recordDoctorName}</p>
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
