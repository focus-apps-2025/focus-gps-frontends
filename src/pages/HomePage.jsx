// frontend/src/pages/HomePage.jsx
import React from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  useMediaQuery, 
  useTheme,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PhotoCamera,
  GpsFixed,
  CloudUpload,
  Security,
  Dashboard,
  AdminPanelSettings,
  TrendingUp,
  Smartphone
} from '@mui/icons-material';

const HomePage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <PhotoCamera sx={{ fontSize: 40 }} />,
      title: "Capture Photos",
      description: "Use your device camera to capture high-quality photos with built-in GPS tagging"
    },
    {
      icon: <GpsFixed sx={{ fontSize: 40 }} />,
      title: "GPS Location",
      description: "Automatically record precise location coordinates with each photo capture"
    },
    {
      icon: <CloudUpload sx={{ fontSize: 40 }} />,
      title: "Cloud Storage",
      description: "Securely store your photos in the cloud with automatic organization"
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Secure Access",
      description: "Role-based access control ensures your data remains private and secure"
    },
    {
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      title: "Dashboard",
      description: "Beautiful dashboard to view and manage all your captured photos"
    },
    {
      icon: <Smartphone sx={{ fontSize: 40 }} />,
      title: "Mobile Friendly",
      description: "Fully responsive design that works perfectly on all devices"
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
      pt: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 6, md: 10 },
          px: { xs: 2, sm: 0 }
        }}>
          <Fade in={true} timeout={800}>
            <Box>
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1.2
                }}
              >
                📍 Focus GPS Camera System
              </Typography>
              
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                component="p" 
                sx={{ 
                  mb: 4,
                  color: 'text.secondary',
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Capture, geotag, and manage your photos with precision. 
                Perfect for field work, inspections, and daily documentation.
              </Typography>

              {/* Action Buttons */}
              {!user ? (
                <Slide in={true} direction="up" timeout={1000}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'center',
                    flexWrap: isSmallMobile ? 'wrap' : 'nowrap'
                  }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      component={Link} 
                      to="/login"
                      startIcon={<Security />}
                      sx={{ 
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        minWidth: isSmallMobile ? '100%' : 160
                      }}
                    >
                      Login to Access
                    </Button>
                    
                  </Box>
                </Slide>
              ) : (
                <Slide in={true} direction="up" timeout={1000}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      component={Link} 
                      to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"}
                      startIcon={user.role === 'admin' ? <AdminPanelSettings /> : <Dashboard />}
                      sx={{ 
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      Go to {user.role === 'admin' ? 'Admin' : 'User'} Dashboard
                    </Button>
                  </Box>
                </Slide>
              )}
            </Box>
          </Fade>
        </Box>

        {/* Features Section */}
        {!user && (
          <Box sx={{ mb: { xs: 8, md: 12 } }}>
            <Fade in={true} timeout={1200}>
              <Typography 
                variant="h4" 
                component="h2" 
                align="center" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 6
                }}
              >
                Why Choose Focus GPS?
              </Typography>
            </Fade>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Zoom in={true} timeout={800 + (index * 200)}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <Box sx={{ 
                          color: 'primary.main',
                          mb: 2
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ lineHeight: 1.6 }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Stats Section */}
        <Fade in={true} timeout={1600}>
          <Box sx={{ 
            textAlign: 'center',
            p: 6,
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'white',
            mb: 8
          }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  100+
                </Typography>
                <Typography variant="h6">
                  Active Users
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  5K+
                </Typography>
                <Typography variant="h6">
                  Photos Captured
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  99.9%
                </Typography>
                <Typography variant="h6">
                  Uptime Reliability
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* CTA Section */}
        {!user && (
          <Fade in={true} timeout={2000}>
            <Box sx={{ 
              textAlign: 'center',
              p: 6,
              borderRadius: 3,
              bgcolor: 'grey.50',
              border: `1px solid ${theme.palette.grey[200]}`
            }}>
              <TrendingUp sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Ready to Get Started?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                Join thousands of professionals who trust Focus GPS for their photo documentation needs.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                component={Link} 
                to="/register"
                startIcon={<PhotoCamera />}
                sx={{ 
                  borderRadius: 3,
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Start Capturing Today
              </Button>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;