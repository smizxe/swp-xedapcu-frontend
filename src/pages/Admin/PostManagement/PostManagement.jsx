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
import { Ban, CheckCircle2, Edit2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import adminService from '../../../services/adminService';
import styles from './PostManagement.module.css';

const POST_STATUS_OPTIONS = ['ALL', 'PENDING', 'ACTIVE', 'APPROVED', 'RESERVED', 'SOLD', 'HIDDEN', 'REJECTED', 'CANCELLED', 'EXPIRED'];

const normalizePostStatus = (status) => String(status || '').toUpperCase();

const STATUS_BADGE_CLASS = {
    PENDING: 'statusPending',
    ACTIVE: 'statusActive',
    APPROVED: 'statusApproved',
    RESERVED: 'statusReserved',
    SOLD: 'statusSold',
    HIDDEN: 'statusHidden',
    REJECTED: 'statusRejected',
    CANCELLED: 'statusCancelled',
    EXPIRED: 'statusExpired',
};

const formatCurrency = (value) => {
    if (value == null) {
        return '-';
    }
    return Number(value).toLocaleString('vi-VN');
};

const PostManagement = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [statusDialog, setStatusDialog] = useState({ open: false, post: null });
    const [selectedStatus, setSelectedStatus] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const data = await adminService.getPostStats();
            setStats(data);
        } catch {
            setStats(null);
        }
    }, []);

    const fetchPosts = useCallback(async ({ nextKeyword = '', nextStatus = 'ALL' } = {}) => {
        try {
            setLoading(true);
            setError('');

            let data = [];
            if (nextKeyword.trim()) {
                data = await adminService.searchPosts(nextKeyword.trim());
            } else if (nextStatus !== 'ALL') {
                data = await adminService.getPostsByStatus(nextStatus);
            } else {
                data = await adminService.getAllPosts();
            }

            setPosts(data || []);
        } catch (err) {
            setError(err?.response?.data || 'Failed to load posts.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading || !isAdmin) {
            return;
        }
        fetchPosts();
        fetchStats();
    }, [authLoading, fetchPosts, fetchStats, isAdmin]);

    useEffect(() => {
        if (authLoading || !isAdmin) {
            return;
        }
        if (statusFilter === 'ALL' && !keyword.trim()) {
            fetchPosts();
            return;
        }
        if (!keyword.trim()) {
            fetchPosts({ nextStatus: statusFilter });
        }
    }, [authLoading, fetchPosts, isAdmin, keyword, statusFilter]);

    const handleSearch = () => {
        fetchPosts({ nextKeyword: keyword, nextStatus: statusFilter });
    };

    const handleSaveStatus = async () => {
        try {
            setLoading(true);
            await adminService.updatePostStatus(statusDialog.post.postId, selectedStatus);
            setSuccess(`Updated post #${statusDialog.post.postId} to ${selectedStatus}`);
            setStatusDialog({ open: false, post: null });
            await Promise.all([
                fetchPosts({ nextKeyword: keyword, nextStatus: statusFilter }),
                fetchStats(),
            ]);
        } catch (err) {
            setError(err?.response?.data || 'Failed to update post status.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm(`Delete post #${postId}?`)) {
            return;
        }

        try {
            setLoading(true);
            await adminService.deletePost(postId);
            setSuccess(`Deleted post #${postId}`);
            await Promise.all([
                fetchPosts({ nextKeyword: keyword, nextStatus: statusFilter }),
                fetchStats(),
            ]);
        } catch (err) {
            setError(err?.response?.data || 'Failed to delete post.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async (post) => {
        try {
            setLoading(true);
            const status = normalizePostStatus(post.status);
            if (status === 'ACTIVE' || status === 'APPROVED') {
                await adminService.disablePost(post.postId);
                setSuccess(`Disabled post #${post.postId}`);
            } else {
                await adminService.enablePost(post.postId);
                setSuccess(`Enabled post #${post.postId}`);
            }
            await Promise.all([
                fetchPosts({ nextKeyword: keyword, nextStatus: statusFilter }),
                fetchStats(),
            ]);
        } catch (err) {
            setError(err?.response?.data || 'Failed to toggle post status.');
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
                    <h1 className={styles.title}>Post Management</h1>
                    <p className={styles.subtitle}>Search, filter, moderate, enable or remove marketplace posts.</p>
                </div>
                <Button
                    startIcon={<RefreshCw size={16} />}
                    variant="outlined"
                    onClick={() => {
                        fetchPosts({ nextKeyword: keyword, nextStatus: statusFilter });
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
                    <div className={styles.statCard}><span className={styles.statLabel}>Total Posts</span><strong className={styles.statValue}>{stats.totalPosts ?? 0}</strong></div>
                    <div className={styles.statCard}><span className={styles.statLabel}>Pending</span><strong className={styles.statValue}>{stats.pending ?? 0}</strong></div>
                    <div className={styles.statCard}><span className={styles.statLabel}>Active</span><strong className={styles.statValue}>{stats.active ?? stats.approved ?? 0}</strong></div>
                    <div className={styles.statCard}><span className={styles.statLabel}>Sold</span><strong className={styles.statValue}>{stats.sold ?? 0}</strong></div>
                </div>
            )}

            <div className={styles.filters}>
                <TextField
                    size="small"
                    placeholder="Search by post title"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className={styles.searchInput}
                />
                <Select
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    {POST_STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
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
                                <th>ID</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th className={styles.actionsHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>Loading posts...</td>
                                </tr>
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>No posts found</td>
                                </tr>
                            ) : posts.map((post) => {
                                const status = normalizePostStatus(post.status);
                                const isActive = status === 'ACTIVE' || status === 'APPROVED';

                                return (
                                    <tr key={post.postId}>
                                        <td className={styles.idCell}>{post.postId}</td>
                                        <td className={styles.titleCell}>{post.title || '-'}</td>
                                        <td>{formatCurrency(post.price)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[STATUS_BADGE_CLASS[status] || 'statusDefault']}`}>
                                                {status || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionGroup}>
                                                <Tooltip title="Edit Post Status">
                                                    <button
                                                        type="button"
                                                        className={`${styles.iconButton} ${styles.iconEdit}`}
                                                        onClick={() => {
                                                            setStatusDialog({ open: true, post });
                                                            setSelectedStatus(status);
                                                        }}
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title={isActive ? 'Disable Post' : 'Enable Post'}>
                                                    <button
                                                        type="button"
                                                        className={`${styles.iconButton} ${isActive ? styles.iconDisable : styles.iconEnable}`}
                                                        onClick={() => handleToggleAvailability(post)}
                                                    >
                                                        {isActive ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                                                    </button>
                                                </Tooltip>
                                                <Tooltip title="Delete Post">
                                                    <button
                                                        type="button"
                                                        className={`${styles.iconButton} ${styles.iconDelete}`}
                                                        onClick={() => handleDelete(post.postId)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
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

            <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, post: null })}>
                <DialogTitle sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.04em' }}>Edit Post Status</DialogTitle>
                <DialogContent sx={{ minWidth: 340, pt: 2 }}>
                    <p className={styles.dialogCopy}>Update status for <strong>{statusDialog.post?.title || `#${statusDialog.post?.postId}`}</strong>.</p>
                    <Select
                        fullWidth
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        sx={{ fontFamily: 'var(--font-body)' }}
                    >
                        {POST_STATUS_OPTIONS.filter((status) => status !== 'ALL').map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setStatusDialog({ open: false, post: null })}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveStatus} sx={{ background: '#2d5a27', '&:hover': { background: '#1f431c' } }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default PostManagement;
