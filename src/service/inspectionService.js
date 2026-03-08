import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Booking ─────────────────────────────────────────────
export const createInspectionBooking = async (data) => {
    const response = await api.post(API_ENDPOINTS.INSPECTIONS.CREATE_BOOKING, data);
    return response.data;
};

export const getAllBookings = async () => {
    const response = await api.get(API_ENDPOINTS.INSPECTIONS.GET_ALL_BOOKINGS);
    return response.data;
};

export const getMyBookings = async () => {
    const response = await api.get(API_ENDPOINTS.INSPECTIONS.GET_MY_BOOKINGS);
    return response.data;
};

export const assignInspector = async (bookingId, inspectorId) => {
    const response = await api.put(
        API_ENDPOINTS.INSPECTIONS.ASSIGN_INSPECTOR(bookingId),
        null,
        { params: { inspectorId } }
    );
    return response.data;
};

export const confirmBooking = async (bookingId) => {
    const response = await api.post(
        API_ENDPOINTS.INSPECTIONS.CONFIRM_BOOKING(bookingId)
    );
    return response.data;
};

// ── Inspection Requests ──────────────────────────────────
export const getMyRequests = async () => {
    const response = await api.get(API_ENDPOINTS.INSPECTIONS.GET_MY_REQUESTS);
    return response.data;
};

export const getPostInspectionHistory = async (postId) => {
    const response = await api.get(API_ENDPOINTS.INSPECTIONS.GET_POST_HISTORY(postId));
    return response.data;
};

// ── Reports ──────────────────────────────────────────────
export const submitReport = async (inspectionId, data) => {
    const response = await api.post(
        API_ENDPOINTS.INSPECTIONS.SUBMIT_REPORT(inspectionId),
        data
    );
    return response.data;
};

export const getReport = async (inspectionId) => {
    const response = await api.get(API_ENDPOINTS.INSPECTIONS.GET_REPORT(inspectionId));
    return response.data;
};

// ── Admin: get inspectors list ───────────────────────────
export const getAllUsers = async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN.GET_ALL_USERS);
    return response.data;
};
