// frontend/src/pages/AdminUserManagement.jsx
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Edit,
  Delete,
  PersonAdd,
  Email,
  Person,
  AdminPanelSettings,
  Shield,
  Badge,
  CalendarToday,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import api from '../utils/api';
import moment from 'moment';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dialogMode, setDialogMode] = useState('create');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formError, setFormError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMsg = err.response?.data?.message || 'Failed to fetch users. Please try again.';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setCurrentUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    setCurrentUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
    setFormError('');
  };

  const handleDeleteClick = (user) => {
    // Prevent deleting your own account
    if (user.email === JSON.parse(localStorage.getItem('user'))?.email) {
      showSnackbar('You cannot delete your own account!', 'warning');
      return;
    }
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setActionLoading(true);
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      showSnackbar(`User "${userToDelete.name}" deleted successfully!`, 'success');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete user. Please try again.';
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);

    // Validation
    if (dialogMode === 'create' && !password) {
      setFormError('Password is required for new users.');
      setActionLoading(false);
      return;
    }
    if (!name || !email || !role) {
      setFormError('All fields are required.');
      setActionLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address.');
      setActionLoading(false);
      return;
    }

    // Password validation for new users
    if (dialogMode === 'create' && password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      setActionLoading(false);
      return;
    }

    try {
      if (dialogMode === 'create') {
        await api.post('/users', { name, email, password, role });
        showSnackbar(`User "${name}" created successfully!`, 'success');
      } else if (dialogMode === 'edit' && currentUser) {
        const updateData = { name, email, role };
        if (password) updateData.password = password;
        await api.put(`/users/${currentUser._id}`, updateData);
        showSnackbar(`User "${name}" updated successfully!`, 'success');
      }
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      let errorMsg = err.response?.data?.message || 'Failed to save user. Please try again.';
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        errorMsg = 'A user with this email already exists.';
      } else if (err.response?.status === 400) {
        errorMsg = 'Invalid user data. Please check the form.';
      }
      
      setFormError(errorMsg);
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const UserCard = ({ user }) => (
    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: user.role === 'admin' ? 'primary.main' : 'secondary.main',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={user.role === 'admin' ? <AdminPanelSettings /> : <Person />}
            label={user.role}
            color={user.role === 'admin' ? 'primary' : 'default'}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarToday fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Joined {moment(user.createdAt).format('MMM DD, YYYY')}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Tooltip title="Edit User">
            <IconButton 
              color="primary" 
              onClick={() => handleOpenEditDialog(user)}
              sx={{ 
                bgcolor: 'primary.light',
                '&:hover': { bgcolor: 'primary.main', color: 'white' }
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title={user.email === JSON.parse(localStorage.getItem('user'))?.email ? "Cannot delete your own account" : "Delete User"}>
            <span>
              <IconButton 
                color="error" 
                onClick={() => handleDeleteClick(user)}
                disabled={user.email === JSON.parse(localStorage.getItem('user'))?.email}
                sx={{ 
                  bgcolor: user.email === JSON.parse(localStorage.getItem('user'))?.email ? 'grey.300' : 'error.light',
                  '&:hover': { 
                    bgcolor: user.email === JSON.parse(localStorage.getItem('user'))?.email ? 'grey.300' : 'error.main', 
                    color: 'white' 
                  }
                }}
              >
                <Delete />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
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
          👥 User Management
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Manage system users and permissions
        </Typography>
      </Box>

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

      {/* Stats and Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
            <Person color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
              {users.length}
            </Typography>
            <Typography variant="body2">Total Users</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
            <AdminPanelSettings color="secondary" />
            <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
              {users.filter(u => u.role === 'admin').length}
            </Typography>
            <Typography variant="body2">Admins</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Add New User
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create new user accounts with specific roles
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAdd />}
              onClick={handleOpenCreateDialog}
              size="large"
            >
              Add User
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Users List */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            System Users ({users.length})
          </Typography>
        </Box>

        {isMobile ? (
          /* Mobile Card View */
          <Box sx={{ p: 2 }}>
            {users.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No users found
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleOpenCreateDialog}
                >
                  Add First User
                </Button>
              </Box>
            ) : (
              users.map((user) => (
                <UserCard key={user._id} user={user} />
              ))
            )}
          </Box>
        ) : (
          /* Desktop Table View */
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No users found
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={handleOpenCreateDialog}
                      >
                        Add First User
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: user.role === 'admin' ? 'primary.main' : 'secondary.main',
                              fontSize: '1rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.role === 'admin' ? <Shield /> : <Badge />}
                          label={user.role}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {moment(user.createdAt).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {moment(user.createdAt).format('HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Edit User">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenEditDialog(user)}
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.email === JSON.parse(localStorage.getItem('user'))?.email ? "Cannot delete your own account" : "Delete User"}>
                            <span>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteClick(user)}
                                disabled={user.email === JSON.parse(localStorage.getItem('user'))?.email}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {dialogMode === 'create' ? <PersonAdd /> : <Edit />}
            <Typography variant="h6">
              {dialogMode === 'create' ? 'Create New User' : `Edit User: ${currentUser?.name}`}
            </Typography>
          </Box>
        </DialogTitle>
        
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {formError}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  label="Full Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  size="small"
                  error={!!formError && formError.toLowerCase().includes('name')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="small"
                  error={!!formError && formError.toLowerCase().includes('email')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={dialogMode === 'create' ? "Password" : "New Password (optional)"}
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={dialogMode === 'create'}
                  helperText={dialogMode === 'edit' ? "Leave blank to keep current password" : "Minimum 6 characters"}
                  size="small"
                  error={!!formError && formError.toLowerCase().includes('password')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" size="small" required>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    value={role}
                    label="Role"
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <MenuItem value="user">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        User
                      </Box>
                    </MenuItem>
                    <MenuItem value="admin">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings fontSize="small" />
                        Admin
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={handleCloseDialog} color="inherit" disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            >
              {actionLoading ? 'Saving...' : (dialogMode === 'create' ? 'Create User' : 'Update User')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !actionLoading && setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Confirm Delete
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Are you sure you want to delete user <strong>"{userToDelete?.name}"</strong>?
            This action cannot be undone.
          </Typography>
          {userToDelete?.email === JSON.parse(localStorage.getItem('user'))?.email && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You cannot delete your own account!
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Delete />}
            disabled={actionLoading || userToDelete?.email === JSON.parse(localStorage.getItem('user'))?.email}
          >
            {actionLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          icon={snackbar.severity === 'success' ? <CheckCircle /> : 
                snackbar.severity === 'warning' ? <Warning /> : <Error />}
          sx={{ 
            borderRadius: 2,
            alignItems: 'center',
            minWidth: isMobile ? 'auto' : 300
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUserManagement;