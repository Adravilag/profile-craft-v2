import React from 'react';
import styles from './Badge.module.css';

type Props = {
  icon?: React.ReactNode;
  label: string;
  className?: string;
};

const Badge: React.FC<Props> = ({ icon, label, className }) => {
  return (
    <span className={`${styles.badge} ${className ?? ''}`} role="status" aria-label={label}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{label}</span>
    </span>
  );
};

export default Badge;
