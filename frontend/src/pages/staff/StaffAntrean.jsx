import React, { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import { Card, Col, Row } from 'antd';
import { CONN } from "../../../../enum-global";

export default function StaffAntrean({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/patient-data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
        const data = await response.json();
        if (!response.ok) console.log(data.error, data.message);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [token]);

  let type = 4;
  return (
    <>
      <NavbarController type={type} page="antrean" color="blue" />
      <div>
        <div className="grid items-center justify-center w-4/5 grid-cols-1 pt-28 pb-16 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4">
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Poli Umum (U)" bordered={false}>
                Card content
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Poli Kehamilan (K)" bordered={false}>
                Card content
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Poli TB Paru (P)" bordered={false}>
                Card content
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
