// src/components/sections/projects/ProjectsSection.tsx

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';
import type { Project as UiProject } from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';
import { useAuth } from '@/contexts/AuthContext';
import HeaderSection from '../../HeaderSection/HeaderSection';
import styles from './ProjectsSection.module.css';
import Pagination from '@/ui/components/layout/Pagination';
import { useTranslation } from '@/contexts/TranslationContext';
import { useProjectsData, usePagination, useProjectsFilter, useProjectMapper } from '@/hooks';

// Definición de tipos y estados
interface ProjectsSectionProps {
  onProjectClick?: (projectId: string) => void;
  // showAdminButton y onAdminClick removidos - administración vía FAB
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onProjectClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Use custom hooks for data management and logic
  const { projects, loading, error, retry } = useProjectsData();
  const { mapItemToProject } = useProjectMapper();

  // Set up filtering with callback to reset pagination
  const { selectedFilter, filteredProjects, setFilter, showFilters } = useProjectsFilter(projects, {
    onFilterChange: () => {
      // Reset pagination when filter changes - handled by pagination hook
    },
  });

  // Ordenar proyectos por fecha descendente (más reciente primero)
  const sortedFilteredProjects = useMemo(() => {
    if (!filteredProjects || filteredProjects.length === 0) return [] as typeof filteredProjects;

    return [...filteredProjects].sort((a: any, b: any) => {
      const aDate = a?.published_at ?? a?.created_at ?? null;
      const bDate = b?.published_at ?? b?.created_at ?? null;
      const ta = aDate ? new Date(aDate).getTime() : 0;
      const tb = bDate ? new Date(bDate).getTime() : 0;
      return tb - ta; // descendente: más reciente primero
    });
  }, [filteredProjects]);

  // Set up pagination (use sorted list length)
  const articlesPerPage = 3;
  const { currentPage, totalPages, paginatedItems, handlePageChange, isChangingPage } =
    usePagination({
      totalItems: sortedFilteredProjects.length,
      itemsPerPage: articlesPerPage,
      initialPage: 1,
    });

  // Get paginated items for current page from sorted list
  const paginatedFilteredItems = paginatedItems(sortedFilteredProjects);

  // Handle filter changes with pagination reset
  const handleFilterChange = (filter: 'all' | 'projects') => {
    setFilter(filter);
    // Pagination will automatically reset to page 1 due to totalItems change
  };

  if (loading) {
    return (
      <div className={`section-cv`} id="projects">
        <HeaderSection
          icon="fas fa-code"
          title="Proyectos"
          subtitle="Explora mis proyectos y desarrollos más destacados"
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

  if (error) {
    return (
      <div className={`section-cv`} id="projects">
        <HeaderSection
          icon="fas fa-code"
          title="Proyectos"
          subtitle="Explora mis proyectos y desarrollos más destacados"
          className="projects"
        />
        <div className="section-container">
          <div className={styles.panel}>
            <div className={styles.projectsError}>
              <p>{error}</p>
              <button onClick={retry} className={styles.retryButton}>
                {t.projectsCarousel.retry}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={`section-cv`} id="projects">
        <HeaderSection
          icon="fas fa-code"
          title="Proyectos"
          subtitle="Explora mis proyectos y desarrollos más destacados"
          className="projects"
        />
        <div className="section-container">
          <div className={styles.panel}>
            <div className={styles.projectsEmpty}>
              <i className="fas fa-project-diagram"></i>
              <p>{t.projectsCarousel.noProjects}</p>
              {/* Botón de administración movido al FAB para centralizar control */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`section-cv`} id="projects" data-section="projects">
      <HeaderSection
        icon="fas fa-code"
        title="Proyectos"
        subtitle="Explora mis proyectos y desarrollos más destacados"
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
                <i className="fas fa-th"></i> {t.actions.showAll}
              </button>
              <button
                className={`${styles.filterButton} ${selectedFilter === 'projects' ? styles.active : ''}`}
                onClick={() => handleFilterChange('projects')}
                aria-pressed={selectedFilter === 'projects'}
              >
                <i className="fas fa-code"></i> {t.projects.title}
              </button>
              {/* 'Article' type doesn't exist — we only show All and Projects */}
            </div>
          )}

          {/* Paginación superior: mostrar también en la parte superior de la lista */}
          {totalPages > 1 && (
            <div className={`${styles.paginationWrapper} ${styles.paginationTop}`}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showInfo={true}
              />
            </div>
          )}

          <div
            className={`${styles.projectsGrid} ${isChangingPage ? styles.loading : ''}`}
            data-testid="projects-grid"
          >
            {paginatedFilteredItems.map(item => {
              const projectData = mapItemToProject(item);
              const handleOpen = () => {
                if (onProjectClick) {
                  onProjectClick(String(item.id));
                } else {
                  navigate(`/project/${item.id}`);
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
          </div>

          {totalPages > 1 && (
            <div className={`${styles.paginationWrapper} ${styles.paginationBottom}`}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredProjects.length}
                itemsPerPage={articlesPerPage}
                showInfo={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
