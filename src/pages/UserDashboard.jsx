// frontend/src/pages/UserDashboard.jsx
import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress, // Import CircularProgress for auth loading
} from '@mui/material';
import {
  PhotoCamera,
  Collections,
  ArrowBack,
} from '@mui/icons-material';
import CapturePhotoPage from './CapturePhotoPage';
import PreviousPhotosPage from './PreviousPhotosPage';
import api from '../utils/api'; // Ensure api is imported
import { useAuth } from '../context/AuthContext';

// --- IMPORTANT: This useAuth hook is a placeholder. Adapt it to your actual auth system. ---
// This hook should ideally come from a global authentication context or store.


const UserDashboard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [activeView, setActiveView] = useState('dashboard');
  
  
  const { user, loading } = useAuth();// <--- Get current user from the hook

  const handleCaptureClick = () => {
    setActiveView('camera');
  };

  const handleViewPhotosClick = () => {
    setActiveView('photos');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  // If you want to show a loading spinner while auth is checking
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ml:2}}>Loading user data...</Typography>
      </Box>
    );
  }

  // Main Dashboard View
  if (activeView === 'dashboard') {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: isSmallScreen ? 2 : 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography 
          variant={isMediumScreen ? "h5" : "h4"}
          align="center" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            mb: isSmallScreen ? 3 : 4,
            color: 'primary.main',
            maxWidth: '90%',
          }}
        >
          Photo Capture App
        </Typography>

        <Grid 
          container 
          spacing={isSmallScreen ? 2 : 4}
          justifyContent="center"
          sx={{ maxWidth: 1200, width: '100%' }}
        >
          {/* Capture Photo Card */}
          <Grid item xs={12} sm={6} md={6} lg={5}>
            <Paper
              sx={{
                p: isSmallScreen ? 3 : 4,
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: 'primary.main',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  bgcolor: 'primary.dark',
                }
              }}
              onClick={handleCaptureClick}
            >
              <PhotoCamera sx={{ 
                fontSize: isSmallScreen ? 48 : 60,
                mb: isSmallScreen ? 1 : 2 
              }} />
              <Typography 
                variant={isSmallScreen ? "h6" : "h5"}
                gutterBottom 
                sx={{ fontWeight: 'bold' }}
              >
                Capture Photo
              </Typography>
              <Typography 
                variant={isSmallScreen ? "body2" : "body1"}
                sx={{ opacity: 0.9 }}
              >
                Take a new photo with GPS location and timestamp
              </Typography>
            </Paper>
          </Grid>

          {/* View Photos Card */}
          <Grid item xs={12} sm={6} md={6} lg={5}>
            <Paper
              sx={{
                p: isSmallScreen ? 3 : 4,
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: 'secondary.main',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  bgcolor: 'secondary.dark',
                }
              }}
              onClick={handleViewPhotosClick}
            >
              <Collections sx={{ 
                fontSize: isSmallScreen ? 48 : 60,
                mb: isSmallScreen ? 1 : 2 
              }} />
              <Typography 
                variant={isSmallScreen ? "h6" : "h5"}
                gutterBottom 
                sx={{ fontWeight: 'bold' }}
              >
                View Photos
              </Typography>
              <Typography 
                variant={isSmallScreen ? "body2" : "body1"}
                sx={{ opacity: 0.9 }}
              >
                Browse your previously captured photos
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Camera View
  if (activeView === 'camera') {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{ 
          p: isSmallScreen ? 1 : 2,
          alignSelf: 'flex-start',
        }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBackToDashboard}
            variant="outlined"
            size={isSmallScreen ? "small" : "medium"}
            sx={{ mb: isSmallScreen ? 1 : 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        <CapturePhotoPage 
          onClose={handleBackToDashboard} 
          embedded={true}
        />
      </Box>
    );
  }

  // Photos View
  if (activeView === 'photos') {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{ 
          p: isSmallScreen ? 1 : 2,
          alignSelf: 'flex-start',
        }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBackToDashboard}
            variant="outlined"
            size={isSmallScreen ? "small" : "medium"}
            sx={{ mb: isSmallScreen ? 1 : 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        <PreviousPhotosPage 
          onBack={handleBackToDashboard}
          embedded={true}
          currentUser={user} // <--- Still passing currentUser here
        />
      </Box>
    );
  }
};

export default UserDashboard;
