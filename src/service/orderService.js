import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const DELIVERY_ADDRESS_CACHE_KEY = 'orderDeliveryAddressCache';

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const readDeliveryAddressCache = () => {
    try {
        return JSON.parse(localStorage.getItem(DELIVERY_ADDRESS_CACHE_KEY) || '{}');
    } catch {
        return {};
    }
};

const writeDeliveryAddressCache = (cache) => {
    localStorage.setItem(DELIVERY_ADDRESS_CACHE_KEY, JSON.stringify(cache));
};

export const saveOrderDeliveryAddress = (orderId, deliveryAddress) => {
    if (!orderId || !deliveryAddress?.trim()) return;
    const cache = readDeliveryAddressCache();
    cache[String(orderId)] = deliveryAddress.trim();
    writeDeliveryAddressCache(cache);
};

export const getSavedOrderDeliveryAddress = (orderId) => {
    if (!orderId) return '';
    const cache = readDeliveryAddressCache();
    return cache[String(orderId)] || '';
};

export const createDeposit = async (postId, deliveryAddress) => {
    // Note: Once the backend team updates the API to use @RequestBody DepositRequest,
    // the params: { postId } can be removed. Leaving it here for backward compatibility.
    const payload = {
        postId,
        deliveryAddress: deliveryAddress || ''
    };
    const response = await api.post(API_ENDPOINTS.ORDERS.DEPOSIT, payload, {
        params: { postId },
    });
    saveOrderDeliveryAddress(response.data?.orderId, deliveryAddress);
    return response.data;
};

export const cancelDeposit = async (orderId) => {
    const response = await api.delete(API_ENDPOINTS.ORDERS.CANCEL(orderId));
    return response.data;
};

export const cancelBySeller = async (orderId) => {
    const response = await api.delete(API_ENDPOINTS.ORDERS.SELLER_CANCEL(orderId));
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
    saveOrderDeliveryAddress(orderId, data?.deliveryAddress);
    return response.data;
};

export const completeOrder = async (orderId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.COMPLETE(orderId));
    return response.data;
};

export const reportBuyerNoShow = async (orderId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.REPORT_BUYER_NO_SHOW(orderId));
    return response.data;
};

export const reportSellerNoShow = async (orderId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.REPORT_SELLER_NO_SHOW(orderId));
    return response.data;
};
