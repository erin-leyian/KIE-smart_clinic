// ─────────────────────────────────────────────────────────────────────────────
// appointments.controller.js
// Fake data is used until the database is connected.
// When DB is ready: uncomment the pool.query lines and remove the fakeData blocks.
// ─────────────────────────────────────────────────────────────────────────────

// const pool = require('../db'); // Uncomment when DB is connected

// ── Fake data (remove when DB is connected) ───────────────────────────────────
const fakeAppointments = [
  {
    appointment_id: 1,
    patient_name: 'Alice Uwimana',
    phone_number: '+250788000001',
    scheduled_time: '2026-03-10T09:00:00',
    status: 'confirmed',
    created_at: '2026-03-08T08:00:00',
  },
  {
    appointment_id: 2,
    patient_name: 'Bob Nkurunziza',
    phone_number: '+250788000002',
    scheduled_time: '2026-03-10T10:00:00',
    status: 'pending',
    created_at: '2026-03-08T08:30:00',
  },
  {
    appointment_id: 3,
    patient_name: 'Claire Mutesi',
    phone_number: '+250788000003',
    scheduled_time: '2026-03-10T11:00:00',
    status: 'confirmed',
    created_at: '2026-03-08T09:00:00',
  },
];

// ── GET /api/appointments ─────────────────────────────────────────────────────
const getAppointments = async (req, res) => {
  try {
    // ── With DB (uncomment when ready) ──
    // const [rows] = await pool.query('SELECT * FROM appointments ORDER BY scheduled_time ASC');
    // return res.json({ appointments: rows });

    // ── Fake data ──
    res.json({ appointments: fakeAppointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
};

// ── GET /api/appointments/:id ─────────────────────────────────────────────────
const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  try {
    // ── With DB (uncomment when ready) ──
    // const [rows] = await pool.query('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
    // if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    // return res.json({ appointment: rows[0] });

    // ── Fake data ──
    const appointment = fakeAppointments.find(a => a.appointment_id === parseInt(id));
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointment', details: err.message });
  }
};

// ── POST /api/appointments ────────────────────────────────────────────────────
const createAppointment = async (req, res) => {
  const { patient_name, phone_number, scheduled_time } = req.body;

  // Validate input
  if (!patient_name || !phone_number || !scheduled_time) {
    return res.status(400).json({ error: 'patient_name, phone_number, and scheduled_time are required' });
  }

  try {
    // ── With DB (uncomment when ready) ──
    // const [result] = await pool.query(
    //   'INSERT INTO appointments (patient_name, phone_number, scheduled_time, status) VALUES (?, ?, ?, ?)',
    //   [patient_name, phone_number, scheduled_time, 'pending']
    // );
    // const [rows] = await pool.query('SELECT * FROM appointments WHERE appointment_id = ?', [result.insertId]);
    // return res.status(201).json({ message: 'Appointment created', appointment: rows[0] });

    // ── Fake data ──
    const newAppointment = {
      appointment_id: fakeAppointments.length + 1,
      patient_name,
      phone_number,
      scheduled_time,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    fakeAppointments.push(newAppointment);
    res.status(201).json({ message: 'Appointment created', appointment: newAppointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create appointment', details: err.message });
  }
};

// ── PUT /api/appointments/:id ─────────────────────────────────────────────────
const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { scheduled_time, status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'completed', 'no_show'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    // ── With DB (uncomment when ready) ──
    // const fields = [];
    // const values = [];
    // if (scheduled_time) { fields.push('scheduled_time = ?'); values.push(scheduled_time); }
    // if (status)          { fields.push('status = ?');         values.push(status); }
    // if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    // values.push(id);
    // const [result] = await pool.query(`UPDATE appointments SET ${fields.join(', ')} WHERE appointment_id = ?`, values);
    // if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
    // const [rows] = await pool.query('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
    // return res.json({ message: 'Appointment updated', appointment: rows[0] });

    // ── Fake data ──
    const index = fakeAppointments.findIndex(a => a.appointment_id === parseInt(id));
    if (index === -1) return res.status(404).json({ error: 'Appointment not found' });
    if (scheduled_time) fakeAppointments[index].scheduled_time = scheduled_time;
    if (status) fakeAppointments[index].status = status;
    res.json({ message: 'Appointment updated', appointment: fakeAppointments[index] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment', details: err.message });
  }
};

// ── DELETE /api/appointments/:id ──────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    // ── With DB (uncomment when ready) ──
    // const [result] = await pool.query(
    //   'UPDATE appointments SET status = ? WHERE appointment_id = ?',
    //   ['cancelled', id]
    // );
    // if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
    // return res.json({ message: 'Appointment cancelled successfully' });

    // ── Fake data ──
    const index = fakeAppointments.findIndex(a => a.appointment_id === parseInt(id));
    if (index === -1) return res.status(404).json({ error: 'Appointment not found' });
    fakeAppointments[index].status = 'cancelled';
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment', details: err.message });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
};