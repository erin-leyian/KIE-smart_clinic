import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Archive, Check, CheckCheck, X, Search, Filter, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { getNotifications } from '../../utils/notificationManager';
import { notificationsAPI } from '../../services/api';

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread
  const [filterType, setFilterType] = useState('all'); // all, confirmed, cancelled, rescheduled, reminder, updated
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  const notificationTypes = ['appointment', 'record', 'system', 'confirmed', 'cancelled', 'rescheduled', 'reminder', 'updated'];

  const normalizeNotification = (notif = {}) => ({
    ...notif,
    read: typeof notif.read === 'boolean' ? notif.read : Boolean(notif.isRead),
    timestamp: notif.timestamp || notif.createdAt || new Date().toISOString(),
    type: String(notif.type || '').toLowerCase(),
  });

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
        read: Boolean(existing.read && normalized.read),
      });
    });

    return Array.from(mergedMap.values());
  };

  useEffect(() => {
    loadNotifications();
    // Listen for notification updates
    const handleNotificationAdded = () => loadNotifications();
    window.addEventListener('notificationAdded', handleNotificationAdded);
    window.addEventListener('notificationUpdated', handleNotificationAdded);
    window.addEventListener('notificationsCleared', loadNotifications);

    return () => {
      window.removeEventListener('notificationAdded', handleNotificationAdded);
      window.removeEventListener('notificationUpdated', handleNotificationAdded);
      window.removeEventListener('notificationsCleared', loadNotifications);
    };
  }, []);

  useEffect(() => {
    filterAndSortNotifications();
  }, [notifications, searchQuery, filterStatus, filterType, sortBy]);

  const loadNotifications = async () => {
    setLoading(true);
    const localNotifications = getNotifications().map(normalizeNotification);

    try {
      const response = await notificationsAPI.getAllNotifications();
      const apiNotifications = (response?.data || []).map(normalizeNotification);
      const merged = mergeNotifications(apiNotifications, localNotifications);
      setNotifications(merged);
      localStorage.setItem('notifications', JSON.stringify(merged));
    } catch {
      setNotifications(localNotifications);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNotifications = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.appointmentDetails?.doctorName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus === 'read') {
      filtered = filtered.filter(n => n.read);
    } else if (filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Sort
    if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    setFilteredNotifications(filtered);
  };

  const toggleNotificationSelection = (id) => {
    const updated = new Set(selectedNotifications);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedNotifications(updated);
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
    } catch {
      // Keep local fallback behavior
    }

    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    loadNotifications();
  };

  const markAsUnread = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: false } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markMultipleAsRead = async (ids) => {
    try {
      await Promise.all(ids.map((id) => notificationsAPI.markAsRead(id)));
    } catch {
      // Keep local fallback behavior
    }

    const updated = notifications.map(n =>
      ids.includes(n.id) ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setSelectedNotifications(new Set());
    loadNotifications();
  };

  const markMultipleAsUnread = (ids) => {
    const updated = notifications.map(n =>
      ids.includes(n.id) ? { ...n, read: false } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setSelectedNotifications(new Set());
  };

  const deleteNotifications = (ids) => {
    const updated = notifications.filter(n => !ids.includes(n.id));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setSelectedNotifications(new Set());
    setShowDeleteConfirm(false);
  };

  const deleteSelected = () => {
    if (selectedNotifications.size > 0) {
      deleteNotifications(Array.from(selectedNotifications));
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'appointment':
        return 'Appointment';
      case 'record':
        return 'Record';
      case 'system':
        return 'System';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'rescheduled':
        return 'Rescheduled';
      case 'reminder':
        return 'Reminder';
      case 'updated':
        return 'Updated';
      default:
        return type;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'record':
        return '🩺';
      case 'system':
        return '⚙️';
      case 'confirmed':
        return '✓';
      case 'cancelled':
        return '✕';
      case 'rescheduled':
        return '⟳';
      case 'reminder':
        return '🔔';
      case 'updated':
        return '📝';
      default:
        return '●';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-50 border-blue-200';
      case 'record':
        return 'bg-teal-50 border-teal-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      case 'confirmed':
        return 'bg-green-50 border-green-200';
      case 'cancelled':
        return 'bg-red-50 border-red-200';
      case 'rescheduled':
        return 'bg-blue-50 border-blue-200';
      case 'reminder':
        return 'bg-yellow-50 border-yellow-200';
      case 'updated':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout title="Notification History">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Notifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{notifications.length}</p>
              </div>
              <Bell className="w-12 h-12 text-gray-300" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unread</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{unreadCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Read</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{notifications.filter(n => n.read).length}</p>
              </div>
              <Check className="w-12 h-12 text-green-300" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Selected</p>
                <p className="text-3xl font-bold text-teal-600 mt-1">{selectedNotifications.size}</p>
              </div>
              <CheckCheck className="w-12 h-12 text-teal-300" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>{getNotificationTypeLabel(type)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort and Actions */}
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markMultipleAsRead(Array.from(selectedNotifications))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium transition"
                >
                  <Check className="w-4 h-4" />
                  Mark as Read
                </button>
                <button
                  onClick={() => markMultipleAsUnread(Array.from(selectedNotifications))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition"
                >
                  <X className="w-4 h-4" />
                  Mark as Unread
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Select All */}
          {filteredNotifications.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-2 focus:ring-teal-500"
              />
              <label className="text-sm text-gray-600">
                {selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0
                  ? `All ${filteredNotifications.length} selected`
                  : `Select all ${filteredNotifications.length}`}
              </label>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading notifications...</div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notif => (
              <div
                key={notif.id}
                className={`border rounded-lg p-5 transition-all ${getTypeColor(notif.type)} ${
                  selectedNotifications.has(notif.id) ? 'ring-2 ring-teal-500 ring-offset-2' : ''
                } ${!notif.read ? 'border-l-4' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notif.id)}
                    onChange={() => toggleNotificationSelection(notif.id)}
                    className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-2 focus:ring-teal-500 mt-1 flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                          <h3 className={`font-bold text-gray-900 ${!notif.read ? 'text-lg' : ''}`}>
                            {notif.title}
                          </h3>
                          {!notif.read && (
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{notif.message}</p>

                        {/* Appointment Details */}
                        {notif.appointmentDetails && (
                          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div className="text-gray-600">
                              <span className="text-gray-500">Doctor:</span> {notif.appointmentDetails.doctorName}
                            </div>
                            <div className="text-gray-600">
                              <span className="text-gray-500">Specialty:</span> {notif.appointmentDetails.specialty}
                            </div>
                            <div className="text-gray-600">
                              <span className="text-gray-500">Time:</span> {notif.appointmentDetails.time}
                            </div>
                            <div className="text-gray-600">
                              <span className="text-gray-500">Location:</span> {notif.appointmentDetails.location}
                            </div>
                            <div className="text-gray-600">
                              <span className="text-gray-500">Fee:</span> {notif.appointmentDetails.fee}
                            </div>
                          </div>
                        )}

                        {/* Timestamp and Status */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 border-opacity-50">
                          <p className="text-xs text-gray-500">
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notif.read
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-red-200 text-red-700'
                            }`}>
                              {notif.read ? 'Read' : 'Unread'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                              {getNotificationTypeLabel(notif.type)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.read ? (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            title="Mark as read"
                            className="p-2 hover:bg-gray-300 hover:bg-opacity-30 rounded-lg transition"
                          >
                            <Check className="w-5 h-5 text-green-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnread(notif.id)}
                            title="Mark as unread"
                            className="p-2 hover:bg-gray-300 hover:bg-opacity-30 rounded-lg transition"
                          >
                            <X className="w-5 h-5 text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotifications([notif.id])}
                          title="Delete"
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">No notifications found</p>
            <p className="text-gray-500 text-sm">
              {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Your notification history is empty'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Notifications</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
