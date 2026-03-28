import { useState } from 'react';
import { FileText, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react';
import cx from 'classnames';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

export default function PatientRecords() {
  const { t } = useOutletContext();
  const [activeTab, setActiveTab] = useState('Yesterday');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const [records, setRecords] = useState([
    { id: 1, day: 'Thu', date: '15', time: '09:00am - 09:30am', patient: 'Stephine Claire', issue: 'Fever', docs: true },
    { id: 2, day: 'Fri', date: '16', time: '10:00am - 10:30am', patient: 'Marcus Johnson', issue: 'Cough', docs: true },
    { id: 3, day: 'Mon', date: '19', time: '11:00am - 11:30am', patient: 'Amanda Ripley', issue: 'Migraine', docs: false },
    { id: 4, day: 'Tue', date: '20', time: '02:00pm - 02:30pm', patient: 'David Smith', issue: 'Checkup', docs: true },
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleViewDoc = (r) => {
    setSelectedRecord(r);
    setDocModalOpen(true);
  };

  const handleEdit = (r) => {
    setSelectedRecord({...r});
    setEditModalOpen(true);
  };

  const saveEdit = () => {
    if (!selectedRecord.patient.trim() || !selectedRecord.issue.trim()) {
      toast.error('Patient name and issue cannot be empty.');
      return;
    }
    setRecords(records.map(rec => rec.id === selectedRecord.id ? selectedRecord : rec));
    toast.success('Patient record cleanly updated!');
    setEditModalOpen(false);
  };
  
  const deleteRecord = () => {
    setRecords(records.filter(rec => rec.id !== selectedRecord.id));
    toast.success('Patient record securely deleted for privacy.');
    setEditModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="tabs-container" style={{ margin: 0 }}>
          {[t.yesterday, t.today, t.past].map(tab => (
             <button 
               key={tab}
               className={cx('tab-button', { active: activeTab === tab })}
               onClick={() => setActiveTab(tab)}
             >
               {tab}
             </button>
          ))}
        </div>

        <button className="btn-secondary">
          May'23 ∨
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {records.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>{t.noRecords}</div>
        ) : records.map((r) => (
          <div key={r.id} className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', padding: '20px' }}>
            <div style={{ background: 'var(--bg-color)', padding: '16px 20px', borderRadius: 'var(--radius-md)', textAlign: 'center', marginRight: '32px', minWidth: '70px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>{r.day}</div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{r.date}</div>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '48px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                   <CalendarIcon size={16} /> {r.time}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                   <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.patient.charAt(0)}</div>
                   {r.patient}
                </div>
              </div>
              
              <div>
                <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                   {t.issue}: <span className="font-medium">{r.issue}</span>
                </div>
                {r.docs ? (
                  <button onClick={() => handleViewDoc(r)} style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'underline' }}>{t.viewDocs}</button>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>{t.noDocs}</span>
                )}
              </div>
            </div>

            <button className="btn-secondary" onClick={() => handleEdit(r)}>
               {t.edit} <span style={{ marginLeft: 4 }}>∨</span>
            </button>
          </div>
        ))}
      </div>

      {/* Docs Modal */}
      <Modal isOpen={docModalOpen} onClose={() => setDocModalOpen(false)} title={`${t.viewDocs} - ${selectedRecord?.patient}`}>
         <div style={{ background: '#f3f4f6', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '20px' }}>
            <FileText size={48} color="var(--text-muted)" />
         </div>
         <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Medical_History_Report.pdf</p>
         <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={() => setDocModalOpen(false)}>
            Close
         </button>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={t.editRecord}>
         <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
           <div style={{ flex: 1 }}>
             <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>{t.patientName}</label>
             <input type="text" className="form-input" value={selectedRecord?.patient || ''} onChange={e => setSelectedRecord({...selectedRecord, patient: e.target.value})} />
           </div>
           <div style={{ flex: 1 }}>
             <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>{t.issueFocus}</label>
             <input type="text" className="form-input" value={selectedRecord?.issue || ''} onChange={e => setSelectedRecord({...selectedRecord, issue: e.target.value})} />
           </div>
         </div>
         
         <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
               <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>{t.dayOfMonth}</label>
               <input type="text" className="form-input" value={selectedRecord?.date || ''} onChange={e => setSelectedRecord({...selectedRecord, date: e.target.value})} />
            </div>
            <div style={{ flex: 2 }}>
               <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>{t.timeSlot}</label>
               <select className="form-input" value={selectedRecord?.time || '09:00am - 09:30am'} onChange={e => setSelectedRecord({...selectedRecord, time: e.target.value})} style={{ width: '100%' }}>
                   <option>09:00am - 09:30am</option>
                   <option>10:00am - 10:30am</option>
                   <option>11:00am - 11:30am</option>
                   <option>12:00pm - 12:30pm</option>
                   <option>01:00pm - 01:30pm</option>
                   <option>02:00pm - 02:30pm</option>
               </select>
            </div>
         </div>

         <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" style={{ flex: 1, color: '#EF4444', borderColor: '#EF4444', justifyContent: 'center' }} onClick={deleteRecord}>
               <Trash2 size={16} style={{ marginRight: '8px' }} /> {t.delRecord}
            </button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveEdit}>
               {t.saveChanges}
            </button>
         </div>
      </Modal>
    </div>
  );
}


