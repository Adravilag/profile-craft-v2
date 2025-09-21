// components/ui/Toast.tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './Toast.css';

interface ToastProps {
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
}

interface ToastExtras {
  title?: string;
  description?: string;
  autoDismiss?: boolean; // whether it should auto-dismiss
  duration?: number; // ms
  actionLabel?: string; // label for primary action
  onAction?: () => void; // handler for action button
  closeOnAction?: boolean; // whether toast should close after action (default true)
  showActionLabel?: boolean; // whether to display the action label text (default false)
  persistent?: boolean; // force persistent
}

export function AccessibleToast({
  message,
  type,
  onDismiss,
  title,
  description,
  autoDismiss,
  duration,
  actionLabel,
  onAction,
  closeOnAction,
  showActionLabel,
  persistent,
}: ToastProps & ToastExtras) {
  const toastRef = useRef<HTMLDivElement>(null);
  const [isEntering, setIsEntering] = useState(true);
  const [enterActive, setEnterActive] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);

  // Defaults: success auto-dismiss after 4000ms, error persistent by default
  const shouldAutoDismiss =
    typeof autoDismiss === 'boolean' ? autoDismiss : type !== 'error' && !persistent;
  const dismissDuration = duration ?? (type === 'success' ? 4000 : 5000);

  // animate on mount: add active class on next frame to trigger transition
  useEffect(() => {
    // small delay to allow initial class to apply
    const id = window.setTimeout(() => setEnterActive(true), 10);
    return () => clearTimeout(id);
  }, []);

  // after enter animation completes, clean enter flags
  useEffect(() => {
    if (!enterActive) return;
    const t = window.setTimeout(() => {
      setIsEntering(false);
      setEnterActive(false);
    }, 260);
    return () => clearTimeout(t);
  }, [enterActive]);

  // Auto-dismiss should trigger the exit animation, not call onDismiss directly
  useEffect(() => {
    if (!shouldAutoDismiss) return;
    // start timer that initiates exit animation
    autoTimerRef.current = window.setTimeout(() => {
      initiateClose();
    }, dismissDuration) as unknown as number;

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [shouldAutoDismiss, dismissDuration]);

  const getAriaLive = () => {
    return type === 'error' ? 'assertive' : 'polite';
  };

  // focus management: focus the toast if it's an assertive/error so screen readers announce immediately
  useEffect(() => {
    if (type === 'error' && toastRef.current) {
      // focus without scrolling
      toastRef.current.focus({ preventScroll: true } as FocusOptions);
    }
  }, [type]);

  const callOnDismiss = useCallback(() => {
    try {
      onDismiss();
    } catch (err) {
      // swallow to avoid unhandled exceptions during unmount animation
      // developer can handle errors inside onDismiss
      // console.error(err);
    }
  }, [onDismiss]);

  // initiate exit animation and call onDismiss after animation ends
  const initiateClose = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    const el = toastRef.current;
    if (!el) {
      callOnDismiss();
      return;
    }

    // ensure enter active is removed to avoid conflicting classes
    setEnterActive(false);

    // add animate-out class by setting isExiting (CSS supports .toast.animate-out)
    // Listen for transitionend to call onDismiss, but provide a robust timeout fallback.
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== el) return;
      el.removeEventListener('transitionend', onTransitionEnd as any);
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current as any);
        exitTimerRef.current = null;
      }
      // small delay to ensure styles settled
      callOnDismiss();
    };

    el.addEventListener('transitionend', onTransitionEnd as any);

    // Fallback: if transitionend doesn't fire (storybook, blocked events), call onDismiss after 300ms
    exitTimerRef.current = window.setTimeout(() => {
      el.removeEventListener('transitionend', onTransitionEnd as any);
      exitTimerRef.current = null;
      callOnDismiss();
    }, 320) as unknown as number;
  }, [callOnDismiss, isExiting]);

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current as any);
        exitTimerRef.current = null;
      }
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current as any);
        autoTimerRef.current = null;
      }
    };
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon aria-hidden="true" />;
      case 'error':
        return <XCircleIcon aria-hidden="true" />;
      case 'warning':
        return <ExclamationTriangleIcon aria-hidden="true" />;
      default:
        return <InformationCircleIcon aria-hidden="true" />;
    }
  };
  return (
    <div
      ref={toastRef}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={getAriaLive()}
      aria-atomic="true"
      tabIndex={-1}
      className={`toast toast-${type} ${isEntering ? 'toast-enter' : ''} ${enterActive ? 'toast-enter-active' : ''} ${isExiting ? 'toast-exit toast-exit-active' : ''} flex items-center gap-3 p-4 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
    >
      <span aria-hidden="true" className="toast-icon">
        {getIcon()}
      </span>

      <div className="flex-1 toast-content">
        {title ? <div className="toast-title">{title}</div> : null}
        <div className="toast-description">{description ?? message}</div>
      </div>

      {onAction ? (
        <button
          type="button"
          onClick={async () => {
            // If onAction returns a promise, show loading state until it resolves
            try {
              const maybePromise: any = onAction();
              if (maybePromise != null && typeof maybePromise.then === 'function') {
                // show loading
                if (toastRef.current) toastRef.current.setAttribute('aria-busy', 'true');
                toastRef.current?.classList.add('is-loading');
                try {
                  await maybePromise;
                } finally {
                  if (toastRef.current) toastRef.current.removeAttribute('aria-busy');
                  toastRef.current?.classList.remove('is-loading');
                }
              }
            } catch (err) {
              // swallow — caller handles error state if needed
            } finally {
              // close after action completes only if allowed (default true)
              if (typeof closeOnAction === 'undefined' || closeOnAction) {
                initiateClose();
              }
            }
          }}
          className="toast-action"
          aria-label={actionLabel ?? (type === 'error' ? 'Reintentar' : 'Acción')}
        >
          <span className="toast-action-icon" aria-hidden="true">
            <ArrowPathIcon />
          </span>
          {/** visible label only when explicitly requested */}
          {/** showActionLabel defaults to false to prefer icon-only UI */}
          {typeof showActionLabel !== 'undefined' && showActionLabel ? (
            <span className="toast-action-label">
              {actionLabel ?? (type === 'error' ? 'Reintentar' : 'Acción')}
            </span>
          ) : null}
        </button>
      ) : null}

      <button
        type="button"
        onClick={initiateClose}
        className="toast-close"
        aria-label={`Cerrar notificación: ${title ?? description ?? message}`}
      >
        ×
      </button>
    </div>
  );
}
