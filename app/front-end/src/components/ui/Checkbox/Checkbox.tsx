// src/components/ui/Checkbox/Checkbox.tsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'switch';
  error?: boolean;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      size = 'md',
      variant = 'default',
      error = false,
      description,
      indeterminate = false,
      className,
      checked,
      disabled,
      id,
      ...rest
    },
    ref
  ) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    React.useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    if (variant === 'switch') {
      return (
        <div className={clsx(styles.switchWrapper, styles[size], { [styles.error]: error })}>
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={clsx(styles.switchInput, className)}
            checked={checked}
            disabled={disabled}
            {...rest}
          />
          <label htmlFor={inputId} className={styles.switchLabel}>
            <span className={styles.switchSlider}></span>
            {label && <span className={styles.switchText}>{label}</span>}
          </label>
          {description && <div className={styles.description}>{description}</div>}
        </div>
      );
    }

    return (
      <div className={clsx(styles.checkboxWrapper, styles[size], { [styles.error]: error })}>
        <div className={styles.checkboxInputWrapper}>
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={clsx(styles.checkboxInput, className)}
            checked={checked}
            disabled={disabled}
            {...rest}
          />
          <div className={styles.checkboxCustom}>
            {checked && !indeterminate && <i className="fas fa-check" aria-hidden="true"></i>}
            {indeterminate && <i className="fas fa-minus" aria-hidden="true"></i>}
          </div>
        </div>

        {label && (
          <label htmlFor={inputId} className={styles.checkboxLabel}>
            {label}
          </label>
        )}

        {description && <div className={styles.description}>{description}</div>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
