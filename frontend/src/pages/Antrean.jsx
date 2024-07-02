import dayjs from "dayjs";
import { useState, useEffect } from "react";
import NavbarController from "../components/Navbar/NavbarController";
import { DatePicker, Card, Col, Row, message, Button, Divider, Statistic } from 'antd';
import { CONN } from "../../../enum-global";

export default function Antrean({ role }) {
  let token;
  if (role !== "admin") {
    token = sessionStorage.getItem("userToken");
  } else {
    token = localStorage.getItem("adminToken");
  }
  const accountAddress = sessionStorage.getItem("accountAddress");
  if (!token || !accountAddress) window.location.assign(`/${role}/signin`);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [queues, setQueues] = useState({ kia: [], tbparu: [], umum: [] });
  const [stats, setStats] = useState({
    total: 0,
    perPoli: { kia: 0, tbparu: 0, umum: 0 },
    called: 0,
    notCalled: 0,
    perPoliCalled: { kia: 0, tbparu: 0, umum: 0 },
    perPoliNotCalled: { kia: 0, tbparu: 0, umum: 0 }
  });

  const sendSelectedDateToBackend = async (date) => {
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/${role}/queue`, {
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
        setStats(data.stats);
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
      const response = await fetch(`${CONN.BACKEND_LOCAL}/${role}/next-queue`, {
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
      } else {
        console.log("Queue sent successfully!");
      }
    } catch (error) {
      console.error("Error sending queue to backend:", error);
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
        newQueues[poli].shift();
        if (newQueues[poli].length === 0) {
          newQueues[poli].push("-");
        }
        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          called: prevStats.called + 1,
          notCalled: prevStats.notCalled - 1,
          perPoliCalled: {
            ...prevStats.perPoliCalled,
            [poli]: (prevStats.perPoliCalled[poli] || 0) + 1
          },
          perPoliNotCalled: {
            ...prevStats.perPoliNotCalled,
            [poli]: (prevStats.perPoliNotCalled[poli] || 0) - 1
          }
        }));
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
          <Button type="primary" ghost onClick={() => handleNext(poli)}>Selanjutnya</Button>
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
  switch (role) {
    case 'doctor':
      type = 2;
      break;
    case 'nurse':
      type = 3;
      break;
    case 'staff':
      type = 4;
      break;
    default:
      break;
  }

  return (
    <>
      <NavbarController type={type} page="antrean" color="blue" />
      <div className="grid items-center justify-center w-4/5 grid-cols-1 pt-24 pb-12 mx-auto min-h-fit max-h-screen min-w-screen px-14 gap-x-8 gap-y-4 justify-center items-center">
        <div className="flex gap-x-4">
          <p>Pilih tanggal:</p>
          <DatePicker
            value={dayjs(selectedDate)}
            onChange={handleDateChange}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </div>

        {/* QUEUE */}
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

        {/* STATS */}
        <Row gutter={16}>
          <Col span={8}>
            <Card bordered={true}>
              <Statistic title="Total Pasien" value={stats.total} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={true}>
              <Statistic title="Belum Dipanggil" value={stats.notCalled} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={true}>
              <Statistic title="Sudah Dipanggil" value={stats.called} />
            </Card>
          </Col>
        </Row>
        <Row gutter={16} className="mb-4">
          <Col span={8}>
            <Card bordered={true}>
              <Statistic title="Poli Umum (U)" value={stats.perPoli.umum || 0} />
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Belum Dipanggil" value={stats.perPoliNotCalled.umum || 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Sudah Dipanggil" value={stats.perPoliCalled.umum || 0} />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={true}>
              <Statistic title="Poli Kehamilan (K)" value={stats.perPoli.kia || 0} />
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Belum Dipanggil" value={stats.perPoliNotCalled.kia || 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Sudah Dipanggil" value={stats.perPoliCalled.kia || 0} />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={true}>
              <Statistic title="Poli TB Paru (P)" value={stats.perPoli.tbparu || 0} />
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Belum Dipanggil" value={stats.perPoliNotCalled.tbparu || 0} />
                </Col>
                <Col span={12}>
                  <Statistic title="Sudah Dipanggil" value={stats.perPoliCalled.tbparu || 0} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
