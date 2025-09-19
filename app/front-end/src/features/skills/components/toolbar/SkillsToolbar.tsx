import React from 'react';
import styles from './SkillsToolbar.module.css';
import { useTranslation } from '@/contexts/TranslationContext';
import type { SortOption } from '../../types/skills';

interface SkillsToolbarProps {
  selectedSort: Record<string, SortOption>;
  onSortToggle: (category: string, sortType: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isFeaturedActive: boolean;
}

const SkillsToolbar: React.FC<SkillsToolbarProps> = ({
  selectedSort,
  onSortToggle,
  selectedCategory,
  onCategoryChange,
  isFeaturedActive,
}) => {
  const isButtonActive = (sortType: string) => {
    const currentSort = selectedSort[selectedCategory] || 'alphabetical';
    return currentSort.startsWith(sortType);
  };
  const { t } = useTranslation();

  const getDirectionIcon = (sortType: string) => {
    const currentSort = selectedSort[selectedCategory];
    if (isButtonActive(sortType)) {
      return currentSort.endsWith('_desc') ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
    return null;
  };

  return (
    <div className={styles.toolbarContainer} id="skills-toolbar">
      <div className={styles.toolbarContent}>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.featuredButton} ${isFeaturedActive ? styles.active : ''}`}
            onClick={() => onCategoryChange(isFeaturedActive ? 'All' : 'Destacados')}
          >
            <i className="fas fa-star"></i>
            <span>{t.skills.highlights ? 'Destacados' : 'Destacados'}</span>
          </button>
          {/* Aquí se podrían añadir más filtros principales si fuera necesario */}
        </div>

        <div className={styles.sortControls}>
          <span className={styles.sortLabel}>{'Ordenar por:'}</span>
          <div className={styles.sortButtons}>
            <button
              className={`${styles.sortButton} ${isButtonActive('alphabetical') ? styles.active : ''}`}
              onClick={() => onSortToggle(selectedCategory, 'alphabetical')}
              title="Ordenar alfabéticamente"
            >
              <i className="fas fa-sort-alpha-down"></i>
              <span>{'Alfabético'}</span>
              {getDirectionIcon('alphabetical') && (
                <i className={getDirectionIcon('alphabetical')!}></i>
              )}
            </button>
            <button
              className={`${styles.sortButton} ${isButtonActive('difficulty') ? styles.active : ''}`}
              onClick={() => onSortToggle(selectedCategory, 'difficulty')}
              title="Ordenar por dificultad"
            >
              <i className="fas fa-star"></i>
              <span>{'Dificultad'}</span>
              {getDirectionIcon('difficulty') && (
                <i className={getDirectionIcon('difficulty')!}></i>
              )}
            </button>
            <button
              className={`${styles.sortButton} ${isButtonActive('level') ? styles.active : ''}`}
              onClick={() => onSortToggle(selectedCategory, 'level')}
              title="Ordenar por nivel"
            >
              <i className="fas fa-percentage"></i>
              <span>{t.skills.level}</span>
              {getDirectionIcon('level') && <i className={getDirectionIcon('level')!}></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsToolbar;
