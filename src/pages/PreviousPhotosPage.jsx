// frontend/src/pages/PreviousPhotosPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Container,
  Chip,
  useMediaQuery,
  useTheme,
  Fab,
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  Slide,
  Button,
  // CardActionArea, // No longer needed for entire card click
  DialogActions,
  DialogTitle,
} from '@mui/material';
import { 
  LocationOn, 
  Close,
  CalendarToday,
  GpsFixed,
  ZoomIn, // Still used for the "View" button
  FilterList,
  Sort,
  ArrowBack,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import moment from 'moment';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// MODIFIED: To hide "Map unavailable" text if no API key
const StaticMapThumbnail = ({ lat, lng }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=200x150&markers=color:red%7C${lat},${lng}&key=${apiKey}`;

 

  
};

const PreviousPhotosPage = ({ onBack, embedded = false, currentUser }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const currentUserId = currentUser?._id;
  const currentUserRole = currentUser?.role;




// TEMPORARY DEBUG - Add this right after the above lines
console.log("=== DEBUG CURRENT USER STRUCTURE ===");
console.log("Full currentUser object:", currentUser);
console.log("All currentUser keys:", Object.keys(currentUser || {}));
console.log("currentUser._id:", currentUser?._id);
console.log("currentUser.id:", currentUser?.id);
console.log("currentUser.userId:", currentUser?.userId);
console.log("currentUser._id type:", typeof currentUser?._id);
console.log("currentUser.id type:", typeof currentUser?.id);
console.log("=== END DEBUG ===");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await api.get('/photos/my');
        setPhotos(res.data);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError(err.response?.data?.message || 'Failed to fetch previous photos.');
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [currentUser]);

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const handleBack = () => {
    if (embedded && onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleImageClick = (photo) => {
    setSelectedPhoto(photo);
    setImageDialogOpen(true);
  };

  const confirmDelete = (photo) => {
    setPhotoToDelete(photo);
    setConfirmDeleteDialogOpen(true);
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    setDeleting(true);
    setError('');

    try {
      await api.delete(`/photos/${photoToDelete._id}`);
      setPhotos(photos.filter(p => p._id !== photoToDelete._id));
      setImageDialogOpen(false);
      setConfirmDeleteDialogOpen(false);
      setPhotoToDelete(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err.response?.data?.message || 'Failed to delete photo.');
      setConfirmDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const sortedPhotos = [...photos].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else {
      return new Date(a.timestamp) - new Date(b.timestamp);
    }
  });

  // MODIFIED: PhotoCard component for new button layout
  const PhotoCard = ({ photo }) => (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }
    }}>
      {/* CardMedia is now just an image display, not clickable directly */}
      <CardMedia
        component="img"
        height={isSmallMobile ? 200 : 240}
        image={photo.imageUrl}
        alt={`Photo from ${moment(photo.timestamp).format('YYYY-MM-DD HH:mm')}`}
        sx={{ 
          objectFit: 'cover',
          position: 'relative'
        }}
      />
      
      <CardContent sx={{ p: 3 }}>
        {/* Date and Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarToday fontSize="small" color="action" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {moment(photo.timestamp).format('MMM DD, YYYY')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {moment(photo.timestamp).format('HH:mm:ss')}
            </Typography>
          </Box>
        </Box>

        {/* GPS Coordinates */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <GpsFixed fontSize="small" color="action" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
            </Typography>
            <Chip 
              label={`Accuracy: ${photo.accuracy?.toFixed(1) || 'N/A'}m`} 
              size="small" 
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        {/* Map Thumbnail */}
        <Box sx={{ mb: 2 }}>
          <StaticMapThumbnail lat={photo.latitude} lng={photo.longitude} />
        </Box>

        {/* MODIFIED: Actions - Now with "View Map" and "View Photo" buttons side-by-side */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isSmallMobile ? 'column' : 'row', // Stack buttons on very small screens
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: 1.5 // Gap between buttons
        }}>
          {/* View Map Button */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={() => openGoogleMaps(photo.latitude, photo.longitude)}
            sx={{ borderRadius: 2, flexGrow: 1 }} // Allow button to grow
          >
            View Map
          </Button>
          
          {/* View Photo Button */}
          <Button
            size="small"
            variant="contained" // Use contained variant for "View Photo" to distinguish
            startIcon={<ZoomIn />}
            onClick={() => handleImageClick(photo)} // This opens the dialog
            sx={{ borderRadius: 2, flexGrow: 1 }} // Allow button to grow
          >
            View Photo
          </Button>

          {/* Timestamp moved to a separate box if space is tight, or adjusted */}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              mt: isSmallMobile ? 1 : 0, // Margin top if stacked
              whiteSpace: 'nowrap' 
            }}
          >
            {moment(photo.timestamp).fromNow()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: embedded ? 'auto' : '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
      py: embedded ? 2 : 4
    }}>
      <Container maxWidth="xl" sx={{ px: embedded ? 2 : 3 }}>
        {/* Header (unchanged) */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant={embedded ? "h5" : "h4"}
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            📸 My Photo Gallery
          </Typography>
          <Typography variant={embedded ? "body1" : "h6"} color="text.secondary" gutterBottom>
            All your captured photos with GPS locations
          </Typography>
          
          {/* Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${photos.length} photos total`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`${new Set(photos.map(p => moment(p.timestamp).format('YYYY-MM-DD'))).size} days`} 
              color="secondary" 
              variant="outlined" 
            />
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Content */}
        {sortedPhotos.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            maxWidth: 600,
            mx: 'auto'
          }}>
            <LocationOn sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Photos Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start capturing photos with GPS locations to see them here.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/capture"
              size="large"
              onClick={handleBack}
            >
              Capture Your First Photo
            </Button>
          </Box>
        ) : (
          <>
            {/* Sort Controls */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h6" color="text.secondary">
                {sortedPhotos.length} photo{sortedPhotos.length !== 1 ? 's' : ''}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  startIcon={<Sort />}
                  onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                  variant="outlined"
                  size="small"
                >
                  Sort: {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
                </Button>
              </Box>
            </Box>

            {/* Photos Grid */}
            <Grid container spacing={3}>
              {sortedPhotos.map((photo) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={photo._id}>
                  <PhotoCard photo={photo} />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Image Dialog (Full screen view of a photo) */}
        <Dialog
          fullScreen={isMobile}
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          TransitionComponent={Transition}
          maxWidth="md"
          fullWidth
        >
          {selectedPhoto && (
            <>
              {/* --- DEBUGGING BLOCK (UNTOUCHED) --- */}
              {(() => {
                  console.groupCollapsed("Delete Button Visibility Check for Photo ID:", selectedPhoto._id);
                  console.log("1. currentUser (prop):", currentUser);
                  console.log("2. currentUserId (extracted):", currentUserId, "Type:", typeof currentUserId);
                  console.log("3. currentUserRole (extracted):", currentUserRole, "Type:", typeof currentUserRole);
                  console.log("4. selectedPhoto.userId:", selectedPhoto.userId, "Type:", typeof selectedPhoto.userId);
                  console.log("5. selectedPhoto.userId.toString():", selectedPhoto.userId?.toString(), "Type:", typeof selectedPhoto.userId?.toString());
                  
                  const isOwner = currentUserId && selectedPhoto.userId?.toString() === currentUserId.toString();

                  const isAdmin = currentUserRole === 'admin';
                  const shouldShowButton = isOwner || isAdmin;

                  console.log("6. Is Owner (currentUserId && selectedPhoto.userId.toString() === currentUserId):", isOwner);
                  console.log("7. Is Admin (currentUserRole === 'admin'):", isAdmin);
                  console.log("8. Final Decision: Should Show Delete Button (isOwner || isAdmin):", shouldShowButton);
                  console.groupEnd();
                  return null;
              })()}
              {/* --- END DEBUGGING BLOCK --- */}

              {isMobile ? (
                // Mobile AppBar with close and delete buttons
                <AppBar sx={{ position: 'relative' }}>
                  <Toolbar>
                    <IconButton
                      edge="start"
                      color="inherit"
                      onClick={() => setImageDialogOpen(false)}
                      aria-label="close"
                    >
                      <Close />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                      Photo Details
                    </Typography>
                    {/* Delete button in AppBar for mobile dialog */}
                    {((currentUserId && selectedPhoto.userId?.toString() === currentUserId.toString()) || (currentUserRole === 'admin')) && (
                      <IconButton color="inherit" onClick={() => confirmDelete(selectedPhoto)} aria-label="delete photo">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Toolbar>
                </AppBar>
              ) : (
                // Non-mobile dialog has a close button at top-right, delete button in DialogActions
                <IconButton
                  aria-label="close"
                  onClick={() => setImageDialogOpen(false)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                    zIndex: 2,
                  }}
                >
                  <Close />
                </IconButton>
              )}

              <DialogContent sx={{ p: 0, textAlign: 'center' }}>
                <img 
                  src={selectedPhoto.imageUrl} 
                  alt="full size" 
                  style={{ 
                    width: '100%', 
                    height: isMobile ? 'auto' : '70vh', 
                    objectFit: 'contain' 
                  }} 
                />
              </DialogContent>
              {/* DialogActions for buttons (for non-mobile) */}
              <DialogActions sx={{ p: isMobile ? 2 : 3, justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setImageDialogOpen(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained"
                  startIcon={<LocationOn />}
                  onClick={() => openGoogleMaps(selectedPhoto.latitude, selectedPhoto.longitude)}
                  sx={{ borderRadius: 2 }}
                >
                  View on Map
                </Button>
                {/* Delete button for non-mobile dialog */}
                {((currentUserId && selectedPhoto.userId?.toString() === currentUserId.toString()) || (currentUserRole === 'admin')) && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => confirmDelete(selectedPhoto)}
                    sx={{ borderRadius: 2 }}
                    disabled={deleting}
                  >
                    Delete
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={confirmDeleteDialogOpen}
          onClose={() => setConfirmDeleteDialogOpen(false)}
          aria-labelledby="confirm-delete-dialog-title"
          aria-describedby="confirm-delete-dialog-description"
        >
          <DialogTitle id="confirm-delete-dialog-title">Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography id="confirm-delete-dialog-description">
              Are you sure you want to delete this photo? This action cannot be undone and will permanently remove the image.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteDialogOpen(false)} color="primary" disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDeletePhoto} color="error" autoFocus disabled={deleting}>
              {deleting ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        {isMobile && sortedPhotos.length > 0 && !embedded && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <FilterList />
          </Fab>
        )}
      </Container>
    </Box>
  );
};

export default PreviousPhotosPage;
