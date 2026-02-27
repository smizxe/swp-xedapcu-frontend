import api from './api';

const authService = {
    /**
     * Register a new user
     * @param {Object} data - { email, password, fullName, phone }
     * @returns {Promise<{ token, user }>}
     */
    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    /**
     * Login with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{ token, user }>}
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
};

export default authService;
