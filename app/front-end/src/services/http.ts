// src/services/http.ts
import axios from 'axios';
import { debugLog } from '@/utils/debugConfig';

const API_BASE_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000/api';

export const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// (opcional) interceptor de auth por token localStorage
API.interceptors.request.use(config => {
  const token = localStorage.getItem('portfolio_auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => {
    debugLog.api('✅', res.config.url, res.data);
    return res;
  },
  err => {
    debugLog.error('❌', err.config?.url, err);
    return Promise.reject(err);
  }
);
