import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import { getMyBicycles } from '../../service/bicycleService';
import styles from './SellerDashboard.module.css';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bicycles, setBicycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalListings: 0,
        totalSold: 0,
        activeListings: 0
    });

    useEffect(() => {
        fetchBicycles();
    }, []);

    const fetchBicycles = async () => {
        try {
            setLoading(true);
            const data = await getMyBicycles();
            setBicycles(data);
            setStats({
                totalListings: data.length,
                totalSold: Math.floor(data.length * 0.3),
                activeListings: Math.floor(data.length * 0.7)
            });
        } catch (err) {
            console.error('Failed to load bicycles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bicycle?')) return;
        try {
            await bicycleService.deleteBicycle(id);
            fetchBicycles();
        } catch (err) {
            alert('Failed to delete bicycle');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box className={styles.header}>
                    <Box>
                        <Typography variant="h3" className={styles.title}>
                            SELLER DASHBOARD
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Welcome back, {user?.fullName || 'Seller'}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/sell')}
                        className={styles.addButton}
                    >
                        NEW LISTING
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} className={styles.statsGrid}>
                    <Grid item xs={12} md={4}>
                        <Paper className={styles.statCard}>
                            <Typography variant="overline" className={styles.statLabel}>
                                TOTAL LISTINGS
                            </Typography>
                            <Typography variant="h2" className={styles.statNumber}>
                                {stats.totalListings}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper className={styles.statCard}>
                            <Typography variant="overline" className={styles.statLabel}>
                                ACTIVE
                            </Typography>
                            <Typography variant="h2" className={styles.statNumber}>
                                {stats.activeListings}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper className={`${styles.statCard} ${styles.soldCard}`}>
                            <Typography variant="overline" className={styles.statLabel}>
                                SOLD
                            </Typography>
                            <Typography variant="h2" className={styles.statNumber}>
                                {stats.totalSold}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Listings Table */}
                <Paper className={styles.tableCard}>
                    <Typography variant="h5" className={styles.tableTitle}>
                        MY LISTINGS
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={styles.tableHeader}>BRAND</TableCell>
                                        <TableCell className={styles.tableHeader}>CATEGORY</TableCell>
                                        <TableCell className={styles.tableHeader}>SIZE</TableCell>
                                        <TableCell className={styles.tableHeader}>CONDITION</TableCell>
                                        <TableCell className={styles.tableHeader}>ACTIONS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bicycles.slice(0, 10).map((bike) => (
                                        <TableRow key={bike.bicycleId} className={styles.tableRow}>
                                            <TableCell className={styles.brandCell}>
                                                {bike.brand}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={bike.category?.name || 'N/A'}
                                                    size="small"
                                                    className={styles.categoryChip}
                                                />
                                            </TableCell>
                                            <TableCell>{bike.frameSize || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Box className={styles.conditionCell}>
                                                    {bike.conditionPercent || 85}%
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/bikes/${bike.bicycleId}`)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(bike.bicycleId)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container>
        </div>
    );
};

export default SellerDashboard;
