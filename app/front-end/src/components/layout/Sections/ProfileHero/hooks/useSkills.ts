import { useState, useEffect, useCallback } from 'react';
import { getSkills } from '../../../../../services/api';
import type { Skill } from '../../../../../types/api';

interface UseSkillsReturn {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  refreshSkills: () => Promise<void>;
  getSkillsByCategory: (category: string) => Skill[];
  getAllCategories: () => string[];
}

/**
 * Hook para gestionar las habilidades en el ProfileHero
 * Proporciona funciones para cargar y filtrar skills
 */
export function useSkills(): UseSkillsReturn {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar habilidades');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSkills = useCallback(async () => {
    await loadSkills();
  }, [loadSkills]);

  const getSkillsByCategory = useCallback(
    (category: string): Skill[] => {
      return skills.filter(skill => skill.category === category);
    },
    [skills]
  );

  const getAllCategories = useCallback((): string[] => {
    const categories = new Set(skills.map(skill => skill.category));
    return Array.from(categories).sort();
  }, [skills]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  return {
    skills,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    refreshSkills,
    getSkillsByCategory,
    getAllCategories,
  };
}
