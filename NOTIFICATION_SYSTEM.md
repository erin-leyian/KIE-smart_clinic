# Appointment Notification System

## Overview
The appointment notification system provides real-time updates to users about their appointment status changes, including confirmations, cancellations, rescheduling, and reminders.

## Features

### 1. **Notification Types**
- **Confirmed**: When an appointment is confirmed
- **Cancelled**: When an appointment is cancelled
- **Rescheduled**: When an appointment is moved to a new date/time
- **Reminder**: 24 hours before appointment
- **Updated**: General appointment updates

### 2. **Notification Panel**
Located in the top header of the dashboard:
- Bell icon with unread count badge
- Click to open notification panel
- Shows all notifications with timestamps
- Mark as read / Mark all as read
- Dismiss individual notifications
- Shows appointment details (doctor, time, location, fee)

### 3. **Persistent Storage**
- Notifications stored in browser localStorage
- Keeps last 50 notifications
- Maintains read/unread status
- Persists across page refreshes

### 4. **Notification History Page**
Dedicated page to view, manage, and organize all notifications:
- View all notifications with full details
- Filter by status (All, Read, Unread)
- Filter by type (Confirmed, Cancelled, Rescheduled, Reminder, Updated)
- Search notifications by doctor name, title, or message
- Sort by newest or oldest first
- Bulk select and manage multiple notifications
- Mark as read/unread individually or in bulk
- Delete notifications individually or in bulk
- Statistics dashboard (Total, Unread, Read, Selected)
- Color-coded notification types for easy scanning

## Components

### NotificationPanel.jsx
Main UI component for displaying notifications.

```jsx
<NotificationPanel />
```

Location: `src/components/NotificationPanel.jsx`

Features:
- Dropdown panel with notification list
- Unread count badge
- Notification icons based on type
- Color-coded by notification type
- Mark as read functionality
- Dismiss individual notifications
- Mark all as read button
- Link to full notification history

### NotificationHistory.jsx
Full-page component for comprehensive notification management.

Location: `src/pages/Dashboard/NotificationHistory.jsx`

Features:
- Statistics dashboard (Total, Unread, Read, Selected)
- Advanced filtering (Status, Type)
- Full-text search
- Sort options (Newest/Oldest)
- Bulk select all/none
- Bulk mark as read/unread
- Bulk delete with confirmation
- Individual notification actions
- Appointment details display
- Color-coded notification types
- Read/Unread status indicator
- Timestamp for each notification

### notificationManager.js
Utility functions for managing notifications.

Location: `src/utils/notificationManager.js`

## Usage

### Creating Notifications

```javascript
import { notifyAppointmentConfirmed } from '@/utils/notificationManager';

// Send confirmation notification
notifyAppointmentConfirmed({
  doctorName: 'Dr. Jean Mukasine',
  specialty: 'General Practitioner',
  date: 'Tomorrow',
  time: '09:00 - 09:30',
  hospital: 'Kigali Central Hospital',
  fee: '15000 RWF'
});
```

### Available Functions

```javascript
// Confirmed appointment
notifyAppointmentConfirmed(appointmentData)

// Cancelled appointment
notifyAppointmentCancelled(appointmentData)

// Rescheduled appointment
notifyAppointmentRescheduled({
  ...appointmentData,
  newDate: 'Tomorrow',
  newTime: '10:00 - 10:30'
})

// Appointment reminder (24 hours before)
notifyAppointmentReminder(appointmentData)

// General update
notifyAppointmentUpdated(appointmentData)

// Get all notifications
getNotifications()

// Get unread count
getUnreadCount()

// Clear all notifications
clearAllNotifications()
```

## Integration with AllAppointments

The notification system is integrated with the AllAppointments page:

1. **Confirm Appointment** - Sends confirmation notification
2. **Reschedule Appointment** - Sends rescheduled notification
3. **Cancel Appointment** - Sends cancellation notification

### Example Usage in Components

```jsx
import { notifyAppointmentConfirmed } from '../../utils/notificationManager';

const handleConfirmAppointment = () => {
  if (selectedAppointment && selectedAppointment.status !== 'Confirmed') {
    notifyAppointmentConfirmed(selectedAppointment);
    // Update UI...
  }
};
```

## Accessing the Notification History

Users can access the notification history in two ways:

1. **Sidebar Navigation** - Click "Notifications" in the dashboard sidebar
2. **Notification Panel** - Click "View all notifications" in the dropdown panel

### Direct URL
```
/dashboard/notifications
```

## Data Structure

### Notification Object

```javascript
{
  id: string,                    // Unique notification ID
  type: string,                  // 'confirmed' | 'cancelled' | 'rescheduled' | 'reminder' | 'updated'
  title: string,                 // Notification title
  message: string,               // Notification message
  timestamp: ISO8601,            // When notification was created
  read: boolean,                 // Read status
  appointmentDetails: {
    doctorName: string,
    specialty: string,
    date: string,
    time: string,
    location: string,
    fee: string
  }
}
```

## Visual Design

### Color Scheme
- **Confirmed**: Green (#10b981)
- **Cancelled**: Red (#ef4444)
- **Rescheduled**: Blue (#3b82f6)
- **Reminder**: Yellow (#f59e0b)
- **Updated**: Gray (#6b7280)

### Icons
Uses lucide-react icons:
- CheckCircle for confirmed
- AlertCircle for cancelled
- Clock for rescheduled/reminder
- Bell for general updates

## Real-time Updates

The system uses browser events for real-time updates:

```javascript
// Listen for new notifications
window.addEventListener('notificationAdded', (event) => {
  console.log('New notification:', event.detail);
});

// Listen for cleared notifications
window.addEventListener('notificationsCleared', () => {
  console.log('All notifications cleared');
});
```

## Browser Compatibility

- Modern browsers with localStorage support
- Requires ES6+ JavaScript support
- Works with React 16.8+

## Future Enhancements

1. **Backend Integration**: Connect to real API for server-side notifications
2. **Push Notifications**: Browser push notifications for critical updates
3. **Email Notifications**: Send appointment updates via email
4. **SMS Notifications**: Text message alerts for urgent updates
5. **Sound Alerts**: Audio notification for new updates
6. **Notification Preferences**: User-configurable notification settings
7. **Export History**: Export notifications as CSV/PDF
8. **Advanced Analytics**: Charts showing notification trends
9. **Notification Rules**: Custom rules for automatic actions
10. **Integrations**: Slack, Teams, Discord notifications

## Testing

Test notifications manually in the AllAppointments page:

1. Go to "My Appointments" page
2. Open an appointment details modal
3. Click "Confirm", "Reschedule", or "Cancel"
4. Check the notification bell icon
5. Click bell to open notification panel
6. Verify notification appears with correct details

## Troubleshooting

### Notifications Not Showing
1. Check localStorage is enabled: `localStorage.getItem('notifications')`
2. Verify NotificationPanel is imported in DashboardLayout
3. Check browser console for errors

### Notifications Not Persisting
1. Ensure localStorage quota not exceeded
2. Check browser privacy settings
3. Try clearing cache and reloading

### Badge Count Wrong
1. Click "Mark all as read" to reset
2. Clear cache and reload
3. Check for duplicate notifications in localStorage
