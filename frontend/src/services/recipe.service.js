import api from './api';

const getRecipes = async (params = {}) => {
  const response = await api.get('/recipes', { params });
  return response.data.data;
};

const getRecipeById = async (id) => {
  const response = await api.get(`/recipes/${id}`);
  return response.data.data;
};

const createRecipe = async (formData) => {
  const response = await api.post('/recipes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

const updateRecipe = async (id, formData) => {
  const response = await api.put(`/recipes/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

const deleteRecipe = async (id) => {
  const response = await api.delete(`/recipes/${id}`);
  return response.data;
};

const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data.data;
};

export default {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getCategories,
};
