import React, { useEffect, useRef } from 'react';
import styles from './CommentTooltip.module.css';

type CommentValue = string | Record<string, unknown> | null | undefined;

interface CommentTooltipProps {
  comment?: CommentValue;
  loading?: boolean;
  error?: string | null;
  visible?: boolean;
  title?: string;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
  /** If true, will render comment as HTML using dangerouslySetInnerHTML (ensure server sanitizes) */
  allowHtml?: boolean;
  /** Optional locale to pick localized content from comment objects (e.g. { en: '...', es: '...' }) */
  locale?: string;
  /** Optional loader to fetch comment when tooltip opens. If provided, may accept an AbortSignal: `(signal?) => Promise<CommentValue>` */
  loadComment?: (signal?: AbortSignal) => Promise<CommentValue>;
}

export const CommentTooltip: React.FC<CommentTooltipProps> = ({
  comment,
  loading = false,
  error = null,
  visible = false,
  title = 'Comment',
  onRetry,
  onClose,
  className = '',
  allowHtml = false,
  locale,
  loadComment,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // id único para coordinar instancias abiertas
  const instanceIdRef = React.useRef<string>(Math.random().toString(36).slice(2, 9));
  const [internalLoading, setInternalLoading] = React.useState(false);
  const [internalError, setInternalError] = React.useState<string | null>(null);
  const [internalComment, setInternalComment] = React.useState<CommentValue | undefined>(undefined);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose && onClose();
      }
    }

    if (visible) {
      window.addEventListener('keydown', handleKey);
    }

    return () => window.removeEventListener('keydown', handleKey);
  }, [visible, onClose]);

  // Coordinar apertura entre instancias: cuando esta instancia se hace visible, emitir evento
  // y escuchar eventos para cerrarse si otra instancia se abre.
  useEffect(() => {
    const onOtherOpen = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail as { id?: string } | undefined;
        const otherId = detail?.id;
        if (!otherId) return;
        if (otherId !== instanceIdRef.current) {
          // otra instancia se abrió: cerrar esta
          onClose && onClose();
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('comment-tooltip-open', onOtherOpen as EventListener);

    if (visible) {
      // emitir que esta instancia se abrió
      const ev = new CustomEvent('comment-tooltip-open', { detail: { id: instanceIdRef.current } });
      window.dispatchEvent(ev);
    }

    return () => {
      window.removeEventListener('comment-tooltip-open', onOtherOpen as EventListener);
    };
  }, [visible, onClose]);

  // Load comment lazily if loadComment is provided. Support AbortSignal cancellation.
  useEffect(() => {
    let mounted = true;
    let controller: AbortController | null = null;
    if (visible && loadComment) {
      controller = new AbortController();
      const { signal } = controller;
      setInternalLoading(true);
      setInternalError(null);
      setInternalComment(undefined);
      // Call loader with signal if it accepts it
      Promise.resolve()
        .then(() => loadComment(signal))
        .then(res => {
          if (!mounted) return;
          setInternalComment(res as CommentValue);
          setInternalLoading(false);
        })
        .catch(err => {
          if (!mounted) return;
          if ((err as any)?.name === 'AbortError' || (err as any)?.message === 'aborted') {
            // aborted: don't treat as error
            setInternalLoading(false);
            return;
          }
          setInternalError(err?.message || String(err) || 'Failed to load comment');
          setInternalLoading(false);
        });
    }
    return () => {
      mounted = false;
      if (controller) controller.abort();
    };
  }, [visible, loadComment]);

  const renderContent = () => {
    const effectiveLoading = loadComment ? internalLoading : loading;
    const effectiveError = loadComment ? internalError : error;
    const effectiveComment = loadComment ? (internalComment ?? comment) : comment;

    // Helper: given a comment value that may be a map of locales, pick best-match string
    const pickLocalized = (val: CommentValue): string | CommentValue => {
      if (!val || typeof val === 'string') return val;
      if (typeof val === 'object') {
        // treat as possible locale map: keys like 'en', 'es', 'en-US'
        try {
          const obj = val as Record<string, any>;
          const providedLocale = (
            locale ||
            (typeof navigator !== 'undefined' && navigator.language) ||
            'en'
          ).toLowerCase();
          // exact match
          if (obj[providedLocale]) return obj[providedLocale];
          // language-only match (en from en-US)
          const langOnly = providedLocale.split('-')[0];
          if (obj[langOnly]) return obj[langOnly];
          // fallback to 'en'
          if (obj['en']) return obj['en'];
          // otherwise, return first string-like value
          for (const k of Object.keys(obj)) {
            if (typeof obj[k] === 'string') return obj[k];
          }
          // no string found: return original object
          return val;
        } catch (e) {
          return val;
        }
      }
      return val;
    };

    if (effectiveLoading) {
      return (
        <div className={styles.spinner} role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeOpacity="0.15"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    }

    if (effectiveError) {
      const retryHandler = loadComment
        ? () => {
            setInternalError(null);
            setInternalLoading(true);
            const controller = new AbortController();
            Promise.resolve()
              .then(() => loadComment(controller.signal))
              .then(r => {
                setInternalComment(r as CommentValue);
                setInternalLoading(false);
              })
              .catch(err => {
                if ((err as any)?.name === 'AbortError') return;
                setInternalError(err?.message || String(err) || 'Failed to load comment');
                setInternalLoading(false);
              });
          }
        : onRetry;

      return (
        <div className={styles.error} role="alert">
          <div>{effectiveError}</div>
          {retryHandler && (
            <button
              className={styles.retryBtn}
              onClick={retryHandler}
              aria-label="Retry loading comment"
            >
              Retry
            </button>
          )}
        </div>
      );
    }
    if (
      effectiveComment === null ||
      effectiveComment === undefined ||
      (typeof effectiveComment === 'string' && String(effectiveComment).trim() === '')
    ) {
      return <div className={styles.muted}>No comment available</div>;
    }

    const localized = pickLocalized(effectiveComment);

    if (typeof localized === 'string') {
      if (allowHtml) {
        return <div className={styles.content} dangerouslySetInnerHTML={{ __html: localized }} />;
      }
      return <div className={styles.content}>{localized}</div>;
    }

    try {
      return <pre className={styles.content}>{JSON.stringify(effectiveComment, null, 2)}</pre>;
    } catch (e) {
      return <div className={styles.muted}>Unable to render comment</div>;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${visible ? styles.visible : ''} ${className}`.trim()}
      role="dialog"
      aria-label={title}
      aria-hidden={!visible}
    >
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div>
          <button
            type="button"
            aria-label="Close comment"
            className={styles.retryBtn}
            onClick={() => onClose && onClose()}
          >
            ✕
          </button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default CommentTooltip;
