// src/components/ui/Button/Button.tsx

import { forwardRef, type ButtonHTMLAttributes, useEffect } from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...rest
    },
    ref
  ) => {
    useEffect(() => {
      if (!ref || typeof ref === 'function') return;
      const el = ref.current;
      if (!el) return;
      if (loading) el.classList.add('will-transform');
      else el.classList.remove('will-transform');
      const done = () => el.classList.remove('will-transform');
      el.addEventListener('animationend', done);
      return () => {
        el.removeEventListener('animationend', done);
      };
    }, [loading]);

    return (
      <button
        ref={ref}
        className={clsx(
          styles.button,
          styles[variant],
          styles[size],
          {
            [styles.loading]: loading,
            [styles.fullWidth]: fullWidth,
          },
          className
        )}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...rest}
      >
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        <span className={clsx({ [styles.hidden]: loading })}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
