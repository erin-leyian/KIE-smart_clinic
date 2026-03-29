import React, { useState, useEffect } from "react";
import Modal from '../../components/Modal';
import DashboardLayout from "../../components/Layout/DashboardLayout";
import mockData from "../../data/mockData.json";
import { AlertCircle, RotateCcw, ChevronLeft, ChevronRight, Clock, User, List, Grid3x3 } from 'lucide-react';
import { formatErrorMessage } from '../../utils/errorHandler';
import { getIconComponent, getSpecialtyBgColor } from '../../utils/medicalIcons';
import { getCurrentUser, getUserRole, getFilteredAppointments } from '../../utils/dataAccessControl';

export default function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 28)); // March 28, 2026
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ doctorName: '', date: '', time: '', specialty: 'General Practitioner' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'scheduler'

  // Load calendar data with error handling
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current user
        const user = getCurrentUser();
        const role = getUserRole();
        setCurrentUser(user);
        setUserRole(role);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Validate data
        if (!mockData.appointments || !Array.isArray(mockData.appointments)) {
          throw new Error('Calendar data is unavailable. Please try again.');
        }
        
        // Get filtered appointments based on user role
        const filtered = getFilteredAppointments(role, user);
        setAppointments(filtered);
        setLoading(false);
      } catch (err) {
        const errorMessage = formatErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    loadCalendarData();
  }, []);

  // Retry loading calendar data
  const handleRetryLoadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current user
      const user = getCurrentUser();
      const role = getUserRole();
      setCurrentUser(user);
      setUserRole(role);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate data
      if (!mockData.appointments || !Array.isArray(mockData.appointments)) {
        throw new Error('Calendar data is unavailable. Please try again.');
      }
      
      // Get filtered appointments based on user role
      const filtered = getFilteredAppointments(role, user);
      setAppointments(filtered);
      setLoading(false);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Calendar utilities
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateString = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAppointmentsForDate = (dateStr) => {
    return appointments.filter(apt => apt.dateObj === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const dateStr = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(dateStr);
  };

  const handleAddAppointment = () => {
    if (!newEvent.doctorName || !newEvent.date || !newEvent.time) return;
    
    const newApt = {
      id: Math.max(...appointments.map(a => a.id), 0) + 1,
      doctorName: newEvent.doctorName,
      specialty: newEvent.specialty,
      date: new Date(newEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      dateObj: newEvent.date,
      time: newEvent.time,
      status: 'Scheduled',
      notes: 'New appointment'
    };
    
    setAppointments([...appointments, newApt]);
    setNewEvent({ doctorName: '', date: '', time: '', specialty: 'General Practitioner' });
    setShowAddEvent(false);
  };

  const handleOpenAppointment = (apt) => {
    setSelectedAppointment(apt);
    setAppointmentModal(true);
  };

  return (
    <DashboardLayout title="Calendar">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Calendar</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetryLoadData}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            title="Retry loading calendar"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="mb-6 flex gap-2">
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
        <button
          onClick={() => setViewMode('scheduler')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'scheduler'
              ? 'bg-teal-500 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <List className="w-4 h-4" />
          Schedule List
        </button>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg font-medium text-sm hover:bg-teal-100 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
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

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayAppointments = getAppointmentsForDate(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-teal-500 text-white border-teal-600 shadow-md'
                      : isToday
                      ? 'bg-teal-50 border-teal-200 hover:bg-teal-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="h-full flex flex-col items-center justify-start">
                    <span className="font-semibold text-sm">{day}</span>
                    {dayAppointments.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {dayAppointments.slice(0, 2).map((apt, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-teal-500'
                            }`}
                          />
                        ))}
                        {dayAppointments.length > 2 && (
                          <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                            +{dayAppointments.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add Event Button */}
          <button
            onClick={() => setShowAddEvent(true)}
            className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            + Add Appointment
          </button>
        </div>

        {/* Sidebar: Selected Date Details & Upcoming */}
        <div className="space-y-6">
          {/* Selected Date Appointments */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).length > 0 ? (
                  getAppointmentsForDate(selectedDate).map(apt => (
                    <button
                      key={apt.id}
                      onClick={() => handleOpenAppointment(apt)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getSpecialtyBgColor(apt.specialty)}`}>
                          {React.createElement(getIconComponent(apt.specialty), { className: 'w-5 h-5 text-gray-700' })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 group-hover:text-teal-600">{apt.doctorName}</p>
                          <p className="text-xs text-gray-500">{apt.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{apt.time}</span>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          apt.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-4">No appointments scheduled</p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Upcoming</h3>
            <div className="space-y-3">
              {appointments
                .filter(apt => new Date(apt.dateObj) >= new Date())
                .sort((a, b) => new Date(a.dateObj) - new Date(b.dateObj))
                .slice(0, 5)
                .map(apt => (
                  <button
                    key={apt.id}
                    onClick={() => handleOpenAppointment(apt)}
                    className="w-full text-left p-3 bg-white rounded-lg border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${getSpecialtyBgColor(apt.specialty)}`}>
                        {React.createElement(getIconComponent(apt.specialty), { className: 'w-4 h-4 text-gray-700' })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm group-hover:text-teal-600">{apt.doctorName}</p>
                        <p className="text-xs text-gray-500">{apt.date}</p>
                        <p className="text-xs text-teal-600 font-medium mt-0.5">{apt.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              {appointments.filter(apt => new Date(apt.dateObj) >= new Date()).length === 0 && (
                <p className="text-sm text-gray-600 py-4">No upcoming appointments</p>
              )}
            </div>
          </div>
        </div>
      </div>
      ) : (
        // Scheduler/List View
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Appointments Schedule</h2>
          
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Time</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Doctor</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Specialty</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...appointments]
                    .sort((a, b) => new Date(a.dateObj) - new Date(b.dateObj))
                    .map(apt => (
                      <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-gray-800 font-medium">{apt.date}</td>
                        <td className="px-4 py-4 text-gray-700">{apt.time}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${getSpecialtyBgColor(apt.specialty)}`}>
                              {React.createElement(getIconComponent(apt.specialty), { className: 'w-4 h-4 text-gray-700' })}
                            </div>
                            <span className="text-gray-800">{apt.doctorName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-700">{apt.specialty}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            apt.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleOpenAppointment(apt)}
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded text-sm transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* Add Appointment Modal */}
      <Modal
        isOpen={showAddEvent}
        onClose={() => {
          setShowAddEvent(false);
          setNewEvent({ doctorName: '', date: '', time: '', specialty: 'General Practitioner' });
        }}
        title="Add Appointment"
        size="md"
        actions={[
          { label: 'Cancel', onClick: () => setShowAddEvent(false), variant: 'secondary' },
          { label: 'Add', onClick: handleAddAppointment, variant: 'primary' }
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
            <input
              type="text"
              value={newEvent.doctorName}
              onChange={e => setNewEvent(prev => ({ ...prev, doctorName: e.target.value }))}
              placeholder="Enter doctor name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select
              value={newEvent.specialty}
              onChange={e => setNewEvent(prev => ({ ...prev, specialty: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option>General Practitioner</option>
              <option>Cardiologist</option>
              <option>Pediatrician</option>
              <option>Surgeon</option>
              <option>Obstetrician</option>
              <option>Dermatologist</option>
              <option>Psychiatrist</option>
              <option>Orthopedist</option>
              <option>Ophthalmologist</option>
              <option>Gastroenterologist</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newEvent.date}
              onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={newEvent.time}
              onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={appointmentModal}
        onClose={() => setAppointmentModal(false)}
        title={selectedAppointment?.doctorName}
        size="md"
        actions={[
          { label: 'Close', onClick: () => setAppointmentModal(false), variant: 'secondary' }
        ]}
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getSpecialtyBgColor(selectedAppointment.specialty)}`}>
                  {React.createElement(getIconComponent(selectedAppointment.specialty), { className: 'w-6 h-6 text-gray-700' })}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{selectedAppointment.doctorName}</h4>
                  <p className="text-sm text-gray-600">{selectedAppointment.specialty}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <p className="font-semibold text-gray-800">{selectedAppointment.date}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Time</p>
                <p className="font-semibold text-gray-800">{selectedAppointment.time}</p>
              </div>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <span className={`inline-block text-sm font-semibold px-3 py-1 rounded ${
                selectedAppointment.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                selectedAppointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                selectedAppointment.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {selectedAppointment.status}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                {selectedAppointment.notes || 'No notes added'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}