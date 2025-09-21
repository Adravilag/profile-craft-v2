// src/components/sections/projects/ProjectPage.tsx
// Clean ProjectPage (single, consistent implementation)
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
import { SectionsLoadingProvider } from '@/contexts/SectionsLoadingContext';
import ReactMarkdown from 'react-markdown';
import styles from './ProjectPage.module.css';
import TechnologyChips from '@/components/ui/TechnologyChips/TechnologyChips';
import { useSkillSuggestions } from '@/features/skills/hooks/useSkillSuggestions';
import { resolvePillFromTech } from '@/features/skills/utils/pillUtils';
import { useTranslation } from '@/contexts/TranslationContext';

const isHtmlContent = (content: string): boolean => /<\/?[a-z][\s\S]*>/i.test(content);

const ContentRenderer: React.FC<{ content: string; className?: string }> = ({
  content,
  className,
}) => {
  if (isHtmlContent(content))
    return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  return (
    <div className={className}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useNotificationContext();
  const { isAuthenticated } = useAuth();
  const { t, getText, language } = useTranslation();

  const [project, setProject] = useState<Project | null>(null);
  const [profileData, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);
  const suggestions = useSkillSuggestions();

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/project/') || currentPath.startsWith('/profile-craft/projects/')) {
      document.body.setAttribute('data-active-section', 'projects');
      document.body.className = document.body.className.replace(/section-active-\w+/g, '').trim();
      document.body.classList.add('section-active-projects');
    }
  }, []);

  // Helper para contenido localizado: acepta string | { es?: string; en?: string }
  const getLocalized = (input: any, preferredLangs?: string[]): string => {
    if (input == null) return '';
    if (typeof input === 'string') return input;
    if (typeof input === 'number' || typeof input === 'boolean') return String(input);

    const currentLang = (language as string) || 'en';
    const langs =
      Array.isArray(preferredLangs) && preferredLangs.length > 0
        ? preferredLangs
        : [currentLang, 'es', 'en'];

    if (typeof input === 'object') {
      for (const l of langs) {
        if ((input as any)[l] != null) {
          const v = (input as any)[l];
          if (typeof v === 'string') return v;
          if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        }
      }
      // fallback: any string property
      for (const k of Object.keys(input)) {
        const v = (input as any)[k];
        if (typeof v === 'string' && v.trim()) return v;
      }
    }
    return '';
  };

  useEffect(() => {
    if (!id) {
      showError(
        getText('errors.invalidIdTitle', 'Error'),
        getText('errors.invalidId', 'ID de artículo inválido')
      );
      navigate('/');
      return;
    }
    (async () => {
      await loadProject(id);
      await loadProfile();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProfile = async () => {
    try {
      const p = await getUserProfile();
      setProfile(p);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      if (!projectId || projectId === 'undefined' || projectId === 'null')
        throw new Error('ID de proyecto inválido');
      const data = await getProjectById(projectId);
      setProject(data);
      if (data.project_content) {
        const localizedContent = getLocalized(data.project_content) || '';
        const wordsPerMinute = 200;
        const words = localizedContent
          .replace(/<[^>]*>/g, '')
          .split(/\s+/)
          .filter(Boolean).length;
        setReadingTime(localizedContent ? Math.ceil(words / wordsPerMinute) : 0);
      }
    } catch (err: any) {
      console.error('❌ Error al cargar proyecto:', err);
      let errorMessage = `No se pudo encontrar el proyecto con ID: ${projectId}`;
      if (err?.message?.includes('Invalid ObjectId') || err?.response?.status === 400) {
        errorMessage = `El ID del proyecto "${projectId}" no es válido. Verifica el enlace e intenta nuevamente.`;
      } else if (err?.response?.status === 404) {
        errorMessage = `El proyecto con ID "${projectId}" no existe o no tiene contenido publicado.`;
      } else if (err?.message?.includes('ID de proyecto inválido')) {
        errorMessage = 'El enlace del proyecto no es válido. Regresa a la sección de proyectos.';
      }
      setError(errorMessage);
      showError(getText('projects.form.notFoundTitle', 'Proyecto no encontrado'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && project) {
      try {
        await navigator.share({
          title: getLocalized((project as any).title),
          text: getLocalized((project as any).description),
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
      }
    } else if (project) navigator.clipboard.writeText(window.location.href);
  };

  const handleEditProject = () => {
    if (project) navigate(`/projects/edit/${project.id}`);
  };

  const handleAdminPanel = () => navigate('/projects/admin');

  const navItems = [
    { id: 'home', label: 'Inicio', icon: 'fas fa-home' },
    { id: 'about', label: 'Sobre mí', icon: 'fas fa-user' },
    { id: 'experience', label: 'Experiencia', icon: 'fas fa-briefcase' },
    { id: 'projects', label: t.projects.title, icon: 'fas fa-project-diagram' },
    { id: 'skills', label: 'Habilidades', icon: 'fas fa-tools' },
    { id: 'certifications', label: 'Certificaciones', icon: 'fas fa-certificate' },
    { id: 'testimonials', label: 'Testimonios', icon: 'fas fa-comments' },
    { id: 'contact', label: 'Contacto', icon: 'fas fa-envelope' },
  ];

  if (loading) {
    return (
      <div className={styles.projectPage}>
        <div className={styles.wordpressHeader}>
          <nav className={styles.projectNavigation}>
            <div className={styles.backButton}>
              <i className="fas fa-spinner fa-spin"></i> {getText('states.loading', 'Cargando...')}
            </div>
          </nav>
        </div>
        <main className={styles.mainContent}>
          <div
            style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-color, #656d76)' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              {getText('states.loading', 'Cargando...')}
            </h1>
            <p>
              {getText(
                'projects.form.loadingMessage',
                'Por favor espera mientras cargamos el contenido.'
              )}
            </p>
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
              <i className="fas fa-arrow-left"></i> {t.actions.previous} {t.projects.title}
            </Link>
          </nav>
        </div>
        <main className={styles.mainContent}>
          <div
            style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-color, #656d76)' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '24px', color: '#dc3545' }}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              {t.projects.type.article} {getText('states.notFound', 'no encontrado')}
            </h1>
            <p style={{ marginBottom: '32px' }}>
              {error ||
                getText(
                  'projects.form.notFoundSubtitle',
                  'El artículo solicitado no existe o ha sido eliminado.'
                )}
            </p>
            <div
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link
                to="/projects"
                className={`${styles.wordpressActionButton} ${styles.wordpressActionPrimary}`}
              >
                <i className="fas fa-home"></i>
                {t.actions.previous} {t.projects.title}
              </Link>
              <button
                onClick={() => loadProject(id!)}
                className={`${styles.wordpressActionButton} ${styles.wordpressActionSecondary}`}
              >
                <i className="fas fa-redo"></i>
                {getText('projects.form.retryButton', 'Reintentar')}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const localizedContentForTypeCheck = project
    ? getLocalized((project as any).project_content)
    : '';
  const isProject = project
    ? project.type
      ? project.type === 'proyecto'
      : !localizedContentForTypeCheck || localizedContentForTypeCheck.length < 500
    : false;

  return (
    <SectionsLoadingProvider>
      <div className={styles.projectPage}>
        <header className={styles.wordpressHeader}>
          <nav className={styles.projectNavigation}>
            <Link to="/projects" className={styles.backButton}>
              <i className="fas fa-arrow-left"></i> {t.actions.previous} {t.projects.type.article}
            </Link>
            <div className={styles.progressIndicator}></div>
          </nav>
        </header>

        <SmartNavigation navItems={navItems} />

        <main className={styles.mainContent}>
          <header className={styles.wordpressProjectHeader}>
            <a href="#" className={styles.wordpressCategory}>
              <span>{isProject ? t.projects.type.project : t.projects.type.article}</span>
            </a>

            <h1 className={styles.wordpressTitle}>{getLocalized((project as any).title)}</h1>
            <div className={styles.wordpressExcerpt}>
              {getLocalized((project as any).description)}
            </div>

            <div className={styles.wordpressPostMeta}>
              <div className={styles.wordpressMetaItem}>
                <i className={`fas fa-flag ${styles.wordpressMetaIcon}`}></i>
                <span className={styles.wordpressMetaText}>
                  {project.status === 'En Desarrollo' || project.status === 'En progreso'
                    ? t.projects.statusLabels.inProgress
                    : project.status === 'Completado'
                      ? t.projects.statusLabels.completed
                      : project.status}
                </span>
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
                      {getText('projects.form.labels.updatedOn', 'Actualizado el')}{' '}
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}

              {!isProject && readingTime > 0 && (
                <>
                  <div className={styles.wordpressDivider}></div>
                  <div className={styles.wordpressMetaItem}>
                    <i className={`fas fa-clock ${styles.wordpressMetaIcon}`}></i>
                    <span className={styles.wordpressMetaText}>
                      {readingTime} {getText('projects.form.labels.readingTime', 'min de lectura')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </header>

          {project.technologies && project.technologies.length > 0 && (
            <div className={styles.wordpressTechnologies}>
              <div className={styles.wordpressTechHeader}>
                <i className={`fas fa-tools ${styles.wordpressTechIcon}`}></i>
                <h2 className={styles.wordpressTechTitle}>
                  {getText('projects.form.labels.technologies', 'Tecnologías utilizadas')}
                </h2>
              </div>
              <div className={styles.wordpressTechList}>
                <TechnologyChips
                  items={project.technologies.map((tech: string, idx: number) => {
                    const pill = resolvePillFromTech(tech, suggestions, idx);
                    return { slug: pill.slug, name: pill.name };
                  })}
                  colored
                  closable={false}
                  containerClassName={styles.wordpressTechList}
                  itemClassName={styles.wordpressTechChip}
                />
              </div>
            </div>
          )}

          <div className={styles.wordpressActions}>
            {project.live_url && project.live_url !== '#' && (
              <a
                href={project.live_url}
                className={`${styles.wordpressActionButton} ${styles.wordpressActionPrimary}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className={`fas fa-external-link-alt ${styles.wordpressActionIcon}`}></i>
                {getText('projects.form.actions.viewDemo', 'Ver demo')}
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
                {getText('projects.form.actions.viewCode', 'Ver código')}
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
                {getText('projects.form.actions.viewVideo', 'Ver video')}
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
                {getText('projects.form.actions.readArticle', 'Leer artículo')}
              </a>
            )}
          </div>

          {(() => {
            // Helper seguro para extraer imágenes de la entidad `project`.
            const getGalleryImages = (p: any): string[] => {
              const images: string[] = [];
              if (!p) return images;

              const apiBase = (import.meta.env as any).VITE_API_URL as string | undefined;

              const normalize = (input: any): string | null => {
                if (!input) return null;
                // If it's a string, return as-is
                if (typeof input === 'string') return input.trim() || null;
                // If it's an object, try known fields
                if (typeof input === 'object') {
                  const candidates = [
                    input.secure_url,
                    input.url,
                    input.path,
                    input.public_url,
                    input.publicId,
                    input.public_id,
                  ];
                  for (const c of candidates) {
                    if (typeof c === 'string' && c.trim()) return c.trim();
                  }
                }
                return null;
              };

              const prefixIfRelative = (url: string) => {
                try {
                  // absolute URL if it has a protocol
                  const hasProtocol = /^(https?:)?\/\//i.test(url);
                  if (hasProtocol) return url;
                  // blob urls should remain as-is
                  if (url.startsWith('blob:')) return url;
                  // otherwise, prefix with apiBase if available, or return the raw url
                  if (apiBase) return `${apiBase.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
                  return url;
                } catch {
                  return url;
                }
              };

              const pushUnique = (u?: string) => {
                if (!u) return;
                const normalized = prefixIfRelative(u);
                if (!images.includes(normalized)) images.push(normalized);
              };

              // portada preferida (varios nombres posibles)
              const coverCandidates = [
                p.image_url,
                p.imageUrl,
                p.thumbnail,
                p.thumbnail_url,
                p.image,
              ];
              for (const c of coverCandidates) {
                const n = normalize(c);
                if (n) {
                  pushUnique(n);
                  break;
                }
              }

              // soporte para distintos nombres: snake_case o camelCase
              const maybeGallery =
                p.gallery_images ?? p.galleryImages ?? p.gallery ?? p.images ?? (p as any).media;
              if (Array.isArray(maybeGallery)) {
                maybeGallery.forEach((item: any) => {
                  const n = normalize(item);
                  if (n) pushUnique(n);
                });
              } else {
                const single = normalize(maybeGallery);
                if (single) pushUnique(single);
              }

              return images;
            };

            const images = getGalleryImages(project as any);
            if (images.length === 0 && !project.image_url && !project.video_demo_url) return null;

            return (
              <div className={styles.wordpressMediaSection}>
                <div className={styles.wordpressMediaGrid}>
                  {images.length > 0 ? (
                    <div className={styles.wordpressMediaItem}>
                      <h3 className={styles.wordpressMediaTitle}>
                        {getText('projects.form.labels.galleryTitle', 'Galería del proyecto')}
                      </h3>
                      <p className={styles.wordpressMediaDescription}>
                        {getText(
                          'projects.form.labels.galleryDescription',
                          'Explora las imágenes del proyecto en detalle'
                        )}
                      </p>
                      <ImageCarousel
                        images={images}
                        title={getLocalized((project as any).title)}
                        className={styles.wordpressCarousel}
                      />
                    </div>
                  ) : project.image_url ? (
                    <div className={styles.wordpressMediaItem}>
                      <h3 className={styles.wordpressMediaTitle}>
                        {getText('projects.form.labels.galleryTitle', 'Galería del proyecto')}
                      </h3>
                      <p className={styles.wordpressMediaDescription}>
                        {getText(
                          'projects.form.labels.galleryDescription',
                          'Explora las imágenes del proyecto en detalle'
                        )}
                      </p>
                      <ImageCarousel
                        images={[project.image_url]}
                        title={getLocalized((project as any).title)}
                        className={styles.wordpressCarousel}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })()}

          <div style={{ fontSize: 12, color: 'var(--muted-color, #8b949e)', marginBottom: 8 }}>
            {getText('projects.form.labels.contentLabel', 'Contenido')}:{' '}
            {getLocalized((project as any).project_content)
              ? `${getLocalized((project as any).project_content).length} ${getText('projects.form.labels.characters', 'caracteres')}`
              : getText('projects.form.labels.noContent', 'sin contenido')}
          </div>

          {getLocalized((project as any).project_content) &&
            getLocalized((project as any).project_content).trim() && (
              <article className={styles.wordpressProjectContent}>
                <ContentRenderer
                  content={getLocalized((project as any).project_content)}
                  className={`${styles.wordpressProse}`}
                />
              </article>
            )}

          {isProject && (
            <div className={styles.wordpressProjectSummary}>
              <div className={styles.wordpressSummaryGrid}>
                <div className={styles.wordpressSummaryCard}>
                  <h3>
                    <i className="fas fa-info-circle"></i>
                    {getText('projects.form.labels.aboutProject', 'Acerca del proyecto')}
                  </h3>
                  <p>{getLocalized((project as any).description)}</p>
                </div>

                {project.technologies && project.technologies.length > 0 && (
                  <div className={styles.wordpressSummaryCard}>
                    <h3>
                      <i className="fas fa-cogs"></i>
                      {getText('projects.form.labels.techUsed', 'Tecnologías utilizadas')}
                    </h3>
                    <div className={styles.wordpressTechList}>
                      <TechnologyChips
                        items={project.technologies.map((tech: string, idx: number) => {
                          const pill = resolvePillFromTech(tech, suggestions, idx);
                          return { slug: pill.slug, name: pill.name };
                        })}
                        colored
                        closable={false}
                        containerClassName={styles.wordpressTechList}
                        itemClassName={styles.wordpressTechChip}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.wordpressSummaryCard}>
                  <h3>
                    <i className="fas fa-flag-checkered"></i>
                    {getText('projects.form.labels.projectStatus', 'Estado del proyecto')}
                  </h3>
                  <p className={styles.wordpressStatusText}>{project.status}</p>
                </div>
              </div>
            </div>
          )}

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
              title={getText('projects.form.actions.shareTitle', 'Compartir artículo')}
            >
              <i className="fas fa-share-alt"></i>{' '}
              {getText('projects.form.actions.sharePrefix', 'Compartir este')}{' '}
              {isProject
                ? getText('projects.type.project', 'proyecto')
                : getText('projects.type.article', 'artículo')}
            </button>
          </div>

          <RelatedProjects
            currentProjectId={project.id}
            maxProjects={3}
            className={styles.wordpressRelatedProjects}
          />

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
        </main>
        <Footer className="curriculum-footer" profile={profileData} />
      </div>
    </SectionsLoadingProvider>
  );
};

export default ProjectPage;
