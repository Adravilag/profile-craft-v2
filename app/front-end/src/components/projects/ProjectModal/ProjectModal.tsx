import React, { useEffect } from 'react';
import styles from './projectModal.module.css';
import Badge from '../Badge/Badge';
import type { Project } from '../../layout/Sections/Projects/components/ProjectCard/ProjectCard';

type Props = { project: Project | null; onClose: () => void };

const ProjectModal: React.FC<Props> = ({ project, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!project) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <div className={styles.mediaArea}>
          {project.media?.type === 'video' ? (
            <video controls src={project.media.src} poster={project.media.poster} />
          ) : (
            <img
              src={project.media?.poster ?? project.media?.src ?? '/vite.svg'}
              alt={`${project.title} preview`}
            />
          )}
        </div>
        <div className={styles.content}>
          <h2>{project.title}</h2>
          <p className={styles.long}>{project.shortDescription}</p>
          <div className={styles.badgesRow}>
            {project.technologies?.map(t => (
              <Badge key={t} label={t} />
            ))}
          </div>
          <div className={styles.ctas}>
            {project.demoUrl ? (
              <a className={styles.cta} href={project.demoUrl} target="_blank" rel="noreferrer">
                Ver demo
              </a>
            ) : null}
            {project.repoUrl ? (
              <a className={styles.cta} href={project.repoUrl} target="_blank" rel="noreferrer">
                Ver código
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
