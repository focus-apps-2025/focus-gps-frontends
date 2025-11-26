// frontend/src/components/LoadingSpinner.jsx
import React from 'react';
import { Box, CircularProgress, Typography, Fade, useTheme } from '@mui/material';

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = 60,
  overlay = false 
}) => {
  const theme = useTheme();

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: overlay ? '100vh' : '80vh',
          background: overlay ? 'rgba(255,255,255,0.9)' : 'transparent',
          position: overlay ? 'fixed' : 'static',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: overlay ? 9999 : 1,
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            size={size}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              animationDuration: '1.5s',
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ fontWeight: 'bold' }}
            >
              {Math.round(size * 0.3)}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ 
            mt: 3,
            fontWeight: 500,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {message}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, opacity: 0.7 }}
        >
          Please wait...
        </Typography>
      </Box>
    </Fade>
  );
};

export default LoadingSpinner;