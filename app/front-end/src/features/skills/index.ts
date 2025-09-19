// Barrel exports para el feature skills

// Utils
export { findSkillIcon } from './utils/iconLoader';
export * from './utils/skillUtils';

// Types
export * from './types/skills';

// Hooks
export { useSkills } from './hooks/useSkills';
export { useSkillsIcons } from './hooks/useSkillsIcons';
export { useSkillPreview } from './hooks/useSkillPreview';
export { useFilterFAB } from './hooks/useFilterFAB';
export { useResponsive } from './hooks/useResponsive';
export { useStickyFilter } from './hooks/useStickyFilter';

// Contexts
export { SkillsFilterProvider, useSkillsFilter } from './contexts/SkillsFilterContext';

// Components
export { default as SkillCard } from './components/cards/SkillCard';
export { default as CategoryFilters } from './components/filters/CategoryFilters';
export { default as SkillsFilterFAB } from './components/filters/SkillsFilterFAB';
export { default as SortFilters } from './components/filters/SortFilters';
export { default as SkillsGrid } from './components/grid/SkillsGrid';
export { default as SkillModal } from './components/modal/SkillModal';
export { default as SkillPreviewModal } from './components/modal/SkillPreviewModal';
