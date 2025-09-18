/**
 * Helpers para manejo seguro de variables de entorno
 * Evita errores de tipado en deployment
 */

export const getEnvString = (key: keyof ImportMetaEnv, defaultValue = ''): string => {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value : defaultValue;
};

export const getEnvBoolean = (key: keyof ImportMetaEnv, defaultValue = false): boolean => {
  const value = import.meta.env[key];
  return typeof value === 'boolean' ? value : defaultValue;
};

export const isDevelopment = (): boolean => {
  return getEnvBoolean('DEV', false) || getEnvString('NODE_ENV') === 'development';
};

export const isProduction = (): boolean => {
  return getEnvBoolean('PROD', false) || getEnvString('NODE_ENV') === 'production';
};

export const getApiUrl = (): string => {
  const apiUrl = getEnvString('VITE_API_URL');
  if (apiUrl) {
    return apiUrl.replace(/\/?api\/?$/, '');
  }
  return isDevelopment() ? '' : 'https://profile-craft-v2-backend.onrender.com';
};

export const getBaseUrl = (): string => {
  return getEnvString('BASE_URL', '/');
};

export const getCloudinaryCloudName = (): string => {
  return getEnvString('VITE_CLOUDINARY_CLOUD_NAME', 'demo');
};
