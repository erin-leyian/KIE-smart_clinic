import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import './Queue.css';

function Queue() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('Loading queue from backend...');

  useEffect(() => {
    let ignore = false;

    async function loadQueue() {
      try {
        const queueTokens = await apiRequest('/api/queue_tokens', { token });
        const list = Array.isArray(queueTokens) ? queueTokens : queueTokens?.data || [];

        if (ignore) {
          return;
        }

        setRows(list);
        setMessage(list.length > 0 ? 'Live queue is connected.' : 'No patients in queue right now.');
      } catch {
        if (ignore) {
          return;
        }

        setRows([]);
        setMessage('Queue endpoint not ready yet, showing empty state safely.');
      }
    }

    loadQueue();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <div>
      <Navbar activePage="queue" />

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Patient Queue</h1>
        <p style={{ color: '#777', marginBottom: '1rem' }}>{message}</p>

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
            {rows.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">
                  No patients in queue yet.
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id || item.token || `${item.patient_name}-${item.status}`}>
                  <td>{item.token || item.queue_token || '-'}</td>
                  <td>{item.patient_name || item.patientName || '-'}</td>
                  <td>{item.status || 'waiting'}</td>
                  <td>
                    <button type="button" className="row-action-btn" disabled>
                      Next Week
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Queue;
