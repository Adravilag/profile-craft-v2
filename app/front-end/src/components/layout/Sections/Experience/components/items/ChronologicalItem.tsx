import React from 'react';
import type { Experience } from '@/types/api';
import { formatDateRange, calculateDuration, formatDateFromInput } from '@/utils/dateUtils';
import SkillPill from '@/components/ui/SkillPill/SkillPill';
import { findImageForName } from '@/utils/imageLookup';
import styles from './ChronologicalItem.module.css';
import BlurImage from '@/components/utils/BlurImage';
import { useTranslation } from '@/contexts/TranslationContext';

interface Education {
  id?: number; // Para compatibilidad con código antiguo
  _id?: string; // ID de MongoDB
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface CombinedItem extends Partial<Experience & Education> {
  _id: string; // ID de MongoDB
  id?: number; // Para compatibilidad con código antiguo
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  type: 'experience' | 'education';
  company?: string;
  institution?: string;
  technologies?: string[];
  grade?: string;
}

interface ChronologicalItemProps {
  item: CombinedItem;
  index: number;
  position: 'left' | 'right';
  animationDelay?: number;
}

const ChronologicalItem: React.FC<ChronologicalItemProps> = ({
  item,
  index,
  position,
  animationDelay = 0.15,
}) => {
  const { t } = useTranslation();
  const imgCandidate = findImageForName(item.company ?? item.institution);

  return (
    <div
      className={`${styles.chronologicalItem} chronological-item ${styles[item.type]} ${item.type} ${styles[position]} ${position}`}
      style={{ animationDelay: `${index * animationDelay}s` }}
    >
      <div className={styles.chronologicalMarker}>
        <div className={`${styles.markerDot} ${styles[item.type]}`}>
          <i
            className={item.type === 'experience' ? 'fas fa-briefcase' : 'fas fa-graduation-cap'}
          />
        </div>
        {/* Fecha de fin posicionada al lado del marcador */}
        <div className={styles.chronologicalYearExternal}>
          {formatDateFromInput(item.end_date) || t.time.present}
        </div>
      </div>

      <div className={styles.chronologicalContent}>
        {imgCandidate && (
          <div className={styles.cardMedia}>
            <BlurImage
              src={imgCandidate}
              alt={item.company ?? item.institution ?? ''}
              loading="lazy"
              decoding="async"
              width={640}
              height={240}
            />
            <span className={`${styles.pill} ${styles.period}`}>
              <i className="fas fa-calendar-alt" />
              {formatDateRange(item.start_date, item.end_date)}
            </span>
          </div>
        )}
        <div className={styles.chronologicalHeader}>
          <div className={`${styles.chronologicalType} ${styles[item.type]}`}>
            {item.type === 'experience' ? t.experience.title : t.experience.education}
          </div>
        </div>

        <h4 className={styles.chronologicalTitle}>{item.title}</h4>

        <p className={styles.metaRow}>
          <i className={item.type === 'experience' ? 'fas fa-building' : 'fas fa-university'} />
          <span>{item.type === 'experience' ? item.company : item.institution}</span>
        </p>

        <div className={styles.chronologicalPeriod}>
          <i className="fas fa-calendar-alt" />
          <span>{formatDateRange(item.start_date, item.end_date)}</span>
        </div>

        <div className={styles.chronologicalDuration}>
          <i className="fas fa-hourglass-half" />
          <span>{calculateDuration(item.start_date, item.end_date)}</span>
        </div>

        <p className={styles.chronologicalDescription}>{item.description}</p>

        {/* Tecnologías para experiencias */}
        {item.type === 'experience' && item.technologies && item.technologies.length > 0 && (
          <div className={styles.chronologicalSkills}>
            <div className={styles.skillsLabel}>
              <i className="fas fa-tools" />
              <span>{t.forms.experience.technologies}:</span>
            </div>
            <div className={styles.skillsTags}>
              {item.technologies.map((tech: string, idx: number) => (
                <SkillPill key={idx} name={tech} colored={true} />
              ))}
            </div>
          </div>
        )}

        {/* Calificación para educación */}
        {item.type === 'education' && item.grade && (
          <div className={styles.educationGrade}>
            <i className="fas fa-medal" />
            <span>
              {t.forms.experience.grade}: {item.grade}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChronologicalItem;
