# 🔑 Admin Panel - Quick Start Guide

## Login Credentials
```
Email: admin@queuecare.rw
Password: admin123
```

---

## 📍 Navigation

### Main Admin Dashboard
**URL:** `/dashboard/admin`

From here you can access:
1. **Manage Users** → All user management (add/edit/delete)
2. **Manage Doctors** → Doctor profiles and settings
3. **Manage Appointments** → All appointment management
4. **System Settings** → Hospitals, insurance, conditions

---

## 👥 Managing Users

### Access
Dashboard → "Manage Users" button  
Or direct: `/dashboard/admin/users`

### What You Can Do:
- **View** all users (patients, doctors, admins)
- **Search** by name or email
- **Filter** by role (Patient, Doctor, Admin)
- **Add** new users
- **Edit** user information:
  - Name, Email, Password
  - Role, Phone, Location
- **Delete** users (with confirmation)

### How to Add a User:
1. Click "Add New User" button
2. Fill in required fields (*Name, Email)
3. Choose role (Patient/Doctor/Admin)
4. Fill optional fields (phone, location)
5. Click "Add User"

### How to Edit a User:
1. Find user in table
2. Click Edit icon (pencil)
3. Modify fields
4. Click "Update User"

### How to Delete a User:
1. Click Delete icon (trash) next to user
2. Confirm deletion
3. User is removed

---

## 👨‍⚕️ Managing Doctors

### Access
Dashboard → "Manage Doctors" button  
Or direct: `/dashboard/admin/doctors`

### What You Can Do:
- **View** all doctors in professional card layout
- **Search** by doctor name
- **Filter** by specialty (19 specialties available)
- **Add** new doctors
- **Edit** doctor information:
  - Name, Specialty, Hospital
  - Experience, Fee, Rating
  - Working Hours, Profile Image
  - Languages
- **Delete** doctors (with confirmation)

### Available Specialties:
- General Practitioner
- Cardiologist, Pediatrician, Surgeon
- Obstetrician, Dermatologist
- Psychiatrist, Orthopedist
- Ophthalmologist, Gastroenterologist
- Neurologist, ENT Specialist
- And 7 more...

### How to Add a Doctor:
1. Click "Add New Doctor" button
2. Fill in required fields (*Name, Specialty)
3. Select hospital from list
4. Enter experience (e.g., "10 years")
5. Enter fee (e.g., "30000 RWF")
6. Set rating (0-5 stars)
7. Add working hours and image URL
8. Click "Add Doctor"

### How to Update Doctor Ratings:
1. Click Edit on doctor card
2. Change rating number (0-5)
3. Click "Update Doctor"

---

## 📅 Managing Appointments

### Access
Dashboard → "Manage Appointments" button  
Or direct: `/dashboard/admin/appointments`

### What You Can Do:
- **View** all appointments in table format
- **Search** by patient or doctor name
- **Filter** by appointment status
- **Add** new appointments
- **Edit** appointment details:
  - Patient, Doctor, Date, Time
  - Type (In-Person/Video Call)
  - Status, Fee, Notes
- **Delete** appointments (with confirmation)

### Appointment Statuses:
- **Pending** (🟡 Yellow) - Awaiting action
- **Confirmed** (🔵 Blue) - Confirmed by patient/doctor
- **Completed** (🟢 Green) - Appointment finished
- **Scheduled** (🟣 Purple) - On schedule
- **Cancelled** (🔴 Red) - Cancelled appointment

### How to Add an Appointment:
1. Click "Add New Appointment" button
2. Enter patient name and ID
3. Select doctor name
4. Enter specialty and hospital
5. Set appointment date and time
6. Choose type (In-Person/Video Call)
7. Select status (default: Pending)
8. Enter fee and notes
9. Click "Add Appointment"

### How to Edit an Appointment:
1. Find appointment in table
2. Click Edit icon
3. Modify any fields
4. Click "Update Appointment"

### How to Cancel an Appointment:
1. Click Edit on appointment
2. Change Status to "Cancelled"
3. Click "Update Appointment"

---

## ⚙️ System Settings

### Access
Dashboard → "System Settings" button  
Or direct: `/dashboard/admin/settings`

### Three Configuration Areas:

#### 1️⃣ HOSPITALS
- **View** all hospitals (5 currently)
- **Add** new hospitals:
  - Name, Location
  - Phone, Type
  - Rating, Reviews
- **Edit** hospital information
- **Delete** hospitals

#### 2️⃣ INSURANCE PROVIDERS
- **View** all insurance (4 currently)
- **Add** new insurance:
  - Name, Full Name
  - Type, Coverage %
  - Conditions
- **Edit** coverage and details
- **Delete** insurance providers

#### 3️⃣ MEDICAL CONDITIONS
- **View** all conditions (10 currently)
- **Add** new conditions:
  - Name, Description
  - Prevalence (High/Common/Moderate/Rare)
  - Icon (emoji), Treatments
- **Edit** condition details
- **Delete** conditions

---

## 📊 Dashboard Statistics

The Admin Dashboard shows:
- **Total Users** (all roles combined)
- **Total Doctors** (active practitioners)
- **Total Patients** (registered users)
- **Total Appointments** (all statuses)
- **Total Hospitals** (in network)
- **Completed Appointments** (finished consultations)
- **Pending Appointments** (awaiting action)

These update automatically as you add/delete items!

---

## 🔍 Search & Filter Tips

### User Management:
- **Search:** Type name or email
- **Filter:** Select role from dropdown
- Shows count: "Showing X of Y users"

### Doctor Management:
- **Search:** Type doctor name
- **Filter:** Select specialty
- Shows count: "Showing X of Y doctors"

### Appointment Management:
- **Search:** Type patient or doctor name
- **Filter:** Select appointment status
- Shows count: "Showing X of Y appointments"

### System Settings:
- **Tabs:** Switch between Hospitals/Insurance/Conditions
- **Search:** Each area has built-in search

---

## ⚠️ Important Notes

### Security:
- Always confirm before deleting users/doctors/appointments
- Deleted items cannot be recovered
- Only admins can access these pages

### Data Persistence:
- Changes persist during your session
- If you refresh browser, changes may reset
- For permanent storage, connect to backend database

### Validation:
- Required fields marked with *
- Email format is validated
- Phone numbers should include country code
- Dates use YYYY-MM-DD format

---

## 🚨 Troubleshooting

### Can't access admin pages?
- Check you're logged in as admin
- Verify email: admin@queuecare.rw
- Verify password: admin123

### Changes not showing?
- Click the "Add" or "Update" button
- Look for green success message
- Check the count at bottom updated

### Delete accidentally?
- Currently no undo available
- Make backups of important data
- Consider backend integration for permanent storage

### Form validation errors?
- Ensure * marked fields are filled
- Check email format is correct
- Verify all required information is entered

---

## 📱 Mobile Usage

All admin pages are mobile responsive:
- Tables convert to card view on small screens
- Forms stack vertically on mobile
- Buttons full-width for easy tapping
- All features available on mobile

---

## 🎯 Common Tasks

### Task: Add a New Doctor
1. Go to Manage Doctors
2. Click "Add New Doctor"
3. Fill: Name*, Specialty*, Hospital, Fee
4. Click "Add Doctor"

### Task: Change Appointment Status
1. Go to Manage Appointments
2. Click Edit on appointment
3. Change Status dropdown
4. Click "Update Appointment"

### Task: Add Hospital to System
1. Go to System Settings
2. Click Hospitals tab
3. Click "Add Hospital"
4. Fill name, location, phone, type
5. Click "Save Hospital"

### Task: Delete Patient Account
1. Go to Manage Users
2. Find patient in list
3. Click Delete (trash icon)
4. Confirm deletion
5. Patient account removed

---

## 📞 Support

If you need help:
- Check this guide first
- Review error messages
- Verify all required fields are filled
- Try refreshing the page

---

**Admin Panel Status: ✅ READY TO USE**
