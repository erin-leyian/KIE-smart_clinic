import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CreditCard, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronUp, CheckCircle, Star, Phone, MessageSquare, Video } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import { LoadingSpinner, DoctorCardSkeleton, BannerSkeleton } from '../../components/LoadingSkeletons';
import mockData from '../../data/mockData.json';

export default function DashboardHome() {
  const [activeDot, setActiveDot] = useState(0);
  const [bookedDoctors, setBookedDoctors] = useState({});
  const [appointmentsFilter, setAppointmentsFilter] = useState('upcoming');
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Date/Time, 2: Method, 3: Confirm
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // View doctor details modal
  const [doctorDetailsModal, setDoctorDetailsModal] = useState(false);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBookAppointment = (doctor) => {
    setSelectedDoctorForBooking(doctor);
    setBookingStep(1);
    setBookingModal(true);
  };

  const handleConfirmBooking = () => {
    setBookedDoctors(prev => ({
      ...prev,
      [selectedDoctorForBooking.id]: true
    }));
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingModal(false);
      setBookingSuccess(false);
      setBookingStep(1);
    }, 2000);
  };

  const openDoctorDetails = (doctor) => {
    setSelectedDoctorDetails(doctor);
    setDoctorDetailsModal(true);
  };
  
  // Use mock data
  const recommendedDoctors = mockData.doctors || [];
  
  // Format appointments from mockData to match the design visually
  const upcomingAppointmentsList = (mockData.appointments || []).map((apt, index) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
      id: apt.id,
      date: (14 + index).toString(),
      day: days[(4 + index) % 7],
      doctor: apt.doctorName,
      time: apt.time,
      specialty: apt.specialty,
      status: apt.status
    };
  }).slice(0, 4);

  // Rwanda-based nearby doctors
  const nearbyDoctors = [
    {
      id: 101,
      name: "Dr. Sylvain Uwizeye",
      specialty: "Cardiologist",
      distance: "0.5 km",
      address: "King Faisal Hospital, Kigali",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 4.8,
      hospital: "King Faisal Hospital"
    },
    {
      id: 102,
      name: "Dr. Marie Ikirezi",
      specialty: "Pediatrician",
      distance: "1.2 km",
      address: "Kigali Central Hospital",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      rating: 4.7,
      hospital: "Kigali Central Hospital"
    },
    {
      id: 103,
      name: "Dr. Grace Mukantabana",
      specialty: "Obstetrician",
      distance: "2.1 km",
      address: "Rwanda Medical Center",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 4.8,
      hospital: "Rwanda Medical Center"
    }
  ];

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
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        
        {/* Left Column (Main content) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Banner */}
          <div className="relative bg-[#649aa8] rounded-2xl overflow-hidden p-8 text-white h-[240px] flex flex-col justify-center cursor-pointer hover:shadow-lg transition-shadow group">
            {/* Background pattern elements */}
            <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute right-0 bottom-0 w-[200px] h-[200px] shadow-[inset_0_0_50px_rgba(255,255,255,0.2)] rounded-full mix-blend-overlay border border-white/20 translate-x-[20%] translate-y-[20%] scale-150"></div>
            <div className="absolute right-[80px] bottom-[20px] w-[300px] h-[300px] border-[0.5px] border-white/20 rounded-full scale-[1.8] mix-blend-overlay"></div>
            <div className="absolute right-[100px] bottom-[40px] w-[200px] h-[200px] border-[0.5px] border-white/20 rounded-full scale-[1.8] mix-blend-overlay"></div>
            
            <div className="relative z-10 group-hover:translate-y-[-5px] transition-transform duration-200">
              <h2 className="text-3xl font-bold mb-2">No need to visit local hospitals<br/>Get your consultation online</h2>
              <p className="text-white/80 text-lg mb-8">Audio/text/video/in-person across Rwanda</p>
              
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-8 h-8 rounded-full border-2 border-[#649aa8] z-30" />
                  <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="" className="w-8 h-8 rounded-full border-2 border-[#649aa8] z-20" />
                  <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="" className="w-8 h-8 rounded-full border-2 border-[#649aa8] z-10" />
                </div>
                <span className="text-white/90 text-sm font-medium">+180 doctors are online in Rwanda</span>
              </div>
            </div>
          </div>
          
          {/* Banner Dots */}
          <div className="flex justify-center space-x-1.5 -mt-3 mb-2">
            {[0, 1, 2].map(dotIndex => (
              <button 
                key={dotIndex}
                onClick={() => setActiveDot(dotIndex)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${activeDot === dotIndex ? 'bg-[#389cb4]' : 'bg-gray-300 hover:bg-gray-400'}`}
                aria-label={`Go to slide ${dotIndex + 1}`}
              ></button>
            ))}
          </div>

          {/* Nearby Doctors Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nearby Doctors in Kigali</h3>
              <button className="text-[#389cb4] text-sm font-semibold hover:underline">View All &gt;</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nearbyDoctors.map(doctor => (
                <div 
                  key={doctor.id} 
                  onClick={() => openDoctorDetails(doctor)}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <img src={doctor.image} alt={doctor.name} className="w-16 h-12 rounded-lg object-cover group-hover:brightness-110 transition" />
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm group-hover:text-teal-600 transition">{doctor.name}</h4>
                      <p className="text-xs text-gray-500">{doctor.specialty}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600 ml-1">{doctor.rating}</span>
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
              ))}
            </div>
          </div>

          {/* Recommended Doctors Section */}
          <div className="mt-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Recommended Doctors</h3>
              <button className="text-[#389cb4] text-sm font-semibold hover:underline">View All &gt;</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedDoctors.slice(0, 6).map((doctor) => (
                <div 
                  key={doctor.id} 
                  className="bg-white border rounded-2xl p-5 text-left flex flex-col hover:border-teal-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <img src={doctor.image} alt={doctor.name} className="w-14 h-14 rounded-full object-cover border border-gray-100 group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 group-hover:text-teal-600 transition cursor-pointer" onClick={() => openDoctorDetails(doctor)}>
                        {doctor.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">{doctor.experience}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600 ml-1">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className="inline-block px-2.5 py-1 bg-teal-50 text-teal-600 text-[10px] font-medium rounded-md mb-3 w-fit">
                    {doctor.specialty}
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
                        <div className="font-medium text-gray-700">{doctor.fee.replace(' RWF', '')}</div>
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
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column (Sidebar Calendar/List) */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Upcoming Appointments</h3>
              <button className="text-[#389cb4] text-sm font-semibold hover:underline">View All &gt;</button>
            </div>
            
            {/* Header for June 2023 */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-800 text-base">June 2023</span>
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
                  upcomingAppointmentsList.map((apt, i) => (
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
                        <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#389cb4] transition-colors">{apt.doctor}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {apt.time}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  ))
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
        }}
        title={bookingSuccess ? 'Appointment Booked!' : `Book with ${selectedDoctorForBooking?.name}`}
        type={bookingSuccess ? 'success' : 'booking'}
        size="lg"
      >
        {bookingSuccess ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Your appointment has been confirmed!</p>
            <p className="text-sm text-gray-500">You will receive a confirmation SMS and email shortly.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-6">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bookingStep >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <div className={`flex-1 h-1 mx-2 ${bookingStep >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bookingStep >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <div className={`flex-1 h-1 mx-2 ${bookingStep >= 3 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bookingStep >= 3 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            </div>

            {/* Step 1: Select Date & Time */}
            {bookingStep === 1 && (
              <div className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-4">Consultation Type</label>
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

            {/* Step 3: Review & Confirm */}
            {bookingStep === 3 && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-bold text-gray-900">{selectedDoctorForBooking?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-bold text-gray-900">{selectedDate} at {selectedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-bold text-gray-900 capitalize">{consultationType}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="font-bold text-lg text-teal-600">{selectedDoctorForBooking?.fee}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Doctor Details Modal */}
      <Modal
        isOpen={doctorDetailsModal}
        onClose={() => setDoctorDetailsModal(false)}
        title={selectedDoctorDetails?.name}
        size="lg"
      >
        {selectedDoctorDetails && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img 
                src={selectedDoctorDetails.image} 
                alt={selectedDoctorDetails.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-bold">{selectedDoctorDetails.specialty}</h3>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">{selectedDoctorDetails.rating} • {selectedDoctorDetails.hospital}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600">Experience</p>
                <p className="font-bold text-gray-900">{selectedDoctorDetails.experience}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600">Consultation Fee</p>
                <p className="font-bold text-gray-900">{selectedDoctorDetails.fee}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDoctorDetails.languages?.map(lang => (
                  <span key={lang} className="px-3 py-1 bg-teal-50 text-teal-600 text-sm rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Availability</h4>
              <p className="text-sm text-gray-600">{selectedDoctorDetails.hours}</p>
            </div>
          </div>
        )}
        actions={[
          {
            label: 'Book Appointment',
            onClick: () => {
              setDoctorDetailsModal(false);
              handleBookAppointment(selectedDoctorDetails);
            },
            variant: 'primary'
          }
        ]}
      </Modal>
    </DashboardLayout>
  );
}
