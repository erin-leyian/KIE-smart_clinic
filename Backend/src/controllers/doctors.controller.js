const bcrypt = require('bcryptjs');
const https = require('https');
const {
  isValidUUID,
  generateUUID,
  sanitizeInput,
  isValidPassword,
  isValidEmail,
} = require('../utils/validation');
const {
  sendSuccess,
  sendError,
  sendValidationError,
  formatDoctorResponse,
  getPaginationParams,
  buildPaginationResponse,
} = require('../utils/responseFormatter');

// Supabase REST API helper - same as auth controller
async function supabaseQuery(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1${endpoint}`);
    const headers = {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
    };

    const req = https.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ data: result, status: res.statusCode, error: null });
        } catch (e) {
          resolve({ data: null, status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── GET /api/doctors ──────────────────────────────────────────────────────────
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    const { offset } = getPaginationParams({ page, limit });

    // Build REST API query for doctors
    let endpoint = `/users?role=eq.doctor&limit=${limit}&offset=${offset}&order=created_at.desc`;

    // Add search filter if provided
    if (search) {
      const searchTerm = sanitizeInput(search).toLowerCase();
      endpoint += `&or=(first_name.ilike.*${searchTerm}*,last_name.ilike.*${searchTerm}*,email.ilike.*${searchTerm}*)`;
    }

    // Get doctors
    const { data: doctors, status } = await supabaseQuery('GET', endpoint);

    if (status !== 200) {
      throw new Error(`Failed to fetch doctors: ${JSON.stringify(doctors)}`);
    }

    if (!Array.isArray(doctors)) {
      return sendError(res, 'Failed to fetch doctors', 500);
    }

    // Get doctor IDs for specialization lookup
    const doctorIds = doctors.map(d => d.id);

    // Fetch doctor specializations
    const specs = {};
    if (doctorIds.length > 0) {
      const specEndpoint = `/doctor_specializations?doctor_id=in.(${doctorIds.join(',')})`;
      const { data: specializations, status: specStatus } = await supabaseQuery('GET', specEndpoint);
      
      if (specStatus === 200 && Array.isArray(specializations)) {
        specializations.forEach(spec => {
          specs[spec.doctor_id] = spec;
        });
      }
    }

    // Format doctors with specialization data
    let formattedDoctors = doctors.map(doctor => {
      const spec = specs[doctor.id];
      return formatDoctorResponse(doctor, spec);
    });

    // Filter by specialization if provided
    if (specialization) {
      formattedDoctors = formattedDoctors.filter(doc =>
        doc.specialization?.toLowerCase() === sanitizeInput(specialization).toLowerCase()
      );
    }

    return sendSuccess(
      res,
      buildPaginationResponse(formattedDoctors, formattedDoctors.length, parseInt(page), parseInt(limit))
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

    // Get doctor user record
    const { data: doctors, status } = await supabaseQuery('GET', `/users?id=eq.${id}&role=eq.doctor`);

    if (status !== 200 || !Array.isArray(doctors) || doctors.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    const doctor = doctors[0];

    // Get doctor specialization
    const { data: specs, status: specStatus } = await supabaseQuery('GET', `/doctor_specializations?doctor_id=eq.${id}`);
    const specialization = specStatus === 200 && Array.isArray(specs) ? specs[0] : null;

    // Get available hours
    const { data: hours, status: hoursStatus } = await supabaseQuery('GET', `/available_hours?doctor_id=eq.${id}&order=day.asc`);
    const availableHours = hoursStatus === 200 && Array.isArray(hours) ? hours : [];

    const doctorData = formatDoctorResponse(doctor, specialization);
    doctorData.availableHours = availableHours;

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
    if (!email || !isValidEmail(email)) errors.push('email must be a valid email address');
    if (!password || !isValidPassword(password)) errors.push('password must be at least 8 characters');
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
    const { data: existing } = await supabaseQuery('GET', `/users?email=eq.${encodeURIComponent(email.toLowerCase())}`);
    if (Array.isArray(existing) && existing.length > 0) {
      return sendError(res, 'Email already exists', 409);
    }

    // Hash password and prepare user data
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUUID();

    // Create doctor user
    const { data: createdUsers, status: userStatus } = await supabaseQuery('POST', '/users', {
      id: userId,
      first_name: sanitizeInput(firstName),
      last_name: sanitizeInput(lastName),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'doctor',
      phone: phone || null,
    });

    if (userStatus !== 201 && userStatus !== 200) {
      throw new Error(`Failed to create doctor user: ${JSON.stringify(createdUsers)}`);
    }

    // Create doctor specialization
    const specId = generateUUID();
    const { data: createdSpecs, status: specStatus } = await supabaseQuery('POST', '/doctor_specializations', {
      id: specId,
      doctor_id: userId,
      specialization: sanitizeInput(specialization),
      qualifications: sanitizeInput(qualifications),
      years_of_experience: yearsOfExperience,
      consultation_fee: consultationFee || null,
      consultation_duration: consultationDuration,
      consultation_enabled: consultationEnabled,
    });

    if (specStatus !== 201 && specStatus !== 200) {
      throw new Error(`Failed to create doctor specialization: ${JSON.stringify(createdSpecs)}`);
    }

    // Insert available hours if provided
    if (availableHours && Array.isArray(availableHours) && availableHours.length > 0) {
      for (const hour of availableHours) {
        await supabaseQuery('POST', '/available_hours', {
          id: generateUUID(),
          doctor_id: userId,
          day: sanitizeInput(hour.day),
          start_time: hour.startTime,
          end_time: hour.endTime,
        });
      }
    }

    // Format response
    const user = Array.isArray(createdUsers) ? createdUsers[0] : createdUsers;
    const spec = Array.isArray(createdSpecs) ? createdSpecs[0] : createdSpecs;

    return sendSuccess(
      res,
      { doctor: formatDoctorResponse(user, spec) },
      'Doctor created successfully',
      201
    );
  } catch (error) {
    console.error('Create doctor error:', error);
    return sendError(res, 'Failed to create doctor', 500, error.message);
  }
};

// ── PATCH /api/doctors/:id ───────────────────────────────────────────────────
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
    if (req.user && req.user.id !== id && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403);
    }

    // Check doctor exists
    const { data: doctors, status: docStatus } = await supabaseQuery('GET', `/users?id=eq.${id}&role=eq.doctor`);
    if (docStatus !== 200 || !Array.isArray(doctors) || doctors.length === 0) {
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

    // Update user phone if provided
    if (phone !== undefined) {
      await supabaseQuery('PATCH', `/users?id=eq.${id}`, {
        phone: phone || null,
      });
    }

    // Update specialization if any fields provided
    if (
      specialization !== undefined ||
      qualifications !== undefined ||
      yearsOfExperience !== undefined ||
      consultationFee !== undefined ||
      consultationDuration !== undefined ||
      consultationEnabled !== undefined
    ) {
      const updateData = {};
      if (specialization !== undefined) updateData.specialization = sanitizeInput(specialization);
      if (qualifications !== undefined) updateData.qualifications = sanitizeInput(qualifications);
      if (yearsOfExperience !== undefined) updateData.years_of_experience = yearsOfExperience;
      if (consultationFee !== undefined) updateData.consultation_fee = consultationFee;
      if (consultationDuration !== undefined) updateData.consultation_duration = consultationDuration;
      if (consultationEnabled !== undefined) updateData.consultation_enabled = consultationEnabled;

      await supabaseQuery('PATCH', `/doctor_specializations?doctor_id=eq.${id}`, updateData);
    }

    // Update available hours if provided
    if (availableHours && Array.isArray(availableHours)) {
      // Delete existing hours
      await supabaseQuery('DELETE', `/available_hours?doctor_id=eq.${id}`);

      // Insert new hours
      for (const hour of availableHours) {
        await supabaseQuery('POST', '/available_hours', {
          id: generateUUID(),
          doctor_id: id,
          day: sanitizeInput(hour.day),
          start_time: hour.startTime,
          end_time: hour.endTime,
        });
      }
    }

    // Fetch updated doctor
    const { data: updatedDoctors } = await supabaseQuery('GET', `/users?id=eq.${id}`);
    const { data: updatedSpecs } = await supabaseQuery('GET', `/doctor_specializations?doctor_id=eq.${id}`);

    const user = Array.isArray(updatedDoctors) ? updatedDoctors[0] : updatedDoctors;
    const spec = Array.isArray(updatedSpecs) ? updatedSpecs[0] : null;

    return sendSuccess(
      res,
      { doctor: formatDoctorResponse(user, spec) },
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
    if (req.user && req.user.role !== 'admin') {
      return sendError(res, 'Access denied', 403);
    }

    // Require confirmation
    if (!confirmation) {
      return sendError(res, 'Confirmation required', 400);
    }

    // Check doctor exists
    const { data: doctors, status } = await supabaseQuery('GET', `/users?id=eq.${id}&role=eq.doctor`);
    if (status !== 200 || !Array.isArray(doctors) || doctors.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    // Delete doctor (cascade will handle specializations and hours)
    const { status: delStatus } = await supabaseQuery('DELETE', `/users?id=eq.${id}`);

    if (delStatus !== 204 && delStatus !== 200) {
      throw new Error('Failed to delete doctor');
    }

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
