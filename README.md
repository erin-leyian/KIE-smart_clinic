# KIE Smart Clinic

Smart Clinic is a team project focused on patient flow, queue management, and role-based access.

## Quick Start

If you are joining the project for the first time, follow the steps below in order.

1. Clone the repository:

```bash
git clone https://github.com/erin-leyian/KIE-smart_clinic.git
cd KIE-smart_clinic
```

2. Backend setup (from the backend folder):

```bash
npm install
npm run dev
```

3. Database setup:

- Run PostgreSQL locally.
- Run the migration scripts to create all required tables.
- Run the seed script to load dummy patient and appointment data.

4. Frontend setup:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

5. Open the app at http://localhost:5173.

If everything is set up correctly, you should land on the login screen and be able to test role-based navigation after login.

## Frontend Routes

- /login
- /dashboard (admin role)
- /queue (admin and receptionist roles)
- /unauthorized

## Week 1 Demo Check

Expected demo flow:

1. Seed DB
2. Start backend
3. Test login endpoint in Postman and receive JWT
4. Start frontend and open login screen
5. Login and navigate by role

## Team Glossary (Starter)

- Queue token: Numeric token assigned to a patient in the waiting queue.
- Check-in: Action of marking a patient as present at the clinic.
- Appointment: Scheduled patient-clinician visit entry.
- Receptionist role: User role focused on patient flow and queue handling.
- Admin role: User role with higher access for management views.

## Frontend Contribution Note

Frontend implementation now includes:

- Login form validation and backend login integration.
- Protected routes with role-aware access checks.
- Role-based redirect after login.
- Dashboard and queue pages connected with safe fallback behavior while backend endpoints are being finalized.

This keeps the frontend usable for demos while backend work continues in parallel.