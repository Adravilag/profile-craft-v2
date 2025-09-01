import { useState, useCallback } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface UseFormValidationProps {
  rules: ValidationRules;
  initialValues?: Record<string, any>;
}

interface UseFormValidationReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: string, value: any) => void;
  setValues: (newValues: Record<string, any>) => void;
  validate: (field?: string) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  handleSubmit: (onSubmit: (values: Record<string, any>) => Promise<void>) => Promise<void>;
}

/**
 * Hook reutilizable para validación de formularios.
 * Maneja validación, errores y estados de submit.
 */
export const useFormValidation = ({
  rules,
  initialValues = {},
}: UseFormValidationProps): UseFormValidationReturn => {
  const { t } = useTranslation();
  const [values, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (field: string, value: any): string => {
      const rule = rules[field];
      if (!rule) return '';

      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return t.forms.validation.required;
      }

      // Skip other validations if empty and not required
      if (!value && !rule.required) return '';

      // Min length validation
      if (rule.minLength && value.length < rule.minLength) {
        return t.contactForms.tooShort;
      }

      // Max length validation
      if (rule.maxLength && value.length > rule.maxLength) {
        return t.contactForms.tooLong;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        // Special case for email field
        if (field.toLowerCase().includes('email')) {
          return t.contactForms.invalidEmail;
        }
        // Special case for phone field
        if (field.toLowerCase().includes('phone')) {
          return t.contactForms.invalidPhone;
        }
        return t.states.error;
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) return customError;
      }

      return '';
    },
    [rules, t]
  );

  const setValue = useCallback(
    (field: string, value: any) => {
      setFormValues(prev => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    },
    [errors]
  );

  const setValues = useCallback((newValues: Record<string, any>) => {
    setFormValues(newValues);
    setErrors({}); // Clear all errors when setting new values
  }, []);

  const validate = useCallback(
    (field?: string): boolean => {
      if (field) {
        const error = validateField(field, values[field]);
        setErrors(prev => ({ ...prev, [field]: error }));
        return !error;
      }
      return true;
    },
    [validateField, values]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isFormValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [rules, validateField, values]);

  const reset = useCallback(() => {
    setFormValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (onSubmit: (values: Record<string, any>) => Promise<void>) => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        const isFormValid = validateAll();
        if (isFormValid) {
          await onSubmit(values);
        }
      } catch (error) {
        // Error handling is done by the calling component
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, validateAll, values]
  );

  const isValid =
    Object.keys(errors).length === 0 &&
    Object.keys(rules).every(field => values[field] !== undefined);

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    validate,
    validateAll,
    reset,
    handleSubmit,
  };
};

// Utility patterns for common validations
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  name: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/,
  username: /^[a-zA-Z0-9_]+$/,
};
