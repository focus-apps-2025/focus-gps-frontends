// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Snackbar,
  useTheme
} from '@mui/material';
import {
  AccountCircle, // 👈 new icon
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import illustration from '../assets/images/logo1.jpeg';
import logo from '../assets/images/logo.png';

const slides = [
  { title: 'Secure & Reliable.', subtitle: 'We take privacy seriously.' },
  { title: 'Real-time Insights.', subtitle: 'Live analytics for decisions.' },
];

export default function LoginPage() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  // form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // simple slide loop
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Both fields are required');
      return;
    }

    setLoading(true);
    try {
      // 👇 pass username instead of email
      await login(username, password);

      setSnackbar({
        open: true,
        message: 'Login successful! Redirecting...',
        severity: 'success',
      });

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      const msg = err?.message || 'Login failed';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: 2,
        bgcolor: theme.palette.grey[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: { xs: '100%', sm: 480, md: 800 },
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Left side: Form */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Logo + Heading */}
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Box component="img" src={logo} alt="Logo" sx={{ height: 70, mb: -1 }} />
            <Typography variant="h6" fontWeight={600}>
              Log in to your account
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              icon={<ErrorIcon fontSize="small" />}
              onClose={() => setError('')}
              sx={{ mb: 1 }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              label="Username"
              size="small"
              margin="dense"
              required
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              size="small"
              margin="dense"
              required
              fullWidth
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(v => !v)} size="small">
                      {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={14} /> : null}
              sx={{ mt: 1, py: 0.75, fontSize: '0.875rem' }}
            >
              {loading ? 'Signing in...' : 'Log in'}
            </Button>
          </Box>
        </Box>

        {/* Right illustration */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#0082ecfb',
            color: 'common.white',
            p: 3,
          }}
        >
          <Box component="img" src={illustration} alt="Illustration" sx={{ width: 250, mb: 2 }} />
          <Typography variant="subtitle1" align="center" gutterBottom>
            {slides[step].title}
          </Typography>
          <Typography variant="body2" align="center" mb={2}>
            {slides[step].subtitle}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {slides.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: i === step ? 'common.white' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          icon={snackbar.severity === 'success' ? <CheckCircle fontSize="small" /> : <ErrorIcon fontSize="small" />}
          sx={{ fontSize: '0.75rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
