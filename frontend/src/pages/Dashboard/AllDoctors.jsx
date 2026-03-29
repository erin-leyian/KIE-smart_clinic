import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Star, CreditCard, Clock, ChevronDown, AlertCircle, RotateCcw, Edit2, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import mockData from '../../data/mockData.json';
import { getIconComponent, getSpecialtyBgColor } from '../../utils/medicalIcons';
import { formatErrorMessage } from '../../utils/errorHandler';
import { getCurrentUser, getUserRole, getFilteredDoctors } from '../../utils/dataAccessControl';

export default function AllDoctors() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
  const [doctorDetailsModal, setDoctorDetailsModal] = useState(false);
  const [bookedDoctors, setBookedDoctors] = useState({});
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [doctors, setDoctors] = useState([]);

  // Read search parameter from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
    }
  }, [location.search]);

  // Load doctors data with error handling
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current user
        const user = getCurrentUser();
        const role = getUserRole();
        setCurrentUser(user);
        setUserRole(role);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Validate data
        if (!mockData.doctors || !Array.isArray(mockData.doctors) || mockData.doctors.length === 0) {
          throw new Error('No doctors found. Please try again.');
        }
        
        // Get filtered doctors based on user role
        const filtered = getFilteredDoctors(role, user);
        setDoctors(filtered);
        setLoading(false);
      } catch (err) {
        const errorMessage = formatErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    loadDoctors();
  }, []);

  // Retry loading doctors
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
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Validate data
      if (!mockData.doctors || !Array.isArray(mockData.doctors) || mockData.doctors.length === 0) {
        throw new Error('No doctors found. Please try again.');
      }
      
      // Get filtered doctors based on user role
      const filtered = getFilteredDoctors(role, user);
      setDoctors(filtered);
      setLoading(false);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Get unique specialties
  const specialties = ['All', ...new Set(doctors.map(d => d.specialty))];

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const openDoctorDetails = (doctor) => {
    setSelectedDoctorDetails(doctor);
    setDoctorDetailsModal(true);
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctorForBooking(doctor);
    setBookingModal(true);
  };

  const handleEditClick = (doctor) => {
    setEditingDoctor(doctor);
    setEditFormData({ ...doctor });
    setEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData.name || !editFormData.specialty || !editFormData.hospital) {
      alert('Please fill in required fields (Name, Specialty, Hospital)');
      return;
    }
    const updatedDoctors = doctors.map(d => d.id === editFormData.id ? editFormData : d);
    setDoctors(updatedDoctors);
    setEditModal(false);
    setEditingDoctor(null);
    alert('Doctor updated successfully!');
  };

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    const updatedDoctors = doctors.filter(d => d.id !== doctorToDelete.id);
    setDoctors(updatedDoctors);
    setDeleteConfirmModal(false);
    setDoctorToDelete(null);
    alert('Doctor deleted successfully!');
  };

  return (
    <DashboardLayout title="All Doctors">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Doctors</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetryLoadData}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            title="Retry loading doctors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Specialty</label>
              <div className="flex flex-wrap gap-2">
                {specialties.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedSpecialty === specialty
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-bold">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => {
              const bgColor = getSpecialtyBgColor(doctor.specialty);
              const IconComponent = getIconComponent(doctor.specialty);
              return (
                <div
                  key={doctor.id}
                  className="bg-white border rounded-2xl p-6 hover:shadow-lg hover:border-teal-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}>
                        <IconComponent className="w-7 h-7 text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition cursor-pointer" onClick={() => openDoctorDetails(doctor)}>
                          {doctor.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{doctor.experience}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600 ml-1">{doctor.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="inline-block px-2.5 py-1 bg-teal-50 text-teal-600 text-[10px] font-medium rounded-md mb-4 w-fit">
                    {doctor.specialty}
                  </span>

                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100 text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium text-gray-800">{doctor.hospital}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      <span className="text-xs">{doctor.hours}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <CreditCard className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      <span className="text-xs font-medium">{doctor.fee}</span>
                    </div>
                  </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openDoctorDetails(doctor)}
                    className="flex-1 px-3 py-2 border border-teal-500 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-50 transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    disabled={bookedDoctors[doctor.id]}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      bookedDoctors[doctor.id]
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-teal-500 text-white hover:bg-teal-600'
                    }`}
                  >
                    {bookedDoctors[doctor.id] ? 'Booked' : 'Book'}
                  </button>
                  {userRole === 'admin' && (
                    <>
                      <button
                        onClick={() => handleEditClick(doctor)}
                        className="px-3 py-2 border border-blue-500 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                        title="Edit doctor"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(doctor)}
                        className="px-3 py-2 border border-red-500 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                        title="Delete doctor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <p className="text-gray-600 mb-2">No doctors found matching your search.</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Doctor Details Modal */}
      <Modal
        isOpen={doctorDetailsModal}
        onClose={() => setDoctorDetailsModal(false)}
        title={selectedDoctorDetails?.name}
        size="lg"
        actions={[
          {
            label: 'Book Appointment',
            onClick: () => {
              setDoctorDetailsModal(false);
              handleBookAppointment(selectedDoctorDetails);
            },
            variant: 'primary'
          },
          {
            label: 'Close',
            onClick: () => setDoctorDetailsModal(false),
            variant: 'secondary'
          }
        ]}
      >
        {selectedDoctorDetails && (
          <div className="space-y-6">
            <div className="flex items-start space-x-4 pb-4 border-b">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center text-4xl flex-shrink-0">
                {(() => {
                  const IconComponent = getIconComponent(selectedDoctorDetails.specialty);
                  return <IconComponent className="w-10 h-10 text-teal-600" />;
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{selectedDoctorDetails.name}</h3>
                <p className="text-teal-600 font-medium">{selectedDoctorDetails.specialty}</p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">{selectedDoctorDetails.rating} • {selectedDoctorDetails.hospital}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Experience</p>
                <p className="font-bold text-gray-900 mt-1">{selectedDoctorDetails.experience}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Consultation Fee</p>
                <p className="font-bold text-gray-900 mt-1">{selectedDoctorDetails.fee}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Key Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Hospital:</span> <span className="font-medium text-gray-900">{selectedDoctorDetails.hospital}</span></div>
                <div><span className="text-gray-600">Hours:</span> <span className="font-medium text-gray-900">{selectedDoctorDetails.hours}</span></div>
                <div><span className="text-gray-600">City:</span> <span className="font-medium text-gray-900">{selectedDoctorDetails.city || 'Kigali'}</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Languages Spoken</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDoctorDetails.languages?.map(lang => (
                  <span key={lang} className="px-3 py-1 bg-teal-50 text-teal-600 text-sm rounded-full font-medium">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">About this Doctor</h4>
              <p className="text-sm text-gray-600">
                Dr. {selectedDoctorDetails.name.split(' ').pop()} is a highly qualified {selectedDoctorDetails.specialty.toLowerCase()} with {selectedDoctorDetails.experience} of professional experience.
                Available for consultations via video call, phone, or in-person appointments at {selectedDoctorDetails.hospital}.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Booking Modal */}
      {bookingModal && (
        <Modal
          isOpen={bookingModal}
          onClose={() => setBookingModal(false)}
          title={`Quick Book with ${selectedDoctorForBooking?.name}`}
          size="md"
          actions={[
            {
              label: 'Book Now',
              onClick: () => {
                setBookedDoctors(prev => ({
                  ...prev,
                  [selectedDoctorForBooking?.id]: true
                }));
                setBookingModal(false);
              },
              variant: 'primary'
            },
            {
              label: 'Cancel',
              onClick: () => setBookingModal(false),
              variant: 'secondary'
            }
          ]}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input type="date" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
              <select className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500">
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>2:00 PM</option>
                <option>3:00 PM</option>
                <option>4:00 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
              <select className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500">
                <option>Video Call</option>
                <option>Phone Call</option>
                <option>Text Message</option>
              </select>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700"><strong>Fee:</strong> {selectedDoctorForBooking?.fee}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Doctor Modal */}
      {editModal && editingDoctor && (
        <Modal
          isOpen={editModal}
          onClose={() => {
            setEditModal(false);
            setEditingDoctor(null);
          }}
          title="Edit Doctor"
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
                setEditingDoctor(null);
              },
              variant: 'secondary'
            }
          ]}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
              <input
                type="text"
                value={editFormData.specialty || ''}
                onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital *</label>
              <input
                type="text"
                value={editFormData.hospital || ''}
                onChange={(e) => setEditFormData({ ...editFormData, hospital: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
              <input
                type="text"
                value={editFormData.experience || ''}
                onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={editFormData.rating || 0}
                onChange={(e) => setEditFormData({ ...editFormData, rating: parseFloat(e.target.value) })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fee</label>
              <input
                type="text"
                value={editFormData.fee || ''}
                onChange={(e) => setEditFormData({ ...editFormData, fee: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
              <input
                type="text"
                value={editFormData.hours || ''}
                onChange={(e) => setEditFormData({ ...editFormData, hours: e.target.value })}
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && doctorToDelete && (
        <Modal
          isOpen={deleteConfirmModal}
          onClose={() => {
            setDeleteConfirmModal(false);
            setDoctorToDelete(null);
          }}
          title="Delete Doctor"
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
                setDoctorToDelete(null);
              },
              variant: 'secondary'
            }
          ]}
        >
          <div className="text-center py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>{doctorToDelete.name}</strong>?
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
