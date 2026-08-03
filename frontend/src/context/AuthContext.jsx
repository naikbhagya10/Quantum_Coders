import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/api';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mediclear_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getCurrentUser();
          setUser(res.data.user);
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('mediclear_token', userToken);
    localStorage.setItem('mediclear_session_user', JSON.stringify(userData));
    api.defaults.headers.common.Authorization = `Bearer ${userToken}`;
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('mediclear_token');
    localStorage.removeItem('mediclear_session_user');
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
