// ProjectForm component exports
// Provides clean imports for the ProjectForm component and its related types

export { default as ProjectForm } from './ProjectForm';
export { useProjectForm } from './hooks/useProjectForm';
export { useProjectData } from './hooks/useProjectData';

// Export types for external usage
export type {
  ProjectFormProps,
  EnhancedProject,
  SeoMetadata,
  TabType,
  UseProjectFormReturn,
  UseProjectDataReturn,
} from './types/ProjectFormTypes';

/**
 * @example
 * ```tsx
 * // Import the main component
 * import { ProjectForm } from './ProjectForm';
 *
 * // Import hooks for custom implementations
 * import { useProjectForm, useProjectData } from './ProjectForm';
 *
 * // Import types for TypeScript
 * import type { ProjectFormProps, EnhancedProject } from './ProjectForm';
 * ```
 */
