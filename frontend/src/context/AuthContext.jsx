import { createContext, useContext, useMemo, useState } from 'react';
import { clearStoredAuth, persistAuth, readStoredAuth, resolveRole } from '../utils/auth';

const AuthContext = createContext(null);

function getInitialAuthState() {
  const stored = readStoredAuth();

  return {
    token: stored.token || null,
    refreshToken: stored.refreshToken || null,
    role: stored.role || null,
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuthState);

  function login(authPayload) {
    const token = authPayload?.token || authPayload?.accessToken;
    const refreshToken = authPayload?.refreshToken || null;
    const role = resolveRole(authPayload, token);

    if (!token) {
      throw new Error('Missing token in login response');
    }

    const nextAuth = { token, refreshToken, role };
    setAuth(nextAuth);
    persistAuth(nextAuth);
  }

  function logout() {
    setAuth({ token: null, refreshToken: null, role: null });
    clearStoredAuth();
  }

  const value = useMemo(
    () => ({
      ...auth,
      isAuthenticated: Boolean(auth.token),
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
