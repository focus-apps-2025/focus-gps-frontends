// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CapturePhotoPage from './pages/CapturePhotoPage.jsx';
import PreviousPhotosPage from './pages/PreviousPhotosPage.jsx';
import HomePage from './pages/HomePage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Header from './components/Header.jsx';
import AdminUserManagement from './pages/AdminUserManagement.jsx';
import { CssBaseline, Container } from '@mui/material';

function App() {
  const location = useLocation();

 // Hide header when we're on /login

 // Hide header on /login AND on /
 const noHeaderPaths = ['/', '/login'];
 const hideHeader = noHeaderPaths.includes(location.pathname);

  return (
    <>
      <CssBaseline />

      { !hideHeader && <Header /> }

      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
-         <Route path="/" element={<HomePage />} />
+         {/* simply redirect root to /login (no HomePage) */}
+         <Route path="/" element={<Navigate to="/login" replace />} />

          {/* public */}
          <Route path="/login" element={<LoginPage />} />

          {/* user */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/capture"
            element={
              <PrivateRoute>
                <CapturePhotoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/previous-photos"
            element={
              <PrivateRoute>
                <PreviousPhotosPage />
              </PrivateRoute>
            }
          />

          {/* admin */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUserManagement />
              </AdminRoute>
            }
          />
        </Routes>
      </Container>
    </>
  );
}

export default App;
