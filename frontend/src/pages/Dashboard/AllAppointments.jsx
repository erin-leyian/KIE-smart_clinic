import React, { useState } from 'react';
import { Clock, MapPin, Phone, Video, MessageSquare, CheckCircle, Calendar, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import mockData from '../../data/mockData.json';
import { getSpecialtyIcon, getSpecialtyBgColor } from '../../utils/medicalIcons';

export default function AllAppointments() {
  const [appointments, setAppointments] = useState(mockData.appointments || []);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
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
    setAppointmentModal(true);
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
              const icon = getSpecialtyIcon(apt.specialty);
              return (
                <div
                  key={apt.id}
                  onClick={() => openAppointmentDetails(apt)}
                  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Doctor Icon */}
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition`}>
                        {icon}
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
          {
            label: selectedAppointment?.status === 'Completed' ? 'Close' : 'Reschedule',
            onClick: () => setAppointmentModal(false),
            variant: 'primary'
          },
          {
            label: 'Close',
            onClick: () => setAppointmentModal(false),
            variant: 'secondary'
          }
        ]}
      >
        {selectedAppointment && (
          <div className="space-y-5">
            {/* Doctor Info */}
            <div className="flex items-start space-x-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                {getIcon(selectedAppointment.specialty)}
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
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Status</p>
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(selectedAppointment.status)}`}>
                {selectedAppointment.status}
              </span>
            </div>

            {/* Notes */}
            {selectedAppointment.notes && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-2">Notes</p>
                <p className="text-sm text-blue-900">{selectedAppointment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
