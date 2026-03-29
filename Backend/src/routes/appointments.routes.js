const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointments.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All appointment endpoints require authentication
router.use(authenticate);

// Patient can create their own appointments, doctor/admin can create for anyone
router.post('/', requireRole('patient', 'doctor', 'admin'), createAppointment);

// Get all appointments (filtered by role)
router.get('/', getAllAppointments);

// Get specific appointment (with access control)
router.get('/:id', getAppointmentById);

// Update appointment (patient updates own, doctor/admin can update any)
router.put('/:id', updateAppointment);

// Delete appointment (patient deletes own, doctor/admin can delete any)
router.delete('/:id', deleteAppointment);

module.exports = router;