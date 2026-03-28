import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Clock, User, AlertCircle, RotateCcw, Edit2, Save, X, Plus, FileText, CheckCircle, AlertCircle as AlertIcon } from 'lucide-react';
import mockData from '../../data/mockData.json';
import { formatErrorMessage } from '../../utils/errorHandler';

// Status colors and badge styling
const STATUS_CONFIG = {
  'Past': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  'Today': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'Upcoming': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
};

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
  
  // Selected/Editing record
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
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
    status: 'Today'
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
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchRecords}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            title="Retry loading records"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      )}
      
      {/* Record Detail Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.patient}
        size="md"
        actions={[
          { label: 'Close', onClick: () => setSelectedRecord(null), variant: 'secondary' }
        ]}
      >
        {selectedRecord ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Issue: <span className="font-medium text-gray-800">{selectedRecord.issue}</span></p>
            <p className="text-sm text-gray-600">Time: <span className="font-medium text-gray-800">{selectedRecord.time}</span></p>
            {selectedRecord.hasDocs ? (
              <div>
                <p className="text-sm text-gray-600">Documents available.</p>
                <a href="#" className="text-teal-500 hover:underline">Open documents</a>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No documents attached.</p>
            )}
          </div>
        ) : null}
      </Modal>
      {/* Tabs / Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-white rounded-lg p-1 border shadow-sm w-96">
          <button className="flex-1 py-2 text-sm font-medium text-gray-800 bg-gray-50 rounded-md">Yesterday</button>
          <button className="flex-1 py-2 text-sm font-medium text-gray-500">Today</button>
          <button className="flex-1 py-2 text-sm font-medium text-gray-500">Past</button>
        </div>
        <select className="border bg-white px-4 py-2 rounded-lg text-sm shadow-sm outline-none">
          <option>May '25</option>
          <option>Jun '25</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-200">
          Error loading records: {error}
        </div>
      )}

      {/* Record List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No patient records found.</div>
        ) : (
          records.map(record => (
            <div key={record.id} className="bg-white border rounded-xl p-4 flex items-center shadow-sm">
              <div className="text-center px-6 border-r border-gray-100 min-w[80px]">
                <p className="text-xs text-gray-500 font-semibold">{record.day}</p>
                <p className="text-2xl font-bold text-gray-800">{record.date}</p>
              </div>
              
              <div className="flex-1 px-8 grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" /> {record.time}
                  </p>
                  <p className="flex items-center font-medium text-gray-800">
                    <User className="w-4 h-4 mr-2" /> {record.patient}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">Issue: {record.issue}</p>
                  {record.hasDocs ? (
                    <button onClick={() => setSelectedRecord(record)} className="text-teal-500 hover:underline">View Documents</button>
                  ) : (
                    <p className="text-gray-400">-</p>
                  )}
                </div>
              </div>

              <div className="px-6">
                <button onClick={() => setSelectedRecord(record)} className="border px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Edit ∨
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
