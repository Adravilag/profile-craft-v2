// Barrel de hooks específicos de Experience Section
export { default as useExperienceAdmin } from './useExperienceAdmin';
export { default as useExperienceView } from './useExperienceView';

// Re-export del hook principal desde la carpeta hooks global
export { default as useExperienceSection } from '@/hooks/useExperienceSection';

// Re-export de hooks de componentes específicos
export { useExperienceCard } from '../components/cards/hooks';
export { useExperienceForm } from './useExperienceForm';
export { useChronologicalItem } from '../components/items/hooks';

// Re-export tipos útiles
export type { AdminSection, EditingType } from './useExperienceAdmin';
export type { ViewMode } from './useExperienceView';
