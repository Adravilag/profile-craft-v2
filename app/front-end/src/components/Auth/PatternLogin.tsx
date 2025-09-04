import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import profileHero from '@assets/img/profilehero-background.png';
import ModalShell from '@/components/ui/Modal/ModalShell';
import styles from './PatternLogin.module.css';
import { useAuth } from '@/contexts';

// Inline subtle pattern trigger: al click se agranda el avatar y entra en modo escucha
// Captura entradas implícitas (clicks o teclas numéricas). No muestra keypad.
export function PatternLogin({
  src,
  alt,
  className,
  requiredCode,
  allowBackspace = true,
  timeoutMs = 3000,
  devSound = false,
  onClick,
}: {
  src?: string;
  alt?: string;
  className?: string;
  requiredCode?: string; // si se pasa, requiere exactamente este código
  allowBackspace?: boolean;
  timeoutMs?: number;
  devSound?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const [active, setActive] = useState(false);
  // store the entered digits as a string
  const [codeEntered, setCodeEntered] = useState('');
  const [showModal, setShowModal] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!active) return;

    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        // append digit (limit to requiredCode length if provided, else 4)
        const maxLen = requiredCode ? requiredCode.length : 4;
        setCodeEntered(s => {
          if (s.length >= maxLen) return s;
          const next = s + key;
          if (devSound) playBeep();
          return next;
        });
      } else if (allowBackspace && key === 'Backspace') {
        setCodeEntered(s => s.slice(0, -1));
        if (devSound) playBeep(120, 0.02);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  // react to codeEntered changes: handle completion, timeout reset
  useEffect(() => {
    // clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!active) return;

    const maxLen = requiredCode ? requiredCode.length : 4;

    // if reached required length, check
    if (codeEntered.length >= maxLen) {
      if (requiredCode) {
        if (codeEntered === requiredCode) {
          if (devSound) playBeep(400, 0.08);
          const t = window.setTimeout(() => {
            setActive(false);
            setCodeEntered('');
            setShowModal(true);
          }, 220);
          return () => window.clearTimeout(t);
        } else {
          // mismatch: silently reset input after a short delay (no modal)
          setTimeout(() => {
            setCodeEntered('');
          }, 420);
          return;
        }
      }
    }

    // restart timeout to auto-cancel
    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
      setCodeEntered('');
    }, timeoutMs);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [codeEntered, active, requiredCode, timeoutMs, devSound]);

  // cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {
          /* ignore */
        }
      }
    };
  }, []);

  // close modal on Escape
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  // close modal automatically when auth state becomes true
  const { isAuthenticated, login } = useAuth();
  useEffect(() => {
    if (isAuthenticated && showModal) setShowModal(false);
  }, [isAuthenticated, showModal]);

  // Basic focus trap: keep focus inside modal while open
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const container = document.getElementById('pattern-login-content') as HTMLElement | null;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!document.activeElement) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showModal]);

  // --- react-hook-form + zod validation ---
  const loginSchema = z.object({
    email: z.string().min(1, 'El correo es obligatorio').email('Correo no válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (!showModal) {
      reset();
      setGlobalError(null);
    } else {
      // focus the email input when modal mounts
      const t = window.setTimeout(() => {
        const el = document.getElementById('pl-email') as HTMLInputElement | null;
        el?.focus();
      }, 60);
      return () => window.clearTimeout(t);
    }
  }, [showModal, reset]);

  const onSubmit = async (values: LoginForm) => {
    setGlobalError(null);
    try {
      await login({ email: values.email, password: values.password });
    } catch (err: any) {
      const msg = err?.message?.replace(/\"/g, '') || 'Login failed';
      // attach to form field for a11y and show a global error
      setError('password' as any, { type: 'server', message: '' });
      setGlobalError(msg);
    }
  };

  function playBeep(frequency = 880, duration = 0.04) {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = frequency;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
      }, duration * 1000);
    } catch (e) {
      // ignore audio errors
    }
  }

  // Activation will happen on hover/focus; clicks won't be used to count inputs

  // Quitar foco de cualquier elemento cuando activamos el modo patrón.
  // Esto evita que una entrada previa (p. ej. terminal embebida o input) reciba las teclas.
  function blurActive() {
    try {
      const el = document.activeElement as HTMLElement | null;
      if (el && typeof el.blur === 'function') {
        el.blur();
      }
    } catch (e) {
      /* ignore */
    }
  }

  // Devuelve el trazo para cada arco: gradiente cuando está completado, color tenue si no
  const strokeFor = (index: number) =>
    codeEntered.length >= index ? 'url(#g1)' : 'rgba(255,255,255,0.12)';

  // totalSlots is available if needed for UI; currently not used directly

  return (
    <>
      <button
        type="button"
        aria-label="avatar (hover to enter numeric code)"
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          display: 'block',
          width: '100%',
          height: '100%',
        }}
        onClick={e => {
          try {
            onClick && onClick(e);
          } catch (err) {
            /* ignore */
          }
        }}
        onMouseEnter={() => {
          blurActive();
          setActive(true);
          setCodeEntered('');
        }}
        onMouseLeave={() => {
          setActive(false);
          setCodeEntered('');
        }}
        onFocus={() => {
          blurActive();
          setActive(true);
          setCodeEntered('');
        }}
        onBlur={() => {
          setActive(false);
          setCodeEntered('');
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 160ms',
            transform: active ? 'scale(1.06)' : 'scale(1)',
          }}
        >
          <img
            src={src ?? profileHero}
            alt={alt ?? 'avatar'}
            className={className}
            style={{ display: 'block', objectFit: 'cover', width: '100%', height: '100%' }}
          />
          <svg
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            {/* radius 42 para compensar strokeWidth y encajar sobre la imagen circular */}
            <path
              d="M50 8 A42 42 0 0 1 92 50"
              stroke={strokeFor(1)}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={codeEntered.length >= 1 ? '100 100' : '0 100'}
              style={{
                transition:
                  'stroke 220ms ease, stroke-dasharray 320ms ease, stroke-width 180ms ease',
              }}
            />
            <path
              d="M92 50 A42 42 0 0 1 50 92"
              stroke={strokeFor(2)}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={codeEntered.length >= 2 ? '100 100' : '0 100'}
              style={{
                transition:
                  'stroke 220ms ease, stroke-dasharray 320ms ease, stroke-width 180ms ease',
              }}
            />
            <path
              d="M50 92 A42 42 0 0 1 8 50"
              stroke={strokeFor(3)}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={codeEntered.length >= 3 ? '100 100' : '0 100'}
              style={{
                transition:
                  'stroke 220ms ease, stroke-dasharray 320ms ease, stroke-width 180ms ease',
              }}
            />
            <path
              d="M8 50 A42 42 0 0 1 50 8"
              stroke={strokeFor(4)}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={codeEntered.length >= 4 ? '100 100' : '0 100'}
              style={{
                transition:
                  'stroke 220ms ease, stroke-dasharray 320ms ease, stroke-width 180ms ease',
              }}
            />
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7b61ff" />
                <stop offset="100%" stopColor="#00d4ff" />
              </linearGradient>

              {/* Glow filter for a soft outer glow */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Apply glow by referencing filter on the SVG element (stroke uses gradient but glow will apply to entire group) */}
            <g filter="url(#glow)" />
          </svg>
        </div>
      </button>
      {showModal && (
        <ModalShell title="Iniciar sesión" onClose={() => setShowModal(false)} maxWidth={400}>
          <div
            id="pattern-login-content"
            className={styles.inner}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className={styles.content}>
              <form onSubmit={rhfHandleSubmit(onSubmit)} className={styles.loginForm} noValidate>
                <label className={styles.label} htmlFor="pl-email">
                  Correo
                </label>
                <div className={styles.inputWrap}>
                  <svg
                    className={styles.icon}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5v-11"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 6.5l-9 6-9-6"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    id="pl-email"
                    className={styles.input}
                    type="email"
                    {...register('email')}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <div role="alert" className={styles.fieldError}>
                    {errors.email.message}
                  </div>
                )}

                <label className={styles.label} htmlFor="pl-password">
                  Contraseña
                </label>
                <div className={styles.inputWrap}>
                  <svg
                    className={styles.icon}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M7 11V8a5 5 0 0 1 10 0v3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    id="pl-password"
                    className={styles.input}
                    type="password"
                    {...register('password')}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                  />
                </div>
                {errors.password && (
                  <div role="alert" className={styles.fieldError}>
                    {errors.password.message}
                  </div>
                )}

                {globalError && (
                  <div role="alert" className={styles.error}>
                    {globalError}
                  </div>
                )}

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.primary}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className={styles.spinner} aria-hidden>
                        <svg width="18" height="18" viewBox="0 0 50 50">
                          <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="rgba(255,255,255,0.18)"
                            strokeWidth="5"
                          ></circle>
                          <path
                            d="M45 25a20 20 0 0 0-20-20"
                            stroke="white"
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="none"
                          ></path>
                        </svg>
                      </span>
                    ) : null}
                    <span className={styles.primaryLabel}>
                      {isSubmitting ? 'Accediendo...' : 'Iniciar sesión'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}

export default PatternLogin;
