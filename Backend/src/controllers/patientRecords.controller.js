const pool = require('../db');
const {
  isValidUUID,
  generateUUID,
  sanitizeInput,
  isMinLength,
  isValidDate,
  isFutureDate,
} = require('../utils/validation');
const {
  sendSuccess,
  sendError,
  sendValidationError,
  formatPatientRecordResponse,
  getPaginationParams,
  buildPaginationResponse,
} = require('../utils/responseFormatter');

// ── POST /api/patient-records ─────────────────────────────────────────────────
const createPatientRecord = async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      diagnosis,
      treatment,
      medication,
      testResults,
      notes,
      followUpDate,
    } = req.body;

    // Validation
    const errors = [];

    if (!patientId) errors.push('patientId is required');
    else if (!isValidUUID(patientId)) errors.push('patientId must be a valid UUID');

    if (!diagnosis) errors.push('diagnosis is required');
    else if (!isMinLength(diagnosis, 10)) errors.push('diagnosis must be at least 10 characters');

    if (!treatment) errors.push('treatment is required');
    else if (!isMinLength(treatment, 10)) errors.push('treatment must be at least 10 characters');

    if (medication && !isMinLength(medication, 5)) errors.push('medication must be at least 5 characters');

    if (appointmentId && !isValidUUID(appointmentId)) errors.push('appointmentId must be a valid UUID');

    if (followUpDate && !isValidDate(followUpDate)) errors.push('followUpDate must be a valid date');
    if (followUpDate && !isFutureDate(followUpDate)) errors.push('followUpDate must be in the future');

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Check patient exists
    const [patients] = await pool.query('SELECT id, firstName, lastName FROM users WHERE id = ? AND role = ?', [
      patientId,
      'patient',
    ]);

    if (patients.length === 0) {
      return sendError(res, 'Patient not found', 404);
    }

    // Check doctor is authorized (must be admin or the doctor owning appointment)
    const doctorId = req.user.id;
    if (req.user.role !== 'admin') {
      if (appointmentId) {
        const [appointments] = await pool.query(
          'SELECT doctorId FROM appointments WHERE id = ? AND patientId = ?',
          [appointmentId, patientId]
        );
        if (appointments.length === 0 || appointments[0].doctorId !== doctorId) {
          return sendError(res, 'Access denied - appointment not found or not your patient', 403);
        }
      } else if (req.user.role !== 'doctor') {
        return sendError(res, 'Only doctors or admins can create patient records', 403);
      }
    }

    // Create record
    const recordId = generateUUID();

    await pool.query(
      `INSERT INTO patientRecords (id, patientId, doctorId, appointmentId, diagnosis, treatment, medication, testResults, notes, followUpDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordId,
        patientId,
        doctorId,
        appointmentId || null,
        sanitizeInput(diagnosis),
        sanitizeInput(treatment),
        medication ? sanitizeInput(medication) : null,
        testResults ? sanitizeInput(testResults) : null,
        notes ? sanitizeInput(notes) : null,
        followUpDate || null,
      ]
    );

    // Fetch created record
    const [records] = await pool.query('SELECT * FROM patientRecords WHERE id = ?', [recordId]);
    const record = records[0];

    return sendSuccess(
      res,
      {
        record: formatPatientRecordResponse(record, patients[0], { firstName: 'Dr. ', lastName: req.user.firstName + ' ' + req.user.lastName }),
      },
      'Patient record created successfully',
      201
    );
  } catch (error) {
    console.error('Create patient record error:', error);
    return sendError(res, 'Failed to create patient record', 500, error.message);
  }
};

// ── GET /api/patient-records ──────────────────────────────────────────────────
const getAllPatientRecords = async (req, res) => {
  try {
    const { patientId, doctorId, fromDate, toDate, page = 1, limit = 10 } = req.query;
    const { offset } = getPaginationParams({ page, limit });

    let query = 'SELECT pr.*, u1.firstName as patientFirstName, u1.lastName as patientLastName, u2.firstName as doctorFirstName, u2.lastName as doctorLastName FROM patientRecords pr JOIN users u1 ON pr.patientId = u1.id JOIN users u2 ON pr.doctorId = u2.id WHERE 1=1';
    const params = [];

    // Apply role-based filtering
    if (req.user.role === 'patient') {
      // Patients can only see their own records
      query += ' AND pr.patientId = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'doctor') {
      // Doctors can see records they created
      query += ' AND pr.doctorId = ?';
      params.push(req.user.id);
    }
    // Admins can see all

    // Apply additional filters
    if (patientId) {
      if (!isValidUUID(patientId)) {
        return sendError(res, 'Invalid patientId format', 400);
      }
      query += ' AND pr.patientId = ?';
      params.push(patientId);
    }

    if (doctorId) {
      if (!isValidUUID(doctorId)) {
        return sendError(res, 'Invalid doctorId format', 400);
      }
      query += ' AND pr.doctorId = ?';
      params.push(doctorId);
    }

    if (fromDate) {
      if (!isValidDate(fromDate)) {
        return sendError(res, 'Invalid fromDate format', 400);
      }
      query += ' AND pr.createdAt >= ?';
      params.push(fromDate);
    }

    if (toDate) {
      if (!isValidDate(toDate)) {
        return sendError(res, 'Invalid toDate format', 400);
      }
      query += ' AND pr.createdAt <= ?';
      params.push(toDate);
    }

    // Get total count
    const countQuery = query.replace(/SELECT pr\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY pr.createdAt DESC LIMIT ? OFFSET ?';
    const [records] = await pool.query(query, [...params, parseInt(limit), offset]);

    const formattedRecords = records.map(record => {
      const patient = { firstName: record.patientFirstName, lastName: record.patientLastName };
      const doctor = { firstName: record.doctorFirstName, lastName: record.doctorLastName };
      return formatPatientRecordResponse(record, patient, doctor);
    });

    return sendSuccess(
      res,
      buildPaginationResponse(formattedRecords, total, parseInt(page), parseInt(limit))
    );
  } catch (error) {
    console.error('Get patient records error:', error);
    return sendError(res, 'Failed to fetch patient records', 500, error.message);
  }
};

// ── GET /api/patient-records/:id ──────────────────────────────────────────────
const getPatientRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid record ID format', 400);
    }

    const [records] = await pool.query(
      `SELECT pr.*, u1.firstName as patientFirstName, u1.lastName as patientLastName, u2.firstName as doctorFirstName, u2.lastName as doctorLastName
       FROM patientRecords pr
       JOIN users u1 ON pr.patientId = u1.id
       JOIN users u2 ON pr.doctorId = u2.id
       WHERE pr.id = ?`,
      [id]
    );

    if (records.length === 0) {
      return sendError(res, 'Patient record not found', 404);
    }

    const record = records[0];

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      req.user.id !== record.patientId &&
      req.user.id !== record.doctorId
    ) {
      return sendError(res, 'Access denied', 403);
    }

    const patient = { firstName: record.patientFirstName, lastName: record.patientLastName };
    const doctor = { firstName: record.doctorFirstName, lastName: record.doctorLastName };

    return sendSuccess(res, { record: formatPatientRecordResponse(record, patient, doctor) });
  } catch (error) {
    console.error('Get patient record error:', error);
    return sendError(res, 'Failed to fetch patient record', 500, error.message);
  }
};

// ── PUT /api/patient-records/:id ──────────────────────────────────────────────
const updatePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, treatment, medication, testResults, notes, followUpDate } = req.body;

    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid record ID format', 400);
    }

    // Check record exists and user is authorized
    const [records] = await pool.query(
      'SELECT * FROM patientRecords WHERE id = ?',
      [id]
    );

    if (records.length === 0) {
      return sendError(res, 'Patient record not found', 404);
    }

    const record = records[0];

    // Only doctor who created it or admin can update
    if (req.user.role !== 'admin' && req.user.id !== record.doctorId) {
      return sendError(res, 'Access denied', 403);
    }

    // Validation
    const errors = [];
    if (diagnosis && !isMinLength(diagnosis, 10)) errors.push('diagnosis must be at least 10 characters');
    if (treatment && !isMinLength(treatment, 10)) errors.push('treatment must be at least 10 characters');
    if (medication && !isMinLength(medication, 5)) errors.push('medication must be at least 5 characters');
    if (followUpDate && !isValidDate(followUpDate)) errors.push('followUpDate must be a valid date');
    if (followUpDate && !isFutureDate(followUpDate)) errors.push('followUpDate must be in the future');

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Build update query
    const updates = [];
    const params = [];

    if (diagnosis !== undefined) {
      updates.push('diagnosis = ?');
      params.push(sanitizeInput(diagnosis));
    }
    if (treatment !== undefined) {
      updates.push('treatment = ?');
      params.push(sanitizeInput(treatment));
    }
    if (medication !== undefined) {
      updates.push('medication = ?');
      params.push(medication ? sanitizeInput(medication) : null);
    }
    if (testResults !== undefined) {
      updates.push('testResults = ?');
      params.push(testResults ? sanitizeInput(testResults) : null);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes ? sanitizeInput(notes) : null);
    }
    if (followUpDate !== undefined) {
      updates.push('followUpDate = ?');
      params.push(followUpDate || null);
    }

    if (updates.length === 0) {
      return sendError(res, 'No fields to update', 400);
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    const query = `UPDATE patientRecords SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);

    // Fetch updated record
    const [updatedRecords] = await pool.query(
      `SELECT pr.*, u1.firstName as patientFirstName, u1.lastName as patientLastName, u2.firstName as doctorFirstName, u2.lastName as doctorLastName
       FROM patientRecords pr
       JOIN users u1 ON pr.patientId = u1.id
       JOIN users u2 ON pr.doctorId = u2.id
       WHERE pr.id = ?`,
      [id]
    );

    const updatedRecord = updatedRecords[0];
    const patient = { firstName: updatedRecord.patientFirstName, lastName: updatedRecord.patientLastName };
    const doctor = { firstName: updatedRecord.doctorFirstName, lastName: updatedRecord.doctorLastName };

    return sendSuccess(
      res,
      { record: formatPatientRecordResponse(updatedRecord, patient, doctor) },
      'Patient record updated successfully'
    );
  } catch (error) {
    console.error('Update patient record error:', error);
    return sendError(res, 'Failed to update patient record', 500, error.message);
  }
};

// ── DELETE /api/patient-records/:id ───────────────────────────────────────────
const deletePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation } = req.body;

    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid record ID format', 400);
    }

    // Only admin can delete
    if (req.user.role !== 'admin') {
      return sendError(res, 'Access denied - admin only', 403);
    }

    if (!confirmation) {
      return sendError(res, 'Confirmation required', 400);
    }

    // Check record exists
    const [records] = await pool.query('SELECT id FROM patientRecords WHERE id = ?', [id]);

    if (records.length === 0) {
      return sendError(res, 'Patient record not found', 404);
    }

    // Delete record
    await pool.query('DELETE FROM patientRecords WHERE id = ?', [id]);

    return sendSuccess(res, null, 'Patient record deleted successfully');
  } catch (error) {
    console.error('Delete patient record error:', error);
    return sendError(res, 'Failed to delete patient record', 500, error.message);
  }
};

module.exports = {
  createPatientRecord,
  getAllPatientRecords,
  getPatientRecordById,
  updatePatientRecord,
  deletePatientRecord,
};
