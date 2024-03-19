/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, Tag } from "antd";
import { Table } from "antd";
import { CONN } from "../../../../enum-global";

// Nurse tag color
const getTagColor = (address) => {
  const colorToAddress = {
    "0x2d761572fb2962d9a5c4D6DF34b120947bb3AbC1": "green",
    "0xe5dF08799114D618e628e2027fc8FF5B7F29705C": "blue",
    "0x7837Eb4C4388842335f8d51De5C003f2a5c42169": "red",
  };
  return colorToAddress[address];
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
      dokter.forEach((dokter) => {
        dokter.jadwal.forEach((schedule, index) => {
          flattenedData.push({
            key: dokter.idDokter,
            alamatDokter: dokter.alamatDokter,
            namaDokter: dokter.namaDokter,
            spesialisasiDokter: dokter.spesialisasiDokter,
            lokasiPraktik: dokter.lokasiPraktik,
            hari: schedule.hari,
            waktu: schedule.waktu,
            alamatPerawat: schedule.alamatPerawat,
            namaPerawat: schedule.namaPerawat,
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
      title: "Nama",
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
      title: "Alamat Dokter",
      dataIndex: "alamatDokter",
      key: "alamatDokter",
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
      title: "Spesialis",
      dataIndex: "spesialisasiDokter",
      key: "spesialisasiDokter",
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
      title: "Perawat",
      dataIndex: "namaPerawat",
      key: "namaPerawat",
    },
    {
      title: "Perawat",
      dataIndex: "alamatPerawat",
      key: "alamatPerawat",
      render: (nurse) => <Tag color={getTagColor(nurse)}>{nurse}</Tag>,
    },
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
      />
    </div>
  );
}

export default DoctorSchedule;
