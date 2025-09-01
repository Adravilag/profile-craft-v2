import { useEffect } from 'react';
import { debugLog } from '@/utils/debugConfig';

/**
 * Hook para navegación automática cuando se proporciona una sección inicial.
 * Se ejecuta cuando el componente se monta con una sección específica.
 */
export const useAutoNavigation = (
  initialSection: string | undefined,
  currentSection: string | undefined,
  navigateToSection: (section: string) => void
) => {
  useEffect(() => {
    if (!initialSection) return;

    // Navegar solo si la sección actual difiere y la función de navegación está disponible
    try {
      if (currentSection !== initialSection && typeof navigateToSection === 'function') {
        debugLog.navigation(`🧭 Auto-navegando a sección: ${initialSection}`);
        navigateToSection(initialSection);
      }
    } catch (err) {
      debugLog.error('❌ Error en useAutoNavigation:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSection]);
};
