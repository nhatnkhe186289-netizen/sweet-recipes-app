import api from './api';

const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data.data;
};

const addFavorite = async (recipeId) => {
  const response = await api.post('/favorites', { recipeId });
  return response.data.data;
};

const removeFavorite = async (recipeId) => {
  const response = await api.delete(`/favorites/${recipeId}`);
  return response.data;
};

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
};
