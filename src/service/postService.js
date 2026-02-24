import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

// Create axios instance with auth token interceptor
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getAllPosts = async (page = 0, size = 12) => {
    const response = await api.get(API_ENDPOINTS.POSTS.GET_ALL, {
        params: { page, size },
    });
    return response.data;
};

export const searchPosts = async (q, page = 0, size = 12) => {
    const response = await api.get(API_ENDPOINTS.POSTS.SEARCH, {
        params: { q, page, size },
    });
    return response.data;
};

export const getMyPosts = async () => {
    const response = await api.get(API_ENDPOINTS.POSTS.MY_POSTS);
    return response.data;
};

export const getPostById = async (id) => {
    const response = await api.get(API_ENDPOINTS.POSTS.GET_BY_ID(id));
    return response.data;
};

export const createPost = async (data) => {
    const response = await api.post(API_ENDPOINTS.POSTS.CREATE, data);
    return response.data;
};

export const updatePost = async (id, data) => {
    const response = await api.put(API_ENDPOINTS.POSTS.UPDATE(id), data);
    return response.data;
};

export const updatePostStatus = async (id, status) => {
    const response = await api.put(API_ENDPOINTS.POSTS.UPDATE_STATUS(id), null, {
        params: { status },
    });
    return response.data;
};

export const deletePost = async (id) => {
    const response = await api.delete(API_ENDPOINTS.POSTS.DELETE(id));
    return response.data;
};
