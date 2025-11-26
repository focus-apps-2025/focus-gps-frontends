// frontend/src/components/PrivateRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { Box, Typography, Button } from '@mui/material';
import { Login, Home } from '@mui/icons-material';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Enhanced loading state with timeout protection
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Not authenticated
  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        textAlign: 'center',
        gap: 3
      }}>
        <Typography variant="h4" color="text.secondary" gutterBottom>
          🔒 Authentication Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Please log in to access this page.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            component={Navigate}
            to="/login"
            replace
            state={{ from: location }}
            startIcon={<Login />}
            size="large"
          >
            Login Now
          </Button>
          <Button
            variant="outlined"
            component={Navigate}
            to="/"
            startIcon={<Home />}
            size="large"
          >
            Go Home
          </Button>
        </Box>
      </Box>
    );
  }

  // Role-based access control
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        textAlign: 'center',
        gap: 3
      }}>
        <Typography variant="h4" color="error" gutterBottom>
          ⚠️ Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
          <br />
          <strong>Required role:</strong> {requiredRole}
          <br />
          <strong>Your role:</strong> {user.role}
        </Typography>
        <Button
          variant="contained"
          component={Navigate}
          to="/dashboard"
          startIcon={<Home />}
          size="large"
        >
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;