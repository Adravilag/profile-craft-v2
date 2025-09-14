/**
 * Configuración centralizada de debug para optimización de rendimiento
 *
 * Este archivo controla todos los logs de debug en la aplicación.
 * En producción, todos los logs se desactivarán automáticamente.
 */

export const DEBUG_CONFIG = {
  // Debug global - controla todos los logs
  // Usar múltiples condiciones para asegurar que solo se active en desarrollo
  ENABLED:
    import.meta.env.DEV &&
    import.meta.env.MODE === 'development' &&
    process.env.NODE_ENV !== 'production',

  // Debug específico por categorías
  API: import.meta.env.DEV && import.meta.env.MODE === 'development' && false, // Desactivado por defecto
  AUTH: import.meta.env.DEV && import.meta.env.MODE === 'development' && false, // Desactivado por defecto para reducir ruido
  NAVIGATION: import.meta.env.DEV && import.meta.env.MODE === 'development' && false, // Desactivado por defecto para reducir ruido
  PERFORMANCE: import.meta.env.DEV && import.meta.env.MODE === 'development' && false, // Solo activar si se necesita monitoreo
  IMAGES: import.meta.env.DEV && import.meta.env.MODE === 'development' && false, // Solo activar si hay problemas con imágenes
  SCROLL: import.meta.env.DEV && import.meta.env.MODE === 'development' && false, // Solo activar si hay problemas de scroll
  BACKEND_STATUS: import.meta.env.DEV && import.meta.env.MODE === 'development' && false, // Solo activar si hay problemas de conexión
  DATA_LOADING: import.meta.env.DEV && import.meta.env.MODE === 'development' && true, // Activado en dev para debug de RAG
  ADMIN: import.meta.env.DEV && import.meta.env.MODE === 'development' && false, // Solo activar si hay problemas con funciones de admin
};

// Helper functions para logging condicional
export const debugLog = {
  api: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.API) {
    }
  },

  auth: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.AUTH) {
    }
  },

  navigation: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.NAVIGATION) {
    }
  },

  performance: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.PERFORMANCE) {
    }
  },

  images: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.IMAGES) {
    }
  },

  scroll: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.SCROLL) {
    }
  },

  backendStatus: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.BACKEND_STATUS) {
    }
  },
  dataLoading: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.DATA_LOADING) {
    }
  },

  admin: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.ADMIN) {
    }
  },

  warn: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED) {
      console.warn(...args);
    }
  },

  // Información general (mapeada a console.info cuando está habilitado)
  info: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED) {
      // Use console.info if disponible, otherwise fallback a console.log
      if (typeof console.info === 'function') {
        console.info(...args);
      } else {
        console.log(...args);
      }
    }
  },

  // Los errores siempre se muestran (importantes para debugging en producción)
  error: (...args: any[]) => {
    console.error(...args);
  },
};

// Función para activar/desactivar debug específico desde la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).debugConfig = {
    enable: (category: keyof typeof DEBUG_CONFIG) => {
      if (category === 'ENABLED') {
        Object.keys(DEBUG_CONFIG).forEach(key => {
          (DEBUG_CONFIG as any)[key] = true;
        });
      } else {
        (DEBUG_CONFIG as any)[category] = true;
      }
    },
    disable: (category: keyof typeof DEBUG_CONFIG) => {
      if (category === 'ENABLED') {
        Object.keys(DEBUG_CONFIG).forEach(key => {
          (DEBUG_CONFIG as any)[key] = false;
        });
      } else {
        (DEBUG_CONFIG as any)[category] = false;
      }
    },
    status: () => {},
  };
}
