// src/config/app.ts
export const APP_CONFIG = {
  // Base path para la aplicación
  // Cambiar a '/profile-craft' si se despliega en una subcarpeta
  BASE_PATH: '',

  // URL de la API
  API_URL: import.meta.env?.VITE_API_URL || 'http://localhost:3000/api',

  // Configuración de rutas
  ROUTES: {
    HOME: '/',
    ABOUT: '/about',
    SKILLS: '/skills',
    PROJECTS: '/projects',
    EDUCATION: '/education',
    CERTIFICATIONS: '/certifications',
    CONTACT: '/contact',
  },
} as const;

/**
 * Obtiene la ruta completa con el base path
 */
export const getFullPath = (path: string): string => {
  if (APP_CONFIG.BASE_PATH === '') return path;
  return `${APP_CONFIG.BASE_PATH}${path}`;
};

/**
 * Normaliza una ruta removiendo el base path si está presente
 */
export const normalizePath = (path: string): string => {
  if (APP_CONFIG.BASE_PATH === '') return path;

  const basePath = APP_CONFIG.BASE_PATH as string;
  if (path.startsWith(basePath)) {
    return path.slice(basePath.length) || '/';
  }
  return path;
};

/**
 * Extrae la sección de una ruta normalizada
 */
export const getSectionFromPath = (path: string): string | null => {
  const normalizedPath = normalizePath(path);
  const parts = normalizedPath.split('/').filter(Boolean);

  if (parts.length === 0) return 'home';
  return parts[0] || null;
};
