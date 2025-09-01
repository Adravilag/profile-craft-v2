// src/components/ui/FormField/FormField.tsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import styles from './FormField.module.css';

interface FormFieldProps {
  children: React.ReactElement;
  label?: string;
  icon?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, label, icon, error, helperText, required, className }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.formField, className)}>
        {label && (
          <label className={styles.label}>
            {icon && <i className={`fas ${icon}`}></i>}
            {label} {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {React.cloneElement(children as React.ReactElement<any>, {
            className: clsx((children as React.ReactElement<any>).props.className, styles.input, {
              [styles.inputError]: error,
              [styles.inputValid]:
                !error &&
                (children as React.ReactElement<any>).props.value &&
                (children as React.ReactElement<any>).props.value.length > 0,
            }),
          })}
        </div>

        {error && (
          <div className={styles.errorText}>
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {helperText && !error && <div className={styles.helperText}>{helperText}</div>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
