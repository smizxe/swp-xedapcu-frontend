import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

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
};

// Get current user from localStorage
export const getCurrentUser = () => {
    return {
        token: localStorage.getItem('authToken'),
        email: localStorage.getItem('userEmail'),
    };
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};