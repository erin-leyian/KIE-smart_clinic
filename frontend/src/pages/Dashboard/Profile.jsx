import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { Edit2, FileText } from "lucide-react";
import mockData from "../../data/mockData.json";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Simulated fetch
    setUser(mockData.users[0]);
    setHistory(mockData.appointments);
  }, []);

  return (
    <DashboardLayout title="Profile">
      <div className="flex gap-8">
        {/* Inner Sidebar */}
        <div className="w-64 space-y-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
              activeTab === "general"
                ? "bg-gray-100 font-medium text-gray-800"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
              activeTab === "history"
                ? "bg-gray-100 font-medium text-gray-800"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Consultation History
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
              activeTab === "documents"
                ? "bg-gray-100 font-medium text-gray-800"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Patient Documents
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border rounded-xl shadow-sm p-8">
          {activeTab === "general" && user && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">My Profile</h2>
              
              <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-gray-500 text-sm">{user.specialty}</p>
                    <p className="text-gray-400 text-xs">{user.location}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 border px-4 py-2 text-sm rounded-lg hover:bg-gray-50">
                  <span>Edit</span> <Edit2 size={14} />
                </button>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Personal Information</h3>
                  <button className="flex items-center gap-2 border px-4 py-2 text-sm rounded-lg hover:bg-gray-50">
                    <span>Edit</span> <Edit2 size={14} />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Date Of Birth</p>
                    <p className="font-medium">{user.dob}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Age</p>
                    <p className="font-medium">{user.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Bio</p>
                    <p className="font-medium">{user.specialty}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">History</h2>
                <div className="flex gap-4">
                  <select className="border px-4 py-2 rounded-lg text-sm bg-white outline-none">
                    <option>May'23</option>
                  </select>
                  <button className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm">
                    + New Appointment
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold mb-4 text-gray-800">Yesterday</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {history.filter(h => h.date === "Yesterday").map(h => (
                      <div key={h.id} className="border rounded-xl p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <img src={h.avatar} className="w-8 h-8 rounded-full" alt={h.doctorName} />
                            <span className="font-medium text-sm">{h.doctorName}</span>
                          </div>
                          <FileText className="text-teal-500 w-4 h-4" />
                        </div>
                        <div className="bg-blue-50 text-blue-600 text-xs py-1 px-2 rounded w-max">
                          {h.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold mb-4 text-gray-800">Today</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {history.filter(h => h.date === "Today").map(h => (
                      <div key={h.id} className="border rounded-xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <img src={h.avatar} className="w-8 h-8 rounded-full" alt={h.doctorName} />
                          <span className="font-medium text-sm w-40">{h.doctorName}</span>
                          <FileText className="text-teal-500 w-4 h-4 ml-8" />
                        </div>
                        <div className="bg-blue-50 text-blue-600 text-xs py-1 px-3 rounded">
                          {h.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="text-center text-gray-500 py-12">
              No documents available.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}