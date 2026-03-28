# Data Access Control System - Implementation Guide

## Overview

A comprehensive role-based data access control system has been implemented across the Smart Clinic application. This system ensures that users see only data they're authorized to access based on their role (Patient, Doctor, or Admin).

## Location

**File:** `/frontend/src/utils/dataAccessControl.js`

## Core Functions

### 1. User Management

#### `getCurrentUser()`
Retrieves the currently logged-in user from localStorage.

```javascript
const user = getCurrentUser();
// Returns: { id, name, email, role, ... } or null
```

#### `getUserRole()`
Gets the current user's role from localStorage.

```javascript
const role = getUserRole();
// Returns: 'patient' | 'doctor' | 'admin' | 'patient' (default)
```

#### `getUserData(currentUser)`
Finds full user data from mockData by ID or email.

```javascript
const userData = getUserData(currentUser);
// Returns: Full user object from mockData.users or null
```

---

## Data Filtering Functions

### 2. Appointments Filtering

#### `getFilteredAppointments(userRole, currentUser)`
Filters appointments based on user role:
- **Patients:** See only their own appointments
- **Doctors:** See appointments where they are assigned as the doctor
- **Admins:** See all appointments

```javascript
const appointments = getFilteredAppointments('patient', currentUser);
// Returns: Array of filtered appointment objects
```

**Usage in Components:**
```javascript
import { getFilteredAppointments } from '../../utils/dataAccessControl';

const filteredAppointments = getFilteredAppointments(userRole, currentUser);
const appointmentList = filteredAppointments.slice(0, 4); // First 4 appointments
```

---

### 3. Patient Records Filtering

#### `getFilteredPatientRecords(userRole, currentUser)`
Filters patient medical records based on access rights:
- **Patients:** See only their own medical records
- **Doctors:** See records of patients they have appointments with
- **Admins:** See all patient records

```javascript
const records = getFilteredPatientRecords('patient', currentUser);
// Returns: Array of filtered patient record objects
```

---

### 4. Doctors List Filtering

#### `getFilteredDoctors(userRole, currentUser)`
Returns available doctors based on user role:
- **Patients & Admins:** See all doctors
- **Doctors:** See all doctors except themselves

```javascript
const doctors = getFilteredDoctors('doctor', currentUser);
// Returns: Array of doctor objects (excluding self)
```

---

## Utility Functions

### 5. Upcoming Appointments

#### `getUpcomingAppointments(userRole, currentUser, limit = 4)`
Gets a limited number of upcoming appointments for a user, sorted by date.

```javascript
const upcomingAppointments = getUpcomingAppointments('patient', currentUser, 5);
// Returns: Array of next 5 upcoming appointments
```

**Usage in DashboardHome:**
```javascript
const upcomingAppointmentsList = getUpcomingAppointments(userRole, currentUser, 4);
```

---

### 6. Permission Checks

#### `canViewAppointment(appointment, userRole, currentUser)`
Checks if a user has permission to view a specific appointment.

```javascript
if (canViewAppointment(appointment, userRole, currentUser)) {
  // Show appointment details
}
```

#### `canEditResource(resource, userRole, currentUser)`
Checks if a user can edit/delete a specific resource:
- **Admins:** Can edit everything
- **Patients:** Can only edit their own resources
- **Doctors:** Can only edit appointments they're part of

```javascript
if (canEditResource(appointment, userRole, currentUser)) {
  // Show edit/delete buttons
}
```

---

### 7. Dashboard Statistics

#### `getDashboardStats(userRole, currentUser)`
Calculates and returns dashboard statistics for the logged-in user.

```javascript
const stats = getDashboardStats(userRole, currentUser);
// Returns:
// {
//   totalAppointments: number,
//   upcomingAppointments: number,
//   completedAppointments: number,
//   pendingAppointments: number,
//   totalRecords: number
// }
```

---

### 8. Navigation Items

#### `getNavigationItems(userRole)`
Returns appropriate navigation menu items based on user role.

```javascript
const navItems = getNavigationItems('patient');
// Returns: [
//   { label: 'Dashboard', icon: 'Home' },
//   { label: 'All Doctors', icon: 'Users' },
//   { label: 'My Appointments', icon: 'Calendar' },
//   ...
// ]
```

---

## Component Integration Examples

### Calendar Component (Calendar.jsx)
```javascript
import { getCurrentUser, getUserRole, getFilteredAppointments } from '../../utils/dataAccessControl';

export default function CalendarView() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    const role = getUserRole();
    setCurrentUser(user);
    setUserRole(role);
    
    // Get filtered appointments
    const filtered = getFilteredAppointments(role, user);
    setAppointments(filtered);
  }, []);

  // ... rest of component
}
```

### AllDoctors Component (AllDoctors.jsx)
```javascript
import { getCurrentUser, getUserRole, getFilteredDoctors } from '../../utils/dataAccessControl';

export default function AllDoctors() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    const role = getUserRole();
    setCurrentUser(user);
    setUserRole(role);
    
    // Get filtered doctors
    const filtered = getFilteredDoctors(role, user);
    setDoctors(filtered);
  }, []);

  // ... rest of component
}
```

### DashboardHome Component (DashboardHome.jsx)
```javascript
import { 
  getCurrentUser, 
  getUserRole, 
  getFilteredAppointments,
  getUpcomingAppointments 
} from '../../utils/dataAccessControl';

export default function DashboardHome() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');

  useEffect(() => {
    const user = getCurrentUser();
    const role = getUserRole();
    setCurrentUser(user);
    setUserRole(role);
  }, []);

  // Get upcoming appointments (filtered by role)
  const upcomingAppointmentsList = getUpcomingAppointments(userRole, currentUser, 4);
  
  // ... rest of component
}
```

---

## Updated Components

### ✅ Calendar.jsx
- Added user role and current user state
- Filters appointments by user role
- Shows only appointments accessible to the logged-in user
- Loads user data on mount

### ✅ AllDoctors.jsx
- Added user role and current user state
- Filters doctors list by user role
- Doctors don't see themselves in the list
- Dynamic doctor loading based on authentication

### ✅ DashboardHome.jsx
- Added user role and current user state
- Filters upcoming appointments by user role
- Shows patient-specific appointment data
- Displays relevant doctors and statistics

---

## Data Access Rules by Role

### Patient Access
| Resource | Can View | Can Edit | Can Delete | Notes |
|----------|----------|----------|-----------|-------|
| Own Appointments | ✅ | ✅ Limited | ❌ | Can confirm/cancel only |
| Other Appointments | ❌ | ❌ | ❌ | Not visible |
| Own Records | ✅ | ❌ | ❌ | Read-only |
| Other Records | ❌ | ❌ | ❌ | Not visible |
| All Doctors | ✅ | ❌ | ❌ | For booking appointments |
| Doctors' Availability | ✅ | ❌ | ❌ | For scheduling |

### Doctor Access
| Resource | Can View | Can Edit | Can Delete | Notes |
|----------|----------|----------|-----------|-------|
| Own Appointments | ✅ | ✅ | ✅ | Full control |
| Patient Appointments | ✅ | ✅ Limited | ❌ | Only for assigned patients |
| Patient Records | ✅ | ❌ | ❌ | View only for own patients |
| All Doctors | ✅ | ❌ | ❌ | Excluding self |
| Own Availability | ✅ | ✅ | ✅ | Full control |

### Admin Access
| Resource | Can View | Can Edit | Can Delete | Notes |
|----------|----------|----------|-----------|-------|
| All Appointments | ✅ | ✅ | ✅ | Full control |
| All Records | ✅ | ✅ | ✅ | Full control |
| All Doctors | ✅ | ✅ | ✅ | Full control |
| All Users | ✅ | ✅ | ✅ | Full control |
| System Settings | ✅ | ✅ | ❌ | Can modify but not delete |

---

## Best Practices

### 1. Always Check Permissions Before Rendering
```javascript
if (canViewAppointment(appointment, userRole, currentUser)) {
  return <AppointmentDetails appointment={appointment} />;
}
return <NotAuthorized />;
```

### 2. Filter Data on Load
```javascript
useEffect(() => {
  const user = getCurrentUser();
  const role = getUserRole();
  const filtered = getFilteredAppointments(role, user);
  setAppointments(filtered);
}, []);
```

### 3. Use Role-Based Conditional Rendering
```javascript
{userRole === 'admin' && <AdminPanel />}
{userRole === 'doctor' && <DoctorPanel />}
{userRole === 'patient' && <PatientPanel />}
```

### 4. Display Edit/Delete Buttons Conditionally
```javascript
{canEditResource(resource, userRole, currentUser) && (
  <div>
    <EditButton />
    <DeleteButton />
  </div>
)}
```

---

## Testing the System

### Test Users
- **Patient:** alice@example.com (ID: 2, Name: Alice Uwirimana)
- **Doctor:** dr.jean@clinic.rw (ID: 1, Name: Dr. Jean Mukasine)
- **Admin:** admin@queuecare.rw (ID: 3, Name: Admin User)

### Test Scenarios
1. **Patient Login:** Should see only own appointments, records, and available doctors
2. **Doctor Login:** Should see own appointments and patient records
3. **Admin Login:** Should see all data without restrictions
4. **Appointment Filtering:** Filter appointments list - verify patient sees only their appointments
5. **Doctor Availability:** Doctors should not see themselves in the doctor list

---

## Future Enhancements

1. **Additional Permissions:** Implement granular permissions (e.g., view-only vs edit)
2. **Audit Logging:** Track all data access and modifications
3. **Time-Based Access:** Limit access based on time constraints
4. **Department-Based Filtering:** Group doctors and patients by departments
5. **Data Encryption:** Encrypt sensitive patient data in localStorage
6. **Backend Integration:** Validate permissions server-side (currently client-side only)

---

## Summary

The data access control system provides:
- ✅ Role-based filtering of all resources
- ✅ Centralized permission checking
- ✅ Consistent access control across the application
- ✅ Easy integration into existing components
- ✅ Scalable architecture for future enhancements

All components now respect user roles and display only authorized data!
