import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from '@mui/material';
import { Edit2, Lock, RefreshCw, Search, Trash2, Unlock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import adminService from '../../../services/adminService';
import styles from './UsersManagement.module.css';

const ROLE_OPTIONS = ['ALL', 'BUYER', 'SELLER', 'INSPECTOR', 'ADMIN'];

const ROLE_BADGE_CLASS = {
    ADMIN: styles.roleAdmin,
    INSPECTOR: styles.roleInspector,
    SELLER: styles.roleSeller,
    BUYER: styles.roleBuyer,
};

const normalizeStatus = (user) => (user?.isActive ? 'Active' : 'Banned');

const UsersManagement = () => {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [keyword, setKeyword] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [editDialog, setEditDialog] = useState({ open: false, user: null });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null });
    const [selectedRole, setSelectedRole] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const data = await adminService.getUserStats();
            setStats(data);
        } catch {
            setStats(null);
        }
    }, []);

    const fetchUsers = useCallback(async ({ nextKeyword = '', nextRole = 'ALL' } = {}) => {
        try {
            setLoading(true);
            setError('');

            let data = [];
            if (nextKeyword.trim()) {
                data = await adminService.searchUsers(nextKeyword.trim());
            } else if (nextRole !== 'ALL') {
                data = await adminService.getUsersByRole(nextRole);
            } else {
                data = await adminService.getAllUsers();
            }

            setUsers(data || []);
        } catch (err) {
            setError(err?.response?.data || 'Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading || !isAdmin) {
            return;
        }
        fetchUsers();
        fetchStats();
    }, [authLoading, fetchStats, fetchUsers, isAdmin]);

    useEffect(() => {
        if (authLoading || !isAdmin) {
            return;
        }
        if (roleFilter === 'ALL' && !keyword.trim()) {
            fetchUsers();
            return;
        }
        if (!keyword.trim()) {
            fetchUsers({ nextRole: roleFilter });
        }
    }, [authLoading, fetchUsers, isAdmin, keyword, roleFilter]);

    const handleSearch = () => {
        fetchUsers({ nextKeyword: keyword, nextRole: roleFilter });
    };

    const handleEditRole = (targetUser) => {
        setEditDialog({ open: true, user: targetUser });
        setSelectedRole(targetUser.role);
    };

    const handleSaveRole = async () => {
        try {
            setLoading(true);
            await adminService.updateUserRole(editDialog.user.email, selectedRole);
            setSuccess(`Updated role for ${editDialog.user.email}`);
            setEditDialog({ open: false, user: null });
            await Promise.all([
                fetchUsers({ nextKeyword: keyword, nextRole: roleFilter }),
                fetchStats(),
            ]);
        } catch (err) {
            setError(err?.response?.data || 'Failed to update role.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmToggle = (targetUser) => {
        setConfirmDialog({ open: true, user: targetUser });
    };

    const handleToggleActive = async () => {
        const targetUser = confirmDialog.user;
        if (!targetUser) {
            return;
        }

        try {
            setLoading(true);
            if (targetUser.isActive) {
                await adminService.disableUser(targetUser.email);
                setSuccess(`Locked ${targetUser.email}`);
            } else {
                await adminService.enableUser(targetUser.email);
                setSuccess(`Unlocked ${targetUser.email}`);
            }
            setConfirmDialog({ open: false, user: null });
            await Promise.all([
                fetchUsers({ nextKeyword: keyword, nextRole: roleFilter }),
                fetchStats(),
            ]);
        } catch (err) {
            setError(err?.response?.data || 'Failed to update user status.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (email) => {
        if (!window.confirm(`Delete user ${email}?`)) {
            return;
        }

        try {
            setLoading(true);
            await adminService.deleteUser(email);
            setSuccess(`Deleted ${email}`);
            await Promise.all([
                fetchUsers({ nextKeyword: keyword, nextRole: roleFilter }),
                fetchStats(),
            ]);
        } catch (err) {
            setError(err?.response?.data || 'Failed to delete user.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (!isAdmin && !loading)) {
        return null;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>User Management</h1>
                    <p className={styles.subtitle}>Manage roles, moderation status, and account lifecycle in one place.</p>
                </div>
                <Button
                    startIcon={<RefreshCw size={16} />}
                    variant="outlined"
                    onClick={() => {
                        fetchUsers({ nextKeyword: keyword, nextRole: roleFilter });
                        fetchStats();
                    }}
                    disabled={loading}
                    sx={{ borderColor: '#2d5a27', color: '#2d5a27', fontFamily: 'var(--font-body)', fontWeight: 600 }}
                >
                    Refresh
                </Button>
            </div>

            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}><span className={styles.statLabel}>Total Users</span><strong className={styles.statValue}>{stats.totalUsers ?? 0}</strong></div>
                    <div className={styles.statCard}><span className={styles.statLabel}>Admins</span><strong className={styles.statValue}>{stats.admins ?? 0}</strong></div>
                    <div className={styles.statCard}><span className={styles.statLabel}>Sellers</span><strong className={styles.statValue}>{stats.sellers ?? 0}</strong></div>
                    <div className={styles.statCard}><span className={styles.statLabel}>Active</span><strong className={styles.statValue}>{stats.activeUsers ?? 0}</strong></div>
                </div>
            )}

            <div className={styles.filters}>
                <TextField
                    size="small"
                    placeholder="Search by email or full name"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className={styles.searchInput}
                />
                <Select
                    size="small"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    {ROLE_OPTIONS.map((role) => (
                        <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                </Select>
                <Button
                    startIcon={<Search size={16} />}
                    variant="contained"
                    onClick={handleSearch}
                    sx={{ background: '#2d5a27', fontFamily: 'var(--font-body)', fontWeight: 600, '&:hover': { background: '#1f431c' } }}
                >
                    Search
                </Button>
            </div>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <div className={styles.tableCard}>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Full Name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className={styles.actionsHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>Loading users...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>No users found</td>
                                </tr>
                            ) : users.map((item) => {
                                const statusLabel = normalizeStatus(item);
                                const isSelf = item.email === user?.email;
                                const isActive = item.isActive;

                                return (
                                    <tr key={item.email}>
                                        <td className={styles.emailCell}>{item.email}</td>
                                        <td>{item.fullName || '-'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${ROLE_BADGE_CLASS[item.role] || styles.roleDefault}`}>
                                                {item.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${isActive ? styles.statusActive : styles.statusBanned}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionGroup}>
                                                <Tooltip title="Edit Role">
                                                    <span>
                                                        <button
                                                            type="button"
                                                            className={`${styles.iconButton} ${styles.iconEdit}`}
                                                            onClick={() => handleEditRole(item)}
                                                            disabled={isSelf}
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title={isActive ? 'Lock User' : 'Unlock User'}>
                                                    <span>
                                                        <button
                                                            type="button"
                                                            className={`${styles.iconButton} ${isActive ? styles.iconLock : styles.iconUnlock}`}
                                                            onClick={() => handleConfirmToggle(item)}
                                                            disabled={isSelf}
                                                        >
                                                            {isActive ? <Lock size={15} /> : <Unlock size={15} />}
                                                        </button>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Delete User">
                                                    <span>
                                                        <button
                                                            type="button"
                                                            className={`${styles.iconButton} ${styles.iconDelete}`}
                                                            onClick={() => handleDeleteUser(item.email)}
                                                            disabled={isSelf}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </span>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
                <DialogTitle sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.04em' }}>Edit User Role</DialogTitle>
                <DialogContent sx={{ minWidth: 340, pt: 2 }}>
                    <p className={styles.dialogCopy}>Update role for <strong>{editDialog.user?.email}</strong>.</p>
                    <Select
                        fullWidth
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        sx={{ fontFamily: 'var(--font-body)' }}
                    >
                        <MenuItem value="BUYER">BUYER</MenuItem>
                        <MenuItem value="SELLER">SELLER</MenuItem>
                        <MenuItem value="INSPECTOR">INSPECTOR</MenuItem>
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveRole} sx={{ background: '#2d5a27', '&:hover': { background: '#1f431c' } }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, user: null })}>
                <DialogTitle sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {confirmDialog.user?.isActive ? 'Lock User Account' : 'Unlock User Account'}
                </DialogTitle>
                <DialogContent>
                    <p className={styles.dialogCopy}>
                        {confirmDialog.user?.isActive
                            ? <>This will mark <strong>{confirmDialog.user?.email}</strong> as <strong>Banned</strong>.</>
                            : <>This will restore <strong>{confirmDialog.user?.email}</strong> to <strong>Active</strong>.</>}
                    </p>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmDialog({ open: false, user: null })}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleToggleActive}
                        sx={{ background: confirmDialog.user?.isActive ? '#b45309' : '#166534', '&:hover': { background: confirmDialog.user?.isActive ? '#92400e' : '#14532d' } }}
                    >
                        {confirmDialog.user?.isActive ? 'Lock User' : 'Unlock User'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UsersManagement;
