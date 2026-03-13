import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip, Select,
    MenuItem, FormControl, CircularProgress, Alert, Button, Dialog,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../../../context/AuthContext';
import adminService from '../../../services/adminService';
import styles from '../AdminDashboard/AdminDashboard.module.css';

const UsersManagement = () => {
    const { user, isAdmin, loading: authLoading } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [editDialog, setEditDialog] = useState({ open: false, user: null });
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (authLoading) return;
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, authLoading]);

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
            fetchUsers();
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

    if (authLoading || (!isAdmin && !loading)) return null;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#064E3B" fontFamily="inherit" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                        User Management
                    </Typography>
                    <Typography variant="body1" color="#64748b" fontFamily="inherit">
                        Manage users, roles and permissions
                    </Typography>
                </Box>
                <Button
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    onClick={fetchUsers}
                    disabled={loading}
                    sx={{ color: '#064E3B', borderColor: '#064E3B', fontFamily: 'inherit', fontWeight: 'bold' }}
                >
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper className={styles.glassCard} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(209, 250, 229, 0.4)' }}>
                            <TableRow>
                                <TableCell sx={{ fontFamily: 'inherit', fontWeight: 'bold', color: '#064E3B' }}>EMAIL</TableCell>
                                <TableCell sx={{ fontFamily: 'inherit', fontWeight: 'bold', color: '#064E3B' }}>FULL NAME</TableCell>
                                <TableCell sx={{ fontFamily: 'inherit', fontWeight: 'bold', color: '#064E3B' }}>ROLE</TableCell>
                                <TableCell sx={{ fontFamily: 'inherit', fontWeight: 'bold', color: '#064E3B' }}>STATUS</TableCell>
                                <TableCell align="right" sx={{ fontFamily: 'inherit', fontWeight: 'bold', color: '#064E3B' }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <CircularProgress sx={{ color: '#064E3B' }} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, fontFamily: 'inherit' }}>
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u.email} hover>
                                        <TableCell sx={{ fontFamily: 'inherit' }}>{u.email}</TableCell>
                                        <TableCell sx={{ fontFamily: 'inherit', fontWeight: 500 }}>{u.fullName || '-'}</TableCell>
                                        <TableCell sx={{ fontFamily: 'inherit' }}>
                                            <Chip
                                                label={u.role}
                                                color={getRoleColor(u.role)}
                                                size="small"
                                                sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'inherit' }}>
                                            <Chip
                                                label={u.isActive ? 'Active' : 'Inactive'}
                                                color={u.isActive ? 'success' : 'default'}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}
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

            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
                <DialogTitle sx={{ fontFamily: 'inherit', fontWeight: 'bold', color: '#064E3B' }}>EDIT USER ROLE</DialogTitle>
                <DialogContent sx={{ minWidth: 300, pt: 2, fontFamily: 'inherit' }}>
                    <Typography variant="body2" color="text.secondary" mb={2} fontFamily="inherit">
                        Editing role for: <strong style={{color: '#0f172a'}}>{editDialog.user?.email}</strong>
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            sx={{ fontFamily: 'inherit', fontWeight: 600 }}
                        >
                            <MenuItem sx={{ fontFamily: 'inherit' }} value="BUYER">BUYER</MenuItem>
                            <MenuItem sx={{ fontFamily: 'inherit' }} value="SELLER">SELLER</MenuItem>
                            <MenuItem sx={{ fontFamily: 'inherit' }} value="INSPECTOR">INSPECTOR</MenuItem>
                            <MenuItem sx={{ fontFamily: 'inherit' }} value="ADMIN">ADMIN</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button sx={{ fontFamily: 'inherit', fontWeight: 'bold', color: '#64748b' }} onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSaveRole} 
                        disabled={loading}
                        sx={{ 
                            fontFamily: 'inherit', 
                            fontWeight: 'bold', 
                            bgcolor: '#064E3B',
                            '&:hover': { bgcolor: '#043428' }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersManagement;
