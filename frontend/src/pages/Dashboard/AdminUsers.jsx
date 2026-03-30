import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import { authAPI } from '../../services/api';
import { Edit, Trash2, Plus, Search, X, AlertCircle, Check } from 'lucide-react';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    location: '',
    avatar: '',
  });

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
    
    // Fetch users from real API
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getAllUsers({
          role: filterRole !== 'all' ? filterRole : undefined,
          search: searchTerm,
          limit: 100
        });
        setUsers(response.data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setSuccessMsg('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [navigate]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'patient',
      phone: '',
      location: '',
      avatar: '',
    });
    setShowModal(true);
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: u.password || '',
      role: u.role,
      phone: u.phone || '',
      location: u.location || '',
      avatar: u.avatar || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required');
      return;
    }

    try {
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      
      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        phone: formData.phone || '',
        address: formData.location || ''
      };

      if (editingUser) {
        // Update existing user
        await authAPI.updateUser(editingUser.id, userData);
        const updatedUsers = users.map(u =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        );
        setUsers(updatedUsers);
        setSuccessMsg(`User "${formData.name}" updated successfully!`);
      } else {
        // Add new user
        const registerData = {
          ...userData,
          password: formData.password || 'TempPassword123!',
          role: formData.role
        };
        const response = await authAPI.register(registerData);
        setUsers([...users, response.user]);
        setSuccessMsg(`User "${formData.name}" added successfully!`);
      }

      setShowModal(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error saving user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (u) => {
    try {
      await authAPI.deleteUser(u.id);
      const updatedUsers = users.filter(user => user.id !== u.id);
      setUsers(updatedUsers);
      setDeleteConfirm(null);
      setSuccessMsg(`User "${u.firstName} ${u.lastName}" deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error deleting user: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Users">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
            <p className="text-gray-600 mt-1">Edit, delete, or add new users</p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add New User
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
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Location</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-800">{u.name}</td>
                      <td className="py-4 px-6 text-gray-600">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' :
                          u.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{u.phone || '-'}</td>
                      <td className="py-4 px-6 text-gray-600">{u.location || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(u)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
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

        {/* User Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Leave empty to keep current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., +250 789 123 456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Kigali, Rwanda"
                />
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
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
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
                Delete User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
