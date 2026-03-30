import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import { doctorsAPI } from '../../services/api';
import { Edit, Trash2, Plus, Search, Star, AlertCircle, Check } from 'lucide-react';

export default function AdminDoctors() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    hospital: '',
    fee: '',
    rating: 4.5,
    languages: [],
    city: 'Kigali',
    hours: '',
    image: '',
  });

  const specialties = [
    'General Practitioner',
    'Cardiologist',
    'Pediatrician',
    'Surgeon',
    'Obstetrician',
    'Dermatologist',
    'Psychiatrist',
    'Orthopedist',
    'Ophthalmologist',
    'Gastroenterologist',
    'Neurologist',
    'ENT Specialist',
    'Pharmacist',
    'Anesthesiologist',
    'Radiologist',
    'Pulmonologist',
    'Urologist',
    'Rheumatologist',
    'Infectious Disease',
  ];

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
    
    // Fetch doctors from real API
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctorsAPI.getAllDoctors({
          specialization: filterSpecialty !== 'all' ? filterSpecialty : undefined,
          search: searchTerm,
          limit: 100
        });
        setDoctors(response.data || []);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        setSuccessMsg('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, [navigate]);

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' || d.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleAddClick = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialty: '',
      experience: '',
      hospital: '',
      fee: '',
      rating: 4.5,
      languages: [],
      city: 'Kigali',
      hours: '',
      image: '',
    });
    setShowModal(true);
  };

  const handleEditClick = (d) => {
    setEditingDoctor(d);
    setFormData({
      name: d.name,
      specialty: d.specialty,
      experience: d.experience,
      hospital: d.hospital,
      fee: d.fee,
      rating: d.rating || 4.5,
      languages: d.languages || [],
      city: d.city || 'Kigali',
      hours: d.hours || '',
      image: d.image || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.specialty) {
      alert('Name and Specialty are required');
      return;
    }

    try {
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const doctorData = {
        firstName: firstName,
        lastName: lastName,
        specialization: formData.specialty,
        yearsOfExperience: parseInt(formData.experience) || 0,
        consultationFee: parseFloat(formData.fee) || 0,
        consultationDuration: 30,
        consultationEnabled: true,
        qualifications: formData.hospital || '',
        availableHours: []
      };

      if (editingDoctor) {
        await doctorsAPI.updateDoctor(editingDoctor.id, doctorData);
        const updatedDoctors = doctors.map(d =>
          d.id === editingDoctor.id
            ? { ...d, ...formData }
            : d
        );
        setDoctors(updatedDoctors);
        setSuccessMsg(`Doctor "${formData.name}" updated successfully!`);
      } else {
        const response = await doctorsAPI.createDoctor({
          ...doctorData,
          email: `doctor${Date.now()}@clinic.rw`,
          password: 'TempPassword123!'
        });
        setDoctors([...doctors, response.doctor]);
        setSuccessMsg(`Doctor "${formData.name}" added successfully!`);
      }

      setShowModal(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error saving doctor: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (d) => {
    try {
      await doctorsAPI.deleteDoctor(d.id);
      const updatedDoctors = doctors.filter(doctor => doctor.id !== d.id);
      setDoctors(updatedDoctors);
      setDeleteConfirm(null);
      setSuccessMsg(`Doctor "${d.firstName} ${d.lastName}" deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error deleting doctor: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Doctors">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Doctors">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Doctors</h1>
            <p className="text-gray-600 mt-1">Edit, delete, or add new doctors to the system</p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add New Doctor
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
              placeholder="Search doctors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Specialties</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No doctors found
            </div>
          ) : (
            filteredDoctors.map(d => (
              <div key={d.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Doctor Image */}
                <div className="h-40 bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center">
                  {d.image ? (
                    <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-4xl font-bold">{d.name.charAt(0)}</div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{d.name}</h3>
                  <p className="text-sm text-teal-600 font-medium">{d.specialty}</p>
                  
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Hospital:</span> {d.hospital}</p>
                    <p><span className="font-medium">Experience:</span> {d.experience}</p>
                    <p><span className="font-medium">Fee:</span> {d.fee}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(d.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{d.rating}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditClick(d)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(d)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Doctor Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty *
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Specialty</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
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
                  Experience
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 10 years"
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Mon-Fri 08:00-17:00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="https://example.com/image.jpg"
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
                {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
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
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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
                Delete Doctor
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
