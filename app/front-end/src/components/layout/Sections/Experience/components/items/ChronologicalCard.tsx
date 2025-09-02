import React from 'react';
import type { Experience } from '@/types/api';
import { formatDateRange, calculateDuration } from '@/utils/dateUtils';
import SkillPill from '@/components/ui/SkillPill/SkillPill';
import { findImageForName } from '@/utils/imageLookup';
import cardStyles from './ChronologicalCard.module.css';
import chronologicalStyles from './ChronologicalItem.module.css';
import BlurImage from '@/components/utils/BlurImage';
import { useTranslation } from '@/contexts/TranslationContext';

interface Education {
  id?: number;
  _id?: string;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface CombinedItem {
  _id: string;
  id?: number | string;
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

interface ChronologicalCardProps {
  item: CombinedItem;
  context?: 'education' | 'experience' | 'chronological';
  onEdit?: (item: CombinedItem) => void;
  onDelete?: (item: CombinedItem) => void;
}

const ChronologicalCard: React.FC<ChronologicalCardProps> = ({
  item,
  context = 'chronological',
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const imgCandidate = findImageForName(item.company ?? item.institution);

  // Determinar los estilos según el contexto
  const styles = context === 'chronological' ? chronologicalStyles : cardStyles;

  // Determinar las clases de contexto
  const contextClass =
    context === 'education'
      ? cardStyles.educationContext
      : context === 'experience'
        ? cardStyles.experienceContext
        : '';

  // Clase del contenedor principal
  const containerClass =
    context === 'chronological'
      ? styles.chronologicalContent
      : `${cardStyles.chronologicalCard} ${contextClass} ${cardStyles.categoryContext}`;

  return (
    <div className={containerClass}>
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
          <span className={styles.pill}>
            <i className="fas fa-calendar-alt" />
            {formatDateRange(item.start_date, item.end_date)}
          </span>
        </div>
      )}

      <div className={styles.chronologicalContent}>
        {/* Header con enfoque diferente según el tipo */}
        {context === 'chronological' && (
          <div className={styles.chronologicalHeader}>
            <div className={`${styles.chronologicalType} ${styles[item.type]}`}>
              {item.type === 'experience' ? (
                <>
                  <i className="fas fa-building"></i>
                  {t.experience.title}
                </>
              ) : (
                <>
                  <i className="fas fa-graduation-cap"></i>
                  {t.experience.education}
                </>
              )}
            </div>
          </div>
        )}

        {/* Para experiencias: Mostrar empresa como principal, puesto como secundario */}
        {item.type === 'experience' ? (
          <>
            <h4 className={`${styles.chronologicalTitle} ${styles.companyTitle}`}>
              <i className="fas fa-building"></i>
              {item.company}
            </h4>
            <p className={`${styles.metaRow} ${styles.positionSubtitle}`}>
              <i className="fas fa-user-tie"></i>
              <span>{item.title}</span>
            </p>
          </>
        ) : (
          <>
            <h4 className={styles.chronologicalTitle}>{item.title}</h4>
            <p className={styles.metaRow}>
              <i className="fas fa-university"></i>
              <span>{item.institution}</span>
            </p>
          </>
        )}

        <div className={styles.chronologicalMetaRow}>
          <div className={styles.chronologicalPeriod}>
            <i className="fas fa-calendar-alt" />
            <span>{formatDateRange(item.start_date, item.end_date)}</span>
          </div>

          <div className={styles.chronologicalDuration}>
            <i className="fas fa-hourglass-half" />
            <span>{calculateDuration(item.start_date, item.end_date)}</span>
          </div>
        </div>

        {item.description && <p className={styles.chronologicalDescription}>{item.description}</p>}

        {/* Tecnologías para experiencias */}
        {item.type === 'experience' && item.technologies && item.technologies.length > 0 && (
          <div className={styles.chronologicalSkills}>
            <div className={styles.skillsLabel}>
              <i className="fas fa-tools"></i>
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
            <i className="fas fa-medal"></i>
            <span>
              {t.forms.experience.grade}: {item.grade}
            </span>
          </div>
        )}

        {/* Acciones: editar + eliminar. Mostramos solo iconos (sin labels) */}
        <div className={cardStyles.cardActions}>
          <button
            className={cardStyles.editBtn}
            type="button"
            onClick={() => onEdit && onEdit(item)}
            aria-label={t.experience.admin?.edit || 'Editar'}
          >
            <i className="fas fa-edit" />
          </button>

          <button
            className={cardStyles.deleteBtn}
            type="button"
            onClick={() => onDelete && onDelete(item)}
            aria-label={t.experience.admin?.delete || 'Eliminar'}
          >
            <i className="fas fa-trash" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChronologicalCard;
