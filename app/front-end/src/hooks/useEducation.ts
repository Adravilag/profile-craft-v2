import { useEffect, useState, useCallback } from 'react';
import { education as educationApi } from '@/services/endpoints';
import type { Education } from '@/types/api';
import { useNotificationContext } from '@/hooks/useNotification';

const { getEducation, createEducation, updateEducation, deleteEducation } = educationApi;

type CreateEducationPayload = Omit<Education, '_id' | 'id' | 'created_at' | 'updated_at'>;
type UpdateEducationPayload = Partial<CreateEducationPayload>;

export const useEducation = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useNotificationContext();

  const loadEducation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEducation();
      setEducation(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading education:', err);
      setError('Error al cargar educación');
      setEducation([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEducation();
  }, [loadEducation]);

  const create = useCallback(
    async (payload: CreateEducationPayload) => {
      try {
        const newEducation = await createEducation(payload);
        setEducation(prev => [...prev, newEducation]);
        showSuccess(
          'Nueva Formación Académica Creada',
          `Se ha creado "${newEducation.title}" correctamente`
        );
      } catch (err) {
        console.error('Error creating education:', err);
        showError('Error', 'No se pudo crear la formación académica');
        throw err;
      }
    },
    [showError, showSuccess]
  );

  const update = useCallback(
    async (id: number, payload: UpdateEducationPayload) => {
      try {
        const updatedEducation = await updateEducation(id, payload);
        setEducation(prev =>
          prev.map(edu => {
            const eduId = edu._id || edu.id;
            return eduId === id || String(eduId) === String(id)
              ? { ...edu, ...updatedEducation }
              : edu;
          })
        );
        showSuccess(
          'Educación Actualizada',
          `Se ha actualizado "${updatedEducation.title}" correctamente`
        );
      } catch (err) {
        console.error('Error updating education:', err);
        showError('Error', 'No se pudo actualizar la educación');
        throw err;
      }
    },
    [showError, showSuccess]
  );

  const remove = useCallback(
    async (id: number | string, title: string) => {
      if (!id) {
        showError('Error', 'ID de educación no válido');
        throw new Error('ID de educación no válido');
      }

      try {
        const cleanId = String(id).trim();
        await deleteEducation(cleanId);

        setEducation(prev =>
          prev.filter(edu => {
            const eduId = edu._id || edu.id;
            return eduId !== id && eduId !== cleanId && String(eduId) !== cleanId;
          })
        );

        showSuccess('Formación Eliminada', `Se ha eliminado "${title}" correctamente`);
      } catch (err) {
        console.error('Error deleting education:', err);
        showError('Error', 'No se pudo eliminar la formación académica');
        throw err;
      }
    },
    [showError, showSuccess]
  );

  const refresh = useCallback(async () => {
    await loadEducation();
  }, [loadEducation]);

  return {
    education,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  } as const;
};

export default useEducation;
