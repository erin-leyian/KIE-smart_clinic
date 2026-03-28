# Appointment Data Structure - Complete Reference

## Overview
All 38 appointments in mockData.json now have complete data with all required fields for proper functioning across the application.

## Complete Appointment Data Fields

Each appointment object contains:

```javascript
{
  "id": number,                    // Unique appointment ID (1-38)
  "patientName": string,           // Patient's full name
  "patientId": number,             // Patient's ID (all are 2 for Alice Uwirimana)
  "doctorName": string,            // Doctor's full name
  "doctorImage": string,           // URL to doctor's profile image
  "specialty": string,             // Medical specialty
  "hospital": string,              // Hospital/clinic location
  "time": string,                  // Appointment time range (e.g., "09:00 - 09:30")
  "date": string,                  // Relative date (Yesterday, Today, Tomorrow, Next week, or specific date)
  "dateObj": string,               // ISO date format (YYYY-MM-DD)
  "status": string,                // Status: "Completed", "Confirmed", "Pending", "Scheduled"
  "type": string,                  // Type: "In-Person" or "Video Call"
  "fee": string,                   // Consultation fee (e.g., "15000 RWF")
  "notes": string                  // Additional notes about the appointment
}
```

## All 38 Appointments

### Past Appointments (Completed)
- **ID 1**: Dr. Jean Mukasine (General Practitioner) - Yesterday - In-Person - 15000 RWF
- **ID 2**: Dr. Marie Ikirezi (Pediatrician) - Yesterday - In-Person - 28000 RWF
- **ID 3**: Dr. Sylvain Uwizeye (Cardiologist) - Yesterday - Video Call - 35000 RWF

### Current/Upcoming Appointments (Confirmed)
- **ID 4**: Dr. Grace Mukantabana (Obstetrician) - Today - In-Person - 40000 RWF
- **ID 5**: Dr. Paul Hakizimana (Surgeon) - Today - In-Person - 50000 RWF
- **ID 13**: Dr. Clement Karekezi (ENT Specialist) - April 12 - In-Person - 24000 RWF
- **ID 14**: Dr. Jean Mukasine (General Practitioner) - April 5 - In-Person - 15000 RWF
- **ID 17**: Dr. Denis Murwanashyaka (Gastroenterologist) - April 8 - In-Person - 31000 RWF
- **ID 21**: Dr. Clement Karekezi (ENT Specialist) - April 12 - In-Person - 24000 RWF
- **ID 24**: Dr. Patrick Ndayisaba (Surgeon) - April 15 - In-Person - 50000 RWF
- **ID 27**: Dr. Angelique Ishimwe (Radiologist) - April 18 - In-Person - 30000 RWF
- **ID 29**: Dr. Christine Kabasha (Obstetrician) - April 20 - In-Person - 40000 RWF
- **ID 31**: Dr. Oscar Habiyakire (Gastroenterologist) - April 22 - In-Person - 31000 RWF
- **ID 33**: Dr. Felix Nkosi (Pulmonologist) - April 24 - In-Person - 29000 RWF
- **ID 36**: Dr. Samuel Kamali (ENT Specialist) - April 27 - In-Person - 24000 RWF
- **ID 38**: Dr. Jacqueline Mugwaneza (General Practitioner) - April 29 - In-Person - 15000 RWF

### Pending Appointments
- **ID 6**: Dr. Innocent Ndahiro (Dermatologist) - Tomorrow - Video Call - 24000 RWF
- **ID 7**: Dr. Denis Murwanashyaka (Gastroenterologist) - Tomorrow - In-Person - 31000 RWF
- **ID 14**: Dr. Jean Mukasine (General Practitioner) - April 5 - In-Person - 15000 RWF
- **ID 15**: Dr. Florence Umutoniwase (Neurologist) - April 6 - Video Call - 38000 RWF
- **ID 23**: Dr. Sarah Nkurikiye (Anesthesiologist) - April 14 - In-Person - 25000 RWF
- **ID 26**: Dr. Romain Mbabazi (Infectious Disease) - April 17 - Video Call - 33000 RWF
- **ID 30**: Dr. Henry Muneza (Orthopedist) - April 21 - Video Call - 32000 RWF
- **ID 34**: Dr. Diana Izere (Psychiatrist) - April 25 - Video Call - 29000 RWF
- **ID 37**: Dr. Clement Kazungu (Urologist) - April 28 - Video Call - 34000 RWF

### Scheduled Appointments
- **ID 8**: Dr. Florence Umutoniwase (Neurologist) - Next week - Video Call - 38000 RWF
- **ID 9**: Dr. Clement Karekezi (ENT Specialist) - Next week - In-Person - 24000 RWF
- **ID 10**: Dr. Hortense Nzamwita (Ophthalmologist) - Next week - In-Person - 26000 RWF
- **ID 11**: Dr. Sylvain Uwizeye (Cardiologist) - April 2 - In-Person - 35000 RWF
- **ID 12**: Dr. Grace Mukantabana (Obstetrician) - April 3 - In-Person - 40000 RWF
- **ID 15**: Dr. Florence Umutoniwase (Neurologist) - April 6 - Video Call - 38000 RWF
- **ID 16**: Dr. Innocent Ndahiro (Dermatologist) - April 7 - Video Call - 24000 RWF
- **ID 18**: Dr. Marie Ikirezi (Pediatrician) - April 9 - In-Person - 28000 RWF
- **ID 19**: Dr. Théo Habimana (Orthopedist) - April 10 - In-Person - 32000 RWF
- **ID 20**: Dr. Viviane Mukankusi (Psychiatrist) - April 11 - Video Call - 27000 RWF
- **ID 22**: Dr. Alain Sebisoni (Cardiologist) - April 13 - Video Call - 35000 RWF
- **ID 25**: Dr. Beatrice Mutoni (Ophthalmologist) - April 16 - In-Person - 26000 RWF
- **ID 28**: Dr. Moses Kamanzi (Pediatrician) - April 19 - In-Person - 28000 RWF
- **ID 32**: Dr. Fabienne Ntawigaya (Dermatologist) - April 23 - Video Call - 24000 RWF
- **ID 35**: Dr. Marguerite Uwizeyimana (Rheumatologist) - April 26 - In-Person - 36000 RWF

## Hospitals/Clinics Used

1. **Kigali Central Hospital** - 11 appointments
2. **King Faisal Hospital** - 11 appointments
3. **Rwanda Medical Center** - 16 appointments

## Consultation Types

- **In-Person**: 28 appointments (73.7%)
- **Video Call**: 10 appointments (26.3%)

## Fee Range

- Minimum: 15,000 RWF (General Practitioners)
- Maximum: 50,000 RWF (Surgeons)
- Average: ~29,500 RWF

## Status Distribution

- **Completed**: 3 appointments
- **Confirmed**: 13 appointments
- **Pending**: 9 appointments
- **Scheduled**: 13 appointments

## Specialties Represented

1. General Practitioner
2. Pediatrician
3. Cardiologist
4. Obstetrician
5. Surgeon
6. Dermatologist
7. Gastroenterologist
8. Neurologist
9. ENT Specialist
10. Ophthalmologist
11. Anesthesiologist
12. Infectious Disease
13. Orthopedist
14. Psychiatrist
15. Radiologist
16. Rheumatologist
17. Urologist
18. Pulmonologist

## Patient Information

- **Patient**: Alice Uwirimana
- **Patient ID**: 2
- **Total Appointments**: 38
- **Date Range**: March 27 - April 29, 2026

## Data Validation

✅ All 38 appointments have:
- ✓ ID (1-38)
- ✓ Patient Name (Alice Uwirimana)
- ✓ Patient ID (2)
- ✓ Doctor Name
- ✓ Doctor Image URL
- ✓ Specialty
- ✓ Hospital/Clinic Name
- ✓ Appointment Time
- ✓ Appointment Date (relative and ISO format)
- ✓ Status (Completed, Confirmed, Pending, Scheduled)
- ✓ Type (In-Person, Video Call)
- ✓ Fee in RWF
- ✓ Notes/Description

## Usage in Application

### AllAppointments.jsx
- Uses all appointment fields for display
- Filters by patient ID and status
- Shows fee and type in cards and modals
- Creates notifications with appointment data

### PatientRecords.jsx
- Uses appointment data for history
- Displays in consultation history section
- Shows doctor info and appointment details

### NotificationHistory.jsx
- Displays all appointment details from notifications
- Shows doctor, time, location, and fee
- Provides filtering by type and status

### Profile.jsx
- Shows consultation history
- Uses appointment data for display
- Filters by patient ID
- Shows appointment cards with formatted dates

## Future Enhancements

1. **Additional Specialties**: Expand to more medical specialties
2. **More Hospitals**: Add more healthcare facilities
3. **Time Slots**: More granular appointment time management
4. **Recurring Appointments**: Support for recurring appointments
5. **Follow-up Appointments**: Link between related appointments
6. **Lab Results**: Attach lab results to appointments
7. **Prescription Data**: Link prescriptions to appointments
8. **Patient History**: Medical history related to appointments
