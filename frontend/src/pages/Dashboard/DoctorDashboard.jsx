import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { BarChart3, Users, FileText, Clock, CheckCircle, AlertCircle, Calendar, Phone, MapPin, Stethoscope, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { appointmentsAPI, authAPI } from '../../services/api';


export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [uniquePatients, setUniquePatients] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingConfirmations: 0,
    upcomingAppointments: 0,
    totalConsultationHours: 0,
    averageRating: 4.8,
  });

  const toApiStatus = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (['confirmed', 'scheduled', 'pending'].includes(normalized)) return 'scheduled';
    if (normalized === 'completed') return 'completed';
    if (normalized === 'cancelled') return 'cancelled';
    if (normalized === 'no-show') return 'no-show';
    return 'scheduled';
  };

  const normalizeAppointment = (apt = {}) => {
    const date = apt.appointmentDate || apt.appointment_date || apt.date || null;
    const time = apt.appointmentTime || apt.appointment_time || apt.time || '-';
    const parsedDate = date ? new Date(`${date}T00:00:00`) : null;

    return {
      ...apt,
      date,
      time,
      dateObj: parsedDate,
      patientId: apt.patientId || apt.patient_id,
      patientName: apt.patientName || 'Patient',
      location: apt.location || apt.hospital || null,
      status: toApiStatus(apt.status),
    };
  };

  const getUserDisplayName = (profile = {}) => {
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;
    return profile.name || profile.email || 'Doctor';
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    if (userData.role !== 'doctor') {
      navigate('/dashboard');
      return;
    }

    setUser(userData);

    // Fetch doctor's appointments from API
    const fetchAppointments = async () => {
      try {
        const appointmentsData = await appointmentsAPI.getAllAppointments({ 
          doctorId: userData.id 
        });
        const docAppointments = (appointmentsData.data || appointmentsData.appointments || []).map(normalizeAppointment);
        setDoctorAppointments(docAppointments);

        // Get unique patient IDs and fetch users
        const patientIds = [...new Set(docAppointments.map(apt => apt.patient_id || apt.patientId))];
        
        let patients = [];
        if (patientIds.length > 0) {
          const usersData = await authAPI.getAllUsers();
          const allUsers = usersData.users || [];
          patients = allUsers.filter(u => patientIds.includes(u.id) && u.role === 'patient');
        }
        
        setUniquePatients(patients);

  const completed = docAppointments.filter((apt) => apt.status === 'completed').length;
  const pending = docAppointments.filter((apt) => apt.status === 'scheduled').length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = docAppointments.filter((apt) => apt.status === 'scheduled' && apt.dateObj && apt.dateObj >= today).length;
        
        const consultationHours = (completed * 0.5).toFixed(1);

        setStats({
          totalPatients: patients.length,
          totalAppointments: docAppointments.length,
          completedAppointments: completed,
          pendingConfirmations: pending,
          upcomingAppointments: upcoming,
          totalConsultationHours: consultationHours,
          averageRating: 4.8,
        });
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setStats({
          totalPatients: 0,
          totalAppointments: 0,
          completedAppointments: 0,
          pendingConfirmations: 0,
          upcomingAppointments: 0,
          totalConsultationHours: 0,
          averageRating: 4.8,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const getWeekDates = (date) => {
    const currentDate = new Date(date);
    const first = currentDate.getDate() - currentDate.getDay();
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate.setDate(first + i));
      weekDates.push(new Date(d));
    }
    return weekDates;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return doctorAppointments.filter(apt => {
      if (!apt.dateObj || Number.isNaN(new Date(apt.dateObj).getTime())) return false;
      const aptDate = new Date(apt.dateObj).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (date) => {
    return date.getDate();
  };

  const goToPreviousWeek = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 7);
    setCurrentDate(prevDate);
  };

  const goToNextWeek = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 7);
    setCurrentDate(nextDate);
  };

  const weekDates = getWeekDates(currentDate);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Dr. {getUserDisplayName(user)}!</h1>
              <p className="text-teal-100">Your weekly schedule at a glance</p>
            </div>
            <div className="text-5xl opacity-10">
              <Stethoscope />
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-5 shadow border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Total Patients</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalPatients}</p>
            <p className="text-xs text-gray-500 mt-1">Unique patients</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Pending Confirmations</span>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.pendingConfirmations}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting your response</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Upcoming Today</span>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.upcomingAppointments}</p>
            <p className="text-xs text-gray-500 mt-1">Scheduled appointments</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.completedAppointments}</p>
            <p className="text-xs text-gray-500 mt-1">Total consultations</p>
          </div>
        </div>

        {/* Calendar Schedule */}
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-500" />
              Weekly Schedule
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-sm font-medium text-gray-600 min-w-[200px] text-center">
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <button
                onClick={goToNextWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Week View */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-6">
            {weekDates.map((date, idx) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    isToday
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-center mb-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase">{getDayName(date)}</p>
                    <p className={`text-lg font-bold ${isToday ? 'text-teal-600' : 'text-gray-800'}`}>
                      {getDayNumber(date)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {dayAppointments.length > 0 ? (
                      dayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-2 rounded text-xs text-white cursor-pointer hover:shadow transition-shadow ${
                            apt.status === 'scheduled'
                              ? 'bg-blue-500'
                              : apt.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                          onClick={() => navigate('/dashboard/doctor/appointments')}
                        >
                          <p className="font-semibold truncate">{apt.patientName}</p>
                          <p className="text-xs opacity-90">{apt.time}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">No appointments</p>
                    )}
                  </div>

                  {dayAppointments.length > 2 && (
                    <p className="text-xs text-gray-500 text-center mt-1 font-medium">
                      +{dayAppointments.length - 2} more
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/dashboard/doctor/appointments')}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
            >
              View All Appointments
            </button>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Consultation Hours</span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalConsultationHours} hrs</p>
            <p className="text-xs text-gray-500 mt-1">Estimated from completed appointments</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Total Appointments</span>
              <BarChart3 className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</p>
            <p className="text-xs text-gray-500 mt-1">Across all statuses</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-sm font-medium">Patient Records</span>
              <FileText className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalPatients}</p>
            <p className="text-xs text-gray-500 mt-1">Records you can manage</p>
          </div>
        </div>

        {/* Recent Treatment History */}
        {doctorAppointments.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                Recent Treatment History
              </h2>
              <button
                onClick={() => navigate('/dashboard/doctor/appointments?tab=history')}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {doctorAppointments
                .filter(apt => apt.status === 'completed')
                .slice(0, 5)
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800">{apt.patientName}</p>
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {apt.type} • {apt.consultationType || 'General Consultation'}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {apt.date}
                        </span>
                        {apt.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {apt.location}
                          </span>
                        )}
                      </div>
                    </div>
                    {apt.notes && (
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          Notes
                        </span>
                      </div>
                    )}
                  </div>
                ))}

              {doctorAppointments.filter(apt => apt.status === 'completed').length === 0 && (
                <p className="text-center text-gray-500 py-4">No completed appointments yet</p>
              )}
            </div>
          </div>
        )}

        {/* Patient List */}
        {uniquePatients.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Your Patients ({uniquePatients.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniquePatients.slice(0, 6).map((patient) => {
                const patientAppointments = doctorAppointments.filter(
                  apt => apt.patientId === patient.id
                );
                return (
                  <div
                    key={patient.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{patient.name}</p>
                        <p className="text-xs text-gray-600">{patient.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {patient.phone || 'N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        {patientAppointments.length} appointment{patientAppointments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/records')}
                      className="w-full px-3 py-2 text-xs bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
                    >
                      View Records
                    </button>
                  </div>
                );
              })}
            </div>

            {uniquePatients.length > 6 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigate('/dashboard/records')}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  View all {uniquePatients.length} patients
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
