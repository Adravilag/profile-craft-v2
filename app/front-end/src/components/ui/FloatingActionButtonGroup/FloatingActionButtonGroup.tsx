// src/components/common/FloatingActionButtonGroup.tsx

import React from 'react';
import FloatingActionButton from './FloatingActionButton';
import styles from './FloatingActionButtonGroup.module.css';
import FABPortal from './FABPortal';

interface FABAction {
  id: string;
  onClick: () => void;
  icon: string;
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface FloatingActionButtonGroupProps {
  actions: FABAction[];
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

const FloatingActionButtonGroup: React.FC<FloatingActionButtonGroupProps> = ({
  actions,
  position = 'bottom-right',
  className = '',
}) => {
  // Helper function para obtener la clase de posición
  const getPositionClass = (position: string) => {
    switch (position) {
      case 'bottom-right':
        return styles.fabGroupBottomRight;
      case 'bottom-left':
        return styles.fabGroupBottomLeft;
      default:
        return styles.fabGroupBottomRight;
    }
  };

  if (actions.length === 0) return null;

  if (actions.length === 1) {
    const action = actions[0];
    return (
      <FABPortal>
        <FloatingActionButton
          onClick={action.onClick}
          icon={action.icon}
          label={action.label}
          color={action.color}
          position={position}
          containerClassName={className}
          usePortal={false}
        />
      </FABPortal>
    );
  }

  return (
    <FABPortal>
      <div className={`${styles.fabGroup} ${getPositionClass(position)} ${className}`}>
        {actions.map((action, index) => (
          <div
            key={action.id}
            className={styles.fabGroupItem}
            style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
          >
            <FloatingActionButton
              onClick={action.onClick}
              icon={action.icon}
              label={action.label}
              color={action.color || 'primary'}
              position={position}
              size="medium"
              containerClassName={styles.fabGroupButton}
              usePortal={false}
            />
          </div>
        ))}
      </div>
    </FABPortal>
  );
};

export default FloatingActionButtonGroup;
