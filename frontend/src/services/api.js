import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

<<<<<<< HEAD
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:5000/api`;
  }
  return 'http://10.0.2.2:5000/api'; // Android emulator default
};

const API_URL = getBaseUrl();
=======
// Replace with your local backend server IP address if testing on real device: e.g., 'http://192.168.1.100:5000/api'
const API_URL = 'http://192.168.100.224:5000/api';
>>>>>>> 76f9c8eb914945604796a85e8d2d83584eff33dc

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
