import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const createDepositUrl = async (userId, amount) => {
    const response = await api.post(API_ENDPOINTS.PAYMENT.CREATE_DEPOSIT_URL, { amount }, {
        params: { userId },
    });
    return response.data;
};

export const checkVnPayReturn = async (params) => {
    const response = await api.get(API_ENDPOINTS.PAYMENT.VNPAY_RETURN, { params });
    return response.data;
};
