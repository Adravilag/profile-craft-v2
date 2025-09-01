import { useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useOptimizedCallback } from '@/hooks/useOptimizedCallback';

/**
 * Hook para manejar las animaciones de la sección About.
 * Controla cuándo activar las animaciones basándose en la visibilidad del componente.
 */
export function useAboutAnimations() {
  const [isAnimated, setIsAnimated] = useState(false);

  // Hook de Intersection Observer para detectar visibilidad
  const { isIntersecting, elementRef } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px 0px',
  });

  // Callback optimizado para activar animaciones
  const triggerAnimation = useOptimizedCallback(
    () => {
      if (isIntersecting && !isAnimated) {
        setIsAnimated(true);
      }
    },
    [isIntersecting, isAnimated],
    { type: 'raf' }
  );

  // Activar animación cuando la sección es visible
  useEffect(() => {
    triggerAnimation();
  }, [triggerAnimation]);

  return {
    isAnimated,
    elementRef,
    isIntersecting,
  };
}
