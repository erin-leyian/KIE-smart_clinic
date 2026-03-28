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

  // Download PDF with watermark
  const downloadPDF = async (record) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

      // Helper function to add watermark to a page
      const addWatermarkToPage = (pageIndex) => {
        doc.setPage(pageIndex);
        
        // Create watermark using a tilted visual - draw it as multiple angled positions
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(70);
        doc.setFont('helvetica', 'normal');
        // Draw CONFIDENTIAL diagonally by using the text command with calculations
        // We'll simulate a 45-degree angle by drawing the text at a diagonal position
        const text = 'CONFIDENTIAL';
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;
        
        // Draw text positioned diagonally across center (top-left to bottom-right)
        // Position 1: Upper left area
        doc.text(text, centerX - 90, centerY - 40);
      };

      // Helper function to wrap text
      const wrapText = (text, maxWidth) => {
        if (!text) return [];
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          const textWidth = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize() / doc.internal.scaleFactor;
          if (textWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      // Add watermark to first page
      addWatermarkToPage(1);
      
      let currentY = 15;

      // Header with QueueCare logo
      doc.setFontSize(24);
      doc.setTextColor(0, 128, 128); // Teal
      
      // Simply display QueueCare without problematic Unicode characters
      doc.text('QueueCare', 15, 18);

      // Add a simple colored bar as accent
      doc.setDrawColor(0, 128, 128);

      
      currentY = 26;

      // Separator line
      doc.setDrawColor(0, 128, 128);
      doc.setLineWidth(0.5);
      doc.line(15, currentY, pageWidth - 15, currentY);
      
      currentY += 10;

      // Document title
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('PATIENT MEDICAL RECORD', 15, currentY);
      
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | ID: ${record.id}`, 15, currentY + 5);

      currentY += 12;

      // Patient Information Section
      doc.setFontSize(10);
      doc.setTextColor(0, 128, 128);
      doc.text('PATIENT INFORMATION', 15, currentY);
      currentY += 6;
      
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('Name:', 15, currentY);
      doc.setFont(undefined, 'normal');
      doc.text(String(record.patientName || ''), 45, currentY);
      
      currentY += 5;
      doc.setFont(undefined, 'bold');
      doc.text('Issue:', 15, currentY);
      doc.setFont(undefined, 'normal');
      doc.text(String(record.issue || '').substring(0, 75), 45, currentY);
      
      currentY += 5;
      doc.setFont(undefined, 'bold');
      doc.text('Diagnosis:', 15, currentY);
      doc.setFont(undefined, 'normal');
      doc.text(String(record.diagnosis || '').substring(0, 75), 45, currentY);

      currentY += 10;

      // Appointment Details Section
      doc.setFontSize(10);
      doc.setTextColor(0, 128, 128);
      doc.text('APPOINTMENT DETAILS', 15, currentY);
      currentY += 5;
      
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(15, currentY - 2, pageWidth - 30, 20);
      
      doc.setFont(undefined, 'bold');
      doc.text('Date:', 20, currentY + 2);
      doc.setFont(undefined, 'normal');
      doc.text(String(record.date || ''), 45, currentY + 2);
      
      doc.setFont(undefined, 'bold');
      doc.text('Time:', 120, currentY + 2);
      doc.setFont(undefined, 'normal');
      doc.text(String(record.time || ''), 140, currentY + 2);
      
      doc.setFont(undefined, 'bold');
      doc.text('Doctor:', 20, currentY + 8);
      doc.setFont(undefined, 'normal');
      doc.text(`Dr. ${record.doctorName || ''}`, 45, currentY + 8);
      
      doc.setFont(undefined, 'bold');
      doc.text('Status:', 120, currentY + 8);
      doc.setFont(undefined, 'normal');
      doc.text(String(record.status || ''), 140, currentY + 8);
      
      currentY += 24;

      // Consultations Section
      if (record.consultations && record.consultations.length > 0) {
        if (currentY > pageHeight - 50) {
          doc.addPage();
          addWatermarkToPage(doc.internal.pages.length - 1);
          currentY = 15;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(0, 128, 128);
        doc.text('CONSULTATION HISTORY', 15, currentY);
        currentY += 6;
        
        record.consultations.forEach((c, idx) => {
          if (currentY > pageHeight - 40) {
            doc.addPage();
            addWatermarkToPage(doc.internal.pages.length - 1);
            currentY = 15;
          }
          
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.2);
          doc.rect(15, currentY - 1, pageWidth - 30, 12);
          
          doc.setFontSize(8);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`Consultation ${idx + 1} - ${c.date} | Dr. ${c.doctorName}`, 20, currentY + 2);
          
          doc.setFontSize(7);
          doc.setFont(undefined, 'normal');
          const noteText = String(c.notes || '').substring(0, 90);
          doc.text(`${noteText}`, 20, currentY + 7);
          
          currentY += 14;
        });
      }

      // Medications Section
      if (record.medications && record.medications.length > 0) {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          addWatermarkToPage(doc.internal.pages.length - 1);
          currentY = 15;
        }
        
        currentY += 5;
        doc.setFontSize(10);
        doc.setTextColor(0, 128, 128);
        doc.text('CURRENT MEDICATIONS', 15, currentY);
        currentY += 6;
        
        // Table header
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(0, 128, 128);
        doc.rect(15, currentY - 3, pageWidth - 30, 5, 'F');
        doc.text('Medication', 20, currentY);
        doc.text('Dosage', 80, currentY);
        doc.text('Frequency', 130, currentY);
        currentY += 6;
        
        // Table rows
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        record.medications.forEach((med, idx) => {
          if (currentY > pageHeight - 20) {
            doc.addPage();
            addWatermarkToPage(doc.internal.pages.length - 1);
            currentY = 15;
          }
          
          if (idx % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, currentY - 2.5, pageWidth - 30, 5, 'F');
          }
          doc.text(String(med.name || ''), 20, currentY);
          doc.text(String(med.dosage || ''), 80, currentY);
          doc.text(String(med.frequency || ''), 130, currentY);
          currentY += 5.5;
        });
      }

      // Additional Notes Section
      if (record.allNotes) {
        if (currentY > pageHeight - 50) {
          doc.addPage();
          addWatermarkToPage(doc.internal.pages.length - 1);
          currentY = 15;
        }
        
        currentY += 5;
        doc.setFontSize(10);
        doc.setTextColor(0, 128, 128);
        doc.text('ADDITIONAL NOTES', 15, currentY);
        currentY += 6;
        
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const notesLines = wrapText(String(record.allNotes), 160);
        notesLines.slice(0, 4).forEach(line => {
          if (currentY < pageHeight - 15) {
            doc.text(line, 15, currentY);
            currentY += 4;
          }
        });
      }

      // Add footer to all pages
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(128, 128, 128);
        doc.setDrawColor(200, 200, 200);
        doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);
        doc.text('CONFIDENTIAL - For authorized personnel only', 15, pageHeight - 8);
      }

      doc.save(`${String(record.patientName).replace(/\s+/g, '_')}_Medical_Record_${record.date}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

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

  // Handle add consultation
  const handleAddConsultation = () => {
    if (!newConsultation.doctorName || !newConsultation.notes) {
      alert('Please fill in doctor name and notes');
      return;
    }

    const consultation = {
      id: `c${Date.now()}`,
      ...newConsultation,
      suggestedMedications: newConsultation.suggestedMedications || []
    };

    const updatedRecord = {
      ...selectedRecord,
      consultations: [...(selectedRecord.consultations || []), consultation]
    };

    setSelectedRecord(updatedRecord);
    const updatedRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    setRecords(updatedRecords);
    
    setConsultationModal(false);
    setNewConsultation({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      doctorName: '',
      notes: '',
      suggestedMedications: []
    });
  };

  // Handle update notes
  const handleUpdateNotes = () => {
    const updatedRecord = { ...selectedRecord, allNotes: editingNotes };
    setSelectedRecord(updatedRecord);
    const updatedRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    setRecords(updatedRecords);
    setNotesModal(false);
  };

  // Handle add medication
  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      alert('Please fill in medication name and dosage');
      return;
    }

    const updatedRecord = {
      ...selectedRecord,
      medications: [...(selectedRecord.medications || []), newMedication]
    };

    setSelectedRecord(updatedRecord);
    const updatedRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    setRecords(updatedRecords);
    
    setMedicationsModal(false);
    setNewMedication({ name: '', dosage: '', frequency: '', duration: '', status: 'Active' });
  };

  // Handle delete medication
  const handleDeleteMedication = (index) => {
    const updatedRecord = {
      ...selectedRecord,
      medications: selectedRecord.medications.filter((_, i) => i !== index)
    };
    setSelectedRecord(updatedRecord);
    const updatedRecords = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    setRecords(updatedRecords);
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
      day: new Date(newRecord.date).toLocaleDateString('en-US', { weekday: 'short' }),
      consultations: [],
      allNotes: '',
      medications: []
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
      status: 'Today',
      consultations: [],
      allNotes: '',
      medications: []
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
                documents: false,
                status: 'Today',
                consultations: [],
                allNotes: '',
                medications: []
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

      <>
        {/* Record Detail Modal - With Consultations, Notes, Medications */}
        <Modal
        isOpen={detailModal && selectedRecord}
        onClose={() => {
          setDetailModal(false);
          setSelectedRecord(null);
        }}
        title={selectedRecord?.patientName}
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Main Info */}
            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
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

            {/* Issue, Diagnosis, Treatment */}
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 font-medium mb-1">Issue</p>
                <p className="text-gray-800">{selectedRecord.issue}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Diagnosis</p>
                <p className="text-gray-800">{selectedRecord.diagnosis}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Treatment</p>
                <p className="text-gray-800">{selectedRecord.treatment}</p>
              </div>
            </div>

            {/* Consultations History */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-teal-500" />
                  <span>Consultation History</span>
                </h4>
                {userRole === 'doctor' && (
                  <button
                    onClick={() => setConsultationModal(true)}
                    className="flex items-center space-x-1 text-teal-500 hover:text-teal-600 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {selectedRecord.consultations && selectedRecord.consultations.length > 0 ? (
                  selectedRecord.consultations.map((consultation, idx) => (
                    <div key={consultation.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm">
                          <p className="font-medium text-gray-800">Consultation {idx + 1}</p>
                          <p className="text-gray-600 text-xs">{consultation.date} at {consultation.time} - Dr. {consultation.doctorName}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{consultation.notes}</p>
                      {consultation.suggestedMedications && consultation.suggestedMedications.length > 0 && (
                        <div className="text-xs">
                          <p className="text-gray-600 font-medium mb-1">Suggested Medications:</p>
                          {consultation.suggestedMedications.map((med, midx) => (
                            <p key={midx} className="text-gray-700">{med.name} - {med.dosage} ({med.frequency})</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No consultations recorded yet.</p>
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <Pill className="w-4 h-4 text-blue-500" />
                  <span>Current Medications</span>
                </h4>
                {userRole === 'doctor' && (
                  <button
                    onClick={() => setMedicationsModal(true)}
                    className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {selectedRecord.medications && selectedRecord.medications.length > 0 ? (
                  selectedRecord.medications.map((med, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{med.name}</p>
                        <p className="text-xs text-gray-600">{med.dosage} | {med.frequency} | {med.duration}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{med.status}</span>
                        {userRole === 'doctor' && (
                          <button
                            onClick={() => handleDeleteMedication(idx)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No medications prescribed yet.</p>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">Additional Notes</h4>
                {userRole === 'doctor' && (
                  <button
                    onClick={() => {
                      setEditingNotes(selectedRecord.allNotes || '');
                      setNotesModal(true);
                    }}
                    className="text-purple-500 hover:text-purple-600 text-sm flex items-center space-x-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded">{selectedRecord.allNotes || 'No additional notes.'}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t flex-wrap">
              <button
                onClick={() => downloadPDF(selectedRecord)}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              {userRole === 'doctor' && (
                <button
                  onClick={() => {
                    setDetailModal(false);
                    handleEditRecord(selectedRecord);
                  }}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Record</span>
                </button>
              )}
              <button
                onClick={() => {
                  setDetailModal(false);
                  setSelectedRecord(null);
                }}
                className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Consultation Modal */}
      <Modal
        isOpen={consultationModal}
        onClose={() => {
          setConsultationModal(false);
          setNewConsultation({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            doctorName: '',
            notes: '',
            suggestedMedications: []
          });
        }}
        title="Add Consultation"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newConsultation.date}
                onChange={(e) => setNewConsultation({ ...newConsultation, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={newConsultation.time}
                onChange={(e) => setNewConsultation({ ...newConsultation, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
            <select
              value={newConsultation.doctorName}
              onChange={(e) => setNewConsultation({ ...newConsultation, doctorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            >
              <option value="">Select a doctor</option>
              {mockData.doctors.map(doc => (
                <option key={doc.id} value={doc.name}>{doc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Notes *</label>
            <textarea
              value={newConsultation.notes}
              onChange={(e) => setNewConsultation({ ...newConsultation, notes: e.target.value })}
              placeholder="Enter consultation notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              rows="4"
            />
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleAddConsultation}
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Consultation</span>
            </button>
            <button
              onClick={() => {
                setConsultationModal(false);
                setNewConsultation({
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toTimeString().slice(0, 5),
                  doctorName: '',
                  notes: '',
                  suggestedMedications: []
                });
              }}
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Notes Modal */}
      <Modal
        isOpen={notesModal}
        onClose={() => setNotesModal(false)}
        title="Edit Additional Notes"
        size="md"
      >
        <div className="space-y-4">
          <textarea
            value={editingNotes}
            onChange={(e) => setEditingNotes(e.target.value)}
            placeholder="Add any additional notes about the patient..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            rows="6"
          />
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleUpdateNotes}
              className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Notes</span>
            </button>
            <button
              onClick={() => setNotesModal(false)}
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Medication Modal */}
      <Modal
        isOpen={medicationsModal}
        onClose={() => {
          setMedicationsModal(false);
          setNewMedication({ name: '', dosage: '', frequency: '', duration: '', status: 'Active' });
        }}
        title="Add Medication"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
            <input
              type="text"
              placeholder="e.g., Paracetamol, Amoxicillin"
              value={newMedication.name}
              onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
            <input
              type="text"
              placeholder="e.g., 500mg, 10ml"
              value={newMedication.dosage}
              onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <input
                type="text"
                placeholder="e.g., Twice daily"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g., 7 days"
                value={newMedication.duration}
                onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={newMedication.status}
              onChange={(e) => setNewMedication({ ...newMedication, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            >
              <option value="Active">Active</option>
              <option value="Discontinued">Discontinued</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleAddMedication}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>
            <button
              onClick={() => {
                setMedicationsModal(false);
                setNewMedication({ name: '', dosage: '', frequency: '', duration: '', status: 'Active' });
              }}
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
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
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="documents"
                checked={editingRecord.documents}
                onChange={(e) => setEditingRecord({ ...editingRecord, documents: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="documents" className="text-sm text-gray-700">Has documents</label>
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
            documents: false,
            status: 'Today',
            consultations: [],
            allNotes: '',
            medications: []
          });
        }}
        title="Add New Patient Record"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={newRecord.status}
              onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            >
              <option value="Past">Past</option>
              <option value="Today">Today</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="newDocuments"
              checked={newRecord.documents}
              onChange={(e) => setNewRecord({ ...newRecord, documents: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="newDocuments" className="text-sm text-gray-700">Has documents</label>
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
                  documents: false,
                  status: 'Today',
                  consultations: [],
                  allNotes: '',
                  medications: []
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
                  
                  {/* Quick Stats */}
                  <div className="flex gap-4 text-xs text-gray-600 mb-3">
                    {record.consultations && record.consultations.length > 0 && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <MessageSquare className="w-3 h-3" />
                        {record.consultations.length} consultation{record.consultations.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {record.medications && record.medications.length > 0 && (
                      <span className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                        <Pill className="w-3 h-3" />
                        {record.medications.length} medication{record.medications.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {record.documents && (
                      <span className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                        <FileText className="w-3 h-3" />
                        Documents
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setDetailModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      View Full Record
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
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      </>
    </DashboardLayout>
  );
}
