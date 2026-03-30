import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock, MapPin, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import { getNotifications } from '../utils/notificationManager';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);

  const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

  const getCurrentUser = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const normalizeNotification = (notif = {}) => ({
    ...notif,
    id: String(notif.id || `${notif.title || 'notification'}|${notif.message || ''}|${notif.timestamp || notif.createdAt || notif.created_at || ''}`),
    userId: notif.userId || notif.user_id || notif.recipientId || null,
    recipientId: notif.recipientId || notif.userId || notif.user_id || null,
    recipientRole: notif.recipientRole || null,
    type: String(notif.type || 'appointment').toLowerCase(),
    read: typeof notif.read === 'boolean'
      ? notif.read
      : (typeof notif.isRead === 'boolean' ? notif.isRead : Boolean(notif.is_read)),
    timestamp: notif.timestamp || notif.createdAt || notif.created_at || new Date().toISOString(),
  });

  const hydrateNotifications = (list = []) => {
    const normalized = (list || []).map(normalizeNotification);
    setNotifications(normalized);
    const unread = normalized.filter(n => !n.read).length;
    setUnreadCount(unread);
    return normalized;
  };

  const mergeNotifications = (apiList = [], localList = []) => {
    const mergedMap = new Map();

    [...apiList, ...localList].forEach((item) => {
      const normalized = normalizeNotification(item);
      const fallbackKey = `${normalized.title || ''}|${normalized.message || ''}|${normalized.timestamp || ''}`;
      const key = String(normalized.id || fallbackKey);
      if (!mergedMap.has(key)) {
        mergedMap.set(key, normalized);
        return;
      }

      const existing = mergedMap.get(key);
      mergedMap.set(key, {
        ...existing,
        ...normalized,
        read: Boolean(existing.read || normalized.read),
      });
    });

    return Array.from(mergedMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  useEffect(() => {
    loadNotifications();

    const handleNotificationAdded = (event) => {
      const detail = normalizeNotification(event?.detail || {});
      if (detail?.title) {
        setToastNotification(detail);
        setTimeout(() => setToastNotification(null), 3500);
      }
      loadNotifications();
    };

    const handleNotificationUpdated = () => loadNotifications();
    const handleNotificationsCleared = () => loadNotifications();

    window.addEventListener('notificationAdded', handleNotificationAdded);
    window.addEventListener('notificationUpdated', handleNotificationUpdated);
    window.addEventListener('notificationsCleared', handleNotificationsCleared);

    return () => {
      window.removeEventListener('notificationAdded', handleNotificationAdded);
      window.removeEventListener('notificationUpdated', handleNotificationUpdated);
      window.removeEventListener('notificationsCleared', handleNotificationsCleared);
    };
  }, []);

  const loadNotifications = async () => {
    const localNotifications = getNotifications();
    const currentUser = getCurrentUser();
    const currentRole = localStorage.getItem('userRole') || currentUser?.role || 'patient';

    if (!currentUser) {
      hydrateNotifications(localNotifications);
      return;
    }

    try {
      const response = await notificationsAPI.getAllNotifications();
      const apiNotifications = response.data || [];
      const merged = mergeNotifications(apiNotifications, localNotifications);
      const normalized = hydrateNotifications(merged);
      const persisted = normalized.map((item) => ({
        ...item,
        recipientId: item.recipientId || item.userId || currentUser.id,
        recipientRole: item.recipientRole || currentRole,
      }));
      localStorage.setItem('notifications', JSON.stringify(persisted));
    } catch (err) {
      console.warn('Failed to fetch notifications from API, using local notifications:', err);
      hydrateNotifications(localNotifications);
    }
  };

  const markAsRead = async (id) => {
    if (isUuid(id)) {
      try {
        await notificationsAPI.markAsRead(id);
      } catch {
        // Keep local fallback behavior when backend update fails
      }
    }

    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));

    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
    loadNotifications();
  };

  const removeNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
    } catch {
      // Keep local fallback behavior when backend update fails
    }

    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(0);
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'rescheduled':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type, read) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'confirmed':
        return 'bg-green-50';
      case 'cancelled':
        return 'bg-red-50';
      case 'rescheduled':
        return 'bg-blue-50';
      case 'reminder':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {toastNotification && (
        <div className="fixed top-6 right-6 z-[100] w-80 bg-white border border-teal-200 shadow-xl rounded-lg p-4 animate-fade-in">
          <p className="text-sm font-semibold text-gray-900">{toastNotification.title}</p>
          <p className="text-xs text-gray-600 mt-1">{toastNotification.message}</p>
        </div>
      )}

      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-50 to-blue-50">
            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 text-teal-600 hover:bg-teal-100 rounded transition-colors font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              <div className="space-y-1 p-2">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border border-gray-100 transition-all cursor-pointer hover:shadow-md ${getNotificationBgColor(notif.type, notif.read)}`}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        {notif.appointmentDetails && (
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{notif.appointmentDetails.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{notif.appointmentDetails.location}</span>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notif.id);
                        }}
                        className="flex-shrink-0 p-1 hover:bg-gray-300 rounded transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <Link to="/dashboard/notifications" className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline">
                <LinkIcon className="w-3 h-3" />
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
