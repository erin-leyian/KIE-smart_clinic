import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import DoctorDashboard from "./pages/Dashboard/DoctorDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import PatientRecords from "./pages/Dashboard/PatientRecords";
import OnlineConsult from "./pages/Dashboard/OnlineConsult";
import Profile from "./pages/Dashboard/Profile";
import CalendarView from "./pages/Dashboard/Calendar";
import Help from "./pages/Dashboard/Help";
import AllDoctors from "./pages/Dashboard/AllDoctors";
import AllAppointments from "./pages/Dashboard/AllAppointments";
import DoctorAppointments from "./pages/Dashboard/DoctorAppointments";
import NotificationHistory from "./pages/Dashboard/NotificationHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/doctors" element={<AllDoctors />} />
        <Route path="/dashboard/appointments" element={<AllAppointments />} />
        <Route path="/dashboard/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/dashboard/records" element={<PatientRecords />} />
        <Route path="/dashboard/consult" element={<OnlineConsult />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/calendar" element={<CalendarView />} />
        <Route path="/dashboard/help" element={<Help />} />
        <Route path="/dashboard/notifications" element={<NotificationHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
