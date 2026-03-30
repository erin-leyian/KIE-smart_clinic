import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import { appointmentsAPI } from '../../services/api';
import { createNotification } from '../../utils/notificationManager';
import { Edit, Trash2, Plus, Search, AlertCircle, Check, Calendar } from 'lucide-react';

export default function AdminAppointments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    doctorName: '',
    doctorId: '',
    specialty: '',
    hospital: '',
    date: '',
    time: '',
    type: 'In-Person',
    status: 'Pending',
    fee: '',
    notes: '',
  });

  const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Scheduled'];
  const appointmentTypes = ['In-Person', 'Video Call'];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setUser(userData);
    
    // Fetch appointments from real API
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await appointmentsAPI.getAllAppointments({
          status: filterStatus !== 'all' ? filterStatus : undefined
        });
        setAppointments(response.data || []);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
        setSuccessMsg('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [navigate]);

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddClick = () => {
    setEditingAppointment(null);
    setFormData({
      patientName: '',
      patientId: '',
      doctorName: '',
      doctorId: '',
      specialty: '',
      hospital: '',
      date: '',
      time: '',
      type: 'In-Person',
      status: 'Pending',
      fee: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEditClick = (apt) => {
    setEditingAppointment(apt);
    setFormData({
      patientName: apt.patientName,
      patientId: apt.patientId,
      doctorName: apt.doctorName,
      doctorId: apt.doctorId || apt.doctor_id || '',
      specialty: apt.specialty || '',
      hospital: apt.hospital || '',
      date: apt.date || apt.appointmentDate || apt.appointment_date || '',
      time: apt.time || '',
      type: apt.type || 'In-Person',
      status: apt.status || 'Pending',
      fee: apt.fee || '',
      notes: apt.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const patientId = String(formData.patientId || '').trim();
    const doctorId = String(formData.doctorId || '').trim();

    if (!formData.patientName || !formData.doctorName) {
      alert('Patient Name and Doctor Name are required');
      return;
    }

    if (!uuidPattern.test(patientId)) {
      alert('A valid Patient ID (UUID) is required');
      return;
    }

    if (!uuidPattern.test(doctorId)) {
      alert('A valid Doctor ID (UUID) is required');
      return;
    }

    if (!formData.date || !formData.time) {
      alert('Appointment date and time are required');
      return;
    }

    try {
      const appointmentData = {
        patientId,
        doctorId,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        reason: (formData.notes || '').trim().length >= 5
          ? formData.notes.trim()
          : `Consultation (${formData.type || 'General'})`,
        notes: formData.notes,
        status: formData.status
      };

      if (editingAppointment) {
        await appointmentsAPI.updateAppointment(editingAppointment.id, appointmentData);
        const refreshed = await appointmentsAPI.getAllAppointments({
          status: filterStatus !== 'all' ? filterStatus : undefined,
        });
        setAppointments(refreshed.data || []);
        setSuccessMsg(`Appointment updated successfully!`);
      } else {
        const response = await appointmentsAPI.createAppointment(appointmentData);
        const createdAppointment = response?.appointment || response?.data;
        const refreshed = await appointmentsAPI.getAllAppointments({
          status: filterStatus !== 'all' ? filterStatus : undefined,
        });
        setAppointments(refreshed.data || (createdAppointment ? [...appointments, createdAppointment] : appointments));

        createNotification({
          type: 'Confirmed',
          title: 'Appointment Created',
          message: `Appointment for ${formData.patientName} with ${formData.doctorName} on ${formData.date} at ${formData.time} was created successfully.`,
          appointmentId: createdAppointment?.id,
          relatedTo: appointmentData.patientId || null,
          relatedName: formData.patientName || null,
          meta: {
            source: 'admin_appointments',
          },
        });

        setSuccessMsg(`Appointment created successfully!`);
      }

      setShowModal(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error saving appointment: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (apt) => {
    try {
      await appointmentsAPI.deleteAppointment(apt.id);
      const updatedAppointments = appointments.filter(a => a.id !== apt.id);
      setAppointments(updatedAppointments);
      setDeleteConfirm(null);
      setSuccessMsg(`Appointment deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error deleting appointment: ' + (err.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Appointments">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Appointments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Appointments</h1>
            <p className="text-gray-600 mt-1">Edit, delete, or add new appointments</p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add New Appointment
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <Check size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Appointments Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Patient</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Doctor</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Fee</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map(apt => (
                    <tr key={apt.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-800">{apt.patientName}</td>
                      <td className="py-4 px-6 text-gray-600">{apt.doctorName}</td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{apt.dateObj || apt.date} {apt.time}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                          {apt.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{apt.fee}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(apt)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit appointment"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(apt)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete appointment"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointment Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Patient UUID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Doctor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor ID
                </label>
                <input
                  type="text"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Doctor UUID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Doctor specialty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital
                </label>
                <select
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Hospital</option>
                  <option value="Kigali Central Hospital">Kigali Central Hospital</option>
                  <option value="King Faisal Hospital">King Faisal Hospital</option>
                  <option value="Avi Clinic">Avi Clinic</option>
                  <option value="Kigali Health Center">Kigali Health Center</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {appointmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Fee
                </label>
                <input
                  type="text"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 30000 RWF"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Appointment notes..."
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
              >
                {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle size={24} />
              <h2 className="text-xl font-bold">Confirm Delete</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this appointment between <strong>{deleteConfirm.patientName}</strong> and <strong>{deleteConfirm.doctorName}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
