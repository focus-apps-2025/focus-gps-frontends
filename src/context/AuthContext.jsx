// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromCookies = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          Cookies.remove('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUserFromCookies();
  }, []);

  const login = async (username, password) => {
  try {
    const res = await api.post('/auth/login', { username, password });

    // Store token
    Cookies.set('token', res.data.token, { expires: 1 });

    // Store the full user object
    setUser({
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role
    });

    // Redirect based on role
    if (res.data.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }

  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    navigate('/login');
  };

  const contextValue = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};