import { useState, useEffect } from "react";
import { Form, Collapse, Empty } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import "sweetalert2/dist/sweetalert2.min.css";
import { CONN } from "../../../../enum-global";
import PatientRecordDisplay from "../../components/PatientRecordData";
import { FormatDateDash } from "../../components/utils/Formating";

export default function PatientRME({ dmrNumber, userDataProps, userAccountData = null, userData }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");
  const [form] = Form.useForm();
  const [initialData, setInitialData] = useState({});
  const [scheduleData, setScheduleData] = useState([]);
  const chosenPatient = userData.profile;
  let records = userData.appointments;

  useEffect(() => {
    if (token && accountAddress) {
      const fetchDataAsync = async () => {
        try {
          const responseAppointment = await fetch(
            `${CONN.BACKEND_LOCAL}/${userAccountData.role}/appointment`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          const dataAppointment = await responseAppointment.json();
          setScheduleData(dataAppointment.dokter);
        } catch (error) {
          console.error(`Error fetching ${role} data:`, error);
        }
      };
      fetchDataAsync();
    }
  }, []);

  let role;
  if (userAccountData === null) {
    role = "Pasien";
  } else {
    switch (userAccountData.role) {
      case "patient":
        role = "Pasien";
        break;
      case "doctor":
        role = "Dokter";
        break;
      case "staff":
        role = "Staff";
        break;
      case "nurse":
        role = "Perawat";
        break;
    }
  }

  const dateFormat = "YYYY-MM-DD";

  useEffect(() => {
    // Simpan data awal ke state
    const initialFormData = {
      ...userDataProps,
      newDmrNumber: userDataProps.dmrNumber,
      tanggalLahir: userDataProps.tanggalLahir
        ? dayjs(userDataProps.tanggalLahir, dateFormat)
        : null,
      tanggalLahirKerabat: userDataProps.tanggalLahirKerabat
        ? dayjs(userDataProps.tanggalLahirKerabat, dateFormat)
        : null,
    };
    setInitialData(initialFormData);
    form.setFieldsValue(initialFormData);
  }, [userDataProps, form]);

  records = records.filter(record => record.selesai);
  console.log({records})
  return (
    <>
      <div className="grid gap-y-8 p-8 text-left">
        <h2 className="text-xl font-medium text-center">Riwayat Pelayanan</h2>
        <div className="text-left">
          {records.length > 0 ? (
            <Collapse defaultActiveKey={0} size="large" >
              {records.map((record, index) => (
                <Collapse.Panel
                  className="text-left"
                  style={{ textAlign: 'left' }}
                  header={`No. 1 / ${record.appointmentId} / ${record.selesai.judulRekamMedis} / ${FormatDateDash(record.selesai.selesaiCreatedAt)} / ${record.faskesTujuan}`}
                  key={index}>
                  <PatientRecordDisplay record={record} chosenPatient={chosenPatient} />
                </Collapse.Panel>
              ))}
            </Collapse>
          ) : (
            <Empty description="Tidak ada riwayat pelayanan yang ditemukan." />
          )}
        </div>
      </div>
    </>
  );
}
