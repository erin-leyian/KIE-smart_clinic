import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Video, MessageSquare, CheckCircle, Calendar, ChevronDown, AlertCircle, RotateCcw, Edit2, Save, X, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import { appointmentsAPI } from '../../services/api';
import { getIconComponent, getSpecialtyBgColor } from '../../utils/medicalIcons';
import { formatErrorMessage } from '../../utils/errorHandler';
import { notifyAppointmentConfirmed, notifyAppointmentCancelled, notifyAppointmentRescheduled } from '../../utils/notificationManager';

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const toUiStatus = (status) => {
    const statusMap = {
      scheduled: 'Scheduled',
      completed: 'Completed',
      cancelled: 'Cancelled',
      'no-show': 'No-Show',
      Confirmed: 'Confirmed',
      Pending: 'Pending',
      Completed: 'Completed',
      Cancelled: 'Cancelled',
      Scheduled: 'Scheduled',
    };

    return statusMap[status] || status || 'Scheduled';
  };

  const toApiStatus = (status) => {
    const statusMap = {
      Confirmed: 'scheduled',
      Pending: 'scheduled',
      Scheduled: 'scheduled',
      Completed: 'completed',
      Cancelled: 'cancelled',
      'No-Show': 'no-show',
    };

    return statusMap[status] || status?.toLowerCase() || 'scheduled';
  };

  const normalizeDateInput = (value) => {
    if (!value) return '';
    const trimmed = String(value).trim();
    const exactDate = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (exactDate) return trimmed;

    const isoDateTime = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
    if (isoDateTime) return isoDateTime[1];

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return '';

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeTimeInput = (value) => {
    if (!value) return '';
    const trimmed = String(value).trim();

    const strict = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (strict) return `${strict[1]}:${strict[2]}`;

    const loose = trimmed.match(/([01]?\d|2[0-3]):([0-5]\d)\s*(AM|PM)?/i);
    if (!loose) return '';

    let hours = Number(loose[1]);
    const minutes = loose[2];
    const meridiem = (loose[3] || '').toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const isFutureAppointmentDate = (dateValue) => {
    if (!dateValue) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(target.getTime())) return false;

    return target > today;
  };

  const normalizeAppointment = (apt = {}) => {
    const appointmentDate = apt.appointmentDate || apt.appointment_date || apt.date || '';
    const appointmentTime = apt.appointmentTime || apt.appointment_time || apt.time || '';
    const parsedDate = appointmentDate ? new Date(appointmentDate) : null;

    return {
      ...apt,
      doctorId: apt.doctorId || apt.doctor_id,
      patientId: apt.patientId || apt.patient_id,
      date: appointmentDate,
      time: appointmentTime,
      dateObj: parsedDate,
      specialty: apt.specialty || apt.type || 'General',
      type: apt.type || 'Consultation',
      fee: apt.fee || 'N/A',
      hospital: apt.hospital || '',
      status: toUiStatus(apt.status),
      apiStatus: apt.status,
    };
  };

  const loadAppointments = async (statusFilter = filterStatus) => {
    setLoading(true);
    setError('');

    const storedUser = localStorage.getItem('user');
    let user = null;
    if (storedUser) {
      user = JSON.parse(storedUser);
      setCurrentUser(user);
      setUserRole(user.role || 'patient');
    }

    const response = await appointmentsAPI.getAllAppointments({
      status: statusFilter !== 'ALL' ? toApiStatus(statusFilter) : undefined,
    });

    const normalizedAppointments = (response.data || []).map(normalizeAppointment);
    setAppointments(normalizedAppointments);
    setLoading(false);
  };

  // Load appointments data with error handling
  useEffect(() => {
    const runLoad = async () => {
      try {
        await loadAppointments(filterStatus);
      } catch (err) {
        const errorMessage = formatErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
      }
    };

    runLoad();
  }, [filterStatus]);

  // Create sample notifications on first load
  useEffect(() => {
    const hasSeenSampleNotifications = localStorage.getItem('sampleNotificationsShown');
    
    if (!hasSeenSampleNotifications && appointments.length > 0) {
      // Add a sample notification when user first views appointments
      const upcomingAppointment = appointments.find(apt => apt.status === 'Confirmed');
      if (upcomingAppointment) {
        notifyAppointmentConfirmed(upcomingAppointment);
        localStorage.setItem('sampleNotificationsShown', 'true');
      }
    }
  }, [appointments]);

  // Retry loading appointments
  const handleRetryLoadData = async () => {
    try {
      await loadAppointments(filterStatus);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Filter appointments - patients see only their own, doctors see their appointments
  const filteredAppointments = appointments.filter(apt => {
    // If patient, show only their appointments
    if (userRole === 'patient' && currentUser) {
      const isPatientAppointment = apt.patientId === currentUser.id;
      if (!isPatientAppointment) return false;
    }
    
    // If doctor, show only their appointments
    if (userRole === 'doctor' && currentUser) {
      const isDoctorAppointment = apt.doctorId === currentUser.id;
      if (!isDoctorAppointment) return false;
    }
    
    // Apply status filter
    if (filterStatus === 'ALL') return true;
    return apt.status === filterStatus;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.dateObj || a.date) - new Date(b.dateObj || b.date);
    } else if (sortBy === 'doctor') {
      return a.doctorName.localeCompare(b.doctorName);
    }
    return 0;
  });

  const openAppointmentDetails = async (apt) => {
    const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

    if (!isUuid(apt?.id)) {
      setSelectedAppointment(apt);
      setNotes(apt?.notes || '');
      setIsEditingNotes(false);
      setAppointmentModal(true);
      return;
    }

    try {
      const response = await appointmentsAPI.getAppointmentById(apt.id);
      const fullAppointment = normalizeAppointment(response?.appointment || response?.data || apt);
      setSelectedAppointment(fullAppointment);
      setNotes(fullAppointment.notes || '');
      setIsEditingNotes(false);
      setAppointmentModal(true);
    } catch {
      setSelectedAppointment(apt);
      setNotes(apt.notes || '');
      setIsEditingNotes(false);
      setAppointmentModal(true);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment || ['Confirmed', 'Scheduled'].includes(selectedAppointment.status)) return;

    try {
      const response = await appointmentsAPI.updateAppointment(selectedAppointment.id, {
        status: 'scheduled',
      });

      const updated = normalizeAppointment(response?.appointment || response?.data || { ...selectedAppointment, status: 'scheduled' });
      notifyAppointmentConfirmed(updated);

      await loadAppointments(filterStatus);
      setSelectedAppointment(updated);
    } catch (err) {
      alert(`Failed to confirm appointment: ${formatErrorMessage(err)}`);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || selectedAppointment.status === 'Cancelled') return;

    try {
      const response = await appointmentsAPI.updateAppointment(selectedAppointment.id, {
        status: 'cancelled',
      });

      const updated = normalizeAppointment(response?.appointment || response?.data || { ...selectedAppointment, status: 'cancelled' });
      notifyAppointmentCancelled(updated);

      await loadAppointments(filterStatus);
      setAppointmentModal(false);
      setSelectedAppointment(updated);
    } catch (err) {
      alert(`Failed to cancel appointment: ${formatErrorMessage(err)}`);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment) return;

    const rawDate = window.prompt('Enter new date (YYYY-MM-DD):', selectedAppointment.date || '');
    const rawTime = window.prompt('Enter new time (HH:MM):', selectedAppointment.time || '');

    if (!rawDate || !rawTime) return;

    const newDate = normalizeDateInput(rawDate);
    const newTime = normalizeTimeInput(rawTime);

    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      alert('Please enter a valid date in YYYY-MM-DD format.');
      return;
    }

    if (!isFutureAppointmentDate(newDate)) {
      alert('Please choose a future appointment date.');
      return;
    }

    if (!newTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(newTime)) {
      alert('Please enter a valid time in HH:MM format (24-hour).');
      return;
    }

    const safeReason = String(selectedAppointment.reason || '').trim();
    const payload = {
      appointmentDate: newDate,
      appointmentTime: newTime,
      status: 'scheduled',
      reason: safeReason.length >= 5 ? safeReason : 'Appointment rescheduled by patient',
    };

    try {
      const response = await appointmentsAPI.updateAppointment(selectedAppointment.id, payload);

      const updated = normalizeAppointment(response?.appointment || response?.data || {
        ...selectedAppointment,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: 'scheduled',
      });

      notifyAppointmentRescheduled({
        ...updated,
        newDate,
        newTime,
      });

      await loadAppointments(filterStatus);
      setSelectedAppointment(updated);
    } catch (err) {
      alert(`Failed to reschedule appointment: ${formatErrorMessage(err)}`);
    }
  };

  // Save appointment notes (doctor only)
  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await appointmentsAPI.updateAppointment(selectedAppointment.id, {
        notes,
      });

      const updated = normalizeAppointment(response?.appointment || response?.data || { ...selectedAppointment, notes });
      await loadAppointments(filterStatus);
      setSelectedAppointment(updated);
      setIsEditingNotes(false);
    } catch (err) {
      alert(`Failed to save notes: ${formatErrorMessage(err)}`);
    }
  };

  const handleEditClick = (e, appointment) => {
    e.stopPropagation();
    setEditingAppointment(appointment);
    setEditFormData({ ...appointment });
    setEditModal(true);
  };

  // UPDATE: Handle appointment update via API
  const handleSaveEdit = async () => {
    if (!editFormData.patientName || !editFormData.doctorName || !editFormData.date) {
      alert('Please fill in required fields');
      return;
    }

    try {
      // Call API to update appointment
      const response = await appointmentsAPI.updateAppointment(editFormData.id, {
        appointmentDate: editFormData.date,
        appointmentTime: editFormData.time,
        status: toApiStatus(editFormData.status),
        notes: editFormData.notes,
        type: editFormData.type,
        reason: editFormData.reason,
      });

      const updated = normalizeAppointment(response?.appointment || response?.data || editFormData);
      setAppointments((prev) => prev.map((apt) => apt.id === editFormData.id ? updated : apt));
      
      // Close modal and show success
      setEditModal(false);
      setEditingAppointment(null);
      await loadAppointments(filterStatus);
      alert('Appointment updated successfully!');
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      console.error('Error updating appointment:', err);
      alert(`Failed to update appointment: ${errorMessage}`);
    }
  };

  const handleDeleteClick = (e, appointment) => {
    e.stopPropagation();
    setAppointmentToDelete(appointment);
    setDeleteConfirmModal(true);
  };

  // DELETE: Handle appointment deletion via API
  const handleConfirmDelete = async () => {
    try {
      // Call API to delete appointment
      await appointmentsAPI.deleteAppointment(appointmentToDelete.id);

      // Update local state
      const updated = appointments.filter(apt => apt.id !== appointmentToDelete.id);
      setAppointments(updated);
      
      // Close modal and show success
      setDeleteConfirmModal(false);
      setAppointmentToDelete(null);
      alert('Appointment deleted successfully!');
      await loadAppointments(filterStatus);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      console.error('Error deleting appointment:', err);
      alert(`Failed to delete appointment: ${errorMessage}`);
    }
  };

  const getConsultationTypeIcon = (type) => {
    if (type === 'Video Call') return <Video className="w-4 h-4" />;
    if (type === 'Phone Call') return <Phone className="w-4 h-4" />;
    if (type === 'Text Message') return <MessageSquare className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    if (status === 'Confirmed') return 'bg-green-50 border-green-200 text-green-700';
    if (status === 'Scheduled') return 'bg-purple-50 border-purple-200 text-purple-700';
    if (status === 'Pending') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    if (status === 'Completed') return 'bg-blue-50 border-blue-200 text-blue-700';
    if (status === 'Cancelled') return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <DashboardLayout title="All Appointments">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Appointments</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetryLoadData}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            title="Retry loading appointments"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Filter and Sort Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="flex gap-2 flex-wrap">
                {['ALL', 'Confirmed', 'Scheduled', 'Pending', 'Completed', 'Cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      filterStatus === status
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="date">Date</option>
                <option value="doctor">Doctor Name</option>
              </select>
            </div>

            {/* Results */}
            <div className="flex items-end">
              <p className="text-gray-600 text-sm">
                <span className="font-bold text-lg text-teal-600">{sortedAppointments.length}</span> appointment{sortedAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {sortedAppointments.length > 0 ? (
          <div className="space-y-4">
            {sortedAppointments.map(apt => {
              const bgColor = getSpecialtyBgColor(apt.specialty);
              const IconComponent = getIconComponent(apt.specialty);
              return (
                <div
                  key={apt.id}
                  onClick={() => openAppointmentDetails(apt)}
                  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Doctor Icon */}
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}>
                        <IconComponent className="w-7 h-7 text-gray-700" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition">
                          {apt.doctorName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">{apt.specialty}</p>

                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                            {apt.date}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                            {apt.time}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            {getConsultationTypeIcon(apt.type)}
                            <span className="ml-1.5">{apt.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status, Fee and Actions */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                      <div className="text-right mb-2">
                        <p className="text-xs text-gray-600">Fee</p>
                        <p className="font-bold text-teal-600">{apt.fee}</p>
                      </div>
                      {userRole === 'admin' && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => handleEditClick(e, apt)}
                            className="p-1.5 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition"
                            title="Edit appointment"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, apt)}
                            className="p-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50 transition"
                            title="Delete appointment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No appointments found.</p>
            <p className="text-sm text-gray-500">Book an appointment to get started.</p>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={appointmentModal}
        onClose={() => setAppointmentModal(false)}
        title={`Appointment with ${selectedAppointment?.doctorName}`}
        size="md"
        actions={[
          ...(userRole === 'doctor' ? [
            {
              label: isEditingNotes ? 'Cancel Edit' : 'Close',
              onClick: () => {
                setIsEditingNotes(false);
                setAppointmentModal(false);
              },
              variant: 'secondary'
            },
            ...(isEditingNotes ? [
              {
                label: 'Save Notes',
                onClick: handleSaveNotes,
                variant: 'primary'
              }
            ] : [
              {
                label: 'Add Notes',
                onClick: () => setIsEditingNotes(true),
                variant: 'primary'
              }
            ])
          ] : ['Completed', 'Cancelled'].includes(selectedAppointment?.status) ? [
            {
              label: 'Close',
              onClick: () => setAppointmentModal(false),
              variant: 'primary'
            }
          ] : ['Confirmed', 'Scheduled'].includes(selectedAppointment?.status) ? [
            {
              label: 'Reschedule',
              onClick: handleRescheduleAppointment,
              variant: 'secondary'
            },
            {
              label: 'Cancel',
              onClick: handleCancelAppointment,
              variant: 'danger'
            }
          ] : [
            {
              label: 'Confirm',
              onClick: handleConfirmAppointment,
              variant: 'primary'
            },
            {
              label: 'Reschedule',
              onClick: handleRescheduleAppointment,
              variant: 'secondary'
            },
            {
              label: 'Cancel',
              onClick: handleCancelAppointment,
              variant: 'danger'
            }
          ])
        ]}
      >
        {selectedAppointment && (
          <div className="space-y-5">
            {/* Doctor Info */}
            <div className="flex items-start space-x-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                {(() => {
                  const IconComponent = getIconComponent(selectedAppointment.specialty);
                  return <IconComponent className="w-8 h-8 text-teal-600" />;
                })()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedAppointment.doctorName}</h3>
                <p className="text-teal-600 text-sm font-medium">{selectedAppointment.specialty}</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Date & Time</span>
                <span className="font-bold text-gray-900">{selectedAppointment.date} at {selectedAppointment.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Type</span>
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  {getConsultationTypeIcon(selectedAppointment.type)}
                  {selectedAppointment.type}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Fee</span>
                <span className="font-bold text-teal-600 text-lg">{selectedAppointment.fee}</span>
              </div>
              {selectedAppointment.hospital && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Location</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {selectedAppointment.hospital}
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Status</p>
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(selectedAppointment.status)}`}>
                {selectedAppointment.status}
              </span>
            </div>

            {/* Notes */}
            {userRole === 'doctor' ? (
              <div className={`${isEditingNotes ? 'border-2 border-teal-500' : 'border border-gray-200'} p-4 rounded-lg`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Appointment Notes</p>
                  {!isEditingNotes && (
                    <Edit2 className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                {isEditingNotes ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about the appointment, diagnosis, treatment plan, etc."
                    className="w-full p-3 border border-teal-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    rows="4"
                  />
                ) : (
                  <p className={`text-sm ${notes ? 'text-gray-700' : 'text-gray-500 italic'}`}>
                    {notes || 'No notes added yet. Click "Add Notes" to add information.'}
                  </p>
                )}
              </div>
            ) : selectedAppointment.notes && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-2">Doctor's Notes</p>
                <p className="text-sm text-blue-900">{selectedAppointment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Appointment Modal */}
      {editModal && editingAppointment && (
        <Modal
          isOpen={editModal}
          onClose={() => {
            setEditModal(false);
            setEditingAppointment(null);
          }}
          title="Edit Appointment"
          size="md"
          actions={[
            {
              label: 'Save Changes',
              onClick: handleSaveEdit,
              variant: 'primary'
            },
            {
              label: 'Cancel',
              onClick: () => {
                setEditModal(false);
                setEditingAppointment(null);
              },
              variant: 'secondary'
            }
          ]}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
              <input
                type="text"
                value={editFormData.patientName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, patientName: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name *</label>
              <input
                type="text"
                value={editFormData.doctorName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, doctorName: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={editFormData.date || ''}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={editFormData.time || ''}
                onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={editFormData.status || 'Pending'}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option>Confirmed</option>
                <option>Scheduled</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                rows="3"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && appointmentToDelete && (
        <Modal
          isOpen={deleteConfirmModal}
          onClose={() => {
            setDeleteConfirmModal(false);
            setAppointmentToDelete(null);
          }}
          title="Delete Appointment"
          size="sm"
          actions={[
            {
              label: 'Delete',
              onClick: handleConfirmDelete,
              variant: 'danger'
            },
            {
              label: 'Cancel',
              onClick: () => {
                setDeleteConfirmModal(false);
                setAppointmentToDelete(null);
              },
              variant: 'secondary'
            }
          ]}
        >
          <div className="text-center py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the appointment with <strong>{appointmentToDelete.doctorName}</strong> on <strong>{appointmentToDelete.date}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
