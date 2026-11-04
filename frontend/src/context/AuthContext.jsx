import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('retailmax_token');
    const savedUser = localStorage.getItem('retailmax_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('retailmax_token');
        localStorage.removeItem('retailmax_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: userToken } = res.data.data;

    setUser(userData);
    setToken(userToken);
    localStorage.setItem('retailmax_token', userToken);
    localStorage.setItem('retailmax_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, role = 'USER') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { user: userData, token: userToken } = res.data.data;

    setUser(userData);
    setToken(userToken);
    localStorage.setItem('retailmax_token', userToken);
    localStorage.setItem('retailmax_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('retailmax_token');
    localStorage.removeItem('retailmax_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

