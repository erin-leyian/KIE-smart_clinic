import React, { useState, useEffect } from "react";import React, { useState, useEffect } from "react";import React, { useState, useEffect } from "react";

import Modal from '../../components/Modal';

import DashboardLayout from "../../components/Layout/DashboardLayout";import Modal from '../../components/Modal';import Modal from '../../components/Modal';

import { Edit2, FileText, AlertCircle, RotateCcw, Save, Calendar, Mail, Phone, MapPin, Award, Clock, User, Shield } from "lucide-react";

import mockData from "../../data/mockData.json";import DashboardLayout from "../../components/Layout/DashboardLayout";import DashboardLayout from "../../components/Layout/DashboardLayout";

import { formatErrorMessage } from '../../utils/errorHandler';

import { Edit2, FileText, AlertCircle, RotateCcw, Save, X, Calendar, Mail, Phone, MapPin, Award, Clock, User, Download, Shield } from "lucide-react";import { Edit2, FileText, AlertCircle, RotateCcw, Save, X, Calendar, Mail, Phone, MapPin, Award, Clock, User, Download, Shield } from "lucide-react";

export default function Profile() {

  const [activeTab, setActiveTab] = useState("general");import mockData from "../../data/mockData.json";import mockData from "../../data/mockData.json";

  const [user, setUser] = useState(null);

  const [history, setHistory] = useState([]);import { formatErrorMessage } from '../../utils/errorHandler';import { formatErrorMessage } from '../../utils/errorHandler';

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [userRole, setUserRole] = useState('patient');

  const [showEditPersonal, setShowEditPersonal] = useState(false);export default function Profile() {export default function Profile() {

  const [showEditContact, setShowEditContact] = useState(false);

  const [showSaveConsultModal, setShowSaveConsultModal] = useState(false);  const [activeTab, setActiveTab] = useState("general");  const [activeTab, setActiveTab] = useState("general");

  const [editPersonal, setEditPersonal] = useState({ dob: '', age: '' });

  const [editContact, setEditContact] = useState({ phone: '', email: '', location: '' });  const [user, setUser] = useState(null);  const [user, setUser] = useState(null);

  const [consultationSettings, setConsultationSettings] = useState({

    enabled: true,  const [history, setHistory] = useState([]);  const [history, setHistory] = useState([]);

    types: { text: false, video: true, call: false },

    duration: '30 mins',  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

    fees: '25000'

  });  const [error, setError] = useState('');  const [error, setError] = useState('');

  const [savingConsult, setSavingConsult] = useState(false);

  const [userRole, setUserRole] = useState('patient');  const [userRole, setUserRole] = useState('patient');

  useEffect(() => {

    const loadProfileData = async () => {    

      try {

        setLoading(true);  // Edit modals  // Edit modals

        setError('');

        await new Promise(resolve => setTimeout(resolve, 600));  const [showEditPersonal, setShowEditPersonal] = useState(false);  const [showEditPersonal, setShowEditPersonal] = useState(false);

        

        const storedUser = localStorage.getItem('user');  const [showEditContact, setShowEditContact] = useState(false);  const [showEditContact, setShowEditContact] = useState(false);

        if (!storedUser) throw new Error('User profile not found. Please log in again.');

          const [showSaveConsultModal, setShowSaveConsultModal] = useState(false);  const [showSaveConsultModal, setShowSaveConsultModal] = useState(false);

        const currentUser = JSON.parse(storedUser);

        setUserRole(currentUser.role || 'patient');    

        

        const userData = mockData.users.find(u => u.id === currentUser.id || u.email === currentUser.email);  // Edit values  // Edit values

        if (!userData) throw new Error('User profile not found. Please try again.');

        if (!mockData.appointments || !Array.isArray(mockData.appointments)) throw new Error('Consultation history not found.');  const [editPersonal, setEditPersonal] = useState({ dob: '', age: '' });  const [editPersonal, setEditPersonal] = useState({ dob: '', age: '' });

        

        const userAppointments = mockData.appointments.filter(apt =>   const [editContact, setEditContact] = useState({ phone: '', email: '', location: '' });  const [editContact, setEditContact] = useState({ phone: '', email: '', location: '' });

          apt.patientName === userData.name || apt.patientId === userData.id

        );    

        

        setUser(userData);  // Online consultations  // Online consultations

        setHistory(userAppointments);

        setEditPersonal({ dob: userData.dob, age: userData.age });  const [consultationSettings, setConsultationSettings] = useState({  const [consultationSettings, setConsultationSettings] = useState({

        setEditContact({ phone: userData.phone, email: userData.email, location: userData.location });

        setLoading(false);    enabled: true,    enabled: true,

      } catch (err) {

        setError(formatErrorMessage(err));    types: { text: false, video: true, call: false },    types: { text: false, video: true, call: false },

        setLoading(false);

      }    duration: '30 mins',    duration: '30 mins',

    };

    loadProfileData();    fees: '25000'    fees: '25000'

  }, []);

  });  });

  const handleRetryLoadData = async () => {

    try {  const [savingConsult, setSavingConsult] = useState(false);  const [savingConsult, setSavingConsult] = useState(false);

      setLoading(true);

      setError('');

      await new Promise(resolve => setTimeout(resolve, 600));

        useEffect(() => {  useEffect(() => {

      const storedUser = localStorage.getItem('user');

      if (!storedUser) throw new Error('User profile not found. Please log in again.');    const loadProfileData = async () => {    const loadProfileData = async () => {

      

      const currentUser = JSON.parse(storedUser);      try {      try {

      const userData = mockData.users.find(u => u.id === currentUser.id || u.email === currentUser.email);

      if (!userData) throw new Error('User profile not found. Please try again.');        setLoading(true);        setLoading(true);

      if (!mockData.appointments || !Array.isArray(mockData.appointments)) throw new Error('Consultation history not found.');

              setError('');        setError('');

      const userAppointments = mockData.appointments.filter(apt => 

        apt.patientName === userData.name || apt.patientId === userData.id                

      );

              await new Promise(resolve => setTimeout(resolve, 600));        await new Promise(resolve => setTimeout(resolve, 600));

      setUser(userData);

      setHistory(userAppointments);                

      setLoading(false);

    } catch (err) {        // Get logged-in user from localStorage        // Get logged-in user from localStorage

      setError(formatErrorMessage(err));

      setLoading(false);        const storedUser = localStorage.getItem('user');        const storedUser = localStorage.getItem('user');

    }

  };        if (!storedUser) {        if (!storedUser) {



  const handleSavePersonal = () => {          throw new Error('User profile not found. Please log in again.');          throw new Error('User profile not found. Please log in again.');

    setUser(prev => ({ ...prev, dob: editPersonal.dob, age: editPersonal.age }));

    setShowEditPersonal(false);        }        }

  };

                

  const handleSaveContact = () => {

    setUser(prev => ({ ...prev, phone: editContact.phone, email: editContact.email, location: editContact.location }));        const currentUser = JSON.parse(storedUser);        const currentUser = JSON.parse(storedUser);

    setShowEditContact(false);

  };        setUserRole(currentUser.role || 'patient');        setUserRole(currentUser.role || 'patient');



  const handleSaveConsultSettings = async () => {                

    setSavingConsult(true);

    await new Promise(r => setTimeout(r, 700));        // Find the user in mockData by ID or name        // Find the user in mockData by ID or name

    setSavingConsult(false);

    setShowSaveConsultModal(false);        const userData = mockData.users.find(u => u.id === currentUser.id || u.email === currentUser.email);        const userData = mockData.users.find(u => u.id === currentUser.id || u.email === currentUser.email);

  };

                

  return (

    <DashboardLayout title="Profile">        if (!userData) {        if (!userData) {

      {error && (

        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">          throw new Error('User profile not found. Please try again.');          throw new Error('User profile not found. Please try again.');

          <div className="flex items-start space-x-3">

            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />        }        }

            <div>

              <h3 className="font-semibold text-red-800">Error Loading Profile</h3>        if (!mockData.appointments || !Array.isArray(mockData.appointments)) {        if (!mockData.appointments || !Array.isArray(mockData.appointments)) {

              <p className="text-red-700 text-sm mt-1">{error}</p>

            </div>          throw new Error('Consultation history not found.');          throw new Error('Consultation history not found.');

          </div>

          <button onClick={handleRetryLoadData} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0">        }        }

            <RotateCcw className="w-4 h-4" />

            <span className="text-sm">Retry</span>                

          </button>

        </div>        // Filter appointments for this user only        // Filter appointments for this user only

      )}

        const userAppointments = mockData.appointments.filter(apt =>         const userAppointments = mockData.appointments.filter(apt => 

      {loading ? (

        <div className="text-center py-12 text-gray-500">Loading profile...</div>          apt.patientName === userData.name || apt.patientId === userData.id          apt.patientName === userData.name || apt.patientId === userData.id

      ) : user ? (

        <div className="space-y-6">        );        );

          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">

            <h1 className="text-3xl font-bold">{user.name}</h1>                

            <div className="flex items-center gap-2 mt-2">

              <Award className="w-4 h-4" />        setUser(userData);        setUser(userData);

              <p className="text-teal-100">{userRole === 'admin' ? 'System Administrator' : user.specialty || 'Patient'}</p>

            </div>        setHistory(userAppointments);        setHistory(userAppointments);

            <div className="flex items-center gap-2 mt-1">

              <MapPin className="w-4 h-4" />        setEditPersonal({ dob: userData.dob, age: userData.age });        setEditPersonal({ dob: userData.dob, age: userData.age });

              <p className="text-teal-100 text-sm">{user.location}</p>

            </div>        setEditContact({ phone: userData.phone, email: userData.email, location: userData.location });        setEditContact({ phone: userData.phone, email: userData.email, location: userData.location });

          </div>

        setLoading(false);        setLoading(false);

          <div className="flex gap-2 border-b bg-white rounded-t-lg overflow-x-auto">

            {userRole === 'admin'       } catch (err) {      } catch (err) {

              ? ['general', 'contact', 'permissions', 'settings'].map(tab => (

                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>        const errorMessage = formatErrorMessage(err);        const errorMessage = formatErrorMessage(err);

                    {tab.charAt(0).toUpperCase() + tab.slice(1)}

                  </button>        setError(errorMessage);        setError(errorMessage);

                ))

              : ['general', 'history', ...(userRole === 'doctor' ? ['consultations', 'documents'] : []), 'settings'].map(tab => (        setLoading(false);        setLoading(false);

                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>

                    {tab === 'consultations' ? 'Online Consultations' : tab.charAt(0).toUpperCase() + tab.slice(1)}      }      }

                  </button>

                ))    };    };

            }

          </div>        



          <div className="bg-white rounded-b-lg shadow-sm p-8 space-y-6">    loadProfileData();    loadProfileData();

            {userRole === 'admin' && activeTab === 'general' && (

              <div className="space-y-6">  }, []);  }, []);

                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">

                  <div className="flex items-start gap-6">

                    <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">

                      <Shield size={40} />  const handleRetryLoadData = async () => {  const handleRetryLoadData = async () => {

                    </div>

                    <div>    try {    try {

                      <h2 className="text-3xl font-bold mb-2">{user.name}</h2>

                      <p className="text-purple-100 flex items-center gap-2"><Shield size={16} /> System Administrator</p>      setLoading(true);      setLoading(true);

                      <p className="text-purple-100 text-sm mt-2">ID: {user.id}</p>

                    </div>      setError('');      setError('');

                  </div>

                </div>            

                <div>

                  <div className="flex justify-between items-center mb-4">      await new Promise(resolve => setTimeout(resolve, 600));      await new Promise(resolve => setTimeout(resolve, 600));

                    <h3 className="text-lg font-bold text-gray-800">Account Information</h3>

                    <button onClick={() => { setEditPersonal({ dob: user.dob, age: user.age }); setShowEditPersonal(true); }} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">            

                      <Edit2 className="w-4 h-4" />

                      Edit      // Get logged-in user from localStorage      // Get logged-in user from localStorage

                    </button>

                  </div>      const storedUser = localStorage.getItem('user');      const storedUser = localStorage.getItem('user');

                  <div className="grid grid-cols-2 gap-4">

                    <div className="bg-purple-50 p-4 rounded-lg">      if (!storedUser) {      if (!storedUser) {

                      <p className="text-gray-500 text-sm mb-1">Full Name</p>

                      <p className="text-gray-800 font-medium text-lg">{user.name}</p>        throw new Error('User profile not found. Please log in again.');        throw new Error('User profile not found. Please log in again.');

                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">      }      }

                      <p className="text-gray-500 text-sm mb-1">Role</p>

                      <p className="text-purple-600 font-bold text-lg flex items-center gap-2"><Shield size={16} /> Administrator</p>            

                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">      const currentUser = JSON.parse(storedUser);      const currentUser = JSON.parse(storedUser);

                      <p className="text-gray-500 text-sm mb-1">Email</p>

                      <p className="text-gray-800 font-medium">{user.email}</p>            

                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">      // Find the user in mockData by ID or name      // Find the user in mockData by ID or name

                      <p className="text-gray-500 text-sm mb-1">Status</p>

                      <p className="text-green-600 font-medium flex items-center gap-2"><span className="w-2 h-2 bg-green-600 rounded-full"></span> Active</p>      const userData = mockData.users.find(u => u.id === currentUser.id || u.email === currentUser.email);      const userData = mockData.users.find(u => u.id === currentUser.id || u.email === currentUser.email);

                    </div>

                  </div>            

                </div>

              </div>      if (!userData) {      if (!userData) {

            )}

        throw new Error('User profile not found. Please try again.');        throw new Error('User profile not found. Please try again.');

            {userRole !== 'admin' && activeTab === 'general' && (

              <div className="space-y-6">      }      }

                <div className="border-b pb-6">

                  <div className="flex justify-between items-center mb-4">      if (!mockData.appointments || !Array.isArray(mockData.appointments)) {      if (!mockData.appointments || !Array.isArray(mockData.appointments)) {

                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>

                    <button onClick={() => { setEditPersonal({ dob: user.dob, age: user.age }); setShowEditPersonal(true); }} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">        throw new Error('Consultation history not found.');        throw new Error('Consultation history not found.');

                      <Edit2 className="w-4 h-4" />

                      Edit      }      }

                    </button>

                  </div>            

                  <div className="grid grid-cols-3 gap-4">

                    <div className="bg-blue-50 p-4 rounded-lg">      // Filter appointments for this user only      // Filter appointments for this user only

                      <div className="flex items-center gap-2 mb-1">

                        <Calendar className="w-4 h-4 text-blue-600" />      const userAppointments = mockData.appointments.filter(apt =>       const userAppointments = mockData.appointments.filter(apt => 

                        <p className="text-gray-500 text-sm">Date of Birth</p>

                      </div>        apt.patientName === userData.name || apt.patientId === userData.id        apt.patientName === userData.name || apt.patientId === userData.id

                      <p className="text-gray-800 font-medium">{user.dob}</p>

                    </div>      );      );

                    <div className="bg-blue-50 p-4 rounded-lg">

                      <div className="flex items-center gap-2 mb-1">            

                        <User className="w-4 h-4 text-blue-600" />

                        <p className="text-gray-500 text-sm">Age</p>      setUser(userData);      setUser(userData);

                      </div>

                      <p className="text-gray-800 font-medium">{user.age} years</p>      setHistory(userAppointments);      setHistory(userAppointments);

                    </div>

                  </div>      setLoading(false);      setLoading(false);

                </div>

    } catch (err) {    } catch (err) {

                <div>

                  <div className="flex justify-between items-center mb-4">      const errorMessage = formatErrorMessage(err);      const errorMessage = formatErrorMessage(err);

                    <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>

                    <button onClick={() => { setEditContact({ phone: user.phone, email: user.email, location: user.location }); setShowEditContact(true); }} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">      setError(errorMessage);      setError(errorMessage);

                      <Edit2 className="w-4 h-4" />

                      Edit      setLoading(false);      setLoading(false);

                    </button>

                  </div>    }    }

                  <div className="grid grid-cols-3 gap-4">

                    <div className="bg-green-50 p-4 rounded-lg">  };  };

                      <div className="flex items-center gap-2 mb-1">

                        <Phone className="w-4 h-4 text-green-600" />

                        <p className="text-gray-500 text-sm">Phone</p>

                      </div>  // Save handlers  // Save handlers

                      <p className="text-gray-800 font-medium">{user.phone}</p>

                    </div>  const handleSavePersonal = () => {  const handleSavePersonal = () => {

                    <div className="bg-green-50 p-4 rounded-lg">

                      <div className="flex items-center gap-2 mb-1">    setUser(prev => ({ ...prev, dob: editPersonal.dob, age: editPersonal.age }));    setUser(prev => ({ ...prev, dob: editPersonal.dob, age: editPersonal.age }));

                        <Mail className="w-4 h-4 text-green-600" />

                        <p className="text-gray-500 text-sm">Email</p>    setShowEditPersonal(false);    setShowEditPersonal(false);

                      </div>

                      <p className="text-gray-800 font-medium text-sm">{user.email}</p>  };  };

                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">

                      <div className="flex items-center gap-2 mb-1">

                        <MapPin className="w-4 h-4 text-green-600" />  const handleSaveContact = () => {  const handleSaveContact = () => {

                        <p className="text-gray-500 text-sm">Location</p>

                      </div>    setUser(prev => ({ ...prev, phone: editContact.phone, email: editContact.email, location: editContact.location }));    setUser(prev => ({ ...prev, phone: editContact.phone, email: editContact.email, location: editContact.location }));

                      <p className="text-gray-800 font-medium">{user.location}</p>

                    </div>    setShowEditContact(false);    setShowEditContact(false);

                  </div>

                </div>  };  };

              </div>

            )}



            {userRole === 'admin' && activeTab === 'contact' && (  const handleSaveConsultSettings = async () => {  const handleSaveConsultSettings = async () => {

              <div className="space-y-6">

                <div className="flex justify-between items-center mb-4">    setSavingConsult(true);    setSavingConsult(true);

                  <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>

                  <button onClick={() => { setEditContact({ phone: user.phone, email: user.email, location: user.location }); setShowEditContact(true); }} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">    await new Promise(r => setTimeout(r, 700));    await new Promise(r => setTimeout(r, 700));

                    <Edit2 className="w-4 h-4" />

                    Edit    setSavingConsult(false);    setSavingConsult(false);

                  </button>

                </div>    setShowSaveConsultModal(false);    setShowSaveConsultModal(false);

                <div className="grid grid-cols-3 gap-4">

                  <div className="bg-purple-50 p-4 rounded-lg">  };  };

                    <div className="flex items-center gap-2 mb-1">

                      <Phone className="w-4 h-4 text-purple-600" />

                      <p className="text-gray-500 text-sm">Phone</p>

                    </div>  return (  return (

                    <p className="text-gray-800 font-medium">{user.phone}</p>

                  </div>    <DashboardLayout title="Profile">    <DashboardLayout title="Profile">

                  <div className="bg-purple-50 p-4 rounded-lg">

                    <div className="flex items-center gap-2 mb-1">      {/* Error Banner */}      {/* Error Banner */}

                      <Mail className="w-4 h-4 text-purple-600" />

                      <p className="text-gray-500 text-sm">Email</p>      {error && (      {error && (

                    </div>

                    <p className="text-gray-800 font-medium text-sm">{user.email}</p>        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">

                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">          <div className="flex items-start space-x-3">          <div className="flex items-start space-x-3">

                    <div className="flex items-center gap-2 mb-1">

                      <MapPin className="w-4 h-4 text-purple-600" />            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />

                      <p className="text-gray-500 text-sm">Location</p>

                    </div>            <div>            <div>

                    <p className="text-gray-800 font-medium">{user.location}</p>

                  </div>              <h3 className="font-semibold text-red-800">Error Loading Profile</h3>              <h3 className="font-semibold text-red-800">Error Loading Profile</h3>

                </div>

              </div>              <p className="text-red-700 text-sm mt-1">{error}</p>              <p className="text-red-700 text-sm mt-1">{error}</p>

            )}

            </div>            </div>

            {userRole === 'admin' && activeTab === 'permissions' && (

              <div className="space-y-6">          </div>          </div>

                <h3 className="text-lg font-bold text-gray-800">Administrator Permissions</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">          <button          <button

                  {[

                    { title: 'View All Users', desc: 'Access and view all registered users' },            onClick={handleRetryLoadData}            onClick={handleRetryLoadData}

                    { title: 'Manage Doctors', desc: 'Add, edit, and delete doctor profiles' },

                    { title: 'Manage Appointments', desc: 'Edit and delete appointments' },            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"

                    { title: 'Manage Patient Records', desc: 'Edit and delete patient medical records' },

                    { title: 'View Analytics', desc: 'Access system statistics and reports' },          >          >

                    { title: 'Manage Admins', desc: 'Add and manage administrator accounts' }

                  ].map((perm, idx) => (            <RotateCcw className="w-4 h-4" />            <RotateCcw className="w-4 h-4" />

                    <div key={idx} className="border border-purple-200 bg-purple-50 p-4 rounded-lg">

                      <div className="flex items-start gap-3">            <span className="text-sm">Retry</span>            <span className="text-sm">Retry</span>

                        <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">

                          <span className="text-xs font-bold">✓</span>          </button>          </button>

                        </div>

                        <div>        </div>        </div>

                          <p className="font-medium text-gray-800">{perm.title}</p>

                          <p className="text-sm text-gray-600 mt-1">{perm.desc}</p>      )}      )}

                        </div>

                      </div>

                    </div>

                  ))}      {/* Loading State */}      {/* Loading State */}

                </div>

              </div>      {loading ? (      {loading ? (

            )}

        <div className="text-center py-12 text-gray-500">Loading profile...</div>        <div className="text-center py-12 text-gray-500">Loading profile...</div>

            {activeTab === 'history' && (

              <div className="space-y-6">      ) : user ? (      ) : user ? (

                <div className="flex justify-between items-center">

                  <h3 className="text-lg font-bold text-gray-800">Consultation History</h3>        <div className="space-y-6">        <div className="space-y-6">

                  <select className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:border-teal-500">

                    <option>All Time</option>          {/* Profile Header Card */}          {/* Profile Header Card */}

                    <option>Last 30 Days</option>

                    <option>Last 90 Days</option>          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">

                  </select>

                </div>            <div className="flex items-start justify-between">            <div className="flex items-start justify-between">



                {history.length > 0 ? (              <div>              <div>

                  <div className="space-y-3">

                    {history.map(appointment => {                <h1 className="text-3xl font-bold">{user.name}</h1>                <h1 className="text-3xl font-bold">{user.name}</h1>

                      const dateObj = new Date(appointment.dateObj);

                      const day = dateObj.getDate();                <div className="flex items-center gap-2 mt-2">                <div className="flex items-center gap-2 mt-2">

                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                      const month = monthNames[dateObj.getMonth()];                  <Award className="w-4 h-4" />                  <Award className="w-4 h-4" />

                      

                      return (                  <p className="text-teal-100">{userRole === 'admin' ? 'System Administrator' : user.specialty || 'Patient'}</p>                  <p className="text-teal-100">{userRole === 'admin' ? 'System Administrator' : user.specialty || 'Patient'}</p>

                        <div key={appointment.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-teal-400">

                          <div className="flex items-center gap-6 flex-1">                </div>                </div>

                            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 min-w-20 border border-teal-200">

                              <div className="text-2xl font-bold text-teal-700">{day}</div>                <div className="flex items-center gap-2 mt-1">                <div className="flex items-center gap-2 mt-1">

                              <div className="text-xs text-teal-600 font-semibold">{month}</div>

                              <div className="text-xs text-teal-500 font-medium">{appointment.date}</div>                  <MapPin className="w-4 h-4" />                  <MapPin className="w-4 h-4" />

                            </div>

                  <p className="text-teal-100 text-sm">{user.location}</p>                  <p className="text-teal-100 text-sm">{user.location}</p>

                            <div className="flex-1">

                              <p className="font-bold text-gray-800 text-lg">{appointment.doctorName}</p>                </div>                </div>

                              <p className="text-sm text-gray-500 mb-2">{appointment.specialty}</p>

                              <div className="flex items-center gap-4 mt-3 flex-wrap">              </div>              </div>

                                <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 text-sm font-medium">

                                  <Clock className="w-4 h-4" />            </div>            </div>

                                  {appointment.time}

                                </span>          </div>          </div>

                                <span className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-green-700 text-sm font-medium">

                                  {appointment.status === 'Completed' && '✓'}

                                  {appointment.status === 'Confirmed' && '◆'}

                                  {appointment.status === 'Pending' && '○'}          {/* Tabs */}          {/* Tabs */}

                                  {appointment.status}

                                </span>          <div className="flex gap-2 border-b bg-white rounded-t-lg overflow-x-auto">          <div className="flex gap-2 border-b bg-white rounded-t-lg overflow-x-auto">

                              </div>

                              {appointment.notes && (            {userRole === 'admin'             {userRole === 'admin' 

                                <p className="text-sm text-gray-600 mt-2 italic">"{appointment.notes}"</p>

                              )}              ? ['general', 'contact', 'permissions', 'settings'].map(tab => (              ? ['general', 'contact', 'permissions', 'settings'].map(tab => (

                            </div>

                          </div>                  <button                  <button



                          <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap">                    key={tab}                    key={tab}

                            <FileText className="w-4 h-4" />

                            View Details                    onClick={() => setActiveTab(tab)}                    onClick={() => setActiveTab(tab)}

                          </button>

                        </div>                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${

                      );

                    })}                      activeTab === tab                      activeTab === tab

                  </div>

                ) : (                        ? 'border-purple-500 text-purple-600'                        ? 'border-purple-500 text-purple-600'

                  <div className="text-center py-12 text-gray-500">No consultation history available.</div>

                )}                        : 'border-transparent text-gray-600 hover:text-gray-800'                        : 'border-transparent text-gray-600 hover:text-gray-800'

              </div>

            )}                    }`}                    }`}



            {activeTab === 'consultations' && (                  >                  >

              <div className="space-y-8">

                <div>                    {tab.charAt(0).toUpperCase() + tab.slice(1)}                    {tab.charAt(0).toUpperCase() + tab.slice(1)}

                  <h3 className="text-lg font-bold text-gray-800 mb-4">Online Consultation Settings</h3>

                  <p className="text-gray-600 text-sm mb-8 max-w-3xl">Set up your availability for online consultations with patients.</p>                  </button>                  </button>



                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">                ))                ))

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>              : ['general', 'history', ...(userRole === 'doctor' ? ['consultations', 'documents'] : []), 'settings'].map(tab => (              : ['general', 'history', ...(userRole === 'doctor' ? ['consultations', 'documents'] : []), 'settings'].map(tab => (

                      <div className="flex space-x-6">

                        <label className="flex items-center space-x-2 cursor-pointer">                  <button                  <button

                          <input type="radio" name="availability" checked={!consultationSettings.enabled} onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: false }))} className="w-4 h-4 text-teal-500" />

                          <span className="text-gray-700">Disable</span>                    key={tab}                    key={tab}

                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">                    onClick={() => setActiveTab(tab)}                    onClick={() => setActiveTab(tab)}

                          <input type="radio" name="availability" checked={consultationSettings.enabled} onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: true }))} className="w-4 h-4 text-teal-500" />

                          <span className="text-gray-700">Enable</span>                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${

                        </label>

                      </div>                      activeTab === tab                      activeTab === tab

                    </div>

                        ? 'border-teal-500 text-teal-600'                        ? 'border-teal-500 text-teal-600'

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-3">Type Of Availability</label>                        : 'border-transparent text-gray-600 hover:text-gray-800'                        : 'border-transparent text-gray-600 hover:text-gray-800'

                      <div className="flex space-x-6">

                        <label className="flex items-center space-x-2 cursor-pointer">                    }`}                    }`}

                          <input type="checkbox" checked={consultationSettings.types.text} onChange={() => setConsultationSettings(prev => ({ ...prev, types: { ...prev.types, text: !prev.types.text } }))} className="w-4 h-4 text-teal-500 rounded" />

                          <span className="text-gray-700">Text</span>                  >                  >

                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">                    {tab === 'consultations' ? 'Online Consultations' : tab.charAt(0).toUpperCase() + tab.slice(1)}                    {tab === 'consultations' ? 'Online Consultations' : tab.charAt(0).toUpperCase() + tab.slice(1)}

                          <input type="checkbox" checked={consultationSettings.types.video} onChange={() => setConsultationSettings(prev => ({ ...prev, types: { ...prev.types, video: !prev.types.video } }))} className="w-4 h-4 text-teal-500 rounded" />

                          <span className="text-gray-700">Video</span>                  </button>                  </button>

                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">                ))                ))

                          <input type="checkbox" checked={consultationSettings.types.call} onChange={() => setConsultationSettings(prev => ({ ...prev, types: { ...prev.types, call: !prev.types.call } }))} className="w-4 h-4 text-teal-500 rounded" />

                          <span className="text-gray-700">Call</span>            }            }

                        </label>

                      </div>          </div>          </div>

                    </div>



                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>          {/* Content Sections */}          {/* Content Sections */}

                      <select value={consultationSettings.duration} onChange={(e) => setConsultationSettings(prev => ({ ...prev, duration: e.target.value }))} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 bg-white">

                        <option>15 mins</option>          <div className="bg-white rounded-b-lg shadow-sm p-8 space-y-6">          <div className="bg-white rounded-b-lg shadow-sm p-8 space-y-6">

                        <option>30 mins</option>

                        <option>45 mins</option>            {/* ADMIN GENERAL TAB */}            {/* ADMIN GENERAL TAB */}

                        <option>1 hour</option>

                      </select>            {userRole === 'admin' && activeTab === 'general' && (            {userRole === 'admin' && activeTab === 'general' && (

                    </div>

              <div className="space-y-6">              <div className="space-y-6">

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">

                      <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">

                        <span className="bg-gray-50 px-4 py-2.5 text-gray-500 border-r font-medium">RWF</span>                  <div className="flex items-start gap-6">                  <div className="flex items-start gap-6">

                        <input type="number" value={consultationSettings.fees} onChange={(e) => setConsultationSettings(prev => ({ ...prev, fees: e.target.value }))} className="flex-1 p-2.5 outline-none w-full" />

                      </div>                    <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">                    <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">

                    </div>

                  </div>                      <Shield size={40} />                      <Shield size={40} />

                </div>

                    </div>                    </div>

                <div className="flex justify-end gap-4 pt-6 border-t">

                  <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition">Cancel</button>                    <div>                    <div>

                  <button onClick={() => setShowSaveConsultModal(true)} className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition shadow-sm">Save Settings</button>

                </div>                      <h2 className="text-3xl font-bold mb-2">{user.name}</h2>                      <h2 className="text-3xl font-bold mb-2">{user.name}</h2>

              </div>

            )}                      <p className="text-purple-100 flex items-center gap-2">                      <p className="text-purple-100 flex items-center gap-2">



            {activeTab === 'documents' && (                        <Shield size={16} /> System Administrator                        <Shield size={16} /> System Administrator

              <div className="text-center py-12 text-gray-500">

                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />                      </p>                      </p>

                <p>No documents available yet.</p>

              </div>                      <p className="text-purple-100 text-sm mt-2">ID: {user.id}</p>                      <p className="text-purple-100 text-sm mt-2">ID: {user.id}</p>

            )}

                    </div>                    </div>

            {activeTab === 'settings' && (

              <div className="space-y-6">                  </div>                  </div>

                <h3 className="text-lg font-bold text-gray-800">Account Settings</h3>

                                </div>                </div>

                <div className="border-b pb-4 space-y-4">

                  <div className="flex justify-between items-center">

                    <div>

                      <p className="font-medium text-gray-800">Email Notifications</p>                <div>                <div>

                      <p className="text-sm text-gray-600">Receive updates about appointments and consultations</p>

                    </div>                  <div className="flex justify-between items-center mb-4">                  <div className="flex justify-between items-center mb-4">

                    <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600" />

                  </div>                    <h3 className="text-lg font-bold text-gray-800">Account Information</h3>                    <h3 className="text-lg font-bold text-gray-800">Account Information</h3>

                </div>

                    <button                    <button

                <div className="border-b pb-4 space-y-4">

                  <div className="flex justify-between items-center">                      onClick={() => {                      onClick={() => {

                    <div>

                      <p className="font-medium text-gray-800">Two-Factor Authentication</p>                        setEditPersonal({ dob: user.dob, age: user.age });                        setEditPersonal({ dob: user.dob, age: user.age });

                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>

                    </div>                        setShowEditPersonal(true);                        setShowEditPersonal(true);

                    <input type="checkbox" className="w-4 h-4 text-teal-600" />

                  </div>                      }}                      }}

                </div>

                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"

                <div className="pt-4">

                  <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors">Delete Account</button>                    >                    >

                </div>

              </div>                      <Edit2 className="w-4 h-4" />                      <Edit2 className="w-4 h-4" />

            )}

          </div>                      Edit                      Edit

        </div>

      ) : null}                    </button>                    </button>



      <Modal isOpen={showEditPersonal} onClose={() => setShowEditPersonal(false)} title="Edit Personal Information" size="md">                  </div>                  </div>

        <div className="space-y-4">

          <div>                  <div className="grid grid-cols-2 gap-4">                  <div className="grid grid-cols-2 gap-4">

            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>

            <input type="date" value={editPersonal.dob} onChange={e => setEditPersonal(prev => ({ ...prev, dob: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500" />                    <div className="bg-purple-50 p-4 rounded-lg">                    <div className="bg-purple-50 p-4 rounded-lg">

          </div>

          <div>                      <p className="text-gray-500 text-sm mb-1">Full Name</p>                      <p className="text-gray-500 text-sm mb-1">Full Name</p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>

            <input type="number" value={editPersonal.age} onChange={e => setEditPersonal(prev => ({ ...prev, age: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500" />                      <p className="text-gray-800 font-medium text-lg">{user.name}</p>                      <p className="text-gray-800 font-medium text-lg">{user.name}</p>

          </div>

          <div className="flex gap-2 pt-4 border-t">                    </div>                    </div>

            <button onClick={handleSavePersonal} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors">

              <Save className="w-4 h-4" />                    <div className="bg-purple-50 p-4 rounded-lg">                    <div className="bg-purple-50 p-4 rounded-lg">

              Save Changes

            </button>                      <p className="text-gray-500 text-sm mb-1">Role</p>                      <p className="text-gray-500 text-sm mb-1">Role</p>

            <button onClick={() => setShowEditPersonal(false)} className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors">Cancel</button>

          </div>                      <p className="text-purple-600 font-bold text-lg flex items-center gap-2">                      <p className="text-purple-600 font-bold text-lg flex items-center gap-2">

        </div>

      </Modal>                        <Shield size={16} /> Administrator                        <Shield size={16} /> Administrator



      <Modal isOpen={showEditContact} onClose={() => setShowEditContact(false)} title="Edit Contact Information" size="md">                      </p>                      </p>

        <div className="space-y-4">

          <div>                    </div>                    </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>

            <input type="tel" value={editContact.phone} onChange={e => setEditContact(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500" />                    <div className="bg-purple-50 p-4 rounded-lg">                    <div className="bg-purple-50 p-4 rounded-lg">

          </div>

          <div>                      <p className="text-gray-500 text-sm mb-1">Email</p>                      <p className="text-gray-500 text-sm mb-1">Email</p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>

            <input type="email" value={editContact.email} onChange={e => setEditContact(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500" />                      <p className="text-gray-800 font-medium">{user.email}</p>                      <p className="text-gray-800 font-medium">{user.email}</p>

          </div>

          <div>                    </div>                    </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>

            <input type="text" value={editContact.location} onChange={e => setEditContact(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500" />                    <div className="bg-purple-50 p-4 rounded-lg">                    <div className="bg-purple-50 p-4 rounded-lg">

          </div>

          <div className="flex gap-2 pt-4 border-t">                      <p className="text-gray-500 text-sm mb-1">Status</p>                      <p className="text-gray-500 text-sm mb-1">Status</p>

            <button onClick={handleSaveContact} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors">

              <Save className="w-4 h-4" />                      <p className="text-green-600 font-medium flex items-center gap-2">                      <p className="text-green-600 font-medium flex items-center gap-2">

              Save Changes

            </button>                        <span className="w-2 h-2 bg-green-600 rounded-full"></span> Active                        <span className="w-2 h-2 bg-green-600 rounded-full"></span> Active

            <button onClick={() => setShowEditContact(false)} className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors">Cancel</button>

          </div>                      </p>                      </p>

        </div>

      </Modal>                    </div>                    </div>



      <Modal isOpen={showSaveConsultModal} onClose={() => setShowSaveConsultModal(false)} title="Save Consultation Settings" size="md">                  </div>                  </div>

        <div className="space-y-4">

          <p className="text-gray-700">Are you sure you want to save these online consultation settings?</p>                </div>                </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

            <p className="text-sm text-blue-800"><strong>Status:</strong> {consultationSettings.enabled ? 'Enabled' : 'Disabled'}</p>              </div>              </div>

            <p className="text-sm text-blue-800 mt-1"><strong>Types:</strong> {Object.entries(consultationSettings.types).filter(([_, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') || 'None selected'}</p>

            <p className="text-sm text-blue-800 mt-1"><strong>Duration:</strong> {consultationSettings.duration}</p>            )}            )}

            <p className="text-sm text-blue-800 mt-1"><strong>Fee:</strong> {consultationSettings.fees} RWF</p>

          </div>

          <div className="flex gap-2 pt-4 border-t">

            <button onClick={handleSaveConsultSettings} disabled={savingConsult} className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors font-medium">            {/* PATIENT/DOCTOR GENERAL TAB */}            {/* PATIENT/DOCTOR GENERAL TAB */}

              {savingConsult ? 'Saving...' : 'Confirm & Save'}

            </button>            {userRole !== 'admin' && activeTab === 'general' && (            {userRole !== 'admin' && activeTab === 'general' && (

            <button onClick={() => setShowSaveConsultModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors">Cancel</button>

          </div>              <div className="space-y-6">              <div className="space-y-6">

        </div>

      </Modal>                {/* Personal Information */}                {/* Personal Information */}

    </DashboardLayout>

  );                <div className="border-b pb-6">                <div className="border-b pb-6">

}

                  <div className="flex justify-between items-center mb-4">                  <div className="flex justify-between items-center mb-4">

                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>

                    <button                    <button

                      onClick={() => {                      onClick={() => {

                        setEditPersonal({ dob: user.dob, age: user.age });                        setEditPersonal({ dob: user.dob, age: user.age });

                        setShowEditPersonal(true);                        setShowEditPersonal(true);

                      }}                      }}

                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"

                    >                    >

                      <Edit2 className="w-4 h-4" />                      <Edit2 className="w-4 h-4" />

                      Edit                      Edit

                    </button>                    </button>

                  </div>                  </div>

                  <div className="grid grid-cols-3 gap-4">                  <div className="grid grid-cols-3 gap-4">

                    <div className="bg-blue-50 p-4 rounded-lg">                    <div className="bg-blue-50 p-4 rounded-lg">

                      <div className="flex items-center gap-2 mb-1">                      <div className="flex items-center gap-2 mb-1">

                        <Calendar className="w-4 h-4 text-blue-600" />                        <Calendar className="w-4 h-4 text-blue-600" />

                        <p className="text-gray-500 text-sm">Date of Birth</p>                        <p className="text-gray-500 text-sm">Date of Birth</p>

                      </div>                      </div>

                      <p className="text-gray-800 font-medium">{user.dob}</p>                      <p className="text-gray-800 font-medium">{user.dob}</p>

                    </div>                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">                    <div className="bg-blue-50 p-4 rounded-lg">

                      <div className="flex items-center gap-2 mb-1">                      <div className="flex items-center gap-2 mb-1">

                        <User className="w-4 h-4 text-blue-600" />                        <User className="w-4 h-4 text-blue-600" />

                        <p className="text-gray-500 text-sm">Age</p>                        <p className="text-gray-500 text-sm">Age</p>

                      </div>                      </div>

                      <p className="text-gray-800 font-medium">{user.age} years</p>                      <p className="text-gray-800 font-medium">{user.age} years</p>

                    </div>                    </div>

                  </div>                  </div>

                </div>                </div>



                {/* Contact Information */}                {/* Contact Information */}

                <div>                <div>

                  <div className="flex justify-between items-center mb-4">                  <div className="flex justify-between items-center mb-4">

                    <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>                    <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>

                    <button                    <button

                      onClick={() => {                      onClick={() => {

                        setEditContact({ phone: user.phone, email: user.email, location: user.location });                        setEditContact({ phone: user.phone, email: user.email, location: user.location });

                        setShowEditContact(true);                        setShowEditContact(true);

                      }}                      }}

                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"

                    >                    >

                      <Edit2 className="w-4 h-4" />                      <Edit2 className="w-4 h-4" />

                      Edit                      Edit

                    </button>                    </button>

                  </div>                  </div>

                  <div className="grid grid-cols-3 gap-4">                  <div className="grid grid-cols-3 gap-4">

                    <div className="bg-green-50 p-4 rounded-lg">                    <div className="bg-green-50 p-4 rounded-lg">

                      <div className="flex items-center gap-2 mb-1">                      <div className="flex items-center gap-2 mb-1">

                        <Phone className="w-4 h-4 text-green-600" />                        <Phone className="w-4 h-4 text-green-600" />

                        <p className="text-gray-500 text-sm">Phone</p>                        <p className="text-gray-500 text-sm">Phone</p>

                      </div>                      </div>

                      <p className="text-gray-800 font-medium">{user.phone}</p>                      <p className="text-gray-800 font-medium">{user.phone}</p>

                    </div>                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">                    <div className="bg-green-50 p-4 rounded-lg">

                      <div className="flex items-center gap-2 mb-1">                      <div className="flex items-center gap-2 mb-1">

                        <Mail className="w-4 h-4 text-green-600" />                        <Mail className="w-4 h-4 text-green-600" />

                        <p className="text-gray-500 text-sm">Email</p>                        <p className="text-gray-500 text-sm">Email</p>

                      </div>                      </div>

                      <p className="text-gray-800 font-medium text-sm">{user.email}</p>                      <p className="text-gray-800 font-medium text-sm">{user.email}</p>

                    </div>                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">                    <div className="bg-green-50 p-4 rounded-lg">

                      <div className="flex items-center gap-2 mb-1">                      <div className="flex items-center gap-2 mb-1">

                        <MapPin className="w-4 h-4 text-green-600" />                        <MapPin className="w-4 h-4 text-green-600" />

                        <p className="text-gray-500 text-sm">Location</p>                        <p className="text-gray-500 text-sm">Location</p>

                      </div>                      </div>

                      <p className="text-gray-800 font-medium">{user.location}</p>                      <p className="text-gray-800 font-medium">{user.location}</p>

                    </div>                    </div>

                  </div>                  </div>

                </div>                </div>

              </div>              </div>

            )}            )}



            {/* ADMIN CONTACT TAB */}            {/* ADMIN CONTACT TAB */}

            {userRole === 'admin' && activeTab === 'contact' && (            {userRole === 'admin' && activeTab === 'contact' && (

              <div className="space-y-6">              <div className="space-y-6">

                <div className="flex justify-between items-center mb-4">                <div className="flex justify-between items-center mb-4">

                  <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>                  <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>

                  <button                  <button

                    onClick={() => {                    onClick={() => {

                      setEditContact({ phone: user.phone, email: user.email, location: user.location });                      setEditContact({ phone: user.phone, email: user.email, location: user.location });

                      setShowEditContact(true);                      setShowEditContact(true);

                    }}                    }}

                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"

                  >                  >

                    <Edit2 className="w-4 h-4" />                    <Edit2 className="w-4 h-4" />

                    Edit                    Edit

                  </button>                  </button>

                </div>                </div>

                <div className="grid grid-cols-3 gap-4">                <div className="grid grid-cols-3 gap-4">

                  <div className="bg-purple-50 p-4 rounded-lg">                  <div className="bg-purple-50 p-4 rounded-lg">

                    <div className="flex items-center gap-2 mb-1">                    <div className="flex items-center gap-2 mb-1">

                      <Phone className="w-4 h-4 text-purple-600" />                      <Phone className="w-4 h-4 text-purple-600" />

                      <p className="text-gray-500 text-sm">Phone</p>                      <p className="text-gray-500 text-sm">Phone</p>

                    </div>                    </div>

                    <p className="text-gray-800 font-medium">{user.phone}</p>                    <p className="text-gray-800 font-medium">{user.phone}</p>

                  </div>                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">                  <div className="bg-purple-50 p-4 rounded-lg">

                    <div className="flex items-center gap-2 mb-1">                    <div className="flex items-center gap-2 mb-1">

                      <Mail className="w-4 h-4 text-purple-600" />                      <Mail className="w-4 h-4 text-purple-600" />

                      <p className="text-gray-500 text-sm">Email</p>                      <p className="text-gray-500 text-sm">Email</p>

                    </div>                    </div>

                    <p className="text-gray-800 font-medium text-sm">{user.email}</p>                    <p className="text-gray-800 font-medium text-sm">{user.email}</p>

                  </div>                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">                  <div className="bg-purple-50 p-4 rounded-lg">

                    <div className="flex items-center gap-2 mb-1">                    <div className="flex items-center gap-2 mb-1">

                      <MapPin className="w-4 h-4 text-purple-600" />                      <MapPin className="w-4 h-4 text-purple-600" />

                      <p className="text-gray-500 text-sm">Location</p>                      <p className="text-gray-500 text-sm">Location</p>

                    </div>                    </div>

                    <p className="text-gray-800 font-medium">{user.location}</p>                    <p className="text-gray-800 font-medium">{user.location}</p>

                  </div>                  </div>

                </div>                </div>

              </div>              </div>

            )}            )}



            {/* ADMIN PERMISSIONS TAB */}            {/* ADMIN PERMISSIONS TAB */}

            {userRole === 'admin' && activeTab === 'permissions' && (            {userRole === 'admin' && activeTab === 'permissions' && (

              <div className="space-y-6">              <div className="space-y-6">

                <h3 className="text-lg font-bold text-gray-800">Administrator Permissions</h3>                <h3 className="text-lg font-bold text-gray-800">Administrator Permissions</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {[                  {[

                    { title: 'View All Users', desc: 'Access and view all registered users' },                    { title: 'View All Users', desc: 'Access and view all registered users' },

                    { title: 'Manage Doctors', desc: 'Add, edit, and delete doctor profiles' },                    { title: 'Manage Doctors', desc: 'Add, edit, and delete doctor profiles' },

                    { title: 'Manage Appointments', desc: 'Edit and delete appointments' },                    { title: 'Manage Appointments', desc: 'Edit and delete appointments' },

                    { title: 'Manage Patient Records', desc: 'Edit and delete patient medical records' },                    { title: 'Manage Patient Records', desc: 'Edit and delete patient medical records' },

                    { title: 'View Analytics', desc: 'Access system statistics and reports' },                    { title: 'View Analytics', desc: 'Access system statistics and reports' },

                    { title: 'Manage Admins', desc: 'Add and manage administrator accounts' }                    { title: 'Manage Admins', desc: 'Add and manage administrator accounts' }

                  ].map((perm, idx) => (                  ].map((perm, idx) => (

                    <div key={idx} className="border border-purple-200 bg-purple-50 p-4 rounded-lg">                    <div key={idx} className="border border-purple-200 bg-purple-50 p-4 rounded-lg">

                      <div className="flex items-start gap-3">                      <div className="flex items-start gap-3">

                        <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">                        <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">

                          <span className="text-xs font-bold">✓</span>                          <span className="text-xs font-bold">✓</span>

                        </div>                        </div>

                        <div>                        <div>

                          <p className="font-medium text-gray-800">{perm.title}</p>                          <p className="font-medium text-gray-800">{perm.title}</p>

                          <p className="text-sm text-gray-600 mt-1">{perm.desc}</p>                          <p className="text-sm text-gray-600 mt-1">{perm.desc}</p>

                        </div>                        </div>

                      </div>                      </div>

                    </div>                    </div>

                  ))}                  ))}

                </div>                </div>

              </div>              </div>

            )}            )}



            {/* HISTORY TAB */}            {/* HISTORY TAB */}

            {activeTab === 'history' && (            {activeTab === 'history' && (

              <div className="space-y-6">              <div className="space-y-6">

                <div className="flex justify-between items-center">                <div className="flex justify-between items-center">

                  <h3 className="text-lg font-bold text-gray-800">Consultation History</h3>                  <h3 className="text-lg font-bold text-gray-800">Consultation History</h3>

                  <select className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:border-teal-500">                  <select className="border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:border-teal-500">

                    <option>All Time</option>                    <option>All Time</option>

                    <option>Last 30 Days</option>                    <option>Last 30 Days</option>

                    <option>Last 90 Days</option>                    <option>Last 90 Days</option>

                  </select>                  </select>

                </div>                </div>



                {history.length > 0 ? (                {history.length > 0 ? (

                  <div className="space-y-3">                  <div className="space-y-3">

                    {history.map(appointment => {                    {history.map(appointment => {

                      const dateObj = new Date(appointment.dateObj);                      const dateObj = new Date(appointment.dateObj);

                      const day = dateObj.getDate();                      const day = dateObj.getDate();

                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                      const month = monthNames[dateObj.getMonth()];                      const month = monthNames[dateObj.getMonth()];

                                            

                      return (                      return (

                        <div key={appointment.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-teal-400">                        <div key={appointment.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-teal-400">

                          <div className="flex items-center gap-6 flex-1">                          <div className="flex items-center gap-6 flex-1">

                            {/* Date Box */}                            {/* Date Box */}

                            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 min-w-20 border border-teal-200">                            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 min-w-20 border border-teal-200">

                              <div className="text-2xl font-bold text-teal-700">{day}</div>                              <div className="text-2xl font-bold text-teal-700">{day}</div>

                              <div className="text-xs text-teal-600 font-semibold">{month}</div>                              <div className="text-xs text-teal-600 font-semibold">{month}</div>

                              <div className="text-xs text-teal-500 font-medium">{appointment.date}</div>                              <div className="text-xs text-teal-500 font-medium">{appointment.date}</div>

                            </div>                            </div>



                            {/* Content */}                            {/* Content */}

                            <div className="flex-1">                            <div className="flex-1">

                              <p className="font-bold text-gray-800 text-lg">{appointment.doctorName}</p>                              <p className="font-bold text-gray-800 text-lg">{appointment.doctorName}</p>

                              <p className="text-sm text-gray-500 mb-2">{appointment.specialty}</p>                              <p className="text-sm text-gray-500 mb-2">{appointment.specialty}</p>

                              <div className="flex items-center gap-4 mt-3 flex-wrap">                              <div className="flex items-center gap-4 mt-3 flex-wrap">

                                <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 text-sm font-medium">                                <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 text-sm font-medium">

                                  <Clock className="w-4 h-4" />                                  <Clock className="w-4 h-4" />

                                  {appointment.time}                                  {appointment.time}

                                </span>                                </span>

                                <span className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-green-700 text-sm font-medium">                                <span className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-green-700 text-sm font-medium">

                                  {appointment.status === 'Completed' && '✓'}                                  {appointment.status === 'Completed' && '✓'}

                                  {appointment.status === 'Confirmed' && '◆'}                                  {appointment.status === 'Confirmed' && '◆'}

                                  {appointment.status === 'Pending' && '○'}                                  {appointment.status === 'Pending' && '○'}

                                  {appointment.status}                                  {appointment.status}

                                </span>                                </span>

                              </div>                              </div>

                              {appointment.notes && (                              {appointment.notes && (

                                <p className="text-sm text-gray-600 mt-2 italic">"{appointment.notes}"</p>                                <p className="text-sm text-gray-600 mt-2 italic">"{appointment.notes}"</p>

                              )}                              )}

                            </div>                            </div>

                          </div>                          </div>



                          {/* Action */}                          {/* Action */}

                          <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap">                          <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap">

                            <FileText className="w-4 h-4" />                            <FileText className="w-4 h-4" />

                            View Details                            View Details

                          </button>                          </button>

                        </div>                        </div>

                      );                      );

                    })}                    })}

                  </div>                  </div>

                ) : (                ) : (

                  <div className="text-center py-12 text-gray-500">No consultation history available.</div>                  <div className="text-center py-12 text-gray-500">No consultation history available.</div>

                )}                )}

              </div>              </div>

            )}            )}



            {/* ONLINE CONSULTATIONS TAB */}            {/* ONLINE CONSULTATIONS TAB */}

            {activeTab === 'consultations' && (            {activeTab === 'consultations' && (

              <div className="space-y-8">              <div className="space-y-8">

                <div>                <div>

                  <h3 className="text-lg font-bold text-gray-800 mb-4">Online Consultation Settings</h3>                  <h3 className="text-lg font-bold text-gray-800 mb-4">Online Consultation Settings</h3>

                  <p className="text-gray-600 text-sm mb-8 max-w-3xl">                  <p className="text-gray-600 text-sm mb-8 max-w-3xl">

                    Set up your availability for online consultations with patients. This allows the queue management system to correctly place patients.                    Set up your availability for online consultations with patients. This allows the queue management system to correctly place patients.

                  </p>                  </p>



                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Availability */}                    {/* Availability */}

                    <div>                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>                      <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>

                      <div className="flex space-x-6">                      <div className="flex space-x-6">

                        <label className="flex items-center space-x-2 cursor-pointer">                        <label className="flex items-center space-x-2 cursor-pointer">

                          <input                           <input 

                            type="radio"                             type="radio" 

                            name="availability"                             name="availability" 

                            checked={!consultationSettings.enabled}                            checked={!consultationSettings.enabled}

                            onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: false }))}                            onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: false }))}

                            className="w-4 h-4 text-teal-500"                             className="w-4 h-4 text-teal-500" 

                          />                          />

                          <span className="text-gray-700">Disable</span>                          <span className="text-gray-700">Disable</span>

                        </label>                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">                        <label className="flex items-center space-x-2 cursor-pointer">

                          <input                           <input 

                            type="radio"                             type="radio" 

                            name="availability"                             name="availability" 

                            checked={consultationSettings.enabled}                            checked={consultationSettings.enabled}

                            onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: true }))}                            onChange={() => setConsultationSettings(prev => ({ ...prev, enabled: true }))}

                            className="w-4 h-4 text-teal-500"                             className="w-4 h-4 text-teal-500" 

                          />                          />

                          <span className="text-gray-700">Enable</span>                          <span className="text-gray-700">Enable</span>

                        </label>                        </label>

                      </div>                      </div>

                    </div>                    </div>



                    {/* Type of Availability */}                    {/* Type of Availability */}

                    <div>                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-3">Type Of Availability</label>                      <label className="block text-sm font-medium text-gray-700 mb-3">Type Of Availability</label>

                      <div className="flex space-x-6">                      <div className="flex space-x-6">

                        <label className="flex items-center space-x-2 cursor-pointer">                        <label className="flex items-center space-x-2 cursor-pointer">

                          <input                           <input 

                            type="checkbox"                             type="checkbox" 

                            checked={consultationSettings.types.text}                            checked={consultationSettings.types.text}

                            onChange={() => setConsultationSettings(prev => ({                             onChange={() => setConsultationSettings(prev => ({ 

                              ...prev,                               ...prev, 

                              types: { ...prev.types, text: !prev.types.text }                               types: { ...prev.types, text: !prev.types.text } 

                            }))}                            }))}

                            className="w-4 h-4 text-teal-500 rounded"                             className="w-4 h-4 text-teal-500 rounded" 

                          />                          />

                          <span className="text-gray-700">Text</span>                          <span className="text-gray-700">Text</span>

                        </label>                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">                        <label className="flex items-center space-x-2 cursor-pointer">

                          <input                           <input 

                            type="checkbox"                             type="checkbox" 

                            checked={consultationSettings.types.video}                            checked={consultationSettings.types.video}

                            onChange={() => setConsultationSettings(prev => ({                             onChange={() => setConsultationSettings(prev => ({ 

                              ...prev,                               ...prev, 

                              types: { ...prev.types, video: !prev.types.video }                               types: { ...prev.types, video: !prev.types.video } 

                            }))}                            }))}

                            className="w-4 h-4 text-teal-500 rounded"                             className="w-4 h-4 text-teal-500 rounded" 

                          />                          />

                          <span className="text-gray-700">Video</span>                          <span className="text-gray-700">Video</span>

                        </label>                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">                        <label className="flex items-center space-x-2 cursor-pointer">

                          <input                           <input 

                            type="checkbox"                             type="checkbox" 

                            checked={consultationSettings.types.call}                            checked={consultationSettings.types.call}

                            onChange={() => setConsultationSettings(prev => ({                             onChange={() => setConsultationSettings(prev => ({ 

                              ...prev,                               ...prev, 

                              types: { ...prev.types, call: !prev.types.call }                               types: { ...prev.types, call: !prev.types.call } 

                            }))}                            }))}

                            className="w-4 h-4 text-teal-500 rounded"                             className="w-4 h-4 text-teal-500 rounded" 

                          />                          />

                          <span className="text-gray-700">Call</span>                          <span className="text-gray-700">Call</span>

                        </label>                        </label>

                      </div>                      </div>

                    </div>                    </div>



                    {/* Duration */}                    {/* Duration */}

                    <div>                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>

                      <select                       <select 

                        value={consultationSettings.duration}                        value={consultationSettings.duration}

                        onChange={(e) => setConsultationSettings(prev => ({ ...prev, duration: e.target.value }))}                        onChange={(e) => setConsultationSettings(prev => ({ ...prev, duration: e.target.value }))}

                        className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 bg-white"                        className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 bg-white"

                      >                      >

                        <option>15 mins</option>                        <option>15 mins</option>

                        <option>30 mins</option>                        <option>30 mins</option>

                        <option>45 mins</option>                        <option>45 mins</option>

                        <option>1 hour</option>                        <option>1 hour</option>

                      </select>                      </select>

                    </div>                    </div>



                    {/* Fees */}                    {/* Fees */}

                    <div>                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>

                      <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">                      <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">

                        <span className="bg-gray-50 px-4 py-2.5 text-gray-500 border-r font-medium">RWF</span>                        <span className="bg-gray-50 px-4 py-2.5 text-gray-500 border-r font-medium">RWF</span>

                        <input                         <input 

                          type="number"                           type="number" 

                          value={consultationSettings.fees}                          value={consultationSettings.fees}

                          onChange={(e) => setConsultationSettings(prev => ({ ...prev, fees: e.target.value }))}                          onChange={(e) => setConsultationSettings(prev => ({ ...prev, fees: e.target.value }))}

                          className="flex-1 p-2.5 outline-none w-full"                           className="flex-1 p-2.5 outline-none w-full" 

                        />                        />

                      </div>                      </div>

                    </div>                    </div>

                  </div>                  </div>

                </div>                </div>



                {/* Action Buttons */}                {/* Action Buttons */}

                <div className="flex justify-end gap-4 pt-6 border-t">                <div className="flex justify-end gap-4 pt-6 border-t">

                  <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition">                  <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition">

                    Cancel                    Cancel

                  </button>                  </button>

                  <button                   <button 

                    onClick={() => setShowSaveConsultModal(true)}                    onClick={() => setShowSaveConsultModal(true)}

                    className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition shadow-sm"                    className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition shadow-sm"

                  >                  >

                    Save Settings                    Save Settings

                  </button>                  </button>

                </div>                </div>

              </div>              </div>

            )}            )}



            {/* DOCUMENTS TAB */}            {/* DOCUMENTS TAB */}

            {activeTab === 'documents' && (            {activeTab === 'documents' && (

              <div className="text-center py-12 text-gray-500">              <div className="text-center py-12 text-gray-500">

                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />

                <p>No documents available yet.</p>                <p>No documents available yet.</p>

              </div>              </div>

            )}            )}



            {/* SETTINGS TAB */}            {/* SETTINGS TAB */}

            {activeTab === 'settings' && (            {activeTab === 'settings' && (

              <div className="space-y-6">              <div className="space-y-6">

                <h3 className="text-lg font-bold text-gray-800">Account Settings</h3>                <h3 className="text-lg font-bold text-gray-800">Account Settings</h3>

                                

                <div className="border-b pb-4 space-y-4">                <div className="border-b pb-4 space-y-4">

                  <div className="flex justify-between items-center">                  <div className="flex justify-between items-center">

                    <div>                    <div>

                      <p className="font-medium text-gray-800">Email Notifications</p>                      <p className="font-medium text-gray-800">Email Notifications</p>

                      <p className="text-sm text-gray-600">Receive updates about appointments and consultations</p>                      <p className="text-sm text-gray-600">Receive updates about appointments and consultations</p>

                    </div>                    </div>

                    <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600" />                    <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600" />

                  </div>                  </div>

                </div>                </div>



                <div className="border-b pb-4 space-y-4">                <div className="border-b pb-4 space-y-4">

                  <div className="flex justify-between items-center">                  <div className="flex justify-between items-center">

                    <div>                    <div>

                      <p className="font-medium text-gray-800">Two-Factor Authentication</p>                      <p className="font-medium text-gray-800">Two-Factor Authentication</p>

                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>

                    </div>                    </div>

                    <input type="checkbox" className="w-4 h-4 text-teal-600" />                    <input type="checkbox" className="w-4 h-4 text-teal-600" />

                  </div>                  </div>

                </div>                </div>



                <div className="pt-4">                <div className="pt-4">

                  <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors">                  <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors">

                    Delete Account                    Delete Account

                  </button>                  </button>

                </div>                </div>

              </div>              </div>

            )}            )}

          </div>          </div>

        </div>        </div>

      ) : null}      ) : null}



      {/* Edit Personal Modal */}      {/* Edit Personal Modal */}

      <Modal      <Modal

        isOpen={showEditPersonal}        isOpen={showEditPersonal}

        onClose={() => setShowEditPersonal(false)}        onClose={() => setShowEditPersonal(false)}

        title="Edit Personal Information"        title="Edit Personal Information"

        size="md"        size="md"

      >      >

        <div className="space-y-4">        <div className="space-y-4">

          <div>          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>

            <input            <input

              type="date"              type="date"

              value={editPersonal.dob}              value={editPersonal.dob}

              onChange={e => setEditPersonal(prev => ({ ...prev, dob: e.target.value }))}              onChange={e => setEditPersonal(prev => ({ ...prev, dob: e.target.value }))}

              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"

            />            />

          </div>          </div>

          <div>          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>

            <input            <input

              type="number"              type="number"

              value={editPersonal.age}              value={editPersonal.age}

              onChange={e => setEditPersonal(prev => ({ ...prev, age: e.target.value }))}              onChange={e => setEditPersonal(prev => ({ ...prev, age: e.target.value }))}

              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"

            />            />

          </div>          </div>

          <div className="flex gap-2 pt-4 border-t">          <div className="flex gap-2 pt-4 border-t">

            <button            <button

              onClick={handleSavePersonal}              onClick={handleSavePersonal}

              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"

            >            >

              <Save className="w-4 h-4" />              <Save className="w-4 h-4" />

              Save Changes              Save Changes

            </button>            </button>

            <button            <button

              onClick={() => setShowEditPersonal(false)}              onClick={() => setShowEditPersonal(false)}

              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"

            >            >

              Cancel              Cancel

            </button>            </button>

          </div>          </div>

        </div>        </div>

      </Modal>      </Modal>



      {/* Edit Contact Modal */}      {/* Edit Contact Modal */}

      <Modal      <Modal

        isOpen={showEditContact}        isOpen={showEditContact}

        onClose={() => setShowEditContact(false)}        onClose={() => setShowEditContact(false)}

        title="Edit Contact Information"        title="Edit Contact Information"

        size="md"        size="md"

      >      >

        <div className="space-y-4">        <div className="space-y-4">

          <div>          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>

            <input            <input

              type="tel"              type="tel"

              value={editContact.phone}              value={editContact.phone}

              onChange={e => setEditContact(prev => ({ ...prev, phone: e.target.value }))}              onChange={e => setEditContact(prev => ({ ...prev, phone: e.target.value }))}

              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"

            />            />

          </div>          </div>

          <div>          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>

            <input            <input

              type="email"              type="email"

              value={editContact.email}              value={editContact.email}

              onChange={e => setEditContact(prev => ({ ...prev, email: e.target.value }))}              onChange={e => setEditContact(prev => ({ ...prev, email: e.target.value }))}

              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"

            />            />

          </div>          </div>

          <div>          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>

            <input            <input

              type="text"              type="text"

              value={editContact.location}              value={editContact.location}

              onChange={e => setEditContact(prev => ({ ...prev, location: e.target.value }))}              onChange={e => setEditContact(prev => ({ ...prev, location: e.target.value }))}

              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"

            />            />

          </div>          </div>

          <div className="flex gap-2 pt-4 border-t">          <div className="flex gap-2 pt-4 border-t">

            <button            <button

              onClick={handleSaveContact}              onClick={handleSaveContact}

              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"

            >            >

              <Save className="w-4 h-4" />              <Save className="w-4 h-4" />

              Save Changes              Save Changes

            </button>            </button>

            <button            <button

              onClick={() => setShowEditContact(false)}              onClick={() => setShowEditContact(false)}

              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"

            >            >

              Cancel              Cancel

            </button>            </button>

          </div>          </div>

        </div>        </div>

      </Modal>      </Modal>



      {/* Save Consultation Settings Modal */}      {/* Save Consultation Settings Modal */}

      <Modal      <Modal

        isOpen={showSaveConsultModal}        isOpen={showSaveConsultModal}

        onClose={() => setShowSaveConsultModal(false)}        onClose={() => setShowSaveConsultModal(false)}

        title="Save Consultation Settings"        title="Save Consultation Settings"

        size="md"        size="md"

      >      >

        <div className="space-y-4">        <div className="space-y-4">

          <p className="text-gray-700">Are you sure you want to save these online consultation settings?</p>          <p className="text-gray-700">Are you sure you want to save these online consultation settings?</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">

            <p className="text-sm text-blue-800">            <p className="text-sm text-blue-800">

              <strong>Status:</strong> {consultationSettings.enabled ? 'Enabled' : 'Disabled'}              <strong>Status:</strong> {consultationSettings.enabled ? 'Enabled' : 'Disabled'}

            </p>            </p>

            <p className="text-sm text-blue-800 mt-1">            <p className="text-sm text-blue-800 mt-1">

              <strong>Types:</strong> {Object.entries(consultationSettings.types).filter(([_, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') || 'None selected'}              <strong>Types:</strong> {Object.entries(consultationSettings.types).filter(([_, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') || 'None selected'}

            </p>            </p>

            <p className="text-sm text-blue-800 mt-1">            <p className="text-sm text-blue-800 mt-1">

              <strong>Duration:</strong> {consultationSettings.duration}              <strong>Duration:</strong> {consultationSettings.duration}

            </p>            </p>

            <p className="text-sm text-blue-800 mt-1">            <p className="text-sm text-blue-800 mt-1">

              <strong>Fee:</strong> {consultationSettings.fees} RWF              <strong>Fee:</strong> {consultationSettings.fees} RWF

            </p>            </p>

          </div>          </div>

          <div className="flex gap-2 pt-4 border-t">          <div className="flex gap-2 pt-4 border-t">

            <button            <button

              onClick={handleSaveConsultSettings}              onClick={handleSaveConsultSettings}

              disabled={savingConsult}              disabled={savingConsult}

              className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"              className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"

            >            >

              {savingConsult ? 'Saving...' : 'Confirm & Save'}              {savingConsult ? 'Saving...' : 'Confirm & Save'}

            </button>            </button>

            <button            <button

              onClick={() => setShowSaveConsultModal(false)}              onClick={() => setShowSaveConsultModal(false)}

              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"

            >            >

              Cancel              Cancel

            </button>            </button>

          </div>          </div>

        </div>        </div>

      </Modal>      </Modal>

    </DashboardLayout>    </DashboardLayout>

  );  );

}}

