// src/components/sections/projects/ProjectsAdmin.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { projects } from '@/services/endpoints';
import { auth as authApi } from '@/services/endpoints';
import BlurImage from '@/components/utils/BlurImage';
const { getAdminProjects, deleteProject } = projects;
import type { Project } from '@/types/api';
import { useNotificationContext } from '@/contexts';
import { useNavigate } from 'react-router-dom';
import styles from './ProjectsAdmin.module.css';
import { useTranslation } from '@/contexts/TranslationContext';

/**
 * ProjectsAdmin Component - Lista de gestión de artículos
 *
 * Características principales:
 * - Lista de artículos con opciones de edición y eliminación
 * - Navegación a páginas independientes para crear y editar
 * - Eliminación de artículos con confirmación
 * - Búsqueda y filtrado en tiempo real
 * - Paginación para listados largos
 * - Diseño responsive con max-width centrado
 */

interface SortConfig {
  key: keyof Project | null;
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 10;

const ProjectsAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { showSuccess, showError } = useNotificationContext();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAdminProjects();
      setProjects(data);
    } catch (error: any) {
      // Si el error es de autenticación, intentar obtener token de desarrollo
      if (error?.response?.status === 401) {
        console.log('🔑 Error de autenticación detectado, obteniendo token de desarrollo...');
        try {
          await authApi.getDevToken();
          showError('Información', 'Token de desarrollo obtenido. Recargando artículos...');
          // Reintentar carga después de obtener el token
          const data = await getAdminProjects();
          setProjects(data);
        } catch (tokenError) {
          showError('Error', 'No se pudo obtener el token de desarrollo');
          console.error('Error obteniendo token:', tokenError);
        }
      } else {
        showError('Error', 'No se pudieron cargar los proyectos');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrado y búsqueda
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        project =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.technologies?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Aplicar filtro de estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => (project.status || 'Completado') === statusFilter);
    }

    // Aplicar ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Manejar valores undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [projects, searchTerm, statusFilter, sortConfig]);

  // Paginación
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  // Estadísticas
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(a => (a.status || 'Completado') === 'Completado').length;
    const inProgress = projects.filter(a => a.status === 'En Desarrollo').length;
    const draft = projects.filter(a => a.status === 'Borrador').length;

    return { total, completed, inProgress, draft };
  }, [projects]);

  // Manejo de ordenamiento
  const handleSort = (key: keyof Project) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Estados únicos para el filtro
  const uniqueStatuses = useMemo(() => {
    const statuses = projects.map(a => a.status || 'Completado');
    return Array.from(new Set(statuses));
  }, [projects]);

  // Función para obtener la clase CSS del estado
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'completed';
      case 'En Desarrollo':
        return 'inProgress';
      case 'Borrador':
        return 'draft';
      default:
        return 'completed';
    }
  };

  // Función para manejar el botón "Nuevo Proyecto" - navega a la página de creación
  const handleNewProject = () => {
    navigate('/projects/new');
  };

  const handleEdit = (project: Project) => {
    // Navegar a la página de edición independiente
    navigate(`/projects/edit/${project.id}`);
  };

  const handleView = (project: Project) => {
    // Navegar a la página de visualización del artículo/proyecto
    navigate(`/profile-craft/projects/${project.id}`);
  };

  const getProjectType = (project: Project): string => {
    // Usar el campo type si existe, sino aplicar lógica de fallback
    if (project.type) {
      return project.type === 'articulo' ? 'Artículo' : 'Proyecto';
    }

    // Lógica de fallback para datos existentes sin el campo type
    if (project.project_content && project.project_content.length > 500) {
      return 'Artículo';
    }
    return 'Proyecto';
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${project.title}"?`)) {
      return;
    }
    try {
      await deleteProject(String(project.id));
      showSuccess('Éxito', 'Proyecto eliminado exitosamente');
      await loadProjects();
    } catch (error) {
      showError('Error', 'No se pudo eliminar el proyecto');
      console.error(error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.projectsAdminContainer}>
        <div className={styles.projectsAdmin}>
          <div className={styles.projectsAdminHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.projectsAdminTitle}>
                <i className="fas fa-newspaper"></i>
                Gestión de {t.projects.title}
              </h1>
              <p className={styles.projectsAdminSubtitle}>
                Administra y organiza todos tus artículos y proyectos
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={styles.btnSecondary}
                onClick={async () => {
                  try {
                    await authApi.getDevToken();
                    showError('Éxito', 'Token de desarrollo obtenido');
                    loadProjects();
                  } catch (error) {
                    showError('Error', 'No se pudo obtener el token');
                  }
                }}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              >
                <i className="fas fa-key"></i>
                Dev Token
              </button>
              <button className={styles.btnPrimary} onClick={handleNewProject}>
                <i className="fas fa-plus"></i>
                Nuevo {t.projects.title.slice(0, -1)}
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <i className="fas fa-list"></i>
              <span>Total: {stats.total}</span>
            </div>
            <div className={styles.statItem}>
              <i className="fas fa-check-circle"></i>
              <span>Completados: {stats.completed}</span>
            </div>
            <div className={styles.statItem}>
              <i className="fas fa-clock"></i>
              <span>En Desarrollo: {stats.inProgress}</span>
            </div>
            <div className={styles.statItem}>
              <i className="fas fa-edit"></i>
              <span>Borradores: {stats.draft}</span>
            </div>
          </div>

          {/* Controles de tabla */}
          <div className={styles.tableControls}>
            <div className={styles.controlsTopRow}>
              <div className={styles.leftControls}>
                <div className={styles.searchBox}>
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchTerm && (
                    <button
                      className={styles.clearSearch}
                      onClick={() => setSearchTerm('')}
                      title="Limpiar búsqueda"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todos los estados</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.resultsInfo}>
              {`Mostrando ${filteredProjects.length} de ${stats.total} ${t.projects.title.toLowerCase()}`}
            </div>
          </div>

          {loading ? (
            <div className={styles.adminLoading}>
              <div className={styles.loadingSpinner}></div>
              <p>{t.states.loading}</p>
            </div>
          ) : (
            <>
              {projects.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-newspaper"></i>
                  </div>
                  <h3>No hay proyectos creados</h3>
                  <p>Comienza creando tu primer proyecto para mostrar tu trabajo</p>
                  <button className={styles.btnPrimary} onClick={handleNewProject}>
                    <i className="fas fa-plus"></i>
                    Crear mi primer proyecto
                  </button>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <i className="fas fa-search"></i>
                  </div>
                  <h3>No se encontraron resultados</h3>
                  <p>Intenta con otros términos de búsqueda o cambia los filtros</p>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    <i className="fas fa-undo"></i>
                    {t.states.reset}
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.projectsTableContainer}>
                    <table className={styles.projectsTable}>
                      <thead>
                        <tr>
                          <th className={styles.thImagen}>Imagen</th>
                          <th
                            className={`${styles.thTitulo} ${styles.sortable}`}
                            onClick={() => handleSort('title')}
                          >
                            Título
                            <i
                              className={`fas ${
                                sortConfig.key === 'title'
                                  ? sortConfig.direction === 'asc'
                                    ? 'fa-sort-up'
                                    : 'fa-sort-down'
                                  : 'fa-sort'
                              }`}
                            ></i>
                          </th>
                          <th className={styles.thTipo}>Tipo</th>
                          <th
                            className={`${styles.thEstado} ${styles.sortable}`}
                            onClick={() => handleSort('status')}
                          >
                            {t.projects.status}
                            <i
                              className={`fas ${
                                sortConfig.key === 'status'
                                  ? sortConfig.direction === 'asc'
                                    ? 'fa-sort-up'
                                    : 'fa-sort-down'
                                  : 'fa-sort'
                              }`}
                            ></i>
                          </th>
                          <th className={styles.thTecnologias}>{t.projects.technologies}</th>
                          <th className={styles.thAcciones}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProjects.map(project => (
                          <tr key={project.id}>
                            <td className={styles.tdImagen}>
                              {project.image_url ? (
                                <BlurImage
                                  src={project.image_url}
                                  alt={project.title}
                                  className={styles.projectThumbnail}
                                  loading="lazy"
                                />
                              ) : (
                                <div className={styles.noImage}>
                                  <i className="fas fa-image"></i>
                                </div>
                              )}
                            </td>
                            <td className={styles.tdTitulo}>
                              <div className={styles.projectInfo}>
                                <h4 title={project.title}>{project.title}</h4>
                                <p title={project.description}>{project.description}</p>
                              </div>
                            </td>
                            <td className={styles.tdTipo}>
                              <span className={styles.badgeTipo}>{getProjectType(project)}</span>
                            </td>
                            <td className={styles.tdEstado}>
                              <span
                                className={`${styles.badge} ${
                                  styles[
                                    `badge${(project.status || t.projects.completed).replace(/\s+/g, '')}`
                                  ]
                                }`}
                              >
                                {project.status === 'Completado'
                                  ? t.projects.completed
                                  : project.status === 'En Desarrollo'
                                    ? t.projects.inProgress
                                    : project.status || t.projects.completed}
                              </span>
                            </td>
                            <td className={styles.tdTecnologias}>
                              <div className={styles.techList}>
                                {project.technologies?.slice(0, 3).map((tech, index) => (
                                  <span key={index} className={styles.badgeTec} title={tech}>
                                    {tech}
                                  </span>
                                ))}
                                {project.technologies && project.technologies.length > 3 && (
                                  <span
                                    className={styles.badgeTecMore}
                                    title={`${project.technologies.slice(3).join(', ')}`}
                                  >
                                    +{project.technologies.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={styles.tdAcciones}>
                              <div className={styles.tableActions}>
                                <button
                                  className={`${styles.buttonIcon} ${styles.viewBtn}`}
                                  onClick={() => handleView(project)}
                                  title={`${t.projects.viewProject}/${t.projects.title.slice(0, -1).toLowerCase()}`}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className={`${styles.buttonIcon} ${styles.editBtn}`}
                                  onClick={() => handleEdit(project)}
                                  title={`Editar ${t.projects.title.slice(0, -1).toLowerCase()}`}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className={`${styles.buttonIcon} ${styles.deleteBtn}`}
                                  onClick={() => handleDelete(project)}
                                  title={`Eliminar ${t.projects.title.slice(0, -1).toLowerCase()}`}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista Mobile Cards - Responsive */}
                  <div className={styles.mobileCardContainer}>
                    {paginatedProjects.map(project => (
                      <div key={project.id} className={styles.mobileCard}>
                        <div className={styles.mobileCardHeader}>
                          <BlurImage
                            src={
                              project.image_url ||
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='150' y='100' font-family='Arial, sans-serif' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                            }
                            alt={project.title}
                            className={styles.mobileCardThumbnail}
                            onError={e => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.onerror = null;
                              img.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='150' y='100' font-family='Arial, sans-serif' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className={styles.mobileCardContent}>
                            <h3 className={styles.mobileCardTitle}>{project.title}</h3>
                            <p className={styles.mobileCardDescription}>{project.description}</p>
                          </div>
                        </div>

                        <div className={styles.mobileCardMeta}>
                          <div className={styles.mobileCardMetaRow}>
                            <span className={styles.mobileCardLabel}>Tipo:</span>
                            <span className={styles.badgeTipo}>{getProjectType(project)}</span>
                          </div>
                          <div className={styles.mobileCardMetaRow}>
                            <span className={styles.mobileCardLabel}>Estado:</span>
                            <span
                              className={`${styles.statusBadge} ${
                                styles[getStatusClass(project.status || 'Completado')]
                              }`}
                            >
                              {project.status || 'Completado'}
                            </span>
                          </div>
                          <div className={styles.mobileCardMetaRow}>
                            <span className={styles.mobileCardLabel}>Fecha:</span>
                            <span className={styles.mobileCardValue}>
                              {project.created_at
                                ? new Date(project.created_at).toLocaleDateString('es-ES')
                                : 'Sin fecha'}
                            </span>
                          </div>
                        </div>

                        {project.technologies && project.technologies.length > 0 && (
                          <div className={styles.mobileCardTechnologies}>
                            {project.technologies.map((tech, index) => (
                              <span key={index} className={styles.techBadge}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className={styles.mobileCardActions}>
                          <button
                            className={`${styles.buttonIcon} ${styles.viewBtn}`}
                            onClick={() => handleView(project)}
                            title="Ver artículo/proyecto"
                          >
                            <i className="fas fa-eye"></i>
                            Ver
                          </button>
                          <button
                            className={`${styles.buttonIcon} ${styles.editBtn}`}
                            onClick={() => handleEdit(project)}
                            title="Editar proyecto"
                          >
                            <i className="fas fa-edit"></i>
                            Editar
                          </button>
                          <button
                            className={`${styles.buttonIcon} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(project)}
                            title="Eliminar proyecto"
                          >
                            <i className="fas fa-trash"></i>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.paginationBtn}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                        Anterior
                      </button>

                      <div className={styles.paginationInfo}>
                        Página {currentPage} de {totalPages}
                      </div>

                      <button
                        className={styles.paginationBtn}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsAdmin;
