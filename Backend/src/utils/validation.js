const { v4: uuidv4, validate: uuidValidate } = require('uuid');

/**
 * Validation utilities
 */

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  // Minimum 8 characters
  return password && password.length >= 8;
};

const isValidPhone = (phone) => {
  // Basic phone validation - allows various formats
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return !phone || phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidUUID = (id) => {
  return uuidValidate(id);
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const isFutureDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

const isValidTime = (timeString) => {
  // HH:MM format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

const isValidRole = (role) => {
  const validRoles = ['patient', 'doctor', 'admin'];
  return validRoles.includes(role);
};

const isValidGender = (gender) => {
  const validGenders = ['male', 'female', 'other'];
  return !gender || validGenders.includes(gender);
};

const isValidAppointmentStatus = (status) => {
  const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
  return validStatuses.includes(status);
};

const isValidQueueStatus = (status) => {
  const validStatuses = ['waiting', 'in-progress', 'completed', 'no-show'];
  return validStatuses.includes(status);
};

const isValidNotificationType = (type) => {
  const validTypes = ['appointment', 'record', 'system'];
  return validTypes.includes(type);
};

const isMinLength = (text, minLength) => {
  return text && text.trim().length >= minLength;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

const generateUUID = () => {
  return uuidv4();
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidUUID,
  isValidDate,
  isFutureDate,
  isValidTime,
  isValidRole,
  isValidGender,
  isValidAppointmentStatus,
  isValidQueueStatus,
  isValidNotificationType,
  isMinLength,
  sanitizeInput,
  generateUUID,
};
