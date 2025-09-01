// src/components/sections/projects/ProjectPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projects, profile } from '@/services/endpoints';
const { getProjectById } = projects;
const { getUserProfile } = profile;
import type { Project, UserProfile } from '@/types/api';
import { useNotificationContext, useAuth } from '@/contexts';
import {
  SmartNavigation,
  FloatingActionButton,
  Footer,
  ImageCarousel,
  RelatedProjects,
} from '@/ui';
import ReactMarkdown from 'react-markdown';
import styles from './ProjectPage.module.css';

// Función utilitaria para detectar si el contenido es HTML o Markdown
const isHtmlContent = (content: string): boolean => {
  // Detectar etiquetas HTML comunes
  const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlTagPattern.test(content);
};

// Componente para renderizar contenido dinámicamente
const ContentRenderer: React.FC<{ content: string; className?: string }> = ({
  content,
  className,
}) => {
  if (isHtmlContent(content)) {
    // Renderizar como HTML
    return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  } else {
    // Renderizar como Markdown
    return (
      <div className={className}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
};

interface ProjectPageProps {}

const ProjectPage: React.FC<ProjectPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useNotificationContext();
  const { isAuthenticated } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);

  // Establecer la sección activa como 'projects' cuando se carga la página
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (
      currentPath.startsWith('/project/') ||
      currentPath.startsWith('/project/') ||
      currentPath.startsWith('/profile-craft/projects/')
    ) {
      document.body.setAttribute('data-active-section', 'projects');
      document.body.className = document.body.className.replace(/section-active-\w+/g, '').trim();
      document.body.classList.add('section-active-projects');
    }
  }, []);

  useEffect(() => {
    if (!id) {
      showError('Error', 'ID de artículo no válido');
      navigate('/');
      return;
    }

    loadProject(id);
    loadProfile();
  }, [id, navigate, showError]);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Intentando cargar proyecto con ID:', projectId);

      // Validación básica del ID
      if (!projectId || projectId === 'undefined' || projectId === 'null') {
        throw new Error('ID de proyecto inválido');
      }

      const data = await getProjectById(projectId);
      console.log('✅ Proyecto cargado exitosamente:', data);
      setProject(data);
      // Debug: log project content length to help diagnose missing content in UI
      try {
        // eslint-disable-next-line no-console
        console.debug(
          'ProjectPage: loaded project',
          data?.id ?? '',
          'project_content length:',
          data?.project_content?.length ?? 0
        );
      } catch (e) {
        // ignore
      }

      // Calcular tiempo de lectura estimado
      if (data.project_content) {
        const wordsPerMinute = 200;
        const words = data.project_content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        setReadingTime(Math.ceil(words / wordsPerMinute));
      }
    } catch (err: any) {
      console.error('❌ Error al cargar proyecto:', err);
      let errorMessage = `No se pudo encontrar el proyecto con ID: ${projectId}`;

      // Personalizar mensaje de error según el tipo
      if (err?.message?.includes('Invalid ObjectId') || err?.response?.status === 400) {
        errorMessage = `El ID del proyecto "${projectId}" no es válido. Verifica el enlace e intenta nuevamente.`;
      } else if (err?.response?.status === 404) {
        errorMessage = `El proyecto con ID "${projectId}" no existe o no tiene contenido publicado.`;
      } else if (err?.message?.includes('ID de proyecto inválido')) {
        errorMessage = 'El enlace del proyecto no es válido. Regresa a la sección de proyectos.';
      }

      setError(errorMessage);
      showError('Proyecto no encontrado', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && project) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
      }
    } else if (project) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleEditProject = () => {
    if (project) {
      navigate(`/projects/edit/${project.id}`);
    }
  };

  const handleAdminPanel = () => {
    navigate('/projects/admin');
  };

  // Items de navegación para SmartNavigation
  const navItems = [
    { id: 'home', label: 'Inicio', icon: 'fas fa-home' },
    { id: 'about', label: 'Sobre mí', icon: 'fas fa-user' },
    { id: 'experience', label: 'Experiencia', icon: 'fas fa-briefcase' },
    { id: 'projects', label: 'Proyectos', icon: 'fas fa-project-diagram' },
    { id: 'skills', label: 'Habilidades', icon: 'fas fa-tools' },
    {
      id: 'certifications',
      label: 'Certificaciones',
      icon: 'fas fa-certificate',
    },
    { id: 'testimonials', label: 'Testimonios', icon: 'fas fa-comments' },
    { id: 'contact', label: 'Contacto', icon: 'fas fa-envelope' },
  ]; // Función para verificar si una URL es de YouTube
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  if (loading) {
    return (
      <div className={styles.projectPage}>
        <div className={styles.wordpressHeader}>
          <nav className={styles.projectNavigation}>
            <div className={styles.backButton}>
              <i className="fas fa-spinner fa-spin"></i> Cargando...
            </div>
          </nav>
        </div>
        <main className={styles.mainContent}>
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: 'var(--text-color, #656d76)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Cargando artículo...</h1>
            <p>Por favor espera mientras cargamos el contenido.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={styles.projectPage}>
        <div className={styles.wordpressHeader}>
          <nav className={styles.projectNavigation}>
            <Link to="/projects" className={styles.backButton}>
              <i className="fas fa-arrow-left"></i> Volver a proyectos
            </Link>
          </nav>
        </div>
        <main className={styles.mainContent}>
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: 'var(--text-color, #656d76)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '24px', color: '#dc3545' }}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Artículo no encontrado</h1>
            <p style={{ marginBottom: '32px' }}>
              {error || 'El artículo solicitado no existe o ha sido eliminado.'}
            </p>
            <div
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link
                to="/projects"
                className={`${styles.wordpressActionButton} ${styles.wordpressActionPrimary}`}
              >
                <i className="fas fa-home"></i>
                Volver a proyectos
              </Link>
              <button
                onClick={() => loadProject(id!)}
                className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
              >
                <i className="fas fa-redo"></i>
                Reintentar
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Determinar si es proyecto usando el campo type (con fallback a lógica anterior)
  const isProject = project.type
    ? project.type === 'proyecto'
    : !project.project_content || project.project_content.length < 500;

  return (
    <div className={styles.projectPage}>
      {/* WordPress Header */}
      <header className={styles.wordpressHeader}>
        <nav className={styles.projectNavigation}>
          <Link to="/projects" className={styles.backButton}>
            <i className="fas fa-arrow-left"></i> Volver a artículos
          </Link>
          <div className={styles.progressIndicator}></div>
        </nav>
      </header>
      {/* SmartNavigation para cambiar de sección */}
      <SmartNavigation navItems={navItems} />
      {/* Contenido principal */}
      <main className={styles.mainContent}>
        {/* WordPress Project Header */}
        <header className={styles.wordpressProjectHeader}>
          <a href="#" className={styles.wordpressCategory}>
            <span>{isProject ? 'Proyecto' : 'Artículo'}</span>
          </a>

          <h1 className={styles.wordpressTitle}>{project.title}</h1>
          <div className={styles.wordpressExcerpt}>{project.description}</div>

          {/* WordPress Post Meta */}
          <div className={styles.wordpressPostMeta}>
            <div className={styles.wordpressMetaItem}>
              <i className={`fas fa-flag ${styles.wordpressMetaIcon}`}></i>
              <span className={styles.wordpressMetaText}>{project.status}</span>
            </div>

            {project.created_at && (
              <>
                <div className={styles.wordpressDivider}></div>
                <div className={styles.wordpressMetaItem}>
                  <i className={`fas fa-calendar ${styles.wordpressMetaIcon}`}></i>
                  <span className={styles.wordpressMetaText}>
                    {new Date(project.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </>
            )}

            {project.updated_at && (
              <>
                <div className={styles.wordpressDivider}></div>
                <div className={styles.wordpressMetaItem}>
                  <i className={`fas fa-edit ${styles.wordpressMetaIcon}`}></i>
                  <span className={styles.wordpressMetaText}>
                    Actualizado el {new Date(project.updated_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </>
            )}

            {!isProject && readingTime > 0 && (
              <>
                <div className={styles.wordpressDivider}></div>
                <div className={styles.wordpressMetaItem}>
                  <i className={`fas fa-clock ${styles.wordpressMetaIcon}`}></i>
                  <span className={styles.wordpressMetaText}>{readingTime} min de lectura</span>
                </div>
              </>
            )}
          </div>
        </header>
        {/* WordPress Technologies Section */}
        {project.technologies && project.technologies.length > 0 && (
          <div className={styles.wordpressTechnologies}>
            <div className={styles.wordpressTechHeader}>
              <i className={`fas fa-tools ${styles.wordpressTechIcon}`}></i>
              <h2 className={styles.wordpressTechTitle}>Tecnologías Utilizadas</h2>
            </div>
            <div className={styles.wordpressTechList}>
              {project.technologies.map((tech, idx) => (
                <span key={idx} className={styles.wordpressTechChip}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* WordPress Action Buttons */}
        <div className={styles.wordpressActions}>
          {project.live_url && project.live_url !== '#' && (
            <a
              href={project.live_url}
              className={`${styles.wordpressActionButton} ${styles.wordpressActionPrimary}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className={`fas fa-external-link-alt ${styles.wordpressActionIcon}`}></i>
              Ver Demo
            </a>
          )}

          {project.github_url && (
            <a
              href={project.github_url}
              className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className={`fab fa-github ${styles.wordpressActionIcon}`}></i>
              Ver Código
            </a>
          )}

          {project.video_demo_url && (
            <a
              href={project.video_demo_url}
              className={`${styles.wordpressActionButton} ${styles.wordpressActionYoutube}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className={`fab fa-youtube ${styles.wordpressActionIcon}`}></i>
              Ver Video
            </a>
          )}

          {project.project_url && (
            <a
              href={project.project_url}
              className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className={`fas fa-newspaper ${styles.wordpressActionIcon}`}></i>
              Leer Artículo
            </a>
          )}
        </div>{' '}
        {/* WordPress Media Section with Image Carousel */}
        {(project.image_url || project.video_demo_url) && (
          <div className={styles.wordpressMediaSection}>
            <div className={styles.wordpressMediaGrid}>
              {' '}
              {/* Image Carousel */}
              {project.image_url && (
                <div className={styles.wordpressMediaItem}>
                  <h3 className={styles.wordpressMediaTitle}>Galería del Proyecto</h3>
                  <p className={styles.wordpressMediaDescription}>
                    Explora las imágenes del proyecto en detalle
                  </p>
                  <ImageCarousel
                    images={[project.image_url]} // Solo mostrar la imagen principal
                    title={project.title}
                    className={styles.wordpressCarousel}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      {/* Video demo - Sección independiente fuera del mainContent */}
      {project.video_demo_url && (
        <div className={styles.wordpressFullWidthVideoSection}>
          <div className={styles.wordpressVideoWrapper}>
            <div className={styles.wordpressVideoHeader}>
              <h3 className={styles.wordpressVideoTitle}>
                <i className="fab fa-youtube" style={{ color: '#ff0000', marginRight: '8px' }}></i>
                Demo en Video
              </h3>
              <p className={styles.wordpressVideoDescription}>
                Demostración completa del funcionamiento del proyecto
              </p>
            </div>
            <div className={styles.wordpressVideoContainer}>
              {isYouTubeUrl(project.video_demo_url) ? (
                // Renderizar iframe embed directo como fallback robusto
                (() => {
                  try {
                    const url = project.video_demo_url || '';
                    // Extraer el ID de YouTube y construir URL embed
                    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
                    const videoId = m ? m[1] : null;
                    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                    // Debug: si no encontramos id, aún intentamos usar la URL original
                    // eslint-disable-next-line no-console
                    console.debug('ProjectPage: rendering youtube iframe', {
                      url,
                      videoId,
                      embedUrl,
                    });
                    return (
                      <iframe
                        title={`Demo de ${project.title}`}
                        src={embedUrl}
                        className={styles.wordpressVideoPlayer}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Error rendering youtube iframe', err);
                    return (
                      <div className={styles.wordpressVideoPlaceholder}>
                        <p>Video no disponible</p>
                      </div>
                    );
                  }
                })()
              ) : (
                <div className={styles.wordpressVideoPlaceholder}>
                  <div>
                    <i className="fas fa-play-circle"></i>
                    <p>Video disponible en enlace externo</p>
                    <a
                      href={project.video_demo_url}
                      className={styles.wordpressMediaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: '#0969da',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      <i className="fas fa-external-link-alt"></i>
                      Ver Video Demo
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}{' '}
      {/* Continuar con el resto del contenido en mainContent */}
      <main className={styles.mainContent}>
        {/* WordPress Project Content */}
        {/* Debug indicator: show content length to help troubleshooting */}
        <div style={{ fontSize: 12, color: 'var(--muted-color, #8b949e)', marginBottom: 8 }}>
          Contenido:{' '}
          {project.project_content
            ? `${project.project_content.length} caracteres`
            : 'sin contenido'}
        </div>

        {project.project_content && project.project_content.trim() && (
          <article className={styles.wordpressProjectContent}>
            <ContentRenderer
              content={project.project_content}
              className={`${styles.wordpressProse}`}
            />
          </article>
        )}

        {/* Project Summary para proyectos */}
        {isProject && (
          <div className={styles.wordpressProjectSummary}>
            <div className={styles.wordpressSummaryGrid}>
              <div className={styles.wordpressSummaryCard}>
                <h3>
                  <i className="fas fa-info-circle"></i>
                  Acerca del proyecto
                </h3>
                <p>{project.description}</p>
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div className={styles.wordpressSummaryCard}>
                  <h3>
                    <i className="fas fa-cogs"></i>
                    Tecnologías utilizadas
                  </h3>
                  <div className={styles.wordpressTechList}>
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className={styles.wordpressTechChip}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.wordpressSummaryCard}>
                <h3>
                  <i className="fas fa-flag-checkered"></i>
                  Estado del proyecto
                </h3>
                <p className={styles.wordpressStatusText}>{project.status}</p>
              </div>
            </div>
          </div>
        )}
        {/* WordPress Share Section */}
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0 24px',
            borderTop: '1px solid #e1e4e8',
            marginTop: '48px',
          }}
        >
          <button
            onClick={handleShare}
            className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
            title="Compartir artículo"
          >
            <i className="fas fa-share-alt"></i> Compartir este{' '}
            {isProject ? 'proyecto' : 'artículo'}
          </button>
        </div>
      </main>
      {/* Related Projects Section */}
      <RelatedProjects
        currentProjectId={project.id}
        maxProjects={3}
        className={styles.wordpressRelatedProjects}
      />
      {/* Footer */}
      <Footer className="curriculum-footer" profile={profile} />
      {/* Floating Action Buttons para administración */}
      {isAuthenticated && project && (
        <div className={styles.fabContainer}>
          <FloatingActionButton
            onClick={handleEditProject}
            icon="fas fa-edit"
            label="Editar artículo"
            position="bottom-right"
            color="primary"
            usePortal={false}
          />
          <FloatingActionButton
            onClick={handleAdminPanel}
            icon="fas fa-cog"
            label="Panel de administración"
            position="bottom-right"
            color="secondary"
            usePortal={false}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
