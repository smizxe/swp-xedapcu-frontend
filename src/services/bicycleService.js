import api from './api';

const bicycleService = {
    /**
     * Get all bicycles
     * @returns {Promise<Array>} - List of bicycles
     */
    getAllBicycles: async () => {
        const response = await api.get('/bicycles');
        return response.data;
    },

    /**
     * Create a new bicycle (Seller/Admin)
     * @param {Object} data - Bicycle data
     * @returns {Promise<Object>}
     */
    createBicycle: async (data) => {
        const response = await api.post('/bicycles', data);
        return response.data;
    },

    /**
     * Delete a bicycle (Seller/Admin)
     * @param {number} id
     * @returns {Promise<Object>}
     */
    deleteBicycle: async (id) => {
        const response = await api.delete(`/bicycles/${id}`);
        return response.data;
    },
};

export default bicycleService;
