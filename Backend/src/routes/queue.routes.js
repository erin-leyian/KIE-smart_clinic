const express = require('express');
const router = express.Router();
const {
  getQueue,
  getQueuePosition,
  checkInPatient,
  removeFromQueue,
  reorderQueue,
} = require('../controllers/queue.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// GET /api/queue — get the full live queue (staff view)
router.get('/', requireRole('admin', 'receptionist'), getQueue);

// GET /api/queue/position/:patientId — get a specific patient's queue position
router.get('/position/:patientId', requireRole('admin', 'receptionist'), getQueuePosition);

// POST /api/queue/checkin/:patientId — check in a patient (adds them to the queue)
router.post('/checkin/:patientId', requireRole('admin', 'receptionist'), checkInPatient);

// DELETE /api/queue/:tokenId — remove a patient from the queue
router.delete('/:tokenId', requireRole('admin', 'receptionist'), removeFromQueue);

// PUT /api/queue/reorder — reorder the queue (admin only)
router.put('/reorder', requireRole('admin'), reorderQueue);

module.exports = router;