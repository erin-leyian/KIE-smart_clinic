import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Clock, User } from 'lucide-react';
import mockData from '../../data/mockData.json';

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = async () => {
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const formattedRecords = mockData.patientRecords.map(record => ({
        id: record.id,
        date: record.date.split(" ")[1],
        day: record.date.split(" ")[0],
        time: record.time,
        patient: record.patientName,
        issue: record.issue,
        hasDocs: record.documents !== null
      }));

      setRecords(formattedRecords);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <DashboardLayout title="Patient Records">
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
