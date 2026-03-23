import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar({ activePage }) {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand">Smart Clinic</span>
      <div className="navbar-links">
        {role && <span className="role-pill">{role}</span>}
        <Link to="/dashboard" className={activePage === 'dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/queue" className={activePage === 'queue' ? 'active' : ''}>
          Queue
        </Link>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
