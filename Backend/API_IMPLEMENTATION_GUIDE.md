# KIE Smart Clinic - Backend API Implementation Guide

## Overview

This document outlines all the changes made to align the backend with the frontend API documentation. The implementation follows RESTful best practices and includes proper authentication, validation, and error handling.

## Database Schema Changes

### Key Changes from Old Schema

**Old Model**:
- Separate `Clinic`, `ClinicStaff`, `Patient`, `Doctor` tables
- Integer IDs
- Role-based ClinicStaff (Receptionist, Nurse, Doctor, Admin, Other)

**New Model**:
- Unified `users` table with roles: `patient`, `doctor`, `admin`
- UUID primary keys for better scalability
- Separate `doctorSpecializations` table for doctor-specific data
- New tables: `appointments`, `patientRecords`, `queueEntries`, `notifications`, `hospitals`, `insuranceProviders`, `medicalConditions`

### New Tables

1. **users** - Unified user management with roles
2. **doctorSpecializations** - Doctor specialization details, consultation fees, ratings
3. **availableHours** - Doctor working hours/availability
4. **appointments** - Patient appointments with status tracking
5. **patientRecords** - Medical records created by doctors
6. **queueEntries** - Queue management with status and position
7. **notifications** - User notifications for appointments and records
8. **hospitals** - Hospital/clinic management
9. **insuranceProviders** - Insurance provider database
10. **medicalConditions** - Medical conditions reference database

## Implemented API Endpoints

### Authentication Endpoints

#### 1. User Registration
```
POST /api/auth/register
Content-Type: application/json

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

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. User Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

#### 4. Get All Users (Admin)
```
GET /api/auth/users?role=patient&search=john&page=1&limit=10
Authorization: Bearer {admin_token}
```

#### 5. Get User by ID
```
GET /api/auth/users/{userId}
Authorization: Bearer {token}
```

#### 6. Update User Profile
```
PUT /api/auth/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321",
  "address": "456 Oak Ave"
}
```

#### 7. Delete User
```
DELETE /api/auth/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirmation": true
}
```

### Doctor Endpoints

#### 1. Get All Doctors
```
GET /api/doctors?specialization=Cardiology&search=jane&page=1&limit=10
Authorization: Bearer {token}
```

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "specialization": "Cardiology",
      "consultationFee": 50.00,
      "consultationDuration": 30,
      "rating": 4.8,
      "totalConsultations": 150
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

#### 2. Get Doctor by ID (with available hours)
```
GET /api/doctors/{doctorId}
Authorization: Bearer {token}
```

**Response**:
```json
{
  "status": "success",
  "doctor": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "specialization": "Cardiology",
    "availableHours": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  }
}
```

#### 3. Create Doctor (Admin)
```
POST /api/doctors
Authorization: Bearer {admin_token}
Content-Type: application/json

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

#### 4. Update Doctor Profile
```
PUT /api/doctors/{doctorId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "specialization": "Cardiology",
  "qualifications": "MD, Advanced Cardiac Care",
  "yearsOfExperience": 11,
  "consultationFee": 55.00,
  "availableHours": [...]
}
```

#### 5. Delete Doctor (Admin)
```
DELETE /api/doctors/{doctorId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "confirmation": true
}
```

### Appointment Endpoints (Partially Implemented)

**Status**: Basic structure in place, full implementation needed
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments with filtering
- `GET /api/appointments/:id` - Get specific appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Patient Records Endpoints

#### 1. Create Patient Record (Doctor/Admin)
```
POST /api/patient-records
Authorization: Bearer {doctor_token}
Content-Type: application/json

{
  "patientId": "uuid",
  "appointmentId": "uuid",
  "diagnosis": "Hypertension Stage 2",
  "treatment": "Prescribed ACE inhibitor, lifestyle modification recommended",
  "medication": "Lisinopril 10mg twice daily",
  "testResults": "Blood pressure 160/100 mmHg",
  "notes": "Patient advised to reduce sodium intake",
  "followUpDate": "2026-05-15"
}
```

#### 2. Get All Patient Records
```
GET /api/patient-records?patientId=uuid&doctorId=uuid&fromDate=2026-01-01&page=1&limit=10
Authorization: Bearer {token}
```

#### 3. Get Patient Record by ID
```
GET /api/patient-records/{recordId}
Authorization: Bearer {token}
```

#### 4. Update Patient Record
```
PUT /api/patient-records/{recordId}
Authorization: Bearer {doctor_token}
Content-Type: application/json

{
  "diagnosis": "Updated diagnosis",
  "treatment": "Updated treatment",
  "followUpDate": "2026-06-15"
}
```

#### 5. Delete Patient Record (Admin)
```
DELETE /api/patient-records/{recordId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "confirmation": true
}
```

## Authentication & Authorization

### JWT Token
- Tokens expire in 7 days
- Include in `Authorization: Bearer {token}` header
- Payload includes: `id`, `email`, `role`

### Role-Based Access Control

**Patient Role**:
- View own profile
- View own appointments
- View own medical records
- Update own profile

**Doctor Role**:
- View own profile
- View own patients' appointments
- Create/update own medical records
- Update own specialization and availability

**Admin Role**:
- Full access to all endpoints
- Manage users, doctors, appointments
- Delete records
- Manage system settings

## Validation Rules

### User Registration
- Email: Valid format, unique
- Password: Minimum 8 characters
- Phone: Valid format (optional)
- Role: Must be `patient`, `doctor`, or `admin`
- Names: Cannot be empty

### Doctor Creation/Update
- Specialization: Required, non-empty
- Qualifications: Required, non-empty
- Consultation Fee: Positive number
- Consultation Duration: Greater than 0
- Available Hours: Valid day and time format

### Patient Records
- Diagnosis: Minimum 10 characters
- Treatment: Minimum 10 characters
- Medication: Minimum 5 characters (optional)
- Follow-up Date: Must be in future

## Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": ["field1 error", "field2 error"]
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden / Access Denied
- `404`: Not Found
- `409`: Conflict (e.g., duplicate email)
- `500`: Server Error

## Pagination

All list endpoints support pagination:
```
GET /api/endpoint?page=1&limit=10
```

**Response**:
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

## Utility Functions

### validation.js
- `isValidEmail()` - Email format validation
- `isValidPassword()` - Password strength (min 8 chars)
- `isValidPhone()` - Phone format validation
- `isValidUUID()` - UUID format validation
- `isValidDate()` - Date format validation
- `isFutureDate()` - Check if date is in future
- `isValidRole()` - Check valid role
- `generateUUID()` - Generate new UUID

### responseFormatter.js
- `sendSuccess()` - Format success response
- `sendError()` - Format error response
- `sendValidationError()` - Format validation errors
- `getPaginationParams()` - Extract and validate pagination
- `buildPaginationResponse()` - Build paginated response
- `formatUserResponse()` - Format user data
- `formatDoctorResponse()` - Format doctor data
- `formatAppointmentResponse()` - Format appointment data
- `formatPatientRecordResponse()` - Format patient record data

## Environment Variables

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_clinic_db
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Remaining Implementation Tasks

### High Priority
1. **Appointments Controller** - Complete CRUD with validation
2. **Queue Management** - Queue status updates, position tracking
3. **Notifications** - Notification creation and delivery
4. **System Settings** - Hospitals, Insurance, Medical Conditions

### Medium Priority
1. **SMS Integration** - SMS notifications via Africa's Talking
2. **Consultation Features** - Online consultation endpoints
3. **Analytics** - Admin dashboard statistics
4. **Logging** - Comprehensive logging system

### Testing
1. Unit tests for all controllers
2. Integration tests for API endpoints
3. Authentication and authorization tests
4. Validation tests

## Migration from Old Schema

If migrating from the old schema:

1. Backup existing database
2. Create new `smart_clinic_db` database
3. Run `smart_clinic_schema.sql` to create tables
4. Migrate data:
   - ClinicStaff → users (with appropriate roles)
   - Patient → users (with patient role)
   - Adjust foreign keys and references

## Development Checklist

- [x] Database schema redesigned
- [x] User registration/login endpoints
- [x] User management endpoints
- [x] Doctor management endpoints
- [x] Patient records endpoints
- [ ] Appointment endpoints
- [ ] Queue management endpoints
- [ ] Notifications endpoints
- [ ] System settings endpoints
- [ ] SMS integration
- [ ] Comprehensive testing
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] Logging system
- [ ] Error tracking (Sentry)

## Support & Questions

For questions or issues with the API implementation, refer to:
- API Documentation: `/API_DOCUMENTATION.md`
- Implementation Progress: `/Backend/IMPLEMENTATION_PROGRESS.md`
- Database Schema: `/Backend/smart_clinic_schema.sql`

