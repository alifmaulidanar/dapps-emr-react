import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { RequireAuth } from "./components/Utils/RequireAuth";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import PatientRecordList from "./pages/patient/PatientRecordList";
import PatientRecord from "./pages/patient/PatientRecord";
import PatientAppointmentList from "./pages/patient/PatientAppointmentList";

// global page routes
import UserAccount from "./pages/Account";
import UserProfile from "./pages/Profile";
import NakesPatientList from "./pages/NakesPatientList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PatientRecordDisplay from "./components/PatientRecordData";
import PatientAppointmentDetails from "./pages/patient/PatientAppointmentDetails";

function App() {
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

              {/* Admin */}
              <Route
                path="/admin/signin"
                element={
                  <SignIn
                    role="admin"
                    resetLink="/patient/reset-password"
                    signupLink="/patient/signup"
                  />
                }
              />
            </>

            {/* Routing Patient */}
            <>
              <Route
                path={`/patient/record-list`}
                element={<PatientRecordList />}
              />
              {/* <Route
                path={`/patient/record-list/record/:recordAddress`}
                element={<PatientRecord />}
              /> */}
              <Route
                path={`/patient/appointment`}
                element={<PatientAppointmentList role="patient" />}
              />
              <Route
                path={`/patient/appointment/details`}
                element={<PatientAppointmentDetails role="patient" />}
              />
              <Route
                path={`/patient/profile`}
                element={<UserProfile role="patient" />}
              />
              <Route
                path={`/patient/account`}
                element={<UserAccount role="patient" />}
              />
            </>

            {/* Routing Doctor */}
            <>
              <Route
                path={`/doctor/patient-list`}
                element={<NakesPatientList role="doctor" />}
              />
              {/* <Route
              path={`/doctor/record-list/record/:recordAddress`}
              element={<PatientRecord />}
            /> */}
              <Route
                path={`/doctor/profile`}
                element={<UserProfile role="doctor" />}
              />
              <Route
                path={`/doctor/account`}
                element={<UserAccount role="doctor" />}
              />
            </>

            {/* Routing Nurse */}
            <>
              <Route
                path={`/nurse/patient-list`}
                element={<NakesPatientList role="nurse" />}
              />
              <Route
                path={`/nurse/record-list/record/:recordAddress`}
                element={<PatientRecord />}
              />
              <Route
                path={`/nurse/appointment`}
                element={<PatientAppointmentList />}
              />
              <Route
                path={`/nurse/profile`}
                element={<UserProfile role="nurse" />}
              />
              <Route
                path={`/nurse/account`}
                element={<UserAccount role="nurse" />}
              />
            </>

            {/* Routing Staff */}
            <>
              <Route
                path={`/staff/patient-list`}
                element={<NakesPatientList role="staff" />}
              />
              <Route
                path={`/staff/appointment`}
                element={<PatientAppointmentList />}
              />
              <Route
                path={`/staff/profile`}
                element={<UserProfile role="staff" />}
              />
              <Route
                path={`/staff/account`}
                element={<UserAccount role="staff" />}
              />
            </>

            {/* Routing Admin */}
            <>
              <Route
                path={`/admin/dashboard`}
                element={<AdminDashboard role="staff" />}
              />
              <Route
                path={`/staff/appointment`}
                element={<PatientAppointmentList />}
              />
              <Route
                path={`/staff/profile`}
                element={<UserProfile role="staff" />}
              />
              <Route
                path={`/staff/account`}
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
