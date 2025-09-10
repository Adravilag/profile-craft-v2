import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { Project } from '@/types/api';

// Mock projects API
const mockGetProjects = vi.fn();
vi.mock('@/services/endpoints', () => ({
  projects: {
    getProjects: mockGetProjects,
  },
}));

// Mock DataContext
const mockUseData = vi.fn();
vi.mock('@/contexts/DataContext', () => ({
  useData: mockUseData,
}));

// Mock debug utils
vi.mock('@/utils/debugConfig', () => ({
  debugLog: {
    dataLoading: vi.fn(),
  },
}));

const mockProject: Project = {
  id: '1',
  title: 'Test Project',
  description: 'Test description',
  technologies: ['React', 'TypeScript'],
  github_url: 'https://github.com/test/project',
  live_url: 'https://test-project.com',
  status: 'active',
  created_at: '2023-01-01',
};

describe('useProjectsData', () => {
  let useProjectsData: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the hook
    const hookModule = await import('./useProjectsData');
    useProjectsData = hookModule.useProjectsData;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Context Integration', () => {
    it('should use context projects when available', async () => {
      // Mock context with projects
      mockUseData.mockReturnValue({
        projects: [mockProject],
        projectsLoading: false,
        projectsError: null,
      });

      const { result } = renderHook(() => useProjectsData());

      expect(result.current.projects).toEqual([mockProject]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.hasLoadedLocal).toBe(false);

      // Should not call local API when context has data
      expect(mockGetProjects).not.toHaveBeenCalled();
    });

    it('should show context loading state', async () => {
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: true,
        projectsError: null,
      });

      const { result } = renderHook(() => useProjectsData());

      expect(result.current.loading).toBe(true);
      expect(result.current.projects).toEqual([]);
      expect(mockGetProjects).not.toHaveBeenCalled();
    });

    it('should show context error state', async () => {
      const contextError = 'Context error loading projects';
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: false,
        projectsError: contextError,
      });

      const { result } = renderHook(() => useProjectsData());

      // Wait for any async operations to complete
      await waitFor(() => {
        expect(result.current.error).toBe(contextError);
      });

      // Loading might be true initially if local API is called, then false
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Local API Fallback', () => {
    beforeEach(() => {
      // Mock context with no projects
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: false,
        projectsError: null,
      });
    });

    it('should load local projects when context has no data', async () => {
      mockGetProjects.mockResolvedValueOnce([mockProject]);

      const { result } = renderHook(() => useProjectsData());

      expect(result.current.loading).toBe(true);
      expect(result.current.projects).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([mockProject]);
      expect(result.current.error).toBe(null);
      expect(result.current.hasLoadedLocal).toBe(true);
      expect(mockGetProjects).toHaveBeenCalledTimes(1);
    });

    it('should handle local API errors', async () => {
      const errorMessage = 'Failed to load projects';
      mockGetProjects.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useProjectsData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Error al cargar proyectos');
      expect(result.current.projects).toEqual([]);
      expect(result.current.hasLoadedLocal).toBe(true);
    });

    it('should handle non-array API response', async () => {
      mockGetProjects.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useProjectsData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([]);
      expect(result.current.hasLoadedLocal).toBe(true);
    });

    it('should not load local projects if already loaded', async () => {
      mockGetProjects.mockResolvedValueOnce([mockProject]);

      const { result, rerender } = renderHook(() => useProjectsData());

      await waitFor(() => {
        expect(result.current.hasLoadedLocal).toBe(true);
      });

      expect(mockGetProjects).toHaveBeenCalledTimes(1);

      // Rerender should not trigger another API call
      rerender();
      expect(mockGetProjects).toHaveBeenCalledTimes(1);
    });

    it('should not load local projects while context is loading', async () => {
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: true,
        projectsError: null,
      });

      renderHook(() => useProjectsData());

      // Should not call local API while context is loading
      expect(mockGetProjects).not.toHaveBeenCalled();
    });
  });

  describe('Retry Functionality', () => {
    beforeEach(() => {
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: false,
        projectsError: null,
      });
    });

    it('should retry loading projects', async () => {
      mockGetProjects
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([mockProject]);

      const { result } = renderHook(() => useProjectsData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Error al cargar proyectos');

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([mockProject]);
      expect(result.current.error).toBe(null);
    });

    it('should stop retrying after max attempts', async () => {
      mockGetProjects.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProjectsData());

      // Wait for initial load to fail
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Retry 3 times
      await act(async () => {
        await result.current.retry();
      });
      await act(async () => {
        await result.current.retry();
      });
      await act(async () => {
        await result.current.retry();
      });

      // Fourth retry should not execute
      const callCountBefore = mockGetProjects.mock.calls.length;
      await act(async () => {
        await result.current.retry();
      });
      expect(mockGetProjects.mock.calls.length).toBe(callCountBefore);
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: false,
        projectsError: null,
      });
    });

    it('should refresh projects data', async () => {
      mockGetProjects
        .mockResolvedValueOnce([mockProject])
        .mockResolvedValueOnce([{ ...mockProject, id: '2', title: 'Updated Project' }]);

      const { result } = renderHook(() => useProjectsData());

      await waitFor(() => {
        expect(result.current.hasLoadedLocal).toBe(true);
      });

      expect(result.current.projects).toEqual([mockProject]);

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.projects[0].title).toBe('Updated Project');
      });

      expect(mockGetProjects).toHaveBeenCalledTimes(2);
    });

    it('should reset hasLoadedLocal flag on refresh', async () => {
      mockGetProjects.mockResolvedValue([mockProject]);

      const { result } = renderHook(() => useProjectsData());

      await waitFor(() => {
        expect(result.current.hasLoadedLocal).toBe(true);
      });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.hasLoadedLocal).toBe(true);
      });
    });
  });

  describe('Data Priority', () => {
    it('should prefer context projects over local projects', async () => {
      const contextProject = { ...mockProject, title: 'Context Project' };
      const localProject = { ...mockProject, id: '2', title: 'Local Project' };

      mockGetProjects.mockResolvedValueOnce([localProject]);

      // Start with no context projects
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: false,
        projectsError: null,
      });

      const { result, rerender } = renderHook(() => useProjectsData());

      // Wait for local projects to load
      await waitFor(() => {
        expect(result.current.projects).toEqual([localProject]);
      });

      // Update context to have projects
      mockUseData.mockReturnValue({
        projects: [contextProject],
        projectsLoading: false,
        projectsError: null,
      });

      rerender();

      // Should now use context projects
      expect(result.current.projects).toEqual([contextProject]);
    });

    it('should fall back to local projects when context becomes empty', async () => {
      const contextProject = { ...mockProject, title: 'Context Project' };
      const localProject = { ...mockProject, id: '2', title: 'Local Project' };

      mockGetProjects.mockResolvedValueOnce([localProject]);

      // Start with context projects
      mockUseData.mockReturnValue({
        projects: [contextProject],
        projectsLoading: false,
        projectsError: null,
      });

      const { result, rerender } = renderHook(() => useProjectsData());

      expect(result.current.projects).toEqual([contextProject]);

      // Update context to have no projects
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: false,
        projectsError: null,
      });

      rerender();

      // Should load local projects
      await waitFor(() => {
        expect(result.current.projects).toEqual([localProject]);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading when local API is loading and no context projects', async () => {
      mockUseData.mockReturnValue({
        projects: [],
        projectsLoading: false,
        projectsError: null,
      });

      // Mock a slow API call
      mockGetProjects.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([mockProject]), 100))
      );

      const { result } = renderHook(() => useProjectsData());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should not show local loading when context projects exist', async () => {
      mockUseData.mockReturnValue({
        projects: [mockProject],
        projectsLoading: false,
        projectsError: null,
      });

      const { result } = renderHook(() => useProjectsData());

      expect(result.current.loading).toBe(false);
    });
  });
});
