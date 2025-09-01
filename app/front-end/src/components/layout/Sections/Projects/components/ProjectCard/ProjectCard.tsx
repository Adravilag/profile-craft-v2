import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './projectCard.module.css';
import SkillPill from '@/components/shared/SkillPill';

type Media = { type: 'image' | 'gif' | 'video'; src: string; poster?: string };

// UI contract for a project card. Include both legacy and new snake_case fields
export type Project = {
  id: string;
  title: string;
  // friendly description used by the card
  description?: string;
  // legacy field kept for compatibility
  shortDescription?: string;
  technologies?: string[];
  // both shapes supported (camelCase and snake_case)
  demoUrl?: string;
  repoUrl?: string;
  live_url?: string;
  github_url?: string;
  video_demo_url?: string;
  media?: Media;
  // optional fields used when mapping from API
  projectType?: string;
  // prefer `type` for human readable (Proyecto / Artículo)
  type?: string;
  status?: string;
  projectUrl?: string;
  articleUrl?: string; // URL del artículo del proyecto
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const navigate = useNavigate();
  const media = project.media;
  // Función para navegar al artículo del proyecto
  const handleCardClick = () => {
    // Validar que el proyecto tenga un ID válido antes de navegar
    if (!project.id || project.id === 'undefined' || project.id === 'null') {
      console.warn('⚠️ Proyecto sin ID válido:', project);
      return;
    }

    // Construir la URL del artículo usando el ID del proyecto
    const articleUrl = `/project/${project.id}`;
    console.log('🔗 Navegando a:', articleUrl, 'para proyecto:', project.title);
    navigate(articleUrl);
  };

  // Función para acciones secundarias (demo, repo) que no deben activar la navegación principal
  const handleSecondaryAction = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation(); // Evitar que se active el click de la tarjeta
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Obtener imagen de fondo del proyecto
  const bgImage =
    media?.poster ??
    media?.src ??
    // support common API image fields
    (project as any).image_url ??
    (project as any).thumbnail ??
    '/vite.svg';

  // Obtener tecnologías para mostrar
  const technologies =
    (project as any).tags && (project as any).tags.length
      ? (project as any).tags
      : (project.technologies ?? []);

  return (
    <article
      className={styles.card}
      style={{ ['--project-bg-image' as any]: `url(${bgImage})` }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver detalles del proyecto ${project.title}`}
    >
      <div className={styles.content}>
        {/* meta badges (type / status) */}
        {(project.type || project.status) && (
          <div className={styles.metaBadges} aria-hidden>
            {project.type && (
              <span className={styles.metaBadge} data-type={project.type}>
                {project.type}
              </span>
            )}
            {project.status && (
              <span className={styles.metaBadge} data-status={project.status}>
                {project.status}
              </span>
            )}
          </div>
        )}
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{project.title}</h3>
        </div>

        <p className={styles.desc}>
          {project.description ??
            project.shortDescription ??
            (project as any).description ??
            'Haz clic para ver más detalles del proyecto'}
        </p>

        <div className={styles.techRow}>
          {technologies.slice(0, 6).map((tech: string, index: number) => (
            <SkillPill key={`${tech}-${index}`} name={tech} colored className={styles.chipPill} />
          ))}
        </div>

        <div className={styles.ctaRow}>
          <span className={styles.readMore}>Leer más →</span>

          <div className={styles.iconCtas}>
            {/* Botón de demo si existe */}
            {/* Live / demo button (prefer snake_case `live_url` then legacy `demoUrl`) */}
            {(project.live_url || project.demoUrl || (project as any).live_url) && (
              <button
                onClick={e =>
                  handleSecondaryAction(
                    e,
                    project.live_url ?? project.demoUrl ?? (project as any).live_url
                  )
                }
                className={styles.iconBtn}
                aria-label={`Ver demo de ${project.title}`}
                title="Ver demo"
              >
                <i className="fas fa-external-link-alt" aria-hidden></i>
              </button>
            )}

            {/* Video demo (YouTube or external) */}
            {(project.video_demo_url || (project as any).video_demo_url) && (
              <button
                onClick={e =>
                  handleSecondaryAction(
                    e,
                    project.video_demo_url ?? (project as any).video_demo_url
                  )
                }
                className={styles.iconBtn}
                aria-label={`Ver demo en vídeo de ${project.title}`}
                title="Ver demo en vídeo"
              >
                <i className="fas fa-play" aria-hidden></i>
              </button>
            )}

            {/* Repo / GitHub */}
            {(project.github_url || project.repoUrl || (project as any).github_url) && (
              <button
                onClick={e =>
                  handleSecondaryAction(
                    e,
                    project.github_url ?? project.repoUrl ?? (project as any).github_url
                  )
                }
                className={styles.iconBtn}
                aria-label={`Ver código de ${project.title} en GitHub`}
                title="Ver código"
              >
                <i className="fab fa-github" aria-hidden></i>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* corner play button for video demos */}
      {(project.video_demo_url || (project as any).video_demo_url) && (
        <button
          onClick={e =>
            handleSecondaryAction(e, project.video_demo_url ?? (project as any).video_demo_url)
          }
          aria-label={`Reproducir demo de ${project.title}`}
          title="Ver demo en vídeo"
          className={styles.videoPlayCorner}
        >
          <i className="fas fa-play" aria-hidden></i>
        </button>
      )}
    </article>
  );
};

export default ProjectCard;
