# KIE Smart Clinic

KIE Smart Clinic is a full-stack healthcare appointment and clinic operations system.

It includes:
- A React + Vite frontend for patients, doctors, and admins
- A Node.js + Express backend API
- Supabase (PostgreSQL + REST) integration for data persistence
- Optional SMS integration via Africa's Talking

## Demo Video

[![Watch the KIE Smart Clinic demo](https://img.youtube.com/vi/IDYTIbntwTQ/maxresdefault.jpg)](https://youtu.be/IDYTIbntwTQ)

## What This Project Covers

- Authentication and role-based access (patient, doctor, admin)
- Doctor discovery and appointment booking
- Appointment lifecycle management
- Patient records and queue workflows
- Notifications and system settings management
- Admin-managed hospitals, insurance, and condition settings

## Architecture

### 1. System Architecture (Frontend, API, Data, External)

![KIE Smart Clinic layered system architecture](docs/system-architecture.png)

### 2. Request Flow Architecture

![KIE Smart Clinic request and response flow architecture](docs/request-flow.png)

## Repository Structure

```text
KIE-smart_clinic/
├── Backend/                    # Express API + Supabase integration
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── db/
│   ├── tests/
│   ├── smart_clinic_schema.sql
│   └── seed-complete-data.js
├── frontend/                   # React/Vite application
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── context/
├── API_DOCUMENTATION.md        # Detailed API endpoint reference
└── README.md
```

## Backend Data Architecture (Preview)

![KIE Smart Clinic database schema preview](docs/db-schema.svg)

If your Markdown viewer does not render Mermaid blocks, use the static ERD image above.

```mermaid
erDiagram
  users {
    UUID id PK
    string role
    string email
    string phone
  }
  doctor_specializations {
    UUID id PK
    UUID doctor_id FK
    string specialization
  }
  available_hours {
    UUID id PK
    UUID doctor_id FK
    string day
  }
  appointments {
    UUID id PK
    UUID doctor_id FK
    UUID patient_id FK
    string status
  }
  patient_records {
    UUID id PK
    UUID patient_id FK
    UUID doctor_id FK
    UUID appointment_id FK
  }
  queue_entries {
    UUID id PK
    UUID appointment_id FK
    UUID patient_id FK
    UUID doctor_id FK
    string status
  }
  notifications {
    UUID id PK
    UUID user_id FK
    string type
    boolean read
  }
  hospitals {
    serial id PK
    string name
    string location
  }
  insurance_providers {
    serial id PK
    string name
    string type
  }
  medical_conditions {
    serial id PK
    string name
    string prevalence
  }

  users ||--o| doctor_specializations : doctor_id_fk
  users ||--o{ available_hours : doctor_id_fk
  users ||--o{ appointments : doctor_id_fk
  users ||--o{ appointments : patient_id_fk
  users ||--o{ patient_records : doctor_id_fk
  users ||--o{ patient_records : patient_id_fk
  users ||--o{ queue_entries : doctor_id_fk
  users ||--o{ queue_entries : patient_id_fk
  users ||--o{ notifications : user_id_fk
  appointments ||--o| patient_records : appointment_id_fk
  appointments ||--o| queue_entries : appointment_id_fk

  users ||--o{ hospitals : admin_manages_app_level
  users ||--o{ insurance_providers : admin_manages_app_level
  users ||--o{ medical_conditions : admin_manages_app_level
```

Notes:
- Connections labeled with `_fk` are SQL foreign-key relationships.
- Connections labeled `admin_manages_app_level` are application-level links (no direct SQL foreign key in the current schema).


## Tech Stack

### Frontend
- React 18
- Vite
- React Router v6
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express
- JWT authentication
- Supabase JS + REST API
- Optional Africa's Talking SMS integration

### Testing
- Jest
- Supertest

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- A Supabase project with API keys
- (Optional) Africa's Talking credentials for SMS features

## Local Setup

### 1. Clone and install dependencies

From project root:

```bash
# root-level dependencies (if needed by your workflow)
npm install

# backend
cd Backend
npm install

# frontend
cd ../frontend
npm install
```

### 2. Configure backend environment

In Backend:

```bash
cd Backend
cp .env.example .env
```

Set required variables in `Backend/.env`:
- `PORT` (default `3000`)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

Optional SMS variables:
- `AT_API_KEY`
- `AT_USERNAME`

### 3. Configure frontend environment

In frontend:

```bash
cd frontend
cp .env.example .env
```

Set API URL used by the app service layer:

```env
VITE_API_URL=http://localhost:3000
```

If `frontend/.env.example` shows `REACT_APP_*` keys, treat them as legacy and use `VITE_API_URL` for the current Vite-based frontend.

Note: the frontend automatically prefixes requests with `/api`.

### 4. Initialize database schema

Use your Supabase SQL editor (or psql against your Postgres instance) to execute:

- `Backend/smart_clinic_schema.sql`

Optional demo data seed:

```bash
cd Backend
node seed-complete-data.js
```

## Run the Project

Use two terminals.

### Terminal 1: Backend API

```bash
cd Backend
npm run dev
```

Backend runs on `http://localhost:3000` by default.

Health check:

```bash
curl http://localhost:3000/health
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Available Scripts

### Backend (`Backend/package.json`)
- `npm run dev` - start backend with nodemon
- `npm start` - start backend with node
- `npm test` - run API tests (Jest/Supertest)

### Frontend (`frontend/package.json`)
- `npm run dev` - start Vite dev server
- `npm run build` - build production bundle
- `npm run preview` - preview production build locally

## API and Reference Docs

- Full endpoint docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Backend-focused setup notes: [Backend/setup-supabase.sh](Backend/setup-supabase.sh)
- Seed/demo credentials: [Backend/USERS_CREDENTIALS.md](Backend/USERS_CREDENTIALS.md)

## Core API Route Groups

All routes are under `/api` unless noted otherwise:

- `GET /health` (system + database health)
- `/api/auth`
- `/api/doctors`
- `/api/appointments`
- `/api/patient-records`
- `/api/queue`
- `/api/notifications`
- `/api/admin/system-settings`
- `/api/sms`

## Notes

- The frontend currently includes mock data files for prototyping in `frontend/src/data/mockData.json`, but the active API service is configured to use the backend.
- Do not use seeded/demo credentials in production.
- Keep `.env` files out of version control.
