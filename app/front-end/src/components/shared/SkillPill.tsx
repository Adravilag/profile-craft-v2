import React from 'react';
// Import global skill color rules so colors apply wherever se use el componente
import '@/styles/04-features/skills-colors.css';
import { normalizeSkillName } from '@/features/skills/utils/normalizeSkillName';
import { findSkillIcon } from '@/features/skills/utils/iconLoader';

interface SkillPillProps {
  name: string;
  level?: number | null;
  className?: string;
  /** Force the hover/active background to be visible */
  forceActive?: boolean;
  /** Alias más explícito: aplicar el fondo de color correspondiente desde props */
  colored?: boolean;
}

const normalize = (nameRaw: string) => {
  return normalizeSkillName(nameRaw);
};

const SkillPill: React.FC<SkillPillProps> = ({
  name,
  level,
  className,
  forceActive = false,
  colored = false,
}) => {
  const { normalized, canonical, original } = normalize(name);

  const renderIcon = () => {
    const iconUrl = findSkillIcon(canonical, normalized);

    if (iconUrl) {
      return (
        <img src={iconUrl} alt={original} width={18} height={18} loading="lazy" decoding="async" />
      );
    }

    return <i className={'fas fa-code'} aria-hidden="true" />;
  };

  const isActive = forceActive || colored;

  return (
    <div
      className={`stackIcon ${className ?? ''} ${isActive ? 'stackIcon--active' : ''}`.trim()}
      data-tech={canonical}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
      aria-label={original}
      aria-pressed={colored ? isActive : undefined}
    >
      {renderIcon()}
      {/*
        Mostrar siempre una etiqueta textual identificable para accesibilidad y tests.
        Cuando `colored` es false se usa la clase de hover; cuando es true se muestra
        una etiqueta estática y visible cerca del icono.
      */}
      {colored ? (
        <span
          className={`skillLabel`}
          aria-hidden={false}
        >{`${original}${typeof level === 'number' ? ` — ${level}%` : ''}`}</span>
      ) : (
        <span
          className={`skillHoverLabel`}
          aria-hidden="true"
        >{`${original}${typeof level === 'number' ? ` — ${level}%` : ''}`}</span>
      )}
    </div>
  );
};

export default SkillPill;
