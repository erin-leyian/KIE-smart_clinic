import { Outlet, Navigate, useLocation } from 'react-router-dom';

export default function AuthLayout() {
  const location = useLocation();

  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-left">
         <div style={{ textAlign: 'center', color: 'white', maxWidth: '300px' }}>
             {/* Branding removed */}
         </div>
         {/* Background graphics or shapes */}
         <div style={{
           position: 'absolute', width: '400px', height: '400px',
           borderRadius: '50%', border: '40px solid rgba(255,255,255,0.1)',
           top: '-10%', left: '-10%'
         }}></div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
