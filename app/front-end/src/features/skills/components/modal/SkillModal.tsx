import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SkillModalProps } from '../../types/skills';
import { debugLog } from '@/utils/debugConfig';
import styles from './SkillModal.module.css';

const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'DevOps & Tools',
  'Data Science',
  'Mobile',
  'Cloud',
  'Testing',
  'UI/UX',
  'Security',
  'MCP',
  'Other',
];

const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  editingId,
  formData,
  skillsIcons,
  onClose,
  onSubmit,
  onFormChange,
  isAdmin = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Actualizar el icono de preview cuando cambia el nombre
  useEffect(() => {
    if (formData.name && skillsIcons.length > 0) {
      const matchingIcon = skillsIcons.find(
        icon => icon.name.toLowerCase() === formData.name.toLowerCase()
      );
      setPreviewIcon(matchingIcon?.svg_path || null);
    } else {
      setPreviewIcon(null);
    }
  }, [formData.name, skillsIcons]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    debugLog.dataLoading('🚀 SkillModal: Enviando formulario', formData);

    try {
      await onSubmit(e);
      handleClose();
    } catch (error) {
      debugLog.dataLoading('❌ SkillModal: Error al enviar formulario', error);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <i className="fas fa-tools"></i>
            {editingId ? 'Editar Habilidad' : 'Nueva Habilidad'}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="skillName" className={styles.label}>
              Nombre de la Habilidad *
            </label>
            <input
              id="skillName"
              name="name"
              type="text"
              value={formData.name}
              onChange={onFormChange}
              className={styles.input}
              placeholder="Ej: React, Python, Docker..."
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="skillCategory" className={styles.label}>
              Categoría *
            </label>
            <select
              id="skillCategory"
              name="category"
              value={formData.category}
              onChange={onFormChange}
              className={styles.select}
              required
            >
              {SKILL_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="skillLevel" className={styles.label}>
              Nivel de Dominio: {formData.level}%
            </label>
            <input
              id="skillLevel"
              name="level"
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.level}
              onChange={onFormChange}
              className={styles.range}
            />
            <div className={styles.rangeLabels}>
              <span>Principiante</span>
              <span>Intermedio</span>
              <span>Avanzado</span>
              <span>Experto</span>
            </div>
          </div>

          {isAdmin && (
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  name="featured"
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={onFormChange}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  <i className="fas fa-star"></i>
                  Destacar esta habilidad
                </span>
              </label>
            </div>
          )}

          {previewIcon && (
            <div className={styles.iconPreview}>
              <span className={styles.previewLabel}>Vista previa del icono:</span>
              <img
                src={previewIcon}
                alt={`Icono de ${formData.name}`}
                className={styles.previewIcon}
              />
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={handleClose}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              <i className="fas fa-times"></i>
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={!formData.name.trim() || !formData.category.trim()}
            >
              <i className={editingId ? 'fas fa-save' : 'fas fa-plus'}></i>
              {editingId ? 'Guardar Cambios' : 'Añadir Habilidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SkillModal;
