import dayjs from "dayjs";
import { useState, useEffect } from "react";
import NavbarController from "../../components/Navbar/NavbarController";
import { DatePicker, Card, Col, Row, message, Button, Divider } from 'antd';
import { CONN } from "../../../../enum-global";

export default function StaffAntrean({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [queues, setQueues] = useState({ kia: [], tbparu: [], umum: [] });

  const sendSelectedDateToBackend = async (date) => {
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ selectedDate: date.format('YYYY-MM-DD') }),
      });
      const data = await response.json();
      if (response.ok) {
        setQueues(data.queues);
        console.log("Date sent successfully!");
      } else {
        console.error(`Failed to send date: ${data.error}`);
      }
    } catch (error) {
      console.error("Error sending date to backend:", error);
    }
  };

  const sendCurrentQueueToBackend = async (currentQueue, date) => {
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/next-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ currentQueue, selectedDate: date.format('YYYY-MM-DD') }),
      });
      if (!response.ok) {
        const data = await response.json();
        console.error(`Failed to send queue: ${data.error}`);
        // message.error(`Failed to send queue: ${data.error}`);
      } else {
        console.log("Queue sent successfully!");
      }
    } catch (error) {
      console.error("Error sending queue to backend:", error);
      // message.error("Error sending queue to backend");
    }
  };

  useEffect(() => {
    sendSelectedDateToBackend(dayjs(selectedDate));
  }, [token]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    sendSelectedDateToBackend(date);
  };

  const getSmallestQueue = (queue) => {
    return queue.length > 0 ? queue[0] : "-";
  };

  const handleNext = (poli) => {
    setQueues((prevQueues) => {
      const newQueues = { ...prevQueues };
      if (newQueues[poli].length > 0) {
        const currentQueue = newQueues[poli][0];
        sendCurrentQueueToBackend(currentQueue, dayjs(selectedDate));
        if (newQueues[poli].length > 1) {
          newQueues[poli].shift();
        }
      }
      return newQueues;
    });
  };

  const renderQueue = (poli) => {
    const currentQueue = queues[poli];
    const nextQueues = currentQueue.slice(1, 6);
    return (
      <>
        <div className="flex justify-between items-center">
          <h1 style={{ fontSize: '3em' }}>{getSmallestQueue(currentQueue)}</h1>
          <Button type="primary" ghost onClick={() => handleNext(poli)}>NEXT</Button>
        </div>
        <Divider />
        <ul>
          {nextQueues.map((queue, index) => (
            <li key={index}>{queue}</li>
          ))}
        </ul>
      </>
    );
  };

  let type = 4;
  return (
    <>
      <NavbarController type={type} page="antrean" color="blue" />
      <div>
        <div className="grid items-center justify-center w-4/5 grid-cols-1 pt-28 pb-16 mx-auto min-h-fit max-h-fit min-w-screen px-14 gap-x-8 gap-y-4 justify-center items-center">
          <div className="flex gap-x-4">
            <p>Pilih tanggal:</p>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              allowClear={false}
            />
          </div>
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Poli Umum (U)" bordered={false}>
                {queues && renderQueue('umum')}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Poli Kehamilan (K)" bordered={false}>
                {queues && renderQueue('kia')}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Poli TB Paru (P)" bordered={false}>
                {queues && renderQueue('tbparu')}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
