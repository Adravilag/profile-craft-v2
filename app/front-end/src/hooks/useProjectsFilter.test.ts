import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useProjectsFilter, { type FilterType } from './useProjectsFilter';
import type { Project } from '@/types/api';

// Mock project data for testing
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Project 1',
    description: 'A regular project',
    technologies: ['React', 'TypeScript'],
  },
  {
    id: '2',
    title: 'Project 2',
    description: 'Another project',
    project_content: 'This has project content',
    technologies: ['Vue', 'JavaScript'],
  },
  {
    id: '3',
    title: 'Project 3',
    description: 'Third project',
    technologies: ['Angular', 'TypeScript'],
  },
];

const mockProjectsWithContent: Project[] = [
  {
    id: '1',
    title: 'Article 1',
    description: 'An article',
    project_content: 'Article content here',
    technologies: ['Writing'],
  },
  {
    id: '2',
    title: 'Article 2',
    description: 'Another article',
    project_content: 'More article content',
    technologies: ['Documentation'],
  },
];

describe('useProjectsFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with "all" filter selected', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjects));

      expect(result.current.selectedFilter).toBe('all');
    });

    it('should return all projects when filter is "all"', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjects));

      expect(result.current.filteredProjects).toEqual(mockProjects);
      expect(result.current.filteredProjects).toHaveLength(3);
    });

    it('should handle empty projects array', () => {
      const { result } = renderHook(() => useProjectsFilter([]));

      expect(result.current.filteredProjects).toEqual([]);
      expect(result.current.showFilters).toBe(false);
    });

    it('should handle undefined projects array', () => {
      const { result } = renderHook(() => useProjectsFilter(undefined as any));

      expect(result.current.filteredProjects).toEqual([]);
      expect(result.current.showFilters).toBe(false);
    });
  });

  describe('Filter Application Logic', () => {
    it('should filter projects correctly when "projects" filter is selected', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjects));

      act(() => {
        result.current.setFilter('projects');
      });

      expect(result.current.selectedFilter).toBe('projects');
      expect(result.current.filteredProjects).toHaveLength(2);
      expect(result.current.filteredProjects).toEqual([
        mockProjects[0], // Project 1 (no project_content)
        mockProjects[2], // Project 3 (no project_content)
      ]);
    });

    it('should return all projects when "all" filter is selected', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjects));

      // Start with projects filter
      act(() => {
        result.current.setFilter('projects');
      });

      // Switch back to all
      act(() => {
        result.current.setFilter('all');
      });

      expect(result.current.selectedFilter).toBe('all');
      expect(result.current.filteredProjects).toEqual(mockProjects);
      expect(result.current.filteredProjects).toHaveLength(3);
    });

    it('should return empty array when no projects match "projects" filter', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjectsWithContent));

      act(() => {
        result.current.setFilter('projects');
      });

      expect(result.current.filteredProjects).toEqual([]);
      expect(result.current.filteredProjects).toHaveLength(0);
    });

    it('should handle projects with mixed content types', () => {
      const mixedProjects = [...mockProjects, ...mockProjectsWithContent];
      const { result } = renderHook(() => useProjectsFilter(mixedProjects));

      act(() => {
        result.current.setFilter('projects');
      });

      expect(result.current.filteredProjects).toHaveLength(2);
      expect(result.current.filteredProjects.every(p => !p.project_content)).toBe(true);
    });
  });

  describe('Filter State Management', () => {
    it('should maintain filter selection across re-renders', () => {
      const { result, rerender } = renderHook(({ projects }) => useProjectsFilter(projects), {
        initialProps: { projects: mockProjects },
      });

      act(() => {
        result.current.setFilter('projects');
      });

      expect(result.current.selectedFilter).toBe('projects');

      // Re-render with same props
      rerender({ projects: mockProjects });

      expect(result.current.selectedFilter).toBe('projects');
    });

    it('should handle invalid filter types gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useProjectsFilter(mockProjects));

      act(() => {
        result.current.setFilter('invalid' as FilterType);
      });

      expect(result.current.selectedFilter).toBe('all');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid filter type provided:',
        'invalid',
        'Defaulting to "all"'
      );

      consoleSpy.mockRestore();
    });

    it('should call onFilterChange callback when filter changes', () => {
      const onFilterChange = vi.fn();
      const { result } = renderHook(() => useProjectsFilter(mockProjects, { onFilterChange }));

      act(() => {
        result.current.setFilter('projects');
      });

      expect(onFilterChange).toHaveBeenCalledWith('projects');
      expect(onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('should not call onFilterChange callback when not provided', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjects));

      expect(() => {
        act(() => {
          result.current.setFilter('projects');
        });
      }).not.toThrow();
    });
  });

  describe('Show Filters Logic', () => {
    it('should show filters when there are projects and more than one item', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjects));

      expect(result.current.showFilters).toBe(true);
    });

    it('should not show filters when there is only one project', () => {
      const singleProject = [mockProjects[0]];
      const { result } = renderHook(() => useProjectsFilter(singleProject));

      expect(result.current.showFilters).toBe(false);
    });

    it('should not show filters when there are no projects', () => {
      const { result } = renderHook(() => useProjectsFilter([]));

      expect(result.current.showFilters).toBe(false);
    });

    it('should not show filters when all items have project_content', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjectsWithContent));

      expect(result.current.showFilters).toBe(false);
    });

    it('should show filters when there are mixed content types and multiple items', () => {
      const mixedProjects = [...mockProjects, ...mockProjectsWithContent];
      const { result } = renderHook(() => useProjectsFilter(mixedProjects));

      expect(result.current.showFilters).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle projects array with null/undefined items', () => {
      const projectsWithNulls = [mockProjects[0], null as any, mockProjects[1], undefined as any];

      const { result } = renderHook(() => useProjectsFilter(projectsWithNulls));

      expect(result.current.filteredProjects).toHaveLength(4);
      expect(() => {
        act(() => {
          result.current.setFilter('projects');
        });
      }).not.toThrow();
    });

    it('should handle projects with empty project_content', () => {
      const projectsWithEmptyContent: Project[] = [
        {
          id: '1',
          title: 'Project 1',
          project_content: '',
        },
        {
          id: '2',
          title: 'Project 2',
          project_content: '   ',
        },
      ];

      const { result } = renderHook(() => useProjectsFilter(projectsWithEmptyContent));

      act(() => {
        result.current.setFilter('projects');
      });

      // Empty strings and whitespace-only strings are considered as projects (no content)
      expect(result.current.filteredProjects).toHaveLength(2);
    });

    it('should handle rapid filter changes', () => {
      const { result } = renderHook(() => useProjectsFilter(mockProjects));

      act(() => {
        result.current.setFilter('projects');
        result.current.setFilter('all');
        result.current.setFilter('projects');
        result.current.setFilter('all');
      });

      expect(result.current.selectedFilter).toBe('all');
      expect(result.current.filteredProjects).toEqual(mockProjects);
    });
  });

  describe('Performance', () => {
    it('should memoize filtered results when projects and filter do not change', () => {
      const { result, rerender } = renderHook(() => useProjectsFilter(mockProjects));

      const initialFiltered = result.current.filteredProjects;

      // Re-render without changing props
      rerender();

      expect(result.current.filteredProjects).toBe(initialFiltered);
    });

    it('should recalculate filtered results when projects change', () => {
      const { result, rerender } = renderHook(({ projects }) => useProjectsFilter(projects), {
        initialProps: { projects: mockProjects },
      });

      const initialFiltered = result.current.filteredProjects;

      // Re-render with different projects
      rerender({ projects: mockProjectsWithContent });

      expect(result.current.filteredProjects).not.toBe(initialFiltered);
      expect(result.current.filteredProjects).toEqual(mockProjectsWithContent);
    });

    it('should recalculate showFilters when projects change', () => {
      const { result, rerender } = renderHook(({ projects }) => useProjectsFilter(projects), {
        initialProps: { projects: mockProjects },
      });

      expect(result.current.showFilters).toBe(true);

      // Re-render with projects that have content (should not show filters)
      rerender({ projects: mockProjectsWithContent });

      expect(result.current.showFilters).toBe(false);
    });
  });
});
