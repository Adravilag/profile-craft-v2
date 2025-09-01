import React from 'react';
import BlurImage from '@/components/utils/BlurImage';
import SkillPill from '@/components/shared/SkillPill';
import styles from './ProjectWidget.module.css';

type Props = {
  project: any;
  variant?: 'thumb' | 'compact';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

const ProjectWidget: React.FC<Props> = ({
  project,
  variant = 'thumb',
  className = '',
  onClick,
}) => {
  const chipList: string[] = project
    ? project.tags && project.tags.length
      ? project.tags
      : (project.technologies ?? [])
    : [];

  if (variant === 'thumb') {
    return (
      <a
        href={project?.url || '#projects'}
        className={`${styles.thumb} ${className}`}
        title={project?.title || 'Project'}
        onClick={e => {
          if (onClick) {
            e.preventDefault();
            onClick(e);
          }
        }}
      >
        {project?.thumbnail || (project as any).image_url ? (
          <BlurImage
            src={project.thumbnail ?? (project as any).image_url}
            alt={project.title || 'project'}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>{(project?.title || '').slice(0, 2) || 'PR'}</div>
        )}

        {/* chips shown on hover for thumb */}
        {chipList.length > 0 && (
          <div className={styles.thumbChips} aria-hidden="true">
            {chipList.slice(0, 6).map((t, i) => (
              <SkillPill key={`${t}-${i}`} name={t} colored className={styles.chipPill} />
            ))}
          </div>
        )}
      </a>
    );
  }

  // compact variant: simple horizontal item for lists
  return (
    <div className={`${styles.compact} ${className}`} role="project" tabIndex={0}>
      <div className={styles.compactImage}>
        {project?.thumbnail || (project as any).image_url ? (
          <BlurImage
            src={project.thumbnail ?? (project as any).image_url}
            alt={project.title || 'project'}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholderSmall}>
            {(project?.title || '').slice(0, 2) || 'PR'}
          </div>
        )}
      </div>
      <div className={styles.compactBody}>
        <div className={styles.compactTitle}>{project?.title}</div>
        {project?.short_description && (
          <div className={styles.compactDesc}>{project.short_description}</div>
        )}
        {chipList.length > 0 && (
          <div className={styles.chips} aria-hidden={false}>
            {chipList.slice(0, 6).map((t, i) => (
              <SkillPill key={`${t}-${i}`} name={t} colored={true} className={styles.chipPill} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWidget;
