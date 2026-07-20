import api from './api';

const getMealPlans = async () => {
  const response = await api.get('/mealplans');
  return response.data.data;
};

const createMealPlan = async ({ recipeId, date, time }) => {
  const response = await api.post('/mealplans', { recipeId, date, time });
  return response.data.data;
};

const deleteMealPlan = async (id) => {
  const response = await api.delete(`/mealplans/${id}`);
  return response.data;
};

export default {
  getMealPlans,
  createMealPlan,
  deleteMealPlan,
};
