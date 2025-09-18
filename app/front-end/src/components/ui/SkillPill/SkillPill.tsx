import React, { useEffect, useState } from 'react';
import '@/styles/04-features/skills-colors.css';
import { normalizeSvgPath } from '@/features/skills/utils/skillUtils';

interface SkillPillProps {
  slug: string;
  name?: string;
  svg?: string; // url or path
  color?: string;
  level?: number | null;
  size?: number;
  tooltipPosition?: 'up' | 'down';
  compact?: boolean; // when true, hide label and show tooltip on hover/focus
  className?: string;
  forceActive?: boolean;
  colored?: boolean;
  onClose?: (skillName: string) => void;
  closable?: boolean;
}

const SkillPill: React.FC<SkillPillProps> = ({
  slug,
  name: displayName,
  svg,
  color,
  level,
  size = 18,
  tooltipPosition = 'up',
  compact = false,
  className = '',
  forceActive = false,
  colored = false,
  onClose,
  closable = false,
}) => {
  const original = displayName ?? slug ?? '';
  const tooltipId = `skillpill-tooltip-${slug}-${Math.random().toString(36).slice(2, 8)}`;
  const [showTooltip, setShowTooltip] = useState(false);

  // icon url
  const [iconUrl, setIconUrl] = useState<string | undefined>(
    svg ? normalizeSvgPath(svg) : undefined
  );
  useEffect(() => {
    if (svg) setIconUrl(normalizeSvgPath(svg));
  }, [svg]);

  const resolvedColor = color;
  const isActive = forceActive || colored;

  const pillStyle: React.CSSProperties | undefined =
    colored && resolvedColor
      ? ({ ['--skill-color' as any]: resolvedColor, color: '#FFFFFF' } as React.CSSProperties)
      : undefined;

  const handleClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) onClose(original);
  };

  const handleCloseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClose(e);
  };

  const renderIcon = () => {
    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt={original}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
        />
      );
    }
    if (resolvedColor) {
      return (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--skill-color)',
            flex: '0 0 18px',
          }}
        />
      );
    }
    return <i className="fas fa-code" aria-hidden />;
  };

  const renderCloseButton = () => {
    if (!closable || !onClose) return null;
    return (
      <button
        type="button"
        className="skillPill__close"
        onClick={handleClose}
        onKeyDown={handleCloseKeyDown}
        aria-label={`Eliminar ${original}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          marginLeft: 4,
          fontSize: 12,
          color: 'inherit',
          opacity: 0.7,
        }}
      >
        ×
      </button>
    );
  };

  // container needs relative to position tooltip
  const containerStyle: React.CSSProperties = { position: 'relative', ...(pillStyle || {}) };

  return (
    <div
      title={original}
      className={`stackIcon ${className ?? ''} ${isActive ? 'stackIcon--active' : ''}`.trim()}
      data-tooltip-id={tooltipId}
      aria-describedby={compact ? tooltipId : undefined}
      data-tech={original}
      role="button"
      tabIndex={0}
      style={containerStyle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).click();
        }
      }}
      aria-label={original}
      aria-pressed={colored ? isActive : undefined}
    >
      {renderIcon()}

      {!compact &&
        (colored ? (
          <span
            className="skillLabel"
            aria-hidden={false}
          >{`${original}${typeof level === 'number' ? ` — ${level}%` : ''}`}</span>
        ) : (
          <span
            className="skillHoverLabel"
            aria-hidden
          >{`${original}${typeof level === 'number' ? ` — ${level}%` : ''}`}</span>
        ))}

      {renderCloseButton()}

      {compact && (
        <div
          id={tooltipId}
          role="tooltip"
          aria-hidden={!showTooltip}
          style={{
            position: 'absolute',
            zIndex: 10002,
            background: '#111827',
            color: '#fff',
            padding: '6px 8px',
            borderRadius: 6,
            fontSize: 12,
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
            opacity: showTooltip ? 1 : 0,
            pointerEvents: showTooltip ? 'auto' : 'none',
            transition: 'opacity 120ms ease, transform 120ms ease',
            whiteSpace: 'nowrap',
            left: '50%',
            transformOrigin: tooltipPosition === 'down' ? 'center top' : 'center bottom',
            ...(tooltipPosition === 'down'
              ? {
                  top: '100%',
                  marginTop: 8,
                  transform: showTooltip ? 'translate(-50%, 0)' : 'translate(-50%, -6px)',
                }
              : {
                  bottom: '100%',
                  marginBottom: 8,
                  transform: showTooltip ? 'translate(-50%, 0)' : 'translate(-50%, 6px)',
                }),
          }}
        >
          {`${original}${typeof level === 'number' ? ` — ${level}%` : ''}`}
        </div>
      )}
    </div>
  );
};

export default SkillPill;
