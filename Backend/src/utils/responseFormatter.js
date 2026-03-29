/**
 * Response formatting utilities for API responses
 */

const sendSuccess = (res, data = null, message = null, statusCode = 200) => {
  const response = {
    status: 'success',
  };

  if (message) {
    response.message = message;
  }

  if (data) {
    // Handle different data structures
    if (data.data !== undefined) {
      response.data = data.data;
    } else if (data.user !== undefined) {
      response.user = data.user;
    } else if (data.doctor !== undefined) {
      response.doctor = data.doctor;
    } else if (data.appointment !== undefined) {
      response.appointment = data.appointment;
    } else if (data.record !== undefined) {
      response.record = data.record;
    } else if (data.queue !== undefined) {
      response.queue = data.queue;
    } else if (Array.isArray(data.data)) {
      response.data = data.data;
      if (data.pagination) {
        response.pagination = data.pagination;
      }
    } else {
      // For other objects, merge them
      Object.assign(response, data);
    }
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, message, statusCode = 400, details = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors,
  });
};

const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const buildPaginationResponse = (data, total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  };
};

const formatUserResponse = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    city: user.city,
    state: user.state,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const formatDoctorResponse = (user, specialization) => {
  if (!user) return null;

  const doctor = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  };

  if (specialization) {
    doctor.specialization = specialization.specialization;
    doctor.qualifications = specialization.qualifications;
    doctor.yearsOfExperience = specialization.yearsOfExperience;
    doctor.consultationFee = specialization.consultationFee;
    doctor.consultationDuration = specialization.consultationDuration;
    doctor.consultationEnabled = specialization.consultationEnabled;
    doctor.rating = specialization.rating;
    doctor.totalConsultations = specialization.totalConsultations;
    doctor.createdAt = specialization.createdAt;
  }

  return doctor;
};

const formatAppointmentResponse = (appointment, doctor = null, patient = null) => {
  if (!appointment) return null;

  // Handle doctor name from either direct object or from JOIN
  let doctorName = null;
  if (doctor) {
    doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  } else if (appointment.doctorFirstName && appointment.doctorLastName) {
    doctorName = `Dr. ${appointment.doctorFirstName} ${appointment.doctorLastName}`;
  }

  // Handle patient name from either direct object or from JOIN
  let patientName = null;
  if (patient) {
    patientName = `${patient.firstName} ${patient.lastName}`;
  } else if (appointment.patientFirstName && appointment.patientLastName) {
    patientName = `${appointment.patientFirstName} ${appointment.patientLastName}`;
  }

  return {
    id: appointment.id,
    doctorId: appointment.doctorId,
    doctorName,
    patientId: appointment.patientId,
    patientName,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    reason: appointment.reason,
    notes: appointment.notes,
    status: appointment.status,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
};

const formatPatientRecordResponse = (record, patient = null, doctor = null) => {
  if (!record) return null;

  return {
    id: record.id,
    patientId: record.patientId,
    patientName: patient ? `${patient.firstName} ${patient.lastName}` : null,
    doctorId: record.doctorId,
    doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : null,
    appointmentId: record.appointmentId,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    medication: record.medication,
    testResults: record.testResults,
    notes: record.notes,
    followUpDate: record.followUpDate,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

const formatQueueResponse = (queue) => {
  if (!queue) return null;

  return {
    id: queue.id,
    appointmentId: queue.appointmentId,
    patientId: queue.patientId,
    patientName: queue.patientName,
    patientPhone: queue.patientPhone,
    reason: queue.reason,
    status: queue.status,
    position: queue.position,
    estimatedWaitTime: queue.estimatedWaitTime,
    arrivedAt: queue.arrivedAt,
  };
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  getPaginationParams,
  buildPaginationResponse,
  formatUserResponse,
  formatDoctorResponse,
  formatAppointmentResponse,
  formatPatientRecordResponse,
  formatQueueResponse,
};
