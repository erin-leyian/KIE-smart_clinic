# Doctor Features - Quick Reference

## Doctor Dashboard Access

### 1. Viewing Appointments
- **Location**: Dashboard → All Appointments
- **Filter**: Shows only appointments where the logged-in doctor is assigned
- **Display**: All appointment details including date, time, patient, and specialty

### 2. Adding/Editing Notes
#### In All Appointments View:
1. Click on any appointment from the list
2. Modal opens showing appointment details
3. Click "Add Notes" button
4. Type clinical information in the textarea
5. Click "Save Notes" to persist
6. Click "Cancel Edit" to exit without saving

#### In Doctor Dashboard:
1. View appointment in calendar or lists
2. Click on appointment to open details
3. Click "Edit" button next to "Appointment Notes"
4. Type/modify notes in textarea
5. Click "Save Notes" to persist
6. Click "Cancel" to exit without saving

### 3. Note Content Guidelines
Add any relevant clinical information:
- Patient symptoms and complaints
- Examination findings
- Diagnosis
- Treatment plan
- Medications prescribed
- Follow-up recommendations
- Additional clinical observations

### 4. Appointment Actions
**Pending Appointments:**
- Confirm Appointment
- Decline Appointment
- Add Notes

**Confirmed Appointments:**
- Reschedule
- Cancel
- Add/Edit Notes

**Completed Appointments:**
- View Notes (read-only)

## Patient View

### Patient Appointment Access
- **Location**: Dashboard → All Appointments
- **Filter**: Shows only patient's own appointments
- **Doctor's Notes**: Can view notes added by the doctor (read-only)

### Patient Actions
- Confirm appointment
- Reschedule
- Cancel appointment
- View doctor's notes

## Implementation Details

### Database Fields
```javascript
{
  id: "apt_123",
  doctorName: "Dr. Smith",
  patientName: "John Doe",
  date: "2026-03-29",
  time: "10:00 - 10:30",
  notes: "Patient presented with fever and cough...", // Doctor's notes
  status: "Confirmed",
  // ... other fields
}
```

### State Management
```javascript
// AllAppointments.jsx
const [isEditingNotes, setIsEditingNotes] = useState(false);
const [notes, setNotes] = useState('');

// DoctorDashboard.jsx
const [isEditingNotes, setIsEditingNotes] = useState(false);
const [appointmentNotes, setAppointmentNotes] = useState('');
```

### Key Functions
```javascript
// Save appointment notes
const handleSaveNotes = () => {
  const updated = appointments.map(apt =>
    apt.id === selectedAppointment.id 
      ? { ...apt, notes } 
      : apt
  );
  setAppointments(updated);
  setSelectedAppointment({ ...selectedAppointment, notes });
  setIsEditingNotes(false);
};
```

## User Roles & Permissions

| Action | Patient | Doctor | Admin |
|--------|---------|--------|-------|
| View own appointments | ✓ | View assigned | ✓ All |
| View others' appointments | ✗ | ✗ | ✓ |
| Add notes | ✗ | ✓ | ✓ |
| Edit notes | ✗ | Own notes | ✓ All |
| Confirm appointment | ✓ | ✓ | ✓ |
| Cancel appointment | ✓ | ✓ | ✓ |
| Reschedule | ✓ | ✓ | ✓ |
| View notes | ✓ Doctor's | ✓ Own | ✓ All |

## Troubleshooting

### Doctor doesn't see appointments
- Check user is logged in with doctor role
- Verify appointment has doctor's name matching
- Check localStorage has userRole = 'doctor'

### Notes not saving
- Verify click "Save Notes" button (not just closing modal)
- Check browser console for errors
- Ensure appointment object has notes field

### Edit button not visible
- Confirm logged in as doctor (not patient)
- Check userRole state is 'doctor'
- Verify modal is for doctor user

## Future Enhancements
- Note timestamps
- Note history/versions
- Shared notes between doctors
- Note templates
- PDF export with notes
- Voice-to-text notes
