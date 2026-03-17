import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Clock, User } from 'lucide-react';

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/appointments", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch records");
      }
      
      // Formatting the generic appointment response
      // Example data might look different, adapting fields gracefully
      const formattedRecords = data.map((apt, index) => {
        const dateObj = new Date(apt.appointment_time || Date.now());
        const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = dateObj.getDate().toString().padStart(2, '0');
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        
        return {
          id: apt.id || index + 1,
          date: dateStr,
          day: day,
          time: timeStr,
          patient: apt.patient_name || `Patient #${apt.patient_id || index + 1}`,
          issue: apt.status || 'Consultation',
          hasDocs: false 
        };
      });

      setRecords(formattedRecords);
    } catch (err) {
      setError(err.message);
      // Fallback data if backend is not running yet
      setRecords([
        { id: 1, date: '15', day: 'Thu', time: '09:00am', patient: 'Keza Bella', issue: 'Fever (Mock)', hasDocs: true },
        { id: 2, date: '16', day: 'Fri', time: '09:30am', patient: 'Manzi Kevin', issue: 'Cough (Mock)', hasDocs: true },
        { id: 3, date: '19', day: 'Mon', time: '10:00am', patient: 'Akaliza M.', issue: 'Headache (Mock)', hasDocs: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <DashboardLayout title="Patient Records">
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
          Showing mock data. Could not load live records from API: {error}
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
                    <a href="#" className="text-blue-500 hover:underline">View Documents</a>
                  ) : (
                    <p className="text-gray-400">-</p>
                  )}
                </div>
              </div>

              <div className="px-6">
                <button className="border px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
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
