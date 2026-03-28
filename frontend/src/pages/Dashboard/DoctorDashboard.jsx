import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import { ChevronRight, ChevronLeft, Calendar, Users, FileText, Clock, MapPin, CheckCircle, AlertCircle, X, Eye } from 'lucide-react';
import mockData from '../../data/mockData.json';
import { getCurrentUser, getUserRole } from '../../utils/dataAccessControl';
import { getIconComponent, getSpecialtyBgColor } from '../../utils/medicalIcons';
import { notificationManager } from '../../utils/notificationManager';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('doctor');
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(3); // March (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [availability, setAvailability] = useState({
    locations: [
      { name: 'Kigali Central', times: ['9:00-17:00'], slots: [] },
      { name: 'Online', times: ['9:00-17:00'], slots: [] }
    ]
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecordsModal, setPatientRecordsModal] = useState(false);
  const [availabilityModal, setAvailabilityModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingAvailability, setEditingAvailability] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(storedUser);
    const role = localStorage.getItem('userRole') || 'doctor';
    
    // Check if user is a doctor
    if (userData.role !== 'doctor') {
      navigate('/dashboard');
      return;
    }

    setUser(userData);
    setUserRole(role);

    // Get doctor's appointments
    const docAppointments = mockData.appointments.filter(
      apt => apt.doctorName === userData.name
    );
    setDoctorAppointments(docAppointments);

    // Get unique patients assigned to this doctor
    const patientIds = new Set(docAppointments.map(apt => apt.patientId));
    const patients = mockData.users.filter(u => patientIds.has(u.id));
    setAssignedPatients(patients);

    // Load or initialize doctor's availability
    const doctorAvail = mockData.doctorAvailability?.find(
      da => da.doctorId === userData.id || da.doctorName === userData.name
    );

    if (doctorAvail) {
      setAvailability(doctorAvail);
    }

    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
    setLoading(false);
  }, [navigate]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (day) => {
    const dateStr = `2026-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return doctorAppointments.filter(apt => apt.dateObj === dateStr);
  };

  // Handle appointment confirmation
  const handleConfirmAppointment = (appointment) => {
    if (appointment.status === 'Pending') {
      // Create confirmation notification for doctor
      notificationManager.createNotification({
        type: 'Confirmed',
        title: `Appointment Confirmed`,
        message: `You have confirmed appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.time}`,
        appointmentId: appointment.id,
        relatedTo: user.id,
        relatedName: user.name
      });

      // Update appointment status
      const updatedAppointments = doctorAppointments.map(apt =>
        apt.id === appointment.id ? { ...apt, status: 'Confirmed' } : apt
      );
      setDoctorAppointments(updatedAppointments);
      setAppointmentModal(false);
    }
  };

  // Handle appointment decline
  const handleDeclineAppointment = (appointment) => {
    notificationManager.createNotification({
      type: 'Cancelled',
      title: `Appointment Declined`,
      message: `You declined appointment with ${appointment.patientName} on ${appointment.date}`,
      appointmentId: appointment.id,
      relatedTo: user.id,
      relatedName: user.name
    });

    const updatedAppointments = doctorAppointments.filter(apt => apt.id !== appointment.id);
    setDoctorAppointments(updatedAppointments);
    setAppointmentModal(false);
  };

  // Handle reschedule
  const handleRescheduleAppointment = (appointment) => {
    notificationManager.createNotification({
      type: 'Rescheduled',
      title: `Appointment Rescheduled`,
      message: `You have rescheduled appointment with ${appointment.patientName}`,
      appointmentId: appointment.id,
      relatedTo: user.id,
      relatedName: user.name
    });
    setAppointmentModal(false);
  };

  // Update availability
  const handleUpdateAvailability = (newAvailability) => {
    setAvailability(newAvailability);
    setAvailabilityModal(false);
    
    notificationManager.createNotification({
      type: 'Updated',
      title: 'Availability Updated',
      message: 'Your availability has been updated successfully',
      relatedTo: user.id,
      relatedName: user.name
    });
  };

  // Get patient records
  const getPatientRecords = (patientId) => {
    return mockData.patientRecords?.filter(record => record.patientId === patientId) || [];
  };

  const renderCalendarWithAppointments = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 p-2 rounded-lg"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppointments = getAppointmentsForDate(day);
      const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`border rounded-lg p-3 min-h-28 cursor-pointer hover:shadow-lg transition-all ${
            isToday ? 'bg-teal-50 border-teal-500' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className={`text-sm font-bold mb-2 ${isToday ? 'text-teal-600' : 'text-gray-700'}`}>
            {day}
          </div>
          
          {dayAppointments.map(apt => (
            <div
              key={apt.id}
              onClick={() => {
                setSelectedAppointment(apt);
                setAppointmentModal(true);
              }}
              className={`text-xs p-1 rounded mb-1 cursor-pointer hover:shadow-md transition ${
                apt.status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-700 border-l-2 border-yellow-500'
                  : apt.status === 'Confirmed'
                  ? 'bg-green-100 text-green-700 border-l-2 border-green-500'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium truncate">{apt.patientName}</div>
              <div className="text-[10px]">{apt.time}</div>
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <DashboardLayout title="Doctor Dashboard">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Doctor Dashboard">
      {!user || user.role !== 'doctor' ? (
        <div className="text-center py-12 text-red-500">Access denied. This page is for doctors only.</div>
      ) : (
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
            <p className="text-teal-100">Manage your appointments, patients, and availability</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Appointments & Patients */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Appointments */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Pending Confirmations
                  </h2>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    {doctorAppointments.filter(a => a.status === 'Pending').length}
                  </span>
                </div>

                {doctorAppointments.filter(a => a.status === 'Pending').length > 0 ? (
                  <div className="space-y-3">
                    {doctorAppointments.filter(a => a.status === 'Pending').map(apt => (
                      <div
                        key={apt.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-yellow-50 border-yellow-200"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setAppointmentModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{apt.patientName}</h3>
                            <p className="text-sm text-gray-600 mt-1">{apt.specialty} • {apt.date} at {apt.time}</p>
                            <p className="text-sm text-gray-600">{apt.hospital}</p>
                            <p className="text-sm font-medium text-teal-600 mt-2">{apt.fee}</p>
                          </div>
                          <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                            PENDING
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No pending appointments</p>
                )}
              </div>

              {/* Confirmed Appointments */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Confirmed Appointments
                  </h2>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {doctorAppointments.filter(a => a.status === 'Confirmed').length}
                  </span>
                </div>

                {doctorAppointments.filter(a => a.status === 'Confirmed').length > 0 ? (
                  <div className="space-y-3">
                    {doctorAppointments.filter(a => a.status === 'Confirmed').map(apt => (
                      <div
                        key={apt.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-green-50 border-green-200"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setAppointmentModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{apt.patientName}</h3>
                            <p className="text-sm text-gray-600 mt-1">{apt.specialty} • {apt.date} at {apt.time}</p>
                            <p className="text-sm text-gray-600">{apt.type}</p>
                          </div>
                          <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            CONFIRMED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No confirmed appointments</p>
                )}
              </div>

              {/* Assigned Patients */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    My Patients
                  </h2>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {assignedPatients.length}
                  </span>
                </div>

                {assignedPatients.length > 0 ? (
                  <div className="space-y-3">
                    {assignedPatients.map(patient => {
                      const patientAppointments = doctorAppointments.filter(a => a.patientId === patient.id);
                      return (
                        <div
                          key={patient.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-all bg-blue-50 border-blue-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800">{patient.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{patient.email}</p>
                              <p className="text-sm text-gray-600">{patientAppointments.length} appointments</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedPatient(patient);
                                setPatientRecordsModal(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Records
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No assigned patients yet</p>
                )}
              </div>
            </div>

            {/* Right Column - Calendar & Availability */}
            <div className="space-y-6">
              {/* Calendar with Appointments */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-500" />
                    Schedule
                  </h2>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <h3 className="text-center font-bold text-gray-800">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>

                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {dayNames.map(day => (
                    <div key={day} className="text-center font-bold text-gray-600 text-xs py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarWithAppointments()}
                </div>
              </div>

              {/* Availability Management */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-500" />
                    Availability
                  </h2>
                  <button
                    onClick={() => setAvailabilityModal(true)}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>

                {availability && availability.locations ? (
                  <div className="space-y-3">
                    {availability.locations.map((loc, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{loc.name}</h3>
                          <p className="text-sm text-gray-600">{loc.times.join(', ')}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {loc.slots && loc.slots.length > 0
                              ? `Available: ${loc.slots.join(', ')}`
                              : 'No slots set'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No availability set</p>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Detail Modal */}
          <Modal
            isOpen={appointmentModal}
            onClose={() => setAppointmentModal(false)}
            title={`Appointment: ${selectedAppointment?.patientName}`}
          >
            {selectedAppointment && (
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-bold text-gray-800">{selectedAppointment.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Appointment Date & Time</p>
                    <p className="font-bold text-gray-800">{selectedAppointment.date} at {selectedAppointment.time}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-bold text-gray-800">{selectedAppointment.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fee</p>
                      <p className="font-bold text-teal-600">{selectedAppointment.fee}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-bold text-gray-800">{selectedAppointment.hospital}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                </div>

                {/* Actions */}
                {selectedAppointment.status === 'Pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirmAppointment(selectedAppointment)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Confirm Appointment
                    </button>
                    <button
                      onClick={() => handleDeclineAppointment(selectedAppointment)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {selectedAppointment.status === 'Confirmed' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRescheduleAppointment(selectedAppointment)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleDeclineAppointment(selectedAppointment)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setAppointmentModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </Modal>

          {/* Patient Records Modal */}
          <Modal
            isOpen={patientRecordsModal}
            onClose={() => setPatientRecordsModal(false)}
            title={selectedPatient ? `${selectedPatient.name} - Medical Records` : 'Medical Records'}
          >
            {selectedPatient && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Medical Records</h4>
                  {getPatientRecords(selectedPatient.id).length > 0 ? (
                    <div className="space-y-3">
                      {getPatientRecords(selectedPatient.id).map(record => (
                        <div key={record.id} className="border rounded-lg p-3 hover:shadow-md transition">
                          <p className="font-semibold text-gray-800">{record.recordType}</p>
                          <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                          <p className="text-xs text-gray-500 mt-2">{record.date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-6">No medical records available</p>
                  )}
                </div>

                <button
                  onClick={() => setPatientRecordsModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </Modal>

          {/* Availability Modal */}
          <Modal
            isOpen={availabilityModal}
            onClose={() => setAvailabilityModal(false)}
            title="Edit My Availability"
          >
            <div className="space-y-6">
              {availability && availability.locations && (
                <div className="space-y-4">
                  {availability.locations.map((loc, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h4 className="font-bold text-gray-800 mb-3">{loc.name}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                          <input
                            type="text"
                            defaultValue={loc.times[0]}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="e.g., 9:00-17:00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                          <input
                            type="text"
                            defaultValue={loc.slots ? loc.slots.join(', ') : ''}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="e.g., 1, 8, 15, 22, 29"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateAvailability(availability)}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setAvailabilityModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </DashboardLayout>
  );
}
