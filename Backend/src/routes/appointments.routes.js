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

router.get('/', requireRole('admin', 'receptionist'), getAppointments);
router.get('/:id', requireRole('admin', 'receptionist'), getAppointmentById);
router.post('/', requireRole('admin', 'receptionist'), createAppointment);
router.put('/:id', requireRole('admin', 'receptionist'), updateAppointment);
router.delete('/:id', requireRole('admin', 'receptionist'), cancelAppointment);

module.exports = router;