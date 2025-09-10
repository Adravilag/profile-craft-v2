import React from 'react';

export type FABAction = {
  id: string;
  onClick: () => void;
  // icon and label are required to match the component's expectations
  icon: string;
  label: string;
  // color options aligned with UI implementation
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
};

const FloatingActionButtonGroup: React.FC<{
  actions?: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}> = ({ actions = [], position = 'bottom-right' }) => {
  return (
    <div className={`fab-group fab-${position}`} role="group" aria-label="Acciones flotantes">
      {actions.map(a => (
        <button
          key={a.id}
          type="button"
          className={`fab-button fab-${a.color ?? 'neutral'}`}
          onClick={a.onClick}
          aria-label={a.label || a.id}
          title={a.label}
        >
          {a.icon ? <i className={a.icon} aria-hidden /> : <span className="fab-icon">+</span>}
        </button>
      ))}
    </div>
  );
};

export default FloatingActionButtonGroup;
