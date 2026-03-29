const pool = require('../db');
const {
  isValidUUID,
  generateUUID,
  sanitizeInput,
  isMinLength,
} = require('../utils/validation');
const {
  sendSuccess,
  sendError,
  sendValidationError,
  formatDoctorResponse,
  getPaginationParams,
  buildPaginationResponse,
} = require('../utils/responseFormatter');

// ── GET /api/doctors ──────────────────────────────────────────────────────────
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    const { offset } = getPaginationParams({ page, limit });

    let query = `
      SELECT u.*, d.specialization, d.qualifications, d.yearsOfExperience,
             d.consultationFee, d.consultationDuration, d.consultationEnabled,
             d.rating, d.totalConsultations
      FROM users u
      LEFT JOIN doctorSpecializations d ON u.id = d.doctorId
      WHERE u.role = 'doctor'
    `;
    const params = [];

    // Apply filters
    if (specialization) {
      query += ' AND d.specialization = ?';
      params.push(sanitizeInput(specialization));
    }

    if (search) {
      query += ' AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ?)';
      const searchPattern = `%${sanitizeInput(search)}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT u\.\*, d\..*FROM/,
      'SELECT COUNT(DISTINCT u.id) as total FROM'
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY u.createdAt DESC LIMIT ? OFFSET ?';
    const [doctors] = await pool.query(query, [...params, parseInt(limit), offset]);

    const formattedDoctors = doctors.map(doctor => formatDoctorResponse(doctor, doctor));

    return sendSuccess(
      res,
      buildPaginationResponse(formattedDoctors, total, parseInt(page), parseInt(limit))
    );
  } catch (error) {
    console.error('Get all doctors error:', error);
    return sendError(res, 'Failed to fetch doctors', 500, error.message);
  }
};

// ── GET /api/doctors/:id ──────────────────────────────────────────────────────
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid doctor ID format', 400);
    }

    // Get doctor with specialization
    const [doctors] = await pool.query(
      `SELECT u.*, d.specialization, d.qualifications, d.yearsOfExperience,
              d.consultationFee, d.consultationDuration, d.consultationEnabled,
              d.rating, d.totalConsultations
       FROM users u
       LEFT JOIN doctorSpecializations d ON u.id = d.doctorId
       WHERE u.id = ? AND u.role = 'doctor'`,
      [id]
    );

    if (doctors.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    const doctor = doctors[0];

    // Get available hours
    const [hours] = await pool.query(
      `SELECT day, startTime, endTime FROM availableHours WHERE doctorId = ? ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
      [id]
    );

    const doctorData = formatDoctorResponse(doctor, doctor);
    doctorData.availableHours = hours;

    return sendSuccess(res, { doctor: doctorData });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    return sendError(res, 'Failed to fetch doctor', 500, error.message);
  }
};

// ── POST /api/doctors ─────────────────────────────────────────────────────────
const createDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      specialization,
      qualifications,
      yearsOfExperience = 0,
      consultationFee,
      consultationDuration = 30,
      consultationEnabled = false,
      availableHours = [],
    } = req.body;

    // Validation
    const errors = [];

    if (!firstName || !firstName.trim()) errors.push('firstName is required');
    if (!lastName || !lastName.trim()) errors.push('lastName is required');
    if (!email) errors.push('email is required');
    if (!password) errors.push('password is required');
    if (!password || password.length < 8) errors.push('password must be at least 8 characters');
    if (!specialization || !specialization.trim()) errors.push('specialization is required');
    if (!qualifications || !qualifications.trim()) errors.push('qualifications is required');
    if (consultationFee !== undefined && (isNaN(consultationFee) || consultationFee < 0)) {
      errors.push('consultationFee must be a positive number');
    }
    if (consultationDuration && (isNaN(consultationDuration) || consultationDuration <= 0)) {
      errors.push('consultationDuration must be greater than 0');
    }

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Check if email already exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [
      email.toLowerCase(),
    ]);

    if (existingUser.length > 0) {
      return sendError(res, 'Email already exists', 409);
    }

    // Create doctor user and specialization
    const userId = generateUUID();
    const specId = generateUUID();

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      `INSERT INTO users (id, firstName, lastName, email, password, role, phone)
       VALUES (?, ?, ?, ?, ?, 'doctor', ?)`,
      [userId, sanitizeInput(firstName), sanitizeInput(lastName), email.toLowerCase(), hashedPassword, phone || null]
    );

    // Insert doctor specialization
    await pool.query(
      `INSERT INTO doctorSpecializations (id, doctorId, specialization, qualifications, yearsOfExperience, consultationFee, consultationDuration, consultationEnabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [specId, userId, sanitizeInput(specialization), sanitizeInput(qualifications), yearsOfExperience, consultationFee || null, consultationDuration, consultationEnabled ? 1 : 0]
    );

    // Insert available hours if provided
    if (availableHours && Array.isArray(availableHours) && availableHours.length > 0) {
      for (const hour of availableHours) {
        const hourId = generateUUID();
        await pool.query(
          `INSERT INTO availableHours (id, doctorId, day, startTime, endTime)
           VALUES (?, ?, ?, ?, ?)`,
          [hourId, userId, sanitizeInput(hour.day), hour.startTime, hour.endTime]
        );
      }
    }

    // Fetch created doctor
    const [doctors] = await pool.query(
      `SELECT u.*, d.specialization, d.qualifications, d.yearsOfExperience,
              d.consultationFee, d.consultationDuration, d.consultationEnabled
       FROM users u
       LEFT JOIN doctorSpecializations d ON u.id = d.doctorId
       WHERE u.id = ?`,
      [userId]
    );

    return sendSuccess(
      res,
      { doctor: formatDoctorResponse(doctors[0], doctors[0]) },
      'Doctor created successfully',
      201
    );
  } catch (error) {
    console.error('Create doctor error:', error);
    return sendError(res, 'Failed to create doctor', 500, error.message);
  }
};

// ── PUT /api/doctors/:id ──────────────────────────────────────────────────────
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      phone,
      specialization,
      qualifications,
      yearsOfExperience,
      consultationFee,
      consultationDuration,
      consultationEnabled,
      availableHours,
    } = req.body;

    // Validate UUID
    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid doctor ID format', 400);
    }

    // Check authorization
    if (req.user.id !== id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403);
    }

    // Check doctor exists
    const [doctors] = await pool.query(
      `SELECT u.* FROM users u WHERE u.id = ? AND u.role = 'doctor'`,
      [id]
    );

    if (doctors.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    // Validation
    const errors = [];
    if (consultationFee !== undefined && (isNaN(consultationFee) || consultationFee < 0)) {
      errors.push('consultationFee must be a positive number');
    }
    if (consultationDuration && (isNaN(consultationDuration) || consultationDuration <= 0)) {
      errors.push('consultationDuration must be greater than 0');
    }

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Update doctor specialization
    if (
      phone ||
      specialization ||
      qualifications ||
      yearsOfExperience !== undefined ||
      consultationFee !== undefined ||
      consultationDuration !== undefined ||
      consultationEnabled !== undefined
    ) {
      const updates = [];
      const params = [];

      if (phone !== undefined) {
        updates.push('u.phone = ?');
        params.push(phone);
      }

      // Update user phone
      if (phone !== undefined) {
        await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone, id]);
      }

      // Update specialization
      const updates2 = [];
      const params2 = [];

      if (specialization !== undefined) {
        updates2.push('specialization = ?');
        params2.push(sanitizeInput(specialization));
      }
      if (qualifications !== undefined) {
        updates2.push('qualifications = ?');
        params2.push(sanitizeInput(qualifications));
      }
      if (yearsOfExperience !== undefined) {
        updates2.push('yearsOfExperience = ?');
        params2.push(yearsOfExperience);
      }
      if (consultationFee !== undefined) {
        updates2.push('consultationFee = ?');
        params2.push(consultationFee);
      }
      if (consultationDuration !== undefined) {
        updates2.push('consultationDuration = ?');
        params2.push(consultationDuration);
      }
      if (consultationEnabled !== undefined) {
        updates2.push('consultationEnabled = ?');
        params2.push(consultationEnabled ? 1 : 0);
      }

      if (updates2.length > 0) {
        updates2.push('updatedAt = CURRENT_TIMESTAMP');
        const query = `UPDATE doctorSpecializations SET ${updates2.join(', ')} WHERE doctorId = ?`;
        params2.push(id);
        await pool.query(query, params2);
      }
    }

    // Update available hours
    if (availableHours && Array.isArray(availableHours)) {
      // Delete existing hours
      await pool.query('DELETE FROM availableHours WHERE doctorId = ?', [id]);

      // Insert new hours
      for (const hour of availableHours) {
        const hourId = generateUUID();
        await pool.query(
          `INSERT INTO availableHours (id, doctorId, day, startTime, endTime)
           VALUES (?, ?, ?, ?, ?)`,
          [hourId, id, sanitizeInput(hour.day), hour.startTime, hour.endTime]
        );
      }
    }

    // Fetch updated doctor
    const [updatedDoctors] = await pool.query(
      `SELECT u.*, d.specialization, d.qualifications, d.yearsOfExperience,
              d.consultationFee, d.consultationDuration, d.consultationEnabled,
              d.rating, d.totalConsultations
       FROM users u
       LEFT JOIN doctorSpecializations d ON u.id = d.doctorId
       WHERE u.id = ?`,
      [id]
    );

    return sendSuccess(
      res,
      { doctor: formatDoctorResponse(updatedDoctors[0], updatedDoctors[0]) },
      'Doctor profile updated successfully'
    );
  } catch (error) {
    console.error('Update doctor error:', error);
    return sendError(res, 'Failed to update doctor', 500, error.message);
  }
};

// ── DELETE /api/doctors/:id ───────────────────────────────────────────────────
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation } = req.body;

    // Validate UUID
    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid doctor ID format', 400);
    }

    // Check authorization - admin only
    if (req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403);
    }

    // Require confirmation
    if (!confirmation) {
      return sendError(res, 'Confirmation required', 400);
    }

    // Check doctor exists
    const [doctors] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = ?',
      [id, 'doctor']
    );

    if (doctors.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    // Delete doctor (cascade will handle specializations and hours)
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return sendSuccess(res, null, 'Doctor deleted successfully');
  } catch (error) {
    console.error('Delete doctor error:', error);
    return sendError(res, 'Failed to delete doctor', 500, error.message);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
