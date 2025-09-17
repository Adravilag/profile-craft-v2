// src/components/sections/skills/components/SkillsGrid.tsx

import React from 'react';
import useRenderCount from '@/utils/useRenderCount';
import SkillCard from '../cards/SkillCard';
import type { SkillsGridProps } from '../../types/skills';
import { debugLog } from '@/utils/debugConfig';
import styles from './SkillsGrid.module.css';

// Move static mapping outside component to avoid recreating on every render
const CATEGORY_ICONS: Record<string, string> = {
  All: 'fas fa-th',
  Destacados: 'fas fa-star',
  Frontend: 'fas fa-paint-brush',
  Backend: 'fas fa-server',
  'DevOps & Tools': 'fas fa-tools',
  'Data Science': 'fas fa-chart-line',
  Mobile: 'fas fa-mobile-alt',
  Cloud: 'fas fa-cloud',
  Testing: 'fas fa-vial',
  'UI/UX': 'fas fa-pencil-ruler',
  Security: 'fas fa-shield-alt',
  MCP: 'fas fa-robot',
  Other: 'fas fa-cogs',
};

const SkillsGrid: React.FC<SkillsGridProps> = ({
  filteredGrouped,
  skillsIcons,
  iconsLoading,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  draggedSkillId,
  selectedSort = {},
  sortingClass = '',
  onSortToggle,
  onCategoryExpand,
  isAdmin = false,
}) => {
  // Estado para controlar la expansión de categorías
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Dev instrumentation: count renders
  useRenderCount && useRenderCount('SkillsGrid', true);

  // Verificar que tenemos iconos
  const iconsLoaded = skillsIcons && skillsIcons.length > 0;

  // Mostrar advertencia SOLO si la carga ya terminó y no hay iconos
  if (typeof iconsLoading !== 'undefined' && iconsLoading === false && !iconsLoaded) {
    console.warn('⚠️ SkillsGrid: No hay iconos cargados');
  }

  // Log para comprobar que los iconos llegan correctamente
  React.useEffect(() => {
    debugLog.dataLoading('🎨 SkillsGrid: skillsIcons recibidos:', skillsIcons?.length || 0);
  }, [skillsIcons]);
  const categoryIcons: Record<string, string> = {
    All: 'fas fa-th',
    Destacados: 'fas fa-star',
    Frontend: 'fas fa-paint-brush',
    Backend: 'fas fa-server',
    'DevOps & Tools': 'fas fa-tools',
    'Data Science': 'fas fa-chart-line',
    Mobile: 'fas fa-mobile-alt',
    Cloud: 'fas fa-cloud',
    Testing: 'fas fa-vial',
    'UI/UX': 'fas fa-pencil-ruler',
    Security: 'fas fa-shield-alt',
    MCP: 'fas fa-robot',
    Other: 'fas fa-cogs',
  };

  // Función para obtener el sort actual de una categoría
  const getCategorySort = React.useCallback(
    (category: string) => {
      return selectedSort[category] || 'alphabetical';
    },
    [selectedSort]
  );

  // Función para determinar si un botón está activo
  const isButtonActive = React.useCallback(
    (category: string, sortType: string) => {
      const currentSort = getCategorySort(category);
      return currentSort.startsWith(sortType);
    },
    [getCategorySort]
  );

  // Función para obtener el icono de dirección
  const getDirectionIcon = React.useCallback(
    (category: string, sortType: string) => {
      const currentSort = getCategorySort(category);
      const isDesc = currentSort.endsWith('_desc');

      if (isButtonActive(category, sortType)) {
        return isDesc ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
      }

      return null;
    },
    [getCategorySort, isButtonActive]
  );

  // Determinar qué categorías mostrar según el estado
  const getCategoriesToShow = React.useMemo(() => {
    const categories = Object.entries(filteredGrouped);

    // Si hay categoría "Destacados" y no estamos expandidos, mostrar solo "Destacados"
    const destacadosEntry = categories.find(([category]) => category === 'Destacados');

    if (destacadosEntry && !isExpanded && categories.length > 1) {
      return [destacadosEntry];
    }

    // Si estamos expandidos o no hay "Destacados", mostrar todas
    return categories;
  }, [filteredGrouped, isExpanded]);

  // Función para manejar la expansión
  const handleToggleExpansion = () => {
    if (isExpanded) {
      // Si estamos expandidos, contraer
      setIsExpanded(false);
    } else {
      // Si estamos contraídos, expandir
      setIsExpanded(true);
      // Notificar al componente padre si quiere cambiar el filtro
      onCategoryExpand?.('All');
    }
  };

  // Verificar si necesitamos mostrar el botón "Mostrar más"
  const shouldShowExpandButton = React.useMemo(() => {
    const categories = Object.keys(filteredGrouped);
    const hasDestacados = 'Destacados' in filteredGrouped;
    const hasMultipleCategories = categories.length > 1;

    // Solo mostrar el botón si:
    // 1. Tenemos "Destacados" Y otras categorías disponibles
    // 2. Y no estamos expandidos (para mostrar "Mostrar más")
    // 3. O estamos expandidos (para mostrar "Mostrar menos")
    return hasDestacados && hasMultipleCategories;
  }, [filteredGrouped]);

  if (Object.entries(filteredGrouped).length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className={`fas fa-code ${styles.emptyIcon}`}></i>
        <h3>No hay habilidades registradas</h3>
        <p>Comienza añadiendo tus primeras habilidades técnicas</p>
      </div>
    );
  }

  return (
    <div className={styles.skillsCategories}>
      {skillsIcons && skillsIcons.length === 0 && (
        <div className={styles.loadingIcons}>
          <p>Cargando iconos de habilidades...</p>
        </div>
      )}
      {getCategoriesToShow.map(([category, skills]) => {
        // Excluir skill llamada 'profilhero' - PERO RESPETAR el orden del parent
        const filtered = (skills || []).filter(s => (s.name || '').toLowerCase() !== 'profilhero');
        // ✅ NO aplicar ordenación propia - usar el orden que viene del parent (sortedFilteredGrouped)
        const sorted = filtered;

        return (
          <div key={category} className={styles.skillsCategory}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryTitle}>
                {CATEGORY_ICONS[category] && (
                  <i className={`${styles.categoryIcon} ${CATEGORY_ICONS[category]}`}></i>
                )}
                {category === 'Destacados' && (
                  <span className={styles.featuredBadge}>Destacados</span>
                )}
                <span className={styles.categoryName}>{category}</span>
                <span className={styles.categoryCount}>{skills.length}</span>
              </h3>
              <div className={styles.sortControls}>
                <span className={styles.sortLabel}>Ordenar por:</span>
                <div className={styles.sortButtons}>
                  <button
                    className={`${styles.sortButton} ${isButtonActive(category, 'alphabetical') ? styles.active : ''}`}
                    onClick={() => onSortToggle?.(category, 'alphabetical')}
                    title="Ordenar alfabéticamente"
                  >
                    <i className="fas fa-sort-alpha-down"></i>
                    <span>Alfabético</span>
                    {getDirectionIcon(category, 'alphabetical') && (
                      <i className={getDirectionIcon(category, 'alphabetical')!}></i>
                    )}
                  </button>
                  <button
                    className={`${styles.sortButton} ${isButtonActive(category, 'difficulty') ? styles.active : ''}`}
                    onClick={() => onSortToggle?.(category, 'difficulty')}
                    title="Ordenar por dificultad"
                  >
                    <i className="fas fa-star"></i>
                    <span>Dificultad</span>
                    {getDirectionIcon(category, 'difficulty') && (
                      <i className={getDirectionIcon(category, 'difficulty')!}></i>
                    )}
                  </button>
                  <button
                    className={`${styles.sortButton} ${isButtonActive(category, 'level') ? styles.active : ''}`}
                    onClick={() => onSortToggle?.(category, 'level')}
                    title="Ordenar por nivel"
                  >
                    <i className="fas fa-percentage"></i>
                    <span>Nivel</span>
                    {getDirectionIcon(category, 'level') && (
                      <i className={getDirectionIcon(category, 'level')!}></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div
              className={`${styles.skillsGrid} ${sortingClass === 'sortChange' ? styles.sortChange : ''}`}
            >
              {sorted.map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  skillsIcons={skillsIcons}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  isDragging={draggedSkillId === skill.id}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Botón "Mostrar más" / "Mostrar menos" */}
      {shouldShowExpandButton && (
        <div className={styles.expandButtonContainer}>
          <button
            className={styles.expandButton}
            onClick={handleToggleExpansion}
            aria-label={isExpanded ? 'Mostrar menos categorías' : 'Mostrar más categorías'}
          >
            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            <span>{isExpanded ? 'Mostrar menos' : 'Mostrar más'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(SkillsGrid);
