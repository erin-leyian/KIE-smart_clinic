import React, { useState, useEffect } from "react";
import Modal from '../../components/Modal';
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { Edit2, FileText, AlertCircle, RotateCcw, Save, X, Calendar, Mail, Phone, MapPin, Award, Clock, User, Download } from "lucide-react";
import mockData from "../../data/mockData.json";
import { formatErrorMessage } from '../../utils/errorHandler';

export default function Profile() {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit modals
  const [showEditPersonal, setShowEditPersonal] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showSaveConsultModal, setShowSaveConsultModal] = useState(false);
  
  // Edit values
  const [editPersonal, setEditPersonal] = useState({ dob: '', age: '' });
  const [editContact, setEditContact] = useState({ phone: '', email: '', location: '' });
  
  // Online consultations
  const [consultationSettings, setConsultationSettings] = useState({
    enabled: true,
    types: { text: false, video: true, call: false },
    duration: '30 mins',
    fees: '25000'
  });
  const [savingConsult, setSavingConsult] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError('');
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (!mockData.users || !Array.isArray(mockData.users) || mockData.users.length === 0) {
          throw new Error('User profile not found. Please try again.');
        }
        if (!mockData.appointments || !Array.isArray(mockData.appointments)) {
          throw new Error('Consultation history not found.');
        }
        
        const userData = mockData.users[0];
        setUser(userData);
        setHistory(mockData.appointments);
        setEditPersonal({ dob: userData.dob, age: userData.age });
        setEditContact({ phone: userData.phone, email: userData.email, location: userData.location });
        setLoading(false);
      } catch (err) {
        const errorMessage = formatErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, []);

  const handleRetryLoadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (!mockData.users || !Array.isArray(mockData.users) || mockData.users.length === 0) {
        throw new Error('User profile not found. Please try again.');
      }
      if (!mockData.appointments || !Array.isArray(mockData.appointments)) {
        throw new Error('Consultation history not found.');
      }
      
      const userData = mockData.users[0];
      setUser(userData);
      setHistory(mockData.appointments);
      setLoading(false);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Save handlers
  const handleSavePersonal = () => {
    setUser(prev => ({ ...prev, dob: editPersonal.dob, age: editPersonal.age }));
    setShowEditPersonal(false);
  };

  const handleSaveContact = () => {
    setUser(prev => ({ ...prev, phone: editContact.phone, email: editContact.email, location: editContact.location }));
    setShowEditContact(false);
  };

  const handleSaveConsultSettings = async () => {
    setSavingConsult(true);
    await new Promise(r => setTimeout(r, 700));
    setSavingConsult(false);
    setShowSaveConsultModal(false);
  };

  return (
    <DashboardLayout title="Profile">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Profile</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetryLoadData}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading profile...</div>
      ) : user ? (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Award className="w-4 h-4" />
                  <p className="text-teal-100">{user.specialty}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <p className="text-teal-100 text-sm">{user.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b bg-white rounded-t-lg">
            {['general', 'history', 'consultations', 'documents', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'consultations' ? 'Online Consultations' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-b-lg shadow-sm p-8 space-y-6">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="border-b pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                    <button
                      onClick={() => {
                        setEditPersonal({ dob: user.dob, age: user.age });
                        setShowEditPersonal(true);
                      }}
                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <p className="text-gray-500 text-sm">Date of Birth</p>
                      </div>
                      <p className="text-gray-800 font-medium">{user.dob}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-blue-600" />
                        <p className="text-gray-500 text-sm">Age</p>
                      </div>
                      <p className="text-gray-800 font-medium">{user.age} years</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                    <button
                      onClick={() => {
                        setEditContact({ phone: user.phone, email: user.email, location: user.location });
                        setShowEditContact(true);
                      }}
                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-green-600" />
                        <p className="text-gray-500 text-sm">Phone</p>
                      </div>
                      <p className="text-gray-800 font-medium">{user.phone}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-green-600" />
                        <p className="text-gray-500 text-sm">Email</p>
                      </div>
                      <p className="text-gray-800 font-medium text-sm">{user.email}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <p className="text-gray-500 text-sm">Location</p>
                      </div>
                      <p className="text-gray-800 font-medium">{user.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Consultation History</h3>
                  <select className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:border-teal-500">
                    <option>All Time</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>

                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map(appointment => {
                      const dateObj = new Date(appointment.dateObj);
                      const day = dateObj.getDate();
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const month = monthNames[dateObj.getMonth()];
                      
                      return (
                        <div key={appointment.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-teal-400">
                          <div className="flex items-center gap-6 flex-1">
                            {/* Date Box */}
                            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 min-w-20 border border-teal-200">
                              <div className="text-2xl font-bold text-teal-700">{day}</div>
                              <div className="text-xs text-teal-600 font-semibold">{month}</div>
                              <div className="text-xs text-teal-500 font-medium">{appointment.date}</div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 text-lg">{appointment.doctorName}</p>
                              <p className="text-sm text-gray-500 mb-2">{appointment.specialty}</p>
                              <div className="flex items-center gap-4 mt-3 flex-wrap">
                                <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 text-sm font-medium">
                                  <Clock className="w-4 h-4" />
                                  {appointment.time}
                                </span>
                                <span className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-green-700 text-sm font-medium">
                                  {appointment.status === 'Completed' && '✓'}
                                  {appointment.status === 'Confirmed' && '◆'}
                                  {appointment.status === 'Pending' && '○'}
                                  {appointment.status}
                                </span>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm text-gray-600 mt-2 italic">"{appointment.notes}"</p>
                              )}
                            </div>
                          </div>

                          {/* Action */}
                          <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap">
                            <FileText className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No consultation history available.</div>
                )}
              </div>
            )}

            {/* ONLINE CONSULTATIONS TAB */}
            {activeTab === 'consultations' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Online Consultation Settings</h3>
                  <p className="text-gray-600 text-sm mb-8 max-w-3xl">
                    Set up your availability for online consultations with patients. This allows the queue management system to correctly place patients.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Availability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
                      <div className="flex space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="availability" 
                            checked={!consultationSettings.enabled}
                            onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: false }))}
                            className="w-4 h-4 text-teal-500" 
                          />
                          <span className="text-gray-700">Disable</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="availability" 
                            checked={consultationSettings.enabled}
                            onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: true }))}
                            className="w-4 h-4 text-teal-500" 
                          />
                          <span className="text-gray-700">Enable</span>
                        </label>
                      </div>
                    </div>

                    {/* Type of Availability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Type Of Availability</label>
                      <div className="flex space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={consultationSettings.types.text}
                            onChange={() => setConsultationSettings(prev => ({ 
                              ...prev, 
                              types: { ...prev.types, text: !prev.types.text } 
                            }))}
                            className="w-4 h-4 text-teal-500 rounded" 
                          />
                          <span className="text-gray-700">Text</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={consultationSettings.types.video}
                            onChange={() => setConsultationSettings(prev => ({ 
                              ...prev, 
                              types: { ...prev.types, video: !prev.types.video } 
                            }))}
                            className="w-4 h-4 text-teal-500 rounded" 
                          />
                          <span className="text-gray-700">Video</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={consultationSettings.types.call}
                            onChange={() => setConsultationSettings(prev => ({ 
                              ...prev, 
                              types: { ...prev.types, call: !prev.types.call } 
                            }))}
                            className="w-4 h-4 text-teal-500 rounded" 
                          />
                          <span className="text-gray-700">Call</span>
                        </label>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <select 
                        value={consultationSettings.duration}
                        onChange={(e) => setConsultationSettings(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      >
                        <option>15 mins</option>
                        <option>30 mins</option>
                        <option>45 mins</option>
                        <option>1 hour</option>
                      </select>
                    </div>

                    {/* Fees */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                      <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">
                        <span className="bg-gray-50 px-4 py-2.5 text-gray-500 border-r font-medium">RWF</span>
                        <input 
                          type="number" 
                          value={consultationSettings.fees}
                          onChange={(e) => setConsultationSettings(prev => ({ ...prev, fees: e.target.value }))}
                          className="flex-1 p-2.5 outline-none w-full" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition">
                    Cancel
                  </button>
                  <button 
                    onClick={() => setShowSaveConsultModal(true)}
                    className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition shadow-sm"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No documents available yet.</p>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Account Settings</h3>
                
                <div className="border-b pb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about appointments and consultations</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600" />
                  </div>
                </div>

                <div className="border-b pb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-teal-600" />
                  </div>
                </div>

                <div className="pt-4">
                  <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Edit Personal Modal */}
      <Modal
        isOpen={showEditPersonal}
        onClose={() => setShowEditPersonal(false)}
        title="Edit Personal Information"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={editPersonal.dob}
              onChange={e => setEditPersonal(prev => ({ ...prev, dob: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={editPersonal.age}
              onChange={e => setEditPersonal(prev => ({ ...prev, age: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleSavePersonal}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={() => setShowEditPersonal(false)}
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={showEditContact}
        onClose={() => setShowEditContact(false)}
        title="Edit Contact Information"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={editContact.phone}
              onChange={e => setEditContact(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={editContact.email}
              onChange={e => setEditContact(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={editContact.location}
              onChange={e => setEditContact(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleSaveContact}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={() => setShowEditContact(false)}
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Save Consultation Settings Modal */}
      <Modal
        isOpen={showSaveConsultModal}
        onClose={() => setShowSaveConsultModal(false)}
        title="Save Consultation Settings"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to save these online consultation settings?</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong> {consultationSettings.enabled ? 'Enabled' : 'Disabled'}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Types:</strong> {Object.entries(consultationSettings.types).filter(([_, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') || 'None selected'}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Duration:</strong> {consultationSettings.duration}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Fee:</strong> {consultationSettings.fees} RWF
            </p>
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleSaveConsultSettings}
              disabled={savingConsult}
              className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              {savingConsult ? 'Saving...' : 'Confirm & Save'}
            </button>
            <button
              onClick={() => setShowSaveConsultModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}