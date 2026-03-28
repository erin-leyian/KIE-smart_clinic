# Doctor Features Quick Reference

## Navigation Paths

| Feature | URL | Access |
|---------|-----|--------|
| Doctor Dashboard | `/dashboard` | Metrics & patient overview |
| My Appointments | `/dashboard/doctor/appointments` | Full appointment management |
| Patient Records | `/dashboard/patient-records` | View & edit patient records |
| Profile | `/dashboard/profile` | Update personal information |

---

## Doctor Sidebar Menu

When logged in as a doctor, sidebar shows:
- 🏥 Dashboard (metrics dashboard)
- 📅 My Appointments (appointment management)
- 🔔 Notifications (notification history)
- 👤 Profile (edit profile)
- ❓ Help (help center)

---

## Dashboard Metrics

### Top Row (4 Cards)
| Metric | What it shows | Click action |
|--------|---------------|--------------|
| **Total Patients** | Count of unique patients you've seen | N/A |
| **Pending Confirmations** | Appointments waiting for your confirmation | Links to My Appointments |
| **Upcoming Appointments** | Confirmed appointments for today | N/A |
| **Completed** | Total consultations you've completed | N/A |

### Middle Row (3 Cards)
| Metric | What it shows |
|--------|---------------|
| **Consultation Hours** | Est. hours from completed appointments (30 min/appointment) |
| **Total Appointments** | All appointments (across all statuses) |
| **Patient Records** | Count of patient records you can manage |

### Sections Below
- **Quick Actions** - 3 buttons for common tasks
- **Recent Treatment History** - 5 most recent completed appointments
- **Your Patients** - Grid view of assigned patients (shows 6)

---

## My Appointments Page (`/dashboard/doctor/appointments`)

### Features:
1. **Filters** - All, Upcoming, History (Completed), by status
2. **Sort** - By date ascending/descending or by patient name
3. **Grouping** - Appointments grouped by patient (patient header + their appointments)
4. **Per-Appointment** - Status badge, type, time, location, patient name

### Actions Per Appointment:
| Status | Available Actions |
|--------|------------------|
| **Pending** | Confirm, Reschedule, Decline, Add/Edit notes |
| **Confirmed** | Reschedule, Cancel, Add/Edit notes |
| **Completed** | View details, Add/Edit notes |
| **Cancelled** | View history only |

### Appointment Details Modal:
- Patient name and email
- Date, time, type (In-Person/Video), location
- Consultation type (General, Follow-up, etc.)
- Fee amount
- **Notes section** (editable by doctor)
- Action buttons (Confirm/Reschedule/Cancel as applicable)

---

## Patient Records Page (`/dashboard/patient-records`)

### What Doctors See:
- **Own patients only** - Records of patients they have appointments with
- **Edit access** - Can modify diagnosis, treatment, medications, notes
- **Same design as patient view** - Familiar UI

### Edit Capability:
Doctors can edit:
- ✏️ Diagnosis
- ✏️ Treatment plan
- ✏️ Medications (add, edit, delete)
- ✏️ Consultation notes
- ✏️ Additional notes

### Cannot Edit:
- Patient name (view only)
- Appointment date/time (read-only)
- Doctor name (read-only)

### Restrictions:
- Only see/edit records for patients with doctor-patient relationship
- No "Edit" button appears for patients outside your practice
- Patient records section in detail view only shows "Edit" button when appropriate

---

## Permission Rules Summary

### You CAN do:
✅ Confirm/decline appointments  
✅ Reschedule confirmed appointments  
✅ Add/edit appointment notes  
✅ View your patients' records  
✅ Edit diagnosis, treatment, medications for your patients  
✅ Add consultations and medications  
✅ Download patient records as PDF  
✅ Create new appointments (if needed)

### You CANNOT do:
❌ Edit records for patients not in your care  
❌ Delete appointments directly (can only cancel them)  
❌ Access patient records from other doctors  
❌ Modify patient personal information  
❌ View sensitive admin settings

---

## Common Workflows

### Workflow 1: Confirm a Pending Appointment
1. Log in as doctor
2. Go to Dashboard (view pending confirmations count)
3. Click "View Pending" or navigate to My Appointments
4. Find pending appointment
5. Click appointment card
6. Click "Confirm Appointment" button
7. Confirmation notification sent to patient

### Workflow 2: Add Notes to Appointment
1. Navigate to My Appointments
2. Click on any appointment
3. In detail modal, click "Edit" next to Appointment Notes
4. Add clinical notes (diagnosis, observations, etc.)
5. Click "Save Notes"
6. Notes saved to appointment record

### Workflow 3: Edit Patient's Treatment Plan
1. Navigate to Patient Records
2. Find patient you have appointments with
3. Click "View Full Record"
4. Click "Edit Record" button (only visible for your patients)
5. Update diagnosis, treatment, or add medications
6. Save changes
7. Changes persist in records

### Workflow 4: View Treatment History
1. Go to Dashboard
2. Scroll to "Recent Treatment History" section (shows 5 most recent)
3. Click "View All" to see complete history
4. Or go to My Appointments → Filter by "History" → View completed appointments

### Workflow 5: Manage Your Patients
1. Go to Dashboard
2. Scroll to "Your Patients" section
3. See card for each patient (name, email, phone, appointment count)
4. Click "View Records" on patient card
5. Access that patient's full medical records

---

## Status Meanings

| Status | Meaning | Doctor Action |
|--------|---------|---------------|
| **Pending** | Awaiting doctor confirmation | Confirm or Decline |
| **Confirmed** | Doctor has confirmed, patient acknowledged | Reschedule or Cancel |
| **Completed** | Appointment happened | View details & notes |
| **Cancelled** | Either party cancelled | View history only |

---

## Tips & Best Practices

1. **Check Dashboard Daily** - See pending confirmations at a glance
2. **Add Notes During/After** - Click appointment and edit notes while fresh
3. **Use Filters** - Separate pending vs confirmed for easier management
4. **Quick Actions** - Use dashboard buttons to jump to common tasks
5. **Patient Records** - Keep treatment plans updated for better continuity of care
6. **Consultation Types** - Use appropriate type (Follow-up, New consultation, etc.)

---

## Troubleshooting

### Missing Edit Button on Patient Records?
- Doctor-patient relationship required (you must have an appointment with them)
- Check if patient ID matches one from your appointments
- Refresh page if recently added patient

### Notifications Not Showing?
- Check notification history in sidebar
- Confirm actions trigger notifications (confirm, decline, reschedule)
- See Notifications page for full history

### Can't See Patient Records?
- Must have at least one appointment with patient
- Try My Appointments page first to confirm patient relationship
- Check patient ID matches your appointment data

---

## Contact & Support

For issues or questions:
- See Help page in sidebar (❓ icon)
- Contact system administrator
- Check notification history for system messages
