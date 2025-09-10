import { useState, useMemo, useCallback } from 'react';
import type { Project } from '@/types/api';

export type FilterType = 'all' | 'projects';

export interface UseProjectsFilterReturn {
  selectedFilter: FilterType;
  filteredProjects: Project[];
  setFilter: (filter: FilterType) => void;
  showFilters: boolean;
}

export interface UseProjectsFilterOptions {
  onFilterChange?: (filter: FilterType) => void;
}

/**
 * Custom hook for managing project filtering functionality
 * Extracts filter state management and filtering logic from ProjectsSection
 *
 * @param projects - Array of projects to filter
 * @param options - Optional configuration object
 * @returns Object containing filter state and methods
 */
const useProjectsFilter = (
  projects: Project[],
  options: UseProjectsFilterOptions = {}
): UseProjectsFilterReturn => {
  const { onFilterChange } = options;
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Filter projects based on selected criteria
  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [];
    }

    let filtered = projects;

    // Since "article" type no longer exists, treat projects filter as items without project_content
    if (selectedFilter === 'projects') {
      filtered = projects.filter(project => {
        // Handle null/undefined projects
        if (!project) return false;

        // Check if project_content exists and is not just whitespace
        return !project.project_content || project.project_content.trim() === '';
      });
    }
    // For 'all' filter, return all projects without filtering

    return filtered;
  }, [projects, selectedFilter]);

  // Determine when to show filter UI based on project data
  const showFilters = useMemo(() => {
    if (!projects || projects.length <= 1) {
      return false;
    }

    // Show filters if there are projects (items without project_content or with empty content)
    const hasProjects = projects.some(project => {
      if (!project) return false;
      return !project.project_content || project.project_content.trim() === '';
    });
    return hasProjects;
  }, [projects]);

  // Handle filter changes with callback support
  const setFilter = useCallback(
    (filter: FilterType) => {
      // Validate filter type
      if (filter !== 'all' && filter !== 'projects') {
        console.warn('Invalid filter type provided:', filter, 'Defaulting to "all"');
        filter = 'all';
      }

      setSelectedFilter(filter);

      // Call external callback if provided (e.g., to reset pagination)
      if (onFilterChange) {
        onFilterChange(filter);
      }
    },
    [onFilterChange]
  );

  return {
    selectedFilter,
    filteredProjects,
    setFilter,
    showFilters,
  };
};

export default useProjectsFilter;
