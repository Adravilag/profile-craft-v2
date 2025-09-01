// src/components/ui/TextArea/TextArea.tsx
import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import styles from './TextArea.module.css';

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  success?: boolean;
  fullWidth?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      variant = 'default',
      size = 'md',
      error = false,
      success = false,
      fullWidth = false,
      showCharacterCount = false,
      maxLength,
      autoResize = false,
      className,
      value,
      onChange,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      typeof value === 'string' ? value : ''
    );

    const currentValue = value !== undefined ? String(value) : internalValue;
    const charCount = currentValue.length;
    const isNearLimit = maxLength ? charCount / maxLength > 0.8 : false;
    const isOverLimit = maxLength ? charCount > maxLength : false;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(e);
    };

    return (
      <div className={clsx(styles.textAreaWrapper, { [styles.fullWidth]: fullWidth })}>
        <textarea
          ref={ref}
          className={clsx(
            styles.textArea,
            styles[variant],
            styles[size],
            {
              [styles.error]: error,
              [styles.success]: success,
              [styles.autoResize]: autoResize,
            },
            className
          )}
          value={currentValue}
          onChange={handleChange}
          maxLength={maxLength}
          {...rest}
        />

        {showCharacterCount && maxLength && (
          <div
            className={clsx(styles.characterCounter, {
              [styles.warning]: isNearLimit && !isOverLimit,
              [styles.error]: isOverLimit,
            })}
          >
            {charCount}/{maxLength} caracteres
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
