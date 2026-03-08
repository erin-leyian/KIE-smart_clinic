import Navbar from '../components/Navbar';
import './Patients.css';

function Patients() {
  return (
    <div>
      <Navbar activePage="patients" />

      <main className="patients-container">
        <h1>Patients</h1>
        <p className="page-description">
          Patient records will appear here once connected to the backend.
        </p>

        <table className="patients-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="3" className="empty-row">
                No patient data yet.
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Patients;
