import React, { useEffect, useState } from 'react';
import { formatDateRange, calculateDuration } from '@/utils/dateUtils';
import SkillPill from '@/components/ui/SkillPill/SkillPill';
// resolvePillFromTech removed: use skill suggestions from hook and a local resolver below
import { useSkillSuggestions } from '@/features/skills/hooks/useSkillSuggestions';
import { findImageForName } from '@/utils/imageLookup';
import cardStyles from './ChronologicalCard.module.css';
import chronologicalStyles from './ChronologicalItem.module.css';
import BlurImage from '@/components/utils/BlurImage';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const imgCandidate = findImageForName(item.company ?? item.institution);

  // Suggestions loaded from public/skill_settings.json to allow resolving svg/color
  const technologySuggestions = useSkillSuggestions();

  // Local resolver: given a technology item (string or object) try to find a matching
  // suggestion from `technologySuggestions`. Fallback to sensible defaults.
  const slugify = (s?: string) =>
    (s || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const resolvePill = (tech: any, suggestions: any[], index?: number) => {
    // tech can be a string like 'react' or an object with fields
    if (!tech && tech !== 0) {
      return { slug: `unknown-${index ?? '0'}`, name: 'Unknown' } as any;
    }

    if (typeof tech === 'string') {
      const slug = slugify(tech);
      const match = suggestions.find(
        (s: any) =>
          (s.slug && s.slug.toLowerCase() === slug) ||
          (s.name && s.name.toLowerCase() === tech.toLowerCase())
      );
      if (match) {
        return {
          slug: match.slug ?? slug,
          svg: match.svg,
          name: match.name ?? tech,
          color: match.color,
        };
      }

      return { slug, name: tech };
    }

    // tech is object-like
    const techSlug = (tech && (tech.slug || (tech.name && slugify(tech.name)))) || undefined;
    const techName = tech && (tech.name || tech.label || String(tech));

    const match = suggestions.find(
      (s: any) =>
        (techSlug && s.slug === techSlug) ||
        (techName && s.name?.toLowerCase() === String(techName).toLowerCase())
    );
    if (match) {
      return {
        slug: match.slug ?? techSlug ?? `tech-${index ?? 0}`,
        svg: tech.svg ?? match.svg,
        name: techName ?? match.name,
        color: tech.color ?? match.color,
      };
    }

    return {
      slug: techSlug ?? `tech-${index ?? 0}`,
      svg: tech.svg,
      name: techName ?? String(tech),
      color: tech.color,
    };
  };

  const styles = context === 'chronological' ? chronologicalStyles : cardStyles;

  const contextClass =
    context === 'education'
      ? cardStyles.educationContext
      : context === 'experience'
        ? cardStyles.experienceContext
        : '';

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
        {context === 'chronological' && (
          <div className={styles.chronologicalHeader}>
            <div className={`${styles.chronologicalType} ${styles[item.type]}`}>
              {item.type === 'experience' ? (
                <>
                  <i className="fas fa-building" />
                  {t.experience.title}
                </>
              ) : (
                <>
                  <i className="fas fa-graduation-cap" />
                  {t.experience.education}
                </>
              )}
            </div>
          </div>
        )}

        {item.type === 'experience' ? (
          <>
            <h4 className={`${styles.chronologicalTitle} ${styles.companyTitle}`}>
              <i className="fas fa-building" />
              {item.company}
            </h4>
            <p className={`${styles.metaRow} ${styles.positionSubtitle}`}>
              <i className="fas fa-user-tie" />
              <span>{item.title}</span>
            </p>
          </>
        ) : (
          <>
            <h4 className={styles.chronologicalTitle}>
              <i className="fas fa-building-columns" />
              <span>{item.title}</span>
            </h4>
            <p className={styles.metaRow}>
              <i className="fas fa-graduation-cap" />
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

        {item.type === 'experience' && item.technologies && item.technologies.length > 0 && (
          <div className={styles.chronologicalSkills}>
            <div className={styles.skillsLabel}>
              <i className="fas fa-tools" />
              <span>{t.forms.experience.technologies}:</span>
            </div>
            <div className={styles.skillsTags}>
              {item.technologies.map((tech: string, idx: number) => {
                const pill = resolvePill(tech, technologySuggestions, idx);
                return (
                  <SkillPill
                    key={pill.slug || idx}
                    slug={pill.slug}
                    svg={pill.svg}
                    name={pill.name}
                    colored={true}
                    color={pill.color}
                  />
                );
              })}
            </div>
          </div>
        )}

        {item.type === 'education' && item.grade && (
          <div className={styles.educationGrade}>
            <i className="fas fa-graduation-cap" />
            <span>
              {t.forms.experience.grade}: {item.grade}
            </span>
          </div>
        )}

        <div className={cardStyles.cardActions}>
          {isAuthenticated && (
            <>
              <button
                className={cardStyles.editBtn}
                type="button"
                onClick={() => onEdit && onEdit(item)}
                aria-label={t.experience.admin?.edit || 'Editar'}
              >
                <i className="fas fa-pen" />
              </button>

              <button
                className={cardStyles.deleteBtn}
                type="button"
                onClick={() => onDelete && onDelete(item)}
                aria-label={t.experience.admin?.delete || 'Eliminar'}
              >
                <i className="fas fa-trash-alt" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChronologicalCard;
