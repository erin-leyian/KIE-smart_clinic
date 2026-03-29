import React, { useState, useEffect } from 'react';
import {
  Clock, MapPin, Phone, Video, MessageSquare, CheckCircle, Calendar,
  ChevronDown, AlertCircle, RotateCcw, Edit2, Save, X, FileText, User, List, Grid3x3
} from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import mockData from '../../data/mockData.json';
import { getIconComponent, getSpecialtyBgColor } from '../../utils/medicalIcons';
import { formatErrorMessage } from '../../utils/errorHandler';
import { notifyAppointmentConfirmed, notifyAppointmentCancelled, notifyAppointmentRescheduled } from '../../utils/notificationManager';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
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
  const [treatmentHistory, setTreatmentHistory] = useState({});
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

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
        if (!mockData.appointments || !Array.isArray(mockData.appointments)) {
          throw new Error('No appointments found. Please try again.');
        }

        setAppointments(mockData.appointments);
        
        // Group treatment history by patient
        const history = {};
        mockData.appointments
          .filter(apt => apt.status === 'Completed')
          .forEach(apt => {
            if (!history[apt.patientId]) {
              history[apt.patientId] = [];
            }
            history[apt.patientId].push(apt);
          });
        setTreatmentHistory(history);
        setLoading(false);
      } catch (err) {
        const errorMessage = formatErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // Retry loading appointments
  const handleRetryLoadData = async () => {
    try {
      setLoading(true);
      setError('');

      await new Promise(resolve => setTimeout(resolve, 600));

      if (!mockData.appointments || !Array.isArray(mockData.appointments)) {
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

  // Filter appointments - doctors see only their appointments
  const filteredAppointments = appointments.filter(apt => {
    // If doctor, show only their appointments
    if (userRole === 'doctor' && currentUser) {
      const isDoctorAppointment = apt.doctorName === currentUser.name;
      if (!isDoctorAppointment) return false;
    }

    // Apply status filter
    if (filterStatus === 'All') return true;
    if (filterStatus === 'History') return apt.status === 'Completed';
    if (filterStatus === 'Upcoming') return apt.status !== 'Completed' && apt.status !== 'Cancelled';
    return apt.status === filterStatus;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.dateObj) - new Date(b.dateObj);
    } else if (sortBy === 'patient') {
      return a.patientName.localeCompare(b.patientName);
    }
    return 0;
  });

  // Group by patient
  const groupedByPatient = sortedAppointments.reduce((acc, apt) => {
    if (!acc[apt.patientId]) {
      acc[apt.patientId] = { patientName: apt.patientName, appointments: [] };
    }
    acc[apt.patientId].appointments.push(apt);
    return acc;
  }, {});

  const openAppointmentDetails = (apt) => {
    setSelectedAppointment(apt);
    setNotes(apt.notes || '');
    setIsEditingNotes(false);
    setAppointmentModal(true);
  };

  const handleConfirmAppointment = () => {
    if (selectedAppointment && selectedAppointment.status !== 'Confirmed') {
      notifyAppointmentConfirmed(selectedAppointment);
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
    <DashboardLayout title="My Appointments">
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
                {['All', 'Upcoming', 'History', 'Confirmed', 'Pending', 'Completed'].map(status => (
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
                <option value="patient">Patient Name</option>
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

        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-teal-500 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-teal-500 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Calendar View
          </button>
        </div>

        {viewMode === 'list' ? (
          <>
        {/* Appointments List - Grouped by Patient */}
        {Object.keys(groupedByPatient).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedByPatient).map(([patientId, { patientName, appointments: patientApts }]) => (
              <div key={patientId} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                {/* Patient Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{patientName}</h3>
                      <p className="text-sm text-gray-600">{patientApts.length} appointment(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPatientId(patientId);
                      setShowRecordsModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    title="View/Edit Patient Records"
                  >
                    <FileText className="w-4 h-4" />
                    Records
                  </button>
                </div>

                {/* Patient Appointments */}
                <div className="space-y-3">
                  {patientApts.map(apt => (
                    <div
                      key={apt.id}
                      onClick={() => openAppointmentDetails(apt)}
                      className="border rounded-lg p-4 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer bg-gray-50 hover:bg-teal-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">{apt.date}</span>
                            <Clock className="w-4 h-4 text-gray-400 ml-2" />
                            <span className="text-sm text-gray-600">{apt.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {getConsultationTypeIcon(apt.type)}
                            <span className="text-sm text-gray-600">{apt.type}</span>
                            {apt.hospital && (
                              <>
                                <MapPin className="w-4 h-4 text-gray-400 ml-2" />
                                <span className="text-sm text-gray-600">{apt.hospital}</span>
                              </>
                            )}
                          </div>
                          {apt.notes && (
                            <div className="mt-2 text-sm text-gray-600 italic">
                              Notes: {apt.notes.substring(0, 60)}...
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                          {apt.fee && <p className="text-sm font-semibold text-teal-600">{apt.fee}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No appointments found.</p>
            <p className="text-sm text-gray-500">Check back later for appointments.</p>
          </div>
        )}
          </>
        ) : (
          // Calendar Grid View
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 font-medium text-sm transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600 -rotate-90" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const days = [];

                  // Empty cells for days before month starts
                  for (let i = 0; i < firstDay; i++) {
                    days.push(null);
                  }

                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    days.push(day);
                  }

                  return days.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayAppointments = sortedAppointments.filter(apt => apt.dateObj === dateStr);
                    const isToday = day === new Date().getDate() && 
                                   month === new Date().getMonth() && 
                                   year === new Date().getFullYear();

                    return (
                      <div
                        key={day}
                        className={`aspect-square p-2 rounded-lg border-2 overflow-hidden flex flex-col ${
                          isToday
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 bg-white hover:border-teal-200'
                        }`}
                      >
                        <div className={`text-sm font-bold mb-1 ${isToday ? 'text-teal-600' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1">
                          {dayAppointments.slice(0, 3).map(apt => (
                            <button
                              key={apt.id}
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setNotes(apt.notes || '');
                                setAppointmentModal(true);
                              }}
                              className={`w-full text-left px-1.5 py-1 rounded text-xs font-medium truncate text-white hover:shadow transition-shadow ${
                                apt.status === 'Confirmed'
                                  ? 'bg-green-500'
                                  : apt.status === 'Pending'
                                  ? 'bg-yellow-500'
                                  : apt.status === 'Completed'
                                  ? 'bg-blue-500'
                                  : 'bg-gray-500'
                              }`}
                              title={apt.patientName}
                            >
                              {apt.patientName.split(' ')[0]}
                            </button>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className="text-xs text-gray-500 px-1">
                              +{dayAppointments.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={appointmentModal}
        onClose={() => {
          setAppointmentModal(false);
          setIsEditingNotes(false);
        }}
        title={`Appointment with ${selectedAppointment?.patientName}`}
        size="md"
        actions={[
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
            {/* Appointment Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Patient</span>
                <span className="font-bold text-gray-900">{selectedAppointment.patientName}</span>
              </div>
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
                  placeholder="Add treatment notes, diagnosis, recommendations, etc."
                  className="w-full p-3 border border-teal-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  rows="4"
                />
              ) : (
                <p className={`text-sm ${notes ? 'text-gray-700' : 'text-gray-500 italic'}`}>
                  {notes || 'No notes added yet. Click "Add Notes" to record treatment information.'}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
