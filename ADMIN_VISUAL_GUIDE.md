# 🎨 Admin Panel - Visual Navigation Guide

## 📍 Navigation Map

```
Login
 ↓
admin@queuecare.rw / admin123
 ↓
/dashboard/admin (Admin Dashboard)
 ├─ Welcome Card
 ├─ Statistics Cards
 │  ├─ Total Users
 │  ├─ Doctors
 │  ├─ Patients
 │  ├─ Appointments
 │  └─ Hospitals
 ├─ Appointment Status
 │  ├─ Completed
 │  └─ Pending
 └─ QUICK ACTIONS MENU
    ├─ 👥 Manage Users
    ├─ 👨‍⚕️ Manage Doctors
    ├─ 📅 Manage Appointments
    └─ ⚙️ System Settings
```

---

## 🖥️ Admin Dashboard Screen

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  📊 ADMIN DASHBOARD                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                           │
│  Welcome back, Admin                                     │
│  You have full access to all system data.               │
│                                                           │
│  ┌──────┬──────┬──────┬──────┬──────┐                   │
│  │ 👥 3 │👨‍⚕️ 30 │👤 1  │📅 39 │🏥 5  │                   │
│  │Users │Doctors│Patients│Apts  │Hospital│               │
│  └──────┴──────┴──────┴──────┴──────┘                   │
│                                                           │
│  Appointment Status    │    QUICK ACTIONS                │
│  ┌─────────────────┐   │   ┌─────────────────────────┐   │
│  │ Completed   12  │   │   │ → Manage Users          │   │
│  │ Pending     8   │   │   │ → Manage Doctors        │   │
│  └─────────────────┘   │   │ → Manage Appointments   │   │
│                        │   │ → System Settings       │   │
│                        │   └─────────────────────────┘   │
│                                                           │
│  All Users (showing 3)                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Name │ Email │ Role │ Phone │ Location │ Action │   │
│  ├──────┴───────┴──────┴───────┴──────────┴────────┤   │
│  │ Dr. Jean... │ doctor │ ... │ Edit Delete │       │   │
│  │ Alice U... │ patient│ ... │ Edit Delete │       │   │
│  │ Admin User │ admin  │ ... │ Edit Delete │       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Manage Users Screen

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  👥 MANAGE USERS                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Edit, delete, or add new users                          │
│                                                           │
│  [+ Add New User]              [🔍 Search...] [All ▼]   │
│                                                           │
│  All Users (showing 3 of 3)                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Name    │ Email         │ Role    │ Phone  │Actns│   │
│  ├─────────┼───────────────┼─────────┼────────┼─────┤   │
│  │ Dr. Jean│ dr.jean@...   │ Doctor  │ +250.. │✏️🗑️ │   │
│  │ Alice   │ alice@...     │ Patient │ +250.. │✏️🗑️ │   │
│  │ Admin   │ admin@...     │ Admin   │ +250.. │✏️🗑️ │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
    ↓ Click Edit (✏️)          ↓ Click Delete (🗑️)
    
  EDIT MODAL                 DELETE CONFIRM
  ┌──────────────────────┐   ┌────────────────────┐
  │ Edit User            │   │ ⚠️ Confirm Delete   │
  │ ─────────────────    │   │ ─────────────────   │
  │ Name: [___________]  │   │ Delete Alice U.?    │
  │ Email: [__________]  │   │ Cannot be undone.   │
  │ Role: [Patient  ▼]  │   │ ┌────────┬───────┐  │
  │ Phone: [__________]  │   │ │Cancel  │Delete │  │
  │ Loc: [___________]   │   │ └────────┴───────┘  │
  │ ┌────────┬────────┐  │   └────────────────────┘
  │ │Cancel  │Update  │  │
  │ └────────┴────────┘  │
  └──────────────────────┘
```

---

## 👨‍⚕️ Manage Doctors Screen

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  👨‍⚕️ MANAGE DOCTORS                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Edit, delete, or add new doctors                        │
│                                                           │
│  [+ Add New Doctor]        [🔍 Search...] [All Spec. ▼] │
│                                                           │
│  Doctors in Grid (showing 3 of 30)                       │
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │   [Image]       │  │   [Image]       │  ...          │
│  │ Dr. Jean M.     │  │ Dr. Sylvain U.  │               │
│  │ General Practice│  │ Cardiologist    │               │
│  │ Exp: 10 years   │  │ Exp: 12 years   │               │
│  │ Fee: 15000 RWF  │  │ Fee: 35000 RWF  │               │
│  │ ⭐ 4.9          │  │ ⭐ 4.8          │               │
│  │ [Edit] [Delete] │  │ [Edit] [Delete] │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                           │
│  Filter by Specialty: ┌─────────────────┐               │
│  • General Practitioner    ┌──────────────────┐          │
│  • Cardiologist            │ All Specialties ▼│          │
│  • Pediatrician            │ Cardiologist     │          │
│  • Surgeon                 │ Pediatrician     │          │
│  • Obstetrician        ... └──────────────────┘          │
│                                                           │
└─────────────────────────────────────────────────────────┘
    ↓ Click Edit              ↓ Click Delete
    Opens Edit Modal          Shows Confirmation
```

---

## 📅 Manage Appointments Screen

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  📅 MANAGE APPOINTMENTS                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Edit, delete, or add new appointments                   │
│                                                           │
│  [+ Add New Apt.]         [🔍 Search...] [All Status ▼] │
│                                                           │
│  All Appointments (showing 5 of 39)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Patient │ Doctor │ Date/Time │ Type │ Stat │Fee │Actn│
│  ├─────────┼────────┼───────────┼──────┼──────┼────┤───│
│  │ Alice   │ Dr. J  │ 2026-03-27│ In-P │ ✓Comp│15K │✏️🗑️│
│  │         │        │ 09:00-09:3│      │      │    │   │
│  │ Alice   │ Dr.M   │ 2026-03-28│ In-P │ ✓Comp│28K │✏️🗑️│
│  │         │        │ 10:30-11:0│      │      │    │   │
│  │ Alice   │ Dr.S   │ 2026-03-29│ Video│ ⏳Pend│24K │✏️🗑️│
│  │         │        │ 11:00-11:3│      │      │    │   │
│  └─────────┴────────┴───────────┴──────┴──────┴────┴───┘
│                                                           │
│  Status Colors:                                          │
│  🟢 Completed  🔵 Confirmed  🟡 Pending                 │
│  🔴 Cancelled  🟣 Scheduled                             │
│                                                           │
└─────────────────────────────────────────────────────────┘
    ↓ Click Edit              ↓ Click Delete
    Opens Edit Modal          Shows Confirmation
```

---

## ⚙️ System Settings Screen

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  ⚙️ SYSTEM SETTINGS                                      │
│  Manage hospitals, insurance, and medical conditions     │
│                                                           │
│  [Hospitals] [Insurance] [Conditions]                    │
│  ━━━━━━━━━  ━━━━━━━━━  ━━━━━━━━━━                      │
│                                                           │
│  HOSPITALS TAB (showing 5)                               │
│  [+ Add Hospital]                                        │
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │   [Gradient]    │  │   [Gradient]    │  ...          │
│  │ Clinic Imishino │  │ King Faisal H.  │               │
│  │ Private Clinic  │  │ Teaching Hosp.  │               │
│  │ KN 2 St, Kigali │  │ Boulevard Rev.  │               │
│  │ +250 25 258 4960│  │ +250 25 258 0666│               │
│  │ [Edit] [Delete] │  │ [Edit] [Delete] │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                           │
│                                                           │
│  INSURANCE TAB (showing 4)                               │
│  [+ Add Insurance]                                       │
│                                                           │
│  ┌───────────────────────────────────────┐              │
│  │ Name     │ Type          │ Coverage │Actn│            │
│  ├──────────┼───────────────┼─────────┼────┤            │
│  │ RSSB     │ Government    │ 85%    │✏️🗑️ │            │
│  │ IMR      │ Community     │ 80%    │✏️🗑️ │            │
│  │ RAMA     │ Private       │ 90%    │✏️🗑️ │            │
│  │ Out-of-P │ No Insurance  │ 0%     │✏️🗑️ │            │
│  └──────────┴───────────────┴────────┴────┘            │
│                                                           │
│                                                           │
│  CONDITIONS TAB (showing 3 of 10)                        │
│  [+ Add Condition]                                       │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ 🦟 Malaria       │  │ 💓 Hypertension  │             │
│  │ Mosquito-borne.. │  │ High BP condition│             │
│  │ Prevalence: High │  │ Prevalence: Comm │             │
│  │ [Edit] [Delete]  │  │ [Edit] [Delete]  │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Common Workflows

### Workflow 1: Add a New Doctor
```
Dashboard [Manage Doctors] 
    ↓
Click "Add New Doctor"
    ↓
Modal Opens:
  - Name: [Dr. John Smith]
  - Specialty: [Cardiologist]
  - Hospital: [King Faisal]
  - Experience: [15 years]
  - Fee: [40000 RWF]
  - Rating: [4.8]
    ↓
Click "Add Doctor"
    ↓
✅ Success! Doctor added
    ↓
Count updates: "Showing X of 31 doctors"
```

### Workflow 2: Edit User Role
```
Dashboard [Manage Users]
    ↓
Find User (search: "Alice")
    ↓
Click Edit Icon (✏️)
    ↓
Modal Opens:
  - Role: [Patient] → Select [Doctor]
    ↓
Click "Update User"
    ↓
✅ Success! User updated
    ↓
Table refreshes with new role
```

### Workflow 3: Change Appointment Status
```
Dashboard [Manage Appointments]
    ↓
Find Appointment (search: "Alice")
    ↓
Click Edit Icon (✏️)
    ↓
Modal Opens:
  - Status: [Pending] → Select [Completed]
  - Add Notes: "Routine checkup done"
    ↓
Click "Update Appointment"
    ↓
✅ Success! Status changed
    ↓
Status badge updates on table
```

### Workflow 4: Delete Hospital
```
Dashboard [System Settings] → Hospitals Tab
    ↓
Find Hospital Card
    ↓
Click Delete Icon (🗑️)
    ↓
Confirmation Modal:
  "Delete Clinic Imishino?"
  "Cannot be undone"
    ↓
Click "Delete"
    ↓
✅ Success! Hospital deleted
    ↓
Count updates: "5 hospitals" → "4 hospitals"
```

---

## 🎨 Color Scheme

### Status Colors (Appointments)
```
🟢 Completed - Green #10b981
🔵 Confirmed - Blue #3b82f6
🟡 Pending - Yellow #f59e0b
🔴 Cancelled - Red #ef4444
🟣 Scheduled - Purple #8b5cf6
```

### Role Colors (Users)
```
🔴 Admin - Red #dc2626
🔵 Doctor - Blue #2563eb
🟢 Patient - Green #059669
```

### Specialty Colors (Doctors)
```
All specialties shown in teal theme
Background: white with teal accents
Buttons: Teal primary, blue/red secondary
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 768px):
  - Tables → Card layout
  - Grid → Single column
  - Buttons → Full width
  - Modals → Full screen

Tablet (768px - 1024px):
  - Tables → Stacked columns
  - Grid → 2 columns
  - Buttons → Fixed width
  - Modals → 90% width

Desktop (> 1024px):
  - Tables → Full table
  - Grid → 3 columns
  - Buttons → Auto width
  - Modals → Max 600px
```

---

## ⚠️ Confirmation Dialogs

```
┌────────────────────────────────┐
│ ⚠️ Confirm Delete              │
│ ────────────────────────────── │
│                                │
│ Are you sure you want to       │
│ delete [Item Name]?            │
│                                │
│ This action cannot be undone.  │
│                                │
│ [Cancel] [Delete]              │
└────────────────────────────────┘
```

---

## ✅ Success Messages

```
┌────────────────────────────────┐
│ ✅ User "John Doe" created!     │
│    (auto-disappears in 3 sec)   │
└────────────────────────────────┘
```

---

## 🎯 Quick Access

**From anywhere, you can reach admin pages:**

- `/dashboard/admin` - Main dashboard
- `/dashboard/admin/users` - User management
- `/dashboard/admin/doctors` - Doctor management
- `/dashboard/admin/appointments` - Appointment management
- `/dashboard/admin/settings` - System settings

---

**Created:** March 29, 2026  
**Version:** 1.0  
**Status:** ✅ Complete & Ready
