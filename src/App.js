import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import QueueDashboard from "./pages/QueueDashboard";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import Booking from "./pages/Booking"
import BookingDetails from "./pages/BookingDetails"
import Appointments from "./pages/Appointments"
import Availability from "./pages/Availability"
import OnlineConsult from "./pages/OnlineConsult"
import PatientRecords from "./pages/PatientRecords"
import Register from "./pages/Register"
import DoctorProfile from "./pages/DoctorProfile"
import ConsultationHistory from "./pages/ConsultationHistory"


function App() {
  return (
    <Router>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/queue" element={<QueueDashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<Help />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking-details" element={<BookingDetails />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/consult" element={<OnlineConsult />} />
        <Route path="/records" element={<PatientRecords />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor" element={<DoctorProfile />} />
        <Route path="/history" element={<ConsultationHistory />} />



      </Routes>

    </Router>
  );
}

export default App;