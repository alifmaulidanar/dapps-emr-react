import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { RequireAuth } from "./components/Utils/RequireAuth";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import SignInPatient from "./pages/SignInPatient";
import PatientRecordList from "./pages/patient/PatientRecordList";
import PatientRecord from "./pages/patient/PatientRecordDetails";
import PatientAppointmentList from "./pages/patient/PatientAppointmentList";
import DoctorPatientDetails from "./pages/doctor/DoctorPatientDetails";
import NursePatientDetails from "./pages/nurse/NursePatientDetails";

// global page routes
import UserAccount from "./pages/Account";
import PatientAccount from "./pages/AccountPatient";
import UserProfile from "./pages/Profile";
import DoctorPatientList from "./pages/doctor/DoctorPatientList";
import NursePatientList from "./pages/nurse/NursePatientList";
import StaffPatientList from "./pages/staff/StaffPatientList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PatientAppointmentDetails from "./pages/patient/PatientAppointmentDetails";
import StaffPelayananMedis from "./pages/staff/StaffPelayananMedis";

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
                  <SignInPatient
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
            </>

            {/* Routing Patient */}
            <>
              <Route
                path={`/patient/record-list`}
                element={<PatientRecordList />}
              />
              <Route
                path={`/patient/record-list/details/`}
                element={<PatientRecord />}
              />
              <Route
                path={`/patient/appointment-list`}
                element={<PatientAppointmentList role="patient" />}
              />
              <Route
                path={`/patient/appointment-list/details`}
                element={<PatientAppointmentDetails role="patient" linkToPage={"/patient/appointment-list"} />}
              />
              <Route
                path={`/patient/profile`}
                element={<UserProfile role="patient" />}
              />
              <Route
                path={`/patient/account`}
                element={<PatientAccount />}
              />
            </>

            {/* Routing Doctor */}
            <>
              <Route
                path={`/doctor/patient-list`}
                element={<DoctorPatientList role="doctor" />}
              />
              <Route
                path={`/doctor/patient-list/patient-details`}
                element={<DoctorPatientDetails role="doctor" />}
              />
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
                element={<NursePatientList role="nurse" />}
              />
              <Route
                path={`/nurse/patient-list/patient-details`}
                element={<NursePatientDetails role="nurse" />}
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
                element={<StaffPatientList role="staff" />}
              />
              <Route
                path={`/staff/appointment-list`}
                element={<StaffPelayananMedis role="staff" />}
              />
              <Route
                path={`/staff/account`}
                element={<UserAccount role="staff" />}
              />
            </>

            {/* Routing Admin */}
            <>
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
              <Route
                path={`/admin/dashboard`}
                element={<AdminDashboard role="staff" />}
              />
            </>
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
