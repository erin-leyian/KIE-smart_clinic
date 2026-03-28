import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

export default function Profile() {
  const { t } = useOutletContext();
  const [activeTab, setActiveTab] = useState(t.general);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'Stevan Dux',
    gender: 'Male',
    bio: 'Cardiac Doctor',
    location: 'Leeds, United Kingdom',
    dob: '07/04/1997',
    age: 26,
    phone: '+1 345 346 347',
    email: 'martha.johnson@gmail.com'
  });

  const [editForm, setEditForm] = useState({ name: profileData.name, bio: profileData.bio });
  
  const [passwords, setPasswords] = useState({current: '', newPass: ''});

  const handleProfileSave = () => {
    setProfileData({ ...profileData, name: editForm.name, bio: editForm.bio });
    toast.success('Profile details updated seamlessly!');
    setEditProfileModalOpen(false);
  };

  const handlePasswordSave = () => {
    if (!passwords.current || !passwords.newPass) {
      toast.error('Please enter current and new passwords.');
      return;
    }
    toast.success('Password has been securely updated!');
    setPasswordModalOpen(false);
    setPasswords({current: '', newPass: ''});
  };

  return (
    <div>
      <div className="tabs-container">
        {[t.general, t.consultHist, t.patientDocs].map(tab => (
           <button 
             key={tab}
             className={`tab-button ${activeTab === tab ? 'active' : ''}`}
             onClick={() => setActiveTab(tab)}
           >
             {tab}
           </button>
        ))}
      </div>

      {activeTab === t.general && (
        <div style={{ maxWidth: 900 }}>
          {/* Main profile card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150" 
                     style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                    {profileData.name} <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 400 }}>({profileData.gender})</span>
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '2px' }}>{profileData.bio}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{profileData.location}</p>
                </div>
             </div>
             <button className="btn-secondary" onClick={() => setEditProfileModalOpen(true)}>
               {t.edit} <Edit2 size={16} />
             </button>
          </div>

          {/* Personal Information */}
          <div className="card">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>{t.personalInfo}</h3>
                <button className="btn-secondary" onClick={() => setEditProfileModalOpen(true)}>
                  {t.edit} <Edit2 size={16} />
                </button>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
               <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.patientName}</div>
                  <div style={{ fontWeight: 500 }}>{profileData.name}</div>
               </div>
               <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.dob}</div>
                  <div style={{ fontWeight: 500 }}>{profileData.dob}</div>
               </div>
               <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.age}</div>
                  <div style={{ fontWeight: 500 }}>{profileData.age}</div>
               </div>
               <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.phone}</div>
                  <div style={{ fontWeight: 500 }}>{profileData.phone}</div>
               </div>
               <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.email}</div>
                  <div style={{ fontWeight: 500 }}>{profileData.email}</div>
               </div>
               <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.bio}</div>
                  <div style={{ fontWeight: 500 }}>{profileData.bio}</div>
               </div>
             </div>
          </div>

          {/* Pre-existing Diseases */}
          <div className="card">
             <h3 className="card-title">{t.preDisease}</h3>
             <div style={{ display: 'flex', gap: '32px' }}>
                <div style={{ flex: 1, borderRight: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{t.speech}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <span style={{ background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '4px', fontSize: '14px' }}>Dysarthria ✕</span>
                     <span style={{ background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '4px', fontSize: '14px' }}>Apraxia ✕</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '20px 0 12px' }}>{t.physical}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <span style={{ background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '4px', fontSize: '14px' }}>Arthritis ✕</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{t.speech}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <span style={{ background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '4px', fontSize: '14px' }}>Dysarthria ✕</span>
                     <span style={{ background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '4px', fontSize: '14px' }}>Apraxia ✕</span>
                  </div>
                </div>
             </div>
          </div>

          {/* General settings */}
          <div className="card">
             <h3 className="card-title">{t.general}</h3>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, paddingRight: '40px' }}>
                   <span style={{ fontWeight: 500 }}>{t.changePass}</span>
                   <button className="btn-secondary" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => setPasswordModalOpen(true)}>{t.edit}</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, paddingLeft: '40px', borderLeft: '1px solid var(--border)' }}>
                   <span style={{ fontWeight: 500 }}>{t.notifications}</span>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => toast.success('Notifications toggled!')}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.enableNotifs}</span>
                      <div style={{ width: 44, height: 24, background: 'var(--primary)', borderRadius: 24, position: 'relative' }}>
                         <div style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }}></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
      
      {activeTab !== t.general && (
        <div className="card">
          <p className="text-muted">Content for {activeTab} will go here.</p>
        </div>
      )}

      {/* Password Modal */}
      <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title={t.changePass}>
         <div style={{ marginBottom: '16px' }}>
           <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>{t.curPass}</label>
           <input type="password" className="form-input" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
         </div>
         <div style={{ marginBottom: '16px' }}>
           <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>{t.newPass}</label>
           <input type="password" className="form-input" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} />
         </div>
         <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={handlePasswordSave}>
            {t.updPass}
         </button>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal isOpen={editProfileModalOpen} onClose={() => {
        setEditProfileModalOpen(false);
        setEditForm({ name: profileData.name, bio: profileData.bio });
      }} title={t.editProfile}>
         <div style={{ marginBottom: '16px' }}>
           <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>{t.fullName}</label>
           <input type="text" className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
         </div>
         <div style={{ marginBottom: '16px' }}>
           <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>{t.bio}</label>
           <textarea className="form-input" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} style={{ minHeight: '80px', width: '100%' }}></textarea>
         </div>
         <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={handleProfileSave}>
            {t.saveChanges}
         </button>
      </Modal>
    </div>
  );
}

