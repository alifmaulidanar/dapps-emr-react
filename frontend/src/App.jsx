import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import PatientRecordList from "./pages/patient/PatientRecordList";
import PatientRecord from "./pages/patient/PatientRecord";
import PatientAppointment from "./pages/patient/PatientAppointment";

// global page routes
import UserAccount from "./pages/Account";
import UserProfile from "./pages/Profile";
import NakesPatientList from "./pages/NakesPatientList";

function App() {
  const role = {
    patient: "patient",
    doctor: "doctor",
    staff: "staff",
    nurse: "nurse",
  };

  return (
    <>
      <Router>
        <div className="w-full max-w-full min-h-screen mx-auto bg-white shadow-lg h-content shadow-primary/40">
          <Routes>
            {/* Area Tamu */}
            <>
              <Route path="/" element={<Home />} />
              <Route
                path="/patient/signin"
                element={
                  <SignIn
                    role="patient"
                    resetLink="/patient/reset-password"
                    signupLink="/patient/signup"
                  />
                }
              />
              <Route
                path="/patient/signup"
                element={<SignUp role="patient" />}
              />
              <Route
                path="/doctor/signin"
                element={
                  <SignIn
                    role="doctor"
                    resetLink="/doctor/reset-password"
                    signupLink="/doctor/signup"
                  />
                }
              />
              <Route path="/doctor/signup" element={<SignUp role="doctor" />} />
              <Route
                path="/staff/signin"
                element={
                  <SignIn
                    role="staff"
                    resetLink="/staff/reset-password"
                    signupLink="/staff/signup"
                  />
                }
              />
              <Route path="/staff/signup" element={<SignUp role="staff" />} />
              <Route
                path="/nurse/signin"
                element={
                  <SignIn
                    role="nurse"
                    resetLink="/nurse/reset-password"
                    signupLink="/nurse/signup"
                  />
                }
              />
              <Route path="/nurse/signup" element={<SignUp role="nurse" />} />
            </>

            {/* Routing Patient */}
            <>
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
                element={<UserProfile role="patient" />}
              />
              <Route
                path={`/patient/:accountAddress/account`}
                element={<UserAccount role="patient" />}
              />
            </>

            {/* Routing Doctor */}
            <>
              <Route
                path={`/doctor/:accountAddress/patient-list`}
                element={<NakesPatientList role="doctor" />}
              />
              {/* <Route
              path={`/doctor/:accountAddress/record-list/record/:recordAddress`}
              element={<PatientRecord />}
            /> */}
              <Route
                path={`/doctor/:accountAddress/profile`}
                element={<UserProfile role="doctor" />}
              />
              <Route
                path={`/doctor/:accountAddress/account`}
                element={<UserAccount role="doctor" />}
              />
            </>

            {/* Routing Nurse */}
            <>
              <Route
                path={`/nurse/:accountAddress/patient-list`}
                element={<NakesPatientList role="nurse" />}
              />
              <Route
                path={`/nurse/:accountAddress/record-list/record/:recordAddress`}
                element={<PatientRecord />}
              />
              <Route
                path={`/nurse/:accountAddress/appointment`}
                element={<PatientAppointment />}
              />
              <Route
                path={`/nurse/:accountAddress/profile`}
                element={<UserProfile role="nurse" />}
              />
              <Route
                path={`/nurse/:accountAddress/account`}
                element={<UserAccount role="nurse" />}
              />
            </>

            {/* Routing Staff */}
            <>
              <Route
                path={`/staff/:accountAddress/record-list`}
                element={<NakesPatientList role="staff" />}
              />
              <Route
                path={`/staff/:accountAddress/appointment`}
                element={<PatientAppointment />}
              />
              <Route
                path={`/staff/:accountAddress/profile`}
                element={<UserProfile role="staff" />}
              />
              <Route
                path={`/staff/:accountAddress/account`}
                element={<UserAccount role="staff" />}
              />
            </>
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
