import React, { useState, useCallback, useEffect } from 'react';
import {
  useSkills,
  useSkillsIcons,
  SkillsGrid,
  SkillModal,
  useSkillsFilter,
  type SortOption,
} from '@/features/skills';
import HeaderSection from '../../HeaderSection/HeaderSection';
import { debugLog } from '@/utils/debugConfig';
import { useFab } from '@/contexts/FabContext';
import styles from './SkillsSection.module.css';

interface SkillsSectionProps {
  showAdminFAB?: boolean;
  // Props opcionales para sincronizar con filtros externos (retrocompatibilidad para tests)
  externalSelectedCategory?: string;
  onExternalCategoryChange?: (category: string) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  showAdminFAB = false,
  externalSelectedCategory,
  onExternalCategoryChange,
}) => {
  const { onOpenSkillModal } = useFab();

  // Usar el contexto de filtros
  const skillsFilterContext = useSkillsFilter();

  // Usar el hook principal de skills
  const {
    loading,
    error,
    showModal,
    newSkill,
    editingId,
    draggedSkillId,
    selectedCategory: internalSelectedCategory,
    setSelectedCategory: internalSetSelectedCategory,
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleFormChangeWithIcon,
    handleAddSkill,
    handleEditSkill,
    handleDeleteSkill,
    handleDragStart,
    handleDragOver,
    handleDrop,
    getFilteredGrouped,
    getGroupedSkills,
    getAllCategories,
  } = useSkills();

  // Prioridad: props externos > contexto > estado interno
  const selectedCategory =
    externalSelectedCategory ?? skillsFilterContext.selectedCategory ?? internalSelectedCategory;
  const setSelectedCategory =
    onExternalCategoryChange ??
    skillsFilterContext.setSelectedCategory ??
    internalSetSelectedCategory;

  // Cargar iconos de skills
  const { skillsIcons } = useSkillsIcons();

  // Estado local para sorting
  const [selectedSort, setSelectedSort] = useState<Record<string, SortOption>>({});
  const [sortingClass, setSortingClass] = useState('');

  // Conectar el FAB con el modal
  useEffect(() => {
    const cleanup = onOpenSkillModal(() => {
      handleOpenModal();
    });
    return cleanup;
  }, [onOpenSkillModal, handleOpenModal]);

  // Handler para la expansión de categorías
  const handleCategoryExpansion = useCallback(
    (category: string) => {
      debugLog.dataLoading(`🔄 Expanding to category: ${category}`);
      setSelectedCategory(category);
    },
    [setSelectedCategory]
  );

  // Handler para toggle de ordenamiento
  const handleSortToggle = useCallback((category: string, sortType: string = 'alphabetical') => {
    debugLog.dataLoading(`🔄 Toggling sort for category: ${category}, type: ${sortType}`);

    setSortingClass('sortChange');
    setTimeout(() => setSortingClass(''), 300);

    setSelectedSort(prev => {
      const currentSort = prev[category] || 'alphabetical';
      let newSort: SortOption;

      // Si ya está activo el mismo tipo, cambiar dirección
      if (currentSort.startsWith(sortType)) {
        newSort = currentSort.endsWith('_desc')
          ? (sortType as SortOption)
          : (`${sortType}_desc` as SortOption);
      } else {
        newSort = sortType as SortOption;
      }

      return {
        ...prev,
        [category]: newSort,
      };
    });
  }, []);

  // Obtener datos filtrados y agrupados - usar contexto si está disponible
  const filteredGrouped =
    skillsFilterContext.filteredGrouped &&
    Object.keys(skillsFilterContext.filteredGrouped).length > 0
      ? skillsFilterContext.filteredGrouped
      : getFilteredGrouped();
  const allCategories = getAllCategories();

  // Aplicar sorting a los grupos filtrados
  const sortedFilteredGrouped = React.useMemo(() => {
    const result: Record<string, any[]> = {};

    Object.entries(filteredGrouped).forEach(([category, skillsInCategory]) => {
      const sortOption = selectedSort[category] || 'alphabetical';
      const [sortType, direction] = sortOption.split('_');
      const isDesc = direction === 'desc';

      let sorted = [...skillsInCategory];

      switch (sortType) {
        case 'alphabetical':
          sorted.sort((a, b) => {
            const comparison = (a.name || '').localeCompare(b.name || '');
            return isDesc ? -comparison : comparison;
          });
          break;
        case 'difficulty':
          sorted.sort((a, b) => {
            const aDiff = (a as any).difficulty_level || 0;
            const bDiff = (b as any).difficulty_level || 0;
            const comparison = aDiff - bDiff;
            return isDesc ? -comparison : comparison;
          });
          break;
        case 'level':
          sorted.sort((a, b) => {
            const aLevel = a.level || 0;
            const bLevel = b.level || 0;
            const comparison = aLevel - bLevel;
            return isDesc ? -comparison : comparison;
          });
          break;
        default:
          // Sin ordenamiento adicional
          break;
      }

      result[category] = sorted;
    });

    return result;
  }, [filteredGrouped, selectedSort]);

  // Handler para el submit del modal
  const handleModalSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      await handleAddSkill(e, skillsIcons);
    },
    [handleAddSkill, skillsIcons]
  );

  const getDynamicTitle = () => {
    return 'Habilidades';
  };

  const getDynamicIcon = () => {
    return 'fas fa-tools';
  };

  const getDynamicSubtitle = () => {
    return 'Competencias técnicas y conocimientos';
  };

  if (loading) {
    return (
      <div className={`section-cv ${styles.projectsSection}`} id="skills">
        <HeaderSection
          icon={getDynamicIcon()}
          title={getDynamicTitle()}
          subtitle={getDynamicSubtitle()}
          className="projects"
        />
        <div className="section-container">
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando habilidades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`section-cv ${styles.projectsSection}`} id="skills">
        <HeaderSection
          icon="fas fa-exclamation-triangle"
          title="Habilidades"
          subtitle={`Error al cargar las habilidades: ${error}`}
          className="projects"
        />
        <div className="section-container">
          <div className={styles.errorContainer}>
            <i className="fas fa-exclamation-triangle"></i>
            <p>Error al cargar las habilidades: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`section-cv ${styles.projectsSection}`} id="skills">
      <HeaderSection
        icon={getDynamicIcon()}
        title={getDynamicTitle()}
        subtitle={getDynamicSubtitle()}
        className="projects"
      />
      <div className="section-container">
        {/* Grid de skills */}
        <div className={styles.skillsContent}>
          <SkillsGrid
            filteredGrouped={sortedFilteredGrouped}
            skillsIcons={skillsIcons}
            onEdit={handleEditSkill}
            onDelete={handleDeleteSkill}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedSkillId={draggedSkillId as number | null}
            selectedSort={selectedSort}
            sortingClass={sortingClass}
            onSortToggle={handleSortToggle}
            onCategoryExpand={handleCategoryExpansion}
            isAdmin={showAdminFAB}
          />
        </div>

        {/* Modal de skills */}
        {showModal && (
          <SkillModal
            isOpen={showModal}
            editingId={editingId}
            formData={newSkill}
            skillsIcons={skillsIcons}
            onClose={handleCloseModal}
            onSubmit={handleModalSubmit}
            onFormChange={handleFormChange}
            onFormChangeWithIcon={handleFormChangeWithIcon}
            isAdmin={showAdminFAB}
          />
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
