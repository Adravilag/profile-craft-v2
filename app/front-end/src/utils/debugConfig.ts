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
      console.log(...args);
    }
  },

  auth: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.AUTH) {
      console.log(...args);
    }
  },

  navigation: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.NAVIGATION) {
      console.log(...args);
    }
  },

  performance: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.PERFORMANCE) {
      console.log(...args);
    }
  },

  images: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.IMAGES) {
      console.log(...args);
    }
  },

  scroll: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.SCROLL) {
      console.log(...args);
    }
  },

  backendStatus: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.BACKEND_STATUS) {
      console.log(...args);
    }
  },
  dataLoading: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.DATA_LOADING) {
      console.log(...args);
    }
  },

  admin: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.ADMIN) {
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED) {
      console.warn(...args);
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
      console.log(`✅ Debug ${category} activado`);
    },
    disable: (category: keyof typeof DEBUG_CONFIG) => {
      if (category === 'ENABLED') {
        Object.keys(DEBUG_CONFIG).forEach(key => {
          (DEBUG_CONFIG as any)[key] = false;
        });
      } else {
        (DEBUG_CONFIG as any)[category] = false;
      }
      console.log(`🚫 Debug ${category} desactivado`);
    },
    status: () => {
      console.log('📊 Estado actual del debug:', DEBUG_CONFIG);
    },
  };
}
