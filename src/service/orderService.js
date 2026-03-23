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

const getNormalizedDeliveryAddress = (order) => {
    if (!order) return '';
    return order.deliveryAddress || order.deliverySession?.location || '';
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

const normalizeOrder = (order) => {
    if (!order) return order;
    const normalizedDeliveryAddress = getNormalizedDeliveryAddress(order);
    if (normalizedDeliveryAddress) {
        saveOrderDeliveryAddress(order.orderId, normalizedDeliveryAddress);
    }

    return {
        ...order,
        deliveryAddress: normalizedDeliveryAddress,
    };
};

const normalizeOrders = (orders) => (Array.isArray(orders) ? orders.map(normalizeOrder) : []);

export const createDeposit = async (postId, deliveryAddress) => {
    const payload = {
        postId,
        deliveryAddress: deliveryAddress || ''
    };
    const response = await api.post(API_ENDPOINTS.ORDERS.DEPOSIT, payload);
    return normalizeOrder(response.data);
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
    return normalizeOrders(response.data);
};

export const getMySales = async () => {
    const response = await api.get(API_ENDPOINTS.ORDERS.MY_SALES);
    return normalizeOrders(response.data);
};

export const getMyDeliveryTasks = async () => {
    const response = await api.get(API_ENDPOINTS.ORDERS.MY_DELIVERY_TASKS);
    return normalizeOrders(response.data);
};

export const getOrderById = async (orderId) => {
    const response = await api.get(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId));
    return normalizeOrder(response.data);
};

export const scheduleDelivery = async (orderId, data) => {
    const response = await api.put(API_ENDPOINTS.ORDERS.SCHEDULE_DELIVERY(orderId), data);
    saveOrderDeliveryAddress(orderId, data?.deliveryAddress);
    return response.data;
};

export const sellerConfirmDelivery = async (orderId) => {
    const response = await api.put(API_ENDPOINTS.ORDERS.SELLER_CONFIRM_DELIVERY(orderId));
    return response.data;
};

export const adminAssignInspector = async (orderId, inspectorId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.ADMIN_ASSIGN_INSPECTOR(orderId, inspectorId));
    return response.data;
};

export const inspectorStartDelivery = async (orderId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.INSPECTOR_START_DELIVERY(orderId));
    return response.data;
};

export const inspectorMarkDelivered = async (orderId) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.INSPECTOR_MARK_DELIVERED(orderId));
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
