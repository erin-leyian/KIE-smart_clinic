-- smart_clinic_schema.sql
-- Database: Smart Clinic Queue & Appointment Optimization System

CREATE DATABASE IF NOT EXISTS smart_clinic_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE smart_clinic_db;

-- Ensure consistent timezone (UTC) for sync across devices
SET TIME_ZONE = '+00:00';

-- Strict mode for better data integrity
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- 1. Clinic
CREATE TABLE Clinic (
    ClinicID       INT AUTO_INCREMENT PRIMARY KEY,
    Name           VARCHAR(100) NOT NULL,
    Location       VARCHAR(150),
    ContactPhone   VARCHAR(20),
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ClinicStaff
CREATE TABLE ClinicStaff (
    StaffID        INT AUTO_INCREMENT PRIMARY KEY,
    ClinicID       INT NOT NULL,
    FirstName      VARCHAR(50) NOT NULL,
    LastName       VARCHAR(50) NOT NULL,
    PhoneNumber    VARCHAR(20) UNIQUE,
    Email          VARCHAR(100) UNIQUE,
    Role           ENUM('Receptionist', 'Nurse', 'Doctor', 'Admin', 'Other') NOT NULL,
    PasswordHash   VARCHAR(255) NOT NULL,          -- bcrypt/argon2 in application
    IsActive       TINYINT(1) DEFAULT 1,            -- soft delete / deactivation
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (ClinicID) REFERENCES Clinic(ClinicID) ON DELETE RESTRICT,
    INDEX idx_staff_phone (PhoneNumber),
    INDEX idx_staff_email (Email)
);

-- 3. Doctor (subset of staff)
CREATE TABLE Doctor (
    DoctorID       INT AUTO_INCREMENT PRIMARY KEY,
    StaffID        INT NOT NULL UNIQUE,
    Specialization VARCHAR(100),
    AvailabilityDays VARCHAR(100),                -- e.g. "Mon,Tue,Thu" or JSON
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (StaffID) REFERENCES ClinicStaff(StaffID) ON DELETE CASCADE
);

-- 4. Patient
CREATE TABLE Patient (
    PatientID      INT AUTO_INCREMENT PRIMARY KEY,
    FirstName      VARCHAR(50) NOT NULL,
    LastName       VARCHAR(50) NOT NULL,
    PhoneNumber    VARCHAR(20) UNIQUE NOT NULL,     -- primary contact for SMS
    Email          VARCHAR(100),
    DateOfBirth    DATE,
    Gender         ENUM('Male', 'Female', 'Other', 'Prefer not to say'),
    Address        TEXT,
    IsActive       TINYINT(1) DEFAULT 1,
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_patient_phone (PhoneNumber)
);

-- 5. Appointment
CREATE TABLE Appointment (
    AppointmentID     INT AUTO_INCREMENT PRIMARY KEY,
    PatientID         INT NOT NULL,
    DoctorID          INT NOT NULL,
    AppointmentDate   DATE NOT NULL,
    AppointmentTime   TIME NOT NULL,
    Duration          INT DEFAULT 15,               -- minutes
    Status            ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-Show') DEFAULT 'Pending',
    BookedAt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes             TEXT,
    CreatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE RESTRICT,
    FOREIGN KEY (DoctorID) REFERENCES Doctor(DoctorID) ON DELETE RESTRICT,

    INDEX idx_appt_date_time (AppointmentDate, AppointmentTime),
    UNIQUE INDEX uk_doctor_slot (DoctorID, AppointmentDate, AppointmentTime) COMMENT 'Prevent double-booking'
);

-- 6. QueueEntry (walk-ins + checked-in appointments)
CREATE TABLE QueueEntry (
    QueueEntryID      INT AUTO_INCREMENT PRIMARY KEY,
    PatientID         INT NOT NULL,
    AppointmentID     INT NULL,                     -- NULL = walk-in
    ClinicID          INT NOT NULL,
    DoctorID          INT NULL,                     -- NULL = general queue
    ArrivalTime       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    QueueNumber       INT,                          -- can be generated per day/clinic
    UrgencyLevel      ENUM('Low', 'Medium', 'High', 'Emergency') DEFAULT 'Medium',
    Status            ENUM('Waiting', 'InProgress', 'Completed', 'Skipped', 'Cancelled') DEFAULT 'Waiting',
    CalledTime        TIMESTAMP NULL,
    EstimatedWaitTime INT NULL,                     -- minutes
    PositionInQueue   INT NULL,                     -- maintained by app logic
    CreatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (PatientID)     REFERENCES Patient(PatientID)     ON DELETE RESTRICT,
    FOREIGN KEY (AppointmentID) REFERENCES Appointment(AppointmentID) ON DELETE SET NULL,
    FOREIGN KEY (ClinicID)      REFERENCES Clinic(ClinicID)       ON DELETE RESTRICT,
    FOREIGN KEY (DoctorID)      REFERENCES Doctor(DoctorID)       ON DELETE SET NULL,

    INDEX idx_queue_status_arrival (Status, ArrivalTime),
    INDEX idx_queue_urgency (UrgencyLevel, ArrivalTime),
    INDEX idx_queue_today (ClinicID, DATE(ArrivalTime), Status)
);

-- 7. Notification (SMS / push history)
CREATE TABLE Notification (
    NotificationID    INT AUTO_INCREMENT PRIMARY KEY,
    PatientID         INT NOT NULL,
    QueueEntryID      INT NULL,
    AppointmentID     INT NULL,
    Type              ENUM('Reminder', 'QueueUpdate', 'Cancellation', 'Ready', 'Other') NOT NULL,
    Message           TEXT NOT NULL,
    SentAt            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeliveryStatus    ENUM('Pending', 'Sent', 'Delivered', 'Failed') DEFAULT 'Pending',
    CreatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (PatientID)     REFERENCES Patient(PatientID)     ON DELETE CASCADE,
    FOREIGN KEY (QueueEntryID)  REFERENCES QueueEntry(QueueEntryID)  ON DELETE SET NULL,
    FOREIGN KEY (AppointmentID) REFERENCES Appointment(AppointmentID) ON DELETE SET NULL
);