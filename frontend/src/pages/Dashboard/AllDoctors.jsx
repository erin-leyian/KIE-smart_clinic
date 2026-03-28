import React, { useState } from 'react';
import { Search, Star, CreditCard, Clock, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import mockData from '../../data/mockData.json';

export default function AllDoctors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
  const [doctorDetailsModal, setDoctorDetailsModal] = useState(false);
  const [bookedDoctors, setBookedDoctors] = useState({});
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  // Specialty icons mapping
  const getIcon = (specialty) => {
    if (specialty.includes('Cardiologist')) return '💓';
    if (specialty.includes('Pediatrician')) return '👶';
    if (specialty.includes('Obstetrician')) return '🤰';
    if (specialty.includes('Surgeon')) return '🔪';
    if (specialty.includes('Dermatologist')) return '🔴';
    if (specialty.includes('Psychiatrist')) return '🧠';
    if (specialty.includes('Orthopedist')) return '🦴';
    if (specialty.includes('Ophthalmologist')) return '👁️';
    if (specialty.includes('Gastroenterologist')) return '🍽️';
    if (specialty.includes('Neurologist')) return '🧠';
    if (specialty.includes('ENT')) return '👂';
    if (specialty.includes('Pharmacist')) return '💊';
    if (specialty.includes('Pulmonologist')) return '💨';
    if (specialty.includes('Radiologist')) return '🖼️';
    if (specialty.includes('Anesthesiologist')) return '💉';
    if (specialty.includes('Infectious')) return '🦠';
    if (specialty.includes('Urologist')) return '🚽';
    if (specialty.includes('Rheumatologist')) return '🦴';
    if (specialty.includes('Hematologist')) return '🩸';
    return '🩺';
  };

  const doctors = mockData.doctors.map(doc => ({
    ...doc,
    icon: getIcon(doc.specialty)
  }));

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

  return (
    <DashboardLayout title="All Doctors">
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
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className="bg-white border rounded-2xl p-6 hover:shadow-lg hover:border-teal-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition">
                      {doctor.icon}
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
                </div>
              </div>
            ))}
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
                {selectedDoctorDetails.icon}
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
    </DashboardLayout>
  );
}
