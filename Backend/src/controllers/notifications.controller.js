const https = require('https');
const { 
  sendSuccess, sendError, sendValidationError, 
  getPaginationParams, buildPaginationResponse 
} = require('../utils/responseFormatter');
const { 
  isValidUUID, isValidNotificationType, generateUUID, sanitizeInput 
} = require('../utils/validation');

// Supabase REST API helper
async function supabaseQuery(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1${endpoint}`);
    const headers = {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
    };

    const req = https.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ data: result, status: res.statusCode, error: null });
        } catch (e) {
          resolve({ data: null, status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── GET /api/notifications ────────────────────────────────────────────────────
const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { is_read, type } = req.query;
    const userId = req.user?.id;
    const { offset } = getPaginationParams({ page, limit });

    // Build query
    let endpoint = `/notifications?user_id=eq.${userId}&limit=${limit}&offset=${offset}&order=created_at.desc`;

    // Optional filters
    if (is_read !== undefined) {
      const readBool = is_read === 'true';
      endpoint += `&is_read=eq.${readBool}`;
    }

    if (type) {
      const validTypes = ['appointment', 'record', 'system'];
      if (validTypes.includes(type)) {
        endpoint += `&type=eq.${type}`;
      }
    }

    const { data: notifications, status } = await supabaseQuery('GET', endpoint);

    if (status !== 200 || !Array.isArray(notifications)) {
      throw new Error(`Failed to fetch notifications: ${JSON.stringify(notifications)}`);
    }

    const formattedNotifications = notifications.map(notif => ({
      id: notif.id,
      userId: notif.user_id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      isRead: notif.is_read,
      createdAt: notif.created_at,
    }));

    const pagination = buildPaginationResponse(formattedNotifications, formattedNotifications.length, parseInt(page), parseInt(limit));

    return sendSuccess(res, { data: formattedNotifications, pagination });
  } catch (err) {
    console.error('Get notifications error:', err);
    return sendError(res, 'Failed to fetch notifications', 500, err.message);
  }
};

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isValidUUID(id)) return sendError(res, 'Invalid notification ID format', 400);

    // Check if notification belongs to user
    const { data: notifications } = await supabaseQuery('GET', `/notifications?id=eq.${id}&user_id=eq.${userId}`);
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return sendError(res, 'Notification not found', 404);
    }

    // Mark as read
    const { status } = await supabaseQuery('PATCH', `/notifications?id=eq.${id}`, { is_read: true });

    if (status !== 200 && status !== 204) {
      throw new Error('Failed to update notification');
    }

    return sendSuccess(res, null, 'Notification marked as read');
  } catch (err) {
    console.error('Mark notification as read error:', err);
    return sendError(res, 'Failed to update notification', 500, err.message);
  }
};

// ── PATCH /api/notifications/read-all ─────────────────────────────────────────
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Mark all notifications as read for this user
    const { status } = await supabaseQuery('PATCH', `/notifications?user_id=eq.${userId}&is_read=eq.false`, { is_read: true });

    if (status !== 200 && status !== 204) {
      throw new Error('Failed to update notifications');
    }

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
    const { status } = await supabaseQuery('POST', '/notifications', {
      id: notificationId,
      user_id: userId,
      title: sanitizeInput(title),
      message: sanitizeInput(message),
      type: type,
      is_read: false,
    });

    if (status !== 201 && status !== 200) {
      throw new Error('Failed to create notification');
    }

    return notificationId;
  } catch (err) {
    console.error('Create notification error:', err);
    throw err;
  }
};

// ── Helper function to create appointment notifications
const notifyAppointmentCreated = async (appointmentData) => {
  try {
    const { id, patient_id, doctor_id, doctor_first_name, doctor_last_name, patient_first_name, patient_last_name, appointment_date, appointment_time } = appointmentData;
    
    // Notify patient
    const patientTitle = 'Appointment Scheduled';
    const doctorName = `${doctor_first_name} ${doctor_last_name}`;
    const patientMessage = `Your appointment with ${doctorName} is scheduled for ${appointment_date} at ${appointment_time}`;
    await createNotification(patient_id, patientTitle, patientMessage, 'appointment', id);

    // Notify doctor
    const doctorTitle = 'New Appointment';
    const patientName = `${patient_first_name} ${patient_last_name}`;
    const doctorMessage = `${patientName} has booked an appointment for ${appointment_date} at ${appointment_time}`;
    await createNotification(doctor_id, doctorTitle, doctorMessage, 'appointment', id);
  } catch (err) {
    console.error('Notify appointment created error:', err);
  }
};

// ── Helper function to create patient record notifications
const notifyRecordCreated = async (recordData) => {
  try {
    const { id, patient_id, doctor_id, doctor_first_name, doctor_last_name, patient_first_name, patient_last_name } = recordData;

    // Notify patient
    const patientTitle = 'New Medical Record';
    const doctorName = `${doctor_first_name} ${doctor_last_name}`;
    const patientMessage = `${doctorName} has created a new medical record for you`;
    await createNotification(patient_id, patientTitle, patientMessage, 'record', id);

    // Notify doctor (confirmation)
    const doctorTitle = 'Record Created';
    const patientName = `${patient_first_name} ${patient_last_name}`;
    const doctorMessage = `You have created a medical record for ${patientName}`;
    await createNotification(doctor_id, doctorTitle, doctorMessage, 'record', id);
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
