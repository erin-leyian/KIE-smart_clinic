import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

export default function OnlineConsult() {
  const { t } = useOutletContext();
  const [settings, setSettings] = useState({
    availability: 'Enable',
    text: false,
    video: false,
    call: true,
    duration: '30 mins',
    fees: 'zł 500'
  });

  const [formState, setFormState] = useState(settings);

  const handleSave = () => {
    setSettings(formState);
    toast.success('Consultation settings have been saved successfully!');
  };

  const handleCancel = () => {
    setFormState(settings); // revert to saved settings
    toast.error('Changes to consultation settings have been discarded.');
  };

  return (
    <div className="card">
       <h2 className="card-title">{t.onlineConsult}</h2>
       <p className="text-muted" style={{ marginBottom: '32px', fontSize: '14px', maxWidth: '800px', lineHeight: 1.5 }}>
         Configure your availability settings to dictate how patients can request consultation. Changes here apply immediately to your public profile.
       </p>

       <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
         <div>
           <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px' }}>
             Availability
           </label>
           <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <input type="radio" checked={formState.availability === 'Disable'} onChange={() => setFormState({...formState, availability: 'Disable'})} /> Disable
             </label>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <input type="radio" checked={formState.availability === 'Enable'} onChange={() => setFormState({...formState, availability: 'Enable'})} /> Enable
             </label>
           </div>
         </div>

         <div>
           <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px' }}>
             Type Of Availability
           </label>
           <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <input type="checkbox" checked={formState.text} onChange={e => setFormState({...formState, text: e.target.checked})} /> Text
             </label>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <input type="checkbox" checked={formState.video} onChange={e => setFormState({...formState, video: e.target.checked})} /> Video
             </label>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <input type="checkbox" checked={formState.call} onChange={e => setFormState({...formState, call: e.target.checked})} /> Call
             </label>
           </div>
         </div>

         <div>
           <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px' }}>
             Duration
           </label>
           <select className="form-input" value={formState.duration} onChange={e => setFormState({...formState, duration: e.target.value})} style={{ padding: '8px 12px' }}>
             <option>15 mins</option>
             <option>30 mins</option>
             <option>45 mins</option>
             <option>60 mins</option>
           </select>
         </div>

         <div>
           <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px' }}>
             Fees
           </label>
           <input type="text" className="form-input" value={formState.fees} onChange={e => setFormState({...formState, fees: e.target.value})} style={{ padding: '8px 12px' }} />
         </div>
       </div>

       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
         <button className="btn-secondary" style={{ width: '120px', justifyContent: 'center' }} onClick={handleCancel}>{t.cancel}</button>
         <button className="btn-primary" style={{ width: '120px', justifyContent: 'center' }} onClick={handleSave}>{t.saveChanges}</button>
       </div>
    </div>
  );
}

