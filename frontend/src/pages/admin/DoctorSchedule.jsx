import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
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

function DoctorSchedule({ schedulesData }) {
  const [spinning, setSpinning] = React.useState(false);
  const [cid, setCid] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      setSpinning(true);
      try {
        const cid = schedulesData.scheduleCid;
        const ipfsGatewayUrl = `${CONN.IPFS_LOCAL}/${cid}`;
        const ipfsResponse = await fetch(ipfsGatewayUrl);
        if (!ipfsResponse.ok) throw new Error("Failed to fetch from IPFS");
        const { doctors } = await ipfsResponse.json();
        if (!Array.isArray(doctors))
          throw new Error("Data format is incorrect");
        setScheduleData(doctors);
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
      title: "No.",
      dataIndex: "key",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Schedules",
      dataIndex: "schedules",
      key: "schedules",
      render: (schedules) =>
        schedules.map((schedule, index) => (
          <div key={index}>{`${schedule.day}: ${schedule.time}`}</div>
        )),
    },
  ];

  const dataSource = scheduleData.map((doc, index) => ({
    key: index,
    address: doc.address,
    schedules: doc.schedules,
  }));

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
