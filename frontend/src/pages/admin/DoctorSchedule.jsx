import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Tag } from "antd";
import { useState, useEffect } from "react";
import { Table } from "antd";
import { create } from "ipfs-http-client";
import { CONN } from "../../../../enum-global";

// Membuat instance client IPFS
const ipfsClient = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http",
});

// Nurse tag color
const getTagColor = (address) => {
  const colorToAddress = {
    "0x2d761572fb2962d9a5c4D6DF34b120947bb3AbC1": "green",
    "0xe5dF08799114D618e628e2027fc8FF5B7F29705C": "blue",
    "0x7837Eb4C4388842335f8d51De5C003f2a5c42169": "red",
  };
  return colorToAddress[address];
};

function DoctorSchedule({ schedulesData }) {
  const [spinning, setSpinning] = React.useState(false);
  const [cid, setCid] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      setSpinning(true);
      try {
        const cid = schedulesData.scheduleCid;
        const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
        const ipfsResponse = await fetch(ipfsGatewayUrl);
        if (!ipfsResponse.ok) throw new Error("Failed to fetch from IPFS");
        const { doctors } = await ipfsResponse.json();
        let flattenedData = [];
        doctors.forEach((doctor) => {
          doctor.schedules.forEach((schedule, index) => {
            flattenedData.push({
              key: `${doctor.address}-${index}`,
              address: doctor.address,
              day: schedule.day,
              time: schedule.time,
              nurse: schedule.nurse,
              rowSpan: index === 0 ? doctor.schedules.length : 0,
            });
          });
        });
        setDataSource(flattenedData);
      } catch (error) {
        console.error("Error fetching schedule data from IPFS:", error);
        message.error("Failed to fetch schedule data from IPFS.");
      }
    };

    if (schedulesData && schedulesData.scheduleCid) {
      fetchScheduleData();
    }
    setSpinning(false);
  }, [schedulesData]);

  const showModal = () => setIsModalOpen(true);

  const columns = [
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {
            rowSpan: row.rowSpan,
          },
        };
        return obj;
      },
    },
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Nurse",
      dataIndex: "nurse",
      key: "nurse",
      render: (nurse) => <Tag color={getTagColor(nurse)}>{nurse}</Tag>,
    },
  ];

  // handle upload
  const handleUpload = async (file) => {
    try {
      if (file.type !== "application/json") {
        message.error("Hanya file JSON yang diperbolehkan.");
        return;
      }
      const added = await ipfsClient.add(file);
      setCid(added.path);
      await sendCidToBackend(cid);
      message.success(`${file.name} file uploaded successfully`);
    } catch (error) {
      message.error(`${file.name} file upload failed.`);
      console.error("Error uploading file: ", error);
    }
  };

  // upload props
  const uploadProps = {
    beforeUpload: (file) => {
      handleUpload(file);
      return false;
    },
    showUploadList: false,
    multiple: false,
    accept: ".json",
  };

  const sendCidToBackend = async (cid) => {
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/admin/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid }),
      });
      if (response.ok) {
        message.success("CID successfully sent to backend");
      } else {
        message.error("Failed to send CID to backend");
      }
    } catch (error) {
      console.error("Error sending CID to backend:", error);
      message.error("Error sending CID to backend");
    }
  };

  return (
    <div className="grid w-full gap-y-4">
      <div className="flex justify-between">
        <div className="justify-self-start">
          <Upload {...uploadProps}>
            <Button
              type="default"
              onClick={showModal}
              icon={<UploadOutlined />}
            >
              Unggah Jadwal Dokter
            </Button>
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
      />
    </div>
  );
}

export default DoctorSchedule;
