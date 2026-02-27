import api from './api';

const categoryService = {
    /**
     * Get all categories
     * @returns {Promise<Array>} - List of categories
     */
    getAllCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
};

export default categoryService;
