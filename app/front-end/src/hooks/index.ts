// Barrel de hooks - reexporta hooks públicos de la carpeta hooks
export { default as useNavigation } from './useNavigation';
export { default as useNotification, useNotificationContext } from './useNotification';
export { default as useUnifiedTheme } from './useUnifiedTheme';
export { default as useTestimonials } from './useTestimonials';
export { default as useExperience } from './useExperience';
export { default as useEducation } from './useEducation';
export { default as useExperienceSection } from './useExperienceSection';
export { default as useProjectMapper } from './useProjectMapper';
export type { UseProjectMapperReturn } from './useProjectMapper';
export { default as usePagination } from './usePagination';
export type { UsePaginationOptions, UsePaginationReturn } from './usePagination';
export { default as useProjectsFilter } from './useProjectsFilter';
export type {
  UseProjectsFilterReturn,
  FilterType,
  UseProjectsFilterOptions,
} from './useProjectsFilter';
export { default as useProjectModal } from './useProjectModal';
export type { UseProjectModalReturn } from './useProjectModal';
export { default as useProjectsData } from './useProjectsData';
export type { UseProjectsDataReturn } from './useProjectsData';
export * from './useIntersectionObserver';
export * from './usePerformanceMonitoring';
export * from './useSectionsLoading';
export { useEditorModes } from './useEditorModes';
export type { UseEditorModesReturn, EditorMode } from './useEditorModes';

// useResponsive may not exist in this project root; if needed, add it later.

// Agregar más re-exports según se necesite
