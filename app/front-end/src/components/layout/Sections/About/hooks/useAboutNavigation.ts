import { useOptimizedCallback } from '@/hooks/useOptimizedCallback';

// Navigation hook stub - to be replaced with real navigation hook
const useNavigation = () => ({ navigateToSection: (_: string) => {} });

/**
 * Hook para manejar la navegación desde la sección About.
 * Centraliza la lógica de navegación a otras secciones.
 */
export function useAboutNavigation() {
  const { navigateToSection } = useNavigation();

  // Función optimizada para navegar a la sección de contacto
  const handleNavigateToContact = useOptimizedCallback(() => {
    // Simplemente navegar a la sección sin estados de carga
    navigateToSection('contact');
  }, [navigateToSection]);

  return {
    handleNavigateToContact,
    navigateToSection,
  };
}
