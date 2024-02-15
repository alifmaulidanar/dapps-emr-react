import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { CONN } from "../../../enum-global";

export default function PatientIdentifier({
  patientName,
  patientIdentification,
  patientImage,
}) {
  return (
    <div className="flex flex-col items-center p-8">
      {patientImage ? (
        <img
          className="w-24 h-24 mb-3 rounded-full shadow-lg"
          width={96}
          height={96}
          src={`${CONN.IPFS_LOCAL}/${patientImage}`}
          alt={`${patientName} image`}
        />
      ) : (
        <Avatar
          size={96}
          style={{
            backgroundColor: "#87d068",
            marginBottom: ".75rem",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          }}
          icon={<UserOutlined />}
        />
      )}
      <h5 className="mb-1 text-xl font-medium text-gray-900">{patientName}</h5>
      <div>
        <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded text-center">
          {patientIdentification}
        </span>
      </div>
    </div>
  );
}
