import React, { useState } from 'react';
import Modal from '../../components/Modal';
import DashboardLayout from '../../components/Layout/DashboardLayout';

export default function OnlineConsult() {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <DashboardLayout title="Online Consult">
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Consultation Info</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-3xl">
            Set up your availability for online consultations with patients.
            This allows queue management system to correctly place patients.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="availability" className="w-4 h-4 text-teal-500" />
                  <span className="text-gray-700">Disable</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="availability" className="w-4 h-4 text-teal-500" defaultChecked />
                  <span className="text-gray-700">Enable</span>
                </label>
              </div>
            </div>

            {/* Type of Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Type Of Availability</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-teal-500 rounded" />
                  <span className="text-gray-700">Text</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-teal-500 rounded" defaultChecked />
                  <span className="text-gray-700">Video</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-teal-500 rounded" />
                  <span className="text-gray-700">Call</span>
                </label>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <select className="w-full border p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 bg-white">
                <option>15 mins</option>
                <option selected>30 mins</option>
                <option>45 mins</option>
                <option>1 hour</option>
              </select>
            </div>

            {/* Fees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fees</label>
              <div className="flex border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">
                <span className="bg-gray-50 px-4 py-2.5 text-gray-500 border-r">RWF</span>
                <input type="number" defaultValue="25000" className="flex-1 p-2.5 outline-none w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t bg-gray-50 flex justify-end space-x-4 rounded-b-xl">
          <button className="px-8 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition">
            Cancel
          </button>
          <button onClick={() => setShowSaveModal(true)} className="px-8 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition shadow-sm">
            Save
          </button>
        </div>

        {/* Save Confirmation Modal */}
        <Modal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          title="Save Consultation Settings"
          size="md"
          actions={[
            { label: 'Cancel', onClick: () => setShowSaveModal(false), variant: 'secondary' },
            { label: saving ? 'Saving...' : 'Confirm', onClick: async () => {
                setSaving(true);
                // simulate save
                await new Promise(r => setTimeout(r, 700));
                setSaving(false);
                setShowSaveModal(false);
              }, variant: 'primary' }
          ]}
        >
          <div className="py-2">
            <p className="text-sm text-gray-600">Save your online consultation availability and fees. This will update how patients book with you.</p>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
