import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import PatientRecords from "./pages/Dashboard/PatientRecords";
import OnlineConsult from "./pages/Dashboard/OnlineConsult";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/records" element={<PatientRecords />} />
        <Route path="/dashboard/consult" element={<OnlineConsult />} />
      </Routes>
    </Router>
  );
}

export default App;
