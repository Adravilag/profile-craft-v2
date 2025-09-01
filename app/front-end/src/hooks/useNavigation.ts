// Real hook that prefers NavigationContext when available.
// Provides a safe fallback for tests or isolated components.
import { useContext, useState, useCallback } from 'react';
import { NavigationContext } from '@/contexts/NavigationContext';
import { NORMALIZED_BASE } from '@/config/basePath';

export type NavigationState = {
  currentSection: string;
  currentSubPath: string | null;
  isNavigating: boolean;
  navigateToSection: (section: string, opts?: { replace?: boolean }) => void;
};

export const defaultNavigation = {
  currentSection: 'home',
  currentSubPath: null,
  isNavigating: false,
};

export function useNavigation(): NavigationState {
  // Intentar usar el contexto si existe (proveído por NavigationProvider)
  try {
    // cast a any para compatibilidad con el contexto definido en /contexts
    const ctxAny = useContext(NavigationContext as any) as any;
    // Si hay contexto, devolver una API que use setActiveLink
    if (ctxAny && typeof ctxAny.setActiveLink === 'function') {
      const makePath = (section: string) => {
        const base = NORMALIZED_BASE || '/';
        if (!section || section === 'home') return base;
        // Evitar '//' al concatenar cuando base === '/'
        if (base === '/' || base === '') return `/${encodeURIComponent(section)}`;
        return `${base}/${encodeURIComponent(section)}`;
      };

      const navigateToSection = useCallback(
        (section: string, opts?: { replace?: boolean }) => {
          try {
            ctxAny.setActiveLink(section);

            if (typeof window !== 'undefined') {
              const path = makePath(section);
              if (opts && opts.replace) {
                window.history.replaceState({}, '', path);
              } else {
                window.history.pushState({}, '', path);
              }
            }
          } catch (err) {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.error('[useNavigation] error setting active link', err);
            }
          }
        },
        [ctxAny]
      );

      return {
        currentSection: ctxAny.activeLink || defaultNavigation.currentSection,
        currentSubPath: null,
        isNavigating: false,
        navigateToSection,
      };
    }
  } catch (err) {
    // si useContext falla (p. ej. en entornos que no soportan React hooks), caer al fallback
  }

  // Fallback: mantener estado local para que el hook sea util en tests o sin provider
  const [localSection, setLocalSection] = useState<string>(defaultNavigation.currentSection);
  const makePath = (section: string) => {
    const base = NORMALIZED_BASE || '/';
    if (!section || section === 'home') return base;
    if (base === '/' || base === '') return `/${encodeURIComponent(section)}`;
    return `${base}/${encodeURIComponent(section)}`;
  };

  const navigateToSection = useCallback((section: string, opts?: { replace?: boolean }) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[useNavigation fallback] navigateToSection called with', section);
    }
    setLocalSection(section);

    // También actualizar la URL localmente para que el comportamiento sea consistente
    if (typeof window !== 'undefined') {
      const path = makePath(section);
      if (opts && opts.replace) {
        window.history.replaceState({}, '', path);
      } else {
        window.history.pushState({}, '', path);
      }
    }
  }, []);

  return {
    currentSection: localSection,
    currentSubPath: null,
    isNavigating: false,
    navigateToSection,
  };
}

export default useNavigation;
