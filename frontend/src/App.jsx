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
import DoctorPelayananMedis from "./pages/doctor/DoctorPelayananMedis";
import NursePatientList from "./pages/nurse/NursePatientList";
import NursePelayananMedis from "./pages/nurse/NursePelayananMedis";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatientDetails from "./pages/admin/AdminPatientDetails";
import PatientAppointmentDetails from "./pages/patient/PatientAppointmentDetails";
import Antrean from "./pages/Antrean";
import StaffPatientList from "./pages/staff/StaffPatientList";
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
                path={`/doctor/antrean`}
                element={<Antrean role="doctor" />}
              />
              <Route
                path={`/doctor/data-pasien`}
                element={<DoctorPatientList role="doctor" />}
              />
              <Route
                path={`/doctor/pelayanan-medis`}
                element={<DoctorPelayananMedis role="doctor" />}
              />
              <Route
                path={`/doctor/pelayanan-medis/detail-pasien`}
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
                path={`/nurse/antrean`}
                element={<Antrean role="nurse" />}
              />
              <Route
                path={`/nurse/data-pasien`}
                element={<NursePatientList role="nurse" />}
              />
              <Route
                path={`/nurse/pelayanan-medis`}
                element={<NursePelayananMedis role="nurse" />}
              />
              <Route
                path={`/nurse/pelayanan-medis/patient-details`}
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
                path={`/staff/antrean`}
                element={<Antrean role="staff" />}
              />
              <Route
                path={`/staff/data-pasien`}
                element={<StaffPatientList role="staff" />}
              />
              <Route
                path={`/staff/pelayanan-medis`}
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
                path={`/admin/antrean`}
                element={<Antrean role="admin" />}
              />
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
                element={<AdminDashboard role="admin" />}
              />
              <Route
                path={`/admin/pelayanan-medis/detail-pasien`}
                element={<AdminPatientDetails role="admin" />}
              />
            </>
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
