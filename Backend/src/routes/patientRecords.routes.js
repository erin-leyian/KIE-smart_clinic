const express = require('express');
const router = express.Router();
const {
  createPatientRecord,
  getAllPatientRecords,
  getPatientRecordById,
  updatePatientRecord,
  deletePatientRecord,
} = require('../controllers/patientRecords.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// POST create patient record (doctor or admin)
router.post('/', authenticate, requireRole('doctor', 'admin'), createPatientRecord);

// GET all patient records (authenticated - filtered by role)
router.get('/', authenticate, getAllPatientRecords);

// GET patient record by ID
router.get('/:id', authenticate, getPatientRecordById);

// PUT update patient record (doctor who created it or admin)
router.put('/:id', authenticate, updatePatientRecord);

// DELETE patient record (admin only)
router.delete('/:id', authenticate, requireRole('admin'), deletePatientRecord);

module.exports = router;
