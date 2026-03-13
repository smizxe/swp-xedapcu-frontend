import api from './api';

const adminService = {
    /**
     * Get all users (Admin only)
     * @returns {Promise<Array>} - List of users
     */
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        // Backend returns a Spring Page object: { content: [...], totalElements, ... }
        return Array.isArray(response.data) ? response.data : (response.data?.content || []);
    },

    /**
     * Get user by email (Admin only)
     * @param {string} email
     * @returns {Promise<Object>} - User data
     */
    getUserByEmail: async (email) => {
        const response = await api.get(`/admin/users/${email}`);
        return response.data;
    },

    /**
     * Update user role (Admin only)
     * @param {string} email
     * @param {string} newRole - e.g., 'BUYER', 'SELLER', 'ADMIN'
     * @returns {Promise<Object>}
     */
    updateUserRole: async (email, newRole) => {
        const response = await api.put(`/admin/users/${email}/role`, { role: newRole });
        return response.data;
    },

    /**
     * Delete user (Admin only)
     * @param {string} email
     * @returns {Promise<Object>}
     */
    deleteUser: async (email) => {
        const response = await api.delete(`/admin/users/${email}`);
        return response.data;
    },
};

export default adminService;
