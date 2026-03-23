import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, Button } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import adminService from '../../../services/adminService';
import { RefreshCw } from 'lucide-react';
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

    useEffect(() => {
        if (authLoading || !isAdmin) return;
        fetchStats();
    }, [authLoading, isAdmin]);

    if (authLoading || (!isAdmin && !loading)) return null;

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
        </Box>
    );
};

export default AdminDashboard;
