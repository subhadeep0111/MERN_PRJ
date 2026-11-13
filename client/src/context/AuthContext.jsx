import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api/auth.api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) setUser(decoded);
        else localStorage.clear();
      } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(jwtDecode(data.accessToken));
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isRole = (roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, isRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
