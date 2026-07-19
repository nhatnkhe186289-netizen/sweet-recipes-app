import api from './api';

const getShoppingList = async () => {
  const response = await api.get('/shopping-list');
  return response.data.data;
};

const addShoppingListItems = async (payload) => {
  // payload can be { name, amount, recipeTitle } or { items: [...], recipeTitle }
  const response = await api.post('/shopping-list', payload);
  return response.data.data;
};

const toggleBought = async (id) => {
  const response = await api.put(`/shopping-list/${id}/toggle`);
  return response.data.data;
};

const deleteShoppingListItem = async (id) => {
  const response = await api.delete(`/shopping-list/${id}`);
  return id;
};

const clearShoppingList = async () => {
  await api.delete('/shopping-list');
  return [];
};

export default {
  getShoppingList,
  addShoppingListItems,
  toggleBought,
  deleteShoppingListItem,
  clearShoppingList,
};
