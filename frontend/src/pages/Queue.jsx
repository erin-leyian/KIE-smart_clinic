import { Link } from 'react-router-dom';
import './Queue.css';

function Queue() {
  return (
    <div className="page-container">
      <nav className="page-nav">
        <span className="nav-brand">Smart Clinic</span>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/queue" className="nav-link active">Queue</Link>
          <Link to="/login" className="nav-link">Logout</Link>
        </div>
      </nav>

      <main className="page-content">
        <h1>Patient Queue</h1>
        <p className="placeholder-text">
          This is the Queue page. The real-time patient queue and check-in controls will appear here.
        </p>

        <div className="queue-placeholder">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Patient Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="empty-row">
                  No patients in queue — data will load once the backend is connected.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Queue;
