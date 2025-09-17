import React, { useState, useCallback, useEffect } from 'react';
import {
  useSkillsIcons,
  SkillsGrid,
  SkillModal,
  useSkillsFilter,
  type SortOption,
  useSkills,
} from '@/features/skills';
import HeaderSection from '../../HeaderSection/HeaderSection';
import { debugLog } from '@/utils/debugConfig';
import { useFab } from '@/contexts/FabContext';
import { useAuth } from '@/contexts/AuthContext';
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
  const { isAuthenticated } = useAuth();

  // Determinar si mostrar funciones de admin basado en autenticación
  const isAdmin = isAuthenticated && showAdminFAB;

  // Usar el contexto de filtros
  const skillsFilterContext = useSkillsFilter();

  // Usar el hook migrado de skills
  const {
    skills,
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
  const { skillsIcons: rawSkillsIcons, loadingExternalData, loadingIcons } = useSkillsIcons();
  // Memoize skillsIcons to avoid identity changes
  const skillsIcons = React.useMemo(() => rawSkillsIcons, [rawSkillsIcons]);

  // Estado local para sorting
  const [selectedSort, setSelectedSort] = useState<Record<string, SortOption>>({});
  const [sortingClass, setSortingClass] = useState('');

  // Conectar el FAB con el modal
  // Memoize handler and register FAB listener only when admin and callback available
  const handleFabOpen = useCallback(() => {
    handleOpenModal();
  }, [handleOpenModal]);

  useEffect(() => {
    if (!isAdmin) return;
    if (typeof onOpenSkillModal !== 'function') return;

    const unregister = onOpenSkillModal(handleFabOpen);
    return () => {
      if (typeof unregister === 'function') unregister();
    };
  }, [isAdmin, onOpenSkillModal, handleFabOpen]);

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
            // [IMPLEMENTACION] - Obtener dificultad desde skillsIcons ya que Skill no tiene difficulty_level
            const getSkillDifficulty = (skillName: string): number => {
              const skillIcon = skillsIcons.find(
                icon => icon.name.toLowerCase() === skillName.toLowerCase()
              );
              if (skillIcon?.difficulty_level) {
                const difficultyStr = String(skillIcon.difficulty_level).toLowerCase();
                // Convertir string a número (beginner=1, intermediate=2, advanced=3, expert=4)
                if (difficultyStr.includes('beginner') || difficultyStr === '1') return 1;
                if (difficultyStr.includes('intermediate') || difficultyStr === '2') return 2;
                if (difficultyStr.includes('advanced') || difficultyStr === '3') return 3;
                if (difficultyStr.includes('expert') || difficultyStr === '4') return 4;
                // Si es un número directo, usarlo
                const numValue = parseInt(difficultyStr);
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) return numValue;
              }
              return 2; // Default: intermediate
            };

            const aDiff = getSkillDifficulty(a.name || '');
            const bDiff = getSkillDifficulty(b.name || '');
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
  }, [filteredGrouped, selectedSort, skillsIcons, skills]); // [IMPLEMENTACION] Añadir skills como dependencia para forzar recálculo

  // Handler para el submit del modal
  const handleModalSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      await handleAddSkill(e, skillsIcons);
      // [IMPLEMENTACION] Forzar actualización del componente tras añadir/editar skill
      // Esto garantiza que getFilteredGrouped y sortedFilteredGrouped se recalculen
    },
    [handleAddSkill, skillsIcons]
  );

  const getDynamicTitle = React.useMemo(() => 'Habilidades', []);
  const getDynamicIcon = React.useMemo(() => 'fas fa-tools', []);
  const getDynamicSubtitle = React.useMemo(() => 'Competencias técnicas y conocimientos', []);

  if (loading) {
    return (
      <div className={`section-cv`} id="skills">
        <HeaderSection
          icon={getDynamicIcon}
          title={getDynamicTitle}
          subtitle={getDynamicSubtitle}
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
      <div className={`section-cv`} id="skills">
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
    <div className={`section-cv`} id="skills">
      <HeaderSection
        icon={getDynamicIcon}
        title={getDynamicTitle}
        subtitle={getDynamicSubtitle}
        className="projects"
      />
      <div className="section-container">
        {/* Grid de skills */}
        <div className={styles.skillsContent}>
          <SkillsGrid
            filteredGrouped={sortedFilteredGrouped}
            skillsIcons={skillsIcons}
            iconsLoading={loadingIcons}
            onEdit={React.useCallback((s: any) => handleEditSkill(s), [handleEditSkill])}
            onDelete={React.useCallback((id: any) => handleDeleteSkill(id), [handleDeleteSkill])}
            onDragStart={React.useCallback((id: any) => handleDragStart(id), [handleDragStart])}
            onDragOver={React.useCallback(
              (e: React.DragEvent<HTMLDivElement>) => handleDragOver(e),
              [handleDragOver]
            )}
            onDrop={React.useCallback((id: any) => handleDrop(id), [handleDrop])}
            draggedSkillId={draggedSkillId as number | null}
            selectedSort={selectedSort}
            sortingClass={sortingClass}
            onSortToggle={handleSortToggle}
            onCategoryExpand={handleCategoryExpansion}
            isAdmin={isAdmin}
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
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
