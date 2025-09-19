import React, { type FC, type ReactNode, useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ModalShell.module.css';
import HeaderLangToggle from './HeaderLangToggle';

// Tipos para manejo de progreso de formularios
interface FormData {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
  technologies?: string;
  order_index: number;
  is_current?: boolean;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface ModalShellProps {
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  /** custom actions node placed in the header (overrides actionButtons if provided) */
  actions?: ReactNode;
  /** custom actions node placed in the header (rendered next to the title) */
  headerActions?: ReactNode;
  /** If true, show a built-in language toggle (ES/EN) in the header. Only shown when `headerActions` is not provided. */
  showHeaderLangToggle?: boolean;
  /** Current language for the built-in header language toggle (when enabled) */
  headerLang?: 'es' | 'en';
  /** Callback invoked when the built-in header language toggle is changed */
  onHeaderLangChange?: (lang: 'es' | 'en') => void;
  /** simple declarative action buttons shown in the header (ignored when `actions` is provided) */
  actionButtons?: Array<{
    key?: string;
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    disabled?: boolean;
    ariaLabel?: string;
    /** if true, this button will trigger form.requestSubmit() instead of calling onClick */
    submit?: boolean;
    /** optional id of a form to submit */
    formId?: string;
  }>;
  /** optional ref to a form inside the modal; used when actionButtons include submit:true */
  formRef?: React.RefObject<HTMLFormElement | null>;
  /** width can be a number (px) or any CSS size string */
  width?: number | string;
  /** height can be a number (px) or any CSS size string */
  height?: number | string;
  /** maxWidth can be a number (px) or any CSS size string */
  maxWidth?: number | string;
  /** maxHeight can be a number (px) or any CSS size string */
  maxHeight?: number | string;
  /** minWidth can be a number (px) or any CSS size string */
  minWidth?: number | string;
  /** Mostrar barra de progreso del formulario */
  showProgress?: boolean;
  /** Datos del formulario para calcular progreso */
  formData?: FormData;
  /** Errores de validación del formulario */
  validationErrors?: ValidationErrors;
  /** Tecnologías seleccionadas (para forms que las requieran) */
  selectedTechnologies?: string[];
}

const ModalShell: FC<ModalShellProps> = ({
  title,
  children,
  onClose,
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  actions,
  actionButtons,
  formRef,
  showProgress = false,
  formData,
  validationErrors = {},
  selectedTechnologies = [],
  headerActions,
  showHeaderLangToggle = false,
  headerLang = 'es',
  onHeaderLangChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [containerReady, setContainerReady] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Calcular progreso del formulario basado en validaciones
  useEffect(() => {
    if (!showProgress || !formData) {
      setFormProgress(0);
      return;
    }

    const stepCompletion: { [key: string]: boolean } = {
      basic: false, // título + empresa
      period: false, // fecha inicio (+ fin o actual)
      technologies: false, // tecnologías añadidas
      description: false, // descripción válida
    };

    // Validar información básica
    const titleValid = (() => {
      const v = (formData.title || '').toString().trim();
      return v.length >= 3 && /[\p{L}]/u.test(v) && !validationErrors.title;
    })();

    const companyValid = (() => {
      const v = (formData.company || '').toString().trim();
      return v.length >= 2 && /[\p{L}]/u.test(v) && !validationErrors.company;
    })();

    stepCompletion.basic = titleValid && companyValid;

    // Validar período
    const startValid = (() => {
      const s = (formData.start_date || '').toString().trim();
      if (!s) return false;

      // Accept DD-MM-YYYY, YYYY-MM, MM-YYYY, or Spanish month names (e.g. "junio 2024" or "junio de 2024")
      const ddmmyyyy = /^([0-3]\d)[-\/]?(0[1-9]|1[0-2])[-\/]?(\d{4})$/;
      const yyyyMm = /^\d{4}-\d{2}$/;
      const mmYyyy = /^(0[1-9]|1[0-2])[\/-]\d{4}$/;
      const spanishMonth =
        /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(\s+de)?\s+\d{4}$/i;

      if (ddmmyyyy.test(s)) {
        const [d, m, y] = s.split(/[-\/]/).map(Number);
        const date = new Date(y, m - 1, d);
        return (
          date.getFullYear() === y &&
          date.getMonth() === m - 1 &&
          date.getDate() === d &&
          !validationErrors.start_date
        );
      }

      if (yyyyMm.test(s) || mmYyyy.test(s) || spanishMonth.test(s)) {
        // month-year formats are considered valid if no explicit validation error
        return !validationErrors.start_date;
      }

      return false;
    })();

    const endValid = (() => {
      if (formData.is_current) return true;
      const e = (formData.end_date || '').toString().trim();
      if (!e) return false;

      const ddmmyyyy = /^([0-3]\d)[-\/]?(0[1-9]|1[0-2])[-\/]?(\d{4})$/;
      const yyyyMm = /^\d{4}-\d{2}$/;
      const mmYyyy = /^(0[1-9]|1[0-2])[\/-]\d{4}$/;
      const spanishMonth =
        /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(\s+de)?\s+\d{4}$/i;

      if (ddmmyyyy.test(e)) {
        const [d, m, y] = e.split(/[-\/]/).map(Number);
        const date = new Date(y, m - 1, d);
        return (
          date.getFullYear() === y &&
          date.getMonth() === m - 1 &&
          date.getDate() === d &&
          !validationErrors.end_date
        );
      }

      if (yyyyMm.test(e) || mmYyyy.test(e) || spanishMonth.test(e)) {
        return !validationErrors.end_date;
      }

      return false;
    })();

    stepCompletion.period = startValid && endValid;

    // Validar tecnologías (requeridas para experiencia)
    stepCompletion.technologies = selectedTechnologies.length > 0;

    // Validar descripción
    const descValid = (() => {
      const desc = (formData.description || '').toString().trim();
      return desc.length >= 20 && desc.length <= 500 && !validationErrors.description;
    })();

    stepCompletion.description = descValid;

    // Calcular porcentaje con pesos
    const weights = {
      basic: 20,
      period: 20,
      technologies: 30,
      description: 30,
    } as const;

    const total = Object.values(weights).reduce((acc, w) => acc + w, 0);
    const achieved = Object.keys(stepCompletion).reduce(
      (acc, key) => acc + (stepCompletion[key] ? weights[key as keyof typeof weights] : 0),
      0
    );

    const percent = total > 0 ? Math.round((achieved / total) * 100) : 0;
    setFormProgress(percent);
  }, [showProgress, formData, validationErrors, selectedTechnologies]);

  useEffect(() => {
    // eslint-disable-next-line no-consoleif (typeof document === 'undefined') return undefined;

    // cleanup any leftover modal shells
    try {
      const leftovers = Array.from(document.querySelectorAll('[data-modal-shell]'));
      leftovers.forEach(n => {
        try {
          if (n && n.parentNode) n.parentNode.removeChild(n);
        } catch (e) {
          /* noop */
        }
      });
    } catch (err) {
      /* noop */
    }

    const el = document.createElement('div');
    const id = `modal-shell-${Date.now()}`;
    el.setAttribute('data-modal-shell', 'true');
    el.setAttribute('data-modal-shell-id', id);
    containerRef.current = el;
    document.body.appendChild(el);
    // ensure body lock (ModalContext also sets this but keep as fallback)
    try {
      document.body.classList.add('modal-open');
    } catch (e) {
      /* noop */
    }
    setContainerReady(true);

    return () => {
      // eslint-disable-next-line no-console
      try {
        document.body.classList.remove('modal-open');
      } catch (e) {
        /* noop */
      }
      try {
        if (containerRef.current && containerRef.current.parentNode) {
          containerRef.current.parentNode.removeChild(containerRef.current);
        }
      } catch (e) {
        /* noop */
      }
      containerRef.current = null;
    };
  }, [title]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        try {
          if (typeof onClose === 'function') onClose();
        } catch (err) {
          /* noop */
        }
        try {
          document.body.classList.remove('modal-open');
        } catch (err) {
          /* noop */
        }
      }
    },
    [onClose]
  );

  // close on Escape
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        try {
          if (typeof onClose === 'function') onClose();
        } catch (err) {
          /* noop */
        }
        try {
          document.body.classList.remove('modal-open');
        } catch (err) {
          /* noop */
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // focus the modal container for accessibility
  useEffect(() => {
    try {
      modalRef.current?.focus();
    } catch (e) {
      /* noop */
    }
  }, [containerReady]);

  if (!containerReady || !containerRef.current) return null;

  const toCss = (v?: number | string) => {
    if (v === undefined || v === null) return undefined;
    return typeof v === 'number' ? `${v}px` : v;
  };

  const containerStyle: React.CSSProperties = {
    // keep a sensible minimum unless overridden
    minWidth: toCss(minWidth) ?? '360px',
    // provide a slightly larger default max width so modals feel roomier
    maxWidth: toCss(maxWidth) ?? '720px',
    ...(width ? { width: toCss(width) } : {}),
    ...(height ? { height: toCss(height) } : {}),
    ...(maxHeight ? { maxHeight: toCss(maxHeight) } : {}),
  };

  return createPortal(
    <div
      ref={modalRef}
      className={styles.modalOverlay}
      data-modal="true"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabIndex={-1}
    >
      <div className={styles.modalContainer} role="document" tabIndex={-1} style={containerStyle}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTop}>
            <h3 id="modal-title" className={styles.modalTitle}>
              {title ?? 'Modal'}
            </h3>
            {headerActions ? (
              <div className={styles.modalHeaderToolbar}>{headerActions}</div>
            ) : showHeaderLangToggle ? (
              <div className={styles.modalHeaderToolbar}>
                <HeaderLangToggle lang={headerLang} onChange={onHeaderLangChange} />
              </div>
            ) : null}
            <button
              aria-label="Cerrar"
              className={styles.closeButton}
              onClick={() => {
                try {
                  if (typeof onClose === 'function') onClose();
                } catch (err) {
                  /* noop */
                }
                try {
                  document.body.classList.remove('modal-open');
                } catch (err) {
                  /* noop */
                }
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Barra de progreso del formulario */}
        {showProgress && (
          <div className={styles.progressIndicator}>
            <div className={styles.progressBar} role="progressbar">
              <div className={styles.progressFill} style={{ width: `${formProgress}%` }}></div>
            </div>
            <div>
              <span className={styles.progressText}>
                {formProgress === 100 ? 'Formulario completo' : `Completado: ${formProgress}%`}
              </span>
            </div>
          </div>
        )}

        <div className={styles.modalContent}>{children}</div>

        {(actions || (actionButtons && actionButtons.length > 0)) && (
          <div className={styles.modalFooter}>
            {actions
              ? actions
              : actionButtons?.map(b => (
                  <button
                    key={b.key ?? b.label}
                    type="button"
                    className={styles.actionButton}
                    data-variant={b.variant ?? 'secondary'}
                    onClick={() => {
                      try {
                        if (b.submit) {
                          // try formRef first
                          try {
                            if (
                              formRef &&
                              'current' in formRef &&
                              formRef.current &&
                              typeof (formRef.current as HTMLFormElement).requestSubmit ===
                                'function'
                            ) {
                              (formRef.current as HTMLFormElement).requestSubmit();
                              return;
                            }
                            // Fallback: intentar usar submit() si requestSubmit no existe
                            if (
                              formRef &&
                              'current' in formRef &&
                              formRef.current &&
                              typeof (formRef.current as HTMLFormElement).submit === 'function'
                            ) {
                              (formRef.current as HTMLFormElement).submit();
                              return;
                            }
                          } catch (err) {
                            /* noop */
                          }

                          // try formId
                          if (b.formId) {
                            try {
                              const f = document.getElementById(b.formId) as HTMLFormElement | null;
                              if (f && typeof f.requestSubmit === 'function') {
                                f.requestSubmit();
                                return;
                              }
                              // Fallback to submit()
                              if (f && typeof f.submit === 'function') {
                                f.submit();
                                return;
                              }
                            } catch (err) {
                              /* noop */
                            }
                          }

                          // fallback: find a form inside the modal container
                          try {
                            const maybeForm = containerRef.current?.querySelector(
                              'form'
                            ) as HTMLFormElement | null;
                            if (maybeForm && typeof maybeForm.requestSubmit === 'function') {
                              maybeForm.requestSubmit();
                              return;
                            }
                            // Fallback: call submit() if requestSubmit not available
                            if (maybeForm && typeof maybeForm.submit === 'function') {
                              maybeForm.submit();
                              return;
                            }
                          } catch (err) {
                            /* noop */
                          }
                        }

                        if (typeof b.onClick === 'function') b.onClick();
                      } catch (err) {
                        /* noop */
                      }
                    }}
                    disabled={b.disabled}
                    aria-label={b.ariaLabel ?? b.label}
                  >
                    {b.label}
                  </button>
                ))}
          </div>
        )}
      </div>
    </div>,
    containerRef.current
  );
};

export default ModalShell;
