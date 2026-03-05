import Navbar from '../components/Navbar';
import './Queue.css';

function Queue() {
  return (
    <div>
      <Navbar activePage="queue" />

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Patient Queue</h1>
        <p style={{ color: '#777', marginBottom: '1rem' }}>
          The live patient queue will show here once the backend is connected.
        </p>

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
                No patients in queue yet.
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Queue;
