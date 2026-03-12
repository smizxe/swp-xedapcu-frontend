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

export const getBalance = async (userId) => {
    const response = await api.get(API_ENDPOINTS.WALLET.BALANCE, {
        params: { userId },
    });
    return response.data;
};

export const withdraw = async (userId, amount, bankAccount) => {
    const response = await api.post(API_ENDPOINTS.WALLET.WITHDRAW, { amount, bankAccount }, {
        params: { userId },
    });
    return response.data;
};

export const getTransactions = async (userId, page = 0, size = 20) => {
    const response = await api.get(API_ENDPOINTS.WALLET.TRANSACTIONS, {
        params: { userId, page, size },
    });
    return response.data;
};
