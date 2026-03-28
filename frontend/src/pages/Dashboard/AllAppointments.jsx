import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Video, MessageSquare, CheckCircle, Calendar, ChevronDown, AlertCircle, RotateCcw, Edit2, Save, X } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import mockData from '../../data/mockData.json';
import { getIconComponent, getSpecialtyBgColor } from '../../utils/medicalIcons';
import { formatErrorMessage } from '../../utils/errorHandler';
import { notifyAppointmentConfirmed, notifyAppointmentCancelled, notifyAppointmentRescheduled } from '../../utils/notificationManager';

export default function AllAppointments() {
  const [appointments, setAppointments] = useState(mockData.appointments || []);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Load appointments data with error handling
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setUserRole(user.role || 'patient');
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Validate data
        if (!mockData.appointments || !Array.isArray(mockData.appointments) || mockData.appointments.length === 0) {
          throw new Error('No appointments found. Please try again.');
        }
        
        setAppointments(mockData.appointments);
        setLoading(false);
      } catch (err) {
        const errorMessage = formatErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, []);

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
      setLoading(true);
      setError('');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Validate data
      if (!mockData.appointments || !Array.isArray(mockData.appointments) || mockData.appointments.length === 0) {
        throw new Error('No appointments found. Please try again.');
      }
      
      setAppointments(mockData.appointments);
      setLoading(false);
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
      const isPatientAppointment = apt.patientName === currentUser.name || apt.patientId === currentUser.id;
      if (!isPatientAppointment) return false;
    }
    
    // If doctor, show only their appointments
    if (userRole === 'doctor' && currentUser) {
      const isDoctorAppointment = apt.doctorName === currentUser.name;
      if (!isDoctorAppointment) return false;
    }
    
    // Apply status filter
    if (filterStatus === 'All') return true;
    return apt.status === filterStatus;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'doctor') {
      return a.doctorName.localeCompare(b.doctorName);
    }
    return 0;
  });

  const openAppointmentDetails = (apt) => {
    setSelectedAppointment(apt);
    setNotes(apt.notes || '');
    setIsEditingNotes(false);
    setAppointmentModal(true);
  };

  const handleConfirmAppointment = () => {
    if (selectedAppointment && selectedAppointment.status !== 'Confirmed') {
      notifyAppointmentConfirmed(selectedAppointment);
      // Update appointment status
      const updated = appointments.map(apt =>
        apt.id === selectedAppointment.id ? { ...apt, status: 'Confirmed' } : apt
      );
      setAppointments(updated);
      setSelectedAppointment({ ...selectedAppointment, status: 'Confirmed' });
    }
  };

  const handleCancelAppointment = () => {
    if (selectedAppointment && selectedAppointment.status !== 'Cancelled') {
      notifyAppointmentCancelled(selectedAppointment);
      // Update appointment status
      const updated = appointments.map(apt =>
        apt.id === selectedAppointment.id ? { ...apt, status: 'Cancelled' } : apt
      );
      setAppointments(updated);
      setAppointmentModal(false);
    }
  };

  const handleRescheduleAppointment = () => {
    if (selectedAppointment) {
      const newDate = window.prompt('Enter new date (e.g., Tomorrow):');
      const newTime = window.prompt('Enter new time (e.g., 10:00 - 10:30):');
      
      if (newDate && newTime) {
        notifyAppointmentRescheduled({
          ...selectedAppointment,
          newDate,
          newTime,
        });
        // Update appointment
        const updated = appointments.map(apt =>
          apt.id === selectedAppointment.id 
            ? { ...apt, date: newDate, time: newTime, status: 'Confirmed' } 
            : apt
        );
        setAppointments(updated);
        setSelectedAppointment({ ...selectedAppointment, date: newDate, time: newTime, status: 'Confirmed' });
      }
    }
  };

  // Save appointment notes (doctor only)
  const handleSaveNotes = () => {
    if (selectedAppointment) {
      const updated = appointments.map(apt =>
        apt.id === selectedAppointment.id 
          ? { ...apt, notes } 
          : apt
      );
      setAppointments(updated);
      setSelectedAppointment({ ...selectedAppointment, notes });
      setIsEditingNotes(false);
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
    if (status === 'Pending') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    if (status === 'Completed') return 'bg-blue-50 border-blue-200 text-blue-700';
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
                {['All', 'Confirmed', 'Pending', 'Completed'].map(status => (
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

                    {/* Status and Fee */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Fee</p>
                        <p className="font-bold text-teal-600">{apt.fee}</p>
                      </div>
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
          ] : selectedAppointment?.status === 'Completed' ? [
            {
              label: 'Close',
              onClick: () => setAppointmentModal(false),
              variant: 'primary'
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
    </DashboardLayout>
  );
}
