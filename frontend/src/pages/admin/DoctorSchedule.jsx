import React from "react";
import { useState, useEffect } from "react";
import { Button, Spin, Select } from "antd";
import { Table } from "antd";
import { CONN } from "../../../../enum-global";
import { doctors } from "../../data/doctorScheduleData";

function DoctorSchedule() {
  // const [spinning, setSpinning] = React.useState(false);
  const [fetchData, setFetchData] = useState(
    doctors.map((doc, index) => ({
      key: index,
      address: doc.address,
      schedules: doc.schedules
        .map((schedule) => `${schedule.day}: ${schedule.time}`)
        .join(", "),
    }))
  );
  // const showLoader = () => setSpinning(true);
  // const showModal = () => setIsModalOpen(true);

  // useEffect(() => {
  //   const fetchDataAsync = async () => {
  //     if (!token) {
  //       window.location.assign("/admin/signin");
  //       return;
  //     }
  //     setSpinning(true);
  //     try {
  //       const response = await fetch(
  //         `${CONN.BACKEND_LOCAL}/admin/dashboard?role=${role}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       const data = await response.json();
  //       setFetchData(data.data);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setSpinning(false);
  //     }
  //   };
  //   fetchDataAsync();
  // }, [role, token]);

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
    },
  ];

  return (
    <div className="grid w-full gap-y-4">
      <div className="flex justify-between">
        <div className="justify-self-start">
          {/* <Button type="default" onClick={showModal}>
            Add New
          </Button> */}
        </div>
        <div className="justify-self-end w-[150px]"></div>
      </div>
      <Table
        columns={columns}
        dataSource={fetchData}
        rowKey="key"
        // loading={spinning}
        size="middle"
      />
      {/* <Spin spinning={spinning} fullscreen /> */}
    </div>
  );
}

export default DoctorSchedule;
