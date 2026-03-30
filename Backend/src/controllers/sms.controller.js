require('dotenv').config();
const https = require('https');
const AfricasTalking = require('africastalking');
const { generateUUID, sanitizeInput, isValidDate, isFutureDate, isValidTime } = require('../utils/validation');

// Helper function for Supabase REST API calls
async function supabaseQuery(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1${endpoint}`);
    const headers = {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
    };

    const options = {
      method,
      headers,
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : [];
          resolve({ data: parsed, status: res.statusCode });
        } catch (e) {
          resolve({ data: null, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const getSMS = () => {
  const AT = AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  });
  return AT.SMS;
};

// ── Send SMS reply ─────────────────────────────────────────────────────────────
const sendSMS = async (to, message) => {
  try {
    await getSMS().send({ to: [to], message, from: 'KIEClinic' });
    console.log(`SMS sent to ${to}: ${message}`);
  } catch (err) {
    console.error(`Failed to send SMS to ${to}:`, err.message);
  }
};

// ── Parse command ──────────────────────────────────────────────────────────────
const parseCommand = (text) => {
  const parts = text.trim().toUpperCase().split(/\s+/);
  const command = parts[0];
  const args = text.trim().split(/\s+/).slice(1);
  return { command, args };
};

// ── REGISTER name age ──────────────────────────────────────────────────────────
const handleRegister = async (phone, args) => {
  if (args.length < 2) {
    return 'Invalid format. Send: REGISTER Your Name Age\nExample: REGISTER John Doe 25';
  }

  const age = parseInt(args[args.length - 1]);
  if (isNaN(age) || age < 1 || age > 120) {
    return 'Invalid format. Last word must be your age.\nExample: REGISTER John Doe 25';
  }

  const fullName = args.slice(0, args.length - 1).join(' ');
  const firstName = fullName.split(' ')[0];
  const lastName = fullName.split(' ').slice(1).join(' ') || firstName;

  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - age);
  const dobStr = dob.toISOString().split('T')[0];

  try {
    // Check if user with this phone already exists
    const { data: existing, status: checkStatus } = await supabaseQuery('GET', `/users?phone=eq.${encodeURIComponent(phone)}&role=eq.patient`);
    
    if (checkStatus === 200 && Array.isArray(existing) && existing.length > 0) {
      return `You are already registered as ${existing[0].first_name} ${existing[0].last_name}. Send BOOK, QUEUE, or CANCEL.`;
    }

    // Create new patient user
    const userId = generateUUID();
    const tempPassword = Math.random().toString(36).slice(-8);
    
    const { data: createdUsers, status: createStatus } = await supabaseQuery('POST', '/users', {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email: `${phone}@smsclinic.local`,
      password: tempPassword,
      phone: phone,
      date_of_birth: dobStr,
      role: 'patient',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (createStatus !== 201 && createStatus !== 200) {
      return 'Registration failed. Please try again.';
    }

    const isPriority = age >= 65;
    if (isPriority) {
      return `Welcome ${fullName}! You have been registered as a PRIORITY patient (age ${age}). You will receive priority queue placement.\n\nSend BOOK date time to book an appointment.\nExample: BOOK 2026-03-15 09:00`;
    }

    return `Welcome ${fullName}! You have been registered successfully.\n\nSend BOOK date time to book an appointment.\nExample: BOOK 2026-03-15 09:00`;
  } catch (err) {
    console.error('REGISTER error:', err.message);
    return 'Registration failed. Please try again.';
  }
};

// ── BOOK date time ─────────────────────────────────────────────────────────────
const handleBook = async (phone, args) => {
  if (args.length < 2) {
    return 'Invalid format. Send: BOOK date time\nExample: BOOK 2026-03-15 09:00';
  }

  const date = args[0];
  const time = args[1];

  if (!isValidDate(date) || !isValidTime(time)) {
    return 'Invalid date/time format. Use: BOOK YYYY-MM-DD HH:MM\nExample: BOOK 2026-03-15 09:00';
  }

  if (!isFutureDate(date)) {
    return 'Appointment date must be in the future. Please select a future date.';
  }

  try {
    const { data: patients, status: patientsStatus } = await supabaseQuery('GET', `/users?phone=eq.${encodeURIComponent(phone)}&role=eq.patient`);
    
    if (patientsStatus !== 200 || !Array.isArray(patients) || patients.length === 0) {
      return 'You are not registered. Send REGISTER Your Name Age first.\nExample: REGISTER John Doe 25';
    }

    const patient = patients[0];
    const age = patient.date_of_birth
      ? Math.floor((new Date() - new Date(patient.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;
    const isPriority = age >= 65;

    // Get default doctor (first available doctor)
    const { data: doctors, status: doctorsStatus } = await supabaseQuery('GET', `/users?role=eq.doctor&limit=1`);
    
    if (doctorsStatus !== 200 || !Array.isArray(doctors) || doctors.length === 0) {
      return 'No doctors available at the moment. Please try again later.';
    }

    const doctorId = doctors[0].id;

    // Create appointment
    const appointmentId = generateUUID();
    const reason = 'SMS Booking';
    const { data: appointments, status: apptStatus } = await supabaseQuery('POST', '/appointments', {
      id: appointmentId,
      doctor_id: doctorId,
      patient_id: patient.id,
      appointment_date: date,
      appointment_time: time,
      reason: reason,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (apptStatus !== 201 && apptStatus !== 200) {
      return 'Booking failed. Please try again.';
    }

    if (isPriority) {
      return `Appointment booked for ${patient.first_name} ${patient.last_name} on ${date} at ${time}.\nAs a priority patient, you will receive priority queue placement on the day.\n\nSend QUEUE to check your position or CANCEL to cancel.`;
    }

    return `Appointment booked for ${patient.first_name} ${patient.last_name} on ${date} at ${time}.\n\nSend QUEUE to check your position or CANCEL to cancel.`;
  } catch (err) {
    console.error('BOOK error:', err.message);
    return 'Booking failed. Please try again.';
  }
};

// ── QUEUE ──────────────────────────────────────────────────────────────────────
const handleQueue = async (phone) => {
  try {
    const { data: patients, status: patientsStatus } = await supabaseQuery('GET', `/users?phone=eq.${encodeURIComponent(phone)}&role=eq.patient`);
    
    if (patientsStatus !== 200 || !Array.isArray(patients) || patients.length === 0) {
      return 'You are not registered. Send REGISTER Your Name and Age first.';
    }

    const patient = patients[0];
    const { data: queueEntries, status: queueStatus } = await supabaseQuery('GET', `/queue_entries?patient_id=eq.${patient.id}&status=in.(waiting,in-progress)&order=position.asc`);

    if (queueStatus !== 200 || !Array.isArray(queueEntries) || queueEntries.length === 0) {
      return `${patient.first_name} ${patient.last_name}, you are not currently in the queue. Visit the clinic to check in.`;
    }

    const entry = queueEntries[0];
    const patientsAhead = entry.position - 1;

    if (patientsAhead === 0) {
      return `${patient.first_name} ${patient.last_name}, you are NEXT in the queue! Please proceed to the consultation room.`;
    }

    return `${patient.first_name} ${patient.last_name}, you are number ${entry.position} in the queue. ${patientsAhead} patient(s) ahead of you.`;
  } catch (err) {
    console.error('QUEUE error:', err.message);
    return 'Failed to get queue position. Please try again.';
  }
};

// ── CANCEL ─────────────────────────────────────────────────────────────────────
const handleCancel = async (phone) => {
  try {
    const { data: patients, status: patientsStatus } = await supabaseQuery('GET', `/users?phone=eq.${encodeURIComponent(phone)}&role=eq.patient`);
    
    if (patientsStatus !== 200 || !Array.isArray(patients) || patients.length === 0) {
      return 'You are not registered. Send REGISTER Your Name Age first.';
    }

    const patient = patients[0];
    const { data: appointments, status: apptStatus } = await supabaseQuery('GET', `/appointments?patient_id=eq.${patient.id}&status=eq.scheduled&order=appointment_date.asc,appointment_time.asc&limit=1`);

    if (apptStatus !== 200 || !Array.isArray(appointments) || appointments.length === 0) {
      return `${patient.first_name} ${patient.last_name}, you have no upcoming appointments to cancel.`;
    }

    const appt = appointments[0];
    const { status: updateStatus } = await supabaseQuery('PATCH', `/appointments?id=eq.${appt.id}`, {
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    });

    if (updateStatus !== 200) {
      return 'Cancellation failed. Please try again.';
    }

    return `${patient.first_name} ${patient.last_name}, your appointment on ${appt.appointment_date} at ${appt.appointment_time} has been cancelled successfully.`;
  } catch (err) {
    console.error('CANCEL error:', err.message);
    return 'Cancellation failed. Please try again.';
  }
};

// ── Main webhook handler ───────────────────────────────────────────────────────
const handleIncomingSMS = async (req, res) => {
  res.status(200).json({ message: 'SMS received' });

  const from = req.body.from || req.body.From;
  const text = req.body.text || req.body.Text || req.body.message;

  if (!from || !text) {
    console.error('Invalid webhook payload:', req.body);
    return;
  }

  console.log(`Incoming SMS from ${from}: ${text}`);

  const { command, args } = parseCommand(text);
  let reply = '';

  switch (command) {
    case 'REGISTER':
      reply = await handleRegister(from, args);
      break;
    case 'BOOK':
      reply = await handleBook(from, args);
      break;
    case 'QUEUE':
      reply = await handleQueue(from);
      break;
    case 'CANCEL':
      reply = await handleCancel(from);
      break;
    default:
      reply = 'Unknown command. Available commands:\n• REGISTER Your Name Age\n• BOOK YYYY-MM-DD HH:MM\n• QUEUE\n• CANCEL';
      break;
  }

  await sendSMS(from, reply);
};

module.exports = { handleIncomingSMS };