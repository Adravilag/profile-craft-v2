/**
 * Sistema de seguridad de dominio para prevenir el uso no autorizado de la API
 * Solo permite acceso desde el dominio oficial en producción
 */

import axios from 'axios';
import { createSecureLogger } from './secureLogging';

type AxiosInstance = ReturnType<typeof axios.create>;

const securityLogger = createSecureLogger('DOMAIN_SECURITY');

// Dominios autorizados por defecto
// En producción se puede sobreescribir con la variable de entorno VITE_ALLOWED_ORIGINS
// que debe ser una lista separada por comas de orígenes exactos (incluyendo esquema y puerto si aplica).
const DEFAULT_AUTHORIZED_DOMAINS = {
  PRODUCTION: 'https://adavilag-portfolio.vercel.app',
  DEVELOPMENT: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ],
};

/**
 * Lee VITE_ALLOWED_ORIGINS y devuelve un array de orígenes válidos o undefined
 */
function readAllowedOriginsFromEnv(): string[] | undefined {
  try {
    const raw = (import.meta.env as any).VITE_ALLOWED_ORIGINS as string | undefined;
    if (!raw) return undefined;
    return raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  } catch {
    return undefined;
  }
}

const ENV_ALLOWED_ORIGINS = readAllowedOriginsFromEnv();

// Construir objeto final de dominios autorizados (puede incluir overrides desde env)
const AUTHORIZED_DOMAINS = {
  PRODUCTION:
    ENV_ALLOWED_ORIGINS && ENV_ALLOWED_ORIGINS.length > 0
      ? ENV_ALLOWED_ORIGINS[0]
      : DEFAULT_AUTHORIZED_DOMAINS.PRODUCTION,
  DEVELOPMENT: DEFAULT_AUTHORIZED_DOMAINS.DEVELOPMENT,
};

/**
 * Verifica si un origen está autorizado para acceder a la API
 */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin || typeof origin !== 'string') {
    return false;
  }

  try {
    const url = new URL(origin);

    // En desarrollo, permitir localhost y 127.0.0.1
    if (import.meta.env.DEV) {
      const isDevelopmentOrigin = AUTHORIZED_DOMAINS.DEVELOPMENT.some(devOrigin => {
        const devUrl = new URL(devOrigin);
        return url.hostname === devUrl.hostname;
      });

      if (isDevelopmentOrigin) {
        return true;
      }
    }

    // En producción, solo permitir el dominio oficial
    return origin === AUTHORIZED_DOMAINS.PRODUCTION;
  } catch (error) {
    securityLogger.error('❌ Error parsing origin URL:', {
      origin,
      error: (error as Error).message,
    });
    return false;
  }
}

/**
 * Valida que la petición actual provenga de un origen autorizado
 */
export function validateRequest(): boolean {
  if (typeof window === 'undefined') {
    // En entorno servidor (SSR), permitir por defecto
    return true;
  }

  const currentOrigin = window.location.origin;
  const isValid = isAllowedOrigin(currentOrigin);

  if (!isValid) {
    securityLogger.error('🚫 Acceso denegado desde origen no autorizado:', {
      origin: currentOrigin,
      authorized: Boolean(import.meta.env.PROD)
        ? AUTHORIZED_DOMAINS.PRODUCTION
        : AUTHORIZED_DOMAINS.DEVELOPMENT,
    });
  } else {
    securityLogger.info('✅ Acceso autorizado desde:', { origin: currentOrigin });
  }

  return isValid;
}

/**
 * Crea un cliente de axios con validación de dominio automática
 */
export function createSecureApiClient(baseURL?: string) {
  const viteApiUrl = import.meta.env?.VITE_API_URL;
  const client = axios.create({
    baseURL:
      baseURL ||
      (typeof viteApiUrl === 'string'
        ? viteApiUrl
        : 'https://profile-craft-v2-backend.onrender.com/api'),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para validar el origen antes de cada petición
  client.interceptors.request.use(
    config => {
      // Solo validar en el navegador (no en SSR)
      if (typeof window !== 'undefined') {
        if (!validateRequest()) {
          throw new Error('🚫 Acceso no autorizado: dominio no permitido para usar esta API');
        }

        // Agregar el origen autorizado en los headers
        config.headers['X-Origin-Authorized'] = window.location.origin;
      }

      return config;
    },
    error => {
      securityLogger.error('❌ Error en validación de petición:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para log de respuestas
  client.interceptors.response.use(
    response => {
      securityLogger.info('✅ Petición autorizada completada:', {
        url: response.config.url,
        status: response.status,
      });
      return response;
    },
    error => {
      securityLogger.error('❌ Error en petición autorizada:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Función de utilidad para verificar si estamos en el dominio de producción
 */
export function isProductionDomain(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.origin === AUTHORIZED_DOMAINS.PRODUCTION;
}

/**
 * Función de utilidad para verificar si estamos en entorno de desarrollo
 */
export function isDevelopmentOrigin(): boolean {
  if (typeof window === 'undefined') {
    return Boolean(import.meta.env.DEV);
  }

  const currentOrigin = window.location.origin;
  return AUTHORIZED_DOMAINS.DEVELOPMENT.includes(currentOrigin);
}
