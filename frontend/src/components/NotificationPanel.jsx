import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock, MapPin, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Get notifications from localStorage
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotifications(parsed);
      const unread = parsed.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const removeNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setUnreadCount(0);
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
