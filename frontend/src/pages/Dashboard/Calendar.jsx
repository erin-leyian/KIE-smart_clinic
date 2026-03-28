import React, { useState } from "react";
import Modal from '../../components/Modal';
import DashboardLayout from "../../components/Layout/DashboardLayout";
import mockData from "../../data/mockData.json";

export default function CalendarView() {
  const [appointments, setAppointments] = useState(mockData.appointments);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    setAppointments(prev => [
      ...prev,
      { id: Date.now(), doctorName: newEvent.title, date: newEvent.date, time: newEvent.time || '09:00', avatar: '/placeholder.png' }
    ]);
    setNewEvent({ title: '', date: '', time: '' });
    setShowAddEvent(false);
  };

  return (
    <DashboardLayout title="Calendar">
      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Schedule</h2>
          <button onClick={() => setShowAddEvent(true)} className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm">
            Add Event
          </button>
        </div>

        <Modal
          isOpen={showAddEvent}
          onClose={() => setShowAddEvent(false)}
          title="Add Event"
          size="md"
          actions={[
            { label: 'Cancel', onClick: () => setShowAddEvent(false), variant: 'secondary' },
            { label: 'Add', onClick: handleAddEvent, variant: 'primary' }
          ]}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input value={newEvent.title} onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))} className="w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input type="date" value={newEvent.date} onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))} className="w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Time (optional)</label>
              <input value={newEvent.time} onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))} placeholder="09:00" className="w-full border p-2 rounded-md" />
            </div>
          </div>
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((apt, idx) => (
            <div key={idx} className="border p-4 rounded-lg bg-gray-50 flex items-center space-x-4">
              <img src={apt.avatar} alt="patient" className="w-12 h-12 rounded-full shadow-sm" />
              <div>
                <p className="font-bold text-sm text-gray-800">{apt.doctorName}</p>
                <p className="text-xs text-gray-500">{apt.date}</p>
                <p className="text-xs font-semibold text-teal-600 mt-1">{apt.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}