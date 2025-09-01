import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Skill } from '@/types/api';
import { skills as skillsApi } from '@/services/endpoints';
import { useNotificationContext } from '@/hooks/useNotification';

interface UseSkillsSectionProps {
  isAdminMode?: boolean;
  minLevel?: number;
}

interface UseSkillsSectionReturn {
  skills: Skill[];
  skillsByCategory: Record<string, Skill[]>;
  featuredSkills: Skill[];
  loading: boolean;
  error: string | null;
  refreshSkills: () => Promise<void>;
  deleteSkill: (id: string, name: string) => Promise<void>;
  handleSkillUpdate: (skill: Skill) => void;
}

/**
 * Hook privado para la sección de habilidades.
 * Maneja la carga, categorización y administración de skills.
 */
export const useSkillsSection = ({
  isAdminMode = false,
  minLevel = 0,
}: UseSkillsSectionProps = {}): UseSkillsSectionReturn => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotificationContext();

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await skillsApi.getSkills();
      setSkills(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading skills';
      setError(message);
      if (isAdminMode) {
        showError('Error', message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAdminMode, showError]);

  const refreshSkills = useCallback(async () => {
    await loadSkills();
  }, [loadSkills]);

  const deleteSkill = useCallback(
    async (id: string, name: string) => {
      try {
        await skillsApi.deleteSkill(Number(id));
        setSkills(prev => prev.filter(skill => skill.id !== id));
        showSuccess('Eliminado', `Skill "${name}" eliminado correctamente`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar skill';
        showError('Error', message);
        throw err;
      }
    },
    [showSuccess, showError]
  );

  const handleSkillUpdate = useCallback((updatedSkill: Skill) => {
    setSkills(prev => prev.map(skill => (skill.id === updatedSkill.id ? updatedSkill : skill)));
  }, []);

  // Skills agrupados por categoría
  const skillsByCategory = useMemo(() => {
    return skills
      .filter(skill => (skill.level || 0) >= minLevel)
      .reduce(
        (acc, skill) => {
          const category = skill.category || 'Sin categoría';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(skill);
          return acc;
        },
        {} as Record<string, Skill[]>
      );
  }, [skills, minLevel]);

  // Skills destacados (featured o con nivel alto)
  const featuredSkills = useMemo(
    () => skills.filter(skill => skill.featured === true || (skill.level && skill.level >= 80)),
    [skills]
  );

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  return {
    skills,
    skillsByCategory,
    featuredSkills,
    loading,
    error,
    refreshSkills,
    deleteSkill,
    handleSkillUpdate,
  };
};
