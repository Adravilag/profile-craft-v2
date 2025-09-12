// Tests for useProjectData hook
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useProjectData } from '../hooks/useProjectData';
import { getProjectById } from '@/services/endpoints/projects';
import { mockProject, resetAllMocks } from './setup';

// Mock the projects API
vi.mock('@/services/endpoints/projects', () => ({
  getProjectById: vi.fn(),
}));

const mockGetProjectById = getProjectById as ReturnType<typeof vi.fn>;

describe('useProjectData', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useProjectData());

      expect(result.current.project).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.loadProject).toBe('function');
    });
  });

  describe('Loading State', () => {
    it('should set loading to true when loadProject is called', async () => {
      mockGetProjectById.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useProjectData());

      act(() => {
        result.current.loadProject('1');
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.project).toBeNull();
    });

    it('should call getProjectById with correct id', async () => {
      mockGetProjectById.mockResolvedValue(mockProject);

      const { result } = renderHook(() => useProjectData());

      await act(async () => {
        await result.current.loadProject('test-id');
      });

      expect(mockGetProjectById).toHaveBeenCalledWith('test-id');
      expect(mockGetProjectById).toHaveBeenCalledTimes(1);
    });
  });

  describe('Success State', () => {
    it('should set project data and clear loading on successful load', async () => {
      mockGetProjectById.mockResolvedValue(mockProject);

      const { result } = renderHook(() => useProjectData());

      await act(async () => {
        await result.current.loadProject('1');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.project).toEqual(mockProject);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle multiple successful loads', async () => {
      const project1 = { ...mockProject, id: '1', title: 'Project 1' };
      const project2 = { ...mockProject, id: '2', title: 'Project 2' };

      mockGetProjectById.mockResolvedValueOnce(project1).mockResolvedValueOnce(project2);

      const { result } = renderHook(() => useProjectData());

      // Load first project
      await act(async () => {
        await result.current.loadProject('1');
      });

      await waitFor(() => {
        expect(result.current.project).toEqual(project1);
      });

      // Load second project
      await act(async () => {
        await result.current.loadProject('2');
      });

      await waitFor(() => {
        expect(result.current.project).toEqual(project2);
      });

      expect(mockGetProjectById).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error State', () => {
    it('should set error and clear loading on API failure', async () => {
      const errorMessage = 'Failed to load project';
      mockGetProjectById.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProjectData());

      await act(async () => {
        await result.current.loadProject('1');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.project).toBeNull();
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should handle network errors', async () => {
      mockGetProjectById.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProjectData());

      await act(async () => {
        await result.current.loadProject('1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle API errors with custom messages', async () => {
      const apiError = new Error('Project not found');
      mockGetProjectById.mockRejectedValue(apiError);

      const { result } = renderHook(() => useProjectData());

      await act(async () => {
        await result.current.loadProject('nonexistent-id');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Project not found');
        expect(result.current.project).toBeNull();
      });
    });

    it('should clear previous error on new successful load', async () => {
      // First call fails
      mockGetProjectById.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useProjectData());

      await act(async () => {
        await result.current.loadProject('1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // Second call succeeds
      mockGetProjectById.mockResolvedValue(mockProject);

      await act(async () => {
        await result.current.loadProject('1');
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.project).toEqual(mockProject);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty project id', async () => {
      const { result } = renderHook(() => useProjectData());

      await act(async () => {
        await result.current.loadProject('');
      });

      expect(mockGetProjectById).toHaveBeenCalledWith('');
    });

    it('should handle concurrent load requests', async () => {
      let resolveFirst: (value: any) => void;
      let resolveSecond: (value: any) => void;

      const firstPromise = new Promise(resolve => {
        resolveFirst = resolve;
      });
      const secondPromise = new Promise(resolve => {
        resolveSecond = resolve;
      });

      mockGetProjectById.mockReturnValueOnce(firstPromise).mockReturnValueOnce(secondPromise);

      const { result } = renderHook(() => useProjectData());

      // Start both requests
      act(() => {
        result.current.loadProject('1');
        result.current.loadProject('2');
      });

      // Resolve second request first
      act(() => {
        resolveSecond({ ...mockProject, id: '2', title: 'Second Project' });
      });

      await waitFor(() => {
        expect(result.current.project?.id).toBe('2');
      });

      // Resolve first request (should not override second)
      act(() => {
        resolveFirst({ ...mockProject, id: '1', title: 'First Project' });
      });

      // Should still have the second project (last request wins)
      expect(result.current.project?.id).toBe('2');
    });
  });
});
