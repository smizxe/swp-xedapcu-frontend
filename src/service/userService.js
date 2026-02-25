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

export const getMyProfile = async () => {
    const response = await api.get(API_ENDPOINTS.USERS.ME);
    return response.data;
};

export const updateMyProfile = async (data) => {
    const response = await api.put(API_ENDPOINTS.USERS.ME, data);
    return response.data;
};

export const getUserByEmail = async (email) => {
    const response = await api.get(API_ENDPOINTS.USERS.GET_BY_EMAIL(email));
    return response.data;
};
