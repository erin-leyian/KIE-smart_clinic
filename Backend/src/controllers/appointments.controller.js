const https = require('https');
const { 
  sendSuccess, sendError, sendValidationError, 
  getPaginationParams, buildPaginationResponse, formatAppointmentResponse 
} = require('../utils/responseFormatter');
const { notifyAppointmentCreated } = require('./notifications.controller');
const { 
  isValidUUID, isValidDate, isFutureDate, isValidTime, generateUUID, sanitizeInput 
} = require('../utils/validation');

// Supabase REST API helper
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

// ── POST /api/appointments ────────────────────────────────────────────────────
const createAppointment = async (req, res) => {
  try {
    // Handle both camelCase and snake_case field names
    const {
      doctorId,
      doctor_id,
      patientId,
      patient_id,
      appointmentDate,
      appointment_date,
      appointmentTime,
      appointment_time,
      reason,
      notes,
      status
    } = req.body;

    const userId = req.user?.id;
    const errors = [];

    // Use snake_case internally, but accept both formats
    const finalDoctorId = doctor_id || doctorId;
    const finalPatientId = patient_id || patientId;
    const finalAppointmentDate = appointment_date || appointmentDate;
    const finalAppointmentTime = appointment_time || appointmentTime;

    // Validation
    if (!finalDoctorId) errors.push('doctorId is required');
    else if (!isValidUUID(finalDoctorId)) errors.push('Invalid doctor ID format');

    if (!finalPatientId) errors.push('patientId is required');
    else if (!isValidUUID(finalPatientId)) errors.push('Invalid patient ID format');

    if (!finalAppointmentDate) errors.push('appointmentDate is required');
    else if (!isValidDate(finalAppointmentDate)) errors.push('Invalid date format (YYYY-MM-DD)');
    else if (!isFutureDate(finalAppointmentDate)) errors.push('Date must be in the future');

    if (!finalAppointmentTime) errors.push('appointmentTime is required');
    else if (!isValidTime(finalAppointmentTime)) errors.push('Invalid time format (HH:MM)');

    if (!reason) errors.push('reason is required');
    else if (sanitizeInput(reason).length < 5) errors.push('Reason must be at least 5 characters');

    if (errors.length > 0) return sendValidationError(res, errors);

    // Check if doctor exists
    const { data: doctors } = await supabaseQuery('GET', `/users?id=eq.${finalDoctorId}&role=eq.doctor`);
    if (!Array.isArray(doctors) || doctors.length === 0) return sendError(res, 'Doctor not found', 404);

  const doctorUser = doctors[0];
  const { data: doctorSpecs } = await supabaseQuery('GET', `/doctor_specializations?doctor_id=eq.${finalDoctorId}`);
  const doctorSpec = Array.isArray(doctorSpecs) && doctorSpecs.length > 0 ? doctorSpecs[0] : null;

    // Check if patient exists
    const { data: patients } = await supabaseQuery('GET', `/users?id=eq.${finalPatientId}&role=eq.patient`);
    if (!Array.isArray(patients) || patients.length === 0) return sendError(res, 'Patient not found', 404);
  const patientUser = patients[0];

    // Check for double-booking
    const { data: existing } = await supabaseQuery('GET', `/appointments?doctor_id=eq.${finalDoctorId}&appointment_date=eq.${finalAppointmentDate}&appointment_time=eq.${finalAppointmentTime}&status=neq.cancelled`);
    if (Array.isArray(existing) && existing.length > 0) return sendError(res, 'Time slot already booked', 409);

    // Create appointment
    const appointmentId = generateUUID();
    const { data: created, status: statusCode } = await supabaseQuery('POST', '/appointments', {
      id: appointmentId,
      doctor_id: finalDoctorId,
      patient_id: finalPatientId,
      appointment_date: finalAppointmentDate,
      appointment_time: finalAppointmentTime,
      reason: sanitizeInput(reason),
      notes: notes ? sanitizeInput(notes) : null,
      status: status || 'scheduled',
    });

    if (statusCode !== 201 && statusCode !== 200) {
      throw new Error(`Failed to create appointment: ${JSON.stringify(created)}`);
    }

    const createdAppointment = Array.isArray(created) ? created[0] : created;
    const doctor = {
      firstName: doctorUser.first_name,
      lastName: doctorUser.last_name,
      email: doctorUser.email,
      specialty: doctorSpec?.specialization || null,
      consultationFee: doctorSpec?.consultation_fee ?? null,
    };
    const patient = {
      firstName: patientUser.first_name,
      lastName: patientUser.last_name,
      email: patientUser.email,
    };

    await notifyAppointmentCreated({
      id: createdAppointment.id,
      patient_id: finalPatientId,
      doctor_id: finalDoctorId,
      doctor_first_name: doctorUser.first_name,
      doctor_last_name: doctorUser.last_name,
      patient_first_name: patientUser.first_name,
      patient_last_name: patientUser.last_name,
      appointment_date: finalAppointmentDate,
      appointment_time: finalAppointmentTime,
    });

    return sendSuccess(
      res,
      { appointment: formatAppointmentResponse(createdAppointment, doctor, patient) },
      'Appointment created successfully',
      201
    );
  } catch (err) {
    console.error('Create appointment error:', err);
    return sendError(res, 'Failed to create appointment', 500, err.message);
  }
};

// ── GET /api/appointments ─────────────────────────────────────────────────────
const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { status, date, doctorId, patientId } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { offset } = getPaginationParams({ page, limit });

    // Build REST API query
    let endpoint = `/appointments?limit=${limit}&offset=${offset}&order=appointment_date.asc,appointment_time.asc`;

    // Role-based filtering
    if (userRole === 'patient') {
      endpoint += `&patient_id=eq.${userId}`;
    } else if (userRole === 'doctor') {
      endpoint += `&doctor_id=eq.${userId}`;
    }
    // Admin sees all appointments

    // Optional filters
    if (status) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
      if (validStatuses.includes(status)) {
        endpoint += `&status=eq.${status}`;
      }
    }

    if (date && isValidDate(date)) {
      endpoint += `&appointment_date=eq.${date}`;
    }

    if (doctorId && isValidUUID(doctorId)) {
      endpoint += `&doctor_id=eq.${doctorId}`;
    }

    if (patientId && isValidUUID(patientId)) {
      endpoint += `&patient_id=eq.${patientId}`;
    }

    const { data: appointments, status: respStatus } = await supabaseQuery('GET', endpoint);

    if (respStatus !== 200 || !Array.isArray(appointments)) {
      throw new Error(`Failed to fetch appointments: ${JSON.stringify(appointments)}`);
    }

    // Fetch doctor and patient info for each appointment to get names
    const formattedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        let doctor = null;
        let patient = null;

        // Fetch doctor info
        if (apt.doctor_id) {
          const { data: docData } = await supabaseQuery('GET', `/users?id=eq.${apt.doctor_id}`);
          const { data: docSpecData } = await supabaseQuery('GET', `/doctor_specializations?doctor_id=eq.${apt.doctor_id}`);
          const docSpec = Array.isArray(docSpecData) && docSpecData.length > 0 ? docSpecData[0] : null;
          if (Array.isArray(docData) && docData.length > 0) {
            const doc = docData[0];
            doctor = {
              firstName: doc.first_name,
              lastName: doc.last_name,
              email: doc.email,
              specialty: docSpec?.specialization || null,
              consultationFee: docSpec?.consultation_fee ?? null,
            };
          }
        }

        // Fetch patient info
        if (apt.patient_id) {
          const { data: patData } = await supabaseQuery('GET', `/users?id=eq.${apt.patient_id}`);
          if (Array.isArray(patData) && patData.length > 0) {
            const pat = patData[0];
            patient = {
              firstName: pat.first_name,
              lastName: pat.last_name,
              email: pat.email
            };
          }
        }

        return formatAppointmentResponse(apt, doctor, patient);
      })
    );
    const pagination = buildPaginationResponse(formattedAppointments, formattedAppointments.length, parseInt(page), parseInt(limit));

    return sendSuccess(res, { data: formattedAppointments, pagination });
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

    const { data: appointments, status } = await supabaseQuery('GET', `/appointments?id=eq.${id}`);

    if (status !== 200 || !Array.isArray(appointments) || appointments.length === 0) {
      return sendError(res, 'Appointment not found', 404);
    }

    const appointment = appointments[0];

    // Access control: patient sees own, doctor sees their appointments, admin sees all
    if (userRole === 'patient' && appointment.patient_id !== userId) {
      return sendError(res, 'Unauthorized to view this appointment', 403);
    }
    if (userRole === 'doctor' && appointment.doctor_id !== userId) {
      return sendError(res, 'Unauthorized to view this appointment', 403);
    }

    // Fetch doctor and patient info
    let doctor = null;
    let patient = null;

    if (appointment.doctor_id) {
      const { data: docData } = await supabaseQuery('GET', `/users?id=eq.${appointment.doctor_id}`);
      const { data: docSpecData } = await supabaseQuery('GET', `/doctor_specializations?doctor_id=eq.${appointment.doctor_id}`);
      const docSpec = Array.isArray(docSpecData) && docSpecData.length > 0 ? docSpecData[0] : null;
      if (Array.isArray(docData) && docData.length > 0) {
        const doc = docData[0];
        doctor = {
          firstName: doc.first_name,
          lastName: doc.last_name,
          email: doc.email,
          specialty: docSpec?.specialization || null,
          consultationFee: docSpec?.consultation_fee ?? null,
        };
      }
    }

    if (appointment.patient_id) {
      const { data: patData } = await supabaseQuery('GET', `/users?id=eq.${appointment.patient_id}`);
      if (Array.isArray(patData) && patData.length > 0) {
        const pat = patData[0];
        patient = {
          firstName: pat.first_name,
          lastName: pat.last_name,
          email: pat.email
        };
      }
    }

    return sendSuccess(res, { appointment: formatAppointmentResponse(appointment, doctor, patient) });
  } catch (err) {
    console.error('Get appointment by ID error:', err);
    return sendError(res, 'Failed to fetch appointment', 500, err.message);
  }
};

// ── PATCH /api/appointments/:id ──────────────────────────────────────────────
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, appointmentTime, reason, notes, status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(id)) return sendError(res, 'Invalid appointment ID format', 400);

    // Get appointment
    const { data: appointments } = await supabaseQuery('GET', `/appointments?id=eq.${id}`);
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return sendError(res, 'Appointment not found', 404);
    }

    const appointment = appointments[0];

    // Access control: patient updates own, doctor/admin can update any
    if (userRole === 'patient' && appointment.patient_id !== userId) {
      return sendError(res, 'Unauthorized to update this appointment', 403);
    }

    const errors = [];

    // Validation for optional fields
    if (appointmentDate !== undefined) {
      if (!isValidDate(appointmentDate)) errors.push('Invalid date format (YYYY-MM-DD)');
      else if (!isFutureDate(appointmentDate)) errors.push('Date must be in the future');
    }

    if (appointmentTime !== undefined && !isValidTime(appointmentTime)) {
      errors.push('Invalid time format (HH:MM)');
    }

    if (reason !== undefined && sanitizeInput(reason).length < 5) {
      errors.push('Reason must be at least 5 characters');
    }

    if (status !== undefined) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
      if (!validStatuses.includes(status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    if (errors.length > 0) return sendValidationError(res, errors);

    // Check for double-booking if time is being changed
    if (appointmentDate || appointmentTime) {
      const newDate = appointmentDate || appointment.appointment_date;
      const newTime = appointmentTime || appointment.appointment_time;

      const { data: existing } = await supabaseQuery('GET', `/appointments?doctor_id=eq.${appointment.doctor_id}&appointment_date=eq.${newDate}&appointment_time=eq.${newTime}&id=neq.${id}&status=neq.cancelled`);
      if (Array.isArray(existing) && existing.length > 0) {
        return sendError(res, 'Time slot already booked', 409);
      }
    }

    // Build update data
    const updateData = {};
    if (appointmentDate !== undefined) updateData.appointment_date = appointmentDate;
    if (appointmentTime !== undefined) updateData.appointment_time = appointmentTime;
    if (reason !== undefined) updateData.reason = sanitizeInput(reason);
    if (notes !== undefined) updateData.notes = sanitizeInput(notes);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No fields to update', 400);
    }

    const { data: updated } = await supabaseQuery('PATCH', `/appointments?id=eq.${id}`, updateData);

    return sendSuccess(res, { appointment: updated }, 'Appointment updated successfully');
  } catch (err) {
    console.error('Update appointment error:', err);
    return sendError(res, 'Failed to update appointment', 500, err.message);
  }
};

// ── DELETE /api/appointments/:id ──────────────────────────────────────────────
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(id)) return sendError(res, 'Invalid appointment ID format', 400);

    if (!confirmation) return sendError(res, 'Confirmation required to delete appointment', 400);

    // Get appointment
    const { data: appointments } = await supabaseQuery('GET', `/appointments?id=eq.${id}`);
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return sendError(res, 'Appointment not found', 404);
    }

    const appointment = appointments[0];

    // Access control: patient deletes own, doctor/admin can delete any
    if (userRole === 'patient' && appointment.patient_id !== userId) {
      return sendError(res, 'Unauthorized to delete this appointment', 403);
    }

    // Delete appointment
    const { status } = await supabaseQuery('DELETE', `/appointments?id=eq.${id}`);

    if (status !== 204 && status !== 200) {
      throw new Error('Failed to delete appointment');
    }

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