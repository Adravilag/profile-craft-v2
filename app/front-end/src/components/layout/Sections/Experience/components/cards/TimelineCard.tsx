import BlurImage from '@/components/utils/BlurImage';
import React, { memo } from 'react';
import styles from './TimelineCard.module.css';
import type { Experience } from '@/types/api';
import { formatDateRange, calculateDuration } from '@/utils/dateUtils';
import { findImageForName } from '@/utils/imageLookup';
import SkillPill from '@/components/shared/SkillPill';
import { normalizeSkillName } from '@/features/skills/utils/normalizeSkillName';

interface Education {
  _id?: string;
  id?: number | string;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
}

interface TimelineCardProps {
  // Props directas (compatibilidad hacia atrás)
  title?: React.ReactNode;
  placeName?: string;
  placeSub?: string;
  logoSrc?: string;
  headerImgSrc?: string;
  startDate?: string;
  endDate?: string;
  durationStr?: string;
  isCurrent?: boolean;
  technologies?: string[];
  description?: string;
  grade?: string;
  index?: number;
  animationDelay?: number;
  children?: React.ReactNode;

  // Objetos raw
  experience?: Experience;
  education?: Education;
}

const TimelineCard: React.FC<TimelineCardProps> = memo(props => {
  const {
    title,
    placeName,
    placeSub,
    logoSrc,
    headerImgSrc,
    startDate,
    endDate,
    durationStr,
    isCurrent,
    technologies = [],
    description,
    grade,
    index = 0,
    animationDelay = 0.12,
    children,
    experience,
    education,
  } = props;

  // Procesamiento de datos
  const cardData = React.useMemo(() => {
    let data = {
      title: title ?? '',
      placeName,
      placeSub,
      logoSrc,
      headerImgSrc,
      startDate,
      endDate,
      durationStr,
      isCurrent: isCurrent ?? false,
      technologies,
      description,
      grade,
    };

    if (experience) {
      const companyName = experience.company || experience.location;
      data = {
        ...data,
        title: experience.position || data.title,
        placeName: experience.company || data.placeName,
        placeSub: experience.location || data.placeSub,
        headerImgSrc: data.headerImgSrc || experience.header_image || findImageForName(companyName),
        logoSrc: data.logoSrc || experience.logo_image || findImageForName(companyName),
        isCurrent:
          typeof experience.end_date === 'undefined' ||
          /presente|actual|now/i.test(String(experience.end_date)),
        startDate: data.startDate || formatDateRange(experience.start_date, experience.end_date),
        durationStr:
          data.durationStr || calculateDuration(experience.start_date, experience.end_date),
        technologies: experience.technologies || data.technologies,
        description: data.description || experience.description,
      };
    }

    if (education) {
      const institutionName = education.institution;
      data = {
        ...data,
        title: education.title || data.title,
        placeName: education.institution || data.placeName,
        headerImgSrc:
          data.headerImgSrc || (education as any).header_image || findImageForName(institutionName),
        logoSrc: data.logoSrc || (education as any).logo_image || findImageForName(institutionName),
        isCurrent:
          typeof education.end_date === 'undefined' ||
          /presente|actual|now/i.test(String(education.end_date)),
        startDate: data.startDate || formatDateRange(education.start_date, education.end_date),
        durationStr:
          data.durationStr || calculateDuration(education.start_date, education.end_date),
        description: data.description || education.description,
        grade: data.grade || (education.grade ? `Calificación: ${education.grade}` : undefined),
      };
    }

    return data;
  }, [
    title,
    placeName,
    placeSub,
    logoSrc,
    headerImgSrc,
    startDate,
    endDate,
    durationStr,
    isCurrent,
    technologies,
    description,
    grade,
    experience,
    education,
  ]);

  // Tecnologías: ahora se muestran con SkillPill como en ChronologicalItem
  // Además, ordenamos por color de fondo (hue) para agrupar visualmente
  const sortedTechnologies = React.useMemo(() => {
    // Mapa de colores base por tecnología (alineado con skills-colors.css)
    const SKILL_HEX: Record<string, string> = {
      aws: '#FF9900',
      amazonwebservices: '#FF9900',
      angular: '#DD0031',
      ansible: '#EE0000',
      apache: '#D22128',
      babel: '#F9DC3E',
      bootstrap: '#7952B3',
      cplusplus: '#00599C',
      'c-plus-plus': '#00599C',
      circleci: '#343434',
      claude: '#6C5CE7',
      csharp: '#239120',
      css3: '#1572B6',
      django: '#092E20',
      docker: '#2496ED',
      elasticsearch: '#005571',
      'elastic-search': '#005571',
      eslint: '#4B32C3',
      express: '#000000',
      fastapi: '#009688',
      firebase: '#FFCB2B',
      flask: '#000000',
      flutter: '#02569B',
      'generic-code': '#7f8c8d',
      git: '#F05032',
      'github-actions': '#2088FF',
      githubactions: '#2088FF',
      go: '#00ADD8',
      googlegemini: '#00A0FF',
      graphql: '#E10098',
      terraform: '#6F42C1',
      'hashicorp-terraform': '#6F42C1',
      html5: '#E34F26',
      java: '#007396',
      javascript: '#F7DF1E',
      jenkins: '#D24939',
      jira: '#0052CC',
      kotlin: '#0095D5',
      kubernetes: '#326CE5',
      laravel: '#FF2D20',
      linux: '#000000',
      'material-ui': '#007FFF',
      mui: '#007FFF',
      microsoftazure: '#0078D4',
      mongodb: '#47A248',
      mysql: '#4479A1',
      nextdotjs: '#000000',
      'next.js': '#000000',
      nginx: '#009639',
      nodedotjs: '#83CD29',
      openai: '#10A37F',
      php: '#8993BE',
      postgresql: '#336791',
      'postgres-sql': '#336791',
      postman: '#FF6C37',
      prettier: '#F7B93E',
      python: '#3776AB',
      react: '#040a0c',
      redis: '#DC382D',
      redux: '#764ABC',
      restapi: '#E34F26',
      rubyonrails: '#CC0000',
      'ruby-on-rails': '#CC0000',
      rust: '#DEA584',
      sass: '#CC6699',
      springboot: '#6DB33F',
      sql: '#003B57',
      sqlite: '#003B57',
      svelte: '#FF3E00',
      swift: '#FA7343',
      symfony: '#000000',
      'tailwind-css': '#06B6D4',
      tailwindcss: '#06B6D4',
      trello: '#0079BF',
      typescript: '#3178C6',
      'visual-studio-code': '#007ACC',
      vscode: '#007ACC',
      vuedotjs: '#42B883',
      'vue-dot-js': '#42B883',
      vuejs: '#42B883',
      webpack: '#8ED6F9',
      wordpress: '#21759B',
      excel: '#217346',
      access: '#990000',
      cypress: '#17202A',
      jest: '#C63D91',
      svn: '#E64A19',
      dotnet: '#512BD4',
      'dotnet-svgrepo-com': '#512BD4',
      'dot-net': '#512BD4',
      c: '#239120',
      jsp: '#007396',
    };

    const hexToHsl = (hex: string) => {
      const clean = hex.replace('#', '');
      const bigint = parseInt(clean, 16);
      const r = ((bigint >> 16) & 255) / 255;
      const g = ((bigint >> 8) & 255) / 255;
      const b = (bigint & 255) / 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      let h = 0,
        s = 0;
      const l = (max + min) / 2;
      const d = max - min;
      if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          default:
            h = (r - g) / d + 4;
        }
        h *= 60;
      }
      return { h, s, l };
    };

    return [...(cardData.technologies || [])]
      .map(name => {
        const { canonical } = normalizeSkillName(name);
        const hex = SKILL_HEX[canonical];
        const hsl = hex ? hexToHsl(hex) : { h: 999, s: 0, l: 0 };
        return { name, hsl };
      })
      .sort((a, b) => {
        if (a.hsl.h === b.hsl.h) {
          // Más saturado primero si mismo hue
          if (a.hsl.s === b.hsl.s) return a.hsl.l - b.hsl.l;
          return b.hsl.s - a.hsl.s;
        }
        return a.hsl.h - b.hsl.h;
      })
      .map(x => x.name);
  }, [cardData.technologies]);

  const cardId = `timeline-card-${index}`;

  return (
    <article
      id={cardId}
      className={`${styles.timelineItem} ${styles.timelineCardCompact} ${cardData.isCurrent ? styles.exCardCurrent : ''}`}
      style={
        {
          animationDelay: `${index * animationDelay}s`,
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        } as React.CSSProperties
      }
      data-current={cardData.isCurrent}
    >
      {/* Timeline marker */}
      <div className={styles.timelineMarker}>
        <div
          className={`${styles.markerDot} ${education ? styles.education : styles.experience} ${cardData.isCurrent ? styles.present : ''}`}
          aria-hidden="true"
        />
      </div>

      <div className={styles.timelineContent}>
        {/* Hero image con fecha y logo */}
        {cardData.headerImgSrc && (
          <div className={`${styles.cardMediaHero} ${styles.cardMedia}`}>
            <BlurImage
              className={styles.cardMedia__img}
              src={cardData.headerImgSrc}
              alt={`${cardData.placeName} header`}
              loading="lazy"
              decoding="async"
            />

            {/* Pill de fecha */}
            {(cardData.startDate || cardData.endDate) && (
              <div className={`${styles.pill} ${styles.period} ${styles.periodAbs}`}>
                <i className="fas fa-calendar-alt" aria-hidden="true" />
                <span>
                  {cardData.startDate}
                  {cardData.endDate && ` – ${cardData.endDate}`}
                </span>
              </div>
            )}

            {/* Logo overlay */}
            <div className={styles.cardMediaLogo}>
              {cardData.logoSrc ? (
                <BlurImage src={cardData.logoSrc} alt={`${cardData.placeName} logo`} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--md-sys-color-surface-variant)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                  }}
                >
                  {(cardData.placeName || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header con título y duración */}
        <header className={styles.headerRow}>
          <div className={styles.titleWrapper}>
            <h3 className={styles.timelineTitle}>{cardData.title}</h3>

            {cardData.placeName && (
              <div className={styles.metaRow}>
                <i className="fas fa-building" aria-hidden="true" />
                <span>
                  {cardData.placeName}
                  {cardData.placeSub && ` · ${cardData.placeSub}`}
                </span>
              </div>
            )}
          </div>

          {cardData.durationStr && (
            <div className={`${styles.pill} ${styles.pillGreen} ${styles.duration}`}>
              <i className="fas fa-hourglass-half" aria-hidden="true" />
              <span>{cardData.durationStr}</span>
            </div>
          )}
        </header>

        {/* Descripción */}
        {cardData.description && (
          <div className={styles.timelineDescription}>
            <p className={`${styles.exCard__descClamp} ${styles.descClamp}`}>
              {cardData.description}
            </p>
          </div>
        )}
        {/* Calificación (solo para educación) */}
        {cardData.grade && (
          <div className={styles.timelineDescription}>
            <p style={{ fontStyle: 'italic', color: 'var(--md-sys-color-on-surface-variant)' }}>
              {cardData.grade}
            </p>
          </div>
        )}

        {/* Tecnologías (render como ChronologicalItem con SkillPill) */}
        {cardData.technologies.length > 0 && (
          <div className={styles.timelineSkills}>
            <div className={styles.skillsLabel}>
              <i className="fas fa-tools" aria-hidden="true" />
              <span>Tecnologías:</span>
            </div>
            <div className={styles.skillsTags}>
              {sortedTechnologies.map((tech, idx) => (
                <SkillPill key={idx} name={tech} forceActive />
              ))}
            </div>
          </div>
        )}

        {/* Badge de posición actual */}
        {cardData.isCurrent && (
          <div className={styles.currentPositionBadge}>
            <i className="fas fa-star" aria-hidden="true" />
            <span>Posición Actual</span>
          </div>
        )}

        {/* Acciones adicionales */}
        {children && <div className={styles.cardActions}>{children}</div>}
      </div>
    </article>
  );
});

TimelineCard.displayName = 'TimelineCard';

export default TimelineCard;
