/**
 * Data Access Control Utility
 * Provides role-based data filtering and access control
 */

import mockData from '../data/mockData.json';

/**
 * Get current logged-in user from localStorage
 * @returns {Object|null} User object or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    return JSON.parse(storedUser);
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
    return null;
  }
};

/**
 * Get user role from localStorage
 * @returns {string} User role (patient, doctor, admin)
 */
export const getUserRole = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return 'patient';
    const user = JSON.parse(storedUser);
    return user.role || 'patient';
  } catch (err) {
    console.error('Error getting user role:', err);
    return 'patient';
  }
};

/**
 * Get user data from mockData by ID or email
 * @param {Object} currentUser - Current user object
 * @returns {Object|null} Full user data from mockData
 */
export const getUserData = (currentUser) => {
  if (!currentUser) return null;
  
  return mockData.users.find(
    u => u.id === currentUser.id || u.email === currentUser.email
  ) || null;
};

/**
 * Get appointments filtered by role
 * Patients see only their appointments
 * Doctors see appointments with them
 * Admins see all appointments
 * @param {string} userRole - User role
 * @param {Object} currentUser - Current user object
 * @returns {Array} Filtered appointments
 */
export const getFilteredAppointments = (userRole, currentUser) => {
  const appointments = mockData.appointments || [];
  
  if (userRole === 'patient' && currentUser) {
    // Patients see only their appointments
    return appointments.filter(
      apt => apt.patientId === currentUser.id || apt.patientName === currentUser.name
    );
  }
  
  if (userRole === 'doctor' && currentUser) {
    // Doctors see appointments where they are the doctor
    return appointments.filter(apt => apt.doctorName === currentUser.name);
  }
  
  // Admins and default: see all appointments
  return appointments;
};

/**
 * Get patient records filtered by role
 * Patients see only their records
 * Doctors see records of their patients
 * Admins see all records
 * @param {string} userRole - User role
 * @param {Object} currentUser - Current user object
 * @returns {Array} Filtered patient records
 */
export const getFilteredPatientRecords = (userRole, currentUser) => {
  const records = mockData.patientRecords || [];
  
  if (userRole === 'patient' && currentUser) {
    // Patients see only their records
    return records.filter(
      record => record.patientId === currentUser.id || record.patientName === currentUser.name
    );
  }
  
  if (userRole === 'doctor' && currentUser) {
    // Doctors see records of appointments they have with patients
    const doctorAppointments = mockData.appointments.filter(
      apt => apt.doctorName === currentUser.name
    );
    const patientIds = new Set(doctorAppointments.map(apt => apt.patientId));
    
    return records.filter(record => patientIds.has(record.patientId));
  }
  
  // Admins and default: see all records
  return records;
};

/**
 * Get doctors list filtered by availability and role
 * Patients and Admins see all doctors
 * Doctors see other doctors
 * @param {string} userRole - User role
 * @param {Object} currentUser - Current user object
 * @returns {Array} Filtered doctors list
 */
export const getFilteredDoctors = (userRole, currentUser) => {
  const doctors = mockData.doctors || [];
  
  if (userRole === 'doctor' && currentUser) {
    // Doctors see all doctors except themselves
    return doctors.filter(d => d.name !== currentUser.name);
  }
  
  // Patients and admins see all doctors
  return doctors;
};

/**
 * Get user's upcoming appointments (next 4-5)
 * @param {string} userRole - User role
 * @param {Object} currentUser - Current user object
 * @param {number} limit - Number of appointments to return
 * @returns {Array} Upcoming appointments
 */
export const getUpcomingAppointments = (userRole, currentUser, limit = 4) => {
  const allAppointments = getFilteredAppointments(userRole, currentUser);
  
  // Sort by date and get the first 'limit' appointments
  return allAppointments
    .sort((a, b) => new Date(a.dateObj) - new Date(b.dateObj))
    .slice(0, limit);
};

/**
 * Check if user can view a specific appointment
 * @param {Object} appointment - Appointment object
 * @param {string} userRole - User role
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if user can view the appointment
 */
export const canViewAppointment = (appointment, userRole, currentUser) => {
  if (userRole === 'admin') return true; // Admins see all
  
  if (userRole === 'patient' && currentUser) {
    return appointment.patientId === currentUser.id || 
           appointment.patientName === currentUser.name;
  }
  
  if (userRole === 'doctor' && currentUser) {
    return appointment.doctorName === currentUser.name;
  }
  
  return false;
};

/**
 * Check if user can edit/delete a resource
 * Patients can only edit their own data
 * Doctors can edit their own appointments/availability
 * Admins can edit everything
 * @param {Object} resource - Resource object (appointment, record, etc)
 * @param {string} userRole - User role
 * @param {Object} currentUser - Current user object
 * @returns {boolean} True if user can edit the resource
 */
export const canEditResource = (resource, userRole, currentUser) => {
  if (userRole === 'admin') return true; // Admins can edit everything
  
  if (userRole === 'patient' && currentUser) {
    // Patients can only edit their own resources
    return resource.patientId === currentUser.id || 
           resource.patientName === currentUser.name;
  }
  
  if (userRole === 'doctor' && currentUser) {
    // Doctors can edit appointments they're part of
    return resource.doctorName === currentUser.name;
  }
  
  return false;
};

/**
 * Get dashboard statistics for current user
 * @param {string} userRole - User role
 * @param {Object} currentUser - Current user object
 * @returns {Object} Statistics object
 */
export const getDashboardStats = (userRole, currentUser) => {
  const appointments = getFilteredAppointments(userRole, currentUser);
  const records = getFilteredPatientRecords(userRole, currentUser);
  
  const stats = {
    totalAppointments: appointments.length,
    upcomingAppointments: appointments.filter(
      a => new Date(a.dateObj) >= new Date()
    ).length,
    completedAppointments: appointments.filter(a => a.status === 'Completed').length,
    pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
    totalRecords: records.length,
  };
  
  return stats;
};

/**
 * Get navigation items based on user role
 * @param {string} userRole - User role
 * @returns {Array} Navigation items array
 */
export const getNavigationItems = (userRole) => {
  const baseItems = [
    { label: 'Help', icon: 'HelpCircle' },
  ];
  
  switch (userRole) {
    case 'patient':
      return [
        { label: 'Dashboard', icon: 'Home' },
        { label: 'All Doctors', icon: 'Users' },
        { label: 'My Appointments', icon: 'Calendar' },
        { label: 'Patient Records', icon: 'FileText' },
        { label: 'Notifications', icon: 'Bell' },
        { label: 'Profile', icon: 'User' },
        ...baseItems,
      ];
    
    case 'doctor':
      return [
        { label: 'Dashboard', icon: 'Home' },
        { label: 'My Availability', icon: 'Clock' },
        { label: 'Notifications', icon: 'Bell' },
        { label: 'Profile', icon: 'User' },
        ...baseItems,
      ];
    
    case 'admin':
      return [
        { label: 'Dashboard', icon: 'Home' },
        { label: 'All Doctors', icon: 'Users' },
        { label: 'All Appointments', icon: 'Calendar' },
        { label: 'All Records', icon: 'FileText' },
        { label: 'System Settings', icon: 'Settings' },
        { label: 'Notifications', icon: 'Bell' },
        { label: 'Profile', icon: 'User' },
        ...baseItems,
      ];
    
    default:
      return [
        { label: 'Dashboard', icon: 'Home' },
        { label: 'All Doctors', icon: 'Users' },
        { label: 'My Appointments', icon: 'Calendar' },
        ...baseItems,
      ];
  }
};
