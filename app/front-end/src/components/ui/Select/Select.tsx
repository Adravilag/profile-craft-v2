// src/components/ui/Select/Select.tsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import styles from './Select.module.css';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  success?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      variant = 'default',
      size = 'md',
      error = false,
      success = false,
      fullWidth = false,
      icon,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={clsx(styles.selectWrapper, { [styles.fullWidth]: fullWidth })}>
        {icon && <div className={styles.icon}>{icon}</div>}

        <select
          ref={ref}
          className={clsx(
            styles.select,
            styles[variant],
            styles[size],
            {
              [styles.error]: error,
              [styles.success]: success,
              [styles.hasIcon]: icon,
            },
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {options.map(option => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <div className={styles.chevron}>
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
