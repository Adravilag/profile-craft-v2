import { useEffect, useState, useCallback } from 'react';
import { projects as projectsApi } from '@/services/endpoints';
import type { Project } from '@/types/api';
import { useData } from '@/contexts/DataContext';
import { debugLog } from '@/utils/debugConfig';

const { getProjects } = projectsApi;

export interface UseProjectsDataReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  hasLoadedLocal: boolean;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useProjectsData = (): UseProjectsDataReturn => {
  const { projects: contextProjects, projectsLoading, projectsError } = useData();
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasLoadedLocal, setHasLoadedLocal] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const loadLocalProjects = useCallback(async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);

      const data = await getProjects();
      setLocalProjects(Array.isArray(data) ? data : []);
      setHasLoadedLocal(true);
      setRetryCount(0);

      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading('useProjectsData: Local projects loaded:', data?.length || 0);
      }
    } catch (err) {
      console.error('Error loading local projects:', err);
      setLocalError('Error al cargar proyectos');
      setLocalProjects([]);
      setHasLoadedLocal(true);
      setRetryCount(prev => prev + 1);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // Load local projects when context projects are not available
  useEffect(() => {
    // Only load local projects if:
    // 1. No context projects available
    // 2. Haven't attempted to load local projects yet
    // 3. Context is not currently loading
    if (!contextProjects?.length && !hasLoadedLocal && !projectsLoading) {
      loadLocalProjects();
    }
  }, [contextProjects?.length, hasLoadedLocal, projectsLoading, loadLocalProjects]);

  const retry = useCallback(async () => {
    if (retryCount >= 3) return;
    await loadLocalProjects();
  }, [retryCount, loadLocalProjects]);

  const refresh = useCallback(async () => {
    setHasLoadedLocal(false);
    setRetryCount(0);
    await loadLocalProjects();
  }, [loadLocalProjects]);

  // Determine which data source to use
  const projects = contextProjects?.length ? contextProjects : localProjects;

  // Determine loading state - loading if context is loading OR local is loading
  const loading = projectsLoading || (localLoading && !contextProjects?.length);

  // Determine error state - prefer context error, fallback to local error
  const error = projectsError || (contextProjects?.length ? null : localError);

  return {
    projects,
    loading,
    error,
    hasLoadedLocal,
    retry,
    refresh,
  } as const;
};

export default useProjectsData;
