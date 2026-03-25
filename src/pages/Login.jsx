import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    toast.success('Successfully logged in!');
    navigate('/dashboard');
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          New to QueueCare? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input type="email" className="form-input" placeholder="Email address" defaultValue="stevan.dux@gmail.com" />
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500 }} onClick={(e) => { e.preventDefault(); toast.success('Password reset email sent!') }}>Forgot password?</a>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '24px' }}>
          Log in
        </button>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Or log in with
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button 
             type="button" 
             style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, background: 'white' }} 
             onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
             onMouseLeave={(e) => e.target.style.background = 'white'}
             onClick={() => { toast.success('Logged in with Google'); navigate('/dashboard'); }}
           >
             <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span>
           </button>
           <button 
             type="button" 
             style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, background: '#1877F2', color: 'white' }} 
             onMouseEnter={(e) => e.target.style.opacity = '0.9'}
             onMouseLeave={(e) => e.target.style.opacity = '1'}
             onClick={() => { toast.success('Logged in with Facebook'); navigate('/dashboard'); }}
           >
             Facebook
           </button>
           <button 
             type="button" 
             style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, background: '#000000', color: 'white' }} 
             onMouseEnter={(e) => e.target.style.opacity = '0.8'}
             onMouseLeave={(e) => e.target.style.opacity = '1'}
             onClick={() => { toast.success('Logged in with Apple'); navigate('/dashboard'); }}
           >
             Apple
           </button>
        </div>
      </form>
    </>
  );
}

