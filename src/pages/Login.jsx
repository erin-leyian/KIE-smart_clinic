import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = 'https://kie-smart-clinic.onrender.com';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);

      toast.success(`Welcome back, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <input
            type="email"
            className="form-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Your password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <a href="#" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '24px' }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </>
  );
}
