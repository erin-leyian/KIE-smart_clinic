const pool = require('../db');

// ── GET /api/appointments ─────────────────────────────────────────────────────
const getAppointments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.AppointmentID, a.AppointmentDate, a.AppointmentTime,
        a.Duration, a.Status, a.Notes, a.BookedAt,
        p.PatientID, p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
        p.PhoneNumber AS PatientPhone,
        d.StaffID AS DoctorID, d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
      FROM Appointment a
      JOIN Patient p ON a.PatientID = p.PatientID
      JOIN ClinicStaff d ON a.DoctorID = d.StaffID
      ORDER BY a.AppointmentDate ASC, a.AppointmentTime ASC
    `);
    res.json({ appointments: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
};

// ── GET /api/appointments/:id ─────────────────────────────────────────────────
const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.*, 
        p.FirstName AS PatientFirstName, p.LastName AS PatientLastName, p.PhoneNumber AS PatientPhone,
        d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
      FROM Appointment a
      JOIN Patient p ON a.PatientID = p.PatientID
      JOIN ClinicStaff d ON a.DoctorID = d.StaffID
      WHERE a.AppointmentID = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ appointment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointment', details: err.message });
  }
};

// ── POST /api/appointments ────────────────────────────────────────────────────
const createAppointment = async (req, res) => {
  const { patientId, doctorId, appointmentDate, appointmentTime, duration, notes } = req.body;

  if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'patientId, doctorId, appointmentDate and appointmentTime are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO Appointment (PatientID, DoctorID, AppointmentDate, AppointmentTime, Duration, Notes, Status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patientId, doctorId, appointmentDate, appointmentTime, duration || 15, notes || null, 'Pending']
    );
    const [rows] = await pool.query('SELECT * FROM Appointment WHERE AppointmentID = ?', [result.insertId]);
    res.status(201).json({ message: 'Appointment created', appointment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create appointment', details: err.message });
  }
};

// ── PUT /api/appointments/:id ─────────────────────────────────────────────────
const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { appointmentDate, appointmentTime, status, notes, duration } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-Show'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const fields = [];
    const values = [];
    if (appointmentDate) { fields.push('AppointmentDate = ?'); values.push(appointmentDate); }
    if (appointmentTime) { fields.push('AppointmentTime = ?'); values.push(appointmentTime); }
    if (status)          { fields.push('Status = ?');          values.push(status); }
    if (notes)           { fields.push('Notes = ?');           values.push(notes); }
    if (duration)        { fields.push('Duration = ?');        values.push(duration); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    values.push(id);
    const [result] = await pool.query(
      `UPDATE Appointment SET ${fields.join(', ')} WHERE AppointmentID = ?`, values
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
    const [rows] = await pool.query('SELECT * FROM Appointment WHERE AppointmentID = ?', [id]);
    res.json({ message: 'Appointment updated', appointment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment', details: err.message });
  }
};

// ── DELETE /api/appointments/:id ──────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE Appointment SET Status = ? WHERE AppointmentID = ?',
      ['Cancelled', id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
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