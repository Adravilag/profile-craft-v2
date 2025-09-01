import React from 'react';
import { ModalShell } from '@/components/ui';
import Badge from '@/components/ui/Badge/Badge';
import styles from './ProjectModal.module.css';
import type { Project } from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';
import { useTranslation } from '@/contexts/TranslationContext';

type Props = {
  project: Project | null;
  onClose: () => void;
  isOpen?: boolean;
};

const ProjectModal: React.FC<Props> = ({ project, onClose, isOpen = !!project }) => {
  const { t } = useTranslation();
  if (!project || !isOpen) return null;

  const actionButtons = [
    ...(project.demoUrl
      ? [
          {
            key: 'demo',
            label: t.projects.liveDemo,
            onClick: () => window.open(project.demoUrl, '_blank', 'noopener,noreferrer'),
            variant: 'primary' as const,
            ariaLabel: `Ver demo de ${project.title}`,
          },
        ]
      : []),
    ...(project.repoUrl
      ? [
          {
            key: 'repo',
            label: t.projects.viewCode,
            onClick: () => window.open(project.repoUrl, '_blank', 'noopener,noreferrer'),
            variant: 'secondary' as const,
            ariaLabel: `Ver código de ${project.title}`,
          },
        ]
      : []),
  ];

  return (
    <ModalShell
      title={project.title}
      onClose={onClose}
      actionButtons={actionButtons}
      width="900px"
      maxWidth="95vw"
    >
      <div className={styles.modalContent}>
        <div className={styles.mediaArea}>
          {project.media?.type === 'video' ? (
            <video
              controls
              src={project.media.src}
              poster={project.media.poster}
              className={styles.media}
              aria-label={`Video demo de ${project.title}`}
            />
          ) : (
            <img
              src={project.media?.poster ?? project.media?.src ?? '/vite.svg'}
              alt={`Vista previa de ${project.title}`}
              className={styles.media}
            />
          )}
        </div>

        <div className={styles.content}>
          <p className={styles.description}>{project.shortDescription}</p>

          {project.technologies && project.technologies.length > 0 && (
            <div className={styles.technologiesSection}>
              <h4 className={styles.sectionTitle}>{t.projects.technologies}</h4>
              <div className={styles.badgesRow}>
                {project.technologies.map(tech => (
                  <Badge key={tech} label={tech} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default ProjectModal;
