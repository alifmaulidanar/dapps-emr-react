import { Avatar, Tag } from "antd";
import { CONN } from "../../../enum-global";
import { UserOutlined } from "@ant-design/icons";

export default function PatientList({ patientIsChosen = false, nomorRekamMedis, namaLengkap, foto, onClick }) {
  return (
    <li onClick={onClick} className="py-2 cursor-pointer">
      <div className="flex items-center px-4 space-x-4">
        <div className="flex-shrink-0">
          {foto ? (
            <img className="w-16 h-16 rounded-full" width={64} height={64} src={`${CONN.IPFS_LOCAL}/${foto}`} alt={`${namaLengkap} image`} />
          ) : (
            <Avatar size={64} style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{namaLengkap}</p>
          <div><Tag color="blue" className="m-0">{nomorRekamMedis}</Tag></div>
        </div>
        <div className="inline-flex items-center text-base font-semibold text-gray-900">
          {patientIsChosen && (
            <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-sm font-semibold text-white bg-blue-700 rounded-full">
              <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12" >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M1 5.917 5.724 10.5 15 1.5"
                />
              </svg>
              <span className="sr-only">Pasien Terpilih</span>
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
