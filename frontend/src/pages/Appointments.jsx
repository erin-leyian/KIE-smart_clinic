import Navbar from '../components/Navbar';
import './Appointments.css';

function Appointments() {
  return (
    <div>
      <Navbar activePage="appointments" />

      <main className="appointments-container">
        <h1>Appointments</h1>
        <p className="page-description">
          Appointment scheduling and history will appear here.
        </p>

        <table className="appointments-table">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Patient</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" className="empty-row">
                No appointments yet.
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Appointments;
