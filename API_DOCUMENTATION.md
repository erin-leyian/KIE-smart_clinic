# Smart Clinic API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [Authentication Endpoints](#authentication-endpoints)
4. [User Management](#user-management)
5. [Appointments](#appointments)
6. [Queue Management](#queue-management)
7. [Frontend Component Structure](#frontend-component-structure)
8. [Database Schema](#database-schema)

---

## Overview

Smart Clinic is a comprehensive healthcare management system with three user roles:
- **Patient**: Books appointments, views medical records, manages consultations
- **Doctor**: Manages appointments, creates medical records, enables consultations
- **Admin**: System-wide management of users, doctors, appointments, and settings

**Technology Stack:**
- Frontend: React 18.3.1, Tailwind CSS, React Router v6
- Backend: Node.js, Express.js
- Database: MySQL/MariaDB

---

## Base URL & Authentication

### Base URL
```
http://localhost:5000/api
```

### Authentication Method
**JWT (JSON Web Tokens)** - Bearer token in Authorization header

### Headers Required (All Protected Endpoints)
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Response Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

---

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Request Payload:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "patient",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user": {
    "id": "user-uuid-123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "patient",
    "createdAt": "2026-03-29T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- Email must be unique
- Password minimum 8 characters
- Phone must be valid format
- Role must be: `patient`, `doctor`, or `admin`

---

### 2. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Request Payload:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "user": {
    "id": "user-uuid-123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Get logged-in user's profile

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "user": {
    "id": "user-uuid-123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "patient",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "createdAt": "2026-03-29T10:00:00Z"
  }
}
```

---

## User Management

### 1. Get All Users (Admin Only)

**Endpoint:** `GET /auth/users`

**Description:** Retrieve all system users

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `role` (optional): Filter by role - `patient`, `doctor`, `admin`
- `search` (optional): Search by name or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "user-uuid-123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "patient",
      "phone": "+1234567890",
      "createdAt": "2026-03-29T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

### 2. Get User by ID

**Endpoint:** `GET /auth/users/:id`

**Description:** Get specific user details

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id` (required): User UUID

**Response (200 OK):**
```json
{
  "status": "success",
  "user": {
    "id": "user-uuid-123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "patient",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

---

### 3. Update User Profile

**Endpoint:** `PUT /auth/users/:id`

**Description:** Update user profile information

**Headers:**
```
Authorization: Bearer {token}
```

**Request Payload:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1987654321",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "456 Oak Ave",
  "city": "Boston",
  "state": "MA"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "user": {
    "id": "user-uuid-123",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "role": "patient",
    "phone": "+1987654321",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "address": "456 Oak Ave",
    "city": "Boston",
    "state": "MA"
  }
}
```

---

### 4. Delete User (Admin Only)

**Endpoint:** `DELETE /auth/users/:id`

**Description:** Remove user from system

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

## Appointments

### 1. Create Appointment

**Endpoint:** `POST /appointments`

**Description:** Book a new appointment

**Headers:**
```
Authorization: Bearer {patient_token}
```

**Request Payload:**
```json
{
  "doctorId": "doctor-uuid-456",
  "patientId": "patient-uuid-123",
  "appointmentDate": "2026-04-15",
  "appointmentTime": "14:30",
  "reason": "Regular checkup",
  "notes": "Chronic back pain consultation",
  "status": "scheduled"
}
```

**Validation Rules:**
- `appointmentDate` must be future date
- `appointmentTime` must be valid 24-hour format (HH:MM)
- `doctorId` and `patientId` must be valid UUIDs
- `reason` minimum 5 characters

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Appointment created successfully",
  "appointment": {
    "id": "apt-uuid-789",
    "doctorId": "doctor-uuid-456",
    "doctorName": "Dr. Jane Smith",
    "patientId": "patient-uuid-123",
    "patientName": "John Doe",
    "appointmentDate": "2026-04-15",
    "appointmentTime": "14:30",
    "reason": "Regular checkup",
    "notes": "Chronic back pain consultation",
    "status": "scheduled",
    "createdAt": "2026-03-29T10:00:00Z"
  }
}
```

---

### 2. Get All Appointments

**Endpoint:** `GET /appointments`

**Description:** Retrieve appointments (filtered by user role)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `scheduled`, `completed`, `cancelled`
- `date` (optional): Filter by date (YYYY-MM-DD)
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `page` (optional): Page number (default: 1)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "apt-uuid-789",
      "doctorId": "doctor-uuid-456",
      "doctorName": "Dr. Jane Smith",
      "patientId": "patient-uuid-123",
      "patientName": "John Doe",
      "appointmentDate": "2026-04-15",
      "appointmentTime": "14:30",
      "reason": "Regular checkup",
      "notes": "Chronic back pain consultation",
      "status": "scheduled",
      "createdAt": "2026-03-29T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3. Get Appointment by ID

**Endpoint:** `GET /appointments/:id`

**Description:** Get specific appointment details

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "appointment": {
    "id": "apt-uuid-789",
    "doctorId": "doctor-uuid-456",
    "doctorName": "Dr. Jane Smith",
    "patientId": "patient-uuid-123",
    "patientName": "John Doe",
    "appointmentDate": "2026-04-15",
    "appointmentTime": "14:30",
    "reason": "Regular checkup",
    "notes": "Chronic back pain consultation",
    "status": "scheduled",
    "createdAt": "2026-03-29T10:00:00Z",
    "updatedAt": "2026-03-29T10:00:00Z"
  }
}
```

---

### 4. Update Appointment

**Endpoint:** `PUT /appointments/:id`

**Description:** Modify appointment details

**Headers:**
```
Authorization: Bearer {token}
```

**Request Payload:**
```json
{
  "appointmentDate": "2026-04-16",
  "appointmentTime": "15:00",
  "reason": "Updated reason",
  "notes": "Updated notes",
  "status": "scheduled"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Appointment updated successfully",
  "appointment": {
    "id": "apt-uuid-789",
    "doctorId": "doctor-uuid-456",
    "patientId": "patient-uuid-123",
    "appointmentDate": "2026-04-16",
    "appointmentTime": "15:00",
    "reason": "Updated reason",
    "notes": "Updated notes",
    "status": "scheduled"
  }
}
```

---

### 5. Delete Appointment

**Endpoint:** `DELETE /appointments/:id`

**Description:** Cancel/remove appointment

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Appointment deleted successfully"
}
```

---

## Queue Management

### 1. Get Queue for Doctor

**Endpoint:** `GET /queue/doctor/:doctorId`

**Description:** Get patient queue for specific doctor

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "queue": [
    {
      "id": "queue-uuid-1",
      "appointmentId": "apt-uuid-789",
      "patientId": "patient-uuid-123",
      "patientName": "John Doe",
      "reason": "Regular checkup",
      "status": "waiting",
      "position": 1,
      "arrivedAt": "2026-04-15T14:20:00Z"
    },
    {
      "id": "queue-uuid-2",
      "appointmentId": "apt-uuid-790",
      "patientId": "patient-uuid-124",
      "patientName": "Jane Smith",
      "reason": "Consultation",
      "status": "in-progress",
      "position": 2,
      "arrivedAt": "2026-04-15T14:25:00Z"
    }
  ],
  "total": 5
}
```

---

### 2. Update Queue Status

**Endpoint:** `PUT /queue/:queueId`

**Description:** Update patient status in queue

**Headers:**
```
Authorization: Bearer {doctor_token}
```

**Request Payload:**
```json
{
  "status": "completed"
}
```

**Status Values:**
- `waiting`: Patient waiting in queue
- `in-progress`: Currently being served
- `completed`: Appointment completed
- `no-show`: Patient didn't show up

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Queue status updated",
  "queue": {
    "id": "queue-uuid-1",
    "appointmentId": "apt-uuid-789",
    "patientId": "patient-uuid-123",
    "status": "completed"
  }
}
```

---

## Frontend Component Structure

### 1. Authentication Components

#### LoginForm.jsx
```javascript
// Props: onSuccess(user, token), onError(message)
// State: email, password, loading, error
// Validation: Email format, password minimum 8 chars
// Output: POST /auth/login with credentials
```

#### RegisterForm.jsx
```javascript
// Props: onSuccess(user, token), onError(message)
// State: formData {firstName, lastName, email, password, role, phone, etc}
// Validation: All fields required, email unique, password strength
// Output: POST /auth/register with user data
```

---

### 2. Appointment Components

#### AppointmentForm.jsx
```javascript
// Props: doctorId, patientId, onSuccess, onError
// State: formData {appointmentDate, appointmentTime, reason, notes}
// Validation: Date is future, time valid, reason min 5 chars
// Output: POST /appointments or PUT /appointments/:id
// Fields: 
//   - Doctor selector (dropdown)
//   - Date picker
//   - Time picker
```

#### AppointmentList.jsx
```javascript
// Props: appointments[], onEdit, onDelete, onView
// State: filters {status, date, doctorId}
// Output: Displays appointments in table or card format
// Actions: View, Edit, Delete, Filter, Search
```

#### AppointmentDetails.jsx
```javascript
// Props: appointmentId
// State: appointment, loading, error
// Output: GET /appointments/:id
// Displays: All appointment details, edit button, cancel button
```

---

### 3. User Profile Components

#### ProfileForm.jsx
```javascript
// Props: userId, onSuccess, onError
// State: formData {firstName, lastName, phone, dateOfBirth, gender, address, city, state}
// Validation: All fields required, phone format valid
// Output: PUT /auth/users/:id with updated data
// Fields:
//   - First name input
//   - Last name input
//   - Phone input
//   - DOB picker
//   - Gender select
//   - Address, city, state inputs
```

#### ProfileView.jsx
```javascript
// Props: user
// State: editMode
// Output: Displays user profile or edit form
// Sections: Personal Info, Contact Info, Role-specific info (admin/doctor)
```

---

### 4. Queue Management Components

#### QueueList.jsx
```javascript
// Props: doctorId
// State: queue[], autoRefresh
// Output: GET /queue/doctor/:doctorId (auto-refresh every 10s)
// Displays: Patient queue in order
// Actions: Mark as in-progress, Mark as completed, Mark as no-show
```

#### QueueItem.jsx
```javascript
// Props: queueItem, onStatusChange
// State: status
// Output: PUT /queue/:queueId with status update
// Displays: Patient name, position, reason, current status
```

---

### 5. Patient Records Components

#### PatientRecordsForm.jsx
```javascript
// Props: patientId, appointmentId, onSuccess, onError
// State: formData {diagnosis, treatment, medication, notes, testResults}
// Validation: Diagnosis and treatment required
// Output: POST /patient-records or PUT /patient-records/:id
// Fields:
//   - Diagnosis textarea
//   - Treatment textarea
//   - Medication input (searchable)
//   - Notes textarea
//   - Test results file upload or text
```

#### PatientRecordsList.jsx
```javascript
// Props: patientId, userRole
// State: records[], filters
// Output: GET /patient-records?patientId=:patientId
// Displays: Records in timeline or table
// Actions: View, Edit (doctor only), Delete (admin/doctor)
```

---

### 6. Doctor Components

#### DoctorForm.jsx
```javascript
// Props: doctorId, onSuccess, onError
// State: formData {specialization, consultationFee, consultationDuration, consultationEnabled, consultationAvailability}
// Validation: Fee > 0, duration > 0
// Output: PUT /auth/users/:id for doctor-specific fields
// Fields:
//   - Specialization select/input
//   - Consultation fee input
//   - Consultation duration select
//   - Enable consultations toggle
//   - Availability time picker
```

#### DoctorList.jsx
```javascript
// Props: filters, searchTerm
// State: doctors[], pagination
// Output: GET /auth/users?role=doctor
// Displays: Doctors in grid/list with specialization, ratings
// Actions: View, Edit (admin), Delete (admin)
```

---

### 7. Admin Components

#### AdminDashboard.jsx
```javascript
// Props: None
// State: stats, loading
// Output: GET /admin/stats
// Displays: System overview - total users, appointments, doctors, revenue
```

#### AllUsers.jsx
```javascript
// Props: None
// State: users[], filters, pagination
// Output: GET /auth/users
// Displays: Users table with role, status, created date
// Actions: View, Edit, Delete (with confirmation)
```

#### AllDoctors.jsx
```javascript
// Props: None
// State: doctors[], pagination
// Output: GET /auth/users?role=doctor
// Displays: Doctors with specialization, consultation fees
// Actions: View, Edit, Delete
```

#### AllAppointments.jsx
```javascript
// Props: None
// State: appointments[], filters
// Output: GET /appointments
// Displays: All system appointments
// Actions: View, Edit, Delete, Filter by status/date
```

#### SystemSettings.jsx
```javascript
// Props: None
// State: settings {}
// Output: GET/PUT /admin/settings
// Displays: System configuration options
// Fields: Various system-wide settings
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('patient', 'doctor', 'admin') NOT NULL,
  phone VARCHAR(20),
  dateOfBirth DATE,
  gender ENUM('male', 'female', 'other'),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Doctor Specialization Table
```sql
CREATE TABLE doctorSpecializations (
  id VARCHAR(36) PRIMARY KEY,
  doctorId VARCHAR(36) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  consultationFee DECIMAL(10, 2),
  consultationDuration INT,
  consultationEnabled BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id VARCHAR(36) PRIMARY KEY,
  doctorId VARCHAR(36) NOT NULL,
  patientId VARCHAR(36) NOT NULL,
  appointmentDate DATE NOT NULL,
  appointmentTime TIME NOT NULL,
  reason VARCHAR(255) NOT NULL,
  notes TEXT,
  status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES users(id),
  FOREIGN KEY (patientId) REFERENCES users(id)
);
```

### Patient Records Table
```sql
CREATE TABLE patientRecords (
  id VARCHAR(36) PRIMARY KEY,
  patientId VARCHAR(36) NOT NULL,
  doctorId VARCHAR(36) NOT NULL,
  appointmentId VARCHAR(36),
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  medication VARCHAR(255),
  notes TEXT,
  testResults TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES users(id),
  FOREIGN KEY (doctorId) REFERENCES users(id),
  FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL
);
```

### Queue Table
```sql
CREATE TABLE queue (
  id VARCHAR(36) PRIMARY KEY,
  appointmentId VARCHAR(36) NOT NULL,
  doctorId VARCHAR(36) NOT NULL,
  patientId VARCHAR(36) NOT NULL,
  position INT NOT NULL,
  status ENUM('waiting', 'in-progress', 'completed', 'no-show') DEFAULT 'waiting',
  arrivedAt TIMESTAMP,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointmentId) REFERENCES appointments(id),
  FOREIGN KEY (doctorId) REFERENCES users(id),
  FOREIGN KEY (patientId) REFERENCES users(id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  relatedId VARCHAR(36),
  read BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Access Control Matrix

| Endpoint | Patient | Doctor | Admin |
|----------|---------|--------|-------|
| POST /auth/register | ✓ | ✓ | ✓ |
| POST /auth/login | ✓ | ✓ | ✓ |
| GET /auth/users | ✗ | ✗ | ✓ |
| GET /auth/users/:id | ✓ (self) | ✓ (self) | ✓ (all) |
| PUT /auth/users/:id | ✓ (self) | ✓ (self/record) | ✓ (all) |
| DELETE /auth/users/:id | ✗ | ✗ | ✓ |
| POST /appointments | ✓ | ✗ | ✓ |
| GET /appointments | ✓ (own) | ✓ (assigned) | ✓ (all) |
| PUT /appointments/:id | ✓ (own) | ✓ (assigned) | ✓ (all) |
| DELETE /appointments/:id | ✓ (own) | ✗ | ✓ (all) |
| GET /queue/doctor/:id | ✗ | ✓ (own) | ✓ |
| PUT /queue/:id | ✗ | ✓ (own queue) | ✓ |
| POST /patient-records | ✗ | ✓ | ✓ |
| GET /patient-records | ✓ (own) | ✓ (assigned) | ✓ (all) |
| PUT /patient-records/:id | ✗ | ✓ (own) | ✓ |

---

## Error Handling

### Standard Error Response
```json
{
  "status": "error",
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error details"
  }
}
```

### Common Error Codes
- `INVALID_INPUT`: Validation failed
- `UNAUTHORIZED`: Token missing or invalid
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource doesn't exist
- `CONFLICT`: Resource already exists
- `SERVER_ERROR`: Internal server error

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Auth endpoints: 5 requests per minute per IP
- Exception: Admin endpoints have no rate limit

---

## Notes

- All timestamps are in UTC (ISO 8601 format)
- Dates in YYYY-MM-DD format
- Times in 24-hour HH:MM format
- All IDs are UUID v4
- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire in 24 hours
- All modifications require user authentication

