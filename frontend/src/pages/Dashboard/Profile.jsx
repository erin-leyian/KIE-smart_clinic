import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { Edit2, FileText, AlertCircle, RotateCcw, Save, Calendar, Mail, Phone, MapPin, Award, Clock, User, Shield } from "lucide-react";
import { authAPI, appointmentsAPI } from "../../services/api";
import { formatErrorMessage } from "../../utils/errorHandler";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("patient");
  const [showEditPersonal, setShowEditPersonal] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showSaveConsultModal, setShowSaveConsultModal] = useState(false);
  const [editPersonal, setEditPersonal] = useState({ dob: "", age: "" });
  const [editContact, setEditContact] = useState({ phone: "", email: "", location: "" });
  const [consultationSettings, setConsultationSettings] = useState({
    enabled: true,
    types: { text: false, video: true, call: false },
    duration: "30 mins",
    fees: "25000"
  });
  const [savingConsult, setSavingConsult] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("User profile not found. Please log in again.");

        const currentUser = JSON.parse(storedUser);
        setUserRole(currentUser.role || "patient");

        // Fetch user details from API
        const userResponse = await authAPI.getUserById(currentUser.id);
        const userData = userResponse.user || currentUser;
        
        if (!userData) throw new Error("User profile not found. Please try again.");

        // Fetch user's appointments (API now returns { data: [...] })
        const appointmentsResponse = await appointmentsAPI.getAllAppointments({
          patientId: currentUser.id
        });
        const userAppointments = appointmentsResponse.data || [];

        setUser(userData);
        setHistory(userAppointments);
        setEditPersonal({ 
          dob: userData.dateOfBirth || userData.dob || "", 
          age: userData.age || "" 
        });
        setEditContact({ 
          phone: userData.phone || "", 
          email: userData.email || "", 
          location: userData.city || userData.location || "" 
        });
        setLoading(false);
      } catch (err) {
        setError(formatErrorMessage(err));
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleRetryLoadData = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("User profile not found. Please log in again.");

      const currentUser = JSON.parse(storedUser);
      
      // Fetch user details from API
      const userResponse = await authAPI.getUserById(currentUser.id);
      const userData = userResponse.user || currentUser;
      
      if (!userData) throw new Error("User profile not found. Please try again.");

      // Fetch user's appointments (API now returns { data: [...] })
      const appointmentsResponse = await appointmentsAPI.getAllAppointments({
        patientId: currentUser.id
      });
      const userAppointments = appointmentsResponse.data || [];

      setUser(userData);
      setHistory(userAppointments);
      setLoading(false);
    } catch (err) {
      setError(formatErrorMessage(err));
      setLoading(false);
    }
  };

  // Save personal info (Date of birth, age) - with API call
  const handleSavePersonal = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = JSON.parse(storedUser);
      
      // Call API to update user personal info
      await authAPI.updateUser(currentUser.id, {
        date_of_birth: editPersonal.dob,
        age: editPersonal.age
      });
      
      // Update local state
      setUser(prev => ({ ...prev, date_of_birth: editPersonal.dob, dob: editPersonal.dob, age: editPersonal.age }));
      setShowEditPersonal(false);
      alert('Personal information updated successfully!');
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      console.error('Error updating personal info:', err);
      alert(`Failed to update personal information: ${errorMessage}`);
    }
  };

  // Save contact info (Phone, Email, Location) - with API call
  const handleSaveContact = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = JSON.parse(storedUser);
      
      // Call API to update user contact info
      await authAPI.updateUser(currentUser.id, {
        phone: editContact.phone,
        email: editContact.email,
        location: editContact.location
      });
      
      // Update local state
      setUser(prev => ({ ...prev, phone: editContact.phone, email: editContact.email, location: editContact.location }));
      setShowEditContact(false);
      alert('Contact information updated successfully!');
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      console.error('Error updating contact info:', err);
      alert(`Failed to update contact information: ${errorMessage}`);
    }
  };

  const handleSaveConsultSettings = async () => {
    setSavingConsult(true);
    await new Promise(r => setTimeout(r, 700));
    setSavingConsult(false);
    setShowSaveConsultModal(false);
  };

  if (loading) return <DashboardLayout title="Profile"><div className="text-center py-12 text-gray-500">Loading profile...</div></DashboardLayout>;
  if (!user) return <DashboardLayout title="Profile"><div className="text-center py-12 text-gray-500">No user data</div></DashboardLayout>;

  const adminTabs = ["general", "contact", "permissions", "settings"];
  const doctorTabs = ["general", "history", "consultations", "documents", "settings"];
  const patientTabs = ["general", "history", "documents", "settings"];
  const tabs = userRole === "admin" ? adminTabs : userRole === "doctor" ? doctorTabs : patientTabs;

  return (
    <DashboardLayout title="Profile">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Profile</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button onClick={handleRetryLoadData} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0">
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Retry</span>
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Award className="w-4 h-4" />
            <p>{userRole === "admin" ? "System Administrator" : user.specialty || "Patient"}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4" />
            <p className="text-sm">{user.location}</p>
          </div>
        </div>

        <div className="flex gap-2 border-b bg-white rounded-t-lg overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? "border-teal-500 text-teal-600" : "border-transparent text-gray-600 hover:text-gray-800"}`}>
              {tab === "consultations" ? "Online Consultations" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-lg shadow-sm p-8">
          {activeTab === "general" && <GeneralTab user={user} userRole={userRole} setEditPersonal={setEditPersonal} setShowEditPersonal={setShowEditPersonal} setEditContact={setEditContact} setShowEditContact={setShowEditContact} />}
          {userRole === "admin" && activeTab === "permissions" && <PermissionsTab />}
          {activeTab === "history" && <HistoryTab history={history} />}
          {activeTab === "consultations" && userRole === "doctor" && <ConsultationsTab consultationSettings={consultationSettings} setConsultationSettings={setConsultationSettings} setShowSaveConsultModal={setShowSaveConsultModal} />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>

      <Modal isOpen={showEditPersonal} onClose={() => setShowEditPersonal(false)} title="Edit Personal Information" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" value={editPersonal.dob} onChange={e => setEditPersonal(prev => ({ ...prev, dob: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" value={editPersonal.age} onChange={e => setEditPersonal(prev => ({ ...prev, age: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button onClick={handleSavePersonal} className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg"><Save className="w-4 h-4" />Save</button>
            <button onClick={() => setShowEditPersonal(false)} className="ml-auto bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditContact} onClose={() => setShowEditContact(false)} title="Edit Contact Information" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={editContact.phone} onChange={e => setEditContact(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={editContact.email} onChange={e => setEditContact(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={editContact.location} onChange={e => setEditContact(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button onClick={handleSaveContact} className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg"><Save className="w-4 h-4" />Save</button>
            <button onClick={() => setShowEditContact(false)} className="ml-auto bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSaveConsultModal} onClose={() => setShowSaveConsultModal(false)} title="Save Consultation Settings" size="md">
        <div className="space-y-4">
          <p className="text-gray-700">Confirm your consultation settings?</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p><strong>Status:</strong> {consultationSettings.enabled ? "Enabled" : "Disabled"}</p>
            <p><strong>Duration:</strong> {consultationSettings.duration}</p>
            <p><strong>Fee:</strong> {consultationSettings.fees} RWF</p>
          </div>
          <div className="flex gap-2 pt-4 border-t">
            <button onClick={handleSaveConsultSettings} disabled={savingConsult} className="flex-1 bg-teal-500 text-white px-4 py-2 rounded-lg">{savingConsult ? "Saving..." : "Confirm"}</button>
            <button onClick={() => setShowSaveConsultModal(false)} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function GeneralTab({ user, userRole, setEditPersonal, setShowEditPersonal, setEditContact, setShowEditContact }) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
          <button onClick={() => { setEditPersonal({ dob: user.dob, age: user.age }); setShowEditPersonal(true); }} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"><Edit2 className="w-4 h-4" />Edit</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-blue-600" /><p className="text-gray-500 text-sm">Date of Birth</p></div><p className="text-gray-800 font-medium">{user.dob}</p></div>
          <div className="bg-blue-50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-1"><User className="w-4 h-4 text-blue-600" /><p className="text-gray-500 text-sm">Age</p></div><p className="text-gray-800 font-medium">{user.age} years</p></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
          <button onClick={() => { setEditContact({ phone: user.phone, email: user.email, location: user.location }); setShowEditContact(true); }} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"><Edit2 className="w-4 h-4" />Edit</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-1"><Phone className="w-4 h-4 text-green-600" /><p className="text-gray-500 text-sm">Phone</p></div><p className="text-gray-800 font-medium">{user.phone}</p></div>
          <div className="bg-green-50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-green-600" /><p className="text-gray-500 text-sm">Email</p></div><p className="text-gray-800 font-medium text-sm">{user.email}</p></div>
          <div className="bg-green-50 p-4 rounded-lg"><div className="flex items-center gap-2 mb-1"><MapPin className="w-4 h-4 text-green-600" /><p className="text-gray-500 text-sm">Location</p></div><p className="text-gray-800 font-medium">{user.location}</p></div>
        </div>
      </div>
    </div>
  );
}

function PermissionsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-800">Administrator Permissions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "View All Users", desc: "Access and view all registered users" },
          { title: "Manage Doctors", desc: "Add, edit, and delete doctor profiles" },
          { title: "Manage Appointments", desc: "Edit and delete appointments" },
          { title: "Manage Patient Records", desc: "Edit and delete patient medical records" },
          { title: "View Analytics", desc: "Access system statistics and reports" },
          { title: "Manage Admins", desc: "Add and manage administrator accounts" }
        ].map((perm, idx) => (
          <div key={idx} className="border border-teal-200 bg-teal-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">✓</span></div>
              <div>
                <p className="font-medium text-gray-800">{perm.title}</p>
                <p className="text-sm text-gray-600 mt-1">{perm.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ history }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Consultation History</h3>
        <select className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white"><option>All Time</option><option>Last 30 Days</option><option>Last 90 Days</option></select>
      </div>
      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map(apt => {
            const dateObj = new Date(apt.dateObj);
            const day = dateObj.getDate();
            const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dateObj.getMonth()];
            return (
              <div key={apt.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg">
                <div className="flex items-center gap-6 flex-1">
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 min-w-20"><div className="text-2xl font-bold text-teal-700">{day}</div><div className="text-xs text-teal-600 font-semibold">{month}</div></div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{apt.doctorName}</p>
                    <p className="text-sm text-gray-500 mb-2">{apt.specialty}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 text-sm font-medium"><Clock className="w-4 h-4" />{apt.time}</span>
                      <span className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-green-700 text-sm font-medium">{apt.status}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700 px-4 py-2 rounded-lg font-medium"><FileText className="w-4 h-4" />View</button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No consultation history.</div>
      )}
    </div>
  );
}

function ConsultationsTab({ consultationSettings, setConsultationSettings, setShowSaveConsultModal }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Online Consultation Settings</h3>
        <p className="text-gray-600 text-sm mb-8">Set up your availability for online consultations with patients.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={!consultationSettings.enabled} onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: false }))} className="w-4 h-4 text-teal-500" /><span>Disable</span></label>
              <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={consultationSettings.enabled} onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: true }))} className="w-4 h-4 text-teal-500" /><span>Enable</span></label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <select value={consultationSettings.duration} onChange={(e) => setConsultationSettings(prev => ({ ...prev, duration: e.target.value }))} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white"><option>15 mins</option><option>30 mins</option><option>45 mins</option><option>1 hour</option></select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee (RWF)</label>
            <input type="number" value={consultationSettings.fees} onChange={(e) => setConsultationSettings(prev => ({ ...prev, fees: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={() => setShowSaveConsultModal(true)} className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600">Save Settings</button>
      </div>
    </div>
  );
}

function DocumentsTab() {
  return <div className="text-center py-12 text-gray-500"><FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p>No documents available yet.</p></div>;
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-800">Account Settings</h3>
      <div className="border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-800">Email Notifications</p>
            <p className="text-sm text-gray-600">Receive appointment updates</p>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600" />
        </div>
      </div>
      <div className="border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-800">Two-Factor Authentication</p>
            <p className="text-sm text-gray-600">Extra security layer</p>
          </div>
          <input type="checkbox" className="w-4 h-4 text-teal-600" />
        </div>
      </div>
      <div className="pt-4">
        <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium">Delete Account</button>
      </div>
    </div>
  );
}
