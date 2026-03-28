/**
 * Appointment Notification Management
 * Handles creating, sending, and managing appointment-related notifications
 * Now with role-based filtering and user-specific notifications
 */

const NOTIFICATION_TYPES = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled',
  REMINDER: 'Reminder',
  UPDATED: 'Updated',
};

/**
 * Get current user from localStorage
 */
const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    return JSON.parse(storedUser);
  } catch (err) {
    console.error('Error parsing user:', err);
    return null;
  }
};

/**
 * Get user role from localStorage
 */
const getUserRole = () => {
  try {
    const storedRole = localStorage.getItem('userRole');
    return storedRole || 'patient';
  } catch (err) {
    console.error('Error getting user role:', err);
    return 'patient';
  }
};

/**
 * Create a new appointment notification with role filtering
 */
const createAppointmentNotification = (type, appointmentData, recipientRole = 'patient') => {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const currentUser = getCurrentUser();
  
  const notificationTemplates = {
    [NOTIFICATION_TYPES.CONFIRMED]: {
      patient: {
        title: 'Appointment Confirmed',
        message: `Your appointment with ${appointmentData.doctorName} on ${appointmentData.date} at ${appointmentData.time} has been confirmed.`,
      },
      doctor: {
        title: 'Appointment Confirmed',
        message: `You have confirmed appointment with ${appointmentData.patientName} on ${appointmentData.date} at ${appointmentData.time}.`,
      },
      admin: {
        title: 'Appointment Confirmed',
        message: `Appointment confirmed: ${appointmentData.patientName} with ${appointmentData.doctorName} on ${appointmentData.date}.`,
      },
    },
    [NOTIFICATION_TYPES.CANCELLED]: {
      patient: {
        title: 'Appointment Cancelled',
        message: `Your appointment with ${appointmentData.doctorName} on ${appointmentData.date} has been cancelled.`,
      },
      doctor: {
        title: 'Appointment Cancelled',
        message: `You cancelled appointment with ${appointmentData.patientName} on ${appointmentData.date}.`,
      },
      admin: {
        title: 'Appointment Cancelled',
        message: `Appointment cancelled: ${appointmentData.patientName} with ${appointmentData.doctorName}.`,
      },
    },
    [NOTIFICATION_TYPES.RESCHEDULED]: {
      patient: {
        title: 'Appointment Rescheduled',
        message: `Your appointment with ${appointmentData.doctorName} has been moved to ${appointmentData.newDate} at ${appointmentData.newTime}.`,
      },
      doctor: {
        title: 'Appointment Rescheduled',
        message: `Your appointment with ${appointmentData.patientName} has been rescheduled to ${appointmentData.newDate} at ${appointmentData.newTime}.`,
      },
      admin: {
        title: 'Appointment Rescheduled',
        message: `Appointment rescheduled: ${appointmentData.patientName} with ${appointmentData.doctorName}.`,
      },
    },
    [NOTIFICATION_TYPES.REMINDER]: {
      patient: {
        title: 'Appointment Reminder',
        message: `Reminder: You have an appointment with ${appointmentData.doctorName} today at ${appointmentData.time}.`,
      },
      doctor: {
        title: 'Appointment Reminder',
        message: `Reminder: You have an appointment with ${appointmentData.patientName} today at ${appointmentData.time}.`,
      },
      admin: {
        title: 'Appointment Reminder',
        message: `Reminder: Appointment between ${appointmentData.patientName} and ${appointmentData.doctorName} today.`,
      },
    },
    [NOTIFICATION_TYPES.UPDATED]: {
      patient: {
        title: 'Appointment Updated',
        message: `Your appointment details with ${appointmentData.doctorName} have been updated.`,
      },
      doctor: {
        title: 'Availability Updated',
        message: `Your availability has been updated successfully.`,
      },
      admin: {
        title: 'Appointment Updated',
        message: `Appointment updated: ${appointmentData.patientName} with ${appointmentData.doctorName}.`,
      },
    },
  };

  const template = notificationTemplates[type]?.[recipientRole] || 
                   notificationTemplates[NOTIFICATION_TYPES.UPDATED]?.[recipientRole];

  return {
    id,
    type,
    title: template.title,
    message: template.message,
    timestamp: new Date().toISOString(),
    read: false,
    recipientRole,
    recipientId: currentUser?.id || null,
    recipientName: currentUser?.name || null,
    appointmentDetails: {
      id: appointmentData.id,
      patientName: appointmentData.patientName,
      patientId: appointmentData.patientId,
      doctorName: appointmentData.doctorName,
      specialty: appointmentData.specialty,
      date: appointmentData.date,
      time: appointmentData.time,
      location: appointmentData.hospital || appointmentData.location,
      fee: appointmentData.fee,
      type: appointmentData.type,
    },
  };
};

/**
 * Add notification to localStorage (role-specific)
 */
const addNotification = (notification) => {
  const existing = localStorage.getItem('notifications');
  const notifications = existing ? JSON.parse(existing) : [];
  
  // Add new notification at the beginning
  notifications.unshift(notification);
  
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.pop();
  }
  
  localStorage.setItem('notifications', JSON.stringify(notifications));
  
  // Trigger notification event for real-time updates
  window.dispatchEvent(new CustomEvent('notificationAdded', { detail: notification }));
  
  return notification;
};

/**
 * Get user-specific notifications (filtered by role and user ID)
 */
const getUserNotifications = () => {
  const currentUser = getCurrentUser();
  const userRole = getUserRole();
  
  if (!currentUser) return [];
  
  const allNotifications = localStorage.getItem('notifications');
  const notifications = allNotifications ? JSON.parse(allNotifications) : [];
  
  // Filter notifications for current user
  return notifications.filter(notif => {
    // Admin sees all notifications
    if (userRole === 'admin') return true;
    
    // User sees notifications intended for their role and their specific user ID
    return notif.recipientRole === userRole && notif.recipientId === currentUser.id;
  });
};

/**
 * Send appointment confirmed notification (to both patient and doctor)
 */
const notifyAppointmentConfirmed = (appointmentData, triggeredBy = 'doctor') => {
  const notifications = [];
  
  // Notify patient
  const patientNotif = createAppointmentNotification(NOTIFICATION_TYPES.CONFIRMED, appointmentData, 'patient');
  patientNotif.recipientId = appointmentData.patientId;
  patientNotif.recipientName = appointmentData.patientName;
  notifications.push(addNotification(patientNotif));
  
  // Notify doctor (if not the one who triggered it)
  if (triggeredBy !== 'doctor') {
    const doctorNotif = createAppointmentNotification(NOTIFICATION_TYPES.CONFIRMED, appointmentData, 'doctor');
    doctorNotif.recipientId = appointmentData.doctorId;
    doctorNotif.recipientName = appointmentData.doctorName;
    notifications.push(addNotification(doctorNotif));
  }
  
  return notifications;
};

/**
 * Send appointment cancelled notification (to both parties)
 */
const notifyAppointmentCancelled = (appointmentData, triggeredBy = 'doctor') => {
  const notifications = [];
  
  // Notify patient
  const patientNotif = createAppointmentNotification(NOTIFICATION_TYPES.CANCELLED, appointmentData, 'patient');
  patientNotif.recipientId = appointmentData.patientId;
  patientNotif.recipientName = appointmentData.patientName;
  notifications.push(addNotification(patientNotif));
  
  // Notify doctor (if not the one who triggered it)
  if (triggeredBy !== 'doctor') {
    const doctorNotif = createAppointmentNotification(NOTIFICATION_TYPES.CANCELLED, appointmentData, 'doctor');
    doctorNotif.recipientId = appointmentData.doctorId;
    doctorNotif.recipientName = appointmentData.doctorName;
    notifications.push(addNotification(doctorNotif));
  }
  
  return notifications;
};

/**
 * Send appointment rescheduled notification
 */
const notifyAppointmentRescheduled = (appointmentData, triggeredBy = 'doctor') => {
  const notifications = [];
  
  // Notify patient
  const patientNotif = createAppointmentNotification(NOTIFICATION_TYPES.RESCHEDULED, appointmentData, 'patient');
  patientNotif.recipientId = appointmentData.patientId;
  patientNotif.recipientName = appointmentData.patientName;
  notifications.push(addNotification(patientNotif));
  
  // Notify doctor
  if (triggeredBy !== 'doctor') {
    const doctorNotif = createAppointmentNotification(NOTIFICATION_TYPES.RESCHEDULED, appointmentData, 'doctor');
    doctorNotif.recipientId = appointmentData.doctorId;
    doctorNotif.recipientName = appointmentData.doctorName;
    notifications.push(addNotification(doctorNotif));
  }
  
  return notifications;
};

/**
 * Send appointment reminder
 */
const notifyAppointmentReminder = (appointmentData, recipientRole = 'patient') => {
  const notification = createAppointmentNotification(NOTIFICATION_TYPES.REMINDER, appointmentData, recipientRole);
  if (recipientRole === 'patient') {
    notification.recipientId = appointmentData.patientId;
    notification.recipientName = appointmentData.patientName;
  } else if (recipientRole === 'doctor') {
    notification.recipientId = appointmentData.doctorId;
    notification.recipientName = appointmentData.doctorName;
  }
  return addNotification(notification);
};

/**
 * Send appointment updated notification
 */
const notifyAppointmentUpdated = (appointmentData) => {
  const currentUser = getCurrentUser();
  const notification = createAppointmentNotification(NOTIFICATION_TYPES.UPDATED, appointmentData, 'doctor');
  notification.recipientId = currentUser?.id || null;
  notification.recipientName = currentUser?.name || null;
  return addNotification(notification);
};

/**
 * Get all notifications (for current user)
 */
const getNotifications = () => {
  return getUserNotifications();
};

/**
 * Get all notifications (unfiltered - admin only)
 */
const getAllNotifications = () => {
  const existing = localStorage.getItem('notifications');
  return existing ? JSON.parse(existing) : [];
};

/**
 * Get unread notification count
 */
const getUnreadCount = () => {
  const notifications = getUserNotifications();
  return notifications.filter(n => !n.read).length;
};

/**
 * Mark notification as read
 */
const markAsRead = (notificationId) => {
  const allNotifications = getAllNotifications();
  const updated = allNotifications.map(notif => 
    notif.id === notificationId ? { ...notif, read: true } : notif
  );
  localStorage.setItem('notifications', JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('notificationUpdated', { detail: { id: notificationId } }));
};

/**
 * Clear all notifications for current user
 */
const clearUserNotifications = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const allNotifications = getAllNotifications();
  const filtered = allNotifications.filter(n => n.recipientId !== currentUser.id);
  localStorage.setItem('notifications', JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('notificationsCleared'));
};

/**
 * Clear all notifications (admin only)
 */
const clearAllNotifications = () => {
  localStorage.removeItem('notifications');
  window.dispatchEvent(new CustomEvent('notificationsCleared'));
};

export const notificationManager = {
  createAppointmentNotification,
  addNotification,
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  notifyAppointmentReminder,
  notifyAppointmentUpdated,
  getNotifications,
  getAllNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  clearUserNotifications,
  clearAllNotifications,
  getCurrentUser,
  getUserRole,
  NOTIFICATION_TYPES,
};

export default notificationManager;
