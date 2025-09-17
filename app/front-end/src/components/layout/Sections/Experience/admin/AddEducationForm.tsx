import React, { useState, useEffect, useRef } from 'react';
import { education as educationApi } from '@/services/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/contexts/TranslationContext';
import type { Education } from '@/types/api';
import styles from './AddExperienceForm.module.css';
import CalendarPicker from '@/components/ui/Calendar/CalendarPicker';

interface FormData {
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description: string;
  grade: string;
  order_index: number;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface AddEducationFormProps {
  editingEducation?: Education;
  onSave: () => void;
  onCancel: () => void;
  initialData?: Partial<FormData>;
  isEditing?: boolean;
  onSubmit?: (data: FormData) => Promise<void>;
  formRef?: React.RefObject<HTMLFormElement | null>;
  useExternalFooter?: boolean;
  useModalShell?: boolean;
  onFormDataChange?: (data: FormData) => void;
  onValidationErrorsChange?: (errors: ValidationErrors) => void;
}

const AddEducationForm: React.FC<AddEducationFormProps> = ({
  editingEducation,
  onSave,
  onCancel,
  initialData = {},
  isEditing = !!editingEducation,
  onSubmit,
  formRef: externalFormRef,
  useExternalFooter = false,
  useModalShell = false,
  onFormDataChange,
  onValidationErrorsChange,
}) => {
  const { showSuccess, showError } = useNotification();
  const { t } = useTranslation();

  // Estados del formulario
  const [formData, setFormData] = useState<FormData>(() => ({
    title: editingEducation?.title || initialData.title || '',
    institution: editingEducation?.institution || initialData.institution || '',
    start_date: editingEducation?.start_date || initialData.start_date || '',
    end_date: editingEducation?.end_date || initialData.end_date || '',
    description: editingEducation?.description || initialData.description || '',
    grade: editingEducation?.grade || initialData.grade || '',
    order_index: editingEducation?.order_index || initialData.order_index || 0,
  }));

  // Estados de validación y UX
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Referencias
  const localFormRef = useRef<HTMLFormElement | null>(null);
  const formRef = externalFormRef ?? localFormRef;

  // Validación de campos
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'El título es obligatorio';
        if (value.trim().length < 3) return 'El título debe tener al menos 3 caracteres';
        if (!/[\p{L}]/u.test(value)) return 'El título debe contener letras';
        break;
      case 'institution':
        if (!value.trim()) return 'La institución es obligatoria';
        if (value.trim().length < 2) return 'La institución debe tener al menos 2 caracteres';
        if (!/[\p{L}]/u.test(value)) return 'La institución debe contener letras';
        break;
      case 'start_date':
        if (!value) return 'La fecha de inicio es obligatoria';
        if (!/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value))
          return 'Formato de fecha inválido (dd/mm/yyyy)';
        break;
      case 'end_date':
        if (value && !/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value))
          return 'Formato de fecha inválido (dd/mm/yyyy)';
        break;
      case 'description':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.trim().length < 20) return 'La descripción debe tener al menos 20 caracteres';
        if (value.length > 500) return 'La descripción no puede exceder 500 caracteres';
        break;
    }
    return null;
  };

  // Manejar cambios en campos con validación en tiempo real
  const handleFieldChange = (name: string, value: string) => {
    // Actualizar datos del formulario
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validar campo específico
    const error = validateField(name as keyof FormData, value);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });

    // Notificar cambios a ModalShell si están disponibles los callbacks
    const updatedFormData = { ...formData, [name]: value };
    if (onFormDataChange) {
      onFormDataChange(updatedFormData);
    }
    if (onValidationErrorsChange) {
      const updatedErrors = { ...validationErrors };
      if (error) {
        updatedErrors[name] = error;
      } else {
        delete updatedErrors[name];
      }
      onValidationErrorsChange(updatedErrors);
    }
  };

  // Validar todo el formulario
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    // Campos obligatorios para educación
    const requiredFields = [
      { name: 'title', value: formData.title },
      { name: 'institution', value: formData.institution },
      { name: 'start_date', value: formData.start_date },
      { name: 'description', value: formData.description },
    ];

    // Validar campos obligatorios
    requiredFields.forEach(({ name, value }) => {
      const error = validateField(name, value);
      if (error) errors[name] = error;
    });

    // Validar fecha de fin si se proporciona
    if (formData.end_date) {
      const endDateError = validateField('end_date', formData.end_date);
      if (endDateError) {
        errors.end_date = endDateError;
      } else if (formData.start_date) {
        // Validar que la fecha de fin sea posterior a la de inicio
        const parse = (s: string) => {
          const clean = s.replace(/\//g, '-');
          const [d, m, y] = clean.split('-');
          return new Date(Number(y), Number(m) - 1, Number(d));
        };
        try {
          const sd = parse(formData.start_date);
          const ed = parse(formData.end_date);
          if (ed < sd) {
            errors.end_date = 'La fecha de fin debe ser posterior a la de inicio';
          }
        } catch (e) {
          /* noop */
        }
      }
    }

    setValidationErrors(errors);
    return errors;
  };

  // Notificar cambios al ModalShell cuando se está usando dentro de uno
  useEffect(() => {
    if (useModalShell && onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [useModalShell, onFormDataChange, formData]);

  useEffect(() => {
    if (useModalShell && onValidationErrorsChange) {
      onValidationErrorsChange(validationErrors);
    }
  }, [useModalShell, onValidationErrorsChange, validationErrors]);

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      showError('Errores de validación', 'Por favor corrige los errores antes de continuar');
      const firstKey = Object.keys(errors)[0];
      try {
        const el = formRef.current?.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
        if (el && typeof el.focus === 'function') el.focus();
      } catch (e) {
        /* noop */
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Si se proporciona onSubmit personalizado, usarlo
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Normalizar fechas a ISO antes de enviar
        const { convertSpanishDateToISO } = await import('@/utils/dateUtils');
        const startIso = convertSpanishDateToISO(formData.start_date);
        const endIso = formData.end_date ? convertSpanishDateToISO(formData.end_date) : '';

        const educationData = {
          title: formData.title,
          institution: formData.institution,
          start_date: startIso,
          end_date: endIso,
          description: formData.description,
          grade: formData.grade,
          order_index: formData.order_index,
        };

        if (editingEducation?._id) {
          const id = parseInt(editingEducation._id as string);
          await educationApi.updateEducation(id, educationData);
          showSuccess('Formación Actualizada', 'Se ha actualizado la formación correctamente');
        } else {
          await educationApi.createEducation(educationData as any);
          showSuccess('Nueva Formación', 'Se ha creado la formación correctamente');
        }

        // Disparar evento para refrescar datos
        window.dispatchEvent(new CustomEvent('education-changed'));
      }

      onSave();
    } catch (error: any) {
      console.error('Error al guardar formación:', error);

      // Mostrar detalles del backend si existen
      const backendDetails = error?.response?.data;
      if (backendDetails) {
        console.error('Backend error details:', backendDetails);
        showError('Error al guardar', JSON.stringify(backendDetails));
      } else {
        const serverMessage = error?.message || 'No se pudo guardar la formación';
        showError('Error', serverMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form || ''}>
      {/* Información básica */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-graduation-cap"></i>
          Información Básica
        </h3>

        <div className={styles.formGrid}>
          {/* Título de la titulación */}
          <div className={styles.formField}>
            <label htmlFor="title" className={styles.label}>
              <i className="fas fa-user-graduate"></i>
              Título de la titulación *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              className={`${styles.input} ${!formData.title ? styles.invalid : ''}`}
              placeholder="Ej: Grado en Ingeniería Informática"
            />
            <div className={styles.helperText}>Especifica tu titulación o grado</div>
            {!formData.title && (
              <div className={styles.errorText}>El título de la titulación es obligatorio</div>
            )}
          </div>

          {/* Institución */}
          <div className={styles.formField}>
            <label htmlFor="title" className={styles.label}>
              <i className="fas fa-graduation-cap"></i>
              Título de la formación *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={e => handleFieldChange('title', e.target.value)}
              placeholder="Ej: Licenciatura en Informática"
              className={`${styles.input} ${validationErrors.title ? styles.invalid : ''}`}
            />
            {validationErrors.title && (
              <div className={styles.errorText}>{validationErrors.title}</div>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="institution" className={styles.label}>
              <i className="fas fa-university"></i>
              Institución *
            </label>
            <input
              id="institution"
              name="institution"
              type="text"
              value={formData.institution}
              onChange={e => handleFieldChange('institution', e.target.value)}
              placeholder="Ej: Universidad de Valencia"
              className={`${styles.input} ${validationErrors.institution ? styles.invalid : ''}`}
            />
            {validationErrors.institution && (
              <div className={styles.errorText}>{validationErrors.institution}</div>
            )}
          </div>
        </div>
      </div>

      {/* Período de Tiempo */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-clock"></i>
          Período de Tiempo
        </h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="start_date" className={styles.label}>
              <i className="fas fa-calendar-alt"></i>
              Fecha de Inicio *
            </label>
            <CalendarPicker
              initial={formData.start_date ? new Date(formData.start_date) : null}
              onSelect={ym => {
                const dateStr = ym ? String(ym) : '';
                handleFieldChange('start_date', dateStr);
              }}
              className={`${styles.input} ${validationErrors.start_date ? styles.invalid : ''}`}
            />
            {validationErrors.start_date && (
              <div className={styles.errorText}>{validationErrors.start_date}</div>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="end_date" className={styles.label}>
              <i className="fas fa-calendar-check"></i>
              Fecha de fin
            </label>
            <CalendarPicker
              initial={formData.end_date ? new Date(formData.end_date) : null}
              onSelect={ym => {
                const dateStr = ym ? String(ym) : '';
                handleFieldChange('end_date', dateStr);
              }}
              className={`${styles.input} ${validationErrors.end_date ? styles.invalid : ''}`}
            />
            {validationErrors.end_date && (
              <div className={styles.errorText}>{validationErrors.end_date}</div>
            )}
          </div>
        </div>
      </div>

      {/* Detalles Adicionales */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-info-circle"></i>
          Detalles Adicionales
        </h3>
        <div className={styles.formField}>
          <label htmlFor="grade" className={styles.label}>
            <i className="fas fa-star"></i>
            Nota / Calificación
          </label>
          <input
            type="text"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={e => handleFieldChange('grade', e.target.value)}
            placeholder="Ej: 7.5, Sobresaliente, etc."
            className={styles.input}
          />
          <div className={styles.helperText}>Calificación final, si aplica</div>
        </div>
      </div>

      {/* Descripción y Detalles */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-align-left"></i>
          Descripción y Detalles
        </h3>
        <div className={styles.formField}>
          <label htmlFor="description" className={styles.label}>
            <i className="fas fa-file-alt"></i>
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={e => handleFieldChange('description', e.target.value)}
            rows={4}
            placeholder="Describe tu experiencia académica, proyectos realizados, etc."
            className={`${styles.textarea} ${validationErrors.description ? styles.invalid : ''}`}
          />
          {validationErrors.description && (
            <div className={styles.errorText}>{validationErrors.description}</div>
          )}
          <div className={styles.characterCounter}>{formData.description.length}/500</div>
          <div className={styles.helperText}>
            Máximo 500 caracteres. Enfócate en logros y responsabilidades clave
          </div>
        </div>
      </div>

      {/* Botones si no usa ModalShell */}
      {!useModalShell && !useExternalFooter && (
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? 'Guardando...' : editingEducation ? 'Guardar Cambios' : 'Crear'}
          </button>
        </div>
      )}
    </form>
  );
};

export default AddEducationForm;
