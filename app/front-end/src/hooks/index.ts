// Barrel de hooks - reexporta hooks públicos de la carpeta hooks
export { default as useNavigation } from './useNavigation';
export { default as useNotification, useNotificationContext } from './useNotification';
export { default as useUnifiedTheme } from './useUnifiedTheme';
export { default as useTestimonials } from './useTestimonials';
export { default as useExperience } from './useExperience';
export { default as useEducation } from './useEducation';
export { default as useExperienceSection } from './useExperienceSection';
export * from './useIntersectionObserver';
export * from './usePerformanceMonitoring';
export * from './useSectionsLoading';

// useResponsive may not exist in this project root; if needed, add it later.

// Agregar más re-exports según se necesite
