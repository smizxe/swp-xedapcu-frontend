import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Paper,
    Grid,
    Slider,
    Alert,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';
import bicycleService from '../../services/bicycleService';
import categoryService from '../../services/categoryService';
import styles from './SellBike.module.css';

const frameMaterials = ['Carbon', 'Aluminum', 'Steel', 'Titanium', 'Chromoly'];
const frameSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const wheelSizes = ['700c', '650b', '29"', '27.5"', '26"'];

const SellBike = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        brand: '',
        frameMaterial: '',
        frameSize: '',
        groupset: '',
        wheelSize: '',
        conditionPercent: 80,
        categoryId: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSliderChange = (event, newValue) => {
        setFormData(prev => ({ ...prev, conditionPercent: newValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await bicycleService.createBicycle(formData);
            setSuccess('Bicycle created successfully! Redirecting...');
            setTimeout(() => navigate('/home'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create bicycle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Container maxWidth="md" className={styles.container}>
                {/* Header */}
                <Box className={styles.header}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        className={styles.backButton}
                    >
                        Back
                    </Button>
                    <Typography variant="h3" className={styles.title}>
                        SELL YOUR BIKE
                    </Typography>
                    <Typography variant="body1" color="text.secondary" className={styles.subtitle}>
                        List your bicycle on the marketplace
                    </Typography>
                </Box>

                {/* Form */}
                <Paper className={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                        <Grid container spacing={3}>
                            {/* Brand */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Brand"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Giant, Trek, Specialized"
                                    className={styles.input}
                                />
                            </Grid>

                            {/* Category */}
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        label="Category"
                                    >
                                        {categories.map(cat => (
                                            <MenuItem key={cat.categoryId} value={cat.categoryId}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Frame Material */}
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Frame Material</InputLabel>
                                    <Select
                                        name="frameMaterial"
                                        value={formData.frameMaterial}
                                        onChange={handleChange}
                                        label="Frame Material"
                                    >
                                        {frameMaterials.map(mat => (
                                            <MenuItem key={mat} value={mat}>{mat}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Frame Size */}
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Frame Size</InputLabel>
                                    <Select
                                        name="frameSize"
                                        value={formData.frameSize}
                                        onChange={handleChange}
                                        label="Frame Size"
                                    >
                                        {frameSizes.map(size => (
                                            <MenuItem key={size} value={size}>{size}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Groupset */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Groupset"
                                    name="groupset"
                                    value={formData.groupset}
                                    onChange={handleChange}
                                    placeholder="e.g., Shimano 105, SRAM Rival"
                                />
                            </Grid>

                            {/* Wheel Size */}
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Wheel Size</InputLabel>
                                    <Select
                                        name="wheelSize"
                                        value={formData.wheelSize}
                                        onChange={handleChange}
                                        label="Wheel Size"
                                    >
                                        {wheelSizes.map(size => (
                                            <MenuItem key={size} value={size}>{size}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Condition */}
                            <Grid item xs={12}>
                                <Box className={styles.sliderBox}>
                                    <Typography variant="subtitle2" className={styles.sliderLabel}>
                                        CONDITION: {formData.conditionPercent}%
                                    </Typography>
                                    <Slider
                                        value={formData.conditionPercent}
                                        onChange={handleSliderChange}
                                        min={0}
                                        max={100}
                                        valueLabelDisplay="auto"
                                        className={styles.slider}
                                    />
                                </Box>
                            </Grid>

                            {/* Submit */}
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    className={styles.submitButton}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'CREATE LISTING'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </div>
    );
};

export default SellBike;
