const pool = require('../db');
const { 
  sendSuccess, sendError, sendValidationError 
} = require('../utils/responseFormatter');
const { 
  isValidUUID, isValidQueueStatus, generateUUID, sanitizeInput 
} = require('../utils/validation');

// ── GET /api/queue/doctor/:doctorId ───────────────────────────────────────────
const getQueueForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(doctorId)) return sendError(res, 'Invalid doctor ID format', 400);

    // Access control: doctor sees own queue, admin sees any
    if (userRole === 'doctor' && doctorId !== userId) {
      return sendError(res, 'Unauthorized to view this queue', 403);
    }

    // Check doctor exists
    const [doctorCheck] = await pool.query('SELECT id FROM users WHERE id = ? AND role = ?', [doctorId, 'doctor']);
    if (doctorCheck.length === 0) return sendError(res, 'Doctor not found', 404);

    // Get queue for this doctor, ordered by position
    const [queueEntries] = await pool.query(
      `SELECT 
        q.id, q.appointmentId, q.patientId, q.status, q.position, 
        q.estimatedWaitTime, q.arrivedAt, q.completedAt,
        p.firstName AS patientFirstName, p.lastName AS patientLastName, p.phone AS patientPhone,
        a.reason
       FROM queueEntries q
       JOIN users p ON q.patientId = p.id
       LEFT JOIN appointments a ON q.appointmentId = a.id
       WHERE q.doctorId = ? AND q.status IN (?, ?)
       ORDER BY q.position ASC`,
      [doctorId, 'waiting', 'in-progress']
    );

    // Format queue entries
    const formattedQueue = queueEntries.map(entry => ({
      id: entry.id,
      appointmentId: entry.appointmentId,
      patientId: entry.patientId,
      patientName: `${entry.patientFirstName} ${entry.patientLastName}`,
      patientPhone: entry.patientPhone,
      reason: entry.reason,
      status: entry.status,
      position: entry.position,
      estimatedWaitTime: entry.estimatedWaitTime,
      arrivedAt: entry.arrivedAt,
    }));

    // Calculate average wait time
    const completedEntries = await pool.query(
      `SELECT AVG(TIMESTAMPDIFF(MINUTE, arrivedAt, completedAt)) AS avgTime
       FROM queueEntries
       WHERE doctorId = ? AND status = ? AND completedAt IS NOT NULL`,
      [doctorId, 'completed']
    );
    const averageWaitTime = completedEntries[0][0]?.avgTime || 0;

    return sendSuccess(res, {
      queue: formattedQueue,
      total: formattedQueue.length,
      averageWaitTime: Math.round(averageWaitTime),
    }, 'Queue retrieved successfully');
  } catch (err) {
    console.error('Get queue for doctor error:', err);
    return sendError(res, 'Failed to fetch queue', 500, err.message);
  }
};

// ── PUT /api/queue/:queueId ───────────────────────────────────────────────────
const updateQueueStatus = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(queueId)) return sendError(res, 'Invalid queue ID format', 400);

    const errors = [];

    if (!status) errors.push({ field: 'status', message: 'Status is required' });
    else if (!isValidQueueStatus(status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }

    if (errors.length > 0) return sendValidationError(res, errors);

    // Get queue entry
    const [queueCheck] = await pool.query('SELECT * FROM queueEntries WHERE id = ?', [queueId]);
    if (queueCheck.length === 0) return sendError(res, 'Queue entry not found', 404);

    const queueEntry = queueCheck[0];

    // Access control: only doctor or admin can update queue
    if (userRole === 'doctor' && queueEntry.doctorId !== userId) {
      return sendError(res, 'Unauthorized to update this queue', 403);
    }

    // Update status
    const updateFields = ['status = ?'];
    const updateValues = [status];

    if (status === 'in-progress') {
      // Mark when consultation started
      updateFields.push('startedAt = NOW()');
    } else if (status === 'completed') {
      updateFields.push('completedAt = NOW()');
      // Calculate wait time
      updateFields.push('estimatedWaitTime = TIMESTAMPDIFF(MINUTE, arrivedAt, NOW())');
    }

    if (notes) {
      updateFields.push('notes = ?');
      updateValues.push(sanitizeInput(notes));
    }

    updateValues.push(queueId);

    await pool.query(
      `UPDATE queueEntries SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Recalculate positions if completing
    if (status === 'completed') {
      await pool.query(
        `UPDATE queueEntries 
         SET position = (SELECT COUNT(*) FROM queueEntries q2 
                        WHERE q2.doctorId = queueEntries.doctorId 
                        AND q2.status IN ('waiting', 'in-progress') 
                        AND q2.position < queueEntries.position)
         WHERE doctorId = ? AND status IN (?, ?)`,
        [queueEntry.doctorId, 'waiting', 'in-progress']
      );
    }

    // Fetch updated entry
    const [updated] = await pool.query('SELECT * FROM queueEntries WHERE id = ?', [queueId]);

    return sendSuccess(res, {
      id: updated[0].id,
      appointmentId: updated[0].appointmentId,
      patientId: updated[0].patientId,
      status: updated[0].status,
      position: updated[0].position,
    }, 'Queue status updated');
  } catch (err) {
    console.error('Update queue status error:', err);
    return sendError(res, 'Failed to update queue status', 500, err.message);
  }
};

// ── PUT /api/queue/:queueId/complete ──────────────────────────────────────────
const completeQueue = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { notes, duration } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(queueId)) return sendError(res, 'Invalid queue ID format', 400);

    // Get queue entry
    const [queueCheck] = await pool.query('SELECT * FROM queueEntries WHERE id = ?', [queueId]);
    if (queueCheck.length === 0) return sendError(res, 'Queue entry not found', 404);

    const queueEntry = queueCheck[0];

    // Access control: only doctor or admin can complete queue
    if (userRole === 'doctor' && queueEntry.doctorId !== userId) {
      return sendError(res, 'Unauthorized to complete this queue', 403);
    }

    // Update status to completed and mark appointment as completed
    await pool.query(
      `UPDATE queueEntries 
       SET status = ?, completedAt = NOW(), notes = ?
       WHERE id = ?`,
      ['completed', sanitizeInput(notes || null), queueId]
    );

    // Update corresponding appointment status
    if (queueEntry.appointmentId) {
      await pool.query(
        `UPDATE appointments SET status = ?, updatedAt = NOW() WHERE id = ?`,
        ['completed', queueEntry.appointmentId]
      );
    }

    // Fetch updated entry
    const [updated] = await pool.query('SELECT * FROM queueEntries WHERE id = ?', [queueId]);

    return sendSuccess(res, {
      id: updated[0].id,
      appointmentId: updated[0].appointmentId,
      patientId: updated[0].patientId,
      status: updated[0].status,
      completedAt: updated[0].completedAt,
      duration,
    }, 'Appointment marked as completed');
  } catch (err) {
    console.error('Complete queue error:', err);
    return sendError(res, 'Failed to complete queue entry', 500, err.message);
  }
};

module.exports = {
  getQueueForDoctor,
  updateQueueStatus,
  completeQueue,
};