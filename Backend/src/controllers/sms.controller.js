require('dotenv').config();
const AfricasTalking = require('africastalking');

// ─────────────────────────────────────────────────────────────────────────────
// sms.controller.js
// Handles incoming SMS commands from Africa's Talking webhook.
// Commands: REGISTER, BOOK, QUEUE, CANCEL
// Priority booking: patients aged 65+ are flagged as priority
// ─────────────────────────────────────────────────────────────────────────────

const getSMS = () => {
  const AT = AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  });
  return AT.SMS;
};

// ── Fake patient store (remove when DB is connected) ──────────────────────────
const fakePatients = [
  { patient_id: 101, name: 'Alice Uwimana', phone: '+250788000001', age: 30, priority: false },
  { patient_id: 102, name: 'Bob Nkurunziza', phone: '+250788000002', age: 70, priority: true },
];

// ── Fake queue (remove when DB is connected) ──────────────────────────────────
const fakeQueue = [
  { token_id: 1, patient_id: 101, patient_name: 'Alice Uwimana', queue_position: 1, status: 'waiting' },
  { token_id: 2, patient_id: 102, patient_name: 'Bob Nkurunziza', queue_position: 2, status: 'waiting' },
];

// ── Fake appointments (remove when DB is connected) ───────────────────────────
const fakeAppointments = [];

// ─────────────────────────────────────────────────────────────────────────────
// sendSMS — sends a reply back to the patient
// ─────────────────────────────────────────────────────────────────────────────
const sendSMS = async (to, message) => {
  try {
    await getSMS().send({ to: [to], message, from: 'KIEClinic' });
    console.log(`SMS sent to ${to}: ${message}`);
  } catch (err) {
    console.error(`Failed to send SMS to ${to}:`, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// parseCommand — extracts the command and arguments from the SMS text
// ─────────────────────────────────────────────────────────────────────────────
const parseCommand = (text) => {
  const parts = text.trim().toUpperCase().split(/\s+/);
  const command = parts[0];
  const args = text.trim().split(/\s+/).slice(1); // preserve original case for names
  return { command, args };
};

// ─────────────────────────────────────────────────────────────────────────────
// handleRegister — REGISTER name age
// Example: REGISTER John Doe 67
// ─────────────────────────────────────────────────────────────────────────────
const handleRegister = async (phone, args) => {
  if (args.length < 2) {
    return 'Invalid format. Send: REGISTER Your Name Age\nExample: REGISTER John Doe 25';
  }

  const age = parseInt(args[args.length - 1]);
  if (isNaN(age) || age < 1 || age > 120) {
    return 'Invalid format. Last word must be your age.\nExample: REGISTER John Doe 25';
  }

  const name = args.slice(0, args.length - 1).join(' ');
  const isPriority = age >= 65;

  // Check if already registered
  const existing = fakePatients.find(p => p.phone === phone);
  if (existing) {
    return `You are already registered as ${existing.name}. Send BOOK, QUEUE, or CANCEL.`;
  }

  // TODO: replace with real DB insert when connected
  // const [result] = await pool.query(
  //   'INSERT INTO patients (name, phone_number, age, priority) VALUES (?, ?, ?, ?)',
  //   [name, phone, age, isPriority]
  // );

  const newPatient = {
    patient_id: fakePatients.length + 101,
    name,
    phone,
    age,
    priority: isPriority,
  };
  fakePatients.push(newPatient);

  if (isPriority) {
    return `Welcome ${name}! You have been registered as a PRIORITY patient (age ${age}). You will receive priority queue placement.\n\nSend BOOK date time to book an appointment.\nExample: BOOK 2026-03-15 09:00`;
  }

  return `Welcome ${name}! You have been registered successfully.\n\nSend BOOK date time to book an appointment.\nExample: BOOK 2026-03-15 09:00`;
};

// ─────────────────────────────────────────────────────────────────────────────
// handleBook — BOOK date time
// Example: BOOK 2026-03-15 09:00
// ─────────────────────────────────────────────────────────────────────────────
const handleBook = async (phone, args) => {
  if (args.length < 2) {
    return 'Invalid format. Send: BOOK date time\nExample: BOOK 2026-03-15 09:00';
  }

  // Check patient is registered
  const patient = fakePatients.find(p => p.phone === phone);
  if (!patient) {
    return 'You are not registered. Send REGISTER Your Name Age first.\nExample: REGISTER John Doe 25';
  }

  const date = args[0];
  const time = args[1];
  const scheduledTime = `${date}T${time}:00`;

  // Validate date format loosely
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return 'Invalid date/time format. Use: BOOK YYYY-MM-DD HH:MM\nExample: BOOK 2026-03-15 09:00';
  }

  // TODO: replace with real DB insert when connected
  // const [result] = await pool.query(
  //   'INSERT INTO appointments (patient_id, scheduled_time, status) VALUES (?, ?, ?)',
  //   [patient.patient_id, scheduledTime, 'pending']
  // );

  const newAppointment = {
    appointment_id: fakeAppointments.length + 1,
    patient_id: patient.patient_id,
    patient_name: patient.name,
    phone,
    scheduled_time: scheduledTime,
    status: 'pending',
    priority: patient.priority,
  };
  fakeAppointments.push(newAppointment);

  if (patient.priority) {
    return `Appointment booked for ${patient.name} on ${date} at ${time}.\n\nAs a priority patient, you will receive priority queue placement on the day.\n\nSend QUEUE to check your position or CANCEL to cancel.`;
  }

  return `Appointment booked for ${patient.name} on ${date} at ${time}.\n\nSend QUEUE to check your position or CANCEL to cancel.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// handleQueue — QUEUE
// Returns the patient's current queue position
// ─────────────────────────────────────────────────────────────────────────────
const handleQueue = async (phone) => {
  const patient = fakePatients.find(p => p.phone === phone);
  if (!patient) {
    return 'You are not registered. Send REGISTER Your Name Age first.';
  }

  // TODO: replace with real DB query when connected
  // const [rows] = await pool.query(
  //   'SELECT q.*, p.full_name FROM queue_tokens q JOIN patients p ON q.patient_id = p.patient_id ' +
  //   'WHERE p.phone_number = ? AND q.status = "waiting"',
  //   [phone]
  // );
  // if (rows.length === 0) return 'You are not currently in the queue. Visit the clinic to check in.';
  // const patientsAhead = rows[0].queue_position - 1;
  // return `${patient.name}, you are number ${rows[0].queue_position} in the queue. ${patientsAhead} patient(s) ahead of you.`;

  const token = fakeQueue.find(q => q.patient_id === patient.patient_id && q.status === 'waiting');
  if (!token) {
    return `${patient.name}, you are not currently in the queue. Visit the clinic to check in.`;
  }

  const patientsAhead = token.queue_position - 1;
  if (patientsAhead === 0) {
    return `${patient.name}, you are NEXT in the queue! Please proceed to the consultation room.`;
  }

  return `${patient.name}, you are number ${token.queue_position} in the queue. ${patientsAhead} patient(s) ahead of you.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// handleCancel — CANCEL
// Cancels the patient's upcoming appointment
// ─────────────────────────────────────────────────────────────────────────────
const handleCancel = async (phone) => {
  const patient = fakePatients.find(p => p.phone === phone);
  if (!patient) {
    return 'You are not registered. Send REGISTER Your Name Age first.';
  }

  // TODO: replace with real DB update when connected
  // const [rows] = await pool.query(
  //   'SELECT * FROM appointments WHERE patient_id = ? AND status = "pending" ORDER BY scheduled_time ASC LIMIT 1',
  //   [patient.patient_id]
  // );
  // if (rows.length === 0) return `${patient.name}, you have no upcoming appointments to cancel.`;
  // await pool.query('UPDATE appointments SET status = "cancelled" WHERE appointment_id = ?', [rows[0].appointment_id]);
  // return `${patient.name}, your appointment on ${rows[0].scheduled_time} has been cancelled.`;

  const appointment = fakeAppointments.find(
    a => a.patient_id === patient.patient_id && a.status === 'pending'
  );

  if (!appointment) {
    return `${patient.name}, you have no upcoming appointments to cancel.`;
  }

  appointment.status = 'cancelled';
  return `${patient.name}, your appointment on ${appointment.scheduled_time} has been cancelled successfully.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// handleIncomingSMS — main webhook handler
// Africa's Talking sends: { from, to, text, date }
// ─────────────────────────────────────────────────────────────────────────────
const handleIncomingSMS = async (req, res) => {
  // Acknowledge Africa's Talking immediately (required)
  res.status(200).json({ message: 'SMS received' });

  const { from, text } = req.body;

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

  // Send reply back to patient
  await sendSMS(from, reply);
};

module.exports = { handleIncomingSMS };