// src/components/sections/skills/components/SortFilters.tsx

import React from 'react';
import type { SortOption } from '../../types/skills';
import styles from './SortFilters.module.css';

export type SortDirection = 'asc' | 'desc';

export interface SortOptionConfig {
  key: string;
  direction?: SortDirection;
}

interface SortFiltersProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SortFilters: React.FC<SortFiltersProps> = ({ selectedSort, onSortChange }) => {
  const sortOptions = [
    {
      key: 'alphabetical' as SortOption,
      label: 'Alfabético',
      icon: 'fas fa-sort-alpha-down',
      description: 'Ordenar alfabéticamente',
    },
    {
      key: 'difficulty' as SortOption,
      label: 'Dificultad',
      icon: 'fas fa-star',
      description: 'Ordenar por dificultad',
    },
    {
      key: 'level' as SortOption,
      label: 'Nivel',
      icon: 'fas fa-percentage',
      description: 'Ordenar por nivel de dominio',
    },
    {
      key: 'popularity' as SortOption,
      label: 'Popularidad',
      icon: 'fas fa-fire',
      description: 'Ordenar por popularidad',
    },
  ];
  const handleSortChange = (newSort: SortOption) => {
    onSortChange(newSort);
  };

  // Función para determinar si una opción está activa (incluyendo sus variantes desc)
  const isOptionActive = (optionKey: SortOption) => {
    if (optionKey === 'alphabetical') {
      return selectedSort === 'alphabetical' || selectedSort === 'alphabetical_desc';
    }
    if (optionKey === 'difficulty') {
      return selectedSort === 'difficulty' || selectedSort === 'difficulty_desc';
    }
    if (optionKey === 'level') {
      return selectedSort === 'level' || selectedSort === 'level_desc';
    }
    return false;
  };
  return (
    <div className={styles.sortFilters}>
      <div className={styles.sortLabel}>
        <i className="fas fa-sort"></i>
        Ordenar por:
      </div>
      <div className={styles.sortButtons}>
        {sortOptions.map(option => {
          const isActive = isOptionActive(option.key);

          return (
            <button
              key={option.key}
              className={`${styles.sortBtn} ${isActive ? styles.active : ''}`}
              onClick={() => handleSortChange(option.key)}
              title={option.description}
            >
              <i className={option.icon}></i>
              <span className={styles.sortText}>{option.label}</span>
              {isActive && <i className={`fas fa-check ${styles.sortCheck}`}></i>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SortFilters;
