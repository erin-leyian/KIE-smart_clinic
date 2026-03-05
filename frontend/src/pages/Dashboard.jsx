import Navbar from '../components/Navbar';
import './Dashboard.css';

function Dashboard() {
  return (
    <div>
      <Navbar activePage="dashboard" />

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Dashboard</h1>
        <p style={{ color: '#777', marginBottom: '1rem' }}>
          Clinic overview and quick stats will show up here.
        </p>

        {/* TODO: fetch real stats from the backend once the API is ready */}
        <div className="placeholder-cards">
          <div className="placeholder-card">
            <h3>Patients Today</h3>
            <p className="stat">--</p>
          </div>
          <div className="placeholder-card">
            <h3>In Queue</h3>
            <p className="stat">--</p>
          </div>
          <div className="placeholder-card">
            <h3>Appointments</h3>
            <p className="stat">--</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
