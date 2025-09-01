// src/hooks/useScrollCompletion.ts

import { useCallback, useRef, useEffect } from 'react';
import { debugLog } from '../utils/debugConfig';

interface ScrollCompletionConfig {
  /** Tiempo en ms para considerar que el scroll terminó */
  debounceDelay?: number;
  /** Detectar si el scroll fue generado por el usuario vs programático */
  detectUserScroll?: boolean;
}

interface ScrollCompletionReturn {
  /** Función para marcar el inicio de un scroll programático */
  markScrollStart: () => void;
  /** Función para detectar cuándo termina el scroll */
  onScrollComplete: (callback: () => void) => void;
  /** Estado si está en scroll activo */
  isScrolling: boolean;
  /** Si el scroll actual fue iniciado por el usuario */
  isUserScroll: boolean;
}

/**
 * Hook para detectar cuando termina un scroll (tanto smooth como programático)
 * y ejecutar callbacks al finalizar
 */
export const useScrollCompletion = (
  config: ScrollCompletionConfig = {}
): ScrollCompletionReturn => {
  const { debounceDelay = 150, detectUserScroll = true } = config;

  const isScrollingRef = useRef(false);
  const isUserScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPositionRef = useRef(0);
  const scrollStartTimeRef = useRef(0);
  const pendingCallbacksRef = useRef<(() => void)[]>([]);

  /**
   * Ejecutar todos los callbacks pendientes
   */
  const executeCallbacks = useCallback(() => {
    const callbacks = [...pendingCallbacksRef.current];
    pendingCallbacksRef.current = [];

    callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        debugLog.error('Error executing scroll completion callback:', error);
      }
    });
  }, []);

  /**
   * Marcar el inicio de un scroll programático
   */
  const markScrollStart = useCallback(() => {
    isScrollingRef.current = true;
    isUserScrollRef.current = false;
    scrollStartTimeRef.current = Date.now();
    lastScrollPositionRef.current = window.scrollY;

    // Log para debugging
    if (process.env.NODE_ENV === 'development') {
      debugLog.scroll('🔄 Scroll programático iniciado');
    }
  }, []);

  /**
   * Manejar el evento de scroll
   */
  const handleScroll = useCallback(() => {
    const currentPosition = window.scrollY;
    const currentTime = Date.now();

    // Si no había scroll activo, marcarlo como scroll de usuario
    if (!isScrollingRef.current && detectUserScroll) {
      isUserScrollRef.current = true;
      scrollStartTimeRef.current = currentTime;
    }

    isScrollingRef.current = true;

    // Limpiar timeout anterior
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Configurar timeout para detectar fin de scroll
    scrollTimeoutRef.current = setTimeout(() => {
      const finalPosition = window.scrollY;
      const scrollDuration = Date.now() - scrollStartTimeRef.current;

      // Verificar si realmente terminó el scroll
      if (Math.abs(finalPosition - lastScrollPositionRef.current) < 1) {
        isScrollingRef.current = false;

        // Log para debugging
        if (process.env.NODE_ENV === 'development') {
          debugLog.scroll(
            `✅ Scroll completado - Duración: ${scrollDuration}ms, Usuario: ${isUserScrollRef.current}`
          );
        }

        // Ejecutar callbacks pendientes
        executeCallbacks();

        // Reset estado
        isUserScrollRef.current = false;
      }
    }, debounceDelay);

    lastScrollPositionRef.current = currentPosition;
  }, [debounceDelay, detectUserScroll, executeCallbacks]);

  /**
   * Agregar callback para ejecutar cuando termine el scroll
   */
  const onScrollComplete = useCallback((callback: () => void) => {
    if (!isScrollingRef.current) {
      // Si no hay scroll activo, ejecutar inmediatamente
      callback();
    } else {
      // Agregar a la cola de callbacks pendientes
      pendingCallbacksRef.current.push(callback);
    }
  }, []);

  /**
   * Configurar event listeners
   */
  useEffect(() => {
    // Eventos de scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Eventos que indican scroll de usuario
    if (detectUserScroll) {
      const markUserScroll = () => {
        if (!isScrollingRef.current) {
          isUserScrollRef.current = true;
        }
      };

      window.addEventListener('wheel', markUserScroll, { passive: true });
      window.addEventListener('touchstart', markUserScroll, { passive: true });
      window.addEventListener('keydown', e => {
        if (
          ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'].includes(e.key)
        ) {
          markUserScroll();
        }
      });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Limpiar callbacks pendientes
      pendingCallbacksRef.current = [];
    };
  }, [handleScroll, detectUserScroll]);

  return {
    markScrollStart,
    onScrollComplete,
    isScrolling: isScrollingRef.current,
    isUserScroll: isUserScrollRef.current,
  };
};

export default useScrollCompletion;
