import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/authSlice';

import { toast } from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: '/api',
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Show toast for error
    const message = error.response?.data?.message || error.message || 'An error occurred';
    if (error.response?.status !== 401 && error.config?.url !== '/auth/refresh') {
      toast.error(message);
    }

    if (error.response?.status === 401) {
      store.dispatch(logout());
      // Only redirect if not already on login or register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
