# QueueCare Frontend

This is the frontend for the QueueCare Smart Clinic application, built with React and Tailwind CSS. Currently, it uses a mock JSON file for dynamic updates and previews.

## Application Architecture
- `src/pages/Auth.jsx`: Handles Login and Registration flow.
- `src/pages/Home/`: Landing page showcasing recommended doctors.
- `src/pages/Dashboard/`: Main dashboard application routes (Calendar, Profile, Records, Consults, Help).
- `src/data/mockData.json`: Contains the mock database state for fast prototyping without a backend.

---

## 🛠 Transitioning from Mock Data to Real Database API

This application is currently using local mock JSON data. When connecting it to your real Node/Express/MSSQL (or MongoDB) backend, follow these steps:

### 1. Configure the Main API Base URL
In your project, preferably create a `.env` file in the `frontend/` directory with your endpoint:

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Configure Login (Auth.jsx)

Open `src/pages/Auth.jsx`. Remove the `mockData.json` local matching logic. Replace it with a standard Fetch/Axios request to your backend:

```jsx
// BEFORE:
await new Promise(resolve => setTimeout(resolve, 800));
const user = mockData.users.find(u => u.email === email && u.password === password);

// AFTER:
const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
if (!response.ok) throw new Error(data.message);
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```

Make sure your backend `/api/auth/login` returns a correct JWT token and `user` object.

### 3. Configure Patient Records (PatientRecords.jsx)

Open `src/pages/Dashboard/PatientRecords.jsx`. Replace the mockData mapped array logic with an authenticated Fetch to your `GET /api/appointments` API. 

```jsx
// BEFORE: 
const formattedRecords = mockData.patientRecords.map(record => ...);

// AFTER:
const token = localStorage.getItem("token");
const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
  headers: { "Authorization": `Bearer ${token}` }
});
const data = await response.json();
setRecords(data); 
// Ensure `data` maps correctly to what the component expects (id, date, time, patientName etc.)
```

### 4. Updating Profile and Calendar
Do the same for `Profile.jsx` and `Calendar.jsx`. Remove `mockData.json` imports and instead populate the `useEffect` hook using fetch to endpoints like `/api/users/profile` and `/api/appointments/schedule` respectively.

## Running the Application
```bash
npm install
npm run dev
```
