import api from './api';

const logNutrition = async (logData) => {
  const response = await api.post('/nutrition', logData);
  return response.data;
};

const getDailyNutrition = async (date) => {
  const response = await api.get('/nutrition/daily', { params: { date } });
  return response.data.data;
};

const getWeeklyNutrition = async (endDate) => {
  const response = await api.get('/nutrition/weekly', { params: { endDate } });
  return response.data.data;
};

const deleteLog = async (id) => {
  const response = await api.delete(`/nutrition/${id}`);
  return response.data;
};

const updateGoal = async (dailyCalorieGoal) => {
  const response = await api.put('/nutrition/goal', { dailyCalorieGoal });
  return response.data.data;
};

export default {
  logNutrition,
  getDailyNutrition,
  getWeeklyNutrition,
  deleteLog,
  updateGoal,
};
