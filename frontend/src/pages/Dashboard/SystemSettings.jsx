import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Modal from '../../components/Modal';
import mockData from '../../data/mockData.json';
import { Settings, Edit, Trash2, Plus, Check, AlertCircle } from 'lucide-react';

export default function SystemSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [insuranceProviders, setInsuranceProviders] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hospitals');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({});

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
    setHospitals(mockData.hospitals || []);
    setInsuranceProviders(mockData.insurance || []);
    setMedicalConditions(mockData.medicalConditions || []);
    setLoading(false);
  }, [navigate]);

  // Hospital Handlers
  const handleAddHospital = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      location: '',
      phone: '',
      type: '',
      rating: 4.5,
      reviews: 0,
    });
    setShowModal(true);
  };

  const handleEditHospital = (h) => {
    setEditingItem({ type: 'hospital', id: h.id });
    setFormData(h);
    setShowModal(true);
  };

  const handleSaveHospital = () => {
    if (!formData.name || !formData.location) {
      alert('Name and Location are required');
      return;
    }

    if (editingItem?.type === 'hospital' && editingItem.id) {
      const updated = hospitals.map(h =>
        h.id === editingItem.id ? { ...h, ...formData } : h
      );
      setHospitals(updated);
      setSuccessMsg('Hospital updated successfully!');
    } else {
      const newHospital = {
        id: Math.max(...hospitals.map(h => h.id), 0) + 1,
        image: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=300&h=200&fit=crop',
        ...formData,
      };
      setHospitals([...hospitals, newHospital]);
      setSuccessMsg('Hospital added successfully!');
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteHospital = (h) => {
    const updated = hospitals.filter(hospital => hospital.id !== h.id);
    setHospitals(updated);
    setDeleteConfirm(null);
    setSuccessMsg('Hospital deleted successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Insurance Handlers
  const handleAddInsurance = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      fullName: '',
      type: '',
      coverage: '',
      conditions: '',
    });
    setShowModal(true);
  };

  const handleEditInsurance = (i) => {
    setEditingItem({ type: 'insurance', id: i.id });
    setFormData(i);
    setShowModal(true);
  };

  const handleSaveInsurance = () => {
    if (!formData.name) {
      alert('Name is required');
      return;
    }

    if (editingItem?.type === 'insurance' && editingItem.id) {
      const updated = insuranceProviders.map(i =>
        i.id === editingItem.id ? { ...i, ...formData } : i
      );
      setInsuranceProviders(updated);
      setSuccessMsg('Insurance provider updated successfully!');
    } else {
      const newInsurance = {
        id: Math.max(...insuranceProviders.map(i => i.id), 0) + 1,
        benefits: [],
        ...formData,
      };
      setInsuranceProviders([...insuranceProviders, newInsurance]);
      setSuccessMsg('Insurance provider added successfully!');
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteInsurance = (i) => {
    const updated = insuranceProviders.filter(insurance => insurance.id !== i.id);
    setInsuranceProviders(updated);
    setDeleteConfirm(null);
    setSuccessMsg('Insurance provider deleted successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Medical Conditions Handlers
  const handleAddCondition = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      prevalence: '',
      icon: '',
      treatments: [],
    });
    setShowModal(true);
  };

  const handleEditCondition = (c) => {
    setEditingItem({ type: 'condition', id: c.id });
    setFormData(c);
    setShowModal(true);
  };

  const handleSaveCondition = () => {
    if (!formData.name) {
      alert('Condition name is required');
      return;
    }

    if (editingItem?.type === 'condition' && editingItem.id) {
      const updated = medicalConditions.map(c =>
        c.id === editingItem.id ? { ...c, ...formData } : c
      );
      setMedicalConditions(updated);
      setSuccessMsg('Medical condition updated successfully!');
    } else {
      const newCondition = {
        id: Math.max(...medicalConditions.map(c => c.id), 0) + 1,
        specialists: [],
        ...formData,
      };
      setMedicalConditions([...medicalConditions, newCondition]);
      setSuccessMsg('Medical condition added successfully!');
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteCondition = (c) => {
    const updated = medicalConditions.filter(condition => condition.id !== c.id);
    setMedicalConditions(updated);
    setDeleteConfirm(null);
    setSuccessMsg('Medical condition deleted successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (loading) {
    return (
      <DashboardLayout title="System Settings">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings size={32} className="text-teal-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
            <p className="text-gray-600">Manage hospitals, insurance, and medical conditions</p>
          </div>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <Check size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'hospitals'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Hospitals ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'insurance'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Insurance Providers ({insuranceProviders.length})
          </button>
          <button
            onClick={() => setActiveTab('conditions')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'conditions'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Medical Conditions ({medicalConditions.length})
          </button>
        </div>

        {/* Hospitals Tab */}
        {activeTab === 'hospitals' && (
          <div>
            <button
              onClick={handleAddHospital}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors mb-4"
            >
              <Plus size={18} />
              Add Hospital
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map(h => (
                <div key={h.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-32 bg-gradient-to-r from-teal-400 to-teal-600"></div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800">{h.name}</h3>
                    <p className="text-sm text-teal-600 font-medium">{h.type}</p>
                    <p className="text-sm text-gray-600 mt-2">{h.location}</p>
                    <p className="text-sm text-gray-600">{h.phone}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditHospital(h)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'hospital', item: h })}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insurance Tab */}
        {activeTab === 'insurance' && (
          <div>
            <button
              onClick={handleAddInsurance}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors mb-4"
            >
              <Plus size={18} />
              Add Insurance Provider
            </button>

            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Coverage</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceProviders.map(i => (
                      <tr key={i.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-800">{i.name}</td>
                        <td className="py-4 px-6 text-gray-600">{i.type}</td>
                        <td className="py-4 px-6 text-gray-600">{i.coverage}</td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditInsurance(i)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'insurance', item: i })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Medical Conditions Tab */}
        {activeTab === 'conditions' && (
          <div>
            <button
              onClick={handleAddCondition}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors mb-4"
            >
              <Plus size={18} />
              Add Condition
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medicalConditions.map(c => (
                <div key={c.id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{c.icon}</div>
                    <div className="text-xs font-medium px-2 py-1 bg-teal-100 text-teal-700 rounded">
                      {c.prevalence}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{c.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{c.description}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditCondition(c)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'condition', item: c })}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            {activeTab === 'hospitals' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {editingItem ? 'Edit Hospital' : 'Add Hospital'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input
                      type="text"
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Private Hospital, Government Hospital"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating || 4.5}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      onClick={handleSaveHospital}
                      className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
                    >
                      Save Hospital
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'insurance' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {editingItem ? 'Edit Insurance' : 'Add Insurance'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input
                      type="text"
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage</label>
                    <input
                      type="text"
                      value={formData.coverage || ''}
                      onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., 85%"
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
                      onClick={handleSaveInsurance}
                      className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
                    >
                      Save Insurance
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'conditions' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {editingItem ? 'Edit Condition' : 'Add Condition'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prevalence</label>
                    <select
                      value={formData.prevalence || ''}
                      onChange={(e) => setFormData({ ...formData, prevalence: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select...</option>
                      <option value="High">High</option>
                      <option value="Common">Common</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Rare">Rare</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="🦟"
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
                      onClick={handleSaveCondition}
                      className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
                    >
                      Save Condition
                    </button>
                  </div>
                </div>
              </>
            )}
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
              Are you sure you want to delete <strong>{deleteConfirm.item.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'hospital') {
                    handleDeleteHospital(deleteConfirm.item);
                  } else if (deleteConfirm.type === 'insurance') {
                    handleDeleteInsurance(deleteConfirm.item);
                  } else if (deleteConfirm.type === 'condition') {
                    handleDeleteCondition(deleteConfirm.item);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
