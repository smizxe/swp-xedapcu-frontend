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

export const createDeposit = async (postId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.DEPOSIT, null, {
        params: { postId },
    });
    return response.data;
};

export const cancelDeposit = async (orderId) => {
    const response = await api.delete(API_ENDPOINTS.ORDERS.CANCEL(orderId));
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get(API_ENDPOINTS.ORDERS.MY_ORDERS);
    return response.data;
};

export const getMySales = async () => {
    const response = await api.get(API_ENDPOINTS.ORDERS.MY_SALES);
    return response.data;
};

export const getOrderById = async (orderId) => {
    const response = await api.get(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId));
    return response.data;
};

export const scheduleDelivery = async (orderId, data) => {
    const response = await api.put(API_ENDPOINTS.ORDERS.SCHEDULE_DELIVERY(orderId), data);
    return response.data;
};

export const completeOrder = async (orderId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.COMPLETE(orderId));
    return response.data;
};
