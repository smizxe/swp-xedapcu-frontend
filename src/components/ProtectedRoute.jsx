import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRoute component
 * Protects routes that require authentication or specific roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string} [props.requiredRole] - Optional role required (e.g., 'ADMIN', 'SELLER')
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check (if required)
    if (requiredRole) {
        const hasRole = user?.role === requiredRole || user?.role === 'ADMIN'; // Admin has access to everything
        if (!hasRole) {
            return <Navigate to="/home" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
