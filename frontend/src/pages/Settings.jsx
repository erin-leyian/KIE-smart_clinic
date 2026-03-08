import Navbar from '../components/Navbar';
import './Settings.css';

function Settings() {
  return (
    <div>
      <Navbar activePage="settings" />

      <main className="settings-container">
        <h1>Settings</h1>

        <p className="page-description">
          Clinic configuration settings will appear here.
        </p>

        <div className="settings-card">
          <p>SMS Notification Settings</p>
          <p>Language Preferences</p>
          <p>Clinic Working Hours</p>
        </div>
      </main>
    </div>
  );
}

export default Settings;
