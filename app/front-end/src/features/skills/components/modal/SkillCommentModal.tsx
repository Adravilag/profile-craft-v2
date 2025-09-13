import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './SkillCommentModal.module.css';
import TextEditor from '@/components/common/TextEditor/TextEditor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  skillId: number | string;
  initialComment?: { en?: string; es?: string } | null;
  onSave: (comment: { en?: string; es?: string } | null) => Promise<void> | void;
  maxWidth?: string | number;
}

const SkillCommentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  skillId,
  initialComment,
  onSave,
  maxWidth,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [commentEn, setCommentEn] = useState(initialComment?.en || '');
  const [commentEs, setCommentEs] = useState(initialComment?.es || '');
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<'es' | 'en'>('es');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCommentEn(initialComment?.en || '');
      setCommentEs(initialComment?.es || '');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialComment]);

  if (!isOpen) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 220);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        en: commentEn?.trim() || undefined,
        es: commentEs?.trim() || undefined,
      };
      // Normalize empty -> null
      const normalized = payload.en || payload.es ? payload : null;
      await onSave(normalized);
      handleClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error saving comment', err);
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div
      className={`${styles.overlay} ${isClosing ? styles.closing : ''}`}
      onClick={handleBackdrop}
      role="presentation"
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.closing : ''}`}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || '720px' }}
      >
        <header className={styles.header}>
          <h3>Comentario de la habilidad</h3>
          <button aria-label="Cerrar" className={styles.closeBtn} onClick={handleClose}>
            <i className="fas fa-times" />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.langTabs}>
            <button
              className={activeLang === 'es' ? styles.activeTab : ''}
              onClick={() => setActiveLang('es')}
              type="button"
            >
              Español
            </button>
            <button
              className={activeLang === 'en' ? styles.activeTab : ''}
              onClick={() => setActiveLang('en')}
              type="button"
            >
              English
            </button>
          </div>

          <div className={styles.editorWrap}>
            {activeLang === 'es' ? (
              <TextEditor
                content={commentEs}
                onChange={c => setCommentEs(c)}
                placeholder="Comentario en español..."
              />
            ) : (
              <TextEditor
                content={commentEn}
                onChange={c => setCommentEn(c)}
                placeholder="Comment in English..."
              />
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancel}`}
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar comentario'}
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default SkillCommentModal;
