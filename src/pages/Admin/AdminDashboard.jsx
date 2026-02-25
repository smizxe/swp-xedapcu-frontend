import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip, Select,
    MenuItem, FormControl, CircularProgress, Alert, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import Header from '../../components/Header/Header';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit dialog state
    const [editDialog, setEditDialog] = useState({ open: false, user: null });
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/home');
            return;
        }
        fetchUsers();
    }, [isAdmin, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminService.getAllUsers();
            setUsers(data || []);
        } catch (err) {
            setError('Failed to load users. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditRole = (userToEdit) => {
        setEditDialog({ open: true, user: userToEdit });
        setSelectedRole(userToEdit.role);
    };

    const handleSaveRole = async () => {
        try {
            setLoading(true);
            await adminService.updateUserRole(editDialog.user.email, selectedRole);
            setSuccess(`Role updated for ${editDialog.user.email}`);
            setEditDialog({ open: false, user: null });
            fetchUsers(); // Refresh list
        } catch (err) {
            setError('Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (email) => {
        if (!window.confirm(`Are you sure you want to delete user ${email}?`)) {
            return;
        }

        try {
            setLoading(true);
            await adminService.deleteUser(email);
            setSuccess(`User ${email} deleted successfully`);
            fetchUsers();
        } catch (err) {
            setError('Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'SELLER': return 'primary';
            case 'BUYER': return 'success';
            case 'INSPECTOR': return 'warning';
            default: return 'default';
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pt: '80px' }}>
            <Header />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="#0f172a">
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage users and system settings
                        </Typography>
                    </Box>
                    <Button
                        startIcon={<RefreshIcon />}
                        variant="outlined"
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Alerts */}
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Stats Cards */}
                <Box display="flex" gap={3} mb={4}>
                    <Paper sx={{ p: 3, flex: 1, textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="primary">
                            {users.length}
                        </Typography>
                        <Typography color="text.secondary">Total Users</Typography>
                    </Paper>
                    <Paper sx={{ p: 3, flex: 1, textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="success.main">
                            {users.filter(u => u.role === 'SELLER').length}
                        </Typography>
                        <Typography color="text.secondary">Sellers</Typography>
                    </Paper>
                    <Paper sx={{ p: 3, flex: 1, textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="info.main">
                            {users.filter(u => u.role === 'BUYER').length}
                        </Typography>
                        <Typography color="text.secondary">Buyers</Typography>
                    </Paper>
                </Box>

                {/* Users Table */}
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Full Name</strong></TableCell>
                                    <TableCell><strong>Role</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((u) => (
                                        <TableRow key={u.email} hover>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>{u.fullName || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={u.role}
                                                    color={getRoleColor(u.role)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={u.isActive ? 'Active' : 'Inactive'}
                                                    color={u.isActive ? 'success' : 'default'}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEditRole(u)}
                                                    disabled={u.email === user?.email}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteUser(u.email)}
                                                    disabled={u.email === user?.email}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>

            {/* Edit Role Dialog */}
            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogContent sx={{ minWidth: 300, pt: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Editing role for: <strong>{editDialog.user?.email}</strong>
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <MenuItem value="BUYER">BUYER</MenuItem>
                            <MenuItem value="SELLER">SELLER</MenuItem>
                            <MenuItem value="INSPECTOR">INSPECTOR</MenuItem>
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveRole} disabled={loading}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDashboard;
