import { useEffect, useState, useCallback } from 'react';
import { experiences as experiencesApi } from '@/services/endpoints';
import type { Experience } from '@/types/api';
import { useNotificationContext } from '@/hooks/useNotification';

const { getExperiences, createExperience, updateExperience, deleteExperience } = experiencesApi;

type CreateExperiencePayload = Omit<Experience, '_id' | 'id' | 'created_at' | 'updated_at'>;
type UpdateExperiencePayload = Partial<CreateExperiencePayload>;

export const useExperience = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { showError, showSuccess } = useNotificationContext();

  const loadExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getExperiences();
      setExperiences(Array.isArray(data) ? data : []);
      setRetryCount(0);
    } catch (err) {
      console.error('Error loading experiences:', err);
      setError('Error al cargar experiencias');
      setExperiences([]);
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const create = useCallback(
    async (payload: CreateExperiencePayload) => {
      try {
        const newExperience = await createExperience(payload as any);
        setExperiences(prev => [...prev, newExperience]);
        showSuccess(
          'Nueva Experiencia Creada',
          `Se ha creado "${newExperience.position}" correctamente`
        );
      } catch (err) {
        console.error('Error creating experience:', err);
        showError('Error', 'No se pudo crear la experiencia');
        throw err;
      }
    },
    [showError, showSuccess]
  );

  const update = useCallback(
    async (id: string, payload: UpdateExperiencePayload) => {
      try {
        const updatedExperience = await updateExperience(id, payload);
        setExperiences(prev =>
          prev.map(exp => (exp._id === id ? { ...exp, ...updatedExperience } : exp))
        );
        showSuccess(
          'Experiencia Actualizada',
          `Se ha actualizado "${updatedExperience.position}" correctamente`
        );
      } catch (err) {
        console.error('Error updating experience:', err);
        showError('Error', 'No se pudo actualizar la experiencia');
        throw err;
      }
    },
    [showError, showSuccess]
  );

  const remove = useCallback(
    async (id: string, title: string) => {
      try {
        await deleteExperience(id);
        setExperiences(prev => prev.filter(exp => exp._id !== id));
        showSuccess('Experiencia Eliminada', `Se ha eliminado "${title}" correctamente`);
      } catch (err) {
        console.error('Error deleting experience:', err);
        showError('Error', 'No se pudo eliminar la experiencia');
        throw err;
      }
    },
    [showError, showSuccess]
  );

  const retry = useCallback(async () => {
    if (retryCount >= 3) return;
    await loadExperiences();
  }, [retryCount, loadExperiences]);

  const refresh = useCallback(async () => {
    await loadExperiences();
  }, [loadExperiences]);

  return {
    experiences,
    loading,
    error,
    retryCount,
    create,
    update,
    remove,
    retry,
    refresh,
  } as const;
};

export default useExperience;
