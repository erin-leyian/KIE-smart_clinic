import { Link } from 'react-router-dom';

// simple 404 page for now
function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/login">Go back to login</Link>
    </div>
  );
}

export default NotFound;
