import React from 'react';
import styles from './SkillPreviewModal.module.css';

const SkillPreviewModal: React.FC<{
  isOpen: boolean;
  skill: any | null;
  skillsIcons: any[];
  externalData: Record<string, any>;
  loadingExternalData: Record<string, boolean>;
  onClose: () => void;
}> = ({ isOpen, skill, skillsIcons, externalData, loadingExternalData, onClose }) => {
  if (!isOpen || !skill) return null;

  const icon = (skillsIcons || []).find(
    s => s.name.toLowerCase() === (skill.name || '').toLowerCase()
  );
  const svg = (skill as any).svg_path || icon?.svg_path || '/assets/svg/generic-code.svg';

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <h3>{skill.name}</h3>
          <button onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>
        <div className={styles.body}>
          <img src={svg} alt={`Icono de ${skill.name}`} className={styles.icon} />
          <div className={styles.details}>
            <p>
              {(externalData && externalData[skill.name]?.description) ||
                (skill as any).description ||
                ''}
            </p>
            <p>Level: {skill.level ?? 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillPreviewModal;
