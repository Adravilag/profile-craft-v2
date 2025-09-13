import React from 'react';
import styles from './SkillMenu.module.css';

type SkillMenuProps = {
  skill: any;
  onEdit?: (s: any) => void;
  onDelete?: (id: number | string) => void;
  onOpenComment?: () => void;
  closeMenu: () => void;
  isOpen?: boolean;
};

const SkillMenu: React.FC<SkillMenuProps> = ({
  skill,
  onEdit,
  onDelete,
  onOpenComment,
  closeMenu,
  isOpen,
}) => {
  const visibleClass = isOpen ? styles.dropdownContentVisible : '';

  return (
    <div
      className={`${styles.dropdownContent} ${visibleClass}`}
      role="menu"
      aria-label={`Opciones de ${skill.name}`}
    >
      <button
        type="button"
        className={styles.dropdownItem}
        onClick={() => {
          onEdit?.(skill);
          // allow click handler to run before unmounting
          setTimeout(() => closeMenu(), 0);
        }}
      >
        <i className="fas fa-edit" />
        Editar
      </button>
      <button
        type="button"
        className={`${styles.dropdownItem} ${styles.delete}`}
        onClick={() => {
          onDelete?.(skill.id);
          setTimeout(() => closeMenu(), 0);
        }}
      >
        <i className="fas fa-trash" />
        Eliminar
      </button>
      <button
        type="button"
        className={styles.dropdownItem}
        onClick={() => {
          onOpenComment?.();
          setTimeout(() => closeMenu(), 0);
        }}
      >
        <i className="fas fa-comment" />
        Comentario
      </button>
    </div>
  );
};

export default SkillMenu;
