// src/hooks/useScrollVisibility.ts

import { useState, useEffect } from 'react';

/**
 * Hook que controla la visibilidad de un elemento basado en el scroll
 * Oculta el elemento momentáneamente durante el scroll activo y lo muestra nuevamente después
 */
export const useScrollVisibility = (
  initialState: boolean = true,
  delayMs: number = 300
): boolean => {
  const [isVisible, setIsVisible] = useState<boolean>(initialState);
  const [scrolling, setScrolling] = useState<boolean>(false);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;

      setLastScrollY(currentScrollY);

      // Si el usuario está haciendo scroll, ocultar el elemento
      if (!scrolling) {
        setScrolling(true);

        if (isScrollingDown) {
          setIsVisible(false);
        }
      }

      // Clear the timeout if it already exists
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }

      // Set a timeout to run after scrolling ends
      scrollTimeout = window.setTimeout(() => {
        setScrolling(false);
        setIsVisible(true);
      }, delayMs);
    };

    // Añadir el event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Limpiar
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }
    };
  }, [lastScrollY, scrolling, delayMs]);

  return isVisible;
};
