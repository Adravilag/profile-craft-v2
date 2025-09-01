import { useState, useEffect, useCallback } from 'react';
import type { Experience } from '@/types/api';
import { experiences as experiencesApi } from '@/services/endpoints';
import { useNotificationContext } from '@/hooks/useNotification';

interface UseExperienceSectionProps {
  isAdminMode?: boolean;
}

interface UseExperienceSectionReturn {
  experiences: Experience[];
  loading: boolean;
  error: string | null;
  refreshExperiences: () => Promise<void>;
  deleteExperience: (id: string, position: string) => Promise<void>;
  handleExperienceUpdate: (experience: Experience) => void;
}

/**
 * Hook privado para la sección de experiencias.
 * Maneja la carga, actualización y eliminación de experiencias.
 */
export const useExperienceSection = ({
  isAdminMode = false,
}: UseExperienceSectionProps = {}): UseExperienceSectionReturn => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotificationContext();

  const loadExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await experiencesApi.getExperiences();
      setExperiences(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading experiences';
      setError(message);
      if (isAdminMode) {
        showError('Error', message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAdminMode, showError]);

  const refreshExperiences = useCallback(async () => {
    await loadExperiences();
  }, [loadExperiences]);

  const deleteExperience = useCallback(
    async (id: string, position: string) => {
      try {
        await experiencesApi.deleteExperience(id);
        setExperiences(prev => prev.filter(exp => exp._id !== id));
        showSuccess('Eliminado', `Experiencia "${position}" eliminada correctamente`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar experiencia';
        showError('Error', message);
        throw err;
      }
    },
    [showSuccess, showError]
  );

  const handleExperienceUpdate = useCallback((updatedExperience: Experience) => {
    setExperiences(prev =>
      prev.map(exp => (exp._id === updatedExperience._id ? updatedExperience : exp))
    );
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  return {
    experiences,
    loading,
    error,
    refreshExperiences,
    deleteExperience,
    handleExperienceUpdate,
  };
};
