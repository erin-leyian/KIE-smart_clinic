const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctors.controller');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth.middleware');

// GET all doctors (public - no auth required for viewing list)
router.get('/', optionalAuth, getAllDoctors);

// GET doctor by ID (public - no auth required for viewing details)
router.get('/:id', optionalAuth, getDoctorById);

// POST create doctor (admin only)
router.post('/', authenticate, requireRole('admin'), createDoctor);

// PUT update doctor (self or admin)
router.put('/:id', authenticate, updateDoctor);

// DELETE doctor (admin only)
router.delete('/:id', authenticate, requireRole('admin'), deleteDoctor);

module.exports = router;
