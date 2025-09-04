// src/features/skills/contexts/SkillsFilterContext.tsx

import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSkills } from '../hooks/useSkills';

interface SkillsFilterContextType {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  skillsGrouped: Record<string, any[]>;
  categories: string[];
  filteredGrouped: Record<string, any[]>;
  loading: boolean;
  error: string | null;
}

const SkillsFilterContext = createContext<SkillsFilterContextType | undefined>(undefined);

interface SkillsFilterProviderProps {
  children: ReactNode;
}

export const SkillsFilterProvider: React.FC<SkillsFilterProviderProps> = ({ children }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    getGroupedSkills,
    getFilteredGrouped,
    getAllCategories,
    loading,
    error,
  } = useSkills();

  const value: SkillsFilterContextType = {
    selectedCategory,
    setSelectedCategory,
    skillsGrouped: getGroupedSkills(),
    categories: getAllCategories(),
    filteredGrouped: getFilteredGrouped(),
    loading,
    error,
  };

  return <SkillsFilterContext.Provider value={value}>{children}</SkillsFilterContext.Provider>;
};

export const useSkillsFilter = (): SkillsFilterContextType => {
  const context = useContext(SkillsFilterContext);
  if (context === undefined) {
    throw new Error('useSkillsFilter must be used within a SkillsFilterProvider');
  }
  return context;
};
