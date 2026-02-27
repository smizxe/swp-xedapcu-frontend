import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

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

export const getAllCategories = async () => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
    return response.data;
};

export const createCategory = async (data) => {
    const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return response.data;
};
