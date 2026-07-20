import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:5000/api`;
  }
  
  // Lấy IP nội bộ của máy tính thông qua Expo Constants để điện thoại có thể kết nối
  if (Constants?.expoConfig?.hostUri) {
    const ip = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  
  return 'http://192.168.1.11:5000/api'; // Fallback to current Wi-Fi IP
};

const API_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Bypass-Tunnel-Reminder': 'true', // Dùng cho localtunnel nếu bạn cần publish ra mạng ngoài
  },
});

// Attach Token to Requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
