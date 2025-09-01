import React from 'react';
// Temporal: usar import relativo hasta que se resuelva el path alias
// import { useData } from '@/contexts';
import { useAboutAnimations } from './useAboutAnimations';
import { useAboutNavigation } from './useAboutNavigation';
import { useHighlightCards } from './useHighlightCards';

interface UseAboutSectionReturn {
  // Animaciones
  isAnimated: boolean;
  elementRef: React.RefObject<HTMLDivElement>;

  // Navegación
  handleNavigateToContact: () => void;

  // Highlight Cards
  highlightCards: Array<{
    icon: React.ReactNode;
    title: string;
    descriptionHtml: string;
    tech: string;
    imageSrc: string;
  }>;
}

/**
 * Hook principal para la sección About.
 * Coordina todos los sub-hooks especializados (excepto datos del perfil).
 */
export function useAboutSection(): UseAboutSectionReturn {
  // Hook de animaciones
  const { isAnimated, elementRef } = useAboutAnimations();

  // Hook de navegación
  const { handleNavigateToContact } = useAboutNavigation();

  // Hook de highlight cards
  const { highlightCards } = useHighlightCards();

  return {
    // Animaciones
    isAnimated,
    elementRef,

    // Navegación
    handleNavigateToContact,

    // Highlight Cards
    highlightCards,
  };
}
