import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, Button, TextField, MenuItem } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import adminService from '../../../services/adminService';
import { getOrderById, adminAssignInspector } from '../../../service/orderService';
import {
    RefreshCw,
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

const StatCard = ({ title, value, subtitle }) => (
    <div className={styles.glassCard}>
        <div className={styles.cardHeader}>
            <div className={styles.cardInfo}>
                <Typography className={styles.cardTitle}>{title}</Typography>
                <Typography className={styles.cardSubtitle}>{subtitle}</Typography>
            </div>
        </div>
        <div className={styles.cardBody}>
            <Typography className={styles.cardValue}>{value}</Typography>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inspectors, setInspectors] = useState([]);
    const [deliveryOrderId, setDeliveryOrderId] = useState('');
    const [deliveryOrder, setDeliveryOrder] = useState(null);
    const [selectedInspectorId, setSelectedInspectorId] = useState('');
    const [deliveryLoading, setDeliveryLoading] = useState(false);
    const [deliveryError, setDeliveryError] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError('');
            const [userStats, postStats] = await Promise.all([
                adminService.getUserStats(),
                adminService.getPostStats(),
            ]);

            setStats({
                users: userStats,
                posts: postStats,
            });
        } catch (err) {
            setError(err?.response?.data || 'Failed to load admin statistics.');
        } finally {
            setLoading(false);
        }
    };

    const fetchInspectors = async () => {
        try {
            const users = await adminService.getAllUsers();
            const list = Array.isArray(users) ? users : [];
            setInspectors(list.filter((item) => String(item.role).includes('INSPECTOR')));
        } catch {
            setInspectors([]);
        }
    };

    useEffect(() => {
        if (authLoading || !isAdmin) {
            return;
        }
        fetchStats();
        fetchInspectors();
    }, [authLoading, isAdmin]);

    const handleLookupDelivery = async () => {
        if (!deliveryOrderId.trim()) {
            setDeliveryError('Enter an order ID first.');
            return;
        }
        try {
            setDeliveryLoading(true);
            setDeliveryError('');
            setSelectedInspectorId('');
            const order = await getOrderById(deliveryOrderId.trim());
            setDeliveryOrder(order);
        } catch (err) {
            setDeliveryOrder(null);
            setDeliveryError(err?.response?.data || 'Failed to load order details.');
        } finally {
            setDeliveryLoading(false);
        }
    };

    const handleAssignInspector = async () => {
        if (!deliveryOrder?.orderId || !selectedInspectorId) {
            setDeliveryError('Select an inspector before assigning.');
            return;
        }
        try {
            setAssignLoading(true);
            setDeliveryError('');
            const updated = await adminAssignInspector(deliveryOrder.orderId, selectedInspectorId);
            setDeliveryOrder(updated);
        } catch (err) {
            setDeliveryError(err?.response?.data || 'Failed to assign inspector.');
        } finally {
            setAssignLoading(false);
        }
    };

    if (authLoading || (!isAdmin && !loading)) {
        return null;
    }

    const userStats = stats?.users || {};
    const postStats = stats?.posts || {};

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#0f172a" fontFamily="inherit" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Overview
                    </Typography>
                    <Typography variant="body1" color="#64748b" fontFamily="inherit">
                        Real-time admin stats from the backend
                    </Typography>
                </Box>
                <Button
                    startIcon={<RefreshCw size={16} />}
                    variant="outlined"
                    onClick={fetchStats}
                    disabled={loading}
                    sx={{ color: '#064E3B', borderColor: '#064E3B', fontFamily: 'inherit', fontWeight: 'bold' }}
                >
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <div className={styles.statsGrid}>
                <StatCard title="Total Users" subtitle="All accounts" value={userStats.totalUsers ?? '-'} />
                <StatCard title="Admins" subtitle="Admin accounts" value={userStats.admins ?? '-'} />
                <StatCard title="Sellers" subtitle="Seller accounts" value={userStats.sellers ?? '-'} />
                <StatCard title="Posts" subtitle="All marketplace posts" value={postStats.totalPosts ?? '-'} />
                <StatCard title="Pending Posts" subtitle="Awaiting action" value={postStats.pending ?? '-'} />
                <StatCard title="Active Users" subtitle="Enabled accounts" value={userStats.activeUsers ?? '-'} />
            </div>

            <div className={styles.chartPlaceholder}>
                <Typography variant="h5" fontWeight="bold" mb={2} color="#0f172a" fontFamily="inherit">
                    Moderation Snapshot
                </Typography>
                <div className={styles.glassCard} style={{ display: 'grid', gap: 16 }}>
                    <Typography fontFamily="inherit">Disabled users: <strong>{userStats.disabledUsers ?? '-'}</strong></Typography>
                    <Typography fontFamily="inherit">Active posts: <strong>{postStats.active ?? '-'}</strong></Typography>
                    <Typography fontFamily="inherit">Reserved posts: <strong>{postStats.reserved ?? '-'}</strong></Typography>
                    <Typography fontFamily="inherit">Sold posts: <strong>{postStats.sold ?? '-'}</strong></Typography>
                    <Typography fontFamily="inherit">Cancelled posts: <strong>{postStats.cancelled ?? '-'}</strong></Typography>
                </div>
            </div>

            <div className={styles.chartPlaceholder}>
                <Typography variant="h5" fontWeight="bold" mb={2} color="#0f172a" fontFamily="inherit">
                    Delivery Inspector Assignment
                </Typography>
                <div className={styles.glassCard}>
                    <Typography className={styles.helperText}>
                        Backend chưa có API list toàn bộ delivery orders cho admin, nên hiện tại admin xử lý assignment bằng cách nhập `orderId`.
                    </Typography>
                    <div className={styles.lookupRow}>
                        <TextField
                            label="Order ID"
                            value={deliveryOrderId}
                            onChange={(e) => setDeliveryOrderId(e.target.value)}
                            size="small"
                            className={styles.lookupField}
                        />
                        <Button
                            variant="contained"
                            onClick={handleLookupDelivery}
                            disabled={deliveryLoading}
                            sx={{ backgroundColor: '#064E3B', '&:hover': { backgroundColor: '#053b2d' } }}
                        >
                            {deliveryLoading ? 'Loading...' : 'Lookup Order'}
                        </Button>
                    </div>

                    {deliveryError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {deliveryError}
                        </Alert>
                    )}

                    {deliveryOrder && (
                        <div className={styles.deliveryCard}>
                            <Typography className={styles.deliveryTitle}>
                                Order #{deliveryOrder.orderId} · {deliveryOrder.postTitle || deliveryOrder.post?.title || 'Untitled'}
                            </Typography>
                            <Typography className={styles.deliveryMeta}>
                                Status: <strong>{deliveryOrder.status}</strong>
                            </Typography>
                            {deliveryOrder.deliveryAddress && (
                                <Typography className={styles.deliveryMeta}>
                                    Delivery address: <strong>{deliveryOrder.deliveryAddress}</strong>
                                </Typography>
                            )}
                            {deliveryOrder.assignedInspector && (
                                <Typography className={styles.deliveryMeta}>
                                    Assigned inspector: <strong>{deliveryOrder.assignedInspector.fullName || deliveryOrder.assignedInspector.email}</strong>
                                </Typography>
                            )}
                            {['PENDING_SELLER_CONFIRMATION', 'PENDING_ADMIN_REVIEW'].includes(deliveryOrder.status) && (
                                <div className={styles.lookupRow}>
                                    <TextField
                                        select
                                        label="Inspector"
                                        size="small"
                                        value={selectedInspectorId}
                                        onChange={(e) => setSelectedInspectorId(e.target.value)}
                                        className={styles.lookupField}
                                    >
                                        {inspectors.map((item) => (
                                            <MenuItem key={item.userId || item.email} value={item.userId}>
                                                {item.fullName || item.email} ({item.email})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <Button
                                        variant="contained"
                                        onClick={handleAssignInspector}
                                        disabled={assignLoading || !selectedInspectorId}
                                        sx={{ backgroundColor: '#10B981', '&:hover': { backgroundColor: '#0f9f70' } }}
                                    >
                                        {assignLoading ? 'Assigning...' : 'Assign Inspector'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Box>
    );
};

export default AdminDashboard;
