import api from './api';

// Users Management
const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data.data;
};

const updateUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data.data;
};

const updateUserStatus = async (userId, status) => {
  const response = await api.put(`/admin/users/${userId}/status`, { status });
  return response.data.data;
};

const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Recipes Moderation
const getRecipes = async () => {
  const response = await api.get('/admin/recipes');
  return response.data.data;
};

const updateRecipeStatus = async (recipeId, status) => {
  const response = await api.put(`/admin/recipes/${recipeId}/status`, { status });
  return response.data.data;
};

export default {
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getRecipes,
  updateRecipeStatus,
};
