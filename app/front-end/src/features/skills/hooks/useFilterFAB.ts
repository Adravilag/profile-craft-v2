// src/components/sections/skills/hooks/useFilterFAB.ts

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { useScrollVisibility } from '@hooks/useScrollVisibility';

interface UseFilterFABProps {
  debug?: boolean;
}

interface FilterFABState {
  isVisible: boolean;
  shouldShowByNavigation: boolean;
  shouldShow: boolean;
  isScrollVisible: boolean;
}

/**
 * Hook personalizado para manejar la visibilidad del FAB de filtros de skills
 * Se muestra solo cuando estamos en la sección de skills y esta está visible
 */
export const useFilterFAB = ({ debug = false }: UseFilterFABProps = {}): FilterFABState => {
  const [shouldShow, setShouldShow] = useState(false);
  const isScrollVisible = useScrollVisibility(true, 300);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Hooks para detección dual: URL y NavigationContext
  const location = useLocation();
  const { currentSection } = useNavigation();
  // Detección más robusta: URL o NavigationContext
  const isOnSkillsURL = location.pathname === '/skills';
  const isInSkillsSection = currentSection === 'skills';
  const [shouldShowByNavigation, setShouldShowByNavigation] = useState(
    isOnSkillsURL || isInSkillsSection
  );

  // Efecto para actualizar shouldShowByNavigation cuando cambia la navegación
  useEffect(() => {
    const newShouldShow = isOnSkillsURL || isInSkillsSection;
    if (newShouldShow !== shouldShowByNavigation) {
      if (debug)
        console.log(
          `[SKILLS_FILTER] Cambio de sección detectado: ${newShouldShow ? 'entrando a skills' : 'saliendo de skills'}`
        );
      setShouldShowByNavigation(newShouldShow);

      // Forzar ocultamiento inmediato del panel si salimos de la sección de skills
      if (!newShouldShow) {
        setShouldShow(false);
        document.body.classList.remove('in-skills-section');
        // Disparar un evento personalizado para notificar el cambio de sección
        const event = new CustomEvent('skillsSectionExit');
        document.dispatchEvent(event);
      }
    }
  }, [isOnSkillsURL, isInSkillsSection, shouldShowByNavigation, debug]);

  // Usar detectVisibleSection para determinar si la sección 'skills' está activa por scroll
  // (detección por scroll retirada para no bloquear visibilidad)

  // Usar Intersection Observer para detectar cuando la sección de skills está visible
  useEffect(() => {
    // Si debug está activado, forzar shouldShow a true para pruebas
    if (debug) {
      if (debug) console.log('[SKILLS_FILTER_DEBUG] Modo debug activado, forzando visibilidad');
      setShouldShow(true);
      return () => {
        document.body.classList.remove('in-skills-section');
      };
    }

    // Función para configurar el observer
    const setupObserver = (element: Element) => {
      // Limpiar observer anterior si existe
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Crear el Intersection Observer con configuración mejorada
      observerRef.current = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.3;

          setShouldShow(isVisible);

          // Gestionar clase del body solo cuando estamos en la sección de skills
          if (shouldShowByNavigation) {
            if (isVisible) {
              document.body.classList.add('in-skills-section');
            } else {
              // Solo eliminamos la clase si el cambio viene del observer, no de la navegación
              if (document.body.getAttribute('data-active-section') !== 'skills') {
                document.body.classList.remove('in-skills-section');
              }
            }
          } else if (!isVisible) {
            // Si no estamos en la sección de skills por navegación y no es visible, aseguramos que se oculte
            document.body.classList.remove('in-skills-section');
          }

          // Log para desarrollo
          if (debug) {
            console.log(`[SKILLS_FILTER_DEBUG] Sección visible: ${isVisible}`);
            console.log(
              `[SKILLS_FILTER_DEBUG] Intersection ratio: ${entry.intersectionRatio.toFixed(3)}`
            );
            console.log(
              `[SKILLS_FILTER_DEBUG] Sección activa: ${document.body.getAttribute('data-active-section')}`
            );
            console.log(`[SKILLS_FILTER_DEBUG] Navegación en skills: ${shouldShowByNavigation}`);
          }
        },
        {
          root: null, // viewport
          rootMargin: '0px 0px -30% 0px', // Margen más estricto para mejor detección
          threshold: [0, 0.1, 0.3, 0.5, 0.7, 1], // Umbrales más granulares
        }
      );

      // Observar la sección
      observerRef.current.observe(element);
    };

    // Intentar encontrar la sección de habilidades por ID
    const skillsSectionElem = document.getElementById('skills');

    if (skillsSectionElem) {
      setupObserver(skillsSectionElem);
    } else {
      // Búsqueda alternativa por selector más específico
      const skillsSectionBySelector = document.querySelector(
        'section[id="skills"], .skills-section, section.section-cv'
      );

      if (skillsSectionBySelector) {
        setupObserver(skillsSectionBySelector);
        if (debug) console.log('[SKILLS_FILTER_DEBUG] Sección encontrada por selector alternativo');
      } else {
        console.warn('[SKILLS_FILTER] No se pudo encontrar la sección de skills');
        setShouldShow(false);
      }
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Asegurarse de quitar la clase del body al desmontar el componente
      document.body.classList.remove('in-skills-section');
    };
  }, [debug, shouldShowByNavigation]);

  // La visibilidad final depende de ambas condiciones: navegación y visibilidad de la sección
  // También comprobamos el atributo data-active-section del body para asegurarnos
  // Relajar: visibilidad basada en navegación/URL y visibilidad por intersection/scroll
  const isVisible = shouldShowByNavigation && shouldShow;

  // Usar un efecto para reportar cambios de visibilidad si es necesario
  useEffect(() => {
    if (debug) {
      console.log(`[SKILLS_FILTER] Visibilidad actualizada: ${isVisible ? 'visible' : 'oculto'}`);
    }

    // Si no deberíamos mostrar por navegación/URL, limpiamos clase
    if (!shouldShowByNavigation) {
      document.body.classList.remove('in-skills-section');
    }
  }, [isVisible, debug, shouldShowByNavigation]);

  return {
    isVisible,
    shouldShowByNavigation,
    shouldShow,
    isScrollVisible,
  };
};
