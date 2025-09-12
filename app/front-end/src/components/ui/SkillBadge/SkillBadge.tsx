import React, { memo } from 'react';
// Asegura que las reglas de color de skills estén disponibles globalmente
import '@/styles/04-features/skills-colors.css';
import type { Skill } from '@/types/api';
import { findSkillIcon } from '@/features/skills/utils/iconLoader';
import styles from './SkillBadge.module.css';
import { normalizeSkillName } from '@/features/skills/utils/normalizeSkillName';

export interface SkillBadgeProps {
  skill?: Skill;
  name?: string;
  level?: number | null;
  size?: number; // px for icon
  className?: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  name: rawName,
  level,
  size = 20,
  className,
}) => {
  const name = String(skill?.name ?? rawName ?? '');
  const lvl = (skill as any)?.level ?? level;
  const { canonical, normalized, original } = normalizeSkillName(name);
  const svg = (skill as any)?.svg_path || findSkillIcon(canonical, normalized);

  return (
    <div
      className={`${styles.stackIcon} ${className || ''} stackIcon`}
      title={original}
      data-tech={canonical}
      role="button"
      tabIndex={0}
      aria-label={`${original}`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          (e.currentTarget as HTMLElement).click();
          e.preventDefault();
        }
      }}
    >
      {svg ? (
        <img src={svg} alt={original} style={{ width: size, height: size }} />
      ) : (
        // Prefer svg_path; fall back to legacy icon_class only if present, otherwise generic icon class
        <i className={(skill as any)?.icon_class || 'fas fa-code'} aria-hidden="true" />
      )}
      <span
        className={`${styles.skillHoverLabel} skillHoverLabel`}
        aria-hidden="true"
      >{`${original}${typeof lvl === 'number' ? ` — ${lvl}%` : ''}`}</span>
    </div>
  );
};

export default memo(SkillBadge);
