/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Tag } from "antd";
import { Table } from "antd";
import { CONN } from "../../../../enum-global";

// Doctor tag color
const getTagColorDoctor = (address) => {
  const colorToAddress = {
    "0xadc8158B4d4b63126C18B258BAFd94d7e4614e58": "#108ee9",
    "0x2d761572fb2962d9a5c4D6DF34b120947bb3AbC1": "#f50",
    "0xe5dF08799114D618e628e2027fc8FF5B7F29705C": "teal",
    "0x7837Eb4C4388842335f8d51De5C003f2a5c42169": "brown",
  };
  return colorToAddress[address] || "gray";
};

// Nurse tag color
const getTagColorNurse = (address) => {
  const colorToAddress = {
    "0x0be909d68efd2b18111254782D0Edf077CD7F6aD": "green",
    "0xadc8158B4d4b63126C18B258BAFd94d7e4614e58": "blue",
    "0x2d761572fb2962d9a5c4D6DF34b120947bb3AbC1": "orange",
    "0xe5dF08799114D618e628e2027fc8FF5B7F29705C": "teal",
    "0x7837Eb4C4388842335f8d51De5C003f2a5c42169": "brown",
    "0xBec10133688B118Bd183B73B7963617472800E83": "gold",
    "0x6b32DFFB8d087297b7397adE4F94AC06e1D47cA6": "geekblue",
    "0x2B8B2e67E1176378304597B044D766580D233e1f": "pink",
    "0xC1Df9ad321ce0da253e32d1e21ea11BfD27Da498": "yellow",
    "0xBE9EED2EfB39F5E80555e7200de80E5b145E66f6": "cyan",
    "0xd43F2f3615B6F0ad5C8caC2f514Ae53F0F21e93C": "magenta",
    "0xdD76Ce44d1A22D5a3bCeD70e766AAAC95dc06f1b": "lime",
    "0xd078d842A58Df0A2282Ea626ce0629Af1C542A84": "navy",
    "0x119d6536434c434fa68CFFAFE104686a50E4Ef56": "purple",
  };
  return colorToAddress[address] || "gray";
};


function DoctorSchedule({ schedulesData, onScheduleCidUpdate }) {
  const [spinning, setSpinning] = React.useState(false);
  const [dataSource, setDataSource] = useState([]);

  const fetchDoctorSchedules = async () => {
    try {
      const cid = schedulesData.scheduleCid;
      const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
      const ipfsResponse = await fetch(ipfsGatewayUrl);
      if (!ipfsResponse.ok) throw new Error("Failed to fetch from IPFS");
      const { dokter } = await ipfsResponse.json();
      if (!Array.isArray(dokter)) throw new Error("Data format is incorrect");
      let flattenedData = [];
      console.log({ dokter });
      dokter.forEach((dokter) => {
        dokter.jadwal.forEach((schedule, index) => {
          flattenedData.push({
            key: dokter.idDokter,
            namaDokter: (
              <>
                <p>{dokter.namaDokter}</p>
                <Tag color={getTagColorDoctor(dokter.doctorAddress)}>
                  {`${dokter.doctorAddress}`}
                </Tag>
              </>
            ),
            // namaDokter: `${dokter.namaDokter}\n${dokter.doctorAddress}`,
            spesialisasi: dokter.spesialisasi,
            lokasiPraktik: dokter.lokasiPraktik,
            hari: schedule.hari,
            waktu: schedule.waktu,
            namaAsisten: (
              <div>
                <p>{schedule.namaAsisten}</p>
                <Tag color={getTagColorNurse(schedule.nurseAddress)}>
                  {`${schedule.nurseAddress}`}
                </Tag>
              </div>
            ),
            jabatanAsisten: schedule.jabatanAsisten,
            rowSpan: index === 0 ? dokter.jadwal.length : 0,
          });
        });
      });
      setDataSource(flattenedData);
    } catch (error) {
      console.error("Error fetching schedule data from IPFS:", error);
      message.error("Failed to fetch schedule data from IPFS.");
    }
  };

  useEffect(() => {
    if (schedulesData && schedulesData.scheduleCid) fetchDoctorSchedules();
    setSpinning(false);
  }, [schedulesData]);

  const columns = [
    {
      title: "No.",
      dataIndex: "key",
      key: "key",
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: { rowSpan: row.rowSpan },
        };
        return obj;
      },
    },
    {
      title: "Nama Dokter/Tenaga Medis",
      dataIndex: "namaDokter",
      key: "namaDokter",
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: { rowSpan: row.rowSpan },
        };
        return obj;
      },
    },
    {
      title: "Lokasi",
      dataIndex: "lokasiPraktik",
      key: "lokasiPraktik",
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: { rowSpan: row.rowSpan },
        };
        return obj;
      },
    },
    {
      title: "Poli/Ruangan",
      dataIndex: "spesialisasi",
      key: "spesialisasi",
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: { rowSpan: row.rowSpan },
        };
        return obj;
      },
    },
    {
      title: "Hari",
      dataIndex: "hari",
      key: "hari",
    },
    {
      title: "Jam",
      dataIndex: "waktu",
      key: "waktu",
    },
    {
      title: "Nama Asisten",
      dataIndex: "namaAsisten",
      key: "namaAsisten",
    },
    {
      title: "Jabatan Asisten",
      dataIndex: "jabatanAsisten",
      key: "jabatanAsisten",
    },
    // {
    //   title: "Perawat",
    //   dataIndex: "nurseAddress",
    //   key: "nurseAddress",
    //   render: (nurse) => <Tag color={getTagColorNurse(nurse)}>{nurse}</Tag>,
    // },
  ];

  // handle upload
  const handleUpload = async (file) => {
    try {
      if (file.type !== "application/json") { message.error("Hanya file JSON yang diperbolehkan."); return; }
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${CONN.BACKEND_LOCAL}/admin/schedule`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { cid } = await response.json();
        message.success(`${file.name} file uploaded successfully`);
        onScheduleCidUpdate(cid);
        fetchDoctorSchedules();
      } else message.error(`${file.name} file upload failed.`);
    } catch (error) {
      message.error(`${file.name} file upload failed.`);
      console.log({ error });
    }
  };

  // upload props
  const uploadProps = {
    beforeUpload: (file) => { handleUpload(file); return false; },
    showUploadList: false,
    multiple: false,
    accept: ".json",
  };

  return (
    <div className="grid w-full gap-y-4">
      <div className="flex justify-between">
        <div className="justify-self-start">
          <Upload {...uploadProps}>
            <Button type="default" icon={<UploadOutlined />}>Unggah Jadwal Dokter</Button>
          </Upload>
        </div>
        <div className="justify-self-end w-[150px]"></div>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        loading={spinning}
        size="middle"
        pagination={false}
      />
    </div>
  );
}

export default DoctorSchedule;
