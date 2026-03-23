import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

const USER_ID_STORAGE_KEY = 'userId';
const USER_ID_OWNER_EMAIL_STORAGE_KEY = 'userIdOwnerEmail';

// Create axios instance
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginUser = async (email, password) => {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
            email,
            password,
        });

        const data = response.data;
        // Set token to localStorage
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', data.email);
            if (data.role) {
                localStorage.setItem('userRole', String(data.role));
            }
            if (data.userId != null) {
                localStorage.setItem(USER_ID_STORAGE_KEY, String(data.userId));
                localStorage.setItem(USER_ID_OWNER_EMAIL_STORAGE_KEY, data.email);
            } else {
                localStorage.removeItem(USER_ID_STORAGE_KEY);
                localStorage.removeItem(USER_ID_OWNER_EMAIL_STORAGE_KEY);
            }
        }

        return data;
    } catch (error) {
        throw new Error(error.response?.data || 'Login failed');
    }
};

// Register new user
export const registerUser = async (userData) => {
    try {
        console.log('🚀 Sending registration request:', {
            email: userData.email,
            password: '***',
            role: userData.role || 'BUYER'
        });

        const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
            email: userData.email,
            password: userData.password,
            role: userData.role || 'BUYER', // Default role is BUYER for new registrations
        });

        console.log('✅ Registration successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Registration error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            fullError: error
        });

        // Backend returns error message as plain string in response.data
        const errorMessage = typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.message || 'Registration failed';

        throw new Error(errorMessage);
    }
};

// Logout function
export const logoutUser = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem(USER_ID_STORAGE_KEY);
    localStorage.removeItem(USER_ID_OWNER_EMAIL_STORAGE_KEY);
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const email = localStorage.getItem('userEmail');
    const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);
    const userIdOwnerEmail = localStorage.getItem(USER_ID_OWNER_EMAIL_STORAGE_KEY);
    const resolvedUserId = storedUserId && email && userIdOwnerEmail === email
        ? storedUserId
        : null;

    return {
        token: localStorage.getItem('authToken'),
        email,
        role: localStorage.getItem('userRole'),
        userId: resolvedUserId,
    };
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};
