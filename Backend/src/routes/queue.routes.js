const express = require('express');
const router = express.Router();
const {
  getQueueForDoctor,
  updateQueueStatus,
  completeQueue,
} = require('../controllers/queue.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// GET /api/queue/doctor/:doctorId — Get patient queue for specific doctor
router.get('/doctor/:doctorId', getQueueForDoctor);

// PUT /api/queue/:queueId — Update queue status (doctor or admin only)
router.put('/:queueId', requireRole('doctor', 'admin'), updateQueueStatus);

// PUT /api/queue/:queueId/complete — Mark queue complete and appointment finished
router.put('/:queueId/complete', requireRole('doctor', 'admin'), completeQueue);

module.exports = router;