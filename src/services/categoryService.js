import api from './api';

const normalizeCategory = (category) => {
    if (!category) {
        return category;
    }

    return {
        ...category,
        id: category.id ?? category.categoryId ?? category.category_id,
        categoryId: category.categoryId ?? category.id ?? category.category_id,
        categoryName: category.categoryName ?? category.name ?? '',
        name: category.name ?? category.categoryName ?? '',
    };
};

const categoryService = {
    getAllCategories: async () => {
        const response = await api.get('/categories');
        return Array.isArray(response.data) ? response.data.map(normalizeCategory) : [];
    },

    createCategory: async (data) => {
        const response = await api.post('/categories', data);
        return normalizeCategory(response.data?.category || response.data);
    },

    deleteCategory: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
};

export default categoryService;
