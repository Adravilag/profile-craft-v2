// src/hooks/useScrollSectionDetection.ts

import { useEffect, useCallback, useRef } from 'react';
import { debugLog } from '../utils/debugConfig';
// Usar el hook real de navegación para que las detecciones de sección
// puedan actualizar el estado de navegación y, por extensión, la URL.
import { useNavigation } from '@/hooks/useNavigation';

interface SectionDetectionConfig {
  /** Umbral de visibilidad para cambiar de sección (0.0 - 1.0) */
  threshold?: number;
  /** Altura del header principal en píxeles */
  headerHeight?: number;
  /** Altura del nav sticky en píxeles */
  navHeight?: number;
  /** Debounce delay en ms para evitar cambios muy frecuentes */
  debounceDelay?: number;
  /** Si debe actualizar la URL automáticamente */
  updateURL?: boolean;
}

/**
 * Hook para detectar automáticamente la sección visible durante el scroll
 * y actualizar la navegación en consecuencia
 */
export const useScrollSectionDetection = (config: SectionDetectionConfig = {}) => {
  const {
    // Requiere mayor parte visible para cambiar de sección (evita cambios prematuros)
    threshold = 0.4,
    headerHeight = 400,
    navHeight = 80,
    debounceDelay = 150,
    updateURL = true,
  } = config;

  const { currentSection, navigateToSection } = useNavigation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserScrollingRef = useRef(false);
  const lastDetectedSectionRef = useRef<string>('');

  /**
   * Lista de secciones en orden de aparición
   */
  const sections = [
    'home',
    'about',
    'experience',
    'projects',
    'skills',
    'certifications',
    'testimonials',
    'contact',
  ];

  /**
   * Detecta qué sección está más visible en el viewport
   */
  const detectVisibleSection = useCallback((): string | null => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportCenter = scrollY + viewportHeight / 2;

    // Si estamos en la parte superior (header/profile hero visible), mostrar "home".
    // Esto evita que la ruta cambie a `/about` cuando el usuario está en el header.
    if (scrollY < headerHeight * 2.1) {
      return 'home';
    }

    let visibleSection: string | null = null;
    let maxVisibleArea = 0;

    for (const sectionId of sections) {
      const sectionElement =
        document.getElementById(sectionId) ||
        document.querySelector(`[data-section="${sectionId}"]`);

      if (!sectionElement) continue;

      const rect = sectionElement.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      const sectionBottom = sectionTop + rect.height;

      // Ajustar por el nav sticky
      const adjustedViewportTop = scrollY + navHeight;
      const adjustedViewportBottom = scrollY + viewportHeight;

      // Calcular intersección
      const intersectionTop = Math.max(sectionTop, adjustedViewportTop);
      const intersectionBottom = Math.min(sectionBottom, adjustedViewportBottom);
      const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);

      // Calcular porcentaje de visibilidad
      const visibilityRatio =
        intersectionHeight / Math.min(rect.height, viewportHeight - navHeight);

      // Si esta sección tiene más área visible y supera el umbral
      if (visibilityRatio > threshold && intersectionHeight > maxVisibleArea) {
        maxVisibleArea = intersectionHeight;
        visibleSection = sectionId;
      }
    }

    // Fallback: detectar por posición del centro del viewport
    if (!visibleSection) {
      for (const sectionId of sections) {
        const sectionElement =
          document.getElementById(sectionId) ||
          document.querySelector(`[data-section="${sectionId}"]`);

        if (!sectionElement) continue;

        const rect = sectionElement.getBoundingClientRect();
        const sectionTop = rect.top + scrollY;
        const sectionBottom = sectionTop + rect.height;

        if (viewportCenter >= sectionTop && viewportCenter <= sectionBottom) {
          visibleSection = sectionId;
          break;
        }
      }
    }

    return visibleSection;
  }, [threshold, headerHeight, navHeight, sections]);

  /**
   * Maneja el cambio de sección detectado
   */
  const handleSectionChange = useCallback(
    (newSection: string) => {
      if (newSection !== lastDetectedSectionRef.current && newSection !== currentSection) {
        lastDetectedSectionRef.current = newSection;

        debugLog.navigation(`🔄 Auto-navegación detectada: ${currentSection} → ${newSection}`);

        // Trace to help debugging unexpected reloads
        if ((import.meta as any).env?.MODE === 'development') {
          // eslint-disable-next-line no-console// eslint-disable-next-line no-console
          console.trace('[useScrollSectionDetection] trace');
        }

        // Navegar sin scroll automático para evitar conflictos
        navigateToSection(newSection);
      }
    },
    [currentSection, navigateToSection]
  );

  /**
   * Handler principal del scroll con debounce
   */
  const handleScroll = useCallback(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Aplicar debounce
    timeoutRef.current = setTimeout(() => {
      if (!isUserScrollingRef.current) return;

      const visibleSection = detectVisibleSection();

      if (visibleSection && visibleSection !== currentSection) {
        handleSectionChange(visibleSection);
      }
    }, debounceDelay);
  }, [detectVisibleSection, currentSection, handleSectionChange, debounceDelay]);

  /**
   * Marcar que el usuario está haciendo scroll
   */
  const markUserScrolling = useCallback(() => {
    isUserScrollingRef.current = true;

    // Después de un tiempo, asumir que terminó el scroll programático
    setTimeout(() => {
      isUserScrollingRef.current = true;
    }, 1000);
  }, []);

  /**
   * Marcar que el scroll es programático (no del usuario)
   */
  const markProgrammaticScroll = useCallback(() => {
    isUserScrollingRef.current = false;
  }, []);

  /**
   * Configurar los event listeners
   */
  useEffect(() => {
    // Marcar como scroll de usuario inicialmente
    isUserScrollingRef.current = true;
    lastDetectedSectionRef.current = currentSection;

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', markUserScrolling, { passive: true });
    window.addEventListener('touchstart', markUserScrolling, { passive: true });
    window.addEventListener('keydown', e => {
      // Detectar navegación con teclado
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        markUserScrolling();
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', markUserScrolling);
      window.removeEventListener('touchstart', markUserScrolling);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleScroll, markUserScrolling]);

  /**
   * Función para desactivar temporalmente la detección
   */
  const disableDetection = useCallback(
    (duration: number = 1500) => {
      markProgrammaticScroll();

      setTimeout(() => {
        markUserScrolling();
      }, duration);
    },
    [markProgrammaticScroll, markUserScrolling]
  );

  return {
    // Estado
    currentDetectedSection: lastDetectedSectionRef.current,
    isUserScrolling: isUserScrollingRef.current,

    // Funciones de control
    detectVisibleSection,
    disableDetection,
    markProgrammaticScroll,
    markUserScrolling,

    // Configuración
    config: {
      threshold,
      headerHeight,
      navHeight,
      debounceDelay,
      updateURL,
      sections,
    },
  };
};

export default useScrollSectionDetection;
