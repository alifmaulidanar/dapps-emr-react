import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import PatientRecordList from "./pages/patient/PatientRecordList";
import PatientRecord from "./pages/patient/PatientRecord";
import PatientAppointment from "./pages/patient/PatientAppointment";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientAccount from "./pages/patient/PatientAccount";
import DoctorPatientList from "./pages/doctor/DoctorPatientList";
import DoctorProfile from "./pages/doctor/DoctorProdile";
import DoctorAccount from "./pages/doctor/Doctor.Account";

function App() {
  return (
    <>
      <Router>
        <div className="w-full max-w-full min-h-screen mx-auto bg-white shadow-lg h-content shadow-primary/40">
          <Routes>
            {/* Area Tamu */}
            <Route path="/" element={<Home />} />
            <Route
              path="/patient/signin"
              element={
                <SignIn
                  role="Pasien"
                  resetLink="/patient/reset-password"
                  signupLink="/patient/signup"
                />
              }
            />
            <Route path="/patient/signup" element={<SignUp role="Pasien" />} />
            <Route
              path="/doctor/signin"
              element={
                <SignIn
                  role="Dokter"
                  resetLink="/doctor/reset-password"
                  signupLink="/doctor/signup"
                />
              }
            />
            <Route path="/doctor/signup" element={<SignUp role="Dokter" />} />

            {/* Area Pasien */}
            <Route
              path={`/patient/:accountAddress/record-list`}
              element={<PatientRecordList />}
            />
            <Route
              path={`/patient/:accountAddress/record-list/record/:recordAddress`}
              element={<PatientRecord />}
            />
            <Route
              path={`/patient/:accountAddress/appointment`}
              element={<PatientAppointment />}
            />
            <Route
              path={`/patient/:accountAddress/profile`}
              element={<PatientProfile />}
            />
            <Route
              path={`/patient/:accountAddress/account`}
              element={<PatientAccount />}
            />

            {/* Area Dokter */}
            <Route
              path={`/doctor/:accountAddress/patient-list`}
              element={<DoctorPatientList />}
            />
            {/* <Route
              path={`/doctor/:accountAddress/record-list/record/:recordAddress`}
              element={<PatientRecord />}
            /> */}
            <Route
              path={`/doctor/:accountAddress/profile`}
              element={<DoctorProfile />}
            />
            <Route
              path={`/doctor/:accountAddress/account`}
              element={<DoctorAccount />}
            />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
