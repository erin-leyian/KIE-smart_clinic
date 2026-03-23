import { Link } from 'react-router-dom';

function Unauthorized() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', padding: '0 1rem' }}>
      <h1>Access Restricted</h1>
      <p style={{ color: '#666', margin: '0.75rem 0 1.2rem' }}>
        Your account does not have permission to view that page.
      </p>
      <Link to="/queue">Go to allowed page</Link>
    </div>
  );
}

export default Unauthorized;
