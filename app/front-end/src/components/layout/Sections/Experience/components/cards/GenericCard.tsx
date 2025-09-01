import BlurImage from '@/components/utils/BlurImage';
import React from 'react';

interface GenericCardProps {
  title: React.ReactNode;
  placeName?: string;
  placeSub?: string;
  imgSrc?: string;
  startDate?: string;
  endDate?: string;
  durationStr?: string;
  isCurrent?: boolean;
  technologies?: string[];
  description?: string;
  index?: number;
  animationDelay?: number;
  children?: React.ReactNode; // for extra actions or badges
}

const GenericCard: React.FC<GenericCardProps> = ({
  title,
  placeName,
  placeSub,
  imgSrc,
  startDate,
  endDate,
  durationStr,
  isCurrent = false,
  technologies = [],
  description,
  index = 0,
  animationDelay = 0.12,
  children,
}) => {
  const maxVisibleTech = 10;
  const visibleTechs = technologies.slice(0, maxVisibleTech);
  const rest = Math.max(0, technologies.length - visibleTechs.length);

  return (
    <div
      className={`timeline-item ${isCurrent ? 'ex-card--current' : ''}`}
      style={{ animationDelay: `${index * animationDelay}s` }}
    >
      <div className="timeline-marker">
        <div className={`marker-dot ${isCurrent ? 'experience present' : 'experience'}`}></div>
      </div>

      <div className={`timeline-content ex-card`}>
        {imgSrc && (
          <div className="card-media">
            <BlurImage
              src={imgSrc}
              alt={placeName ?? ''}
              loading="lazy"
              decoding="async"
              width={640}
              height={240}
            />
            {startDate || endDate ? (
              <span className="pill period">
                <i className="fas fa-calendar-alt" />{' '}
                {`${startDate ? startDate : ''} ${endDate ? '– ' + endDate : ''}`}
              </span>
            ) : null}
          </div>
        )}

        <div className="card-topline">
          <div className="card-avatar">
            {imgSrc ? (
              <BlurImage src={imgSrc} alt={`${placeName} logo`} />
            ) : (
              <span>{(placeName || '?').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h4 className="timeline-title">{title}</h4>
        </div>

        <div className="card-topline-meta">
          {startDate || endDate ? (
            <span className="pill period">
              <i className="fas fa-calendar-alt"></i>
              {startDate ? startDate : ''} {endDate ? '– ' + endDate : ''}
            </span>
          ) : null}
        </div>

        {placeName && (
          <p className="meta-row">
            <i className="fas fa-building" aria-hidden="true"></i>
            <span>{placeName}</span>
            {placeSub ? (
              <>
                <span className="dot" aria-hidden="true" />{' '}
                <span>
                  <i className="fas fa-map-marker-alt" /> {placeSub}
                </span>
              </>
            ) : null}
          </p>
        )}

        {durationStr && (
          <div className="timeline-duration">
            <i className="fas fa-hourglass-half" /> <span>{durationStr}</span>
          </div>
        )}

        {description && (
          <div className="timeline-description">
            <p className={'ex-card__desc--clamp'}>{description}</p>
          </div>
        )}

        {technologies && technologies.length > 0 && (
          <div className="timeline-skills">
            <div className="skills-label">
              <i className="fas fa-tools" aria-hidden="true"></i>
              <span>Tecnologías:</span>
            </div>
            <div className="skills-tags">
              {visibleTechs.map((t, i) => (
                <div key={i} className="timeline-skill" role="note" aria-label={`Tecnología ${t}`}>
                  {t}
                </div>
              ))}
              {rest > 0 && <div className="tech-chip tech-chip--more">+{rest}</div>}
            </div>
          </div>
        )}

        <div className="card-actions">{children}</div>

        {isCurrent && (
          <div className="current-position-badge">
            <i className="fas fa-star" aria-hidden="true"></i>
            <span>Posición Actual</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericCard;
