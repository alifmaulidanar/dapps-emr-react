export default function PatientIdentifier({
  patientName,
  patientImage,
  patientIdentification,
}) {
  return (
    <div className="flex flex-col items-center p-8">
      <img
        className="w-24 h-24 mb-3 rounded-full shadow-lg"
        width={500}
        height={500}
        src={`${patientImage}`}
        alt={`${patientName} image`}
      />
      <h5 className="mb-1 text-xl font-medium text-gray-900">{patientName}</h5>
      <div>
        <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded text-center">
          {patientIdentification}
        </span>
      </div>
    </div>
  );
}
