import React, { useEffect, useState } from 'react';
import '@/styles/04-features/skills-colors.css';
import { normalizeSvgPath } from '@/features/skills/utils/skillUtils';

// When svg/color are not provided we can try to resolve them from the centralized skill settings loader.
// Use a dynamic import so the loader isn't bundled into every place that renders SkillPill.

interface SkillPillProps {
  slug: string;
  // name, svg and color are resolved internally from the centralized skill settings when needed
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
  const [resolvedName, setResolvedName] = useState<string>(slug ?? '');
  const original = resolvedName;
  const tooltipId = `skillpill-tooltip-${slug}-${Math.random().toString(36).slice(2, 8)}`;
  const [showTooltip, setShowTooltip] = useState(false);

  // icon url (initially undefined; will be resolved from settings if available)
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);

  // Try to resolve svg/color from centralized skill settings when not passed as props.
  useEffect(() => {
    let mounted = true;

    // If the consumer provided explicit svg/color we would skip; since we no longer accept those
    // props we always try to resolve from settings but keep existing fallback behaviour.

    const resolveFromSettings = async () => {
      try {
        const mod = await import('@/features/skills/utils/skillSettingsLoader');
        // loader exports default as function and named helpers; try to access default or named
        const loadSkillSettings: any = (mod && (mod.default || mod.loadSkillSettings)) ?? mod;
        if (!loadSkillSettings || typeof loadSkillSettings !== 'function') return;

        // Try to get cached first via a helper if available to avoid extra fetch
        const anyMod = mod as any;
        const getCached = anyMod.getCachedSkillSettings as (() => any[]) | undefined;
        let data: any[] | undefined;
        if (getCached) {
          data = getCached();
        }
        if (!data) {
          data = await loadSkillSettings();
        }
        if (!mounted || !Array.isArray(data)) return;

        // Match by slug or name
        const entry = data.find(e => {
          const s = (e.slug || '').toLowerCase();
          const n = (e.name || '').toLowerCase();
          const target = (slug || '').toLowerCase();
          return s === target || n === target;
        });
        if (!entry) return;

        if (mounted && entry.svg) {
          setIconUrl(normalizeSvgPath(String(entry.svg)));
        }
        if (mounted && entry.color) {
          setResolvedColorState(String(entry.color));
        }
        if (mounted && entry.name) {
          setResolvedName(String(entry.name));
        }
      } catch (e) {
        // swallow errors — keep existing fallback behavior
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development')
          console.debug('SkillPill: failed to resolve from settings', e);
      }
    };

    resolveFromSettings();

    return () => {
      mounted = false;
    };
  }, [slug]);

  // Allow runtime-resolved color from settings via a small local state if needed.
  const [resolvedColorState, setResolvedColorState] = useState<string | undefined>(undefined);
  const resolvedColor = resolvedColorState;
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
