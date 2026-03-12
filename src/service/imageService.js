import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const uploadImage = async (postId, file, isThumbnail = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isThumbnail', isThumbnail);
    const response = await api.post(API_ENDPOINTS.IMAGES.UPLOAD(postId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getPostImages = async (postId) => {
    const response = await api.get(API_ENDPOINTS.IMAGES.GET_ALL(postId));
    return response.data;
};

export const getThumbnail = async (postId) => {
    const response = await api.get(API_ENDPOINTS.IMAGES.THUMBNAIL(postId));
    return response.data;
};

export const setThumbnail = async (postId, imageId) => {
    const response = await api.put(API_ENDPOINTS.IMAGES.SET_THUMBNAIL(postId, imageId));
    return response.data;
};

export const deleteImage = async (postId, imageId) => {
    const response = await api.delete(API_ENDPOINTS.IMAGES.DELETE(postId, imageId));
    return response.data;
};

export const deleteAllImages = async (postId) => {
    const response = await api.delete(API_ENDPOINTS.IMAGES.DELETE_ALL(postId));
    return response.data;
};
