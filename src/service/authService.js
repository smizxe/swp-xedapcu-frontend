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