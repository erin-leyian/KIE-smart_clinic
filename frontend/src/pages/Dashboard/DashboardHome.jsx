import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';

export default function DashboardHome() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="bg-white border rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to your Dashboard</h2>
        <p className="text-gray-600">
          This is the main dashboard view. Select an option from the sidebar to manage your clinics, patient records, or consultations.
        </p>
      </div>
    </DashboardLayout>
  );
}
