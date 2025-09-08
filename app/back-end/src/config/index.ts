export const config = {
  // JWT Secret (IMPORTANTE: usar variable de entorno en producción)
  // En producción, debe ser al menos 64 caracteres
  JWT_SECRET: (() => {
    const secret =
      process.env.JWT_SECRET ||
      'profilecraft-dev-secret-change-in-production-must-be-64-chars-minimum';
    if (process.env.NODE_ENV === 'production' && secret.length < 64) {
      throw new Error('❌ JWT_SECRET debe tener al menos 64 caracteres en producción');
    }
    return secret;
  })(),

  // Puerto del servidor
  PORT: parseInt(process.env.PORT || '3000'),

  // Base de datos
  DATABASE_PATH: process.env.DATABASE_PATH || './data/profilecraft-database.db',

  // Configuración de archivos
  FILE_UPLOAD: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  },

  // Límites de la API
  API_LIMITS: {
    JSON_LIMIT: '50mb',
    URL_ENCODED_LIMIT: '50mb',
  },

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000', // CORS
  // Orígenes permitidos (deben ser los ORIGINES del FRONTEND que hacen requests al backend)
  // Nota: NO incluir aquí la URL del backend (ej. http://localhost:3000). Incluir solo los origins
  // desde los que el navegador hará peticiones (ej. Vite dev: http://localhost:5173).
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://adavilag-portfolio.vercel.app',
  ],

  // Configuración de desarrollo
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
};
