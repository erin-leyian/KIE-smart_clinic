import React, { useState } from "react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { BookOpen, Users, Lock, Shield, CheckCircle, Eye, Edit3, Trash2, BarChart3, HelpCircle } from "lucide-react";

export default function Help() {
  const [expandedSection, setExpandedSection] = useState("getting-started");

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <DashboardLayout title="Help & Support">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Smart Clinic Help Center</h1>
          <p className="text-teal-50">Your complete guide to navigating the system safely and efficiently</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Guide */}
          <div className="lg:col-span-2 space-y-4">
            {/* Getting Started */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("getting-started")}
                className="w-full px-6 py-4 flex items-center justify-between bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  <h2 className="text-lg font-bold text-gray-800">Getting Started</h2>
                </div>
                <span className="text-teal-600">{expandedSection === "getting-started" ? "−" : "+"}</span>
              </button>
              {expandedSection === "getting-started" && (
                <div className="p-6 space-y-4 border-t">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Welcome to Smart Clinic</h3>
                    <p className="text-gray-700 text-sm mb-4">
                      Smart Clinic is a comprehensive healthcare management system designed to streamline patient care, appointment scheduling, and medical record management.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">First Steps</h3>
                    <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                      <li>Complete your profile with accurate personal and contact information</li>
                      <li>Review your role-specific dashboard features in the sidebar</li>
                      <li>Explore appointment and consultation features</li>
                      <li>Familiarize yourself with the notification system</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Navigation Basics</h3>
                    <p className="text-gray-700 text-sm">
                      Use the sidebar menu to navigate between sections. Your available options depend on your user role (Patient, Doctor, or Administrator). Click on Profile to customize your account settings.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* System Guide */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("system-guide")}
                className="w-full px-6 py-4 flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-800">System Guide by Role</h2>
                </div>
                <span className="text-blue-600">{expandedSection === "system-guide" ? "−" : "+"}</span>
              </button>
              {expandedSection === "system-guide" && (
                <div className="p-6 space-y-6 border-t">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Patient Guide
                    </h3>
                    <ul className="text-sm text-green-800 space-y-2 list-disc list-inside">
                      <li><strong>Dashboard:</strong> View upcoming appointments and health summary</li>
                      <li><strong>Appointments:</strong> Book, reschedule, and manage your appointments</li>
                      <li><strong>Online Consult:</strong> Schedule consultations with doctors via video/call</li>
                      <li><strong>Patient Records:</strong> Access your medical history and test results (read-only)</li>
                      <li><strong>Doctors:</strong> Browse available doctors and their specialties</li>
                      <li><strong>Profile:</strong> Update personal information, contact details, and preferences</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Doctor Guide
                    </h3>
                    <ul className="text-sm text-purple-800 space-y-2 list-disc list-inside">
                      <li><strong>Dashboard:</strong> View daily appointments and patient queue</li>
                      <li><strong>Appointments:</strong> Manage your appointment schedule</li>
                      <li><strong>Patient Records:</strong> Create and edit patient medical records</li>
                      <li><strong>Online Consult:</strong> Configure consultation settings (fees, duration, availability)</li>
                      <li><strong>Doctors:</strong> View colleague information and specialties</li>
                      <li><strong>Profile:</strong> Update credentials and online consultation settings</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Administrator Guide
                    </h3>
                    <ul className="text-sm text-orange-800 space-y-2 list-disc list-inside">
                      <li><strong>Dashboard:</strong> System overview and key metrics</li>
                      <li><strong>All Users:</strong> Manage and view all system users</li>
                      <li><strong>All Doctors:</strong> Edit doctor profiles, specialties, and manage records</li>
                      <li><strong>All Appointments:</strong> Monitor and manage all appointments system-wide</li>
                      <li><strong>Patient Records:</strong> Access and edit all patient medical records</li>
                      <li><strong>System Settings:</strong> Configure system-wide preferences</li>
                      <li><strong>Profile:</strong> View admin account with detailed permissions</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Using the System */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("usage")}
                className="w-full px-6 py-4 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-800">Common Tasks & Usage</h2>
                </div>
                <span className="text-indigo-600">{expandedSection === "usage" ? "−" : "+"}</span>
              </button>
              {expandedSection === "usage" && (
                <div className="p-6 space-y-6 border-t">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">📅 Managing Appointments</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Patients:</strong> Book appointments by selecting a doctor, date, and time. Receive notifications for confirmations.
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Doctors:</strong> View all scheduled appointments in your dashboard. Edit appointment notes and add patient consultation records.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">👤 Updating Your Profile</h3>
                    <p className="text-sm text-gray-700 mb-2">Click the "Edit" button in your profile sections to update:</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Personal information (date of birth, age)</li>
                      <li>Contact details (phone, email, location)</li>
                      <li>Professional credentials (doctors only)</li>
                      <li>Consultation settings and fees (doctors only)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">📝 Working with Patient Records</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Patients:</strong> View your medical history, test results, and consultation notes.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Doctors:</strong> Create detailed records with diagnosis, treatment, and medication information.
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Admins:</strong> Monitor all records and maintain system integrity.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">🎥 Online Consultations</h3>
                    <p className="text-sm text-gray-700">
                      Doctors can enable online consultation availability and set fees. Patients can schedule consultations through the system.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">🔔 Notifications</h3>
                    <p className="text-sm text-gray-700">
                      Access your notification history from the sidebar. All system events (appointments, messages, updates) are logged for your reference.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Access Control */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("access")}
                className="w-full px-6 py-4 flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-bold text-gray-800">Access Control & Permissions</h2>
                </div>
                <span className="text-yellow-600">{expandedSection === "access" ? "−" : "+"}</span>
              </button>
              {expandedSection === "access" && (
                <div className="p-6 space-y-6 border-t">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-300">
                    <h3 className="font-bold text-green-900 mb-3">Patient Access</h3>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex items-start gap-2">
                        <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>View:</strong> Own appointments, medical records, doctor profiles</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Create:</strong> Book appointments and consultations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 text-xs">⊘</span>
                        <span><strong>Cannot:</strong> Edit or delete medical records, manage other users</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-300">
                    <h3 className="font-bold text-purple-900 mb-3">Doctor Access</h3>
                    <div className="space-y-2 text-sm text-purple-800">
                      <div className="flex items-start gap-2">
                        <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>View:</strong> Own appointments, assigned patient records</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Edit3 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Edit:</strong> Patient records, consultation notes, own profile</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Create:</strong> Medical records, consultations, appointment notes</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-300">
                    <h3 className="font-bold text-orange-900 mb-3">Administrator Access</h3>
                    <div className="space-y-2 text-sm text-orange-800">
                      <div className="flex items-start gap-2">
                        <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>View:</strong> All users, appointments, medical records, system data</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Edit3 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Edit:</strong> Any user profile, doctor information, patient records, system settings</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Trash2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Delete:</strong> Users, appointments, records (with appropriate confirmation)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <BarChart3 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span><strong>Manage:</strong> System analytics, reports, configurations</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-2">Permission Principles</h3>
                    <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                      <li>Users can only access data relevant to their role</li>
                      <li>Doctors cannot access records of patients they haven't treated</li>
                      <li>Patients cannot view or edit other patients' information</li>
                      <li>All administrative actions require confirmation</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Data Safety */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("security")}
                className="w-full px-6 py-4 flex items-center justify-between bg-red-50 hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-800">Data Safety & Security</h2>
                </div>
                <span className="text-red-600">{expandedSection === "security" ? "−" : "+"}</span>
              </button>
              {expandedSection === "security" && (
                <div className="p-6 space-y-6 border-t">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-bold text-red-900 mb-2">🔐 Your Data is Protected</h3>
                    <ul className="text-sm text-red-800 space-y-2 list-disc list-inside">
                      <li>All data is securely stored and encrypted</li>
                      <li>Access is controlled by role-based permissions</li>
                      <li>Medical records are confidential and protected</li>
                      <li>Only authorized personnel can access sensitive information</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-900 mb-2">✓ Privacy Assurance</h3>
                    <ul className="text-sm text-green-800 space-y-2 list-disc list-inside">
                      <li>Your personal information is never shared without consent</li>
                      <li>Medical records comply with healthcare data protection standards</li>
                      <li>All transactions are logged for audit purposes</li>
                      <li>Two-factor authentication is available in account settings</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-2">🛡️ Security Best Practices</h3>
                    <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                      <li>Use a strong, unique password for your account</li>
                      <li>Enable two-factor authentication in your profile settings</li>
                      <li>Never share your login credentials with anyone</li>
                      <li>Log out when finished, especially on shared devices</li>
                      <li>Report suspicious activity to administrators immediately</li>
                      <li>Keep your contact information up to date</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-2">📋 Data Retention</h3>
                    <p className="text-sm text-purple-800 mb-2">
                      Smart Clinic maintains records according to healthcare regulations:
                    </p>
                    <ul className="text-sm text-purple-800 space-y-2 list-disc list-inside">
                      <li>Patient medical records are retained for legal compliance</li>
                      <li>Appointment history is kept for continuity of care</li>
                      <li>You can request data access or deletion through administrators</li>
                      <li>System backups are maintained for disaster recovery</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-yellow-900 mb-2">⚠️ What We Never Do</h3>
                    <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
                      <li>We never sell your personal or medical data</li>
                      <li>We don't use your information for marketing without consent</li>
                      <li>We don't share data with unauthorized third parties</li>
                      <li>We don't store passwords in plain text</li>
                      <li>We don't access your data without legitimate purpose</li>
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-bold text-gray-800 mb-2">Questions About Data Privacy?</h3>
                    <p className="text-sm text-gray-700">
                      Contact your administrator for detailed information about data handling practices and privacy policies.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info Cards */}
          <div className="space-y-4">
            {/* Quick Links */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-6">
              <h3 className="font-bold text-teal-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Quick Links
              </h3>
              <ul className="text-sm text-teal-800 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                  Profile Settings
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                  Appointments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                  Patient Records
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                  Notifications
                </li>
              </ul>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" /> Pro Tips
              </h3>
              <ul className="text-xs text-blue-800 space-y-3">
                <li className="flex gap-2">
                  <span className="flex-shrink-0">💡</span>
                  <span>Check your notifications regularly for important updates</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">🔔</span>
                  <span>Enable email notifications in your profile settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">📱</span>
                  <span>Bookmark this Help page for quick reference</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">🔐</span>
                  <span>Always log out after using shared devices</span>
                </li>
              </ul>
            </div>

            {/* Security Checklist */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Security Checklist
              </h3>
              <ul className="text-xs text-green-800 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0">☑</span>
                  <span>Strong password set</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0">☑</span>
                  <span>Profile information complete</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0">☑</span>
                  <span>Contact info up to date</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0">☑</span>
                  <span>2FA enabled (optional)</span>
                </li>
              </ul>
            </div>

            {/* Support Contact */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
              <h3 className="font-bold text-purple-900 mb-4">📞 Need Help?</h3>
              <p className="text-xs text-purple-800 mb-4">
                For additional support or technical issues, contact your system administrator.
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}