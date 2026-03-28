import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import PatientRecords from './pages/PatientRecords';
import MyAvailability from './pages/MyAvailability';
import OnlineConsult from './pages/OnlineConsult';
import Help from './pages/Help';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/patient-records" element={<PatientRecords />} />
            <Route path="/my-availability" element={<MyAvailability />} />
            <Route path="/online-consult" element={<OnlineConsult />} />
            <Route path="/help" element={<Help />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
