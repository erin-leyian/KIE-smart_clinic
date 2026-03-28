/**
 * Appointment Notification Management
 * Handles creating, sending, and managing appointment-related notifications
 */

const NOTIFICATION_TYPES = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
  REMINDER: 'reminder',
  UPDATED: 'updated',
};

/**
 * Create a new appointment notification
 */
export const createAppointmentNotification = (type, appointmentData) => {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const notificationTemplates = {
    [NOTIFICATION_TYPES.CONFIRMED]: {
      title: 'Appointment Confirmed',
      message: `Your appointment with ${appointmentData.doctorName} on ${appointmentData.date} at ${appointmentData.time} has been confirmed.`,
      icon: 'confirmed',
    },
    [NOTIFICATION_TYPES.CANCELLED]: {
      title: 'Appointment Cancelled',
      message: `Your appointment with ${appointmentData.doctorName} on ${appointmentData.date} has been cancelled.`,
      icon: 'cancelled',
    },
    [NOTIFICATION_TYPES.RESCHEDULED]: {
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${appointmentData.doctorName} has been moved to ${appointmentData.newDate} at ${appointmentData.newTime}.`,
      icon: 'rescheduled',
    },
    [NOTIFICATION_TYPES.REMINDER]: {
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment with ${appointmentData.doctorName} tomorrow at ${appointmentData.time}.`,
      icon: 'reminder',
    },
    [NOTIFICATION_TYPES.UPDATED]: {
      title: 'Appointment Updated',
      message: `Your appointment details with ${appointmentData.doctorName} have been updated.`,
      icon: 'updated',
    },
  };

  const template = notificationTemplates[type] || notificationTemplates[NOTIFICATION_TYPES.UPDATED];

  return {
    id,
    type,
    title: template.title,
    message: template.message,
    timestamp: new Date().toISOString(),
    read: false,
    appointmentDetails: {
      doctorName: appointmentData.doctorName,
      specialty: appointmentData.specialty,
      date: appointmentData.date,
      time: appointmentData.time,
      location: appointmentData.hospital || appointmentData.location,
      fee: appointmentData.fee,
    },
  };
};

/**
 * Add notification to localStorage
 */
export const addNotification = (notification) => {
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
 * Send appointment confirmed notification
 */
export const notifyAppointmentConfirmed = (appointmentData) => {
  const notification = createAppointmentNotification(NOTIFICATION_TYPES.CONFIRMED, appointmentData);
  return addNotification(notification);
};

/**
 * Send appointment cancelled notification
 */
export const notifyAppointmentCancelled = (appointmentData) => {
  const notification = createAppointmentNotification(NOTIFICATION_TYPES.CANCELLED, appointmentData);
  return addNotification(notification);
};

/**
 * Send appointment rescheduled notification
 */
export const notifyAppointmentRescheduled = (appointmentData) => {
  const notification = createAppointmentNotification(NOTIFICATION_TYPES.RESCHEDULED, appointmentData);
  return addNotification(notification);
};

/**
 * Send appointment reminder (usually 24 hours before)
 */
export const notifyAppointmentReminder = (appointmentData) => {
  const notification = createAppointmentNotification(NOTIFICATION_TYPES.REMINDER, appointmentData);
  return addNotification(notification);
};

/**
 * Send appointment updated notification
 */
export const notifyAppointmentUpdated = (appointmentData) => {
  const notification = createAppointmentNotification(NOTIFICATION_TYPES.UPDATED, appointmentData);
  return addNotification(notification);
};

/**
 * Get all notifications
 */
export const getNotifications = () => {
  const existing = localStorage.getItem('notifications');
  return existing ? JSON.parse(existing) : [];
};

/**
 * Get unread notification count
 */
export const getUnreadCount = () => {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
  localStorage.removeItem('notifications');
  window.dispatchEvent(new CustomEvent('notificationsCleared'));
};

export default {
  createAppointmentNotification,
  addNotification,
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  notifyAppointmentReminder,
  notifyAppointmentUpdated,
  getNotifications,
  getUnreadCount,
  clearAllNotifications,
  NOTIFICATION_TYPES,
};
