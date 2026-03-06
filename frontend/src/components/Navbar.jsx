import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ activePage }) {
  return (
    <nav className="navbar">
      <span className="navbar-brand">Smart Clinic</span>
      <div className="navbar-links">
        <Link to="/dashboard" className={activePage === 'dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/queue" className={activePage === 'queue' ? 'active' : ''}>
          Queue
        </Link>
        <Link to="/login">Logout</Link>
      </div>
    </nav>
  );
}

export default Navbar;
