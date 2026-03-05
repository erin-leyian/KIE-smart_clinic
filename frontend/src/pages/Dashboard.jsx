import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="page-container">
      <nav className="page-nav">
        <span className="nav-brand">Smart Clinic</span>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/queue" className="nav-link">Queue</Link>
          <Link to="/login" className="nav-link">Logout</Link>
        </div>
      </nav>

      <main className="page-content">
        <h1>Dashboard</h1>
        <p className="placeholder-text">
          This is the Dashboard page. Clinic overview, stats, and quick actions will appear here.
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
