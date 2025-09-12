import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './TestimonialModal.module.css';

// Inicializar contador global en entornos de test/SSR
if (
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as any).__testimonialModalCounter !== 'number'
) {
  (globalThis as any).__testimonialModalCounter = 0;
}

// Modal manager: stack to track open modals and a single global key handler
if (typeof globalThis !== 'undefined' && !(globalThis as any).__testimonialModalStack) {
  (globalThis as any).__testimonialModalStack = [];
}
if (typeof globalThis !== 'undefined' && !(globalThis as any).__testimonialModalKeyHandler) {
  (globalThis as any).__testimonialModalKeyHandler = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    const stack = (globalThis as any).__testimonialModalStack as Array<{
      id: string;
      onClose: () => void;
    }>;
    const top = stack[stack.length - 1];
    if (top && typeof top.onClose === 'function') top.onClose();
  };
}

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  disableAutoFocus?: boolean;
}

const TestimonialModal: React.FC<TestimonialModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  // Auto-focus should be enabled by default so forms inside the modal receive focus
  // unless explicitly disabled by the caller.
  disableAutoFocus = false,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceIdRef = useRef<string | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      try {
        // Sólo cerrar si este modal es el top de la pila
        const stack = (globalThis as any).__testimonialModalStack as Array<{
          id: string;
          onClose: () => void;
        }>;
        const top = Array.isArray(stack) && stack.length ? stack[stack.length - 1] : null;
        const isTop = top && instanceIdRef.current && top.id === instanceIdRef.current;

        // NOTE: Escape is handled by the global key handler registered once per page
        // to avoid duplicate close calls when multiple modal instances exist.

        // No interferir con la edición/navegación cuando un input/textarea o
        // elemento contenteditable está activo.
        try {
          const active = document.activeElement as HTMLElement | null;
          const tag = active?.tagName?.toLowerCase();
          const isEditable = !!(
            active &&
            (tag === 'input' || tag === 'textarea' || active.isContentEditable)
          );
          if (isEditable) return;
        } catch (err) {
          // noop
        }

        if (!modalRef.current?.contains(e.target as Node)) {
          if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
            e.preventDefault();
          }
        }
      } catch (err) {
        // noop
      }
    },
    [onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) {
      if (previousActiveElement.current && 'focus' in previousActiveElement.current) {
        try {
          previousActiveElement.current.focus({ preventScroll: true } as any);
        } catch (err) {
          previousActiveElement.current.focus();
        }
      }
      return;
    }

    previousActiveElement.current = document.activeElement as HTMLElement | null;

    // Añadir clase al body para controlar overflow vía CSS.
    document.body.classList.add('modal-open');

    // Registrar este modal en la pila global para gestión de cierre por Escape
    const myId =
      instanceIdRef.current || `testimonial-temp-${Math.random().toString(36).slice(2, 8)}`;
    instanceIdRef.current = myId;
    (globalThis as any).__testimonialModalStack = (globalThis as any).__testimonialModalStack || [];
    (globalThis as any).__testimonialModalStack.push({ id: myId, onClose });

    // Registrar handler global de Escape una sola vez (si aún no está registrado)
    try {
      if (!(globalThis as any).__testimonialModalKeyHandlerRegistered) {
        document.addEventListener('keydown', (globalThis as any).__testimonialModalKeyHandler);
        (globalThis as any).__testimonialModalKeyHandlerRegistered = true;
      }
    } catch (err) {
      // noop
    }

    // Registrar keydown local y global en pila
    document.addEventListener('keydown', handleKeyDown as any);

    let focusTimer: number | undefined;
    if (!disableAutoFocus && modalRef.current) {
      focusTimer = window.setTimeout(() => {
        // Buscar focusables en orden de prioridad para evitar que botones en el header
        // (como el botón de cerrar) reciban foco antes que inputs/textarea/select.
        const find = (sel: string) => modalRef.current?.querySelector<HTMLElement>(sel);
        const firstFocusable =
          find('input:not([type="hidden"]):not([tabindex="-1"])') ||
          find('textarea:not([tabindex="-1"])') ||
          find('select:not([tabindex="-1"])') ||
          find('a[href]') ||
          find('button:not([tabindex="-1"])') ||
          find('[tabindex]:not([tabindex="-1"])');

        try {
          if (firstFocusable) {
            // Evitar que el navegador haga scroll al enfocar (si es compatible)
            // y hacer fallback si la opción no está soportada.
            try {
              (firstFocusable as HTMLElement).focus({ preventScroll: true } as any);
            } catch (err) {
              firstFocusable.focus();
            }
          } else {
            try {
              modalRef.current?.focus({ preventScroll: true } as any);
            } catch (err) {
              modalRef.current?.focus();
            }
          }
        } catch (err) {
          // noop
        }
      }, 50);
    }

    return () => {
      if (typeof focusTimer !== 'undefined') clearTimeout(focusTimer);

      // Removemos listeners per-instance
      try {
        document.removeEventListener('keydown', handleKeyDown as any);
      } catch (err) {
        // noop
      }

      // Removemos de la pila global este modal.
      try {
        const stack = (globalThis as any).__testimonialModalStack as Array<{
          id: string;
          onClose: () => void;
        }>;
        const idx = stack.findIndex(s => s.id === instanceIdRef.current);
        if (idx >= 0) stack.splice(idx, 1);
      } catch (err) {
        // noop
      }
      // Quitar clase del body para restaurar scroll
      try {
        document.body.classList.remove('modal-open');
      } catch (err) {
        /* noop */
      }

      try {
        if (containerRef.current && containerRef.current.parentNode) {
          containerRef.current.parentNode.removeChild(containerRef.current);
        } else if (instanceIdRef.current) {
          const maybe = document.querySelector(
            `[data-testimonial-modal-id="${instanceIdRef.current}"]`
          );
          if (maybe && maybe.parentNode) maybe.parentNode.removeChild(maybe);
        }
      } catch (err) {
        // noop
      }

      // Si la pila quedó vacía, quitamos el listener global
      try {
        const stack = (globalThis as any).__testimonialModalStack as Array<any>;
        if (
          Array.isArray(stack) &&
          stack.length === 0 &&
          (globalThis as any).__testimonialModalKeyHandlerRegistered
        ) {
          document.removeEventListener('keydown', (globalThis as any).__testimonialModalKeyHandler);
          (globalThis as any).__testimonialModalKeyHandlerRegistered = false;
        }
      } catch (err) {
        // noop
      }

      if (previousActiveElement.current && 'focus' in previousActiveElement.current) {
        try {
          previousActiveElement.current.focus({ preventScroll: true } as any);
        } catch (err) {
          previousActiveElement.current.focus();
        }
      }
    };
  }, [isOpen, disableAutoFocus, handleKeyDown]);

  if (!isOpen) return null;

  if (typeof document !== 'undefined' && !containerRef.current) {
    // limpiar contenedores residuales (más agresivo): remover cualquier contenedor
    // previo que tenga nuestro atributo para evitar duplicados en tests.
    try {
      const leftovers = Array.from(document.querySelectorAll('[data-testimonial-modal]'));
      leftovers.forEach(n => {
        try {
          if (n && n.parentNode) n.parentNode.removeChild(n);
        } catch (e) {
          // noop
        }
      });
    } catch (err) {
      /* noop */
    }

    const el = document.createElement('div');
    const count = ++(globalThis as any).__testimonialModalCounter;
    const id = `testimonial-modal-${count}`;
    el.setAttribute('data-testimonial-modal', 'true');
    el.setAttribute('data-testimonial-modal-id', id);
    containerRef.current = el;
    instanceIdRef.current = id;
    document.body.appendChild(el);
  }

  return createPortal(
    <div
      ref={modalRef}
      className={styles.modalOverlay}
      data-testimonial-modal
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabIndex={-1}
    >
      <div className={styles.modalContainer} role="document" tabIndex={-1}>
        {title && (
          <div className={styles.modalHeader}>
            <h2 id="modal-title" className={styles.modalTitle}>
              {title}
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar modal"
              type="button"
            >
              &times;
            </button>
          </div>
        )}
        <div className={styles.modalContent}>{children}</div>
      </div>
    </div>,
    containerRef.current as Element
  );
};

export default TestimonialModal;
