// src/hooks/useSmartScroll.ts

import { useCallback, useMemo } from 'react';
import { debugLog } from '../utils/debugConfig';

interface SmartScrollConfig {
  /** Altura del header principal en píxeles */
  headerHeight: number;
  /** Altura del nav sticky en píxeles */
  navHeight: number;
  /** Offset adicional en píxeles */
  offset?: number;
  /** Duración de la animación de scroll en ms */
  duration?: number;
  /** Función de easing para la animación */
  easing?: (t: number) => number;
}

interface ScrollPosition {
  /** Posición Y del scroll objetivo */
  targetY: number;
  /** Si el header debe estar visible */
  headerVisible: boolean;
  /** Si el nav debe estar visible */
  navVisible: boolean;
}

/**
 * Hook para scroll inteligente que maneja la navegación del CV
 * Calcula automáticamente las posiciones para que:
 * 1. El header principal quede oculto arriba
 * 2. El nav sticky quede visible en la parte superior
 * 3. La sección seleccionada comience justo debajo del nav
 */
export const useSmartScroll = (config: SmartScrollConfig) => {
  const {
    headerHeight = 400, // Altura estimada del header
    navHeight = 80, // Altura estimada del nav
    offset = 0,
    duration = 800,
    easing = (t: number) => 1 - Math.pow(1 - t, 3), // easeOutCubic
  } = config;

  /**
   * Función de easing suave para la animación de scroll
   */
  const smoothScrollTo = useCallback(
    (targetY: number, animationDuration: number = duration) => {
      // Respetar la preferencia de reducir movimiento: hacer scroll instantáneo
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        // Usar la firma larga si está disponible
        try {
          window.scrollTo({ top: targetY, behavior: 'auto' });
        } catch (e) {
          // Fallback a la firma antigua
          window.scrollTo(0, targetY);
        }
        return;
      }

      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Aplicar función de easing
        const easedProgress = easing(progress);
        const currentY = startY + distance * easedProgress;

        // Intentar usar la firma con options si está soportada
        try {
          window.scrollTo({ top: Math.round(currentY), behavior: 'auto' });
        } catch (e) {
          window.scrollTo(0, Math.round(currentY));
        }

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    },
    [duration, easing]
  );

  /**
   * Calcula la posición de scroll óptima para una sección
   */
  const calculateScrollPosition = useCallback(
    (sectionId: string): ScrollPosition => {
      const sectionElement = document.getElementById(sectionId);

      if (!sectionElement) {
        debugLog.warn(`Sección ${sectionId} no encontrada`);
        return {
          targetY: 0,
          headerVisible: true,
          navVisible: true,
        };
      }

      // Obtener la posición de la sección relativa al documento
      const sectionRect = sectionElement.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const sectionTop = sectionRect.top + currentScrollY;

      // Calcular la posición objetivo:
      // - El header debe quedar oculto (scroll = headerHeight)
      // - La sección debe quedar justo debajo del nav sticky
      const targetY = Math.max(0, sectionTop - navHeight - offset);

      // Determinar visibilidad de elementos
      const headerVisible = targetY < headerHeight;
      const navVisible = targetY >= headerHeight - navHeight;

      return {
        targetY,
        headerVisible,
        navVisible,
      };
    },
    [headerHeight, navHeight, offset]
  );

  /**
   * Función principal para navegar a una sección con scroll inteligente
   */
  const scrollToSection = useCallback(
    (sectionId: string, animationDuration?: number) => {
      const scrollPosition = calculateScrollPosition(sectionId);

      // Realizar el scroll suave
      smoothScrollTo(scrollPosition.targetY, animationDuration);

      // Log para debugging
      debugLog.scroll(`Smart scroll to ${sectionId}:`, {
        targetY: scrollPosition.targetY,
        headerVisible: scrollPosition.headerVisible,
        navVisible: scrollPosition.navVisible,
      });

      return scrollPosition;
    },
    [calculateScrollPosition, smoothScrollTo]
  );

  /**
   * Función para scroll a la posición exacta donde el nav queda sticky
   * sin mostrar el header
   */
  const scrollToNavSticky = useCallback(
    (animationDuration?: number) => {
      // Posición donde el nav queda perfectamente sticky sin header visible
      const targetY = headerHeight;
      smoothScrollTo(targetY, animationDuration);

      return {
        targetY,
        headerVisible: false,
        navVisible: true,
      };
    },
    [headerHeight, smoothScrollTo]
  );

  /**
   * Función para volver al inicio (header completamente visible)
   */
  const scrollToTop = useCallback(
    (animationDuration?: number) => {
      smoothScrollTo(0, animationDuration);

      return {
        targetY: 0,
        headerVisible: true,
        navVisible: true,
      };
    },
    [smoothScrollTo]
  );

  /**
   * Obtener información del estado actual del scroll
   */
  const getCurrentScrollState = useCallback(() => {
    const currentScrollY = window.scrollY;

    return {
      scrollY: currentScrollY,
      headerVisible: currentScrollY < headerHeight,
      navVisible: currentScrollY >= headerHeight - navHeight,
      headerProgress: Math.min(currentScrollY / headerHeight, 1),
      navSticky: currentScrollY >= headerHeight,
    };
  }, [headerHeight, navHeight]);

  /**
   * Configuración memoizada para evitar recálculos innecesarios
   */
  const scrollConfig = useMemo(
    () => ({
      headerHeight,
      navHeight,
      offset,
      duration,
      totalScrollableHeight: headerHeight + navHeight + offset,
    }),
    [headerHeight, navHeight, offset, duration]
  );

  return {
    // Funciones principales
    scrollToSection,
    scrollToNavSticky,
    scrollToTop,

    // Utilidades de cálculo
    calculateScrollPosition,
    getCurrentScrollState,

    // Configuración
    config: scrollConfig,

    // Función de scroll básica
    smoothScrollTo,
  };
};

export default useSmartScroll;
