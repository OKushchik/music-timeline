import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount / token change
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authApi.getMe(token)
      .then((data) => setUser(data))
      .catch(() => { localStorage.removeItem('token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback((data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

