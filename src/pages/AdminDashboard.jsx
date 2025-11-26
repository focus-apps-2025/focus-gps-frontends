// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  Slide,
  Fab,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Download,
  FilterList,
  Close,
  Photo,
  Person,
  Email,
  CalendarToday,
  GpsFixed,
  Map,
  Visibility,
} from '@mui/icons-material';
import api from '../utils/api';
import moment from 'moment';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AdminDashboard = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, users: 0 });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchAllPhotos = async (date = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (date) params.date = date;

      const res = await api.get('/photos/all', { params });
      setPhotos(res.data);
      
      // Calculate stats
      const today = moment().format('YYYY-MM-DD');
      const todayPhotos = res.data.filter(photo => 
        moment(photo.timestamp).format('YYYY-MM-DD') === today
      );
      const uniqueUsers = [...new Set(res.data.map(photo => 
        typeof photo.userId === 'object' ? photo.userId._id : photo.userId
      ))];
      
      setStats({
        total: res.data.length,
        today: todayPhotos.length,
        users: uniqueUsers.length
      });
    } catch (err) {
      console.error('Error fetching all photos:', err);
      setError(err.response?.data?.message || 'Failed to fetch all photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPhotos();
  }, []);

  const handleDateFilterChange = (e) => {
    setFilterDate(e.target.value);
    fetchAllPhotos(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPhotosBySearch = photos.filter(photo => {
    const user = photo.userId;
    return (
      user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/photos/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `focus_gps_photos_${moment().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError(err.response?.data?.message || 'Failed to export CSV.');
    }
  };

  const handleImageClick = (photo) => {
    setSelectedPhoto(photo);
    setImageDialogOpen(true);
  };

  const clearFilters = () => {
    setFilterDate('');
    setSearchQuery('');
    fetchAllPhotos();
  };

  const PhotoCard = ({ photo }) => {
    const user = photo.userId;
    return (
      <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: isSmallMobile ? 'column' : 'row' }}>
            {/* Image */}
            <Box 
              sx={{ 
                flex: '0 0 auto',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => handleImageClick(photo)}
            >
              <img 
                src={photo.imageUrl} 
                alt="preview" 
                style={{ 
                  width: isSmallMobile ? '100%' : 120, 
                  height: isSmallMobile ? 200 : 120, 
                  objectFit: 'cover', 
                  borderRadius: 12,
                }} 
              />
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Chip 
                  icon={<Visibility />} 
                  label="View" 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.7rem'
                  }} 
                />
              </Box>
            </Box>

            {/* Details */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                  {user?.name || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email || 'N/A'}
                </Typography>
              </Box>

              {/* Date/Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {moment(photo.timestamp).format('MMM DD, YYYY')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {moment(photo.timestamp).format('HH:mm')}
                </Typography>
              </Box>

              {/* GPS Coordinates */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <GpsFixed fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                </Typography>
                <Chip 
                  label={`Acc: ${photo.accuracy?.toFixed(1) || 'N/A'}m`} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Map />}
                  onClick={() => openGoogleMaps(photo.latitude, photo.longitude)}
                >
                  View Map
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
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
          📊 Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Manage and monitor all photo submissions
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
            <Photo fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
              {stats.total}
            </Typography>
            <Typography variant="body1">Total Photos</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, bgcolor: 'secondary.main', color: 'white' }}>
            <CalendarToday fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
              {stats.today}
            </Typography>
            <Typography variant="body1">Today's Photos</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, bgcolor: 'success.main', color: 'white' }}>
            <Person fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
              {stats.users}
            </Typography>
            <Typography variant="body1">Active Users</Typography>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError('')}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList color="action" />
          <Typography variant="h6">Filters & Search</Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Filter by Date"
              value={filterDate}
              onChange={handleDateFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search User (Name/Email)"
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Download />}
              onClick={handleExportCSV}
              fullWidth={isMobile}
              size="small"
            >
              Export CSV
            </Button>
            {(filterDate || searchQuery) && (
              <Button
                variant="outlined"
                onClick={clearFilters}
                size="small"
              >
                Clear
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Results Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="text.secondary">
              {filteredPhotosBySearch.length} photo{filteredPhotosBySearch.length !== 1 ? 's' : ''} found
            </Typography>
          </Box>

          {/* Content */}
          {isMobile ? (
            /* Mobile Card View */
            <Box>
              {filteredPhotosBySearch.length === 0 ? (
                <Card sx={{ textAlign: 'center', p: 6, borderRadius: 3 }}>
                  <Photo sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No photos found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery || filterDate ? 'Try adjusting your filters' : 'No photos have been uploaded yet'}
                  </Typography>
                </Card>
              ) : (
                filteredPhotosBySearch.map((photo) => (
                  <PhotoCard key={photo._id} photo={photo} />
                ))
              )}
            </Box>
          ) : (
            /* Desktop Table View */
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 3,
                '& .MuiTableRow-root:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Photo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date/Time</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>GPS Coordinates</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPhotosBySearch.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Photo sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                          No photos found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPhotosBySearch.map((photo) => {
                      const user = photo.userId;
                      return (
                        <TableRow key={photo._id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {user?.name || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user?.email || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box 
                              sx={{ 
                                cursor: 'pointer',
                                position: 'relative',
                                display: 'inline-block'
                              }}
                              onClick={() => handleImageClick(photo)}
                            >
                              <img 
                                src={photo.imageUrl} 
                                alt="preview" 
                                style={{ 
                                  width: 80, 
                                  height: 80, 
                                  objectFit: 'cover', 
                                  borderRadius: 8,
                                }} 
                              />
                              <Chip 
                                label="View" 
                                size="small" 
                                sx={{ 
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  fontSize: '0.6rem'
                                }} 
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {moment(photo.timestamp).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {moment(photo.timestamp).format('HH:mm:ss')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                            </Typography>
                            <Chip 
                              label={`Accuracy: ${photo.accuracy?.toFixed(1) || 'N/A'}m`} 
                              size="small" 
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              onClick={() => openGoogleMaps(photo.latitude, photo.longitude)}
                              color="primary"
                              sx={{ 
                                bgcolor: 'primary.light',
                                '&:hover': { bgcolor: 'primary.main', color: 'white' }
                              }}
                            >
                              <LocationOn />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Image Dialog */}
      <Dialog
        fullScreen={isMobile}
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
      >
        {isMobile && (
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setImageDialogOpen(false)}
              >
                <Close />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Photo Details
              </Typography>
            </Toolbar>
          </AppBar>
        )}
        <DialogContent sx={{ p: 0, textAlign: 'center' }}>
          {selectedPhoto && (
            <>
              <img 
                src={selectedPhoto.imageUrl} 
                alt="full size" 
                style={{ 
                  width: '100%', 
                  height: isMobile ? 'auto' : '70vh', 
                  objectFit: 'contain' 
                }} 
              />
              {!isMobile && (
                <Box sx={{ p: 3 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setImageDialogOpen(false)}
                    sx={{ mr: 2 }}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="contained"
                    startIcon={<LocationOn />}
                    onClick={() => openGoogleMaps(selectedPhoto.latitude, selectedPhoto.longitude)}
                  >
                    View on Map
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isMobile && filteredPhotosBySearch.length > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleExportCSV}
        >
          <Download />
        </Fab>
      )}
    </Box>
  );
};

export default AdminDashboard;