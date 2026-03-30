import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, CreditCard, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronUp, CheckCircle, Star, Phone, MessageSquare, Video, Stethoscope, AlertCircle, RotateCcw } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import { LoadingSpinner, DoctorCardSkeleton, BannerSkeleton } from '../../components/LoadingSkeletons';
import { doctorsAPI, appointmentsAPI } from '../../services/api';
import { getIconComponent, getSpecialtyBgColor } from '../../utils/medicalIcons';
import { safeFetch, formatErrorMessage } from '../../utils/errorHandler';
import { getCurrentUser, getUserRole } from '../../utils/dataAccessControl';
import { createNotification } from '../../utils/notificationManager';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [activeDot, setActiveDot] = useState(0);
  const [bookedDoctors, setBookedDoctors] = useState({});
  const [appointmentsFilter, setAppointmentsFilter] = useState('upcoming');
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [userAppointments, setUserAppointments] = useState([]);
  
  // Modal states
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Date/Time, 2: Method, 3: Confirm
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  
  // View doctor details modal
  const [doctorDetailsModal, setDoctorDetailsModal] = useState(false);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);

  // Banner messages
  const bannerMessages = [
    {
      title: "No need to visit local hospitals",
      subtitle: "Get your consultation online",
      description: "Audio/text/video/in-person across Rwanda",
      color: "bg-[#649aa8]"
    },
    {
      title: "Quality Healthcare at Your Fingertips",
      subtitle: "Connect with Rwanda's best doctors",
      description: "Available 24/7 for emergencies and consultations",
      color: "bg-[#389cb4]"
    },
    {
      title: "Affordable Medical Care",
      subtitle: "Transparent pricing, no hidden fees",
      description: "Quality healthcare that fits your budget",
      color: "bg-[#4ba5be]"
    }
  ];

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % bannerMessages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getDoctorDisplayName = (doctor) => {
    if (!doctor) return 'Doctor';
    const fullName = [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;
    return doctor.name || 'Doctor';
  };

  const getUserDisplayName = (user) => {
    if (!user) return '';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;
    return user.name || user.email || '';
  };

  const mapAppointmentForCard = (appointment) => {
    const appointmentDate = appointment.appointmentDate || appointment.appointment_date || appointment.date;
    const parsedDate = appointmentDate ? new Date(appointmentDate) : null;

    return {
      id: appointment.id,
      day: parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString('en-US', { weekday: 'short' })
        : '-',
      date: parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString('en-US', { day: '2-digit' })
        : '-',
      doctor: appointment.doctorName || 'Doctor',
      time: appointment.appointmentTime || appointment.appointment_time || appointment.time || '-',
      specialty: appointment.specialty || appointment.type || 'General',
      status: appointment.status,
      dateObj: parsedDate,
    };
  };

  const loadUserAppointments = async (user, role) => {
    if (!user) {
      setUserAppointments([]);
      return;
    }

    const filters = {};
    if (role === 'patient') filters.patientId = user.id;
    if (role === 'doctor') filters.doctorId = user.id;

    const response = await appointmentsAPI.getAllAppointments(filters);
    setUserAppointments(response?.data || []);
  };

  // Simulate loading with error handling
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current user
        const user = getCurrentUser();
        const role = getUserRole();
        setCurrentUser(user);
        setUserRole(role);

        await loadUserAppointments(user, role);
        
        setLoading(false);
      } catch (err) {
        const errorMessage = formatErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        const response = await doctorsAPI.getAllDoctors({
          search: searchTerm,
          limit: 5
        });
        setSearchResults(response.data || []);
        setShowSearchResults(true);
      } catch (err) {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  // Retry loading data
  const handleRetryLoadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current user
      const user = getCurrentUser();
      const role = getUserRole();
      setCurrentUser(user);
      setUserRole(role);

      await loadUserAppointments(user, role);
      
      setLoading(false);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctorForBooking(doctor);
    setBookingStep(1);
    setBookingModal(true);
  };

  const handleConfirmBooking = async (paymentMethod = 'Clinic Payment') => {
    if (!currentUser?.id || !selectedDoctorForBooking?.id || !selectedDate || !selectedTime) {
      return;
    }

    try {
      setBookingSubmitting(true);

      const response = await appointmentsAPI.createAppointment({
        patientId: currentUser.id,
        doctorId: selectedDoctorForBooking.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: `Consultation via ${consultationType}`,
        notes: `Consultation: ${consultationType}; Payment: ${paymentMethod}`,
        type:
          consultationType === 'video'
            ? 'Video Call'
            : consultationType === 'phone'
              ? 'Phone Call'
              : 'Text Message',
        status: 'scheduled',
      });

      const bookedAppointment = response?.appointment || response?.data || null;
      createNotification({
        type: 'Confirmed',
        title: 'Appointment Booked Successfully',
        message: `Your appointment with ${getDoctorDisplayName(selectedDoctorForBooking)} is scheduled on ${selectedDate} at ${selectedTime}.`,
        appointmentId: bookedAppointment?.id,
        relatedTo: currentUser.id,
        relatedName: getUserDisplayName(currentUser),
        meta: {
          paymentMethod,
          consultationType,
        },
      });

      await loadUserAppointments(currentUser, userRole);
      setBookedDoctors(prev => ({
        ...prev,
        [selectedDoctorForBooking.id]: true
      }));
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingModal(false);
        setBookingSuccess(false);
        setBookingStep(1);
        setSelectedDate('');
        setSelectedTime('');
        setConsultationType('video');
      }, 2000);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setBookingSubmitting(false);
    }
  };

  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  const openDoctorDetails = (doctor) => {
    setSelectedDoctorDetails(doctor);
    setDoctorDetailsModal(true);
  };

  // Load recommended doctors from API
  useEffect(() => {
    const loadRecommendedDoctors = async () => {
      try {
        const response = await doctorsAPI.getAllDoctors({ limit: 6 });
        setRecommendedDoctors(response.data || []);
      } catch (err) {
        console.error('Failed to load recommended doctors:', err);
        setRecommendedDoctors([]);
      }
    };

    if (!currentUser) {
      loadRecommendedDoctors();
    }
  }, [currentUser]);
  
  // Format upcoming appointments from live API data
  const upcomingAppointmentsList = (userAppointments || [])
    .filter((apt) => {
      const appointmentDate = apt.appointmentDate || apt.appointment_date || apt.date;
      if (!appointmentDate) return false;
      const parsed = new Date(appointmentDate);
      if (Number.isNaN(parsed.getTime())) return false;
      return parsed >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed';
    })
    .sort((a, b) => {
      const aDate = new Date(a.appointmentDate || a.appointment_date || a.date);
      const bDate = new Date(b.appointmentDate || b.appointment_date || b.date);
      return aDate - bDate;
    })
    .slice(0, 4)
    .map(mapAppointmentForCard);

  // Nearby doctors from API (first 3 doctors)
  const nearbyDoctors = recommendedDoctors.slice(0, 3).map(doctor => ({
    ...doctor,
    distance: "0.5 km",
    address: doctor.hospital || doctor.qualifications
  }));

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          <div className="flex-1 space-y-6">
            <BannerSkeleton />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetryLoadData}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            title="Retry loading data"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        
        {/* Left Column (Main content) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Animated Banner Carousel */}
          <div className="relative rounded-2xl overflow-hidden h-[240px] flex flex-col justify-center cursor-pointer group">
            {/* Banner slides */}
            {bannerMessages.map((banner, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 ${banner.color} transition-opacity duration-700 ${
                  activeDot === idx ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Background pattern elements */}
                <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
                <div className="absolute right-0 bottom-0 w-[200px] h-[200px] shadow-[inset_0_0_50px_rgba(255,255,255,0.2)] rounded-full mix-blend-overlay border border-white/20 translate-x-[20%] translate-y-[20%] scale-150"></div>
                <div className="absolute right-[80px] bottom-[20px] w-[300px] h-[300px] border-[0.5px] border-white/20 rounded-full scale-[1.8] mix-blend-overlay"></div>
              </div>
            ))}

            {/* Content overlay */}
            <div className="relative z-10 p-8 text-white">
              <div className={`group-hover:translate-y-[-5px] transition-transform duration-200 ${activeDot === 0 ? 'animate-slideInLeft' : ''}`}>
                <h2 className="text-3xl font-bold mb-2">
                  {bannerMessages[activeDot].title}
                </h2>
                <p className="text-white/80 text-lg mb-8">
                  {bannerMessages[activeDot].description}
                </p>
                
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4 animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-white/60"></div>
                    <div className="w-3 h-3 rounded-full bg-white/60"></div>
                    <div className="w-3 h-3 rounded-full bg-white/60"></div>
                  </div>
                  <span className="text-white/90 text-sm font-medium">+180 doctors are online in Rwanda</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Banner Navigation Dots */}
          <div className="flex justify-center space-x-2">
            {bannerMessages.map((_, dotIndex) => (
              <button 
                key={dotIndex}
                onClick={() => setActiveDot(dotIndex)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeDot === dotIndex 
                    ? 'bg-[#389cb4] w-6' 
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
                aria-label={`Go to slide ${dotIndex + 1}`}
              ></button>
            ))}
          </div>

          {/* Nearby Doctors Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nearby Doctors in Kigali</h3>
              <button 
                onClick={() => navigate('/dashboard/doctors')}
                className="text-[#389cb4] text-sm font-semibold hover:underline transition-colors hover:text-[#328c9f]"
              >
                View All &gt;
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nearbyDoctors.map(doctor => {
                const bgColor = getSpecialtyBgColor(doctor.specialization);
                const IconComponent = getIconComponent(doctor.specialization);
                return (
                  <div 
                    key={doctor.id} 
                    onClick={() => openDoctorDetails(doctor)}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-16 h-12 rounded-lg bg-gradient-to-br ${bgColor} flex items-center justify-center group-hover:scale-110 transition`}>
                        <IconComponent className="w-7 h-7 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm group-hover:text-teal-600 transition">{`${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()}</h4>
                        <p className="text-xs text-gray-500">{doctor.specialization || 'General'}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600 ml-1">{doctor.rating || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start text-gray-500 text-xs mt-2 pt-3 border-t border-gray-50">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 mt-0.5 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-600 block mb-0.5">{doctor.distance}</span>
                        <span className="text-gray-400">{doctor.address}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Doctors Section */}
          <div className="mt-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Recommended Doctors</h3>
              <button 
                onClick={() => navigate('/dashboard/doctors')}
                className="text-[#389cb4] text-sm font-semibold hover:underline transition-colors hover:text-[#328c9f]"
              >
                View All &gt;
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedDoctors.slice(0, 6).map((doctor) => {
                const bgColor = getSpecialtyBgColor(doctor.specialization);
                const IconComponent = getIconComponent(doctor.specialization);
                return (
                  <div 
                    key={doctor.id} 
                    className="bg-white border rounded-2xl p-5 text-left flex flex-col hover:border-teal-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-7 h-7 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 group-hover:text-teal-600 transition cursor-pointer" onClick={() => openDoctorDetails(doctor)}>
                          {`${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">{doctor.yearsOfExperience || 0} years</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600 ml-1">{doctor.rating || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="inline-block px-2.5 py-1 bg-teal-50 text-teal-600 text-[10px] font-medium rounded-md mb-3 w-fit">
                      {doctor.specialization || 'General'}
                    </span>
                    
                    <div className="flex justify-between items-center text-xs text-gray-600 border-t border-gray-100 pt-4 pb-4">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-700 text-[11px]">Mon-Fri</div>
                          <div className="text-[10px] text-gray-400">08:00-17:00</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-700">{doctor.consultationFee || 'Contact'}</div>
                          <div className="text-[10px] text-gray-400">RWF</div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleBookAppointment(doctor)}
                      disabled={bookedDoctors[doctor.id]}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all mt-auto flex items-center justify-center gap-2 ${
                        bookedDoctors[doctor.id] 
                          ? 'bg-green-50 text-green-600 cursor-not-allowed border border-green-200' 
                          : 'bg-[#389cb4] hover:bg-[#328c9f] text-white cursor-pointer shadow-sm hover:shadow-md'
                      }`}
                    >
                      {bookedDoctors[doctor.id] ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Booked
                        </>
                      ) : 'Book appointment'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

        {/* Right Column (Sidebar Calendar/List) */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Upcoming Appointments</h3>
              <button 
                onClick={() => navigate('/dashboard/appointments')}
                className="text-[#389cb4] text-sm font-semibold hover:underline transition-colors hover:text-[#328c9f]"
              >
                View All &gt;
              </button>
            </div>
            
            {/* Header with Current Month/Year */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-800 text-base">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <div className="flex space-x-1">
                  <button className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <button 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="p-1.5 bg-gray-50 text-gray-500 rounded hover:bg-gray-100 transition-colors"
              >
                <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${isCalendarOpen ? '' : 'rotate-180'}`} />
              </button>
            </div>
            
            {/* Appointment List */}
            <div className={`transition-all duration-300 overflow-hidden ${isCalendarOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-3 mt-4">
                {upcomingAppointmentsList.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No upcoming appointments</p>
                ) : (
                  upcomingAppointmentsList.map((apt, i) => {
                    const IconComponent = getIconComponent(apt.specialty);
                    return (
                      <div 
                        key={i} 
                        className={`flex items-center rounded-xl p-3 cursor-pointer transition-all border group ${
                          apt.status === 'Confirmed' 
                            ? 'bg-teal-50 border-teal-200 hover:bg-teal-100' 
                            : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center min-w-[50px] pr-4 border-r border-gray-200/50">
                          <span className="text-xs text-gray-500 font-medium uppercase">{apt.day}</span>
                          <span className="text-lg font-bold text-gray-800 leading-none mt-0.5">{apt.date}</span>
                        </div>
                        <div className="pl-4 flex-1">
                          <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#389cb4] transition-colors flex items-center gap-2">
                            <IconComponent className="w-4 h-4 flex-shrink-0" />
                            {apt.doctor}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {apt.time}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
        
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModal}
        onClose={() => {
          setBookingModal(false);
          setBookingStep(1);
          setSelectedDate('');
          setSelectedTime('');
          setConsultationType('video');
        }}
  title={bookingSuccess ? 'Booking Confirmed! ✓' : `Book with ${getDoctorDisplayName(selectedDoctorForBooking)}`}
        type={bookingSuccess ? 'success' : 'booking'}
        size="lg"
        closeButton={!bookingSuccess}
      >
        {bookingSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-800 font-bold mb-2">Appointment Confirmed!</p>
            <p className="text-gray-600 mb-4">Your appointment with {getDoctorDisplayName(selectedDoctorForBooking)} has been booked.</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-gray-700">
              <p><strong>Date:</strong> {selectedDate}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Type:</strong> {consultationType === 'video' ? 'Video Call' : consultationType === 'phone' ? 'Phone Call' : 'Text Message'}</p>
              <p><strong>Fee:</strong> {selectedDoctorForBooking?.consultationFee || selectedDoctorForBooking?.fee || 'RWF 0'}</p>
            </div>
            <p className="text-xs text-gray-500">You will receive a confirmation SMS and email shortly.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-6">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${bookingStep >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <div className={`flex-1 h-1 mx-2 ${bookingStep >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${bookingStep >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <div className={`flex-1 h-1 mx-2 ${bookingStep >= 3 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${bookingStep >= 3 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <div className={`flex-1 h-1 mx-2 ${bookingStep >= 4 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${bookingStep >= 4 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>4</div>
            </div>

            {/* Step 1: Select Date & Time */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 mb-4">Step 1: Select Date & Time</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 rounded-lg text-sm font-medium transition ${
                          selectedTime === time
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Consultation Type */}
            {bookingStep === 2 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Step 2: Consultation Method</h3>
                <div className="space-y-3">
                  {[
                    { value: 'video', label: 'Video Call', icon: Video },
                    { value: 'phone', label: 'Phone Call', icon: Phone },
                    { value: 'message', label: 'Text Message', icon: MessageSquare }
                  ].map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setConsultationType(type.value)}
                        className={`w-full flex items-center p-4 border rounded-lg transition ${
                          consultationType === type.value
                            ? 'bg-teal-50 border-teal-500'
                            : 'bg-gray-50 border-gray-200 hover:border-teal-200'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3 text-teal-500" />
                        <span className="font-medium text-gray-800">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {bookingStep === 3 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Step 3: Review Booking</h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3 pb-4 border-b">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                      {selectedDoctorForBooking?.icon || "🩺"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{getDoctorDisplayName(selectedDoctorForBooking)}</p>
                      <p className="text-sm text-gray-600">{selectedDoctorForBooking?.specialty}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-bold text-gray-900">{selectedDate} at {selectedTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Consultation Method</p>
                    <p className="font-bold text-gray-900 capitalize">{consultationType === 'video' ? 'Video Call' : consultationType === 'phone' ? 'Phone Call' : 'Text Message'}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="font-bold text-lg text-teal-600">{selectedDoctorForBooking?.consultationFee || selectedDoctorForBooking?.fee || 'RWF 0'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {bookingStep === 4 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Step 4: Payment</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 text-sm">Payment Method</p>
                      <p className="text-xs text-blue-700 mt-1">You can pay using MTN Mobile Money, Airtel Money, or Bank Transfer</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Clinic Payment'].map(method => (
                      <button
                        key={method}
                        onClick={() => handleConfirmBooking(method)}
                        disabled={bookingSubmitting}
                        className="w-full p-3 border rounded-lg text-left font-medium text-gray-800 hover:bg-teal-50 hover:border-teal-500 transition"
                      >
                        {bookingSubmitting ? 'Processing...' : method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-3 pt-4">
              <button
                onClick={() => setBookingStep(Math.max(1, bookingStep - 1))}
                disabled={bookingStep === 1}
                className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (bookingStep < 4) {
                    setBookingStep(bookingStep + 1);
                  }
                }}
                disabled={
                  bookingSubmitting ||
                  (bookingStep === 1 && (!selectedDate || !selectedTime)) ||
                  (bookingStep === 2 && !consultationType) ||
                  bookingStep === 4
                }
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingStep === 4 ? 'Select Payment Method' : bookingStep === 3 ? 'Proceed to Payment' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Doctor Details Modal */}
      <Modal
        isOpen={doctorDetailsModal}
        onClose={() => setDoctorDetailsModal(false)}
        title={selectedDoctorDetails ? `${selectedDoctorDetails.firstName || ''} ${selectedDoctorDetails.lastName || ''}`.trim() : ''}
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
                  const IconComponent = getIconComponent(selectedDoctorDetails.specialization);
                  return <IconComponent className="w-10 h-10 text-teal-600" />;
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{`${selectedDoctorDetails.firstName || ''} ${selectedDoctorDetails.lastName || ''}`.trim()}</h3>
                <p className="text-teal-600 font-medium">{selectedDoctorDetails.specialization || 'General'}</p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">{selectedDoctorDetails.rating || 'N/A'} • {selectedDoctorDetails.qualifications || 'Qualified'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Experience</p>
                <p className="font-bold text-gray-900 mt-1">{selectedDoctorDetails.yearsOfExperience || 0} years</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Consultation Fee</p>
                <p className="font-bold text-gray-900 mt-1">RWF {selectedDoctorDetails.consultationFee || 'Contact'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Key Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Qualifications:</span> <span className="font-medium text-gray-900">{selectedDoctorDetails.qualifications || 'Qualified Professional'}</span></div>
                <div><span className="text-gray-600">Consultation Duration:</span> <span className="font-medium text-gray-900">{selectedDoctorDetails.consultationDuration || 30} minutes</span></div>
                <div><span className="text-gray-600">Email:</span> <span className="font-medium text-gray-900">{selectedDoctorDetails.email || 'Contact clinic'}</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Consultation Methods</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDoctorDetails.consultationEnabled ? (
                  <span className="px-3 py-1 bg-teal-50 text-teal-600 text-sm rounded-full font-medium">
                    Available for Consultation
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full font-medium">
                    Currently Unavailable
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">About this Doctor</h4>
              <p className="text-sm text-gray-600">
                Dr. {(selectedDoctorDetails.lastName || 'Smith')} is a highly qualified {selectedDoctorDetails.specialization || 'professional'} with {selectedDoctorDetails.yearsOfExperience || 'extensive'} years of professional experience. 
                Available for consultations via video call, phone, or in-person appointments.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
