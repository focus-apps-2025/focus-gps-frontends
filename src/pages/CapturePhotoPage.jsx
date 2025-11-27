// frontend/src/pages/CapturePhotoPage.jsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  Fab,
  Backdrop,
  Paper,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  PhotoCamera,
  LocationOn,
  GpsFixed,
  Warning,
  Refresh,
  CalendarToday,
  AccessTime,
  Settings,
  CloudUpload,
  Cancel,
  Close,
  ArrowBack,
  CameraFront,
  CameraRear,
  SwitchCamera,
} from '@mui/icons-material';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

// Responsive video constraints
const getVideoConstraints = (isMobile, facingMode) => ({
  width: isMobile ? 1280 : 1920,
  height: isMobile ? 720 : 1080,
  facingMode: facingMode,
  aspectRatio: isMobile ? 16/9 : 16/9,
});

const CapturePhotoPage = ({ onClose, embedded = false }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  // *** NEW: Ref to store the MediaStream object from the initial permission check ***
  const initialCameraStreamRef = useRef(null); 
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // *** NEW: Camera state ***
  const [cameraFacingMode, setCameraFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [cameraMenuAnchor, setCameraMenuAnchor] = useState(null);
  
  const getCaptureAreaDimensions = (isMobile) => ({
    width: isMobile ? 320 : 480,
    height: isMobile ? 200 : 320,
  });
  const captureAreaDimensions = getCaptureAreaDimensions(isMobile);
  
  // --- State Management ---
  const [viewMode, setViewMode] = useState('camera');
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [stampedImageSrc, setStampedImageSrc] = useState(null);

  // Live data for overlay
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching address...');
  const [dateTime, setDateTime] = useState(new Date());
  const [isAddressValid, setIsAddressValid] = useState(false); 

  // Action states
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  // Get responsive video constraints with current camera mode
  const videoConstraints = getVideoConstraints(isMobile, cameraFacingMode);
  const MIN_ACCEPTABLE_ACCURACY = 100;

  // --- Close/Cancel Handler ---
  const handleClose = () => {
    if (embedded && onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // *** NEW: Camera switch handler ***
  const handleSwitchCamera = () => {
    setCameraFacingMode(prevMode => 
      prevMode === 'environment' ? 'user' : 'environment'
    );
  };

  // *** NEW: Camera menu handlers ***
  const handleCameraMenuOpen = (event) => {
    setCameraMenuAnchor(event.currentTarget);
  };

  const handleCameraMenuClose = () => {
    setCameraMenuAnchor(null);
  };

  const handleCameraSelect = (facingMode) => {
    setCameraFacingMode(facingMode);
    handleCameraMenuClose();
  };

  // Memoize updateLocation to ensure stable reference for useEffect dependencies
  const updateLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        console.log("GPS update:", newLocation);

        if (newLocation.accuracy > MIN_ACCEPTABLE_ACCURACY) {
          console.warn("Skipping imprecise location:", newLocation);
          return;
        }

        if (
          !location ||
          Math.abs(location.latitude - newLocation.latitude) > 0.0001 ||
          Math.abs(location.longitude - newLocation.longitude) > 0.0001 ||
          newLocation.accuracy < location.accuracy
        ) {
          setLocation(newLocation);
          fetchAddress(newLocation.latitude, newLocation.longitude);
        }
      },
      (err) => {
        console.error("GPS Error:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, [location]);

  // --- Permissions and Live Data ---
  useEffect(() => {
    let timer;
    let locationInterval;

    const checkAndInitialize = async () => {
      try {
        const cameraPerm = await navigator.permissions.query({ name: 'camera' });
        const locationPerm = await navigator.permissions.query({ name: 'geolocation' });

        if (cameraPerm.state === 'denied' || locationPerm.state === 'denied') {
          setPermissionStatus('denied');
          return;
        }

        // *** CHANGE: Test with user-facing mode first to ensure both cameras work ***
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        initialCameraStreamRef.current = stream;
        setPermissionStatus('granted');

        timer = setInterval(() => setDateTime(new Date()), 1000);
        locationInterval = setInterval(updateLocation, 10000);
        updateLocation();

      } catch (err) {
        console.error("Camera/Geolocation permission or access error:", err);
        setPermissionStatus('denied');
      }
    };

    checkAndInitialize();

    return () => {
      console.log("CapturePhotoPage useEffect cleanup running...");
      clearInterval(timer);
      clearInterval(locationInterval);
      
      if (initialCameraStreamRef.current) {
        initialCameraStreamRef.current.getTracks().forEach(track => {
          console.log(`Stopping track in useEffect cleanup: ${track.kind}`);
          track.stop();
        });
        initialCameraStreamRef.current = null;
      }
    };
  }, [updateLocation]);

  // *** NEW: Effect to handle camera switching ***
  useEffect(() => {
    // This effect handles camera switching when the facingMode changes
    if (webcamRef.current && webcamRef.current.video) {
      // The Webcam component will automatically re-render with new constraints
      console.log(`Switched to ${cameraFacingMode === 'environment' ? 'back' : 'front'} camera`);
    }
  }, [cameraFacingMode]);

  // Omitted for brevity: fetchAddress, fetchDetailedAddress, fetchLocalAddress, fetchSimpleAddress, formatAddress
  const fetchAddress = async (lat, lon) => { /* ... unchanged ... */ 
    try {
      setAddress('Getting precise location...');
      setIsAddressValid(false);

      const addresses = await Promise.allSettled([
        fetchDetailedAddress(lat, lon),
        fetchLocalAddress(lat, lon),
        fetchSimpleAddress(lat, lon),
      ]);

      for (const result of addresses) {
        if (result.status === 'fulfilled' && result.value && result.value !== 'Address not found') {
          setAddress(result.value);
          setIsAddressValid(true);
          return;
        }
      }

      const fallbackAddress =  `Waiting for address… (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
      setAddress(fallbackAddress);
      setIsAddressValid(true);

    } catch (e) {
      console.error('Address fetch error:', e);
      const fallbackAddress = `Near ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setAddress(fallbackAddress);
      setIsAddressValid(true);
    }
  };

  const fetchDetailedAddress = async (lat, lon) => { /* ... unchanged ... */ 
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&namedetails=1`
    );
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    if (!data.display_name) return 'Address not found';
    return formatAddress(data);
  };

  const fetchLocalAddress = async (lat, lon) => { /* ... unchanged ... */ 
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`
    );
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.display_name || 'Address not found';
  };

  const fetchSimpleAddress = async (lat, lon) => { /* ... unchanged ... */ 
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`
    );
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.display_name || 'Address not found';
  };

  const formatAddress = (data) => { /* ... unchanged ... */ 
    const address = data.address;
    if (!address) return data.display_name;

    const parts = [];
    if (address.road) parts.push(address.road);
    if (address.neighbourhood) parts.push(address.neighbourhood);
    if (address.suburb) parts.push(address.suburb);
    if (address.village) parts.push(address.village);
    if (address.town) parts.push(address.town);
    if (address.city) parts.push(address.city);
    if (address.county && address.county !== address.city) parts.push(address.county);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);

    if (parts.length >= 2) {
      return parts.join(', ');
    }
    return data.display_name;
  };

  const handleCapture = async () => {
    if (!webcamRef.current || !location) {
      setError('Camera or GPS not ready.');
      return;
    }
    setLoading(true);
    setLoadingMessage('Processing Image...');

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError('Failed to capture image.');
      setLoading(false);
      return;
    }

    const finalImage = await createImageWithOverlay(imageSrc);
    setStampedImageSrc(finalImage);
    setViewMode('preview');
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!stampedImageSrc) return;

    setLoading(true);
    setLoadingMessage('Uploading...');
    setError('');

    try {
      const base64Response = await fetch(stampedImageSrc);
      const blob = await base64Response.blob();

      if (blob.size === 0) {
        throw new Error('Generated blob is empty');
      }

      const formData = new FormData();
      formData.append('image', blob, `photo_${Date.now()}.jpeg`);
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('accuracy', location.accuracy.toString());
      formData.append('address', address);
      // *** NEW: Add camera info to metadata ***
      formData.append('camera_type', cameraFacingMode === 'environment' ? 'back' : 'front');

      const response = await api.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoadingMessage('Success!');
      setTimeout(() => navigate('/previous-photos'), 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setStampedImageSrc(null);
    setViewMode('camera');
  };

  const createImageWithOverlay = (imageSrc) => { /* ... unchanged ... */ 
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const overlayHeight = isMobile ? canvas.height * 0.25 : canvas.height * 0.20;
        const baseFontSize = isMobile ? Math.max(16, canvas.width / 80) : Math.max(24, canvas.width / 60);
        const lineHeight = baseFontSize * 1.2;
        const padding = isMobile ? 15 : 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${baseFontSize}px Arial`;
        
        let currentY = canvas.height - overlayHeight + lineHeight;
        ctx.fillText(`Lat: ${location.latitude.toFixed(6)}, Lon: ${location.longitude.toFixed(6)}`, padding, currentY);
        
        currentY += lineHeight;
        let displayAddress = address;
        if (isMobile && address.length > 60) {
          displayAddress = address.substring(0, 57) + '...';
        }
        ctx.fillText(`Address: ${displayAddress}`, padding, currentY);
        
        currentY += lineHeight;
        const dateStr = isMobile ? 
          dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
          dateTime.toLocaleDateString();
        const timeStr = dateTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        ctx.fillText(`Date: ${dateStr} | Time: ${timeStr}`, padding, currentY);
        
        // *** NEW: Add camera info to overlay ***
        currentY += lineHeight;
        const cameraType = cameraFacingMode === 'environment' ? 'Back Camera' : 'Front Camera';
        ctx.fillText(`Camera: ${cameraType}`, padding, currentY);
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = imageSrc;
    });
  };

  // --- RENDER LOGIC ---

  if (permissionStatus === 'denied') {
    return (
      <Box sx={{ 
        p: isMobile ? 2 : 3, 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '80vh',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        <Warning sx={{ fontSize: isMobile ? 40 : 60, color: 'warning.main' }} />
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ mt: 2, fontWeight: 'bold', px: 1 }}>
          Permissions Required
        </Typography>
        <Typography color="text.secondary" sx={{ 
          maxWidth: 500, 
          mb: 3, 
          px: 2,
          fontSize: isMobile ? '0.9rem' : '1rem'
        }}>
          Camera and Location access is blocked. Please enable permissions in your browser's site settings.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={handleClose}
            size={isMobile ? "medium" : "large"}
          >
            Go Back
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Settings />} 
            onClick={() => window.location.reload()}
            size={isMobile ? "medium" : "large"}
          >
            Reload Page
          </Button>
        </Box>
      </Box>
    );
  }

  if (permissionStatus === 'checking') {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '80vh',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2
      }}>
        <CircularProgress />
        <Typography sx={{ ml: isMobile ? 0 : 2, textAlign: 'center' }}>
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: embedded ? 'auto' : '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'white',
      position: 'relative',
      p: embedded ? 1 : 2
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Backdrop sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        flexDirection: 'column' 
      }} open={loading}>
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2, textAlign: 'center', px: 2 }}>
          {loadingMessage}
        </Typography>
      </Backdrop>

      {/* View 1: Live Camera */}
      {viewMode === 'camera' && (
        <Box
          sx={{
            position: 'relative',
            width: { 
              xs: '90%',
              sm: '80%',
              md: '60%',
              lg: '50%'
            },
            maxWidth: 600,
            aspectRatio: '16/9',
            height: {
              xs: '40vh',
              sm: 'auto',
              md: 'auto',
              lg: 'auto'
            },
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: 'black',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            m: 'auto'
          }}
        >
          {/* Close Button - Only show when NOT embedded */}
          {!embedded && (
            <IconButton 
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 20,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                },
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 }
              }}
            >
              <Close sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>
          )}

          {/* *** NEW: Camera Switch Button *** */}
          <IconButton
            onClick={handleCameraMenuOpen}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 20,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 }
            }}
          >
            <SwitchCamera sx={{ fontSize: { xs: 20, md: 24 } }} />
          </IconButton>

          {/* *** NEW: Camera Selection Menu *** */}
          <Menu
            anchorEl={cameraMenuAnchor}
            open={Boolean(cameraMenuAnchor)}
            onClose={handleCameraMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 180,
              }
            }}
          >
            <MenuItem 
              onClick={() => handleCameraSelect('environment')}
              selected={cameraFacingMode === 'environment'}
            >
              <CameraRear sx={{ mr: 2, fontSize: 20 }} />
              Back Camera
            </MenuItem>
            <MenuItem 
              onClick={() => handleCameraSelect('user')}
              selected={cameraFacingMode === 'user'}
            >
              <CameraFront sx={{ mr: 2, fontSize: 20 }} />
              Front Camera
            </MenuItem>
          </Menu>

          {/* Camera feed */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: embedded ? 0 : 12,
              // *** CHANGED: Only mirror front camera ***
              transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
          />

          {/* Overlay Information */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: isMobile ? 1.5 : 2,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
              color: 'white',
              backdropFilter: 'blur(2px)',
            }}
          >
            {/* *** NEW: Camera Type Indicator *** */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SwitchCamera fontSize={isMobile ? 'small' : 'medium'} />
              <Typography variant={isMobile ? 'caption' : 'body2'}>
                {cameraFacingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
              </Typography>
            </Box>

            {/* GPS Coordinates */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <GpsFixed fontSize={isMobile ? 'small' : 'medium'} color={location ? 'inherit' : 'error'} />
              <Typography variant={isMobile ? 'caption' : 'body2'}>
                {location
                  ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)} (±${Math.round(location.accuracy)}m)`
                  : 'Searching for GPS...'}
              </Typography>
            </Box>

            {/* Address */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <LocationOn fontSize={isMobile ? 'small' : 'medium'} sx={{ mt: isMobile ? 0.25 : 0 }} />
              <Typography
                variant={isMobile ? 'caption' : 'body2'}
                sx={{
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {address}
                {!isAddressValid && location && ' (fetching...)'}
              </Typography>
            </Box>

            {/* Date & Time */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexWrap: isSmallMobile ? 'wrap' : 'nowrap',
              }}
            >
              <CalendarToday fontSize={isMobile ? 'small' : 'medium'} />
              <Typography variant={isMobile ? 'caption' : 'body2'}>
                {isMobile
                  ? dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : dateTime.toLocaleDateString()}
              </Typography>
              <AccessTime fontSize={isMobile ? 'small' : 'medium'} sx={{ ml: isSmallMobile ? 0 : 1 }} />
              <Typography variant={isMobile ? 'caption' : 'body2'}>
                {dateTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: !isMobile,
                })}
              </Typography>
            </Box>
          </Box>

          {/* Status Message */}
          <Box
            sx={{
              position: 'absolute',
              bottom: isMobile ? '20%' : '22%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              width: '90%',
              maxWidth: 400,
            }}
          >
            {!location && (
              <Typography
                variant={isMobile ? 'caption' : 'body2'}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  p: isMobile ? 0.75 : 1,
                  borderRadius: 1,
                  display: 'inline-block',
                }}
              >
                🔍 Waiting for GPS location...
              </Typography>
            )}
            {location && !isAddressValid && (
              <Typography
                variant={isMobile ? 'caption' : 'body2'}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  p: isMobile ? 0.75 : 1,
                  borderRadius: 1,
                  display: 'inline-block',
                }}
              >
                📍 Getting address details...
              </Typography>
            )}
            {location && isAddressValid && (
              <Typography
                variant={isMobile ? 'caption' : 'body2'}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  p: isMobile ? 0.75 : 1,
                  borderRadius: 1,
                  display: 'inline-block',
                }}
              >
                ✅ Ready to capture!
              </Typography>
            )}
          </Box>

          {/* Capture Button */}
          <Fab
            color="primary"
            disabled={!location || !isAddressValid}
            onClick={handleCapture}
            sx={{
              position: 'absolute',
              bottom: isMobile ? 10 : 20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? 56 : 72,
              height: isMobile ? 56 : 72,
              opacity: !location || !isAddressValid ? 0.5 : 1,
              transition: 'opacity 0.3s ease',
              '&:hover': {
                opacity: !location || !isAddressValid ? 0.5 : 0.9,
              },
            }}
          >
            <PhotoCamera sx={{ fontSize: isMobile ? 28 : 40 }} />
          </Fab>
        </Box>
      )}

      {/* View 2: Preview of Stamped Image */}
      {viewMode === 'preview' && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'relative'
        }}>
          {/* Close Button - Only show when NOT embedded */}
          {!embedded && (
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                },
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 }
              }}
            >
              <Close sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>
          )}

          <Paper sx={{
            p: isMobile ? 2 : 3,
            borderRadius: 3,
            bgcolor: 'background.default',
            maxWidth: 600,
            width: '95%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <Typography variant={isMobile ? "h6" : "h5"} align="center" gutterBottom sx={{ fontWeight: 600 }}>
              Confirm Photo
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 3
            }}>
              <img 
                src={stampedImageSrc} 
                alt="Captured preview" 
                style={{ 
                  width: '100%',
                  maxHeight: isMobile ? '50vh' : '60vh', 
                  borderRadius: '12px',
                  objectFit: 'contain'
                }} 
              />
            </Box>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2
                }}
              >
                {error}
              </Alert>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: isSmallMobile ? 'column' : 'row'
            }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<Cancel />} 
                onClick={handleRetake}
                size="large"
                fullWidth
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Retake
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<CloudUpload />} 
                onClick={handleUpload}
                size="large"
                fullWidth
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                }}
              >
                Confirm & Upload
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default CapturePhotoPage;
