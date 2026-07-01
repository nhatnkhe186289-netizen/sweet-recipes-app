import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  if (response.data.success && response.data.data.token) {
    await AsyncStorage.setItem('token', response.data.data.token);
  }
  return response.data.data;
};

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.success && response.data.data.token) {
    await AsyncStorage.setItem('token', response.data.data.token);
  }
  return response.data.data;
};

const logout = async () => {
  await AsyncStorage.removeItem('token');
};

const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data.data;
};

const updateProfile = async (formData) => {
  const response = await api.put('/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

const forgotPassword = async (email, username, newPassword) => {
  const response = await api.post('/auth/forgot-password', { email, username, newPassword });
  return response.data;
};

const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

export default {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  changePassword,
};
