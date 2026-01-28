import React, { useState, useEffect } from 'react';
import {
    Box, Container, Grid, Typography, TextField, InputAdornment,
    Button, MenuItem, Select, FormControl, InputLabel, Slider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Header from '../../components/Header/Header';
import postService from '../../services/postService';
import BikeCard from '../../components/BikeCard';

// Using inline styles for quick iteration, but normally should be in CSS module
const styles = {
    pageContainer: {
        paddingTop: '80px', // Space for fixed header
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', // Light sophisticated bg
        paddingBottom: '40px',
    },
    filterSection: {
        background: 'white',
        padding: '24px 0',
        marginBottom: '32px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky',
        top: '70px',
        zIndex: 10,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
    },
    gradientText: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: '800',
    }
};

const Marketplace = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 50000000]);
    const [category, setCategory] = useState('all');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await postService.getAllPosts();
            setPosts(data.posts);
        } catch (error) {
            console.error("Failed to load marketplace data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    return (
        <div style={styles.pageContainer}>
            <Header />

            {/* Search & Intro Hero */}
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
                        Find Your <span style={styles.gradientText}>Perfect Ride</span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
                        Explore verified pre-owned bicycles from our trusted community.
                        Every bike is inspected for quality and safety.
                    </Typography>

                    <Box maxWidth="700px" mx="auto">
                        <TextField
                            fullWidth
                            placeholder="Search by bike name, brand, or model..."
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
                                endAdornment: (
                                    <Button
                                        variant="contained"
                                        sx={{
                                            borderRadius: '30px',
                                            background: 'black',
                                            textTransform: 'none',
                                            px: 3
                                        }}
                                    >
                                        Search
                                    </Button>
                                )
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
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={category}
                                    label="Category"
                                    onChange={(e) => setCategory(e.target.value)}
                                    sx={{ borderRadius: '12px' }}
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    <MenuItem value="road">Road Bike</MenuItem>
                                    <MenuItem value="mountain">Mountain Bike</MenuItem>
                                    <MenuItem value="touring">Touring</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Price Range: 0₫ - 50,000,000₫+
                            </Typography>
                            <Slider
                                value={priceRange}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100000000}
                                step={1000000}
                                sx={{ color: '#0ea5e9' }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4} textAlign="right">
                            <Button
                                startIcon={<FilterListIcon />}
                                variant="outlined"
                                sx={{
                                    borderRadius: '12px',
                                    borderColor: '#e2e8f0',
                                    color: '#64748b',
                                    '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                                }}
                            >
                                More Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Results Grid */}
                <Grid container spacing={3}>
                    {loading ? (
                        <Box width="100%" textAlign="center" py={10}>
                            <Typography>Loading bicycles...</Typography>
                        </Box>
                    ) : (
                        posts.map((post) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={post.postId}>
                                <BikeCard post={post} />
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </div>
    );
};

export default Marketplace;
