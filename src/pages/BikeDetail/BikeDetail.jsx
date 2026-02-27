import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    Chip,
    Button,
    LinearProgress,
    Divider,
    IconButton,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import bicycleService from '../../services/bicycleService';
import styles from './BikeDetail.module.css';

const BikeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBikeDetails();
    }, [id]);

    const fetchBikeDetails = async () => {
        try {
            setLoading(true);
            const bicycles = await bicycleService.getAllBicycles();
            const foundBike = bicycles.find(b => b.bicycleId === parseInt(id));

            if (foundBike) {
                setBike(foundBike);
            } else {
                setError('Bicycle not found');
            }
        } catch (err) {
            setError('Failed to load bicycle details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box className={styles.loadingContainer}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !bike) {
        return (
            <Container maxWidth="lg" className={styles.container}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Back
                </Button>
                <Typography variant="h5" color="error" sx={{ mt: 4 }}>
                    {error || 'Bicycle not found'}
                </Typography>
            </Container>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <Container maxWidth="lg" className={styles.container}>
                {/* Back Button */}
                <IconButton
                    onClick={() => navigate(-1)}
                    className={styles.backButton}
                >
                    <ArrowBackIcon />
                </IconButton>

                <Grid container spacing={4}>
                    {/* Left: Image */}
                    <Grid item xs={12} md={6}>
                        <Box className={styles.imageContainer}>
                            <img
                                src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"
                                alt={bike.brand}
                                className={styles.mainImage}
                            />
                            <Chip
                                icon={<VerifiedIcon />}
                                label="Verified Specs"
                                className={styles.verifiedBadge}
                            />
                        </Box>
                    </Grid>

                    {/* Right: Details */}
                    <Grid item xs={12} md={6}>
                        <Paper className={styles.detailsCard}>
                            <Typography variant="overline" className={styles.category}>
                                {bike.category?.name || 'Bicycle'}
                            </Typography>

                            <Typography variant="h3" className={styles.title}>
                                {bike.brand}
                            </Typography>

                            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                                {bike.frameMaterial} Frame • {bike.frameSize} Size
                            </Typography>

                            {/* Condition Bar */}
                            <Box className={styles.conditionBox}>
                                <Typography variant="subtitle2" className={styles.conditionLabel}>
                                    CONDITION
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={bike.conditionPercent || 85}
                                        className={styles.conditionBar}
                                    />
                                    <Typography variant="h6" fontWeight="bold">
                                        {bike.conditionPercent || 85}%
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Specs Grid */}
                            <Grid container spacing={2} className={styles.specsGrid}>
                                <Grid item xs={6}>
                                    <Typography variant="overline" color="text.secondary">
                                        BRAND
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {bike.brand}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="overline" color="text.secondary">
                                        FRAME MATERIAL
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {bike.frameMaterial || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="overline" color="text.secondary">
                                        FRAME SIZE
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {bike.frameSize || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="overline" color="text.secondary">
                                        GROUPSET
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {bike.groupset || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="overline" color="text.secondary">
                                        WHEEL SIZE
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {bike.wheelSize || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Action Buttons */}
                            <Box className={styles.actionButtons}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    className={styles.primaryButton}
                                >
                                    CONTACT SELLER
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    fullWidth
                                    className={styles.secondaryButton}
                                >
                                    ADD TO WISHLIST
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default BikeDetail;
