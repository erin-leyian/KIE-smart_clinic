const pool = require('../db');
const { 
  sendSuccess, sendError, sendValidationError, 
  getPaginationParams, buildPaginationResponse 
} = require('../utils/responseFormatter');
const { 
  isValidUUID, isValidNotificationType, generateUUID, sanitizeInput 
} = require('../utils/validation');

// ── GET /api/notifications ────────────────────────────────────────────────────
const getAllNotifications = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const { read, type } = req.query;
    const userId = req.user?.id;

    let query = 'SELECT * FROM notifications WHERE userId = ?';
    const params = [userId];

    // Optional filters
    if (read !== undefined) {
      const readBool = read === 'true';
      query += ' AND read = ?';
      params.push(readBool);
    }

    if (type) {
      const validTypes = ['appointment', 'record', 'system'];
      if (validTypes.includes(type)) {
        query += ' AND type = ?';
        params.push(type);
      }
    }

    query += ' ORDER BY createdAt DESC';

    // Get total count
    const countQuery = query.replace(/SELECT \*/, 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    const offset = (page - 1) * limit;
    const paginatedQuery = query + ' LIMIT ?, ?';
    const paginatedParams = [...params, offset, limit];

    const [notifications] = await pool.query(paginatedQuery, paginatedParams);

    const formattedNotifications = notifications.map(notif => ({
      id: notif.id,
      userId: notif.userId,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      relatedId: notif.relatedId,
      read: Boolean(notif.read),
      createdAt: notif.createdAt,
    }));

    const pagination = buildPaginationResponse(formattedNotifications, total, page, limit);

    return sendSuccess(res, formattedNotifications, 'Notifications retrieved successfully', 200, pagination);
  } catch (err) {
    console.error('Get notifications error:', err);
    return sendError(res, 'Failed to fetch notifications', 500, err.message);
  }
};

// ── PUT /api/notifications/:id/read ───────────────────────────────────────────
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isValidUUID(id)) return sendError(res, 'Invalid notification ID format', 400);

    // Check if notification belongs to user
    const [notification] = await pool.query('SELECT * FROM notifications WHERE id = ? AND userId = ?', [id, userId]);
    if (notification.length === 0) return sendError(res, 'Notification not found', 404);

    // Mark as read
    await pool.query('UPDATE notifications SET read = true WHERE id = ?', [id]);

    return sendSuccess(res, null, 'Notification marked as read');
  } catch (err) {
    console.error('Mark notification as read error:', err);
    return sendError(res, 'Failed to update notification', 500, err.message);
  }
};

// ── PUT /api/notifications/read-all ───────────────────────────────────────────
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Mark all notifications as read for this user
    await pool.query('UPDATE notifications SET read = true WHERE userId = ? AND read = false', [userId]);

    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    return sendError(res, 'Failed to update notifications', 500, err.message);
  }
};

// ── Helper function to create notification (used by other controllers)
const createNotification = async (userId, title, message, type, relatedId = null) => {
  try {
    if (!isValidNotificationType(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    const notificationId = generateUUID();
    await pool.query(
      `INSERT INTO notifications (id, userId, title, message, type, relatedId, read, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, false, NOW())`,
      [notificationId, userId, sanitizeInput(title), sanitizeInput(message), type, relatedId]
    );

    return notificationId;
  } catch (err) {
    console.error('Create notification error:', err);
    throw err;
  }
};

// ── Helper function to create appointment notifications
const notifyAppointmentCreated = async (appointmentData) => {
  try {
    const { id, patientId, doctorId, doctorName, patientName, appointmentDate, appointmentTime } = appointmentData;
    
    // Notify patient
    const patientTitle = 'Appointment Scheduled';
    const patientMessage = `Your appointment with ${doctorName} is scheduled for ${appointmentDate} at ${appointmentTime}`;
    await createNotification(patientId, patientTitle, patientMessage, 'appointment', id);

    // Notify doctor
    const doctorTitle = 'New Appointment';
    const doctorMessage = `${patientName} has booked an appointment for ${appointmentDate} at ${appointmentTime}`;
    await createNotification(doctorId, doctorTitle, doctorMessage, 'appointment', id);
  } catch (err) {
    console.error('Notify appointment created error:', err);
  }
};

// ── Helper function to create patient record notifications
const notifyRecordCreated = async (recordData) => {
  try {
    const { id, patientId, doctorId, doctorName, patientName } = recordData;

    // Notify patient
    const patientTitle = 'New Medical Record';
    const patientMessage = `${doctorName} has created a new medical record for you`;
    await createNotification(patientId, patientTitle, patientMessage, 'record', id);

    // Notify doctor (confirmation)
    const doctorTitle = 'Record Created';
    const doctorMessage = `You have created a medical record for ${patientName}`;
    await createNotification(doctorId, doctorTitle, doctorMessage, 'record', id);
  } catch (err) {
    console.error('Notify record created error:', err);
  }
};

module.exports = {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  notifyAppointmentCreated,
  notifyRecordCreated,
};
