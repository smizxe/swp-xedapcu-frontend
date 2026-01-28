import React from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Chip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Styled Components for Glassmorphism & Modern Look
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
        '& .card-image': {
            transform: 'scale(1.05)',
        },
    },
}));

const CardImageContainer = styled(Box)({
    position: 'relative',
    height: '240px',
    overflow: 'hidden',
});

const StyledCardMedia = styled(CardMedia)({
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
});

const PriceTag = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px)',
    padding: '6px 14px',
    borderRadius: '12px',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 2,
}));

const VerifiedBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '16px',
    left: '16px',
    background: 'rgba(16, 185, 129, 0.9)', // Emerald green
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    zIndex: 2,
}));

const BikeCard = ({ post }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <StyledCard>
            <CardImageContainer>
                {post.isInspected && (
                    <VerifiedBadge>
                        <VerifiedUserIcon sx={{ fontSize: 14 }} /> Verified
                    </VerifiedBadge>
                )}
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(255,255,255,0.8)',
                        '&:hover': { background: 'white' },
                        zIndex: 2
                    }}
                >
                    <FavoriteBorderIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                </IconButton>

                <StyledCardMedia
                    component="img"
                    className="card-image"
                    image={post.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={post.title}
                />

                <PriceTag>
                    {formatPrice(post.price)}
                </PriceTag>
            </CardImageContainer>

            <CardContent sx={{ pb: 2, pt: 2 }}>
                {/* Category & Brand */}
                <Box display="flex" gap={1} mb={1}>
                    <Chip
                        label={post.bicycle.category.name}
                        size="small"
                        sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            bgcolor: 'rgba(14, 165, 233, 0.1)',
                            color: '#0284c7'
                        }}
                    />
                    <Chip
                        label={post.bicycle.brand}
                        size="small"
                        sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            bgcolor: 'rgba(241, 245, 249, 1)',
                            color: '#475569'
                        }}
                    />
                </Box>

                <Typography variant="h6" fontWeight="bold" noWrap sx={{ mb: 0.5, fontSize: '1.1rem', color: '#0f172a' }}>
                    {post.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
                    {post.bicycle.frameMaterial} • {post.bicycle.wheelSize} • Condition {post.bicycle.conditionPercent}%
                </Typography>

                {/* Footer info using Flexbox */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mt="auto">
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOnIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                        <Typography variant="caption" color="text.secondary">
                            Hà Nội
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {new Date().toLocaleDateString('vi-VN')}
                    </Typography>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

export default BikeCard;
