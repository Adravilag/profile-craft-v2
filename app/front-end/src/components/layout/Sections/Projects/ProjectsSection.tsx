// src/components/sections/projects/ProjectsSection.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '@/services/endpoints';
import ProjectCard from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';
import type { Project as ApiProject } from '@/types/api';
import type { Project as UiProject } from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';
import ProjectModal from '@/components/projects/ProjectModal/ProjectModal';
const { getProjects } = projects;
import { useData } from '@/contexts';
import { debugLog } from '@/utils/debugConfig';
import HeaderSection from '../../HeaderSection/HeaderSection';
import styles from './ProjectsSection.module.css';
import Pagination from '@/ui/components/layout/Pagination';

// Definición de tipos y estados
interface ProjectsSectionProps {
  onProjectClick?: (projectId: string) => void;
  showAdminButton?: boolean;
  onAdminClick?: () => void;
}

// Función de mapeo para normalizar un ApiProject al shape que espera la UI (UiProject)
const mapItemToProject = (item: ApiProject): UiProject => {
  const isProject = !item.project_content;
  const projectType = isProject ? 'Proyecto' : 'Artículo';
  const canonicalPath = `/profile-craft/projects/${item.id}`;

  const detectMedia = () => {
    const videoUrl = (item as any).video_demo_url || (item as any).video_demo || undefined;
    const imageUrl = item.image_url || (item as any).thumbnail || undefined;

    if (videoUrl) {
      return { type: 'video' as const, src: videoUrl, poster: (item as any).thumbnail || imageUrl };
    }

    if (typeof imageUrl === 'string') {
      const lower = imageUrl.split('?')[0].toLowerCase();
      if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) {
        return {
          type: 'video' as const,
          src: imageUrl,
          poster: (item as any).thumbnail || undefined,
        };
      }
      if (lower.endsWith('.gif')) {
        return { type: 'gif' as const, src: imageUrl, poster: (item as any).thumbnail || imageUrl };
      }
    }

    return {
      type: 'image' as const,
      src: imageUrl || '/vite.svg',
      poster: (item as any).thumbnail || imageUrl,
    };
  };

  return {
    id: String(item.id),
    title: String(item.title ?? ''),
    // map both description and shortDescription for the UI component
    description: String(item.description ?? '') || undefined,
    shortDescription: String(item.description ?? '') || undefined,
    technologies: item.technologies || [],
    // expose both camelCase and snake_case urls for compatibility
    demoUrl: item.live_url ? String(item.live_url) : undefined,
    live_url: item.live_url ? String(item.live_url) : undefined,
    repoUrl: item.github_url ? String(item.github_url) : undefined,
    github_url: item.github_url ? String(item.github_url) : undefined,
    video_demo_url: (item as any).video_demo_url || (item as any).video_demo || undefined,
    media: detectMedia() as any,
    projectType: projectType,
    // prefer `type` property as human readable project type; keep `projectType` too
    type: projectType,
    status: item.status as any,
    projectUrl: !isProject ? canonicalPath : undefined,
  } as UiProject;
};

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onProjectClick,
  showAdminButton = false,
  onAdminClick,
}) => {
  const navigate = useNavigate();
  const { projects: contextProjects, projectsLoading, projectsError } = useData();
  const [localProjects, setLocalProjects] = useState<ApiProject[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 3;
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [activeProject, setActiveProject] = useState<UiProject | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'projects' | 'articles'>('all');

  // Usar useMemo para evitar recálculos innecesarios
  const currentProjects = useMemo(() => {
    return contextProjects.length > 0 ? contextProjects : localProjects;
  }, [contextProjects, localProjects]) as ApiProject[];

  const currentLoading =
    projectsLoading || (currentProjects.length === 0 && localProjects.length === 0);
  const currentError = projectsError;

  const getFilteredProjects = useMemo(() => {
    let filtered = currentProjects;

    if (selectedFilter === 'projects') {
      filtered = currentProjects.filter(p => !p.project_content);
    } else if (selectedFilter === 'articles') {
      filtered = currentProjects.filter(p => p.project_content);
    }

    return filtered;
  }, [currentProjects, selectedFilter]);

  const filteredTotalArticles = getFilteredProjects.length;
  const filteredTotalPages = Math.ceil(filteredTotalArticles / articlesPerPage);
  const paginatedFilteredArticles = getFilteredProjects.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  ) as ApiProject[];

  const handlePageChange = (page: number) => {
    // ensure page is in valid range
    const maxPage = Math.max(1, filteredTotalPages);
    const target = Math.min(Math.max(1, page), maxPage);
    if (target === currentPage) return;
    setIsChangingPage(true);
    setTimeout(() => {
      setCurrentPage(target);
      setIsChangingPage(false);
      document.querySelector('#projects')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 100);
  };

  const handleFilterChange = (filter: 'all' | 'projects' | 'articles') => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      debugLog.dataLoading('Proyectos cargados:', data?.length || 0);
      setLocalProjects(data);
    } catch (err) {
      console.error('Error al cargar los proyectos:', err);
    }
  };

  useEffect(() => {
    if (contextProjects.length === 0 && localProjects.length === 0) {
      loadProjects();
    }
  }, [contextProjects.length, localProjects.length]);

  // If the available pages change (filtering / data load), clamp the current page
  useEffect(() => {
    // filteredTotalPages may be 0 when there are no items; keep page at 1 in that case
    const maxPage = Math.max(1, filteredTotalPages);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredTotalPages]);

  const handleAdminClick = () => {
    navigate('/projects/admin');
    onAdminClick?.();
  };

  const hasProjects = currentProjects.some(p => !p.project_content);
  const hasArticles = currentProjects.some(p => p.project_content);
  const showFilters = hasProjects && hasArticles;

  const getDynamicTitle = () => {
    switch (selectedFilter) {
      case 'projects':
        return 'Proyectos Destacados';
      default:
        return 'Proyectos y Artículos';
    }
  };

  const getDynamicIcon = () => {
    switch (selectedFilter) {
      case 'projects':
        return 'fas fa-code';
      default:
        return 'fas fa-th';
    }
  };

  const getDynamicSubtitle = () => {
    if (filteredTotalArticles > articlesPerPage) {
      const contentType =
        selectedFilter === 'all'
          ? 'elementos'
          : selectedFilter === 'projects'
            ? 'proyectos'
            : 'artículos';
      const found = selectedFilter === 'all' ? 'en total' : 'encontrados';
      return `Los ${contentType} más relevantes (${filteredTotalArticles} ${contentType} ${found})`;
    }

    switch (selectedFilter) {
      case 'projects':
        return 'Una selección de mis proyectos más relevantes y sus tecnologías';
      default:
        return 'Una selección de mis proyectos y artículos más relevantes';
    }
  };

  if (currentLoading) {
    return (
      <div className={`section-cv ${styles.projectsSection}`} id="projects">
        <HeaderSection
          icon={getDynamicIcon()}
          title={getDynamicTitle()}
          subtitle={getDynamicSubtitle()}
          className="projects"
        />
        <div className="section-container">
          <div className={styles.panel}>
            <div className={styles.projectsGrid}>
              {[...Array(articlesPerPage)].map((_, index) => (
                <div key={index} className={`${styles.projectCardSkeleton} ${styles.projectRow}`}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonBadges}>
                      <div className={styles.skeletonBadge}></div>
                      <div className={styles.skeletonBadge}></div>
                    </div>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonDescription}>
                      <div className={styles.skeletonLine}></div>
                      <div className={styles.skeletonLine}></div>
                    </div>
                    <div className={styles.skeletonTechs}>
                      <div className={styles.skeletonTech}></div>
                      <div className={styles.skeletonTech}></div>
                      <div className={styles.skeletonTech}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className={`section-cv ${styles.projectsSection}`} id="projects">
        <HeaderSection
          icon="fas fa-project-diagram"
          title="Proyectos Destacados"
          subtitle="Una selección de mis proyectos más relevantes y sus tecnologías"
          className="projects"
        />
        <div className="section-container">
          <div className={styles.panel}>
            <div className={styles.projectsError}>
              <p>{currentError}</p>
              <button onClick={loadProjects} className={styles.retryButton}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentProjects.length === 0) {
    return (
      <div className={`section-cv ${styles.projectsSection}`} id="projects">
        <HeaderSection
          icon="fas fa-project-diagram"
          title="Proyectos Destacados"
          subtitle="Una selección de mis proyectos más relevantes y sus tecnologías"
          className="projects"
        />
        <div className="section-container">
          <div className={styles.panel}>
            <div className={styles.projectsEmpty}>
              <i className="fas fa-project-diagram"></i>
              <p>No hay proyectos publicados aún.</p>
              {showAdminButton && (
                <button onClick={handleAdminClick} className={styles.adminButton}>
                  <i className="fas fa-plus"></i> Crear primer proyecto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-cv" id="projects">
      <HeaderSection
        icon={getDynamicIcon()}
        title={getDynamicTitle()}
        subtitle={
          selectedFilter === 'projects'
            ? 'Explora mis proyectos más recientes y relevantes. Cada uno muestra tecnologías clave y demos.'
            : selectedFilter === 'articles'
              ? 'Lecturas y guías técnicas seleccionadas para compartir aprendizajes y soluciones.'
              : 'Explora mi colección de proyectos técnicos y artículos profundos. Cada uno cuenta una historia de innovación y aprendizaje.'
        }
        className="projects"
      />
      <div className="section-container">
        <div className={styles.panel}>
          {showFilters && (
            <div className={styles.filtersContainer}>
              <button
                className={`${styles.filterButton} ${selectedFilter === 'all' ? styles.active : ''}`}
                onClick={() => handleFilterChange('all')}
                aria-pressed={selectedFilter === 'all'}
              >
                <i className="fas fa-th"></i> Todos
              </button>
              <button
                className={`${styles.filterButton} ${selectedFilter === 'projects' ? styles.active : ''}`}
                onClick={() => handleFilterChange('projects')}
                aria-pressed={selectedFilter === 'projects'}
              >
                <i className="fas fa-code"></i> Proyectos
              </button>
              <button
                className={`${styles.filterButton} ${selectedFilter === 'articles' ? styles.active : ''}`}
                onClick={() => handleFilterChange('articles')}
                aria-pressed={selectedFilter === 'articles'}
              >
                <i className="fas fa-newspaper"></i> Artículos
              </button>
            </div>
          )}

          <div className={`${styles.projectsGrid} ${isChangingPage ? styles.loading : ''}`}>
            {paginatedFilteredArticles.map(item => {
              const projectData = mapItemToProject(item);
              const handleOpen = () => {
                if (onProjectClick) {
                  onProjectClick(String(item.id));
                } else {
                  setActiveProject(projectData);
                }
              };

              return (
                <div
                  key={String(item.id)}
                  className={`${styles.projectCard} ${styles.projectRow}`}
                  role="button"
                  tabIndex={0}
                  onClick={handleOpen}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpen();
                    }
                  }}
                >
                  <ProjectCard project={projectData} />
                </div>
              );
            })}
            {activeProject && (
              <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
            )}
          </div>

          {filteredTotalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={filteredTotalPages}
              onPageChange={handlePageChange}
              totalItems={filteredTotalArticles}
              itemsPerPage={articlesPerPage}
              showInfo={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
