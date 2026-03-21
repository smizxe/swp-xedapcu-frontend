import api from './api';

const unwrapPage = (data) => (Array.isArray(data) ? data : (data?.content || []));
const unwrapPayloadList = (data, key) => {
    if (Array.isArray(data)) {
        return data;
    }
    return Array.isArray(data?.[key]) ? data[key] : [];
};

const adminService = {
    getAllUsers: async (page = 0, size = 50) => {
        const response = await api.get('/admin/users', { params: { page, size } });
        return unwrapPage(response.data);
    },

    searchUsers: async (keyword) => {
        const response = await api.get('/admin/users/search', { params: { keyword } });
        return unwrapPayloadList(response.data, 'results');
    },

    getUsersByRole: async (role) => {
        const response = await api.get(`/admin/users/role/${role}`);
        return unwrapPayloadList(response.data, 'users');
    },

    getUserStats: async () => {
        const response = await api.get('/admin/users/stats');
        return response.data;
    },

    getUserByEmail: async (email) => {
        const response = await api.get(`/admin/users/${email}`);
        return response.data;
    },

    updateUserRole: async (email, newRole) => {
        const response = await api.put(`/admin/users/${email}/role`, { role: newRole });
        return response.data;
    },

    disableUser: async (email) => {
        const response = await api.put(`/admin/users/${email}/disable`);
        return response.data;
    },

    enableUser: async (email) => {
        const response = await api.put(`/admin/users/${email}/enable`);
        return response.data;
    },

    updateUserInfo: async (email, updates) => {
        const response = await api.put(`/admin/users/${email}`, updates);
        return response.data;
    },

    deleteUser: async (email) => {
        const response = await api.delete(`/admin/users/${email}`);
        return response.data;
    },

    getAllPosts: async (page = 0, size = 50) => {
        const response = await api.get('/admin/posts', { params: { page, size } });
        return unwrapPage(response.data);
    },

    searchPosts: async (keyword, page = 0, size = 50) => {
        const response = await api.get('/admin/posts/search', { params: { keyword, page, size } });
        return unwrapPayloadList(response.data, 'posts');
    },

    getPostsByStatus: async (status, page = 0, size = 50) => {
        const response = await api.get(`/admin/posts/status/${status}`, { params: { page, size } });
        return unwrapPayloadList(response.data, 'posts');
    },

    getPostStats: async () => {
        const response = await api.get('/admin/posts/stats');
        return response.data;
    },

    getPostById: async (postId) => {
        const response = await api.get(`/admin/posts/${postId}`);
        return response.data;
    },

    updatePostStatus: async (postId, status) => {
        const response = await api.put(`/admin/posts/${postId}/status`, null, { params: { status } });
        return response.data;
    },

    disablePost: async (postId) => {
        const response = await api.put(`/admin/posts/${postId}/disable`);
        return response.data;
    },

    enablePost: async (postId) => {
        const response = await api.put(`/admin/posts/${postId}/enable`);
        return response.data;
    },

    deletePost: async (postId) => {
        const response = await api.delete(`/admin/posts/${postId}`);
        return response.data;
    },
};

export default adminService;
