import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Clock, User, AlertCircle, Edit2, Save, X, Plus, FileText, Download, MessageSquare, Pill, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import mockData from '../../data/mockData.json';
import { formatErrorMessage } from '../../utils/errorHandler';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Status colors and badge styling
const STATUS_CONFIG = {
  'Past': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  'Today': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'Upcoming': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
};

const CLINIC_LOGO = 'https://via.placeholder.com/150x50?text=Smart+Clinic';

export default function PatientRecords() {
  // State for records and records
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState('doctor'); // 'doctor' or 'patient'
  
  // Modal states
  const [detailModal, setDetailModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [consultationModal, setConsultationModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [medicationsModal, setMedicationsModal] = useState(false);
  
  // Selected/Editing record
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    doctorName: '',
    issue: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    documents: false,
    status: 'Today',
    consultations: [],
    allNotes: '',
    medications: []
  });

  // Consultation states
  const [newConsultation, setNewConsultation] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    doctorName: '',
    notes: '',
    suggestedMedications: []
  });

  const [editingNotes, setEditingNotes] = useState('');
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    status: 'Active'
  });

  // Filter states
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch patient records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate data
      if (!mockData.patientRecords || !Array.isArray(mockData.patientRecords) || mockData.patientRecords.length === 0) {
        throw new Error('No patient records found. Please try again.');
      }
      
      setRecords(mockData.patientRecords);
      setLoading(false);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter records
  const filteredRecords = records.filter(record => {
    const recordDate = record.date.substring(0, 7);
    const matchStatus = filterStatus === 'All' || record.status === filterStatus;
    const matchMonth = recordDate === filterMonth;
    const matchSearch = 
      record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchStatus && matchMonth && matchSearch;
  });

  // Handle edit record
  const handleEditRecord = (record) => {
    setEditingRecord({ ...record });
    setSelectedRecord(record);
    setDetailModal(false);
    setEditModal(true);
  };

  // Handle save edited record
  const handleSaveRecord = () => {
    if (!editingRecord.patientName || !editingRecord.diagnosis || !editingRecord.treatment) {
      alert('Please fill in all required fields');
      return;
    }
    
    const updatedRecords = records.map(r => 
      r.id === editingRecord.id ? editingRecord : r
    );
    setRecords(updatedRecords);
    setEditModal(false);
    setEditingRecord(null);
    setSelectedRecord(null);
  };

  // Handle add new record
  const handleAddRecord = () => {
    if (!newRecord.patientName || !newRecord.diagnosis || !newRecord.treatment) {
      alert('Please fill in all required fields');
      return;
    }
    
    const record = {
      id: String(records.length + 1),
      ...newRecord,
      day: new Date(newRecord.date).toLocaleDateString('en-US', { weekday: 'short' })
    };
    
    setRecords([...records, record]);
    setAddModal(false);
    setNewRecord({
      patientName: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      doctorName: '',
      issue: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      documents: false,
      status: 'Today'
    });
  };

  // Handle delete record
  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
      setDetailModal(false);
      setSelectedRecord(null);
    }
  };

  return (
    <DashboardLayout title="Patient Records">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Records</h3>
              <p className="text-red-700 text-sm mt-1">{formatErrorMessage(error)}</p>
            </div>
          </div>
          <button
            onClick={fetchRecords}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      )}

      {/* Header with Search and New Record Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by patient name, issue, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
          />
        </div>
        {userRole === 'doctor' && (
          <button
            onClick={() => {
              setNewRecord({
                patientName: '',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                doctorName: '',
                issue: '',
                diagnosis: '',
                treatment: '',
                notes: '',
                documents: false
              });
              setAddModal(true);
            }}
            className="ml-4 flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Record</span>
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <div className="flex bg-white rounded-lg p-1 border shadow-sm">
          {['All', 'Past', 'Today', 'Upcoming'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterStatus === status
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Record Detail Modal */}
      <Modal
        isOpen={detailModal && selectedRecord}
        onClose={() => {
          setDetailModal(false);
          setSelectedRecord(null);
        }}
        title={selectedRecord?.patientName}
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Date</p>
                <p className="text-gray-800">{selectedRecord.date}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Time</p>
                <p className="text-gray-800">{selectedRecord.time}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Doctor</p>
                <p className="text-gray-800">{selectedRecord.doctorName}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[selectedRecord.status].bg} ${STATUS_CONFIG[selectedRecord.status].text}`}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-gray-600 font-medium mb-2">Issue</p>
              <p className="text-gray-800">{selectedRecord.issue}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-2">Diagnosis</p>
              <p className="text-gray-800">{selectedRecord.diagnosis}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-2">Treatment</p>
              <p className="text-gray-800">{selectedRecord.treatment}</p>
            </div>
            {selectedRecord.notes && (
              <div>
                <p className="text-gray-600 font-medium mb-2">Notes</p>
                <p className="text-gray-800">{selectedRecord.notes}</p>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm">
              {selectedRecord.documents && <FileText className="w-4 h-4 text-teal-500" />}
              <span className="text-gray-600">{selectedRecord.documents ? 'Documents attached' : 'No documents'}</span>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              {userRole === 'doctor' && (
                <button
                  onClick={() => {
                    setDetailModal(false);
                    handleEditRecord(selectedRecord);
                  }}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              <button
                onClick={() => {
                  setDetailModal(false);
                  setSelectedRecord(null);
                }}
                className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Record Modal */}
      <Modal
        isOpen={editModal && editingRecord}
        onClose={() => {
          setEditModal(false);
          setEditingRecord(null);
        }}
        title="Edit Patient Record"
        size="lg"
      >
        {editingRecord && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
              <input
                type="text"
                value={editingRecord.patientName}
                onChange={(e) => setEditingRecord({ ...editingRecord, patientName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingRecord.date}
                  onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={editingRecord.time}
                  onChange={(e) => setEditingRecord({ ...editingRecord, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select
                value={editingRecord.doctorName}
                onChange={(e) => setEditingRecord({ ...editingRecord, doctorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              >
                <option value="">Select a doctor</option>
                {mockData.doctors.map(doc => (
                  <option key={doc.id} value={doc.name}>{doc.name} - {doc.specialty}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
              <input
                type="text"
                value={editingRecord.issue}
                onChange={(e) => setEditingRecord({ ...editingRecord, issue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
              <textarea
                value={editingRecord.diagnosis}
                onChange={(e) => setEditingRecord({ ...editingRecord, diagnosis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment *</label>
              <textarea
                value={editingRecord.treatment}
                onChange={(e) => setEditingRecord({ ...editingRecord, treatment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={editingRecord.notes}
                onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                rows="2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="documents"
                checked={editingRecord.documents}
                onChange={(e) => setEditingRecord({ ...editingRecord, documents: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="documents" className="text-sm text-gray-700">Attach documents</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editingRecord.status}
                onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              >
                <option value="Past">Past</option>
                <option value="Today">Today</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={handleSaveRecord}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setEditModal(false);
                  setEditingRecord(null);
                }}
                className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add New Record Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => {
          setAddModal(false);
          setNewRecord({
            patientName: '',
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            doctorName: '',
            issue: '',
            diagnosis: '',
            treatment: '',
            notes: '',
            documents: false
          });
        }}
        title="Add New Patient Record"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
            <input
              type="text"
              placeholder="Enter patient name"
              value={newRecord.patientName}
              onChange={(e) => setNewRecord({ ...newRecord, patientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={newRecord.time}
                onChange={(e) => setNewRecord({ ...newRecord, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              value={newRecord.doctorName}
              onChange={(e) => setNewRecord({ ...newRecord, doctorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            >
              <option value="">Select a doctor</option>
              {mockData.doctors.map(doc => (
                <option key={doc.id} value={doc.name}>{doc.name} - {doc.specialty}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
            <input
              type="text"
              placeholder="e.g., Headache, Fever, etc."
              value={newRecord.issue}
              onChange={(e) => setNewRecord({ ...newRecord, issue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
            <textarea
              placeholder="Enter diagnosis"
              value={newRecord.diagnosis}
              onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment *</label>
            <textarea
              placeholder="Enter treatment plan"
              value={newRecord.treatment}
              onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              placeholder="Additional notes (optional)"
              value={newRecord.notes}
              onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              rows="2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="newDocuments"
              checked={newRecord.documents}
              onChange={(e) => setNewRecord({ ...newRecord, documents: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="newDocuments" className="text-sm text-gray-700">Attach documents</label>
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleAddRecord}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>
            <button
              onClick={() => {
                setAddModal(false);
                setNewRecord({
                  patientName: '',
                  date: new Date().toISOString().split('T')[0],
                  time: '10:00',
                  doctorName: '',
                  issue: '',
                  diagnosis: '',
                  treatment: '',
                  notes: '',
                  documents: false
                });
              }}
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Records List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading records...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No patient records found.</div>
        ) : (
          filteredRecords.map(record => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{record.patientName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[record.status].bg} ${STATUS_CONFIG[record.status].text}`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{record.date} at {record.time}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Dr. {record.doctorName}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Issue:</span> {record.issue}</p>
                  <p className="text-sm text-gray-700 mb-3"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>
                  <div className="flex items-center space-x-3">
                    {record.documents && (
                      <button className="flex items-center space-x-1 text-teal-500 hover:text-teal-600 text-sm">
                        <FileText className="w-4 h-4" />
                        <span>View Documents</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setDetailModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
                {userRole === 'doctor' && (
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
