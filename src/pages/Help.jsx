import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

export default function Help() {
  const { t } = useOutletContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [inquiry, setInquiry] = useState('');

  const handleSubmit = () => {
    if (!inquiry.trim()) {
      toast.error('Please describe your issue first.');
      return;
    }
    toast.success('Your request has been submitted successfully.');
    setInquiry('');
    setModalOpen(false);
  };

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
         <div style={{ width: 80, height: 80, background: 'var(--bg-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--primary)' }}>
           <HelpCircle size={40} />
         </div>
         <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>{t.help} - How can we help you?</h2>
         <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '32px' }}>
           Search our knowledge base or contact our support team to get your questions answered quickly.
         </p>
         
         <button className="btn-primary" onClick={() => setModalOpen(true)}>
           {t.contactSup}
         </button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t.contactSup}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 500 }}>{t.issue}</label>
          <textarea 
            className="form-input" 
            style={{ width: '100%', minHeight: '100px' }} 
            placeholder="Type your problem here..."
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
          ></textarea>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }} 
          onClick={handleSubmit}
        >
          {t.sendMsg}
        </button>
      </Modal>
    </>
  );
}

