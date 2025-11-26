import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If logged in but not admin, redirect to user dashboard or home
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" />; // Or / unauthorized
  }

  return children;
};

export default AdminRoute;