import React, { memo, useEffect, useState } from 'react';
// Asegura que las reglas de color de skills estén disponibles globalmente
import '@/styles/04-features/skills-colors.css';
import type { Skill } from '@/types/api';
import {
  findSkillIcon,
  preloadSkillIconMap,
  getSkillIconEntry,
} from '@/features/skills/utils/iconLoader';
import { normalizeSvgPath } from '@/features/skills/utils/skillUtils';
import { resolveIconCandidates } from '@/features/skills/utils/iconResolve';
import styles from './SkillBadge.module.css';

export interface SkillBadgeProps {
  skill?: Skill;
  /** Prefer passing a slug/key for the skill (used to lookup icon). Falls back to `skill?.name` for label. */
  slug?: string;
  /** Optional display name to show in UI (if different from slug) */
  name?: string;
  svg?: string; // <- siempre se usará este
  color?: string;
  colored?: boolean;
  closable?: boolean;
  onClose?: (skillName: string) => void;
  forceActive?: boolean;
  /** Nivel de habilidad (0-100) */
  level?: number | null;
  size?: number; // px for icon
  className?: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  slug,
  name,
  svg: svgProp,
  color: colorProp,
  colored = false,
  closable = false,
  onClose,
  forceActive = false,
  level,
  size = 20,
  className,
}) => {
  const lvl = typeof level === 'number' ? Math.max(0, Math.min(100, Math.round(level))) : null;

  // lookupKey is used to find icon data (prefer slug)
  const lookupKey = slug ?? skill?.name ?? '';
  // display label (prefer explicit name prop, then skill.name, then slug)
  const displayLabel = name ?? skill?.name ?? slug ?? '';

  const normalizeKey = (s?: string) =>
    (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-.]/g, '');

  const dataTech = normalizeKey(lookupKey || displayLabel || slug);

  // Estado local para el svg (ruta pública al archivo)
  // Priorizar prop `svg` si está presente.
  const [iconUrl, setIconUrl] = useState<string | undefined>(
    svgProp ? normalizeSvgPath(svgProp) : undefined
  );

  // resolved color: prefer skill.color if provided
  // Resolve color: prefer explicit skill.color, fallback to manifest entry color when available
  const entryForColor = (() => {
    try {
      const e = getSkillIconEntry(dataTech);
      return e && (e as any).color ? (e as any).color : undefined;
    } catch {
      return undefined;
    }
  })();
  // resolvedColor: prioridad -> prop color, skill.color, manifest color
  const [resolvedColor] = useState<string | undefined>(
    colorProp || (skill && (skill as any).color) || entryForColor || undefined
  );

  // Refs to avoid repeated sets and track attempted candidates
  const iconRef = React.useRef<string | undefined>(iconUrl);
  React.useEffect(() => {
    iconRef.current = iconUrl;
  }, [iconUrl]);

  const triedSvgRef = React.useRef<Set<string>>(new Set());
  const lastLookupRef = React.useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (lastLookupRef.current !== lookupKey) {
      triedSvgRef.current.clear();
      lastLookupRef.current = lookupKey || null;
    }

    async function ensureIcon() {
      // If a svg prop is provided, it's authoritative — don't override it with lookups
      if (svgProp) return;
      // 1) If skill explicitly provides svg_path, use it
      if (skill && (skill as any).svg_path) {
        const p = normalizeSvgPath((skill as any).svg_path);
        if (mounted && p !== iconRef.current && !triedSvgRef.current.has(p)) {
          setIconUrl(p);
          triedSvgRef.current.add(p);
        }
        return;
      }

      if (!lookupKey) return;

      // Build candidate keys: prefer slug then name then lookupKey
      const lookupKeys: string[] = [];
      if (slug) lookupKeys.push(slug);
      if (name) lookupKeys.push(name);
      if (lookupKey && !lookupKeys.includes(lookupKey)) lookupKeys.push(lookupKey);

      const normalizeKebab = (s: string) =>
        s
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-.]/g, '');

      // 2) Try fast map lookups
      for (const k of lookupKeys) {
        const candidates = [k, normalizeKebab(k)];
        for (const c of candidates) {
          try {
            // prefer manifest entry when available
            const entry = getSkillIconEntry(c);
            if (entry && (entry as any).svg_path) {
              const p = normalizeSvgPath((entry as any).svg_path);
              if (mounted && p !== iconRef.current && !triedSvgRef.current.has(p)) {
                setIconUrl(p);
                triedSvgRef.current.add(p);
                return;
              }
            }
            const found = findSkillIcon(c);
            if (found && mounted && found !== iconRef.current && !triedSvgRef.current.has(found)) {
              const np = normalizeSvgPath(found);
              setIconUrl(np);
              triedSvgRef.current.add(found);
              return;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      // 3) Preload central map and retry
      try {
        await preloadSkillIconMap();
        for (const k of lookupKeys) {
          const candidates = [k, normalizeKebab(k)];
          for (const c of candidates) {
            const after = findSkillIcon(c);
            if (after && mounted && after !== iconRef.current && !triedSvgRef.current.has(after)) {
              const np = normalizeSvgPath(after);
              setIconUrl(np);
              triedSvgRef.current.add(after);
              return;
            }
          }
        }
      } catch (e) {
        // continue
      }

      // 4) Use centralized resolver to get hashed/public URL in production
      try {
        const candidates: string[] = [];
        if ((slug || '').toString().trim()) candidates.push(slug.toString());
        if ((name || '').toString().trim()) candidates.push(name.toString());
        const explicit = lookupKey ? lookupKey.toString().trim() : '';
        if (explicit)
          candidates.push(
            explicit
              .replace(/^\/+/, '')
              .replace(/.*\//, '')
              .replace(/\.svg$/i, '')
          );

        const resolved = await resolveIconCandidates(candidates);
        if (
          resolved &&
          mounted &&
          resolved !== iconRef.current &&
          !triedSvgRef.current.has(resolved)
        ) {
          const np = normalizeSvgPath(resolved);
          setIconUrl(np);
          triedSvgRef.current.add(resolved);
          return;
        }
      } catch (e) {
        // ignore
      }

      // fallback: clear to undefined so UI shows generic icon
      if (mounted && iconRef.current !== undefined) setIconUrl(undefined);
    }

    void ensureIcon();
    return () => {
      mounted = false;
    };
  }, [lookupKey, skill, slug, name, svgProp]);

  // Guard: if svg looks like a full HTML document (dev server fallback), ignore it
  useEffect(() => {
    if (!iconUrl) return;
    if (/<!doctype html>|<html[\s>]/i.test(iconUrl)) {
      // eslint-disable-next-line no-console
      console.warn('SkillBadge: detected HTML document in svg content — ignoring');
      setIconUrl(undefined);
    }
  }, [iconUrl]);

  useEffect(() => {
    if (svgProp) {
      setIconUrl(normalizeSvgPath(svgProp));
    }
  }, [svgProp]);

  const getContrastColor = (bg: string) => {
    try {
      const hexMatch = bg.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      let r = 0,
        g = 0,
        b = 0;
      if (hexMatch) {
        const hex = hexMatch[1];
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
      } else {
        const rgb = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (rgb) {
          r = Number(rgb[1]);
          g = Number(rgb[2]);
          b = Number(rgb[3]);
        } else {
          return '#fff';
        }
      }
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return luminance > 0.6 ? '#000' : '#fff';
    } catch {
      return '#fff';
    }
  };
  const getContrastColorLocal = (bg: string) => getContrastColor(bg);

  const renderIcon = () => {
    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt={displayLabel}
          data-testid="skill-icon-img"
          style={{ width: size, height: size }}
          loading="lazy"
          decoding="async"
          width={size}
          height={size}
          onError={() => {
            // If the image fails to load, clear iconUrl so we render the fallback
            try {
              if (iconRef.current) triedSvgRef.current.add(iconRef.current);
            } catch (e) {
              // ignore
            }
            iconRef.current = undefined;
            setIconUrl(undefined);
          }}
        />
      );
    }
    // color dot fallback
    if (resolvedColor) {
      return (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--skill-color)',
            flex: `0 0 ${size}px`,
          }}
        />
      );
    }
    return <i className={'fas fa-code'} aria-hidden="true" />;
  };

  const isActive = forceActive || colored;

  const pillStyle: React.CSSProperties | undefined =
    colored && resolvedColor
      ? {
          ['--skill-color' as any]: resolvedColor,
          color: getContrastColorLocal(resolvedColor),
        }
      : undefined;

  const handleClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) onClose(displayLabel);
  };

  const handleCloseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClose(e);
  };

  const renderCloseButton = () => {
    if (!closable || !onClose) return null;
    return (
      <button
        type="button"
        className="skillPill__close"
        onClick={handleClose}
        onKeyDown={handleCloseKeyDown}
        aria-label={`Eliminar ${displayLabel}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          marginLeft: '4px',
          fontSize: '12px',
          color: 'inherit',
          opacity: 0.7,
        }}
      >
        ×
      </button>
    );
  };

  return (
    <div
      className={`${styles.stackIcon} ${className || ''} stackIcon ${isActive ? 'stackIcon--active' : ''}`.trim()}
      title={skill?.name ?? slug}
      data-tech={dataTech}
      role="button"
      tabIndex={0}
      aria-label={`${skill?.name ?? slug}`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          (e.currentTarget as HTMLElement).click();
          e.preventDefault();
        }
      }}
      style={pillStyle}
      aria-pressed={colored ? isActive : undefined}
    >
      {renderIcon()}
      {colored ? (
        <span className={styles.skillLabel} aria-hidden={false}>
          {`${displayLabel}${typeof lvl === 'number' ? ` — ${lvl}%` : ''}`}
        </span>
      ) : (
        <span className={`${styles.skillHoverLabel} skillHoverLabel`} aria-hidden="true">
          {`${displayLabel}${typeof lvl === 'number' ? ` — ${lvl}%` : ''}`}
        </span>
      )}
      {renderCloseButton()}
    </div>
  );
};

export default memo(SkillBadge);
