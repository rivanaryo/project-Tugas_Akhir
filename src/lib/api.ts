import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { authStorage } from '../features/auth/services/authStorage';

const api = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof config.url === 'string' && config.url.startsWith('/api/')) {
    config.url = config.url.slice(5);
  }

  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.clear();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
