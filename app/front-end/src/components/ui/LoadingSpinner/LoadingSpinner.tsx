// src/components/ui/LoadingSpinner/LoadingSpinner.tsx
import type { CSSProperties, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './LoadingSpinner.module.css';

type Props = {
  size?: number | string;
  label?: string;
  fullScreen?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function LoadingSpinner({
  size = 24,
  label = 'Cargando…',
  fullScreen = false,
  className,
  style,
  children,
}: Props) {
  // Normalizar el prop `size` a una longitud CSS válida para `width`/`height`.
  const sizeMap: Record<string, number> = { small: 16, medium: 24, large: 48 };
  let px: string;
  if (typeof size === 'number') {
    px = `${size}px`;
  } else if (/^\d+(?:\.\d+)?(px|rem|em|%)$/.test(size)) {
    // ya incluye unidad válida
    px = size;
  } else if (size in sizeMap) {
    px = `${(sizeMap as any)[size]}px`;
  } else {
    // fallback: intenta usarlo tal cual (evita pasar palabras como "large" directamente)
    px = size;
  }

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={clsx(styles.container, className)}
      style={style}
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
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.18" strokeWidth="4" />
        <circle
          className={styles.arc}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80"
          strokeDashoffset="60"
          fill="none"
        />
      </svg>

      {children ? <span>{children}</span> : null}
      {/* Ya no necesitamos el span sr-only para el nombre accesible */}
    </div>
  );

  if (!fullScreen) return spinner;

  // ✅ añadimos position/inset inline para que el test pase
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
