-- smart_clinic_schema.sql
-- Database: Smart Clinic Management System
-- Platform: Supabase (PostgreSQL)
-- Aligned with API documentation v1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSON extension
CREATE EXTENSION IF NOT EXISTS "json";

-- 1. Users Table (Patient, Doctor, Admin)
-- Note: PostgreSQL uses snake_case for columns
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT users_email_unique UNIQUE(email),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_created_at (created_at)
);

-- 2. Doctor Specializations Table
CREATE TABLE IF NOT EXISTS doctor_specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL,
    qualifications VARCHAR(255),
    years_of_experience INT DEFAULT 0,
    consultation_fee NUMERIC(10, 2),
    consultation_duration INT DEFAULT 30,
    consultation_enabled BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    total_consultations INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_specialization (specialization)
);

-- 3. Available Hours for Doctors
CREATE TABLE IF NOT EXISTS available_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_doctor_day (doctor_id, day)
);

-- 4. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_status (status),
    INDEX idx_doctor_date (doctor_id, appointment_date),
    INDEX idx_patient_date (patient_id, appointment_date)
);

-- 5. Patient Records
CREATE TABLE IF NOT EXISTS patient_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    diagnosis VARCHAR(255) NOT NULL,
    treatment TEXT NOT NULL,
    medication TEXT,
    test_results TEXT,
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_created_at (created_at)
);

-- 6. Queue Management
CREATE TABLE IF NOT EXISTS queue_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed', 'no-show')),
    position INT,
    estimated_wait_time INT,
    arrived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_doctor_status (doctor_id, status),
    INDEX idx_arrived (arrived_at)
);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'system' CHECK (type IN ('appointment', 'record', 'system')),
    related_id UUID,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_read (user_id, read),
    INDEX idx_created (created_at)
);

-- 8. Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(20),
    type VARCHAR(100),
    image TEXT,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
);

-- 9. Insurance Providers
CREATE TABLE IF NOT EXISTS insurance_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255),
    type VARCHAR(100),
    coverage VARCHAR(20),
    conditions TEXT,
    benefits JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
);

-- 10. Medical Conditions
CREATE TABLE IF NOT EXISTS medical_conditions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    prevalence VARCHAR(50),
    icon VARCHAR(10),
    treatments JSON,
    specialists JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
);

