import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+250', name: 'RW' },
  { code: '+1', name: 'US' },
  { code: '+1', name: 'CA' },
  { code: '+44', name: 'GB' },
  { code: '+254', name: 'KE' },
  { code: '+256', name: 'UG' },
  { code: '+255', name: 'TZ' },
  { code: '+257', name: 'BI' },
  { code: '+243', name: 'CD' },
  { code: '+234', name: 'NG' },
  { code: '+233', name: 'GH' },
  { code: '+251', name: 'ET' },
  { code: '+27', name: 'ZA' },
  { code: '+20', name: 'EG' },
  { code: '+212', name: 'MA' },
  { code: '+33', name: 'FR' },
  { code: '+49', name: 'DE' },
  { code: '+39', name: 'IT' },
  { code: '+34', name: 'ES' },
  { code: '+32', name: 'BE' },
  { code: '+31', name: 'NL' },
  { code: '+41', name: 'CH' },
  { code: '+91', name: 'IN' },
  { code: '+86', name: 'CN' },
  { code: '+81', name: 'JP' },
  { code: '+82', name: 'KR' },
  { code: '+65', name: 'SG' },
  { code: '+971', name: 'AE' },
  { code: '+966', name: 'SA' },
  { code: '+61', name: 'AU' },
  { code: '+55', name: 'BR' },
  { code: '+52', name: 'MX' },
];

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    toast.success('Registration successful!');
    navigate('/login');
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
          Hey there
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Already know QueueCare? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Log in</Link>
        </p>
      </div>

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input type="email" className="form-input" placeholder="steve.madden@gmail.com" required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div style={{ display: 'flex' }}>
            <select className="form-input" style={{ width: '100px', borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0, outline: 'none' }}>
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
            <input type="text" className="form-input" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, flex: 1 }} placeholder="1234567890" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Your password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'} 
              className="form-input" 
              defaultValue=".........." 
              required 
            />
            <div 
              style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Birth Date</label>
          <input type="date" className="form-input" defaultValue="1995-03-23" />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '24px' }}>
          Sign Up
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
           <input type="checkbox" /> Remember me
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Or sign up with
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button 
             type="button" 
             style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, background: 'white' }} 
             onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
             onMouseLeave={(e) => e.target.style.background = 'white'}
             onClick={() => { toast.success('Signed up with Google'); navigate('/dashboard'); }}
           >
             <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
           </button>
           <button 
             type="button" 
             style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, background: '#1877F2', color: 'white' }} 
             onMouseEnter={(e) => e.target.style.opacity = '0.9'}
             onMouseLeave={(e) => e.target.style.opacity = '1'}
             onClick={() => { toast.success('Signed up with Facebook'); navigate('/dashboard'); }}
           >
             Facebook
           </button>
           <button 
             type="button" 
             style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, background: '#000000', color: 'white' }} 
             onMouseEnter={(e) => e.target.style.opacity = '0.8'}
             onMouseLeave={(e) => e.target.style.opacity = '1'}
             onClick={() => { toast.success('Signed up with Apple'); navigate('/dashboard'); }}
           >
             Apple
           </button>
        </div>
      </form>
    </>
  );
}
