// admin/AddExperienceForm.tsx

import React, { useState, useEffect } from 'react';
import { education as educationApi } from '@/services/endpoints';
import { useNotification } from '@/hooks/useNotification';
import type { Education } from '@/types/api';
import styles from './AddExperienceForm.module.css';
import Calendar from '@/ui/components/Calendar';

interface AddEducationFormProps {
  editingEducation?: Education;
  onSave: () => void;
  onCancel: () => void;
  initialData?: Partial<Education>;
  isEditing?: boolean;
  onSubmit?: (data: Education) => Promise<void>;
  formRef?: React.RefObject<HTMLFormElement | null>;
  useExternalFooter?: boolean;
  useModalShell?: boolean;
  onFormDataChange?: (data: Education) => void;
  onValidationErrorsChange?: (errors: any) => void;
}

const AddEducationForm: React.FC<AddEducationFormProps> = ({
  editingEducation,
  onSave,
  onCancel,
  initialData,
  isEditing = false,
  onSubmit,
  formRef,
  useExternalFooter = false,
  useModalShell = false,
  onFormDataChange,
  onValidationErrorsChange,
}) => {
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || editingEducation?.title || '',
    institution: initialData?.institution || editingEducation?.institution || '',
    start_date: initialData?.start_date || editingEducation?.start_date || '',
    end_date: initialData?.end_date || editingEducation?.end_date || '',
    description: initialData?.description || editingEducation?.description || '',
    grade: initialData?.grade || editingEducation?.grade || '',
  });

  useEffect(() => {
    if (useModalShell && onFormDataChange) {
      // @ts-ignore
      onFormDataChange(formData);
    }
  }, [formData, useModalShell, onFormDataChange]);

  useEffect(() => {
    if (useModalShell && onValidationErrorsChange) {
      const errors: any = {};
      if (!formData.title.trim()) errors.title = 'Título es requerido';
      if (!formData.institution.trim()) errors.institution = 'Institución es requerida';
      if (!formData.start_date.trim()) errors.start_date = 'Fecha de inicio es requerida';

      onValidationErrorsChange(errors);
    }
  }, [formData, useModalShell, onValidationErrorsChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Cerrar modal de forma optimista inmediatamente al enviar
    try {
      onSave();
    } catch {}

    try {
      const educationData = {
        ...formData,
        user_id: 1, // Por ahora fijo
      };

      if (editingEducation?._id) {
        const id = editingEducation._id;
        // @ts-ignore
        await educationApi.updateEducation(id, educationData);
        showSuccess('Formación Actualizada', 'Se ha actualizado la formación correctamente');
      } else {
        // @ts-ignore
        await educationApi.createEducation(educationData);
        showSuccess('Nueva Formación', 'Se ha creado la formación correctamente');
      }

      window.dispatchEvent(new CustomEvent('education-changed'));
    } catch (error: any) {
      console.error('Error al guardar formación:', error);
      // Mostrar mensaje de error más descriptivo si viene del servidor
      const serverMessage =
        error?.response?.data?.error || error?.message || 'No se pudo guardar la formación';
      showError('Error', serverMessage);
    } finally {
      setIsLoading(false);
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
            <label htmlFor="institution" className={styles.label}>
              <i className="fas fa-school"></i>
              Institución educativa *
            </label>
            <input
              type="text"
              id="institution"
              value={formData.institution}
              onChange={e => setFormData({ ...formData, institution: e.target.value })}
              required
              className={`${styles.input} ${!formData.institution ? styles.invalid : ''}`}
              placeholder="Ej: Universidad de Cádiz"
            />
            <div className={styles.helperText}>Nombre de la universidad o centro de estudios</div>
            {!formData.institution && (
              <div className={styles.errorText}>La institución es obligatoria</div>
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
            <Calendar
              selectedDate={formData.start_date ? new Date(formData.start_date) : null}
              onChange={date =>
                setFormData({
                  ...formData,
                  start_date: date ? date.toISOString().split('T')[0] : '',
                })
              }
              className={`${styles.input} ${!formData.start_date ? styles.invalid : ''}`}
            />
            {!formData.start_date && (
              <div className={styles.errorText}>La fecha de inicio es obligatoria</div>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="end_date" className={styles.label}>
              <i className="fas fa-calendar-check"></i>
              Fecha de fin
            </label>
            <Calendar
              selectedDate={formData.end_date ? new Date(formData.end_date) : null}
              onChange={date =>
                setFormData({ ...formData, end_date: date ? date.toISOString().split('T')[0] : '' })
              }
              className={styles.input}
            />
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
            value={formData.grade}
            onChange={e => setFormData({ ...formData, grade: e.target.value })}
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
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Especialización en Sistemas de la Información, mención en desarrollo de software..."
            className={styles.textarea}
            maxLength={500}
          />
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
            disabled={isLoading}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? 'Guardando...' : editingEducation ? 'Guardar Cambios' : 'Crear'}
          </button>
        </div>
      )}
    </form>
  );
};

export default AddEducationForm;
