const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctors.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// GET all doctors (public - no auth required, but can be authenticated)
router.get('/', authenticate, getAllDoctors);

// GET doctor by ID
router.get('/:id', authenticate, getDoctorById);

// POST create doctor (admin only)
router.post('/', authenticate, requireRole('admin'), createDoctor);

// PUT update doctor (self or admin)
router.put('/:id', authenticate, updateDoctor);

// DELETE doctor (admin only)
router.delete('/:id', authenticate, requireRole('admin'), deleteDoctor);

module.exports = router;
