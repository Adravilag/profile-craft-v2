/**
 * Sistema de logging producción-safe
 * Reemplaza console.log/warn/error con logs controlados por entorno
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger que solo muestra logs en desarrollo o errores críticos en producción
 */
export const logger = {
  /**
   * Logs de debug - solo en desarrollo
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Logs informativos - solo en desarrollo
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warnings - siempre se muestran pero se pueden configurar
   */
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      console.warn('[WARN]', ...args);
    }
    // En producción, los warnings podrían enviarse a un servicio de monitoreo
  },

  /**
   * Errores - siempre se muestran
   */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
    // En producción, los errores podrían enviarse a un servicio de monitoreo
  },

  /**
   * Log de conexión exitosa - solo errores en producción
   */
  success: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[SUCCESS]', ...args);
    }
  },

  /**
   * Logs de seguridad - siempre importantes
   */
  security: (...args: unknown[]) => {
    if (isProduction) {
      console.warn('[SECURITY]', ...args);
    } else {
      console.log('[SECURITY]', ...args);
    }
  },
};

/**
 * Reemplazos directos para migración gradual
 */
export const prodSafeLog = {
  /**
   * Reemplazo de console.log - solo en desarrollo
   */
  log: logger.debug,

  /**
   * Reemplazo de console.warn - controlado por entorno
   */
  warn: logger.warn,

  /**
   * Reemplazo de console.error - siempre activo
   */
  error: logger.error,
};

export default logger;
