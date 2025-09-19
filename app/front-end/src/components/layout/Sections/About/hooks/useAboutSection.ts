import { useAboutAnimations } from './useAboutAnimations';
import { useAboutNavigation } from './useAboutNavigation';
import { useAboutData } from './useAboutData';
import { useAboutApiData } from './useAboutApiData';
import { useHighlightCards } from './useHighlightCards';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';
import { useSectionsLoadingContext } from '@/contexts/SectionsLoadingContext';
import type { UnifiedHighlightCard } from '../types';

/**
 * Hook principal que coordina toda la lógica de la sección About.
 * Agrupa y expone la funcionalidad de todos los hooks especializados.
 * Combina datos del perfil con datos dinámicos de About desde MongoDB.
 */
export function useAboutSection() {
  // Sistema centralizado de loading
  const { isLoading: centralLoading } = useSectionsLoadingContext();

  // Datos del perfil (contexto existente)
  const { profile, profileLoading, profileError, hasProfile } = useAboutData();

  // Datos dinámicos de About desde MongoDB
  const { aboutData, aboutLoading, aboutError, hasAboutData, refetchAboutData } = useAboutApiData();

  // Animaciones
  const { isAnimated, elementRef, isIntersecting } = useAboutAnimations();

  // Navegación
  const { handleNavigateToContact, navigateToSection } = useAboutNavigation();

  // Highlight Cards con imágenes de Cloudinary (fallback estático)
  const { highlightCards: staticHighlightCards } = useHighlightCards();
  const { getLocalizedText } = useLocalizedContent();

  // Determinar qué highlights usar: dinámicos si están disponibles, estáticos como fallback
  const highlights: UnifiedHighlightCard[] =
    hasAboutData && aboutData?.highlights
      ? aboutData.highlights
          .filter(h => h.isActive)
          .sort((a, b) => a.order - b.order)
          .map(h => ({
            _id: h._id,
            icon: h.icon, // String de la clase CSS del icono
            title: getLocalizedText(h.title, ''),
            descriptionHtml: getLocalizedText(h.descriptionHtml, ''),
            tech: getLocalizedText(h.tech, ''),
            imageSrc: h.imageSrc,
          }))
      : staticHighlightCards.map((card, index) => ({
          _id: `static-${index}`,
          icon: card.icon, // Ya es ReactNode
          title: card.title,
          descriptionHtml: card.descriptionHtml,
          tech: card.tech,
          imageSrc: card.imageSrc,
        }));

  // Determinar el texto de About: dinámico si está disponible, del perfil como fallback
  const aboutText = hasAboutData && aboutData?.aboutText ? getLocalizedText(aboutData.aboutText, profile?.about_me || '') : profile?.about_me;

  // Nota de colaboración: dinámico si está disponible (localize fields)
  const collaborationNote =
    hasAboutData && aboutData?.collaborationNote
      ? {
          title: getLocalizedText(aboutData.collaborationNote.title, ''),
          description: getLocalizedText(aboutData.collaborationNote.description, ''),
          icon: aboutData.collaborationNote.icon,
        }
      : null;

  // Estados de carga y error
  const isLoading = centralLoading('about');
  const hasError = Boolean(profileError || aboutError);
  const errorMessage = profileError || aboutError;

  return {
    // Datos combinados
    profile,
    aboutData,
    aboutText,
    highlights,
    collaborationNote,

    // Estados de carga y error
    isLoading,
    hasError,
    errorMessage,
    profileLoading,
    aboutLoading,
    profileError,
    aboutError,
    hasProfile,
    hasAboutData,

    // Funciones de refetch
    refetchAboutData,

    // Animaciones
    isAnimated,
    elementRef,
    isIntersecting,

    // Navegación
    handleNavigateToContact,
    navigateToSection,

    // Fallback estático
    staticHighlightCards,
  };
}
