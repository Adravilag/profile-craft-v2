// src/components/ui/LoadingSpinner/LoadingSpinner.tsx
import type { CSSProperties, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './LoadingSpinner.module.css';

type SpinnerVariant = 'default' | 'pulse' | 'gradient' | 'dots';
type SpinnerSize = 'small' | 'medium' | 'large' | 'xlarge' | number | string;

type Props = {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  fullScreen?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  color?: string;
};

export function LoadingSpinner({
  size = 'medium',
  variant = 'default',
  label = 'Cargando…',
  fullScreen = false,
  className,
  style,
  children,
  color,
}: Props) {
  // Normalizar el prop `size` a una longitud CSS válida para `width`/`height`.
  const sizeMap: Record<string, number> = {
    small: 16,
    medium: 24,
    large: 48,
    xlarge: 64,
  };

  let px: string;
  let sizeClass: string = '';

  if (typeof size === 'number') {
    px = `${size}px`;
  } else if (typeof size === 'string' && /^\d+(?:\.\d+)?(px|rem|em|%)$/.test(size)) {
    px = size;
  } else if (typeof size === 'string' && size in sizeMap) {
    px = `${sizeMap[size]}px`;
    sizeClass = `size-${size}`;
  } else {
    px = size as string;
  }

  const containerClasses = clsx(
    styles.container,
    sizeClass && styles[sizeClass],
    variant && styles[`variant-${variant}`],
    className
  );

  const customStyle: CSSProperties = {
    ...style,
    ...(color && { color }),
  };

  const gradientId = `spinnerGradient-${Math.random().toString(36).substr(2, 9)}`;

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={containerClasses}
      style={customStyle}
      data-testid="loading-spinner"
    >
      <svg
        className={styles.svg}
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {variant === 'gradient' && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="50%" stopColor="var(--color-success)" />
              <stop offset="100%" stopColor="var(--color-accent)" />
            </linearGradient>
          </defs>
        )}

        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.12" strokeWidth="4" />

        <circle
          className={styles.arc}
          cx="12"
          cy="12"
          r="10"
          stroke={variant === 'gradient' ? `url(#${gradientId})` : 'currentColor'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80"
          strokeDashoffset="60"
          fill="none"
        />
      </svg>

      {children && <span>{children}</span>}
    </div>
  );

  if (!fullScreen) return spinner;

  return (
    <div
      className={styles.overlay}
      style={{ position: 'fixed', inset: 0 }}
      data-testid="loading-overlay"
    >
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
