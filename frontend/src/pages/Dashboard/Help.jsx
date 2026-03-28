import React, { useState } from "react";
import Modal from '../../components/Modal';
import DashboardLayout from "../../components/Layout/DashboardLayout";

export default function Help() {
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate send
    setShowConfirm(true);
    setMessage('');
  };
  return (
    <DashboardLayout title="Help">
      <div className="bg-white p-8 rounded-xl shadow-sm border max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="border rounded-lg p-4 group cursor-pointer">
            <summary className="font-medium text-gray-800 outline-none">How do I configure my Profile?</summary>
            <p className="text-sm text-gray-600 mt-2">Go to the Profile section from the sidebar and update your personal info.</p>
          </details>
          <details className="border rounded-lg p-4 group cursor-pointer">
            <summary className="font-medium text-gray-800 outline-none">How to accept Online Consults?</summary>
            <p className="text-sm text-gray-600 mt-2">Navigate to Online Consult and toggle the 'Enable' switch under Availability.</p>
          </details>
          <details className="border rounded-lg p-4 group cursor-pointer">
            <summary className="font-medium text-gray-800 outline-none">Where is the Mock Data located?</summary>
            <p className="text-sm text-gray-600 mt-2">This app currently uses mockData.json in the src/data folder for seamless interactive states.</p>
          </details>
        </div>

        <h2 className="text-xl font-bold mt-10 mb-4 text-gray-800">Contact Support</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <textarea
            rows="4"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full border rounded-lg p-4 text-sm outline-none focus:ring-1 ring-teal-500"
            placeholder="Describe your issue..."
            required
          ></textarea>
          <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg text-sm transition">
            Send Message
          </button>
        </form>

        <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Message sent" size="sm" actions={[{ label: 'Close', onClick: () => setShowConfirm(false), variant: 'primary' }]}>
          <div className="py-4">
            <p className="text-sm text-gray-600">Thanks — your message has been received. Our support team will reply within 24 hours.</p>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}