// src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import styles from './Input.module.css';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  success?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      error = false,
      success = false,
      fullWidth = false,
      startIcon,
      endIcon,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={clsx(styles.inputWrapper, { [styles.fullWidth]: fullWidth })}>
        {startIcon && <div className={styles.startIcon}>{startIcon}</div>}

        <input
          ref={ref}
          className={clsx(
            styles.input,
            styles[variant],
            styles[size],
            {
              [styles.error]: error,
              [styles.success]: success,
              [styles.hasStartIcon]: startIcon,
              [styles.hasEndIcon]: endIcon,
            },
            className
          )}
          {...rest}
        />

        {endIcon && <div className={styles.endIcon}>{endIcon}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
