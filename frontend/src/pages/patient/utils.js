import { CONN } from "../../../../enum-global";

export const fetchAndStorePatientData = async (token, accountAddress, setAppointmentsData, setPatientAccountData) => {
  try {
    const response = await fetch(
      `${CONN.BACKEND_LOCAL}/patient/account`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    const data = await response.json();
    // console.log({ data });
    setAppointmentsData(data.appointments);
    setPatientAccountData(data);
    sessionStorage.setItem("appointmentData", JSON.stringify(data.appointments));
    sessionStorage.setItem("userData", JSON.stringify(data.ipfs.data));
  } catch (error) {
    console.error("Error fetching patient data:", error);
  }
};