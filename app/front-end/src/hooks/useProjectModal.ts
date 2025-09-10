import { useState, useCallback, useEffect } from 'react';
import type { Project as UiProject } from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';

export interface UseProjectModalReturn {
  activeProject: UiProject | null;
  openModal: (project: UiProject) => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

/**
 * Custom hook for managing modal state for project details
 * Handles opening/closing modals and proper state cleanup
 */
export const useProjectModal = (): UseProjectModalReturn => {
  const [activeProject, setActiveProject] = useState<UiProject | null>(null);

  /**
   * Opens the modal with the specified project
   */
  const openModal = useCallback((project: UiProject) => {
    setActiveProject(project);
  }, []);

  /**
   * Closes the modal and clears the active project
   */
  const closeModal = useCallback(() => {
    setActiveProject(null);
  }, []);

  /**
   * Computed property to check if modal is open
   */
  const isModalOpen = activeProject !== null;

  /**
   * Cleanup effect to ensure modal state is cleared on unmount
   */
  useEffect(() => {
    return () => {
      setActiveProject(null);
    };
  }, []);

  return {
    activeProject,
    openModal,
    closeModal,
    isModalOpen,
  };
};

export default useProjectModal;
