-- smart_clinic_schema.sql
-- Database: Smart Clinic Management System
-- Aligned with API documentation v1.0

CREATE DATABASE IF NOT EXISTS smart_clinic_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE smart_clinic_db;

-- Ensure consistent timezone (UTC)
SET TIME_ZONE = '+00:00';

-- Strict mode for data integrity
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- 1. Users Table (Patient, Doctor, Admin)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
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

-- 2. Doctor Specializations Table
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

-- 3. Available Hours for Doctors
CREATE TABLE availableHours (
    id VARCHAR(36) PRIMARY KEY,
    doctorId VARCHAR(36) NOT NULL,
    day VARCHAR(20) NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_doctor_day (doctorId, day)
);

-- 4. Appointments
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    doctorId VARCHAR(36) NOT NULL,
    patientId VARCHAR(36) NOT NULL,
    appointmentDate DATE NOT NULL,
    appointmentTime TIME NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE RESTRICT,
    KEY idx_appt_date (appointmentDate),
    KEY idx_appt_status (status),
    KEY idx_doctor_date (doctorId, appointmentDate),
    KEY idx_patient_date (patientId, appointmentDate)
);

-- 5. Patient Records
CREATE TABLE patientRecords (
    id VARCHAR(36) PRIMARY KEY,
    patientId VARCHAR(36) NOT NULL,
    doctorId VARCHAR(36) NOT NULL,
    appointmentId VARCHAR(36),
    diagnosis VARCHAR(255) NOT NULL,
    treatment TEXT NOT NULL,
    medication TEXT,
    testResults TEXT,
    notes TEXT,
    followUpDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL,
    KEY idx_patient (patientId),
    KEY idx_doctor (doctorId),
    KEY idx_createdAt (createdAt)
);

-- 6. Queue Management
CREATE TABLE queueEntries (
    id VARCHAR(36) PRIMARY KEY,
    appointmentId VARCHAR(36),
    patientId VARCHAR(36) NOT NULL,
    doctorId VARCHAR(36),
    reason VARCHAR(255),
    status ENUM('waiting', 'in-progress', 'completed', 'no-show') DEFAULT 'waiting',
    position INT,
    estimatedWaitTime INT,
    arrivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE SET NULL,
    KEY idx_status (status),
    KEY idx_doctor_status (doctorId, status),
    KEY idx_arrived (arrivedAt)
);

-- 7. Notifications
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('appointment', 'record', 'system') DEFAULT 'system',
    relatedId VARCHAR(36),
    read BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_user_read (userId, read),
    KEY idx_created (createdAt)
);

-- 8. Hospitals
CREATE TABLE hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(20),
    type VARCHAR(100),
    image LONGTEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    reviews INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_name (name)
);

-- 9. Insurance Providers
CREATE TABLE insuranceProviders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    fullName VARCHAR(255),
    type VARCHAR(100),
    coverage VARCHAR(20),
    conditions TEXT,
    benefits JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_name (name)
);

-- 10. Medical Conditions
CREATE TABLE medicalConditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    prevalence VARCHAR(50),
    icon VARCHAR(10),
    treatments JSON,
    specialists JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_name (name)
);

