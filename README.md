# KIE Smart Clinic

Team project for clinic queue, appointments, and role-based access.

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/erin-leyian/KIE-smart_clinic.git
cd KIE-smart_clinic
```

2. Backend setup (from project backend folder):

```bash
npm install
npm run dev
```

3. Database setup:

- Run PostgreSQL locally.
- Run project migrations to create tables.
- Run seed scripts to populate dummy data.

4. Frontend setup:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

5. Open the app at http://localhost:5173.

## Frontend Routes

- /login
- /dashboard (admin role)
- /queue (admin and receptionist roles)
- /unauthorized

## Week 1 Demo Check

The expected flow for demo:

1. Seed DB
2. Start backend
3. Test login endpoint in Postman and receive JWT
4. Start frontend and open login screen
5. Login and navigate by role

## Team Glossary (Starter)

- Queue token: The numeric token assigned to a patient in the waiting queue.
- Check-in: The action of marking a patient as present at the clinic.
- Appointment: A scheduled patient-clinician visit entry.
- Receptionist role: User role focused on patient flow and queue handling.
- Admin role: User role with higher access for management views.