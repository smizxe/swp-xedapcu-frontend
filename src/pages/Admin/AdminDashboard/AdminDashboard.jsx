import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import adminService from '../../../services/adminService';
import { 
    Users, 
    ShoppingCart, 
    DollarSign, 
    TrendingUp,
    Store,
    UserCircle
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => (
    <div className={styles.glassCard}>
        <div className={styles.cardHeader}>
            <div className={styles.cardInfo}>
                <Typography className={styles.cardTitle}>{title}</Typography>
                <Typography className={styles.cardSubtitle}>{subtitle}</Typography>
            </div>
            <div className={styles.iconWrapper}>
                <Icon size={24} className={styles.cardIcon} />
            </div>
        </div>
        <div className={styles.cardBody}>
            <Typography className={styles.cardValue}>{value}</Typography>
            {trend && (
                <div className={`${styles.trend} ${trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                </div>
            )}
        </div>
    </div>
);

const AdminDashboard = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, authLoading]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data || []);
        } catch (err) {
            console.error('Failed to load stats', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (!isAdmin && !loading)) return null;

    // Calculate dummy stats for UI demonstration based on users if endpoints are missing
    const totalUsers = users.length;
    const sellers = users.filter(u => u.role === 'SELLER').length;
    const buyers = users.filter(u => u.role === 'BUYER').length;

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="#0f172a" fontFamily="inherit" style={{textTransform: 'uppercase', letterSpacing: '1px'}}>
                    Overview
                </Typography>
                <Typography variant="body1" color="#64748b" fontFamily="inherit">
                    System performance and statistics
                </Typography>
            </Box>

            <div className={styles.statsGrid}>
                {/* Simulated Revenue & Orders for UI */}
                <StatCard 
                    title="Total Revenue" 
                    subtitle="Last 30 days"
                    value="$82,650"
                    icon={DollarSign}
                    trend="up"
                    trendValue="15%"
                />
                <StatCard 
                    title="Total Order" 
                    subtitle="Last 30 days"
                    value="1,645"
                    icon={ShoppingCart}
                    trend="up"
                    trendValue="11%"
                />
                <StatCard 
                    title="Total Customer" 
                    subtitle="Last 30 days"
                    value="1,462"
                    icon={Users}
                    trend="up"
                    trendValue="12%"
                />
                <StatCard 
                    title="Total Register"
                    subtitle="Platform users"
                    value={totalUsers.toString()}
                    icon={UserCircle}
                />
                <StatCard 
                    title="Active Sellers"
                    subtitle="System sellers"
                    value={sellers.toString()}
                    icon={Store}
                />
                <StatCard 
                    title="Active Buyers"
                    subtitle="System buyers"
                    value={buyers.toString()}
                    icon={TrendingUp}
                />
            </div>
            
            {/* You can add more dashboard widgets here (e.g. Sales Analytic chart image from prompt) */}
            <div className={styles.chartPlaceholder}>
                <Typography variant="h5" fontWeight="bold" mb={2} color="#0f172a" fontFamily="inherit">
                    Sales Analytic
                </Typography>
                <div className={styles.glassCard} style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
                    <Typography fontFamily="inherit">Chart visualization placeholder</Typography>
                </div>
            </div>
        </Box>
    );
};

export default AdminDashboard;
