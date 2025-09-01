import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Project } from '@/types/api';
import { projects as projectsApi } from '@/services/endpoints';
import { useNotificationContext } from '@/hooks/useNotification';

interface UseProjectsSectionProps {
  isAdminMode?: boolean;
  featuredOnly?: boolean;
}

interface UseProjectsSectionReturn {
  projects: Project[];
  featuredProjects: Project[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filteredProjects: Project[];
  setSearchTerm: (term: string) => void;
  refreshProjects: () => Promise<void>;
  deleteProject: (id: string, title: string) => Promise<void>;
  handleProjectUpdate: (project: Project) => void;
}

/**
 * Hook privado para la sección de proyectos.
 * Maneja la carga, filtrado y administración de proyectos.
 */
export const useProjectsSection = ({
  isAdminMode = false,
  featuredOnly = false,
}: UseProjectsSectionProps = {}): UseProjectsSectionReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useNotificationContext();

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = isAdminMode
        ? await projectsApi.getAdminProjects()
        : await projectsApi.getProjects();
      setProjects(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading projects';
      setError(message);
      if (isAdminMode) {
        showError('Error', message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAdminMode, showError]);

  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  const deleteProject = useCallback(
    async (id: string, title: string) => {
      try {
        await projectsApi.deleteProject(id);
        setProjects(prev => prev.filter(project => project.id !== id));
        showSuccess('Eliminado', `Proyecto "${title}" eliminado correctamente`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar proyecto';
        showError('Error', message);
        throw err;
      }
    },
    [showSuccess, showError]
  );

  const handleProjectUpdate = useCallback((updatedProject: Project) => {
    setProjects(prev =>
      prev.map(project => (project.id === updatedProject.id ? updatedProject : project))
    );
  }, []);

  // Proyectos destacados
  const featuredProjects = useMemo(
    () => projects.filter(project => project.featured === true),
    [projects]
  );

  // Proyectos filtrados por búsqueda
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) {
      return featuredOnly ? featuredProjects : projects;
    }

    const filtered = projects.filter(
      project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return featuredOnly ? filtered.filter(p => p.featured) : filtered;
  }, [projects, featuredProjects, searchTerm, featuredOnly]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    featuredProjects,
    loading,
    error,
    searchTerm,
    filteredProjects,
    setSearchTerm,
    refreshProjects,
    deleteProject,
    handleProjectUpdate,
  };
};
