// src/services/http.ts
import axios from 'axios';
import { debugLog } from '@/utils/debugConfig';

// Servicio HTTP centralizado (axios) con configuración y helpers claros.

/**
 * Determina la API base a usar según el entorno.
 * - En desarrollo (DEV) usa '/api' por defecto (útil con proxy de Vite).
 * - Si existe VITE_API_URL en las variables de entorno, se usa siempre.
 */
function getApiBaseUrl(): string {
  const envUrl = (import.meta.env as any).VITE_API_URL as string | undefined;
  if (import.meta.env.DEV) return envUrl ?? '/api';
  return envUrl ?? 'http://localhost:3000/api';
}

const API_BASE_URL = getApiBaseUrl();

/** Instancia axios exportada para uso en la app */
export const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// --- Helpers públicos para manejar token de autenticación ---
function getCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('portfolio_auth_token', token);
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('portfolio_auth_token');
    delete API.defaults.headers.common.Authorization;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('portfolio_auth_token');
}

// Log de diagnóstico para ayudar en dev.
if (import.meta.env.DEV) {
  console.log(`🔧 Environment DEV: ${Boolean(import.meta.env.DEV)}`);
}

// --- Interceptors ---
// Request: añade Authorization si hay token en localStorage (fallback)
API.interceptors.request.use(config => {
  let token = getAuthToken();
  // Fallback en DEV: si no hay token en LS, intentar desde cookie de desarrollo
  if (!token && import.meta.env.DEV) {
    token = getCookie('portfolio_auth_token');
  }
  if (token) {
    // Evitar conflictos de tipos: asignar directamente en forma de índice
    (config.headers as Record<string, string | undefined>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response: debug y rethrow
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
