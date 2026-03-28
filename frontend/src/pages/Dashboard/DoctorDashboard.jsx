import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import mockData from '../../data/mockData.json';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(4); // May (0-indexed)
  const [currentYear, setCurrentYear] = useState(2023);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    // Check if user is a doctor
    if (userData.role !== 'doctor') {
      navigate('/dashboard');
      return;
    }

    setUser(userData);

    // Load doctor's availability
    const doctorAvail = mockData.doctorAvailability?.find(
      da => da.doctorId === userData.id || da.doctorName === userData.name
    );

    if (doctorAvail) {
      setAvailability(doctorAvail);
      setCurrentMonth(new Date().getMonth());
      setCurrentYear(new Date().getFullYear());
    }

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

  const getDayClass = (day) => {
    if (!availability) return '';
    
    let hasSlot = false;
    for (const location of availability.locations) {
      if (location.slots.includes(day)) {
        hasSlot = true;
        break;
      }
    }
    return hasSlot ? 'bg-teal-500 text-white' : '';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayClass = getDayClass(day);
      days.push(
        <div key={day} className={`border rounded-lg p-3 min-h-20 cursor-pointer hover:shadow-md transition-all ${dayClass}`}>
          <div className={`text-lg font-bold mb-2 ${dayClass ? 'text-white' : 'text-gray-800'}`}>{day}</div>
          {availability && availability.locations.map((location, idx) => {
            if (location.slots.includes(day)) {
              return (
                <div key={idx} className={`text-xs ${dayClass ? 'text-white' : 'text-teal-600'} mb-1`}>
                  {location.name}
                </div>
              );
            }
            return null;
          })}
          {availability && availability.locations.map((location, idx) => {
            if (location.slots.includes(day)) {
              return (
                <div key={`time-${idx}`} className={`text-xs font-medium ${dayClass ? 'text-white' : 'text-gray-600'}`}>
                  {location.times[0]}
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <DashboardLayout title="My Availability">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Availability">
      {!user || user.role !== 'doctor' ? (
        <div className="text-center py-12 text-red-500">Access denied. This page is for doctors only.</div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">My Availability</h2>
            <p className="text-gray-600">
              Manage your availability across different clinics and online consultations.
            </p>
          </div>

          {/* Calendar */}
          <div className="bg-white border rounded-lg p-8">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handlePrevMonth}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-bold text-gray-800">
                {monthNames[currentMonth]} {currentYear}
              </h3>

              <button
                onClick={handleNextMonth}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button className="ml-auto px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium">
                Mark Holidays
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center font-bold text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2 mb-8">
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="border-t pt-6 space-y-4">
              <h4 className="font-bold text-gray-800">Availability Legend:</h4>
              {availability && availability.locations.map((location, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded ${idx === 0 ? 'bg-teal-500' : idx === 1 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-800">{location.name}</p>
                    <p className="text-sm text-gray-600">{location.times.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
