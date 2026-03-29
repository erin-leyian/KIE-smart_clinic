const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All notification endpoints require authentication
router.use(authenticate);

// GET /api/notifications — Get user's notifications (filtered by read status and type)
router.get('/', getAllNotifications);

// PUT /api/notifications/:id/read — Mark single notification as read
router.put('/:id/read', markNotificationAsRead);

// PUT /api/notifications/read-all — Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

module.exports = router;
