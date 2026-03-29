const pool = require('../db');
const { 
  sendSuccess, sendError, sendValidationError, 
  getPaginationParams, buildPaginationResponse, formatAppointmentResponse 
} = require('../utils/responseFormatter');
const { 
  isValidUUID, isValidDate, isFutureDate, isValidTime, generateUUID, sanitizeInput 
} = require('../utils/validation');

// ── POST /api/appointments ────────────────────────────────────────────────────
const createAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, appointmentDate, appointmentTime, reason, notes } = req.body;
    const userId = req.user?.id;
    const errors = [];

    // Validation
    if (!doctorId) errors.push({ field: 'doctorId', message: 'Doctor ID is required' });
    else if (!isValidUUID(doctorId)) errors.push({ field: 'doctorId', message: 'Invalid doctor ID format' });

    if (!patientId) errors.push({ field: 'patientId', message: 'Patient ID is required' });
    else if (!isValidUUID(patientId)) errors.push({ field: 'patientId', message: 'Invalid patient ID format' });

    if (!appointmentDate) errors.push({ field: 'appointmentDate', message: 'Appointment date is required' });
    else if (!isValidDate(appointmentDate)) errors.push({ field: 'appointmentDate', message: 'Invalid date format (YYYY-MM-DD)' });
    else if (!isFutureDate(appointmentDate)) errors.push({ field: 'appointmentDate', message: 'Date must be in the future' });

    if (!appointmentTime) errors.push({ field: 'appointmentTime', message: 'Appointment time is required' });
    else if (!isValidTime(appointmentTime)) errors.push({ field: 'appointmentTime', message: 'Invalid time format (HH:MM)' });

    if (!reason) errors.push({ field: 'reason', message: 'Reason is required' });
    else if (sanitizeInput(reason).length < 5) errors.push({ field: 'reason', message: 'Reason must be at least 5 characters' });

    if (errors.length > 0) return sendValidationError(res, errors);

    // Check if doctor exists and is active
    const [doctorCheck] = await pool.query('SELECT id, firstName, lastName FROM users WHERE id = ? AND role = ?', [doctorId, 'doctor']);
    if (doctorCheck.length === 0) return sendError(res, 'Doctor not found', 404);

    // Check if patient exists
    const [patientCheck] = await pool.query('SELECT id, firstName, lastName FROM users WHERE id = ? AND role = ?', [patientId, 'patient']);
    if (patientCheck.length === 0) return sendError(res, 'Patient not found', 404);

    // Check doctor's availability for this time slot
    const dayOfWeek = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' });
    const [availability] = await pool.query(
      'SELECT * FROM availableHours WHERE doctorId = ? AND dayOfWeek = ? AND ? BETWEEN startTime AND endTime',
      [doctorId, dayOfWeek, appointmentTime]
    );
    if (availability.length === 0) return sendError(res, 'Doctor is not available at this time', 400);

    // Check for double-booking
    const [existing] = await pool.query(
      'SELECT id FROM appointments WHERE doctorId = ? AND appointmentDate = ? AND appointmentTime = ? AND status != ?',
      [doctorId, appointmentDate, appointmentTime, 'cancelled']
    );
    if (existing.length > 0) return sendError(res, 'Time slot already booked', 409);

    // Create appointment
    const appointmentId = generateUUID();
    const [result] = await pool.query(
      `INSERT INTO appointments (id, doctorId, patientId, appointmentDate, appointmentTime, reason, notes, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [appointmentId, doctorId, patientId, appointmentDate, appointmentTime, sanitizeInput(reason), sanitizeInput(notes || null), 'scheduled']
    );

    // Fetch the created appointment
    const [appointment] = await pool.query(
      `SELECT a.*, d.firstName AS doctorFirstName, d.lastName AS doctorLastName, p.firstName AS patientFirstName, p.lastName AS patientLastName
       FROM appointments a
       JOIN users d ON a.doctorId = d.id
       JOIN users p ON a.patientId = p.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    return sendSuccess(res, formatAppointmentResponse(appointment[0]), 'Appointment created successfully', 201);
  } catch (err) {
    console.error('Create appointment error:', err);
    return sendError(res, 'Failed to create appointment', 500, err.message);
  }
};

// ── GET /api/appointments ─────────────────────────────────────────────────────
const getAllAppointments = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const { status, date, doctorId, patientId } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let query = `
      SELECT a.*, d.firstName AS doctorFirstName, d.lastName AS doctorLastName, p.firstName AS patientFirstName, p.lastName AS patientLastName
      FROM appointments a
      JOIN users d ON a.doctorId = d.id
      JOIN users p ON a.patientId = p.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (userRole === 'patient') {
      query += ' AND a.patientId = ?';
      params.push(userId);
    } else if (userRole === 'doctor') {
      query += ' AND a.doctorId = ?';
      params.push(userId);
    }
    // Admin sees all appointments

    // Optional filters
    if (status) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
      if (validStatuses.includes(status)) {
        query += ' AND a.status = ?';
        params.push(status);
      }
    }

    if (date && isValidDate(date)) {
      query += ' AND DATE(a.appointmentDate) = ?';
      params.push(date);
    }

    if (doctorId && isValidUUID(doctorId)) {
      query += ' AND a.doctorId = ?';
      params.push(doctorId);
    }

    if (patientId && isValidUUID(patientId)) {
      query += ' AND a.patientId = ?';
      params.push(patientId);
    }

    query += ' ORDER BY a.appointmentDate ASC, a.appointmentTime ASC';

    // Get total count
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    const offset = (page - 1) * limit;
    query += ' LIMIT ?, ?';
    params.push(offset, limit);

    const [appointments] = await pool.query(query, params);

    const formattedAppointments = appointments.map(apt => formatAppointmentResponse(apt));
    const pagination = buildPaginationResponse(formattedAppointments, total, page, limit);

    return sendSuccess(res, formattedAppointments, 'Appointments retrieved successfully', 200, pagination);
  } catch (err) {
    console.error('Get appointments error:', err);
    return sendError(res, 'Failed to fetch appointments', 500, err.message);
  }
};

// ── GET /api/appointments/:id ─────────────────────────────────────────────────
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(id)) return sendError(res, 'Invalid appointment ID format', 400);

    const [appointments] = await pool.query(
      `SELECT a.*, d.firstName AS doctorFirstName, d.lastName AS doctorLastName, p.firstName AS patientFirstName, p.lastName AS patientLastName
       FROM appointments a
       JOIN users d ON a.doctorId = d.id
       JOIN users p ON a.patientId = p.id
       WHERE a.id = ?`,
      [id]
    );

    if (appointments.length === 0) return sendError(res, 'Appointment not found', 404);

    const appointment = appointments[0];

    // Access control: patient sees own, doctor sees their appointments, admin sees all
    if (userRole === 'patient' && appointment.patientId !== userId) {
      return sendError(res, 'Unauthorized to view this appointment', 403);
    }
    if (userRole === 'doctor' && appointment.doctorId !== userId) {
      return sendError(res, 'Unauthorized to view this appointment', 403);
    }

    return sendSuccess(res, formatAppointmentResponse(appointment), 'Appointment retrieved successfully');
  } catch (err) {
    console.error('Get appointment by ID error:', err);
    return sendError(res, 'Failed to fetch appointment', 500, err.message);
  }
};

// ── PUT /api/appointments/:id ─────────────────────────────────────────────────
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, appointmentTime, reason, notes, status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(id)) return sendError(res, 'Invalid appointment ID format', 400);

    // Get appointment
    const [appointments] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (appointments.length === 0) return sendError(res, 'Appointment not found', 404);

    const appointment = appointments[0];

    // Access control: patient updates own, doctor/admin can update any
    if (userRole === 'patient' && appointment.patientId !== userId) {
      return sendError(res, 'Unauthorized to update this appointment', 403);
    }

    const errors = [];

    // Validation for optional fields
    if (appointmentDate !== undefined) {
      if (!isValidDate(appointmentDate)) errors.push({ field: 'appointmentDate', message: 'Invalid date format (YYYY-MM-DD)' });
      else if (!isFutureDate(appointmentDate)) errors.push({ field: 'appointmentDate', message: 'Date must be in the future' });
    }

    if (appointmentTime !== undefined && !isValidTime(appointmentTime)) {
      errors.push({ field: 'appointmentTime', message: 'Invalid time format (HH:MM)' });
    }

    if (reason !== undefined && sanitizeInput(reason).length < 5) {
      errors.push({ field: 'reason', message: 'Reason must be at least 5 characters' });
    }

    if (status !== undefined) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
      if (!validStatuses.includes(status)) {
        errors.push({ field: 'status', message: `Status must be one of: ${validStatuses.join(', ')}` });
      }
    }

    if (errors.length > 0) return sendValidationError(res, errors);

    // Check availability if time is being changed
    if (appointmentDate || appointmentTime) {
      const newDate = appointmentDate || appointment.appointmentDate;
      const newTime = appointmentTime || appointment.appointmentTime;
      const dayOfWeek = new Date(newDate).toLocaleDateString('en-US', { weekday: 'long' });

      const [availability] = await pool.query(
        'SELECT * FROM availableHours WHERE doctorId = ? AND dayOfWeek = ? AND ? BETWEEN startTime AND endTime',
        [appointment.doctorId, dayOfWeek, newTime]
      );
      if (availability.length === 0) return sendError(res, 'Doctor is not available at this time', 400);

      // Check for double-booking
      const [existing] = await pool.query(
        'SELECT id FROM appointments WHERE doctorId = ? AND appointmentDate = ? AND appointmentTime = ? AND id != ? AND status != ?',
        [appointment.doctorId, newDate, newTime, id, 'cancelled']
      );
      if (existing.length > 0) return sendError(res, 'Time slot already booked', 409);
    }

    // Build update query
    const updates = [];
    const values = [];

    if (appointmentDate !== undefined) {
      updates.push('appointmentDate = ?');
      values.push(appointmentDate);
    }
    if (appointmentTime !== undefined) {
      updates.push('appointmentTime = ?');
      values.push(appointmentTime);
    }
    if (reason !== undefined) {
      updates.push('reason = ?');
      values.push(sanitizeInput(reason));
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(sanitizeInput(notes));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) return sendError(res, 'No fields to update', 400);

    updates.push('updatedAt = NOW()');
    values.push(id);

    await pool.query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated appointment
    const [updated] = await pool.query(
      `SELECT a.*, d.firstName AS doctorFirstName, d.lastName AS doctorLastName, p.firstName AS patientFirstName, p.lastName AS patientLastName
       FROM appointments a
       JOIN users d ON a.doctorId = d.id
       JOIN users p ON a.patientId = p.id
       WHERE a.id = ?`,
      [id]
    );

    return sendSuccess(res, formatAppointmentResponse(updated[0]), 'Appointment updated successfully');
  } catch (err) {
    console.error('Update appointment error:', err);
    return sendError(res, 'Failed to update appointment', 500, err.message);
  }
};

// ── DELETE /api/appointments/:id ──────────────────────────────────────────────
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation, reason } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(id)) return sendError(res, 'Invalid appointment ID format', 400);

    if (!confirmation) return sendError(res, 'Confirmation required to delete appointment', 400);

    // Get appointment
    const [appointments] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (appointments.length === 0) return sendError(res, 'Appointment not found', 404);

    const appointment = appointments[0];

    // Access control: patient deletes own, doctor/admin can delete any
    if (userRole === 'patient' && appointment.patientId !== userId) {
      return sendError(res, 'Unauthorized to delete this appointment', 403);
    }

    // Delete appointment
    await pool.query('DELETE FROM appointments WHERE id = ?', [id]);

    return sendSuccess(res, null, 'Appointment deleted successfully');
  } catch (err) {
    console.error('Delete appointment error:', err);
    return sendError(res, 'Failed to delete appointment', 500, err.message);
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};