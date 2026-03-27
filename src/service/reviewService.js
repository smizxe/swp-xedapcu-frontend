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

export const createReview = async (orderId, payload) => {
    const response = await api.post(API_ENDPOINTS.REVIEWS.CREATE(orderId), payload);
    return response.data;
};

export const getReviewById = async (reviewId) => {
    const response = await api.get(API_ENDPOINTS.REVIEWS.GET_BY_ID(reviewId));
    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(API_ENDPOINTS.REVIEWS.DELETE(reviewId));
    return response.data;
};

export const getSellerReviews = async (sellerId, page = 0, size = 10) => {
    const response = await api.get(API_ENDPOINTS.REVIEWS.SELLER_REVIEWS(sellerId), {
        params: { page, size },
    });
    return response.data;
};

export const getSellerRatingSummary = async (sellerId) => {
    const response = await api.get(API_ENDPOINTS.REVIEWS.SELLER_RATING(sellerId));
    return response.data;
};
