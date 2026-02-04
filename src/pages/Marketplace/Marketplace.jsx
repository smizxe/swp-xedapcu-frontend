import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Grid, Typography, TextField, InputAdornment,
    Button, MenuItem, Select, FormControl, InputLabel, Slider,
    CircularProgress, Chip, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import Header from '../../components/Header/Header';
import bicycleService from '../../services/bicycleService';
import categoryService from '../../services/categoryService';
import BikeCard from '../../components/BikeCard';

const styles = {
    pageContainer: {
        paddingTop: '80px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        paddingBottom: '40px',
    },
    gradientText: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: '800',
    }
};

const Marketplace = () => {
    const navigate = useNavigate();
    const [bicycles, setBicycles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100000000]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch both bicycles and categories in parallel
            const [bicyclesData, categoriesData] = await Promise.all([
                bicycleService.getAllBicycles(),
                categoryService.getAllCategories()
            ]);

            setBicycles(bicyclesData || []);
            setCategories(categoriesData || []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load bicycles. Please try again later.');
            setBicycles([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtered and sorted bicycles
    const filteredBicycles = useMemo(() => {
        let result = [...bicycles];

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(bike =>
                bike.brand?.toLowerCase().includes(term) ||
                bike.frameMaterial?.toLowerCase().includes(term) ||
                bike.groupset?.toLowerCase().includes(term)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            result = result.filter(bike =>
                bike.category?.categoryId === parseInt(selectedCategory) ||
                bike.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Price filter (if bicycles have price - otherwise skip)
        // Note: Current API returns bicycle info, not posts with prices
        // This filter will work when we have Post API

        // Sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-high':
                result.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'condition':
                result.sort((a, b) => (b.conditionPercent || 0) - (a.conditionPercent || 0));
                break;
            case 'newest':
            default:
                // Keep original order (newest first from API)
                break;
        }

        return result;
    }, [bicycles, searchTerm, selectedCategory, sortBy, priceRange]);

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const formatPrice = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value) + '₫';
    };

    return (
        <div style={styles.pageContainer}>
            <Header />

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Hero Section */}
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
                        Find Your <span style={styles.gradientText}>Perfect Ride</span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
                        Explore verified pre-owned bicycles from our trusted community.
                        Every bike is inspected for quality and safety.
                    </Typography>

                    {/* Search Box */}
                    <Box maxWidth="700px" mx="auto">
                        <TextField
                            fullWidth
                            placeholder="Search by brand, frame, or groupset..."
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '50px',
                                    bgcolor: 'white',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    '& fieldset': { borderColor: 'transparent' },
                                    '&:hover fieldset': { borderColor: '#e2e8f0' },
                                    '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#94a3b8' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Box>

                {/* Filters Bar */}
                <Box sx={{
                    bgcolor: 'white',
                    p: 3,
                    borderRadius: '24px',
                    mb: 4,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                    border: '1px solid #f1f5f9'
                }}>
                    <Grid container spacing={3} alignItems="center">
                        {/* Category Filter */}
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    label="Category"
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    sx={{ borderRadius: '12px' }}
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.categoryId} value={cat.categoryId}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Sort By */}
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Sort By"
                                    onChange={(e) => setSortBy(e.target.value)}
                                    sx={{ borderRadius: '12px' }}
                                    startAdornment={<SortIcon sx={{ mr: 1, color: '#94a3b8' }} />}
                                >
                                    <MenuItem value="newest">Newest First</MenuItem>
                                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                                    <MenuItem value="condition">Best Condition</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Results Count */}
                        <Grid item xs={12} md={6} textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                                Showing <strong>{filteredBicycles.length}</strong> bicycles
                                {searchTerm && <span> for "{searchTerm}"</span>}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Error State */}
                {error && (
                    <Box textAlign="center" py={4}>
                        <Typography color="error" mb={2}>{error}</Typography>
                        <Button variant="outlined" onClick={fetchData}>Try Again</Button>
                    </Box>
                )}

                {/* Loading State */}
                {loading && (
                    <Box display="flex" justifyContent="center" py={10}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Results Grid */}
                {!loading && !error && (
                    <Grid container spacing={3}>
                        {filteredBicycles.length === 0 ? (
                            <Box width="100%" textAlign="center" py={10}>
                                <Typography variant="h6" color="text.secondary">
                                    No bicycles found
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Try adjusting your search or filters
                                </Typography>
                            </Box>
                        ) : (
                            filteredBicycles.map((bike) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={bike.bicycleId}>
                                    <BikeCard
                                        post={{
                                            postId: bike.bicycleId,
                                            title: `${bike.brand} ${bike.frameMaterial || ''}`,
                                            price: 0, // No price in bicycle API yet
                                            isInspected: false,
                                            bicycle: bike,
                                            images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80']
                                        }}
                                    />
                                </Grid>
                            ))
                        )}
                    </Grid>
                )}
            </Container>
        </div>
    );
};

export default Marketplace;
