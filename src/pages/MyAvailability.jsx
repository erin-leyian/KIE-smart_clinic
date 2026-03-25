import { Calendar } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function MyAvailability() {
  const { t, upcomingAppointments } = useOutletContext();

  // Helper to split appointments into today and tomorrow (mock logic)
  const todayAppts = upcomingAppointments.slice(0, 2);
  const tomorrowAppts = upcomingAppointments.slice(2);

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div className="card" style={{ flex: 2 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>November 2022</h3>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
              <span style={{ cursor: 'pointer' }}>{'<'}</span>
              <span style={{ cursor: 'pointer' }}>{'>'}</span>
            </div>
         </div>

         {/* Calendar Grid Header */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', overflow: 'hidden' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} style={{ background: 'var(--bg-color)', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '14px' }}>
                {day}
              </div>
            ))}
         </div>
         {/* Calendar body mockup */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflow: 'hidden' }}>
            {Array.from({ length: 35 }).map((_, i) => {
              const date = i - 3; // start from prev month
              const isValid = date > 0 && date <= 30;
              return (
                <div key={i} style={{ background: 'var(--surface)', padding: '12px', minHeight: '100px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: isValid ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                    {isValid ? String(date).padStart(2, '0') : ''}
                  </div>
                  {/* Mock slots */}
                  {isValid && i % 3 === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ background: 'var(--primary)', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>01</span>
                      <span style={{ background: 'var(--primary-dark)', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>03</span>
                    </div>
                  )}
                </div>
              );
            })}
         </div>
      </div>

      <div style={{ flex: 1 }}>
         <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>{t.upcomingAppointments}</h3>
         
         <div style={{ marginBottom: '24px' }}>
           <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{t.today}</h4>
           
           {todayAppts.length === 0 ? (
             <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No activities for today.</p>
           ) : todayAppts.map(appt => (
             <div key={appt.id} className="card" style={{ padding: '16px', background: 'var(--bg-color)', marginBottom: '12px' }}>
               <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{appt.doctor}</h5>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                 <span>{appt.time}</span>
                 <span>{appt.day} {appt.date}</span>
               </div>
             </div>
           ))}
         </div>

         <div>
           <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{t.tomorrow}</h4>
           {tomorrowAppts.length === 0 ? (
             <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No activities for tomorrow.</p>
           ) : tomorrowAppts.map(appt => (
             <div key={appt.id} className="card" style={{ padding: '16px', background: 'var(--bg-color)', marginBottom: '12px' }}>
               <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{appt.doctor}</h5>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                 <span>{appt.time}</span>
                 <span>{appt.day} {appt.date}</span>
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
