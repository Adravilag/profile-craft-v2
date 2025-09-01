// src/components/sections/skills/hooks/useStickyFilter.ts
import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
// Navigation removed: use a local stub
const useNavigation = () => ({ currentSection: 'home' });

interface StickyFilterOptions {
  sectionId?: string;
  threshold?: number;
  offsetTop?: number;
  debug?: boolean;
}

interface StickyFilterState {
  isSticky: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  styles: {
    container: React.CSSProperties;
    panel: React.CSSProperties;
  };
  isInSection: boolean;
}

/**
 * Hook personalizado para manejar el comportamiento "sticky" del panel de filtros
 * Permite que el panel se mantenga visible mientras se desplaza dentro de la sección,
 * pero permanece en su posición original cuando está en la parte superior
 */
export const useStickyFilter = ({
  sectionId = 'skills',
  threshold = 100,
  offsetTop = 80,
  debug = false,
}: StickyFilterOptions = {}): StickyFilterState => {
  // Referencias a los elementos DOM
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Estados
  const [isSticky, setIsSticky] = useState(false);
  const [isInSection, setIsInSection] = useState(false);
  const [sectionRect, setSectionRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);

  // Utilizar el contexto de navegación para detectar la sección activa
  const { currentSection } = useNavigation();

  // Estilos dinámicos
  const [styles, setStyles] = useState<{
    container: React.CSSProperties;
    panel: React.CSSProperties;
  }>({
    container: {},
    panel: {},
  });

  // Efecto para detectar si estamos en la sección correcta
  useEffect(() => {
    // Además de la navegación, comprobar el atributo del body y la existencia del elemento
    const sectionElement = document.getElementById(sectionId);
    const bodyActive = document.body.getAttribute('data-active-section');
    const isInSkillsSection =
      currentSection === sectionId || bodyActive === sectionId || !!sectionElement;
    setIsInSection(isInSkillsSection);

    if (debug) {
      console.log(
        `[STICKY_FILTER] Sección actual: ${currentSection}, En sección de habilidades: ${isInSkillsSection}`
      );
    }
  }, [currentSection, sectionId, debug]);

  // Función para calcular los rectángulos de los elementos
  const updateRects = () => {
    const sectionElement = document.getElementById(sectionId);

    if (sectionElement) {
      setSectionRect(sectionElement.getBoundingClientRect());
    }

    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
    }

    if (panelRef.current) {
      setPanelRect(panelRef.current.getBoundingClientRect());
    }
  };

  // Función para actualizar el estado sticky según la posición de scroll
  const updateStickyState = () => {
    if (!isInSection) return;

    // Medir rects en tiempo real para mayor precisión durante el scroll
    const sectionEl = document.getElementById(sectionId);
    const containerEl = containerRef.current;
    const panelEl = panelRef.current;

    if (!sectionEl || !containerEl || !panelEl) return;

    const sectionRectNow = sectionEl.getBoundingClientRect();
    const containerRectNow = containerEl.getBoundingClientRect();
    // Forzar medición del panel
    const panelRectNow = panelEl.getBoundingClientRect();

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const sectionTop = scrollTop + sectionRectNow.top;
    const sectionBottom = sectionTop + sectionRectNow.height;

    // Leer offset desde CSS para alinear cálculos
    const computedOffset = getComputedStyle(document.documentElement)
      .getPropertyValue('--skills-filter-offset-top')
      .trim();
    const topPx =
      computedOffset && computedOffset.endsWith('px') ? parseInt(computedOffset, 10) : offsetTop;

    const panelHeight = panelRectNow.height;

    // Condición de activación: cuando el top del contenedor alcanza la barra superior (offset)
    // Esto simula el "choca con el nav"
    const reachedTopBar = containerRectNow.top <= topPx + 1;
    // Condición de límite inferior: el fondo del panel no debe superar el final de la sección
    const panelBottomDoc = scrollTop + topPx + panelHeight;
    const withinBottomBound = panelBottomDoc < sectionBottom - 8;

    // Si no pudimos medir el contenedor por alguna razón, caemos al comportamiento por umbral
    const passedThreshold = scrollTop > sectionTop + threshold;
    const shouldBeSticky = (reachedTopBar || passedThreshold) && withinBottomBound;

    if (shouldBeSticky !== isSticky) {
      setIsSticky(shouldBeSticky);
      if (debug) console.log(`[STICKY_FILTER] Estado sticky cambiado a: ${shouldBeSticky}`);
    }

    // Actualizar estilos según el estado usando las medidas actuales
    const newStyles = {
      container: { ...styles.container },
      panel: { ...styles.panel },
    };

    if (shouldBeSticky) {
      newStyles.panel = {
        position: 'fixed',
        top: `${topPx}px`,
        left: `${Math.max(0, containerRectNow.left)}px`,
        width: `${containerRectNow.width}px`,
        maxHeight: `calc(100vh - ${topPx * 2}px)`,
        overflowY: 'auto',
      };
    } else {
      newStyles.panel = {
        position: 'relative',
        top: 'auto',
        left: 'auto',
        width: '100%',
        maxHeight: 'none',
        overflowY: 'visible',
      };
    }

    setStyles(newStyles);
  };

  // (updateStyles integrado dentro de updateStickyState para usar medidas actuales)

  // Efecto para configurar los listeners de scroll y resize
  useEffect(() => {
    if (!isInSection) return;

    // Actualizar rectángulos inicialmente y configurar observadores
    updateRects();
    window.addEventListener('scroll', updateStickyState);
    const resizeHandler = () => {
      updateRects();
      updateStickyState();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('scroll', updateStickyState);
      window.removeEventListener('resize', resizeHandler);
    };
  }, [isInSection, sectionRect, containerRect, panelRect]);

  // Efecto para recalcular cuando cambia la sección
  useEffect(() => {
    updateRects();
    updateStickyState();
  }, [isInSection]);

  return {
    isSticky,
    containerRef,
    panelRef,
    styles,
    isInSection,
  };
};
