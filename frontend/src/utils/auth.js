const STORAGE_KEYS = {
  token: 'smartClinic.token',
  refreshToken: 'smartClinic.refreshToken',
  role: 'smartClinic.role',
};

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  try {
    const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64Payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function resolveRole(authPayload, token) {
  const payloadRole =
    authPayload?.user?.role ||
    authPayload?.role ||
    authPayload?.userRole ||
    null;

  if (payloadRole) {
    return String(payloadRole).toLowerCase();
  }

  const tokenPayload = decodeJwtPayload(token);
  const tokenRole =
    tokenPayload?.role ||
    tokenPayload?.userRole ||
    tokenPayload?.permissions?.role ||
    null;

  return tokenRole ? String(tokenRole).toLowerCase() : null;
}

export function readStoredAuth() {
  return {
    token: localStorage.getItem(STORAGE_KEYS.token),
    refreshToken: localStorage.getItem(STORAGE_KEYS.refreshToken),
    role: localStorage.getItem(STORAGE_KEYS.role),
  };
}

export function persistAuth({ token, refreshToken, role }) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.token, token);
  }

  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  }

  if (role) {
    localStorage.setItem(STORAGE_KEYS.role, role);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.role);
}
