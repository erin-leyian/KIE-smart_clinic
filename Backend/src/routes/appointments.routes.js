const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} = require('../controllers/appointments.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', requireRole('Admin', 'receptionist'), getAppointments);
router.get('/:id', requireRole('Admin', 'receptionist'), getAppointmentById);
router.post('/', requireRole('Admin', 'receptionist'), createAppointment);
router.put('/:id', requireRole('Admin', 'receptionist'), updateAppointment);
router.delete('/:id', requireRole('Admin', 'receptionist'), cancelAppointment);

module.exports = router;