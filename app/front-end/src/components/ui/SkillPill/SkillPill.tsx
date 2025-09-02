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
  /** Callback cuando se hace clic en el botón de cerrar */
  onClose?: (skillName: string) => void;
  /** Mostrar el botón de cerrar */
  closable?: boolean;
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
  onClose,
  closable = false,
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

  const handleClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose(original);
    }
  };

  const handleCloseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClose(e);
    }
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
      {renderCloseButton()}
    </div>
  );
};

export default SkillPill;
