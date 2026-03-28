require('dotenv').config();
const AfricasTalking = require('africastalking');
const pool = require('../db');

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
    const [existing] = await pool.query(
      'SELECT * FROM Patient WHERE PhoneNumber = ?', [phone]
    );
    if (existing.length > 0) {
      return `You are already registered as ${existing[0].FirstName} ${existing[0].LastName}. Send BOOK, QUEUE, or CANCEL.`;
    }

    await pool.query(
      'INSERT INTO Patient (FirstName, LastName, PhoneNumber, DateOfBirth, IsActive) VALUES (?, ?, ?, ?, 1)',
      [firstName, lastName, phone, dobStr]
    );

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

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return 'Invalid date/time format. Use: BOOK YYYY-MM-DD HH:MM\nExample: BOOK 2026-03-15 09:00';
  }

  try {
    const [patients] = await pool.query(
      'SELECT * FROM Patient WHERE PhoneNumber = ?', [phone]
    );
    if (patients.length === 0) {
      return 'You are not registered. Send REGISTER Your Name Age first.\nExample: REGISTER John Doe 25';
    }

    const patient = patients[0];
    const age = patient.DateOfBirth
      ? Math.floor((new Date() - new Date(patient.DateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;
    const isPriority = age >= 65;
    const doctorId = 2;

    await pool.query(
      'INSERT INTO Appointment (PatientID, DoctorID, AppointmentDate, AppointmentTime, Status, Notes) VALUES (?, ?, ?, ?, ?, ?)',
      [patient.PatientID, doctorId, date, `${time}:00`, 'Pending', 'Booked via SMS']
    );

    if (isPriority) {
      return `Appointment booked for ${patient.FirstName} ${patient.LastName} on ${date} at ${time}.\nAs a priority patient, you will receive priority queue placement on the day.\n\nSend QUEUE to check your position or CANCEL to cancel.`;
    }

    return `Appointment booked for ${patient.FirstName} ${patient.LastName} on ${date} at ${time}.\n\nSend QUEUE to check your position or CANCEL to cancel.`;
  } catch (err) {
    console.error('BOOK error:', err.message);
    return 'Booking failed. Please try again.';
  }
};

// ── QUEUE ──────────────────────────────────────────────────────────────────────
const handleQueue = async (phone) => {
  try {
    const [patients] = await pool.query(
      'SELECT * FROM Patient WHERE PhoneNumber = ?', [phone]
    );
    if (patients.length === 0) {
      return 'You are not registered. Send REGISTER Your Name Age first.';
    }

    const patient = patients[0];
    const [queueEntries] = await pool.query(
      'SELECT * FROM QueueEntry WHERE PatientID = ? AND Status = ? ORDER BY PositionInQueue ASC',
      [patient.PatientID, 'Waiting']
    );

    if (queueEntries.length === 0) {
      return `${patient.FirstName} ${patient.LastName}, you are not currently in the queue. Visit the clinic to check in.`;
    }

    const entry = queueEntries[0];
    const patientsAhead = entry.PositionInQueue - 1;

    if (patientsAhead === 0) {
      return `${patient.FirstName} ${patient.LastName}, you are NEXT in the queue! Please proceed to the consultation room.`;
    }

    return `${patient.FirstName} ${patient.LastName}, you are number ${entry.PositionInQueue} in the queue. ${patientsAhead} patient(s) ahead of you.`;
  } catch (err) {
    console.error('QUEUE error:', err.message);
    return 'Failed to get queue position. Please try again.';
  }
};

// ── CANCEL ─────────────────────────────────────────────────────────────────────
const handleCancel = async (phone) => {
  try {
    const [patients] = await pool.query(
      'SELECT * FROM Patient WHERE PhoneNumber = ?', [phone]
    );
    if (patients.length === 0) {
      return 'You are not registered. Send REGISTER Your Name Age first.';
    }

    const patient = patients[0];
    const [appointments] = await pool.query(
  'SELECT * FROM Appointment WHERE PatientID = ? AND Status = ? ORDER BY AppointmentDate ASC, AppointmentTime ASC LIMIT 1',
  [patient.PatientID, 'Pending']
);

    if (appointments.length === 0) {
      return `${patient.FirstName} ${patient.LastName}, you have no upcoming appointments to cancel.`;
    }

    const appt = appointments[0];
    await pool.query(
      'UPDATE Appointment SET Status = "Cancelled" WHERE AppointmentID = ?',
      [appt.AppointmentID]
    );

    const dateStr = new Date(appt.AppointmentDate).toISOString().split('T')[0];
    return `${patient.FirstName} ${patient.LastName}, your appointment on ${dateStr} at ${appt.AppointmentTime} has been cancelled successfully.`;
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