import { useState, useCallback, useEffect } from 'react';

export type ViewMode = 'traditional' | 'chronological';

interface UseExperienceViewReturn {
  viewMode: ViewMode;
  isTraditionalView: boolean;
  isChronologicalView: boolean;
  handleViewModeChange: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const STORAGE_KEY = 'experience-view-mode';

export const useExperienceView = (): UseExperienceViewReturn => {
  // Función para obtener el valor inicial desde localStorage
  const getInitialViewMode = (): ViewMode => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed === 'traditional' || parsed === 'chronological') {
          return parsed;
        }
      }
    } catch (error) {
      // En caso de error, usar valor por defecto
      console.warn('Error reading view mode from localStorage:', error);
    }
    return 'traditional';
  };

  // Estado del modo de vista
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);

  // Función para cambiar el modo de vista
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);

    // Guardar en localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mode));
    } catch (error) {
      console.warn('Error saving view mode to localStorage:', error);
    }
  }, []);

  // Función para alternar entre modos de vista
  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'traditional' ? 'chronological' : 'traditional';
    handleViewModeChange(newMode);
  }, [viewMode, handleViewModeChange]);

  // Valores calculados para facilitar el uso
  const isTraditionalView = viewMode === 'traditional';
  const isChronologicalView = viewMode === 'chronological';

  return {
    viewMode,
    isTraditionalView,
    isChronologicalView,
    handleViewModeChange,
    toggleViewMode,
  };
};

export default useExperienceView;
