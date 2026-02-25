import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig.jsx';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Fetch all bicycles belonging to the currently authenticated user.
 */
export const getMyBicycles = async () => {
    const response = await api.get(API_ENDPOINTS.BICYCLES.MY_BICYCLES);
    return response.data;
};

/**
 * Create a new bicycle.
 * @param {Object} data - bicycle fields
 */
export const createBicycle = async (data) => {
    const response = await api.post(API_ENDPOINTS.BICYCLES.CREATE, data);
    return response.data;
};

/**
 * Get a bicycle by ID.
 */
export const getBicycleById = async (id) => {
    const response = await api.get(API_ENDPOINTS.BICYCLES.GET_BY_ID(id));
    return response.data;
};
