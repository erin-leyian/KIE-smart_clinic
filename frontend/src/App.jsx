import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Queue from './pages/Queue';
import NotFound from './pages/NotFound';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />

      {/* Main pages */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/queue" element={<Queue />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/settings" element={<Settings />} />

      {/* Future pages to be implemented later */}
      {/* <Route path="/appointments" element={<Appointments />} /> */}
      {/* <Route path="/patients" element={<Patients />} /> */}
      {/* <Route path="/settings" element={<Settings />} /> */}

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
