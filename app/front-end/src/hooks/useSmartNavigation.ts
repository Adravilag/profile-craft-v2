// src/hooks/useSmartNavigation.ts

import { useState, useCallback, useRef } from 'react';
import { useScrollCompletion } from './useScrollCompletion';
import { debugLog } from '../utils/debugConfig';

interface SmartNavigationConfig {
  /** Duración del overlay en ms */
  overlayDuration?: number;
  /** Duración del scroll en ms */
  scrollDuration?: number;
  /** Delay antes de procesar redirecciones */
  redirectDelay?: number;
}

interface SmartNavigationState {
  /** Si el overlay está visible */
  isOverlayVisible: boolean;
  /** Sección objetivo actual */
  targetSection: string | null;
  /** Si está en proceso de navegación */
  isNavigating: boolean;
}

/**
 * Hook que combina scroll completion con overlay visual
 * para crear una experiencia de navegación inteligente
 */
export const useSmartNavigation = (config: SmartNavigationConfig = {}) => {
  const {
    overlayDuration = 1200, // Duración más larga para permitir scroll completo
    scrollDuration = 800,
    redirectDelay = 200,
  } = config;

  const [state, setState] = useState<SmartNavigationState>({
    isOverlayVisible: false,
    targetSection: null,
    isNavigating: false,
  });

  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { markScrollStart, onScrollComplete } = useScrollCompletion({
    debounceDelay: 150,
    detectUserScroll: true,
  });

  /**
   * Ocultar el overlay
   */
  const hideOverlay = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOverlayVisible: false,
      isNavigating: false,
    }));

    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }
  }, []);

  /**
   * Mostrar el overlay
   */
  const showOverlay = useCallback(
    (targetSection: string) => {
      setState(prev => ({
        ...prev,
        isOverlayVisible: true,
        targetSection,
        isNavigating: true,
      }));

      // Auto-ocultar después del tiempo especificado
      overlayTimeoutRef.current = setTimeout(hideOverlay, overlayDuration);
    },
    [overlayDuration, hideOverlay]
  );

  /**
   * Ejecutar navegación inteligente con overlay y timeout
   */
  const smartNavigate = useCallback(
    (
      targetSection: string,
      navigationCallback: () => void,
      options: {
        showOverlay?: boolean;
        waitForScrollCompletion?: boolean;
      } = {}
    ) => {
      const { showOverlay: shouldShowOverlay = true, waitForScrollCompletion = true } = options;

      // Limpiar timeouts anteriores
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Mostrar overlay si está habilitado
      if (shouldShowOverlay) {
        showOverlay(targetSection);
      }

      // Marcar inicio del scroll
      markScrollStart();

      if (waitForScrollCompletion) {
        // Ejecutar callback cuando termine el scroll
        onScrollComplete(() => {
          // Delay adicional para asegurar que el scroll terminó completamente
          setTimeout(() => {
            navigationCallback();

            // Log para debugging
            if (process.env.NODE_ENV === 'development') {
              debugLog.navigation(`✅ Navegación inteligente completada a: ${targetSection}`);
            }
          }, redirectDelay);
        });
      } else {
        // Ejecutar callback inmediatamente con un pequeño delay
        navigationTimeoutRef.current = setTimeout(() => {
          navigationCallback();
        }, redirectDelay);
      }

      // Log para debugging
      if (process.env.NODE_ENV === 'development') {
        debugLog.navigation(`🚀 Navegación inteligente iniciada a: ${targetSection}`);
      }
    },
    [showOverlay, markScrollStart, onScrollComplete, redirectDelay]
  );

  /**
   * Cancelar navegación en progreso
   */
  const cancelNavigation = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    hideOverlay();

    if (process.env.NODE_ENV === 'development') {
      debugLog.navigation('❌ Navegación cancelada');
    }
  }, [hideOverlay]);

  /**
   * Limpiar todos los timeouts al desmontar
   */
  const cleanup = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }
  }, []);

  return {
    // Estado
    ...state,

    // Funciones principales
    smartNavigate,
    cancelNavigation,
    showOverlay,
    hideOverlay,
    cleanup,

    // Configuración
    config: {
      overlayDuration,
      scrollDuration,
      redirectDelay,
    },
  };
};

export default useSmartNavigation;
