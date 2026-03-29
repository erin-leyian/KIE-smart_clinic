# Smart Clinic API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [Authentication Endpoints](#authentication-endpoints)
4. [User Management](#user-management)
5. [Doctor Management](#doctor-management)
6. [Appointments](#appointments)
7. [Patient Records](#patient-records)
8. [Queue Management](#queue-management)
9. [Notifications](#notifications)
10. [System Settings](#system-settings)
11. [Frontend Component Structure](#frontend-component-structure)
12. [Database Schema](#database-schema)

---

## Overview

Smart Clinic is a comprehensive healthcare management system with three user roles:
- **Patient**: Books appointments, views medical records, manages consultations
- **Doctor**: Manages appointments, creates medical records, enables consultations
- **Admin**: System-wide management of users, doctors, appointments, hospitals, insurance, and conditions

**Technology Stack:**
- Frontend: React 18.3.1, Tailwind CSS, React Router v6
- Backend: Node.js, Express.js
- Database: MySQL/MariaDB
- Storage: Browser localStorage for admin settings

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

**Description:** Create a new user account (Patient, Doctor, or Admin)

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
    "phone": "+1234567890",
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
- firstName and lastName required

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

**Description:** Retrieve all system users with pagination and filtering

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

**Description:** Get specific user details (Self or Admin)

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
    "createdAt": "2026-03-29T10:00:00Z"
  }
}
```

---

### 3. Update User Profile

**Endpoint:** `PUT /auth/users/:id`

**Description:** Update user profile information (Self or Admin)

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

**Request Payload:**
```json
{
  "confirmation": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

## Doctor Management

### 1. Get All Doctors

**Endpoint:** `GET /doctors`

**Description:** Get list of all doctors with specializations

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `search` (optional): Search by name
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "doctor-uuid-456",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "specialization": "Cardiology",
      "qualifications": "MD, Board Certified",
      "yearsOfExperience": 10,
      "consultationFee": 50.00,
      "consultationDuration": 30,
      "consultationEnabled": true,
      "rating": 4.8,
      "totalConsultations": 150,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2. Get Doctor by ID

**Endpoint:** `GET /doctors/:id`

**Description:** Get specific doctor details with full profile

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "doctor": {
    "id": "doctor-uuid-456",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "specialization": "Cardiology",
    "qualifications": "MD, Board Certified",
    "yearsOfExperience": 10,
    "consultationFee": 50.00,
    "consultationDuration": 30,
    "consultationEnabled": true,
    "availableHours": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "day": "Tuesday",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ],
    "rating": 4.8,
    "totalConsultations": 150,
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

---

### 3. Create Doctor (Admin Only)

**Endpoint:** `POST /doctors`

**Description:** Register a new doctor

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "specialization": "Cardiology",
  "qualifications": "MD, Board Certified",
  "yearsOfExperience": 10,
  "consultationFee": 50.00,
  "consultationDuration": 30,
  "consultationEnabled": true,
  "availableHours": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Doctor created successfully",
  "doctor": {
    "id": "doctor-uuid-456",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "specialization": "Cardiology"
  }
}
```

---

### 4. Update Doctor Profile

**Endpoint:** `PUT /doctors/:id`

**Description:** Update doctor information (Self or Admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Payload:**
```json
{
  "phone": "+1987654321",
  "specialization": "Cardiology",
  "qualifications": "MD, Board Certified, Advanced Cardiac Care",
  "yearsOfExperience": 11,
  "consultationFee": 55.00,
  "consultationDuration": 45,
  "consultationEnabled": true,
  "availableHours": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "day": "Wednesday",
      "startTime": "10:00",
      "endTime": "18:00"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Doctor profile updated successfully",
  "doctor": {
    "id": "doctor-uuid-456",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "specialization": "Cardiology",
    "consultationFee": 55.00,
    "consultationDuration": 45,
    "consultationEnabled": true
  }
}
```

---

### 5. Delete Doctor (Admin Only)

**Endpoint:** `DELETE /doctors/:id`

**Description:** Remove doctor from system

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "confirmation": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Doctor deleted successfully"
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
  "notes": "Chronic back pain consultation"
}
```

**Validation Rules:**
- `appointmentDate` must be future date
- `appointmentTime` must be valid 24-hour format (HH:MM)
- `doctorId` and `patientId` must be valid UUIDs
- `reason` minimum 5 characters
- Time slot must be within doctor's availability

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

**Description:** Retrieve appointments (filtered by user role and permissions)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `scheduled`, `completed`, `cancelled`, `no-show`
- `date` (optional): Filter by date (YYYY-MM-DD)
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

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

**Description:** Get specific appointment details with all information

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

**Description:** Modify appointment details (Patient can update own, Doctor/Admin can update all)

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

**Request Payload:**
```json
{
  "confirmation": true,
  "reason": "Patient requested cancellation"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Appointment deleted successfully"
}
```

---

## Patient Records

### 1. Create Patient Record

**Endpoint:** `POST /patient-records`

**Description:** Create a medical record for a patient (Doctor or Admin only)

**Headers:**
```
Authorization: Bearer {doctor_token}
```

**Request Payload:**
```json
{
  "patientId": "patient-uuid-123",
  "appointmentId": "apt-uuid-789",
  "diagnosis": "Hypertension Stage 2",
  "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
  "medication": "Lisinopril 10mg twice daily",
  "testResults": "Blood pressure 160/100 mmHg, Normal blood work",
  "notes": "Patient advised to reduce sodium intake and exercise regularly",
  "followUpDate": "2026-05-15"
}
```

**Validation Rules:**
- `patientId` required and must be valid UUID
- `diagnosis` required, minimum 10 characters
- `treatment` required, minimum 10 characters
- `medication` optional but if provided minimum 5 characters
- `followUpDate` must be future date

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Patient record created successfully",
  "record": {
    "id": "record-uuid-999",
    "patientId": "patient-uuid-123",
    "patientName": "John Doe",
    "doctorId": "doctor-uuid-456",
    "doctorName": "Dr. Jane Smith",
    "appointmentId": "apt-uuid-789",
    "diagnosis": "Hypertension Stage 2",
    "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
    "medication": "Lisinopril 10mg twice daily",
    "testResults": "Blood pressure 160/100 mmHg, Normal blood work",
    "notes": "Patient advised to reduce sodium intake and exercise regularly",
    "followUpDate": "2026-05-15",
    "createdAt": "2026-03-29T10:00:00Z"
  }
}
```

---

### 2. Get All Patient Records

**Endpoint:** `GET /patient-records`

**Description:** Retrieve patient records (filtered by user role)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `patientId` (optional): Filter by patient
- `doctorId` (optional): Filter by doctor
- `fromDate` (optional): Filter records after date (YYYY-MM-DD)
- `toDate` (optional): Filter records before date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "record-uuid-999",
      "patientId": "patient-uuid-123",
      "patientName": "John Doe",
      "doctorId": "doctor-uuid-456",
      "doctorName": "Dr. Jane Smith",
      "appointmentId": "apt-uuid-789",
      "diagnosis": "Hypertension Stage 2",
      "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
      "medication": "Lisinopril 10mg twice daily",
      "testResults": "Blood pressure 160/100 mmHg, Normal blood work",
      "notes": "Patient advised to reduce sodium intake and exercise regularly",
      "followUpDate": "2026-05-15",
      "createdAt": "2026-03-29T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3. Get Patient Record by ID

**Endpoint:** `GET /patient-records/:id`

**Description:** Get specific patient record details

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "record": {
    "id": "record-uuid-999",
    "patientId": "patient-uuid-123",
    "patientName": "John Doe",
    "doctorId": "doctor-uuid-456",
    "doctorName": "Dr. Jane Smith",
    "appointmentId": "apt-uuid-789",
    "diagnosis": "Hypertension Stage 2",
    "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
    "medication": "Lisinopril 10mg twice daily",
    "testResults": "Blood pressure 160/100 mmHg, Normal blood work",
    "notes": "Patient advised to reduce sodium intake and exercise regularly",
    "followUpDate": "2026-05-15",
    "createdAt": "2026-03-29T10:00:00Z",
    "updatedAt": "2026-03-29T10:00:00Z"
  }
}
```

---

### 4. Update Patient Record

**Endpoint:** `PUT /patient-records/:id`

**Description:** Update patient record (Doctor who created it or Admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Payload:**
```json
{
  "diagnosis": "Hypertension Stage 2 - Improved",
  "treatment": "Continue current medication, patient shows improvement",
  "medication": "Lisinopril 10mg twice daily, Hydrochlorothiazide 25mg once daily",
  "testResults": "Blood pressure 145/90 mmHg, showing improvement",
  "notes": "Patient compliance excellent, continue current regimen",
  "followUpDate": "2026-06-15"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient record updated successfully",
  "record": {
    "id": "record-uuid-999",
    "patientId": "patient-uuid-123",
    "doctorId": "doctor-uuid-456",
    "diagnosis": "Hypertension Stage 2 - Improved",
    "treatment": "Continue current medication, patient shows improvement",
    "medication": "Lisinopril 10mg twice daily, Hydrochlorothiazide 25mg once daily",
    "testResults": "Blood pressure 145/90 mmHg, showing improvement",
    "notes": "Patient compliance excellent, continue current regimen",
    "followUpDate": "2026-06-15",
    "updatedAt": "2026-03-29T11:30:00Z"
  }
}
```

---

### 5. Delete Patient Record (Admin Only)

**Endpoint:** `DELETE /patient-records/:id`

**Description:** Remove patient record from system

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "confirmation": true,
  "reason": "Duplicate record"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient record deleted successfully"
}
```

---

## Queue Management

### 1. Get Queue for Doctor

**Endpoint:** `GET /queue/doctor/:doctorId`

**Description:** Get patient queue for specific doctor with real-time status

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
      "patientPhone": "+1234567890",
      "reason": "Regular checkup",
      "status": "waiting",
      "position": 1,
      "estimatedWaitTime": 10,
      "arrivedAt": "2026-04-15T14:20:00Z"
    },
    {
      "id": "queue-uuid-2",
      "appointmentId": "apt-uuid-790",
      "patientId": "patient-uuid-124",
      "patientName": "Jane Smith",
      "patientPhone": "+1987654321",
      "reason": "Consultation",
      "status": "in-progress",
      "position": 2,
      "estimatedWaitTime": 25,
      "arrivedAt": "2026-04-15T14:25:00Z"
    }
  ],
  "total": 5,
  "averageWaitTime": 15
}
```

---

### 2. Update Queue Status

**Endpoint:** `PUT /queue/:queueId`

**Description:** Update patient status in queue (Doctor only)

**Headers:**
```
Authorization: Bearer {doctor_token}
```

**Request Payload:**
```json
{
  "status": "in-progress",
  "notes": "Patient arrived and seated"
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
    "status": "in-progress",
    "position": 1
  }
}
```

---

### 3. Mark Queue Complete

**Endpoint:** `PUT /queue/:queueId/complete`

**Description:** Mark appointment as completed and remove from queue

**Headers:**
```
Authorization: Bearer {doctor_token}
```

**Request Payload:**
```json
{
  "notes": "Appointment completed successfully",
  "duration": 25
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Appointment marked as completed",
  "queue": {
    "id": "queue-uuid-1",
    "appointmentId": "apt-uuid-789",
    "patientId": "patient-uuid-123",
    "status": "completed",
    "completedAt": "2026-04-15T14:45:00Z",
    "duration": 25
  }
}
```

---

## Notifications

### 1. Get All Notifications

**Endpoint:** `GET /notifications`

**Description:** Get user's notification history

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `read` (optional): Filter by read status (true/false)
- `type` (optional): Filter by type (appointment, record, system)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "notification-uuid-1",
      "userId": "user-uuid-123",
      "title": "Appointment Confirmed",
      "message": "Your appointment with Dr. Jane Smith is confirmed for 2026-04-15 at 14:30",
      "type": "appointment",
      "relatedId": "apt-uuid-789",
      "read": false,
      "createdAt": "2026-03-29T10:00:00Z"
    },
    {
      "id": "notification-uuid-2",
      "userId": "user-uuid-123",
      "title": "Medical Record Updated",
      "message": "Dr. Jane Smith has added a new medical record",
      "type": "record",
      "relatedId": "record-uuid-999",
      "read": true,
      "createdAt": "2026-03-28T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

---

### 2. Mark Notification as Read

**Endpoint:** `PUT /notifications/:id/read`

**Description:** Mark single notification as read

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

---

### 3. Mark All Notifications as Read

**Endpoint:** `PUT /notifications/read-all`

**Description:** Mark all notifications as read

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "All notifications marked as read"
}
```

---

## System Settings

### 1. Hospital Management

#### 1.1 Get All Hospitals

**Endpoint:** `GET /admin/system-settings/hospitals`

**Description:** Get list of all hospitals (stored in localStorage on frontend)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Clinic byishimo",
      "location": "KN 2 St, Kigali",
      "phone": "+250 252 584 960",
      "type": "Private Clinic",
      "image": "https://images.unsplash.com/photo-1576091160550-112173f7f869?w=300&h=200&fit=crop",
      "rating": 4.8,
      "reviews": 245
    }
  ]
}
```

---

#### 1.2 Add Hospital

**Endpoint:** `POST /admin/system-settings/hospitals`

**Description:** Create a new hospital entry

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "name": "New Hospital",
  "location": "City Location",
  "phone": "+250 XXX XXX XXX",
  "type": "Private Hospital",
  "rating": 4.5,
  "reviews": 0
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Hospital added successfully",
  "hospital": {
    "id": 2,
    "name": "New Hospital",
    "location": "City Location",
    "phone": "+250 XXX XXX XXX",
    "type": "Private Hospital",
    "image": "https://images.unsplash.com/photo-1576091160550-112173f7f869",
    "rating": 4.5,
    "reviews": 0
  }
}
```

---

#### 1.3 Update Hospital

**Endpoint:** `PUT /admin/system-settings/hospitals/:id`

**Description:** Update hospital information

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "name": "Updated Hospital Name",
  "location": "New Location",
  "phone": "+250 NEW XXX XXX",
  "type": "Teaching Hospital",
  "rating": 4.7,
  "reviews": 300
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Hospital updated successfully",
  "hospital": {
    "id": 1,
    "name": "Updated Hospital Name",
    "location": "New Location",
    "phone": "+250 NEW XXX XXX",
    "type": "Teaching Hospital",
    "rating": 4.7,
    "reviews": 300
  }
}
```

---

#### 1.4 Delete Hospital

**Endpoint:** `DELETE /admin/system-settings/hospitals/:id`

**Description:** Delete a hospital entry

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "confirmation": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Hospital deleted successfully"
}
```

---

### 2. Insurance Provider Management

#### 2.1 Get All Insurance Providers

**Endpoint:** `GET /admin/system-settings/insurance`

**Description:** Get list of all insurance providers

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "RSSB",
      "fullName": "Rwanda Social Security Board",
      "type": "Government",
      "coverage": "85%",
      "benefits": ["Inpatient", "Outpatient", "Emergency"],
      "conditions": "For formal sector employees"
    }
  ]
}
```

---

#### 2.2 Add Insurance Provider

**Endpoint:** `POST /admin/system-settings/insurance`

**Description:** Create a new insurance provider

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "name": "New Insurance",
  "fullName": "New Insurance Company Ltd",
  "type": "Private",
  "coverage": "90%",
  "conditions": "For private sector employees",
  "benefits": ["Comprehensive Coverage", "All Services"]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Insurance provider added successfully",
  "insurance": {
    "id": 5,
    "name": "New Insurance",
    "fullName": "New Insurance Company Ltd",
    "type": "Private",
    "coverage": "90%",
    "conditions": "For private sector employees",
    "benefits": ["Comprehensive Coverage", "All Services"]
  }
}
```

---

#### 2.3 Update Insurance Provider

**Endpoint:** `PUT /admin/system-settings/insurance/:id`

**Description:** Update insurance provider information

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "name": "Updated Insurance",
  "fullName": "Updated Insurance Company",
  "type": "Community-based",
  "coverage": "95%",
  "conditions": "Updated conditions",
  "benefits": ["Updated Benefits"]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Insurance provider updated successfully",
  "insurance": {
    "id": 1,
    "name": "Updated Insurance",
    "fullName": "Updated Insurance Company",
    "type": "Community-based",
    "coverage": "95%",
    "conditions": "Updated conditions",
    "benefits": ["Updated Benefits"]
  }
}
```

---

#### 2.4 Delete Insurance Provider

**Endpoint:** `DELETE /admin/system-settings/insurance/:id`

**Description:** Delete an insurance provider

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "confirmation": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Insurance provider deleted successfully"
}
```

---

### 3. Medical Conditions Management

#### 3.1 Get All Medical Conditions

**Endpoint:** `GET /admin/system-settings/conditions`

**Description:** Get list of all medical conditions

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Malaria",
      "description": "Mosquito-borne infectious disease",
      "prevalence": "High",
      "icon": "🦟",
      "treatments": ["Artemisinin-based", "Chloroquine", "Quinine"],
      "specialists": [3, 7]
    }
  ]
}
```

---

#### 3.2 Add Medical Condition

**Endpoint:** `POST /admin/system-settings/conditions`

**Description:** Create a new medical condition

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "name": "New Condition",
  "description": "Description of the medical condition",
  "prevalence": "Common",
  "icon": "🏥",
  "treatments": ["Treatment 1", "Treatment 2", "Treatment 3"],
  "specialists": []
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Medical condition added successfully",
  "condition": {
    "id": 11,
    "name": "New Condition",
    "description": "Description of the medical condition",
    "prevalence": "Common",
    "icon": "🏥",
    "treatments": ["Treatment 1", "Treatment 2", "Treatment 3"],
    "specialists": []
  }
}
```

---

#### 3.3 Update Medical Condition

**Endpoint:** `PUT /admin/system-settings/conditions/:id`

**Description:** Update medical condition information

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "name": "Updated Condition Name",
  "description": "Updated description",
  "prevalence": "Moderate",
  "icon": "💊",
  "treatments": ["New Treatment 1", "New Treatment 2"],
  "specialists": [1, 2, 5]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medical condition updated successfully",
  "condition": {
    "id": 1,
    "name": "Updated Condition Name",
    "description": "Updated description",
    "prevalence": "Moderate",
    "icon": "💊",
    "treatments": ["New Treatment 1", "New Treatment 2"],
    "specialists": [1, 2, 5]
  }
}
```

---

#### 3.4 Delete Medical Condition

**Endpoint:** `DELETE /admin/system-settings/conditions/:id`

**Description:** Delete a medical condition

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "confirmation": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medical condition deleted successfully"
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
// Fields: Email input, Password input, Submit button
```

#### RegisterForm.jsx
```javascript
// Props: onSuccess(user, token), onError(message), role='patient'
// State: formData {firstName, lastName, email, password, role, phone, dateOfBirth, gender, address, city, state}
// Validation: All fields required, email unique, password strength
// Output: POST /auth/register with user data
// Fields: All user profile fields + role selector
```

---

### 2. Appointment Components

#### AppointmentForm.jsx
```javascript
// Props: doctorId, patientId, appointmentId (for edit), onSuccess, onError
// State: formData {appointmentDate, appointmentTime, reason, notes}
// Validation: Date is future, time valid, reason min 5 chars
// Output: POST /appointments or PUT /appointments/:id
// Fields: 
//   - Doctor selector (dropdown with search)
//   - Date picker (calendar)
//   - Time picker (with doctor availability)
//   - Reason textarea
//   - Notes textarea
```

#### AppointmentList.jsx
```javascript
// Props: appointments[], onEdit, onDelete, onView, userRole
// State: filters {status, date, doctorId}, pagination
// Output: GET /appointments with filters
// Displays: Appointments in table/card format with status indicators
// Actions: View, Edit (own appointments), Delete (own/admin), Filter, Search, Pagination
```

#### AppointmentDetails.jsx
```javascript
// Props: appointmentId
// State: appointment, loading, error, editMode
// Output: GET /appointments/:id
// Displays: All appointment details with edit/delete buttons
// Actions: Edit appointment, Cancel appointment, View patient records
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
//   - Gender select (male/female/other)
//   - Address input
//   - City input
//   - State input
//   - Save button
```

#### ProfileView.jsx
```javascript
// Props: user, userRole
// State: editMode, loading
// Output: GET /auth/users/:id, PUT /auth/users/:id
// Sections: Personal Info, Contact Info, Role-specific info (admin permissions, doctor specializations)
// Actions: Edit profile, Change password, Delete account (self only)
```

---

### 4. Doctor Components

#### DoctorForm.jsx
```javascript
// Props: doctorId, onSuccess, onError
// State: formData {specialization, qualifications, yearsOfExperience, consultationFee, consultationDuration, consultationEnabled, availableHours}
// Validation: Fee > 0, duration > 0, experience >= 0
// Output: PUT /doctors/:id for doctor-specific fields
// Fields:
//   - Specialization select/input
//   - Qualifications textarea
//   - Years of experience input
//   - Consultation fee input
//   - Consultation duration select (15/30/45/60 mins)
//   - Enable consultations toggle
//   - Availability hours (day picker + time range)
```

#### DoctorList.jsx
```javascript
// Props: filters, searchTerm, userRole
// State: doctors[], pagination, sorting
// Output: GET /doctors with filters
// Displays: Doctors in grid/list with specialization, rating, consultation info
// Actions: View (all), Edit (admin), Delete (admin), Filter by specialization, Search
```

#### DoctorDetails.jsx
```javascript
// Props: doctorId
// State: doctor, loading, error
// Output: GET /doctors/:id
// Displays: Full doctor profile with specialization, qualifications, available slots
// Actions: Book appointment (patient), Edit profile (self/admin), Delete (admin)
```

---

### 5. Patient Records Components

#### PatientRecordsForm.jsx
```javascript
// Props: patientId, appointmentId, recordId (for edit), onSuccess, onError
// State: formData {diagnosis, treatment, medication, testResults, notes, followUpDate}
// Validation: Diagnosis/treatment required and min 10 chars
// Output: POST /patient-records or PUT /patient-records/:id
// Fields:
//   - Diagnosis textarea
//   - Treatment textarea
//   - Medication input (searchable dropdown)
//   - Test results textarea
//   - Notes textarea
//   - Follow-up date picker
//   - Submit button
```

#### PatientRecordsList.jsx
```javascript
// Props: patientId, userRole
// State: records[], filters, pagination
// Output: GET /patient-records?patientId=:patientId
// Displays: Records in timeline or table format with dates
// Actions: View, Edit (doctor/admin), Delete (admin), Filter by date range
```

#### PatientRecordsDetails.jsx
```javascript
// Props: recordId
// State: record, loading, error
// Output: GET /patient-records/:id
// Displays: Complete medical record with all information
// Actions: Edit (doctor/admin), Delete (admin), Print/Export
```

---

### 6. System Settings Components

#### SystemSettings.jsx (NEW)
```javascript
// Admin-only component for managing system-wide settings
// Props: None (admin-only access)
// State: 
//   - hospitals[], insuranceProviders[], medicalConditions[]
//   - activeTab ('hospitals' | 'insurance' | 'conditions')
//   - showModal, modalMode ('add' | 'edit'), editingId
//   - formData (current form inputs)
//   - deleteConfirm (confirmation state)

// Hospital Tab:
//   - Display hospitals in card grid
//   - Add/Edit/Delete buttons on each card
//   - Modal form for add/edit operations
//   - localStorage persistence

// Insurance Tab:
//   - Display providers in table format
//   - Add/Edit/Delete buttons in actions column
//   - Type dropdown selector (Government, Private, etc)
//   - localStorage persistence

// Conditions Tab:
//   - Display conditions in card grid
//   - Add/Edit/Delete buttons on each card
//   - Emoji icon support
//   - Comma-separated treatments auto-parse to array
//   - localStorage persistence

// localStorage Keys:
//   - system_hospitals
//   - system_insurance
//   - system_conditions

// Output:
//   - POST /admin/system-settings/hospitals|insurance|conditions
//   - PUT /admin/system-settings/hospitals|insurance|conditions/:id
//   - DELETE /admin/system-settings/hospitals|insurance|conditions/:id
```

---

### 7. Queue Components

#### QueueList.jsx
```javascript
// Props: doctorId
// State: queue[], autoRefresh (every 10s), loading
// Output: GET /queue/doctor/:doctorId (with polling)
// Displays: Patient queue in order with position and wait time
// Actions: Mark as in-progress, Mark as completed, Mark as no-show
// Auto-refresh: Real-time updates for position changes
```

#### QueueItem.jsx
```javascript
// Props: queueItem, onStatusChange, doctorId
// State: status, updating
// Output: PUT /queue/:queueId with status update
// Displays: Patient name, position, reason, current status, estimated wait
// Actions: Start service, Complete service, Mark no-show, View patient details
```

---

### 8. Admin Components

#### AdminDashboard.jsx
```javascript
// Props: None
// State: stats {totalUsers, totalAppointments, totalDoctors, activeAppointments}, loading
// Output: GET /admin/stats
// Displays: System overview with key metrics and charts
// Sections: Statistics cards, Recent activity, System health
```

#### AllUsers.jsx
```javascript
// Props: None
// State: users[], filters {role, search}, pagination, sorting
// Output: GET /auth/users with filters
// Displays: Users table with role, status, creation date
// Actions: View, Edit (admin), Delete (with confirmation), Filter by role, Search
```

#### AllDoctors.jsx
```javascript
// Props: None
// State: doctors[], filters {specialization, search}, pagination
// Output: GET /doctors with filters
// Displays: Doctors table with specialization, consultation fee, status
// Actions: View, Edit (admin), Delete (with confirmation), Toggle consultation enabled
```

#### AllAppointments.jsx
```javascript
// Props: None
// State: appointments[], filters {status, date, doctorId, patientId}, pagination
// Output: GET /appointments with filters
// Displays: All system appointments in table format
// Actions: View, Edit (admin), Delete (with confirmation), Filter by multiple criteria
```

#### SystemSettings.jsx
```javascript
// Props: None
// State: hospitals[], insuranceProviders[], medicalConditions[], activeTab
// Output: CRUD operations via localStorage + backend
// Displays: Three tabs for hospitals, insurance, and conditions
// Actions: Add, Edit, Delete for all three sections
// Data Persistence: localStorage with fallback to mockData
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
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email),
  KEY idx_role (role),
  KEY idx_createdAt (createdAt)
);
```

### Doctor Specializations Table
```sql
CREATE TABLE doctorSpecializations (
  id VARCHAR(36) PRIMARY KEY,
  doctorId VARCHAR(36) NOT NULL UNIQUE,
  specialization VARCHAR(100) NOT NULL,
  qualifications VARCHAR(255),
  yearsOfExperience INT DEFAULT 0,
  consultationFee DECIMAL(10, 2),
  consultationDuration INT DEFAULT 30,
  consultationEnabled BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  totalConsultations INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_specialization (specialization)
);
```

### Doctor Availability Table
```sql
CREATE TABLE doctorAvailability (
  id VARCHAR(36) PRIMARY KEY,
  doctorId VARCHAR(36) NOT NULL,
  dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_doctorId (doctorId),
  UNIQUE KEY unique_doctor_day (doctorId, dayOfWeek)
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
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_doctorId (doctorId),
  KEY idx_patientId (patientId),
  KEY idx_appointmentDate (appointmentDate),
  KEY idx_status (status),
  UNIQUE KEY unique_slot (doctorId, appointmentDate, appointmentTime)
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
  testResults TEXT,
  notes TEXT,
  followUpDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL,
  KEY idx_patientId (patientId),
  KEY idx_doctorId (doctorId),
  KEY idx_appointmentId (appointmentId),
  KEY idx_createdAt (createdAt)
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
  estimatedWaitTime INT,
  notes TEXT,
  arrivedAt TIMESTAMP,
  completedAt TIMESTAMP,
  duration INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_doctorId (doctorId),
  KEY idx_status (status),
  KEY idx_appointmentId (appointmentId)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('appointment', 'record', 'system', 'queue') DEFAULT 'system',
  relatedId VARCHAR(36),
  read BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_userId (userId),
  KEY idx_read (read),
  KEY idx_createdAt (createdAt)
);
```

### System Settings Tables (Frontend localStorage)

**localStorage Keys:**
- `system_hospitals` - JSON array of hospital objects
- `system_insurance` - JSON array of insurance provider objects
- `system_conditions` - JSON array of medical condition objects

---

## Access Control Matrix

| Endpoint | Patient | Doctor | Admin |
|----------|---------|--------|-------|
| POST /auth/register | ✓ | ✓ | ✓ |
| POST /auth/login | ✓ | ✓ | ✓ |
| GET /auth/me | ✓ | ✓ | ✓ |
| GET /auth/users | ✗ | ✗ | ✓ |
| GET /auth/users/:id | ✓ (self) | ✓ (self) | ✓ (all) |
| PUT /auth/users/:id | ✓ (self) | ✓ (self) | ✓ (all) |
| DELETE /auth/users/:id | ✗ | ✗ | ✓ |
| GET /doctors | ✓ | ✓ | ✓ |
| GET /doctors/:id | ✓ | ✓ | ✓ |
| POST /doctors | ✗ | ✗ | ✓ |
| PUT /doctors/:id | ✗ | ✓ (self) | ✓ (all) |
| DELETE /doctors/:id | ✗ | ✗ | ✓ |
| POST /appointments | ✓ | ✗ | ✓ |
| GET /appointments | ✓ (own) | ✓ (assigned) | ✓ (all) |
| PUT /appointments/:id | ✓ (own) | ✓ (assigned) | ✓ (all) |
| DELETE /appointments/:id | ✓ (own) | ✗ | ✓ (all) |
| POST /patient-records | ✗ | ✓ | ✓ |
| GET /patient-records | ✓ (own) | ✓ (created) | ✓ (all) |
| PUT /patient-records/:id | ✗ | ✓ (created) | ✓ |
| DELETE /patient-records/:id | ✗ | ✗ | ✓ |
| GET /queue/doctor/:id | ✗ | ✓ (own) | ✓ |
| PUT /queue/:id | ✗ | ✓ (own queue) | ✓ |
| GET /notifications | ✓ | ✓ | ✓ |
| PUT /notifications/:id/read | ✓ | ✓ | ✓ |
| GET /admin/system-settings/hospitals | ✗ | ✗ | ✓ |
| POST /admin/system-settings/hospitals | ✗ | ✗ | ✓ |
| PUT /admin/system-settings/hospitals/:id | ✗ | ✗ | ✓ |
| DELETE /admin/system-settings/hospitals/:id | ✗ | ✗ | ✓ |
| GET /admin/system-settings/insurance | ✗ | ✗ | ✓ |
| POST /admin/system-settings/insurance | ✗ | ✗ | ✓ |
| PUT /admin/system-settings/insurance/:id | ✗ | ✗ | ✓ |
| DELETE /admin/system-settings/insurance/:id | ✗ | ✗ | ✓ |
| GET /admin/system-settings/conditions | ✗ | ✗ | ✓ |
| POST /admin/system-settings/conditions | ✗ | ✗ | ✓ |
| PUT /admin/system-settings/conditions/:id | ✗ | ✗ | ✓ |
| DELETE /admin/system-settings/conditions/:id | ✗ | ✗ | ✓ |

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
- `DUPLICATE_APPOINTMENT`: Time slot already booked
- `INVALID_DOCTOR_AVAILABILITY`: Time outside doctor's availability
- `PATIENT_NOT_FOUND`: Patient doesn't exist
- `DOCTOR_NOT_FOUND`: Doctor doesn't exist

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Auth endpoints: 5 requests per minute per IP
- Exception: Admin endpoints have higher limits

---

## Notes

- All timestamps are in UTC (ISO 8601 format)
- Dates in YYYY-MM-DD format
- Times in 24-hour HH:MM format
- All IDs are UUID v4
- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire in 24 hours
- All modifications require user authentication
- Soft deletes not implemented - records are permanently removed
- Real-time updates use polling (10s interval for queue)
- System Settings (Hospitals, Insurance, Conditions) use localStorage for frontend storage
- System Settings endpoints are optional (frontend can use localStorage directly)



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

**Description:** Create a new user account (Patient, Doctor, or Admin)

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
    "phone": "+1234567890",
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
- firstName and lastName required

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

**Description:** Retrieve all system users with pagination and filtering

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

**Description:** Get specific user details (Self or Admin)

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
    "createdAt": "2026-03-29T10:00:00Z"
  }
}
```

---

### 3. Update User Profile

**Endpoint:** `PUT /auth/users/:id`

**Description:** Update user profile information (Self or Admin)

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

**Request Payload:**
```json
{
  "confirmation": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

## Doctor Management

### 1. Get All Doctors

**Endpoint:** `GET /doctors`

**Description:** Get list of all doctors with specializations

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `search` (optional): Search by name
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "doctor-uuid-456",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "specialization": "Cardiology",
      "qualifications": "MD, Board Certified",
      "yearsOfExperience": 10,
      "consultationFee": 50.00,
      "consultationDuration": 30,
      "consultationEnabled": true,
      "rating": 4.8,
      "totalConsultations": 150,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2. Get Doctor by ID

**Endpoint:** `GET /doctors/:id`

**Description:** Get specific doctor details with full profile

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "doctor": {
    "id": "doctor-uuid-456",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "specialization": "Cardiology",
    "qualifications": "MD, Board Certified",
    "yearsOfExperience": 10,
    "consultationFee": 50.00,
    "consultationDuration": 30,
    "consultationEnabled": true,
    "availableHours": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "17:00"
      },
      {
        "day": "Tuesday",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ],
    "rating": 4.8,
    "totalConsultations": 150,
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

---

### 3. Create Doctor (Admin Only)

**Endpoint:** `POST /doctors`

**Description:** Register a new doctor

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "specialization": "Cardiology",
  "qualifications": "MD, Board Certified",
  "yearsOfExperience": 10,
  "consultationFee": 50.00,
  "consultationDuration": 30,
  "consultationEnabled": true,
  "availableHours": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Doctor created successfully",
  "doctor": {
    "id": "doctor-uuid-456",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "specialization": "Cardiology"
  }
}
```

---

### 4. Update Doctor Profile

**Endpoint:** `PUT /doctors/:id`

**Description:** Update doctor information (Self or Admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Payload:**
```json
{
  "phone": "+1987654321",
  "specialization": "Cardiology",
  "qualifications": "MD, Board Certified, Advanced Cardiac Care",
  "yearsOfExperience": 11,
  "consultationFee": 55.00,
  "consultationDuration": 45,
  "consultationEnabled": true,
  "availableHours": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00"
    },
    {
      "day": "Wednesday",
      "startTime": "10:00",
      "endTime": "18:00"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Doctor profile updated successfully",
  "doctor": {
    "id": "doctor-uuid-456",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "specialization": "Cardiology",
    "consultationFee": 55.00,
    "consultationDuration": 45,
    "consultationEnabled": true
  }
}
```

---

### 5. Delete Doctor (Admin Only)

**Endpoint:** `DELETE /doctors/:id`

**Description:** Remove doctor from system

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "confirmation": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Doctor deleted successfully"
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
  "notes": "Chronic back pain consultation"
}
```

**Validation Rules:**
- `appointmentDate` must be future date
- `appointmentTime` must be valid 24-hour format (HH:MM)
- `doctorId` and `patientId` must be valid UUIDs
- `reason` minimum 5 characters
- Time slot must be within doctor's availability

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

**Description:** Retrieve appointments (filtered by user role and permissions)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `scheduled`, `completed`, `cancelled`, `no-show`
- `date` (optional): Filter by date (YYYY-MM-DD)
- `doctorId` (optional): Filter by doctor
- `patientId` (optional): Filter by patient
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

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

**Description:** Get specific appointment details with all information

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

**Description:** Modify appointment details (Patient can update own, Doctor/Admin can update all)

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

**Request Payload:**
```json
{
  "confirmation": true,
  "reason": "Patient requested cancellation"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Appointment deleted successfully"
}
```

---

## Patient Records

### 1. Create Patient Record

**Endpoint:** `POST /patient-records`

**Description:** Create a medical record for a patient (Doctor or Admin only)

**Headers:**
```
Authorization: Bearer {doctor_token}
```

**Request Payload:**
```json
{
  "patientId": "patient-uuid-123",
  "appointmentId": "apt-uuid-789",
  "diagnosis": "Hypertension Stage 2",
  "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
  "medication": "Lisinopril 10mg twice daily",
  "testResults": "Blood pressure 160/100 mmHg, Normal blood work",
  "notes": "Patient advised to reduce sodium intake and exercise regularly",
  "followUpDate": "2026-05-15"
}
```

**Validation Rules:**
- `patientId` required and must be valid UUID
- `diagnosis` required, minimum 10 characters
- `treatment` required, minimum 10 characters
- `medication` optional but if provided minimum 5 characters
- `followUpDate` must be future date

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Patient record created successfully",
  "record": {
    "id": "record-uuid-999",
    "patientId": "patient-uuid-123",
    "patientName": "John Doe",
    "doctorId": "doctor-uuid-456",
    "doctorName": "Dr. Jane Smith",
    "appointmentId": "apt-uuid-789",
    "diagnosis": "Hypertension Stage 2",
    "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
    "medication": "Lisinopril 10mg twice daily",
    "testResults": "Blood pressure 160/100 mmHg, Normal blood work",
    "notes": "Patient advised to reduce sodium intake and exercise regularly",
    "followUpDate": "2026-05-15",
    "createdAt": "2026-03-29T10:00:00Z"
  }
}
```

---

### 2. Get All Patient Records

**Endpoint:** `GET /patient-records`

**Description:** Retrieve patient records (filtered by user role)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `patientId` (optional): Filter by patient
- `doctorId` (optional): Filter by doctor
- `fromDate` (optional): Filter records after date (YYYY-MM-DD)
- `toDate` (optional): Filter records before date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "record-uuid-999",
      "patientId": "patient-uuid-123",
      "patientName": "John Doe",
      "doctorId": "doctor-uuid-456",
      "doctorName": "Dr. Jane Smith",
      "appointmentId": "apt-uuid-789",
      "diagnosis": "Hypertension Stage 2",
      "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
      "medication": "Lisinopril 10mg twice daily",
      "testResults": "Blood pressure 160/100 mmHg, Normal blood work",
      "notes": "Patient advised to reduce sodium intake and exercise regularly",
      "followUpDate": "2026-05-15",
      "createdAt": "2026-03-29T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3. Get Patient Record by ID

**Endpoint:** `GET /patient-records/:id`

**Description:** Get specific patient record details

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "record": {
    "id": "record-uuid-999",
    "patientId": "patient-uuid-123",
    "patientName": "John Doe",
    "doctorId": "doctor-uuid-456",
    "doctorName": "Dr. Jane Smith",
    "appointmentId": "apt-uuid-789",
    "diagnosis": "Hypertension Stage 2",
    "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
    "medication": "Lisinopril 10mg twice daily",
    "testResults": "Blood pressure 160/100 mmHg, Normal blood work",
    "notes": "Patient advised to reduce sodium intake and exercise regularly",
    "followUpDate": "2026-05-15",
    "createdAt": "2026-03-29T10:00:00Z",
    "updatedAt": "2026-03-29T10:00:00Z"
  }
}
```

---

### 4. Update Patient Record

**Endpoint:** `PUT /patient-records/:id`

**Description:** Update patient record (Doctor who created it or Admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Payload:**
```json
{
  "diagnosis": "Hypertension Stage 2 - Improved",
  "treatment": "Continue current medication, patient shows improvement",
  "medication": "Lisinopril 10mg twice daily, Hydrochlorothiazide 25mg once daily",
  "testResults": "Blood pressure 145/90 mmHg, showing improvement",
  "notes": "Patient compliance excellent, continue current regimen",
  "followUpDate": "2026-06-15"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient record updated successfully",
  "record": {
    "id": "record-uuid-999",
    "patientId": "patient-uuid-123",
    "doctorId": "doctor-uuid-456",
    "diagnosis": "Hypertension Stage 2 - Improved",
    "treatment": "Continue current medication, patient shows improvement",
    "medication": "Lisinopril 10mg twice daily, Hydrochlorothiazide 25mg once daily",
    "testResults": "Blood pressure 145/90 mmHg, showing improvement",
    "notes": "Patient compliance excellent, continue current regimen",
    "followUpDate": "2026-06-15",
    "updatedAt": "2026-03-29T11:30:00Z"
  }
}
```

---

### 5. Delete Patient Record (Admin Only)

**Endpoint:** `DELETE /patient-records/:id`

**Description:** Remove patient record from system

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Payload:**
```json
{
  "confirmation": true,
  "reason": "Duplicate record"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient record deleted successfully"
}
```

---

## Queue Management

### 1. Get Queue for Doctor

**Endpoint:** `GET /queue/doctor/:doctorId`

**Description:** Get patient queue for specific doctor with real-time status

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
      "patientPhone": "+1234567890",
      "reason": "Regular checkup",
      "status": "waiting",
      "position": 1,
      "estimatedWaitTime": 10,
      "arrivedAt": "2026-04-15T14:20:00Z"
    },
    {
      "id": "queue-uuid-2",
      "appointmentId": "apt-uuid-790",
      "patientId": "patient-uuid-124",
      "patientName": "Jane Smith",
      "patientPhone": "+1987654321",
      "reason": "Consultation",
      "status": "in-progress",
      "position": 2,
      "estimatedWaitTime": 25,
      "arrivedAt": "2026-04-15T14:25:00Z"
    }
  ],
  "total": 5,
  "averageWaitTime": 15
}
```

---

### 2. Update Queue Status

**Endpoint:** `PUT /queue/:queueId`

**Description:** Update patient status in queue (Doctor only)

**Headers:**
```
Authorization: Bearer {doctor_token}
```

**Request Payload:**
```json
{
  "status": "in-progress",
  "notes": "Patient arrived and seated"
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
    "status": "in-progress",
    "position": 1
  }
}
```

---

### 3. Mark Queue Complete

**Endpoint:** `PUT /queue/:queueId/complete`

**Description:** Mark appointment as completed and remove from queue

**Headers:**
```
Authorization: Bearer {doctor_token}
```

**Request Payload:**
```json
{
  "notes": "Appointment completed successfully",
  "duration": 25
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Appointment marked as completed",
  "queue": {
    "id": "queue-uuid-1",
    "appointmentId": "apt-uuid-789",
    "patientId": "patient-uuid-123",
    "status": "completed",
    "completedAt": "2026-04-15T14:45:00Z",
    "duration": 25
  }
}
```

---

## Notifications

### 1. Get All Notifications

**Endpoint:** `GET /notifications`

**Description:** Get user's notification history

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `read` (optional): Filter by read status (true/false)
- `type` (optional): Filter by type (appointment, record, system)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "notification-uuid-1",
      "userId": "user-uuid-123",
      "title": "Appointment Confirmed",
      "message": "Your appointment with Dr. Jane Smith is confirmed for 2026-04-15 at 14:30",
      "type": "appointment",
      "relatedId": "apt-uuid-789",
      "read": false,
      "createdAt": "2026-03-29T10:00:00Z"
    },
    {
      "id": "notification-uuid-2",
      "userId": "user-uuid-123",
      "title": "Medical Record Updated",
      "message": "Dr. Jane Smith has added a new medical record",
      "type": "record",
      "relatedId": "record-uuid-999",
      "read": true,
      "createdAt": "2026-03-28T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

---

### 2. Mark Notification as Read

**Endpoint:** `PUT /notifications/:id/read`

**Description:** Mark single notification as read

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

---

### 3. Mark All Notifications as Read

**Endpoint:** `PUT /notifications/read-all`

**Description:** Mark all notifications as read

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "All notifications marked as read"
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
// Fields: Email input, Password input, Submit button
```

#### RegisterForm.jsx
```javascript
// Props: onSuccess(user, token), onError(message), role='patient'
// State: formData {firstName, lastName, email, password, role, phone, dateOfBirth, gender, address, city, state}
// Validation: All fields required, email unique, password strength
// Output: POST /auth/register with user data
// Fields: All user profile fields + role selector
```

---

### 2. Appointment Components

#### AppointmentForm.jsx
```javascript
// Props: doctorId, patientId, appointmentId (for edit), onSuccess, onError
// State: formData {appointmentDate, appointmentTime, reason, notes}
// Validation: Date is future, time valid, reason min 5 chars
// Output: POST /appointments or PUT /appointments/:id
// Fields: 
//   - Doctor selector (dropdown with search)
//   - Date picker (calendar)
//   - Time picker (with doctor availability)
//   - Reason textarea
//   - Notes textarea
```

#### AppointmentList.jsx
```javascript
// Props: appointments[], onEdit, onDelete, onView, userRole
// State: filters {status, date, doctorId}, pagination
// Output: GET /appointments with filters
// Displays: Appointments in table/card format with status indicators
// Actions: View, Edit (own appointments), Delete (own/admin), Filter, Search, Pagination
```

#### AppointmentDetails.jsx
```javascript
// Props: appointmentId
// State: appointment, loading, error, editMode
// Output: GET /appointments/:id
// Displays: All appointment details with edit/delete buttons
// Actions: Edit appointment, Cancel appointment, View patient records
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
//   - Gender select (male/female/other)
//   - Address input
//   - City input
//   - State input
//   - Save button
```

#### ProfileView.jsx
```javascript
// Props: user, userRole
// State: editMode, loading
// Output: GET /auth/users/:id, PUT /auth/users/:id
// Sections: Personal Info, Contact Info, Role-specific info (admin permissions, doctor specializations)
// Actions: Edit profile, Change password, Delete account (self only)
```

---

### 4. Doctor Components

#### DoctorForm.jsx
```javascript
// Props: doctorId, onSuccess, onError
// State: formData {specialization, qualifications, yearsOfExperience, consultationFee, consultationDuration, consultationEnabled, availableHours}
// Validation: Fee > 0, duration > 0, experience >= 0
// Output: PUT /doctors/:id for doctor-specific fields
// Fields:
//   - Specialization select/input
//   - Qualifications textarea
//   - Years of experience input
//   - Consultation fee input
//   - Consultation duration select (15/30/45/60 mins)
//   - Enable consultations toggle
//   - Availability hours (day picker + time range)
```

#### DoctorList.jsx
```javascript
// Props: filters, searchTerm, userRole
// State: doctors[], pagination, sorting
// Output: GET /doctors with filters
// Displays: Doctors in grid/list with specialization, rating, consultation info
// Actions: View (all), Edit (admin), Delete (admin), Filter by specialization, Search
```

#### DoctorDetails.jsx
```javascript
// Props: doctorId
// State: doctor, loading, error
// Output: GET /doctors/:id
// Displays: Full doctor profile with specialization, qualifications, available slots
// Actions: Book appointment (patient), Edit profile (self/admin), Delete (admin)
```

---

### 5. Patient Records Components

#### PatientRecordsForm.jsx
```javascript
// Props: patientId, appointmentId, recordId (for edit), onSuccess, onError
// State: formData {diagnosis, treatment, medication, testResults, notes, followUpDate}
// Validation: Diagnosis/treatment required and min 10 chars
// Output: POST /patient-records or PUT /patient-records/:id
// Fields:
//   - Diagnosis textarea
//   - Treatment textarea
//   - Medication input (searchable dropdown)
//   - Test results textarea
//   - Notes textarea
//   - Follow-up date picker
//   - Submit button
```

#### PatientRecordsList.jsx
```javascript
// Props: patientId, userRole
// State: records[], filters, pagination
// Output: GET /patient-records?patientId=:patientId
// Displays: Records in timeline or table format with dates
// Actions: View, Edit (doctor/admin), Delete (admin), Filter by date range
```

#### PatientRecordsDetails.jsx
```javascript
// Props: recordId
// State: record, loading, error
// Output: GET /patient-records/:id
// Displays: Complete medical record with all information
// Actions: Edit (doctor/admin), Delete (admin), Print/Export
```

---

### 6. Queue Components

#### QueueList.jsx
```javascript
// Props: doctorId
// State: queue[], autoRefresh (every 10s), loading
// Output: GET /queue/doctor/:doctorId (with polling)
// Displays: Patient queue in order with position and wait time
// Actions: Mark as in-progress, Mark as completed, Mark as no-show
// Auto-refresh: Real-time updates for position changes
```

#### QueueItem.jsx
```javascript
// Props: queueItem, onStatusChange, doctorId
// State: status, updating
// Output: PUT /queue/:queueId with status update
// Displays: Patient name, position, reason, current status, estimated wait
// Actions: Start service, Complete service, Mark no-show, View patient details
```

---

### 7. Admin Components

#### AdminDashboard.jsx
```javascript
// Props: None
// State: stats {totalUsers, totalAppointments, totalDoctors, activeAppointments}, loading
// Output: GET /admin/stats
// Displays: System overview with key metrics and charts
// Sections: Statistics cards, Recent activity, System health
```

#### AllUsers.jsx
```javascript
// Props: None
// State: users[], filters {role, search}, pagination, sorting
// Output: GET /auth/users with filters
// Displays: Users table with role, status, creation date
// Actions: View, Edit (admin), Delete (with confirmation), Filter by role, Search
```

#### AllDoctors.jsx
```javascript
// Props: None
// State: doctors[], filters {specialization, search}, pagination
// Output: GET /doctors with filters
// Displays: Doctors table with specialization, consultation fee, status
// Actions: View, Edit (admin), Delete (with confirmation), Toggle consultation enabled
```

#### AllAppointments.jsx
```javascript
// Props: None
// State: appointments[], filters {status, date, doctorId, patientId}, pagination
// Output: GET /appointments with filters
// Displays: All system appointments in table format
// Actions: View, Edit (admin), Delete (with confirmation), Filter by multiple criteria
```

#### SystemSettings.jsx
```javascript
// Props: None
// State: settings {}, loading
// Output: GET /admin/settings, PUT /admin/settings
// Displays: System configuration options
// Sections: Consultation settings, Notification preferences, System notifications
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
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email),
  KEY idx_role (role),
  KEY idx_createdAt (createdAt)
);
```

### Doctor Specializations Table
```sql
CREATE TABLE doctorSpecializations (
  id VARCHAR(36) PRIMARY KEY,
  doctorId VARCHAR(36) NOT NULL UNIQUE,
  specialization VARCHAR(100) NOT NULL,
  qualifications VARCHAR(255),
  yearsOfExperience INT DEFAULT 0,
  consultationFee DECIMAL(10, 2),
  consultationDuration INT DEFAULT 30,
  consultationEnabled BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  totalConsultations INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_specialization (specialization)
);
```

### Doctor Availability Table
```sql
CREATE TABLE doctorAvailability (
  id VARCHAR(36) PRIMARY KEY,
  doctorId VARCHAR(36) NOT NULL,
  dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_doctorId (doctorId),
  UNIQUE KEY unique_doctor_day (doctorId, dayOfWeek)
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
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_doctorId (doctorId),
  KEY idx_patientId (patientId),
  KEY idx_appointmentDate (appointmentDate),
  KEY idx_status (status),
  UNIQUE KEY unique_slot (doctorId, appointmentDate, appointmentTime)
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
  testResults TEXT,
  notes TEXT,
  followUpDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL,
  KEY idx_patientId (patientId),
  KEY idx_doctorId (doctorId),
  KEY idx_appointmentId (appointmentId),
  KEY idx_createdAt (createdAt)
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
  estimatedWaitTime INT,
  notes TEXT,
  arrivedAt TIMESTAMP,
  completedAt TIMESTAMP,
  duration INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_doctorId (doctorId),
  KEY idx_status (status),
  KEY idx_appointmentId (appointmentId)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('appointment', 'record', 'system', 'queue') DEFAULT 'system',
  relatedId VARCHAR(36),
  read BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_userId (userId),
  KEY idx_read (read),
  KEY idx_createdAt (createdAt)
);
```

---

## Access Control Matrix

| Endpoint | Patient | Doctor | Admin |
|----------|---------|--------|-------|
| POST /auth/register | ✓ | ✓ | ✓ |
| POST /auth/login | ✓ | ✓ | ✓ |
| GET /auth/me | ✓ | ✓ | ✓ |
| GET /auth/users | ✗ | ✗ | ✓ |
| GET /auth/users/:id | ✓ (self) | ✓ (self) | ✓ (all) |
| PUT /auth/users/:id | ✓ (self) | ✓ (self) | ✓ (all) |
| DELETE /auth/users/:id | ✗ | ✗ | ✓ |
| GET /doctors | ✓ | ✓ | ✓ |
| GET /doctors/:id | ✓ | ✓ | ✓ |
| POST /doctors | ✗ | ✗ | ✓ |
| PUT /doctors/:id | ✗ | ✓ (self) | ✓ (all) |
| DELETE /doctors/:id | ✗ | ✗ | ✓ |
| POST /appointments | ✓ | ✗ | ✓ |
| GET /appointments | ✓ (own) | ✓ (assigned) | ✓ (all) |
| PUT /appointments/:id | ✓ (own) | ✓ (assigned) | ✓ (all) |
| DELETE /appointments/:id | ✓ (own) | ✗ | ✓ (all) |
| POST /patient-records | ✗ | ✓ | ✓ |
| GET /patient-records | ✓ (own) | ✓ (created) | ✓ (all) |
| PUT /patient-records/:id | ✗ | ✓ (created) | ✓ |
| DELETE /patient-records/:id | ✗ | ✗ | ✓ |
| GET /queue/doctor/:id | ✗ | ✓ (own) | ✓ |
| PUT /queue/:id | ✗ | ✓ (own queue) | ✓ |
| GET /notifications | ✓ | ✓ | ✓ |
| PUT /notifications/:id/read | ✓ | ✓ | ✓ |

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
- `DUPLICATE_APPOINTMENT`: Time slot already booked
- `INVALID_DOCTOR_AVAILABILITY`: Time outside doctor's availability
- `PATIENT_NOT_FOUND`: Patient doesn't exist

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Auth endpoints: 5 requests per minute per IP
- Exception: Admin endpoints have higher limits

---

## Notes

- All timestamps are in UTC (ISO 8601 format)
- Dates in YYYY-MM-DD format
- Times in 24-hour HH:MM format
- All IDs are UUID v4
- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire in 24 hours
- All modifications require user authentication
- Soft deletes not implemented - records are permanently removed
- Real-time updates use polling (10s interval for queue)

