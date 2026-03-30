/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

// Per project rule: single central base URL (no /api suffix). We will auto-prefix '/api' to endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Utility function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const getStoredUser = () => {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const normalizeStatusForApi = (status) => {
  if (!status || typeof status !== 'string') return status;

  const statusMap = {
    Pending: 'scheduled',
    Scheduled: 'scheduled',
    Confirmed: 'scheduled',
    Completed: 'completed',
    Cancelled: 'cancelled',
    Canceled: 'cancelled',
    'No-Show': 'no-show',
    no_show: 'no-show',
  };

  return statusMap[status] || status.toLowerCase();
};

const isValidUUID = (value) => {
  if (!value || typeof value !== 'string') return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
};

const normalizeAppointmentTime = (value) => {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  const match = trimmed.match(/([01]\d|2[0-3]):([0-5]\d)/);

  return match ? `${match[1]}:${match[2]}` : trimmed;
};

const ensureValidReason = (reason, fallback = 'General consultation') => {
  const normalized = typeof reason === 'string' ? reason.trim() : '';
  return normalized.length >= 5 ? normalized : fallback;
};

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
};

const isBadRequestError = (err) => {
  const message = String(err?.message || '');
  return message.includes('API Error: 400') || message.toLowerCase().includes('validation failed');
};

const normalizeArrayResponse = (response, alias) => {
  const data = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  return {
    ...(response || {}),
    data,
    ...(alias ? { [alias]: data } : {}),
  };
};

const normalizeObjectResponse = (response, key) => {
  const source = response?.[key];
  const normalized = Array.isArray(source)
    ? (source[0] || null)
    : (source || null);

  return {
    ...(response || {}),
    [key]: normalized,
    data: normalized,
  };
};

// Utility function to handle API responses
const handleResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const parsed = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { message: text };
        }
      })()
    : null;

  if (!response.ok) {
    const error = parsed || {};
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return parsed;
};

// Utility function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ensure every endpoint is requested under the /api prefix on the single base URL
  const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

export const authAPI = {
  // Login user
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token and user info - backend returns clean structure
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userRole', data.user.role);
    }
    
    return data;
  },

  // Register new user
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token and user info
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userRole', data.user.role);
    }
    
    return data;
  },

  // Get current user
  getCurrentUser: async () => {
    const res = await apiRequest('/auth/me', { method: 'GET' });

    if (res?.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
      if (res.user.role) {
        localStorage.setItem('userRole', res.user.role);
      }
    }

    return { ...(res || {}), user: res?.user || null };
  },

  // Get all users (admin only)
  getAllUsers: async (filters = {}) => {
    const query = buildQuery({
      role: filters.role,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
    });

    const endpoint = query ? `/auth/users?${query}` : '/auth/users';
    const res = await apiRequest(endpoint, { method: 'GET' });

    return {
      ...normalizeArrayResponse(res, 'users'),
      pagination: res?.pagination,
    };
  },

  // Get user by ID
  getUserById: async (id) => {
    const res = await apiRequest(`/auth/users/${id}`, { method: 'GET' });

    return { ...(res || {}), user: res?.user || null };
  },

  // Update user
  updateUser: async (id, userData) => {
    return apiRequest(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    return apiRequest(`/auth/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },
};

// ============================================
// DOCTORS ENDPOINTS
// ============================================

export const doctorsAPI = {
  // Get all doctors
  getAllDoctors: async (filters = {}) => {
    const query = buildQuery({
      specialization: filters.specialization || filters.specialty,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
    });

    const url = query ? `/doctors?${query}` : '/doctors';
    const res = await apiRequest(url, { method: 'GET' });

    return {
      ...normalizeArrayResponse(res, 'doctors'),
      pagination: res?.pagination,
    };
  },

  // Get doctor by ID
  getDoctorById: async (id) => {
    const res = await apiRequest(`/doctors/${id}`, {
      method: 'GET',
    });

    return { ...(res || {}), doctor: res?.doctor || null };
  },

  // Create doctor (admin only)
  createDoctor: async (doctorData) => {
    return apiRequest('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  },

  // Update doctor
  updateDoctor: async (id, doctorData) => {
    return apiRequest(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    });
  },

  // Delete doctor (admin only)
  deleteDoctor: async (id) => {
    return apiRequest(`/doctors/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// APPOINTMENTS ENDPOINTS
// ============================================

export const appointmentsAPI = {
  // Get all appointments
  getAllAppointments: async (filters = {}) => {
    const normalizedStatus = normalizeStatusForApi(filters.status);
    const normalizedDoctorId = filters.doctorId || filters.doctor_id;
    const normalizedPatientId = filters.patientId || filters.patient_id;

    const query = buildQuery({
      status: normalizedStatus,
      doctorId: isValidUUID(String(normalizedDoctorId || '').trim()) ? normalizedDoctorId : undefined,
      patientId: isValidUUID(String(normalizedPatientId || '').trim()) ? normalizedPatientId : undefined,
      date: filters.date,
      page: filters.page,
      limit: filters.limit,
    });

    const url = query ? `/appointments?${query}` : '/appointments';
    let res;

    try {
      res = await apiRequest(url, { method: 'GET' });
    } catch (err) {
      // Fallback: backend already applies role-based filtering; retry without optional filters if query shape is rejected.
      if (!isBadRequestError(err)) {
        throw err;
      }

      res = await apiRequest('/appointments', { method: 'GET' });
    }

    return {
      ...normalizeArrayResponse(res, 'appointments'),
      pagination: res?.pagination,
    };
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    if (!isValidUUID(String(id || '').trim())) {
      throw new Error('Invalid appointment ID format');
    }

    const res = await apiRequest(`/appointments/${id}`, {
      method: 'GET',
    });

    return normalizeObjectResponse(res, 'appointment');
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const currentUser = getStoredUser();
    const payload = {
      ...appointmentData,
      patientId:
        appointmentData?.patientId ||
        appointmentData?.patient_id ||
        (currentUser?.role === 'patient' ? currentUser.id : undefined),
      doctorId:
        appointmentData?.doctorId ||
        appointmentData?.doctor_id ||
        (currentUser?.role === 'doctor' ? currentUser.id : undefined),
      appointmentDate: appointmentData?.appointmentDate || appointmentData?.appointment_date || appointmentData?.date,
      appointmentTime: normalizeAppointmentTime(
        appointmentData?.appointmentTime || appointmentData?.appointment_time || appointmentData?.time
      ),
      status: normalizeStatusForApi(appointmentData?.status),
      reason: ensureValidReason(appointmentData?.reason),
    };

    if (!payload.patientId && currentUser?.id) {
      payload.patientId = currentUser.id;
    }

    if (!isValidUUID(String(payload.patientId || '').trim())) {
      throw new Error('A valid patient ID is required to create an appointment');
    }

    if (!isValidUUID(String(payload.doctorId || '').trim())) {
      throw new Error('A valid doctor ID is required to create an appointment');
    }

    if (!payload.appointmentDate) {
      throw new Error('Appointment date is required');
    }

    if (!payload.appointmentTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(payload.appointmentTime)) {
      throw new Error('Appointment time must be in HH:MM format');
    }

    delete payload.type;

    const res = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return normalizeObjectResponse(res, 'appointment');
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    if (!isValidUUID(String(id || '').trim())) {
      throw new Error('Invalid appointment ID format');
    }

    const payload = {
      ...appointmentData,
      appointmentDate: appointmentData?.appointmentDate || appointmentData?.appointment_date || appointmentData?.date,
      appointmentTime: normalizeAppointmentTime(
        appointmentData?.appointmentTime || appointmentData?.appointment_time || appointmentData?.time
      ),
      status: normalizeStatusForApi(appointmentData?.status),
    };

    if (payload.reason !== undefined) {
      const normalizedReason = String(payload.reason || '').trim();
      if (!normalizedReason) {
        delete payload.reason;
      } else if (normalizedReason.length < 5) {
        throw new Error('Reason must be at least 5 characters');
      } else {
        payload.reason = normalizedReason;
      }
    }

    if (
      payload.appointmentTime !== undefined &&
      payload.appointmentTime !== '' &&
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(payload.appointmentTime)
    ) {
      throw new Error('Appointment time must be in HH:MM format');
    }

    delete payload.type;

    const res = await apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    return normalizeObjectResponse(res, 'appointment');
  },

  // Cancel appointment (use update with status: cancelled)
  cancelAppointment: async (id) => {
    if (!isValidUUID(String(id || '').trim())) {
      throw new Error('Invalid appointment ID format');
    }

    return apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: normalizeStatusForApi('cancelled') })
    });
  },

  // Delete appointment (backend requires confirmation in body)
  deleteAppointment: async (id) => {
    if (!isValidUUID(String(id || '').trim())) {
      throw new Error('Invalid appointment ID format');
    }

    return apiRequest(`/appointments/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmation: true })
    });
  },
};

// ============================================
// PATIENT RECORDS ENDPOINTS
// ============================================

export const patientRecordsAPI = {
  // Get all patient records
  getAllPatientRecords: async (filters = {}) => {
    const query = buildQuery({
      patientId: filters.patientId || filters.patient_id,
      doctorId: filters.doctorId || filters.doctor_id,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page,
      limit: filters.limit,
    });

    const url = query ? `/patient-records?${query}` : '/patient-records';
    const res = await apiRequest(url, { method: 'GET' });

    return {
      ...normalizeArrayResponse(res, 'records'),
      pagination: res?.pagination,
    };
  },

  // Get patient record by ID
  getPatientRecordById: async (id) => {
    const res = await apiRequest(`/patient-records/${id}`, {
      method: 'GET',
    });

    return normalizeObjectResponse(res, 'record');
  },

  // Create patient record
  createPatientRecord: async (recordData) => {
    const currentUser = getStoredUser();
    const payload = {
      patientId:
        recordData?.patientId ||
        recordData?.patient_id ||
        (currentUser?.role === 'patient' ? currentUser.id : undefined),
      appointmentId: recordData?.appointmentId || recordData?.appointment_id,
      diagnosis: recordData?.diagnosis,
      treatment: recordData?.treatment,
      medication: recordData?.medication,
      testResults: recordData?.testResults,
      notes: recordData?.notes || recordData?.issue,
      followUpDate: recordData?.followUpDate || recordData?.follow_up_date,
    };

    const res = await apiRequest('/patient-records', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeObjectResponse(res, 'record');
  },

  // Update patient record
  updatePatientRecord: async (id, recordData) => {
    const payload = {
      diagnosis: recordData?.diagnosis,
      treatment: recordData?.treatment,
      medication: recordData?.medication,
      testResults: recordData?.testResults,
      notes: recordData?.notes,
      followUpDate: recordData?.followUpDate || recordData?.follow_up_date,
    };

    const res = await apiRequest(`/patient-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return normalizeObjectResponse(res, 'record');
  },

  // Delete patient record
  deletePatientRecord: async (id) => {
    return apiRequest(`/patient-records/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmation: true })
    });
  },
};

// ============================================
// QUEUE ENDPOINTS
// ============================================

export const queueAPI = {
  // Get queue entries
  getQueueEntries: async (doctorId) => {
    const currentUser = getStoredUser();
    const targetDoctorId = doctorId || currentUser?.id;

    const res = await apiRequest(`/queue/doctor/${targetDoctorId}`, {
      method: 'GET',
    });

    const queue = Array.isArray(res?.queue) ? res.queue : [];
    return {
      ...(res || {}),
      queue,
      data: queue,
      total: res?.total ?? queue.length,
    };
  },

  // Add to queue
  addToQueue: async (queueData) => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(queueData),
    });
  },

  // Update queue entry
  updateQueueEntry: async (id, queueData) => {
    return apiRequest(`/queue/${id}`, {
      method: 'PUT',
      body: JSON.stringify(queueData),
    });
  },

  // Remove from queue
  removeFromQueue: async (id) => {
    return apiRequest(`/queue/${id}/complete`, {
      method: 'PUT',
    });
  },
};

// ============================================
// NOTIFICATIONS ENDPOINTS
// ============================================

export const notificationsAPI = {
  // Get all notifications
  getAllNotifications: async () => {
    // Accept optional filtering via query params if caller appends them to endpoint
    const res = await apiRequest('/notifications', { method: 'GET' });

    return normalizeArrayResponse(res, 'notifications');
  },

  // Get notification by ID
  getNotificationById: async (id) => {
    const all = await apiRequest('/notifications', { method: 'GET' });
    const notifications = Array.isArray(all?.data) ? all.data : [];
    const notification = notifications.find((item) => item.id === id) || null;
    return { ...(all || {}), notification, data: notification };
  },

  // Create notification
  createNotification: async (notificationData) => {
    const notification = {
      ...notificationData,
      id: notificationData?.id || `${Date.now()}`,
      createdAt: notificationData?.createdAt || new Date().toISOString(),
    };

    return { status: 'success', notification, data: notification };
  },

  // Mark notification as read
  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Delete notification
  deleteNotification: async (id) => {
    return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
  },
};

// ============================================
// SYSTEM SETTINGS ENDPOINTS
// ============================================

export const systemSettingsAPI = {
  // Get all hospitals
  getHospitals: async () => {
    const res = await apiRequest('/admin/system-settings/hospitals', {
      method: 'GET',
    });

    const normalized = normalizeArrayResponse(res, 'hospitals');
    return {
      ...normalized,
      hospitals: normalized.data || [],
    };
  },

  // Get all insurance providers
  getInsuranceProviders: async () => {
    const res = await apiRequest('/admin/system-settings/insurance', {
      method: 'GET',
    });

    const normalized = normalizeArrayResponse(res, 'insurance');
    return {
      ...normalized,
      insurance: normalized.data || [],
    };
  },

  // Get all medical conditions
  getMedicalConditions: async () => {
    const res = await apiRequest('/admin/system-settings/conditions', {
      method: 'GET',
    });

    const normalized = normalizeArrayResponse(res, 'conditions');
    return {
      ...normalized,
      conditions: normalized.data || [],
    };
  },

  // Create hospital (admin only)
  createHospital: async (hospitalData) => {
    return apiRequest('/admin/system-settings/hospitals', {
      method: 'POST',
      body: JSON.stringify(hospitalData),
    });
  },

  // Update hospital (admin only)
  updateHospital: async (id, hospitalData) => {
    return apiRequest(`/admin/system-settings/hospitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hospitalData),
    });
  },

  // Create insurance provider (admin only)
  createInsuranceProvider: async (insuranceData) => {
    return apiRequest('/admin/system-settings/insurance', {
      method: 'POST',
      body: JSON.stringify(insuranceData),
    });
  },

  // Update insurance provider (admin only)
  updateInsuranceProvider: async (id, insuranceData) => {
    return apiRequest(`/admin/system-settings/insurance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(insuranceData),
    });
  },

  // Create medical condition (admin only)
  createMedicalCondition: async (conditionData) => {
    return apiRequest('/admin/system-settings/conditions', {
      method: 'POST',
      body: JSON.stringify(conditionData),
    });
  },

  // Update medical condition (admin only)
  updateMedicalCondition: async (id, conditionData) => {
    return apiRequest(`/admin/system-settings/conditions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(conditionData),
    });
  },

  // Delete hospital (admin only)
  deleteHospital: async (id) => {
    return apiRequest(`/admin/system-settings/hospitals/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmation: true }),
    });
  },

  // Delete insurance provider (admin only)
  deleteInsuranceProvider: async (id) => {
    return apiRequest(`/admin/system-settings/insurance/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmation: true }),
    });
  },

  // Delete medical condition (admin only)
  deleteMedicalCondition: async (id) => {
    return apiRequest(`/admin/system-settings/conditions/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmation: true }),
    });
  },
};

// ============================================
// SMS ENDPOINTS
// ============================================

export const smsAPI = {
  // Send SMS
  sendSMS: async (smsData) => {
    return apiRequest('/sms/webhook', {
      method: 'POST',
      body: JSON.stringify(smsData),
    });
  },
};

export default {
  authAPI,
  doctorsAPI,
  appointmentsAPI,
  patientRecordsAPI,
  queueAPI,
  notificationsAPI,
  systemSettingsAPI,
  smsAPI,
};
