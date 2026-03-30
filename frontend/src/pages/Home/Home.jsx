import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import { doctorsAPI } from "../../services/api";

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctorsAPI.getAllDoctors({ limit: 6 });
        setDoctors(response.data || []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Failed to load doctors. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <div className="flex items-center text-teal-600 font-bold text-xl">
          <Heart className="w-5 h-5 mr-2" fill="currentColor" />
          <span>QueueCare</span>
        </div>
        <div className="space-x-4">
          <Link
            to="/auth?mode=login"
            className="text-gray-600 hover:text-teal-600"
          >
            Login
          </Link>
          <Link
            to="/auth?mode=signup"
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Register
          </Link>
        </div>
      </nav>

      <main className="px-8 mt-6">
        {/* Hero Section */}
        <div className="bg-[#8CB8C2] rounded-xl p-12 text-white shadow-sm flex flex-col justify-center h-64 relative overflow-hidden">
          <h1 className="text-3xl font-bold mb-2">
            No need to visit local hospitals
          </h1>
          <h2 className="text-3xl font-bold mb-4">
            Get your consultation online
          </h2>
          <p className="text-lg opacity-90 mb-4">Audio/text/video/in-person</p>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white"></div>
            </div>
            <span>+180 doctors are online</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center -mt-8 relative z-10">
          <div className="bg-white rounded-lg shadow-md p-2 flex items-center w-2/3 border">
            <input
              type="text"
              placeholder="Find doctors"
              className="flex-1 px-4 py-2 outline-none"
            />
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
            <input
              type="text"
              placeholder="Location e.g. Kigali"
              className="flex-1 px-4 py-2 outline-none"
            />
            <button className="px-6 py-2 bg-teal-500 text-white rounded ml-2">
              Search
            </button>
          </div>
        </div>

        {/* Recommended Doctors */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              Recommended Doctors
            </h3>
            <Link to="/dashboard" className="text-teal-500 font-semibold text-sm">
              View All &gt;
            </Link>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl p-6 shadow-sm bg-gray-50 animate-pulse"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-300" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2 w-32" />
                      <div className="h-3 bg-gray-300 rounded w-48" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-300 rounded mb-6 w-24" />
                  <div className="h-10 bg-gray-300 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={doc.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                      alt={doc.firstName}
                      className="w-16 h-16 rounded-full bg-gray-200 object-cover"
                      onError={(e) => {
                        e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">
                        Dr. {doc.firstName} {doc.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {doc.specialization || "General Practitioner"}
                      </p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs text-teal-600 bg-teal-50 rounded-full">
                        {doc.specialization || "General Practice"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-sm text-gray-600 border-t pt-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {doc.yearsOfExperience || 0} years
                      </p>
                      <p>Experience</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        RWF {doc.consultationFee || 0}
                      </p>
                      <p>Consultation</p>
                    </div>
                  </div>
                  <Link 
                    to={`/dashboard?appointmentDoctor=${doc.id}`}
                    className="w-full py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition block text-center"
                  >
                    Book an appointment
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Nearby Doctors */}
        <section className="mt-12 mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Nearby Doctors
          </h3>
          <div className="border rounded-xl p-12 text-center bg-gray-50">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-800 text-white rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="text-gray-600">
              Please enable your location, so we can find nearby doctors in
              Rwanda{" "}
              <a href="#" className="text-teal-500">
                Enable Now
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
