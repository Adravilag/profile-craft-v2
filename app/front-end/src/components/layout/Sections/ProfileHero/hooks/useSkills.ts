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
  getTopFeaturedSkills: (limit?: number) => Skill[];
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

      // Ordenar skills por nivel de mayor a menor
      const sortedData = [...data].sort((a, b) => {
        const aLevel = a.level || 0;
        const bLevel = b.level || 0;
        return bLevel - aLevel;
      });

      setSkills(sortedData);
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

  const getTopFeaturedSkills = useCallback(
    (limit: number = 8): Skill[] => {
      return skills.filter(skill => skill.featured).slice(0, limit);
    },
    [skills]
  );

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
    getTopFeaturedSkills,
  };
}
