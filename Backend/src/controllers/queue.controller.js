const https = require('https');
const { 
  sendSuccess, sendError, sendValidationError 
} = require('../utils/responseFormatter');
const { 
  isValidUUID, isValidQueueStatus, generateUUID, sanitizeInput 
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
    const { data: doctors } = await supabaseQuery('GET', `/users?id=eq.${doctorId}&role=eq.doctor`);
    if (!Array.isArray(doctors) || doctors.length === 0) {
      return sendError(res, 'Doctor not found', 404);
    }

    // Get queue for this doctor, ordered by position
    const { data: queueEntries } = await supabaseQuery('GET', `/queue_entries?doctor_id=eq.${doctorId}&status=in.(waiting,in-progress)&order=position.asc`);

    if (!Array.isArray(queueEntries)) {
      return sendError(res, 'Failed to fetch queue', 500);
    }

    // Format queue entries
    const formattedQueue = queueEntries.map(entry => ({
      id: entry.id,
      appointmentId: entry.appointment_id,
      patientId: entry.patient_id,
      status: entry.status,
      position: entry.position,
      estimatedWaitTime: entry.estimated_wait_time,
      arrivedAt: entry.joined_at,
      servedAt: entry.served_at,
    }));

    return sendSuccess(res, {
      queue: formattedQueue,
      total: formattedQueue.length,
    }, 'Queue retrieved successfully');
  } catch (err) {
    console.error('Get queue for doctor error:', err);
    return sendError(res, 'Failed to fetch queue', 500, err.message);
  }
};

// ── PATCH /api/queue/:queueId ────────────────────────────────────────────────
const updateQueueStatus = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(queueId)) return sendError(res, 'Invalid queue ID format', 400);

    const errors = [];
    if (!status) errors.push('Status is required');
    else if (!isValidQueueStatus(status)) errors.push('Invalid status value');

    if (errors.length > 0) return sendValidationError(res, errors);

    // Get queue entry
    const { data: queueEntries } = await supabaseQuery('GET', `/queue_entries?id=eq.${queueId}`);
    if (!Array.isArray(queueEntries) || queueEntries.length === 0) {
      return sendError(res, 'Queue entry not found', 404);
    }

    const queueEntry = queueEntries[0];

    // Access control: only doctor or admin can update queue
    if (userRole === 'doctor' && queueEntry.doctor_id !== userId) {
      return sendError(res, 'Unauthorized to update this queue', 403);
    }

    // Build update data
    const updateData = { status };
    if (status === 'in-service') {
      updateData.served_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.served_at = new Date().toISOString();
    }

    if (notes) {
      updateData.notes = sanitizeInput(notes);
    }

    // Update queue entry
    const { data: updated } = await supabaseQuery('PATCH', `/queue_entries?id=eq.${queueId}`, updateData);

    // Update corresponding appointment status if exists
    if (queueEntry.appointment_id && status === 'completed') {
      await supabaseQuery('PATCH', `/appointments?id=eq.${queueEntry.appointment_id}`, {
        status: 'completed'
      });
    }

    const result = Array.isArray(updated) ? updated[0] : updated;

    return sendSuccess(res, {
      id: result.id,
      appointmentId: result.appointment_id,
      patientId: result.patient_id,
      status: result.status,
      position: result.position,
    }, 'Queue status updated');
  } catch (err) {
    console.error('Update queue status error:', err);
    return sendError(res, 'Failed to update queue status', 500, err.message);
  }
};

// ── PATCH /api/queue/:queueId/complete ───────────────────────────────────────
const completeQueue = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { notes, duration } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!isValidUUID(queueId)) return sendError(res, 'Invalid queue ID format', 400);

    // Get queue entry
    const { data: queueEntries } = await supabaseQuery('GET', `/queue_entries?id=eq.${queueId}`);
    if (!Array.isArray(queueEntries) || queueEntries.length === 0) {
      return sendError(res, 'Queue entry not found', 404);
    }

    const queueEntry = queueEntries[0];

    // Access control: only doctor or admin can complete queue
    if (userRole === 'doctor' && queueEntry.doctor_id !== userId) {
      return sendError(res, 'Unauthorized to complete this queue', 403);
    }

    // Update queue entry status to completed
    const updateData = {
      status: 'completed',
      served_at: new Date().toISOString(),
    };

    if (notes) {
      updateData.notes = sanitizeInput(notes);
    }

    const { data: updated } = await supabaseQuery('PATCH', `/queue_entries?id=eq.${queueId}`, updateData);

    // Update corresponding appointment status
    if (queueEntry.appointment_id) {
      await supabaseQuery('PATCH', `/appointments?id=eq.${queueEntry.appointment_id}`, {
        status: 'completed'
      });
    }

    const result = Array.isArray(updated) ? updated[0] : updated;

    return sendSuccess(res, {
      id: result.id,
      appointmentId: result.appointment_id,
      patientId: result.patient_id,
      status: result.status,
      servedAt: result.served_at,
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