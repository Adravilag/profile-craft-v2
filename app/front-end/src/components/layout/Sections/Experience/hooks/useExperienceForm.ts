import { useState, useCallback, useMemo } from 'react';
import type { Experience } from '@/types/api';

interface ExperienceFormData {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
  technologies: string;
  is_current: boolean;
  order_index: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface UseExperienceFormReturn {
  formData: ExperienceFormData;
  isEditing: boolean;
  errors: string[];
  updateField: (field: keyof ExperienceFormData, value: string | boolean | number) => void;
  validateForm: () => ValidationResult;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

export const useExperienceForm = (
  initialExperience?: Experience,
  onSubmit?: (data: ExperienceFormData) => Promise<void>
): UseExperienceFormReturn => {
  // Función para crear datos iniciales del formulario
  const createInitialFormData = useCallback((): ExperienceFormData => {
    if (initialExperience) {
      return {
        title: initialExperience.position,
        company: initialExperience.company,
        start_date: initialExperience.start_date,
        end_date: initialExperience.end_date || '',
        description: initialExperience.description || '',
        technologies: initialExperience.technologies?.join(', ') || '',
        is_current: initialExperience.is_current || false,
        order_index: initialExperience.order_index || 0,
      };
    }

    return {
      title: '',
      company: '',
      start_date: '',
      end_date: '',
      description: '',
      technologies: '',
      is_current: false,
      order_index: 0,
    };
  }, [initialExperience]);

  // Estado del formulario
  const [formData, setFormData] = useState<ExperienceFormData>(createInitialFormData);
  const [errors, setErrors] = useState<string[]>([]);

  // Determinar si estamos editando
  const isEditing = useMemo(() => !!initialExperience, [initialExperience]);

  // Función para actualizar campos del formulario
  const updateField = useCallback(
    (field: keyof ExperienceFormData, value: string | boolean | number) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));

      // Limpiar errores cuando se actualiza un campo
      if (errors.length > 0) {
        setErrors([]);
      }
    },
    [errors.length]
  );

  // Función de validación
  const validateForm = useCallback((): ValidationResult => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) {
      newErrors.push('El título es requerido');
    }

    if (!formData.company.trim()) {
      newErrors.push('La empresa es requerida');
    }

    if (!formData.start_date.trim()) {
      newErrors.push('La fecha de inicio es requerida');
    }

    // Validar que la fecha de fin sea posterior a la de inicio si se proporciona
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        newErrors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    return {
      isValid: newErrors.length === 0,
      errors: newErrors,
    };
  }, [formData]);

  // Función para manejar el envío del formulario
  const handleSubmit = useCallback(async () => {
    const validation = validateForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (onSubmit) {
      try {
        await onSubmit(formData);
        setErrors([]);
      } catch (error) {
        setErrors(['Error al enviar el formulario']);
      }
    }
  }, [formData, validateForm, onSubmit]);

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setFormData(createInitialFormData());
    setErrors([]);
  }, [createInitialFormData]);

  return {
    formData,
    isEditing,
    errors,
    updateField,
    validateForm,
    handleSubmit,
    resetForm,
  };
};

export default useExperienceForm;
