import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Avatar, Grid, Chip, Button, Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'SELLER': return 'primary';
            case 'BUYER': return 'success';
            case 'INSPECTOR': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pt: '80px' }}>
            <Header />

            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    {/* Profile Header */}
                    <Box display="flex" alignItems="center" gap={3} mb={4}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: 'primary.main',
                                fontSize: '2.5rem'
                            }}
                        >
                            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </Avatar>
                        <Box flex={1}>
                            <Typography variant="h4" fontWeight="bold" color="#0f172a">
                                {user?.fullName || 'User'}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <Chip
                                    label={user?.role || 'BUYER'}
                                    color={getRoleColor(user?.role)}
                                    size="small"
                                />
                                {user?.isActive && (
                                    <Chip label="Active" color="success" variant="outlined" size="small" />
                                )}
                            </Box>
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Profile Info */}
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                        Account Information
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2} p={2} bgcolor="#f8fafc" borderRadius={2}>
                                <EmailIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography fontWeight="500">{user?.email || 'N/A'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2} p={2} bgcolor="#f8fafc" borderRadius={2}>
                                <PhoneIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                                    <Typography fontWeight="500">{user?.phone || 'Not provided'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2} p={2} bgcolor="#f8fafc" borderRadius={2}>
                                <StarIcon color="warning" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Rating</Typography>
                                    <Typography fontWeight="500">
                                        {user?.ratingScore ? `${user.ratingScore.toFixed(1)} / 5.0` : 'No ratings yet'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2} p={2} bgcolor="#f8fafc" borderRadius={2}>
                                <PersonIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Account Type</Typography>
                                    <Typography fontWeight="500">{user?.provider || 'Local'}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Box display="flex" gap={2} mt={4}>
                        <Button variant="contained" onClick={() => navigate('/home')}>
                            Browse Marketplace
                        </Button>
                        {user?.role === 'ADMIN' && (
                            <Button variant="outlined" onClick={() => navigate('/admin')}>
                                Admin Dashboard
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Profile;
