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

    // if (debug) {
    //   // Aquí se puede agregar logging si se desea
    // }
  }, [currentSection, sectionId, debug]);

  // Cache local para rectángulos — evitamos setState por cada lectura frecuente
  const rectsRef = useRef<{
    section?: DOMRect | null;
    container?: DOMRect | null;
    panel?: DOMRect | null;
  }>({});

  // Función para calcular los rectángulos de los elementos (lecturas agrupadas)
  const updateRects = () => {
    requestAnimationFrame(() => {
      const sectionElement = document.getElementById(sectionId);

      rectsRef.current.section = sectionElement ? sectionElement.getBoundingClientRect() : null;
      rectsRef.current.container = containerRef.current
        ? containerRef.current.getBoundingClientRect()
        : null;
      rectsRef.current.panel = panelRef.current ? panelRef.current.getBoundingClientRect() : null;

      // Actualizamos estados solo cuando sea necesario — por ejemplo al inicializar o resize
      // Esto evita múltiples re-renders durante scroll rápido.
      setSectionRect(rectsRef.current.section ?? null);
      setContainerRect(rectsRef.current.container ?? null);
      setPanelRect(rectsRef.current.panel ?? null);
    });
  };

  // Función para actualizar el estado sticky según la posición de scroll
  const updateStickyState = () => {
    if (!isInSection) return;

    // Throttle via rAF with a ticking flag attached to the ref to avoid re-creating closures
    const tickingKey = '__ticking_updateStickyState';
    if ((updateStickyState as any)[tickingKey]) return;
    (updateStickyState as any)[tickingKey] = true;

    requestAnimationFrame(() => {
      try {
        const sectionRectNow =
          rectsRef.current.section ??
          document.getElementById(sectionId)?.getBoundingClientRect() ??
          null;
        const containerRectNow =
          rectsRef.current.container ?? containerRef.current?.getBoundingClientRect() ?? null;
        const panelRectNow =
          rectsRef.current.panel ?? panelRef.current?.getBoundingClientRect() ?? null;

        if (!sectionRectNow || !containerRectNow || !panelRectNow) return;

        // Usar scrollY para cálculos basados en documento
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const sectionTop = scrollTop + sectionRectNow.top;
        const sectionBottom = sectionTop + sectionRectNow.height;

        const computedOffset = getComputedStyle(document.documentElement)
          .getPropertyValue('--skills-filter-offset-top')
          .trim();
        const topPx =
          computedOffset && computedOffset.endsWith('px')
            ? parseInt(computedOffset, 10)
            : offsetTop;

        const panelHeight = panelRectNow.height;

        const reachedTopBar = containerRectNow.top <= topPx + 1;
        const panelBottomDoc = scrollTop + topPx + panelHeight;
        const withinBottomBound = panelBottomDoc < sectionBottom - 8;

        const passedThreshold = scrollTop > sectionTop + threshold;
        const shouldBeSticky = (reachedTopBar || passedThreshold) && withinBottomBound;

        if (shouldBeSticky !== isSticky) {
          setIsSticky(shouldBeSticky);
          if (debug) {
            console.log('Sticky state changed:', shouldBeSticky);
          }
        }

        // Solo actualizar estilos cuando cambie el estado sticky o en resize
        setStyles(prev => {
          const newStyles = { container: { ...prev.container }, panel: { ...prev.panel } };
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
          return newStyles;
        });
      } finally {
        (updateStickyState as any)[tickingKey] = false;
      }
    });
  };

  // (updateStyles integrado dentro de updateStickyState para usar medidas actuales)

  // Efecto para configurar los listeners de scroll y resize
  useEffect(() => {
    if (!isInSection) return;

    // Actualizar rectángulos inicialmente y configurar observadores
    updateRects();
    window.addEventListener('scroll', updateStickyState, { passive: true });
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
