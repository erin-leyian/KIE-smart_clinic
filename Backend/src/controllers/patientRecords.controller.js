const https = require('https');
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

// Helper function for Supabase REST API calls
async function supabaseQuery(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1${endpoint}`);
    const headers = {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
    };

    const options = {
      method,
      headers,
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : [];
          resolve({ data: parsed, status: res.statusCode });
        } catch (e) {
          resolve({ data: null, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

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
    const { data: patients, status: patientsStatus } = await supabaseQuery('GET', `/users?id=eq.${patientId}&role=eq.patient`);

    if (patientsStatus !== 200 || !Array.isArray(patients) || patients.length === 0) {
      return sendError(res, 'Patient not found', 404);
    }

    // Check doctor is authorized (must be admin or the doctor owning appointment)
    const doctorId = req.user.id;
    if (req.user.role !== 'admin') {
      if (appointmentId) {
        const { data: appointments, status: apptStatus } = await supabaseQuery('GET', `/appointments?id=eq.${appointmentId}&patient_id=eq.${patientId}&doctor_id=eq.${doctorId}`);
        if (apptStatus !== 200 || !Array.isArray(appointments) || appointments.length === 0) {
          return sendError(res, 'Access denied - appointment not found or not your patient', 403);
        }
      } else if (req.user.role !== 'doctor') {
        return sendError(res, 'Only doctors or admins can create patient records', 403);
      }
    }

    // Create record
    const recordId = generateUUID();
    const body = {
      id: recordId,
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: appointmentId || null,
      diagnosis: sanitizeInput(diagnosis),
      treatment: sanitizeInput(treatment),
      medication: medication ? sanitizeInput(medication) : null,
      test_results: testResults ? sanitizeInput(testResults) : null,
      notes: notes ? sanitizeInput(notes) : null,
      follow_up_date: followUpDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: createdRecords, status } = await supabaseQuery('POST', '/patient_records', body);

    if (status !== 201 && status !== 200 || !Array.isArray(createdRecords) || createdRecords.length === 0) {
      console.error('Patient record creation failed:', { status, createdRecords, body });
      return sendError(res, 'Failed to create patient record', 500);
    }

    const record = createdRecords[0];
    const patientInfo = { firstName: patients[0].first_name, lastName: patients[0].last_name };
    
    // Fetch doctor info from database
    const { data: doctorData } = await supabaseQuery('GET', `/users?id=eq.${doctorId}`);
    const doctorInfo = doctorData?.[0] ? { firstName: doctorData[0].first_name, lastName: doctorData[0].last_name } : { firstName: 'Dr.', lastName: '' };

    return sendSuccess(
      res,
      {
        record: formatPatientRecordResponse(record, patientInfo, doctorInfo),
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

    // Build filters
    let endpoint = '/patient_records?';
    const filters = [];

    // Apply role-based filtering
    if (req.user.role === 'patient') {
      filters.push(`patient_id=eq.${req.user.id}`);
    } else if (req.user.role === 'doctor') {
      filters.push(`doctor_id=eq.${req.user.id}`);
    }
    // Admins can see all

    // Apply additional filters
    if (patientId) {
      if (!isValidUUID(patientId)) {
        return sendError(res, 'Invalid patientId format', 400);
      }
      filters.push(`patient_id=eq.${patientId}`);
    }

    if (doctorId) {
      if (!isValidUUID(doctorId)) {
        return sendError(res, 'Invalid doctorId format', 400);
      }
      filters.push(`doctor_id=eq.${doctorId}`);
    }

    if (fromDate) {
      if (!isValidDate(fromDate)) {
        return sendError(res, 'Invalid fromDate format', 400);
      }
      filters.push(`created_at=gte.${fromDate}`);
    }

    if (toDate) {
      if (!isValidDate(toDate)) {
        return sendError(res, 'Invalid toDate format', 400);
      }
      filters.push(`created_at=lte.${toDate}`);
    }

    // Add pagination and sorting
    const fullEndpoint = endpoint + filters.join('&') + (filters.length > 0 ? '&' : '') + `order=created_at.desc&limit=${limit}&offset=${offset}`;

    // Get paginated results
    const { data: records, status } = await supabaseQuery('GET', fullEndpoint);

    if (status !== 200 || !Array.isArray(records)) {
      return sendError(res, 'Failed to fetch patient records', 500);
    }

    // Get total count
    const countEndpoint = '/patient_records?select=count()&' + filters.join('&');
    const { data: countData, status: countStatus } = await supabaseQuery('GET', countEndpoint);
    const total = countStatus === 200 ? parseInt(countData[0]?.count || 0) : 0;

    // Fetch user data for each record
    const enrichedRecords = await Promise.all(records.map(async (record) => {
      const { data: patientData } = await supabaseQuery('GET', `/users?id=eq.${record.patient_id}`);
      const { data: doctorData } = await supabaseQuery('GET', `/users?id=eq.${record.doctor_id}`);

      const patient = patientData?.[0] ? { firstName: patientData[0].first_name, lastName: patientData[0].last_name } : {};
      const doctor = doctorData?.[0] ? { firstName: doctorData[0].first_name, lastName: doctorData[0].last_name } : {};

      return formatPatientRecordResponse(record, patient, doctor);
    }));

    return sendSuccess(
      res,
      buildPaginationResponse(enrichedRecords, total, parseInt(page), parseInt(limit))
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

    const { data: records, status } = await supabaseQuery('GET', `/patient_records?id=eq.${id}`);

    if (status !== 200 || !Array.isArray(records) || records.length === 0) {
      return sendError(res, 'Patient record not found', 404);
    }

    const record = records[0];

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      req.user.id !== record.patient_id &&
      req.user.id !== record.doctor_id
    ) {
      return sendError(res, 'Access denied', 403);
    }

    // Fetch user data for response
    const { data: patientData } = await supabaseQuery('GET', `/users?id=eq.${record.patient_id}`);
    const { data: doctorData } = await supabaseQuery('GET', `/users?id=eq.${record.doctor_id}`);

    const patient = patientData?.[0] ? { firstName: patientData[0].first_name, lastName: patientData[0].last_name } : {};
    const doctor = doctorData?.[0] ? { firstName: doctorData[0].first_name, lastName: doctorData[0].last_name } : {};

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
    const { data: records, status } = await supabaseQuery('GET', `/patient_records?id=eq.${id}`);

    if (status !== 200 || !Array.isArray(records) || records.length === 0) {
      return sendError(res, 'Patient record not found', 404);
    }

    const record = records[0];

    // Only doctor who created it or admin can update
    if (req.user.role !== 'admin' && req.user.id !== record.doctor_id) {
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

    // Build update body
    const updateBody = {};

    if (diagnosis !== undefined) {
      updateBody.diagnosis = sanitizeInput(diagnosis);
    }
    if (treatment !== undefined) {
      updateBody.treatment = sanitizeInput(treatment);
    }
    if (medication !== undefined) {
      updateBody.medication = medication ? sanitizeInput(medication) : null;
    }
    if (testResults !== undefined) {
      updateBody.test_results = testResults ? sanitizeInput(testResults) : null;
    }
    if (notes !== undefined) {
      updateBody.notes = notes ? sanitizeInput(notes) : null;
    }
    if (followUpDate !== undefined) {
      updateBody.follow_up_date = followUpDate || null;
    }

    if (Object.keys(updateBody).length === 0) {
      return sendError(res, 'No fields to update', 400);
    }

    updateBody.updated_at = new Date().toISOString();

    // Update record
    const { data: updatedRecords, status: updateStatus } = await supabaseQuery('PATCH', `/patient_records?id=eq.${id}`, updateBody);

    if (updateStatus !== 200 || !Array.isArray(updatedRecords) || updatedRecords.length === 0) {
      return sendError(res, 'Failed to update patient record', 500);
    }

    const updatedRecord = updatedRecords[0];

    // Fetch user data for response
    const { data: patientData } = await supabaseQuery('GET', `/users?id=eq.${updatedRecord.patient_id}`);
    const { data: doctorData } = await supabaseQuery('GET', `/users?id=eq.${updatedRecord.doctor_id}`);

    const patient = patientData?.[0] ? { firstName: patientData[0].first_name, lastName: patientData[0].last_name } : {};
    const doctor = doctorData?.[0] ? { firstName: doctorData[0].first_name, lastName: doctorData[0].last_name } : {};

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
    const { data: records, status } = await supabaseQuery('GET', `/patient_records?id=eq.${id}`);

    if (status !== 200 || !Array.isArray(records) || records.length === 0) {
      return sendError(res, 'Patient record not found', 404);
    }

    // Delete record
    const { status: deleteStatus } = await supabaseQuery('DELETE', `/patient_records?id=eq.${id}`);

    if (deleteStatus !== 204) {
      return sendError(res, 'Failed to delete patient record', 500);
    }

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
