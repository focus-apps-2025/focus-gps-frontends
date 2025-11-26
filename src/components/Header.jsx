// frontend/src/components/Header.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  People,
  PhotoCamera,
  ExitToApp
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar>
        {/* Logo/Brand */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: { xs: 1, md: 0 },
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          📷 Focus GPS
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation */}
        {user ? (
          <>
            {isMobile ? (
              /* Mobile Menu */
              <>
                <IconButton
                  size="large"
                  aria-label="account menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  {/* User Info */}
                  <MenuItem sx={{ pointerEvents: 'none', opacity: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.role}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <Divider />

                  {/* Admin Links */}
                  {user.role === 'admin' && (
                    <>
                      <MenuItem
                        component={Link}
                        to="/admin/dashboard"
                        onClick={handleClose}
                        sx={{ gap: 1 }}
                      >
                        <PhotoCamera fontSize="small" />
                        Admin Photos
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        to="/admin/users"
                        onClick={handleClose}
                        sx={{ gap: 1 }}
                      >
                        <People fontSize="small" />
                        User Management
                      </MenuItem>
                      <Divider />
                    </>
                  )}

                  {/* User Links */}
                  {user.role === 'user' && (
                    <MenuItem
                      component={Link}
                      to="/dashboard"
                      onClick={handleClose}
                      sx={{ gap: 1 }}
                    >
                      <Dashboard fontSize="small" />
                      My Dashboard
                    </MenuItem>
                  )}

                  {/* Logout */}
                  <MenuItem onClick={handleLogout} sx={{ gap: 1, color: 'error.main' }}>
                    <ExitToApp fontSize="small" />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              /* Desktop Menu */
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* User Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                    <AccountCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" noWrap>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)" noWrap>
                      {user.role}
                    </Typography>
                  </Box>
                </Box>

                {/* Navigation Links */}
                {user.role === 'admin' && (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin/dashboard"
                      startIcon={<PhotoCamera />}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      Admin Photos
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin/users"
                      startIcon={<People />}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      User Management
                    </Button>
                  </>
                )}
                {user.role === 'user' && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/dashboard"
                    startIcon={<Dashboard />}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    My Dashboard
                  </Button>
                )}
                <Button
                  color="inherit"
                  onClick={logout}
                  startIcon={<ExitToApp />}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Logout
                </Button>
              </Box>
            )}
          </>
        ) : (
          /* Login Button */
          <Button
            color="inherit"
            component={Link}
            to="/login"
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;