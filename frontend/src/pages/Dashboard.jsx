import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import './Dashboard.css';

function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    patientsToday: '--',
    inQueue: '--',
    appointments: '--',
  });
  const [message, setMessage] = useState('Clinic overview and quick stats are loading.');

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      try {
        const data = await apiRequest('/api/dashboard/stats', { token });

        if (ignore) {
          return;
        }

        setStats({
          patientsToday: data?.patientsToday ?? '--',
          inQueue: data?.inQueue ?? '--',
          appointments: data?.appointments ?? '--',
        });
        setMessage('Live dashboard stats are connected.');
      } catch {
        if (ignore) {
          return;
        }

        setStats({
          patientsToday: 0,
          inQueue: 0,
          appointments: 0,
        });
        setMessage('Using safe fallback values while backend dashboard stats are still being finalized.');
      }
    }

    loadStats();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <div>
      <Navbar activePage="dashboard" />

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Dashboard</h1>
        <p style={{ color: '#777', marginBottom: '1rem' }}>{message}</p>

        <div className="placeholder-cards">
          <div className="placeholder-card">
            <h3>Patients Today</h3>
            <p className="stat">{stats.patientsToday}</p>
          </div>
          <div className="placeholder-card">
            <h3>In Queue</h3>
            <p className="stat">{stats.inQueue}</p>
          </div>
          <div className="placeholder-card">
            <h3>Appointments</h3>
            <p className="stat">{stats.appointments}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
