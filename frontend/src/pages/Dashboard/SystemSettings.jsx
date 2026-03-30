import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { systemSettingsAPI } from '../../services/api';
import { Settings, Edit, Trash2, Plus, Check, AlertCircle, X } from 'lucide-react';

// Simple Modal Component for this page
function SimpleModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-4 border-b">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SystemSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [insuranceProviders, setInsuranceProviders] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hospitals');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({});

  // Initialize data
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
    initializeData();
  }, [navigate]);

  const initializeData = async () => {
    try {
      // Load from API
      const [hospitalsRes, insuranceRes, conditionsRes] = await Promise.all([
        systemSettingsAPI.getHospitals().catch(() => ({ hospitals: [] })),
        systemSettingsAPI.getInsuranceProviders().catch(() => ({ insurance: [] })),
        systemSettingsAPI.getMedicalConditions().catch(() => ({ conditions: [] }))
      ]);

      setHospitals(hospitalsRes.hospitals || hospitalsRes.data || []);
      setInsuranceProviders(insuranceRes.insurance || insuranceRes.data || []);
      setMedicalConditions(conditionsRes.conditions || conditionsRes.data || []);
    } catch (error) {
      console.error('Error loading system settings:', error);
      setErrorMsg('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  // Persist data to localStorage
  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      setErrorMsg(`Failed to save changes. Please try again.`);
    }
  };

  const showSuccess = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (message) => {
    setErrorMsg(message);
    setTimeout(() => setErrorMsg(''), 3000);
  };

  // =============== HOSPITAL HANDLERS ===============

  const handleAddHospital = () => {
    setEditingId(null);
    setModalMode('add');
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
    setEditingId(h.id);
    setModalMode('edit');
    setFormData({ ...h });
    setShowModal(true);
  };

  const handleSaveHospital = async () => {
    if (!formData.name?.trim()) {
      showError('Hospital name is required');
      return;
    }
    if (!formData.location?.trim()) {
      showError('Location is required');
      return;
    }

    try {
      if (modalMode === 'edit' && editingId !== null) {
        // Call API to update hospital
        await systemSettingsAPI.updateHospital(editingId, {
          name: formData.name,
          location: formData.location,
          phone: formData.phone,
          type: formData.type,
          rating: formData.rating,
          reviews: formData.reviews
        });

        const updatedHospitals = hospitals.map(h =>
          h.id === editingId ? { ...h, ...formData } : h
        );
        setHospitals(updatedHospitals);
        showSuccess('Hospital updated successfully!');
      } else {
        // Call API to create hospital
        const response = await systemSettingsAPI.createHospital({
          name: formData.name,
          location: formData.location,
          phone: formData.phone || '',
          type: formData.type || '',
          rating: formData.rating || 4.5,
          reviews: formData.reviews || 0
        });

        const newHospital = {
          id: response.data?.id || (hospitals.length > 0 ? Math.max(...hospitals.map(h => h.id), 0) + 1 : 1),
          image: formData.image || 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=300&h=200&fit=crop',
          ...formData,
        };
        setHospitals([...hospitals, newHospital]);
        showSuccess('Hospital added successfully!');
      }
      
      setShowModal(false);
    } catch (err) {
      console.error('Error saving hospital:', err);
      showError('Failed to save hospital. Please try again.');
    }
  };

  const handleDeleteHospital = async (h) => {
    try {
      // Call API to delete hospital
      await systemSettingsAPI.deleteHospital(h.id);
      
      const updatedHospitals = hospitals.filter(hospital => hospital.id !== h.id);
      setHospitals(updatedHospitals);
      setDeleteConfirm(null);
      showSuccess('Hospital deleted successfully!');
    } catch (err) {
      console.error('Error deleting hospital:', err);
      showError('Failed to delete hospital. Please try again.');
    }
  };

  // =============== INSURANCE HANDLERS ===============

  const handleAddInsurance = () => {
    setEditingId(null);
    setModalMode('add');
    setFormData({
      name: '',
      fullName: '',
      type: '',
      coverage: '',
      conditions: '',
      benefits: [],
    });
    setShowModal(true);
  };

  const handleEditInsurance = (i) => {
    setEditingId(i.id);
    setModalMode('edit');
    setFormData({ ...i });
    setShowModal(true);
  };

  const handleSaveInsurance = async () => {
    if (!formData.name?.trim()) {
      showError('Insurance name is required');
      return;
    }

    try {
      if (modalMode === 'edit' && editingId !== null) {
        // Call API to update insurance provider
        await systemSettingsAPI.updateInsuranceProvider(editingId, {
          name: formData.name,
          fullName: formData.fullName,
          type: formData.type,
          coverage: formData.coverage,
          conditions: formData.conditions,
          benefits: formData.benefits || []
        });

        const updatedInsurance = insuranceProviders.map(i =>
          i.id === editingId ? { ...i, ...formData } : i
        );
        setInsuranceProviders(updatedInsurance);
        showSuccess('Insurance provider updated successfully!');
      } else {
        // Call API to create insurance provider
        const response = await systemSettingsAPI.createInsuranceProvider({
          name: formData.name,
          fullName: formData.fullName || '',
          type: formData.type || '',
          coverage: formData.coverage || '',
          conditions: formData.conditions || '',
          benefits: formData.benefits || []
        });

        const newInsurance = {
          id: response.data?.id || (insuranceProviders.length > 0 ? Math.max(...insuranceProviders.map(i => i.id), 0) + 1 : 1),
          benefits: formData.benefits || [],
          ...formData,
        };
        setInsuranceProviders([...insuranceProviders, newInsurance]);
        showSuccess('Insurance provider added successfully!');
      }

      setShowModal(false);
    } catch (err) {
      console.error('Error saving insurance provider:', err);
      showError('Failed to save insurance provider. Please try again.');
    }
  };

  const handleDeleteInsurance = async (i) => {
    try {
      // Call API to delete insurance provider
      await systemSettingsAPI.deleteInsuranceProvider(i.id);
      
      const updatedInsurance = insuranceProviders.filter(insurance => insurance.id !== i.id);
      setInsuranceProviders(updatedInsurance);
      setDeleteConfirm(null);
      showSuccess('Insurance provider deleted successfully!');
    } catch (err) {
      console.error('Error deleting insurance provider:', err);
      showError('Failed to delete insurance provider. Please try again.');
    }
  };

  // =============== MEDICAL CONDITIONS HANDLERS ===============

  const handleAddCondition = () => {
    setEditingId(null);
    setModalMode('add');
    setFormData({
      name: '',
      description: '',
      prevalence: '',
      icon: '',
      treatments: [],
      specialists: [],
    });
    setShowModal(true);
  };

  const handleEditCondition = (c) => {
    setEditingId(c.id);
    setModalMode('edit');
    setFormData({ ...c });
    setShowModal(true);
  };

  const handleSaveCondition = async () => {
    if (!formData.name?.trim()) {
      showError('Condition name is required');
      return;
    }

    try {
      if (modalMode === 'edit' && editingId !== null) {
        // Call API to update medical condition
        await systemSettingsAPI.updateMedicalCondition(editingId, {
          name: formData.name,
          description: formData.description,
          prevalence: formData.prevalence,
          icon: formData.icon,
          treatments: formData.treatments || [],
          specialists: formData.specialists || []
        });

        const updatedConditions = medicalConditions.map(c =>
          c.id === editingId ? { ...c, ...formData } : c
        );
        setMedicalConditions(updatedConditions);
        showSuccess('Medical condition updated successfully!');
      } else {
        // Call API to create medical condition
        const response = await systemSettingsAPI.createMedicalCondition({
          name: formData.name,
          description: formData.description || '',
          prevalence: formData.prevalence || '',
          icon: formData.icon || '',
          treatments: formData.treatments || [],
          specialists: formData.specialists || []
        });

        const newCondition = {
          id: response.data?.id || (medicalConditions.length > 0 ? Math.max(...medicalConditions.map(c => c.id), 0) + 1 : 1),
          specialists: formData.specialists || [],
          ...formData,
        };
        setMedicalConditions([...medicalConditions, newCondition]);
        showSuccess('Medical condition added successfully!');
      }

      setShowModal(false);
    } catch (err) {
      console.error('Error saving medical condition:', err);
      showError('Failed to save medical condition. Please try again.');
    }
  };

  const handleDeleteCondition = async (c) => {
    try {
      // Call API to delete medical condition
      await systemSettingsAPI.deleteMedicalCondition(c.id);
      
      const updatedConditions = medicalConditions.filter(condition => condition.id !== c.id);
      setMedicalConditions(updatedConditions);
      setDeleteConfirm(null);
      showSuccess('Medical condition deleted successfully!');
    } catch (err) {
      console.error('Error deleting medical condition:', err);
      showError('Failed to delete medical condition. Please try again.');
    }
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
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-fade-in">
            <Check size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fade-in">
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
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

            {hospitals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No hospitals added yet</div>
            ) : (
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
            )}
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

            {insuranceProviders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No insurance providers added yet</div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Full Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Coverage</th>
                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insuranceProviders.map(i => (
                        <tr key={i.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-medium text-gray-800">{i.name}</td>
                          <td className="py-4 px-6 text-gray-600">{i.fullName}</td>
                          <td className="py-4 px-6 text-gray-600">{i.type}</td>
                          <td className="py-4 px-6 text-gray-600">{i.coverage}</td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditInsurance(i)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'insurance', item: i })}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
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
            )}
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

            {medicalConditions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No medical conditions added yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {medicalConditions.map(c => (
                  <div key={c.id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{c.icon || '🏥'}</div>
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
            )}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <SimpleModal isOpen={showModal} onClose={() => setShowModal(false)}>
        {activeTab === 'hospitals' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {modalMode === 'edit' ? 'Edit Hospital' : 'Add Hospital'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Hospital name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Hospital location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+250 XXX XXX XXX"
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
                  {modalMode === 'edit' ? 'Update Hospital' : 'Add Hospital'}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'insurance' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {modalMode === 'edit' ? 'Edit Insurance' : 'Add Insurance'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., RSSB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Rwanda Social Security Board"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select...</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Community-based">Community-based</option>
                  <option value="No Insurance">No Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Percentage</label>
                <input
                  type="text"
                  value={formData.coverage || ''}
                  onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 85%"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conditions/Notes</label>
                <textarea
                  value={formData.conditions || ''}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  rows="2"
                  placeholder="e.g., For formal sector employees"
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
                  {modalMode === 'edit' ? 'Update Insurance' : 'Add Insurance'}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'conditions' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {modalMode === 'edit' ? 'Edit Condition' : 'Add Condition'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Malaria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  rows="2"
                  placeholder="Brief description of the condition"
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
                  maxLength="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatments (comma-separated)</label>
                <textarea
                  value={Array.isArray(formData.treatments) ? formData.treatments.join(', ') : formData.treatments || ''}
                  onChange={(e) => setFormData({ ...formData, treatments: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  rows="2"
                  placeholder="e.g., Artemisinin-based, Chloroquine, Quinine"
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
                  {modalMode === 'edit' ? 'Update Condition' : 'Add Condition'}
                </button>
              </div>
            </div>
          </>
        )}
      </SimpleModal>

      {/* Delete Confirmation Modal */}
      <SimpleModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <AlertCircle size={24} />
          <h2 className="text-xl font-bold">Confirm Delete</h2>
        </div>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <strong>{deleteConfirm?.item?.name}</strong>? This action cannot be undone.
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
              if (deleteConfirm?.type === 'hospital') {
                handleDeleteHospital(deleteConfirm.item);
              } else if (deleteConfirm?.type === 'insurance') {
                handleDeleteInsurance(deleteConfirm.item);
              } else if (deleteConfirm?.type === 'condition') {
                handleDeleteCondition(deleteConfirm.item);
              }
            }}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </SimpleModal>
    </DashboardLayout>
  );
}
