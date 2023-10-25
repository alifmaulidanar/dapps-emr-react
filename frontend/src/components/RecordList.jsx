import "./../index.css";

// Komponen untuk daftar pasien
export default function RecordList({ accountAddress, recordItems }) {
  return (
    <>
      <div className="grid gap-4">
        {recordItems.map((record, index) => (
          <a
            key={index}
            href={`/patient/${accountAddress}/record-list/record/${record.recordAddress}`}
          >
            <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
              <div className="grid grid-cols-2 items-center">
                <h5 className="mb-2 text-2xl font-bold text-gray-900">
                  {record.recordTitle}
                </h5>
                <p className="text-base text-gray-900 text-right">
                  {record.recordDate}
                </p>
              </div>
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {record.recordAddress}
                </span>
              </div>
              <p className="text-gray-900">{record.recordDoctorName}</p>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
