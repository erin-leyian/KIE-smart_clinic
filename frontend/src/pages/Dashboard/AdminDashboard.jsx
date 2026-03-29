import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Users, Briefcase, Calendar, TrendingUp, Activity, AlertCircle, Settings } from 'lucide-react';
import mockData from '../../data/mockData.json';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    // Check if user is an admin
    if (userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setUser(userData);

    // Calculate statistics
    const totalUsers = mockData.users?.length || 0;
    const totalDoctors = mockData.users?.filter(u => u.role === 'doctor').length || 0;
    const totalPatients = mockData.users?.filter(u => u.role === 'patient').length || 0;
    const totalAppointments = mockData.appointments?.length || 0;
    const totalHospitals = mockData.hospitals?.length || 0;

    setStats({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalHospitals,
      completedAppointments: mockData.appointments?.filter(a => a.status === 'Completed').length || 0,
      pendingAppointments: mockData.appointments?.filter(a => a.status === 'Pending').length || 0,
    });

    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      {!user || user.role !== 'admin' ? (
        <div className="text-center py-12 text-red-500 flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Access denied. This page is for admins only.</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin</h1>
            <p className="text-teal-100">You have full access to all system data and management features.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Total Users</h3>
                <Users className="w-5 h-5 text-teal-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{stats?.totalUsers}</div>
              <p className="text-sm text-gray-500 mt-2">Doctors, patients & staff</p>
            </div>

            <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Doctors</h3>
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{stats?.totalDoctors}</div>
              <p className="text-sm text-gray-500 mt-2">Active practitioners</p>
            </div>

            <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Patients</h3>
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{stats?.totalPatients}</div>
              <p className="text-sm text-gray-500 mt-2">Registered users</p>
            </div>

            <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Appointments</h3>
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{stats?.totalAppointments}</div>
              <p className="text-sm text-gray-500 mt-2">Total scheduled</p>
            </div>

            <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Hospitals</h3>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{stats?.totalHospitals}</div>
              <p className="text-sm text-gray-500 mt-2">Network clinics</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Appointment Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 font-medium">Completed</p>
                    <p className="text-sm text-gray-500">Finished consultations</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats?.completedAppointments}</div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-gray-700 font-medium">Pending</p>
                    <p className="text-sm text-gray-500">Awaiting action</p>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stats?.pendingAppointments}</div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Quick Links</h3>
              <p className="text-sm text-gray-600 mb-4">Use the sidebar to access all admin features:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">→</span> All Doctors - View and manage doctors
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">→</span> All Appointments - View and manage appointments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">→</span> System Settings - Configure system
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">→</span> Admin Profile - View and edit your profile
                </li>
              </ul>
            </div>
          </div>

          {/* Users List Preview */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">All Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.users?.slice(0, 5).map((user, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700' :
                          user.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
