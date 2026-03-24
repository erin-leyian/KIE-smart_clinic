const pool = require('../db');

// ── GET /api/queue ────────────────────────────────────────────────────────────
const getQueue = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        q.QueueEntryID, q.QueueNumber, q.PositionInQueue, q.UrgencyLevel,
        q.Status, q.ArrivalTime, q.EstimatedWaitTime,
        p.PatientID, p.FirstName, p.LastName, p.PhoneNumber,
        a.AppointmentDate, a.AppointmentTime
      FROM QueueEntry q
      JOIN Patient p ON q.PatientID = p.PatientID
      LEFT JOIN Appointment a ON q.AppointmentID = a.AppointmentID
      WHERE q.Status = 'Waiting'
      ORDER BY q.UrgencyLevel = 'Emergency' DESC,
               q.UrgencyLevel = 'High' DESC,
               q.PositionInQueue ASC
    `);
    res.json({ queue: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch queue', details: err.message });
  }
};

// ── GET /api/queue/position/:patientId ────────────────────────────────────────
const getQueuePosition = async (req, res) => {
  const { patientId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT q.*, p.FirstName, p.LastName, p.PhoneNumber
      FROM QueueEntry q
      JOIN Patient p ON q.PatientID = p.PatientID
      WHERE q.PatientID = ? AND q.Status = 'Waiting'
    `, [patientId]);

    if (rows.length === 0) return res.status(404).json({ error: 'Patient not in queue' });

    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS ahead FROM QueueEntry WHERE PositionInQueue < ? AND Status = "Waiting"',
      [rows[0].PositionInQueue]
    );

    res.json({ position: rows[0], patients_ahead: countRows[0].ahead });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get queue position', details: err.message });
  }
};

// ── POST /api/queue/checkin/:patientId ────────────────────────────────────────
const checkInPatient = async (req, res) => {
  const { patientId } = req.params;
  const { appointmentId, clinicId, doctorId, urgencyLevel } = req.body;

  if (!clinicId) {
    return res.status(400).json({ error: 'clinicId is required' });
  }

  try {
    // Check patient exists
    const [patient] = await pool.query('SELECT * FROM Patient WHERE PatientID = ?', [patientId]);
    if (patient.length === 0) return res.status(404).json({ error: 'Patient not found' });

    // Check not already in queue
    const [existing] = await pool.query(
      'SELECT * FROM QueueEntry WHERE PatientID = ? AND Status = "Waiting"', [patientId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Patient already in queue', position: existing[0].PositionInQueue });
    }

    // Get next queue number and position
    const [maxQueue] = await pool.query(
      'SELECT MAX(QueueNumber) AS maxNum, MAX(PositionInQueue) AS maxPos FROM QueueEntry WHERE Status = "Waiting"'
    );
    const nextNumber = (maxQueue[0].maxNum || 0) + 1;
    const nextPosition = (maxQueue[0].maxPos || 0) + 1;

    // Determine urgency — High for elderly patients (check DateOfBirth)
    let urgency = urgencyLevel || 'Medium';
    if (!urgencyLevel) {
      const [patientData] = await pool.query('SELECT DateOfBirth FROM Patient WHERE PatientID = ?', [patientId]);
      if (patientData[0]?.DateOfBirth) {
        const age = Math.floor((new Date() - new Date(patientData[0].DateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age >= 65) urgency = 'High';
      }
    }

    const [result] = await pool.query(
      'INSERT INTO QueueEntry (PatientID, AppointmentID, ClinicID, DoctorID, QueueNumber, PositionInQueue, UrgencyLevel, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [patientId, appointmentId || null, clinicId, doctorId || null, nextNumber, nextPosition, urgency, 'Waiting']
    );

    res.status(201).json({
      message: 'Patient checked in',
      queueEntryId: result.insertId,
      queueNumber: nextNumber,
      position: nextPosition,
      urgencyLevel: urgency
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check in patient', details: err.message });
  }
};

// ── DELETE /api/queue/:tokenId ────────────────────────────────────────────────
const removeFromQueue = async (req, res) => {
  const { tokenId } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE QueueEntry SET Status = "Completed" WHERE QueueEntryID = ?', [tokenId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Queue entry not found' });

    // Reorder remaining positions
    await pool.query(`
      SET @pos = 0;
    `);
    await pool.query(`
      UPDATE QueueEntry 
      SET PositionInQueue = (@pos := @pos + 1)
      WHERE Status = 'Waiting'
      ORDER BY PositionInQueue ASC
    `);

    res.json({ message: 'Patient removed from queue' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from queue', details: err.message });
  }
};

// ── PUT /api/queue/reorder ────────────────────────────────────────────────────
const reorderQueue = async (req, res) => {
  const { order } = req.body;
  if (!order || !Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ error: 'order must be a non-empty array of QueueEntryIDs' });
  }
  try {
    for (let i = 0; i < order.length; i++) {
      await pool.query(
        'UPDATE QueueEntry SET PositionInQueue = ? WHERE QueueEntryID = ? AND Status = "Waiting"',
        [i + 1, order[i]]
      );
    }
    const [rows] = await pool.query(`
      SELECT q.*, p.FirstName, p.LastName, p.PhoneNumber
      FROM QueueEntry q
      JOIN Patient p ON q.PatientID = p.PatientID
      WHERE q.Status = 'Waiting'
      ORDER BY q.PositionInQueue ASC
    `);
    res.json({ message: 'Queue reordered', queue: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder queue', details: err.message });
  }
};

module.exports = {
  getQueue,
  getQueuePosition,
  checkInPatient,
  removeFromQueue,
  reorderQueue,
};