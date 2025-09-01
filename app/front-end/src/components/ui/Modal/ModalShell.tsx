import React, { type FC, type ReactNode, useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ModalShell.module.css';

interface ModalShellProps {
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  /** custom actions node placed in the header (overrides actionButtons if provided) */
  actions?: ReactNode;
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
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[ModalShell] mount', { title });

    if (typeof document === 'undefined') return undefined;

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
      console.debug('[ModalShell] unmount', { title });
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
          <h3 id="modal-title" className={styles.modalTitle}>
            {title ?? 'Modal'}
          </h3>
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
