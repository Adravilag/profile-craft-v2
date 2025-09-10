import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectModal } from './useProjectModal';
import type { Project as UiProject } from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';

// Mock project data for testing
const mockProject: UiProject = {
  id: '1',
  title: 'Test Project',
  description: 'A test project for modal functionality',
  technologies: ['React', 'TypeScript'],
  demoUrl: 'https://example.com/demo',
  repoUrl: 'https://github.com/test/project',
  media: {
    type: 'image',
    src: '/test-image.jpg',
  },
  type: 'Proyecto',
  status: 'completed',
};

const mockProject2: UiProject = {
  id: '2',
  title: 'Another Test Project',
  description: 'Another test project',
  technologies: ['Vue', 'JavaScript'],
  demoUrl: 'https://example.com/demo2',
  repoUrl: 'https://github.com/test/project2',
  media: {
    type: 'video',
    src: '/test-video.mp4',
    poster: '/test-poster.jpg',
  },
  type: 'Proyecto',
  status: 'in-progress',
};

describe('useProjectModal', () => {
  let result: any;

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useProjectModal());
    result = hookResult;
  });

  describe('Initial State', () => {
    it('should initialize with no active project', () => {
      expect(result.current.activeProject).toBeNull();
    });

    it('should initialize with modal closed', () => {
      expect(result.current.isModalOpen).toBe(false);
    });

    it('should provide openModal function', () => {
      expect(typeof result.current.openModal).toBe('function');
    });

    it('should provide closeModal function', () => {
      expect(typeof result.current.closeModal).toBe('function');
    });
  });

  describe('Opening Modal', () => {
    it('should set active project when openModal is called', () => {
      act(() => {
        result.current.openModal(mockProject);
      });

      expect(result.current.activeProject).toEqual(mockProject);
      expect(result.current.isModalOpen).toBe(true);
    });

    it('should update active project when openModal is called with different project', () => {
      // Open first project
      act(() => {
        result.current.openModal(mockProject);
      });

      expect(result.current.activeProject).toEqual(mockProject);

      // Open second project
      act(() => {
        result.current.openModal(mockProject2);
      });

      expect(result.current.activeProject).toEqual(mockProject2);
      expect(result.current.isModalOpen).toBe(true);
    });

    it('should handle opening modal with same project multiple times', () => {
      act(() => {
        result.current.openModal(mockProject);
      });

      const firstActiveProject = result.current.activeProject;

      act(() => {
        result.current.openModal(mockProject);
      });

      expect(result.current.activeProject).toEqual(firstActiveProject);
      expect(result.current.isModalOpen).toBe(true);
    });
  });

  describe('Closing Modal', () => {
    it('should clear active project when closeModal is called', () => {
      // First open a modal
      act(() => {
        result.current.openModal(mockProject);
      });

      expect(result.current.activeProject).toEqual(mockProject);
      expect(result.current.isModalOpen).toBe(true);

      // Then close it
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.activeProject).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });

    it('should handle closing modal when no modal is open', () => {
      expect(result.current.activeProject).toBeNull();

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.activeProject).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });

    it('should handle multiple close calls', () => {
      // Open modal
      act(() => {
        result.current.openModal(mockProject);
      });

      // Close multiple times
      act(() => {
        result.current.closeModal();
        result.current.closeModal();
      });

      expect(result.current.activeProject).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });
  });

  describe('Modal State Management', () => {
    it('should maintain consistent isModalOpen state', () => {
      // Initially closed
      expect(result.current.isModalOpen).toBe(false);

      // Open modal
      act(() => {
        result.current.openModal(mockProject);
      });

      expect(result.current.isModalOpen).toBe(true);

      // Close modal
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isModalOpen).toBe(false);
    });

    it('should preserve project data integrity', () => {
      act(() => {
        result.current.openModal(mockProject);
      });

      const activeProject = result.current.activeProject;

      // Verify all project properties are preserved
      expect(activeProject.id).toBe(mockProject.id);
      expect(activeProject.title).toBe(mockProject.title);
      expect(activeProject.description).toBe(mockProject.description);
      expect(activeProject.technologies).toEqual(mockProject.technologies);
      expect(activeProject.demoUrl).toBe(mockProject.demoUrl);
      expect(activeProject.repoUrl).toBe(mockProject.repoUrl);
      expect(activeProject.media).toEqual(mockProject.media);
      expect(activeProject.type).toBe(mockProject.type);
      expect(activeProject.status).toBe(mockProject.status);
    });
  });

  describe('Function Stability', () => {
    it('should maintain stable function references', () => {
      const { openModal: initialOpenModal, closeModal: initialCloseModal } = result.current;

      // Trigger a re-render by opening and closing modal
      act(() => {
        result.current.openModal(mockProject);
      });

      act(() => {
        result.current.closeModal();
      });

      // Functions should remain the same reference
      expect(result.current.openModal).toBe(initialOpenModal);
      expect(result.current.closeModal).toBe(initialCloseModal);
    });
  });

  describe('Cleanup', () => {
    it('should clean up state on unmount', () => {
      const { unmount } = renderHook(() => useProjectModal());

      // The cleanup effect should run on unmount
      // This is tested implicitly by the unmount not causing any errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle project with minimal data', () => {
      const minimalProject: UiProject = {
        id: '3',
        title: 'Minimal Project',
      };

      act(() => {
        result.current.openModal(minimalProject);
      });

      expect(result.current.activeProject).toEqual(minimalProject);
      expect(result.current.isModalOpen).toBe(true);
    });

    it('should handle project with undefined optional fields', () => {
      const projectWithUndefined: UiProject = {
        id: '4',
        title: 'Project with undefined fields',
        description: undefined,
        technologies: undefined,
        demoUrl: undefined,
        repoUrl: undefined,
      };

      act(() => {
        result.current.openModal(projectWithUndefined);
      });

      expect(result.current.activeProject).toEqual(projectWithUndefined);
      expect(result.current.isModalOpen).toBe(true);
    });

    it('should handle rapid open/close operations', () => {
      act(() => {
        result.current.openModal(mockProject);
        result.current.closeModal();
        result.current.openModal(mockProject2);
        result.current.closeModal();
        result.current.openModal(mockProject);
      });

      expect(result.current.activeProject).toEqual(mockProject);
      expect(result.current.isModalOpen).toBe(true);
    });
  });
});
