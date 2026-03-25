import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, User, HelpCircle, LogOut, FileText, Video, Bell, ChevronDown } from 'lucide-react';
import cx from 'classnames';
import { toast } from 'react-hot-toast';
import { TRANSLATIONS } from '../utils/translations';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [language, setLanguage] = useState('English (US)');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleShortcuts = (e) => {
      if (e.altKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        switch (e.key.toLowerCase()) {
          case 'd': navigate('/dashboard'); break;
          case 'p': navigate('/patient-records'); break;
          case 'a': navigate('/my-availability'); break;
          case 'o': navigate('/online-consult'); break;
          case 'u': navigate('/profile'); break;
          case 'h': navigate('/help'); break;
        }
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [navigate]);

  const [currentUser, setCurrentUser] = useState({
    name: 'Stevan dux',
    email: 'stevan.dux@gmail.com',
    role: 'Admin',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150'
  });

  const alternateUser = {
    name: 'Amanda Clara',
    email: 'amanda.clara@hospital.rw',
    role: 'Head Doctor',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop'
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return t.dashboard;
      case '/calendar': return 'Calendar';
      case '/profile': return t.profile;
      case '/patient-records': return t.patientRecords;
      case '/my-availability': return t.availability;
      case '/online-consult': return t.onlineConsult;
      case '/help': return t.help;
      default: return 'QueueCare';
    }
  };

  const menuItems = [
    { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard },
    { name: t.patientRecords, path: '/patient-records', icon: FileText },
    { name: t.availability, path: '/my-availability', icon: Calendar },
    { name: t.onlineConsult, path: '/online-consult', icon: Video },
    { name: t.profile, path: '/profile', icon: User },
    { name: t.help, path: '/help', icon: HelpCircle },
  ];

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    toast.success(`Language updated to ${e.target.value}.`);
  };

  const handleSwitchUser = () => {
    const nextUser = currentUser.name === 'Stevan dux' ? alternateUser : {
      name: 'Stevan dux',
      email: 'stevan.dux@gmail.com',
      role: 'Admin',
      img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150'
    };
    setCurrentUser(nextUser);
    toast.success(`Successfully switched account to ${nextUser.name}`);
    setUserMenuOpen(false);
  };

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    { id: 1, doctor: 'Habimana Jean', day: 'Fri', date: '14', time: '10:00am - 10:30am', color: '#EF4444', bg: '#FFF1F2' },
    { id: 2, doctor: 'Uwase Solange', day: 'Sat', date: '15', time: '10:00am - 10:30am', color: 'var(--text-main)', bg: '#F3F4F6' }
  ]);

  const handleLogout = () => {
    toast.success(t.logout);
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="brand-logo" style={{ marginBottom: '32px' }}>
          {/* Logo removed */}
        </div>

        <nav className="nav-links">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cx('nav-item', { active: isActive })}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 20px 32px' }}>
          <button
            className="nav-item"
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
            onClick={handleLogout}
          >
            {t.logout}
          </button>
        </div>
      </aside>

      <main className="page-content">
        <header className="top-header">
          <div className="page-title">
            <p>Hi, {currentUser.name}</p>
            <h1>{getPageTitle()}</h1>
          </div>

          <div className="header-actions">
            <div>
              <select
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '4px', outline: 'none', cursor: 'pointer', background: 'transparent', border: 'none', fontWeight: 500, color: 'var(--text-main)' }}
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="English (US)">English (US)</option>
                <option value="Spanish (ES)">Spanish (ES)</option>
                <option value="French (FR)">French (FR)</option>
                <option value="German (DE)">German (DE)</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <button className="nav-item" style={{ padding: '8px', border: 'none', background: 'transparent' }} onClick={() => setNotifOpen(!notifOpen)}>
                Notifications
                <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }}></div>
              </button>

              {notifOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px',
                  width: '300px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100
                }}>
                  <h4 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '12px', color: 'var(--text-main)' }}>Notifications</h4>
                  {upcomingAppointments.map((appt, i) => i === 0 && (
                    <div key={appt.id} style={{ fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--primary)' }}>{t.newBooking}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Upcoming with {appt.doctor} on {appt.day} {appt.date}</div>
                    </div>
                  ))}
                  <div style={{ fontSize: '14px' }}>
                    <strong>System Update</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Welcome back, {currentUser.name.split(' ')[0]}!</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                className="user-profile"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', padding: '4px 8px', borderRadius: 'var(--radius-md)' }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setUserMenuOpen(false);
                }}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <img
                  src={currentUser.img}
                  alt="Profile"
                  className="user-avatar"
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.2 }}>{currentUser.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentUser.email}</span>
                </div>
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px',
                    width: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100
                  }}
                  onKeyDown={(e) => e.key === 'Escape' && setUserMenuOpen(false)}
                >
                  <button
                    onClick={handleSwitchUser}
                    style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', borderRadius: '4px', fontSize: '14px', marginBottom: '4px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {t.switchUser}
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', borderRadius: '4px', fontSize: '14px', color: '#EF4444', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <Outlet context={{ t, upcomingAppointments, setUpcomingAppointments }} />
      </main>
    </div>
  );
}
