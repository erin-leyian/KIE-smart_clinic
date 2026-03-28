const API_URL = 'https://kie-smart-clinic.onrender.com';

const getToken = () => localStorage.getItem('token');

export const api = {
  // Auth
  login: (email, password) =>
    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  // Appointments
  getAppointments: () =>
    fetch(`${API_URL}/api/appointments`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.json()),

  createAppointment: (data) =>
    fetch(`${API_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Queue
  getQueue: () =>
    fetch(`${API_URL}/api/queue`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.json()),
};

export default api;
