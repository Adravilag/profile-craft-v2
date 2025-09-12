// src/components/sections/projects/components/forms/CreateProject.tsx
// Refactored to use the new ProjectForm component while maintaining backward compatibility

import React from 'react';
import ProjectForm from '../ProjectForm/ProjectForm';

/**
 * CreateProject component - Backward compatibility wrapper for ProjectForm
 *
 * This component maintains the original CreateProject interface while internally
 * using the new refactored ProjectForm component. It ensures that existing code
 * that imports and uses CreateProject continues to work without any changes.
 *
 * @deprecated This component is maintained for backward compatibility only.
 * New code should use ProjectForm directly for better flexibility and features.
 *
 * @example
 * ```tsx
 * // Legacy usage (still supported)
 * import CreateProject from './CreateProject';
 * <CreateProject />
 *
 * // Recommended for new code
 * import ProjectForm from './ProjectForm/ProjectForm';
 * <ProjectForm mode="create" />
 * ```
 *
 * @since 1.0.0 (original CreateProject)
 * @since 2.0.0 (refactored as wrapper)
 */
const CreateProject: React.FC = () => {
  // Simply render ProjectForm in create mode (default behavior)
  // This maintains backward compatibility - when no props are provided, it works exactly as before
  return <ProjectForm />;
};

export default CreateProject;
