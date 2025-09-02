// admin/AddExperienceForm.tsx - Componente unificado que siempre usa ModalShell

import React, { useState, useEffect, useRef } from 'react';
import type { Experience } from '@/types/api';
import { experiences as experiencesApi } from '@/services/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/contexts/TranslationContext';
import SkillPill from '@/components/ui/SkillPill/SkillPill';
import Calendar from '@/ui/components/Calendar';
import styles from './AddExperienceForm.module.css';

interface FormData {
  title: string;
  company: string; // Solo company, no institution
  start_date: string;
  end_date: string;
  description: string;
  technologies?: string;
  order_index: number;
  is_current?: boolean;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface AddExperienceFormProps {
  editingExperience?: Experience;
  onSave: () => void;
  onCancel: () => void;
  formType?: 'experience' | 'education'; // Mantener compatibilidad, pero siempre será experience
  initialData?: Partial<FormData>;
  isEditing?: boolean;
  onSubmit?: (data: FormData) => Promise<void>;
  formRef?: React.RefObject<HTMLFormElement | null>;
  useExternalFooter?: boolean;
  useModalShell?: boolean; // Indica si se está usando dentro de ModalShell
  // Callbacks para comunicación con ModalShell
  onFormDataChange?: (data: FormData) => void;
  onValidationErrorsChange?: (errors: ValidationErrors) => void;
  onSelectedTechnologiesChange?: (technologies: string[]) => void;
}

// Sugerencias de tecnologías
const TECHNOLOGY_SUGGESTIONS = [
  'React',
  'Vue.js',
  'Angular',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Express.js',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring Boot',
  'C#',
  '.NET',
  'PHP',
  'Laravel',
  'HTML5',
  'CSS3',
  'SASS',
  'SCSS',
  'Tailwind CSS',
  'Bootstrap',
  'Material-UI',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Git',
  'GitHub',
  'GitLab',
  'Jenkins',
  'Jest',
  'Cypress',
  'Webpack',
  'Vite',
];

const AddExperienceForm: React.FC<AddExperienceFormProps> = ({
  editingExperience,
  onSave,
  onCancel,
  formType = 'experience', // Siempre será 'experience', deprecar en futuras versiones
  initialData = {},
  isEditing = !!editingExperience,
  onSubmit,
  formRef: externalFormRef,
  useExternalFooter = false,
  useModalShell = false,
  onFormDataChange,
  onValidationErrorsChange,
  onSelectedTechnologiesChange,
}) => {
  const { showSuccess, showError } = useNotification();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario - Simplificado para experiencia únicamente
  const [formData, setFormData] = useState<FormData>(() => {
    // Helper para normalizar technologies a string
    const normalizeTechnologies = (tech: any): string => {
      if (!tech) return '';
      if (Array.isArray(tech)) return tech.join(', ');
      if (typeof tech === 'string') return tech;
      return '';
    };

    return {
      title: editingExperience?.position || initialData.title || '',
      company: editingExperience?.company || initialData.company || '',
      start_date: editingExperience?.start_date || initialData.start_date || '',
      end_date: editingExperience?.end_date || initialData.end_date || '',
      description: editingExperience?.description || initialData.description || '',
      technologies:
        normalizeTechnologies(editingExperience?.technologies) ||
        normalizeTechnologies(initialData.technologies),
      order_index: editingExperience?.order_index || initialData.order_index || 0,
      is_current: initialData.is_current || false,
    };
  });

  // Estados de validación y UX - Sin barra de progreso (delegada a ModalShell)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technologyInput, setTechnologyInput] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);

  // Referencias
  const localFormRef = useRef<HTMLFormElement | null>(null);
  const formRef = externalFormRef ?? localFormRef;
  const techInputRef = useRef<HTMLInputElement>(null);

  // Inicializar tecnologías seleccionadas
  useEffect(() => {
    if (formData.technologies) {
      // Manejar tanto arrays como strings para technologies
      let techArray: string[] = [];

      if (Array.isArray(formData.technologies)) {
        // Si ya es un array, usarlo directamente
        techArray = formData.technologies.filter(Boolean);
      } else if (typeof formData.technologies === 'string') {
        // Si es string, dividirlo por comas
        techArray = formData.technologies
          .split(',')
          .map(tech => tech.trim())
          .filter(Boolean);
      }

      setSelectedTechnologies(techArray);
    }
  }, [formData.technologies]);

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

  useEffect(() => {
    if (useModalShell && onSelectedTechnologiesChange) {
      onSelectedTechnologiesChange(selectedTechnologies);
    }
  }, [useModalShell, onSelectedTechnologiesChange, selectedTechnologies]);

  // Validación de campos - Optimizada para experiencia únicamente
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'title':
        if (!value.trim()) return t.forms.validation.titleRequired;
        if (value.trim().length < 3) return t.forms.validation.titleMinLength;
        if (!/[\p{L}]/u.test(value)) return t.forms.validation.titleMustContainLetters;
        break;
      case 'company':
        if (!value.trim()) return t.forms.validation.companyRequired;
        if (value.trim().length < 2) return t.forms.validation.minLength;
        if (!/[\p{L}]/u.test(value)) return t.forms.validation.companyMustContainLetters;
        break;
      case 'start_date':
        if (!value) return t.forms.validation.startDateRequired;
        if (!/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value))
          return t.forms.validation.invalidDateFormat;
        break;
      case 'end_date':
        if (!value && !formData.is_current) return t.forms.validation.endDateRequired;
        if (value && !/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value))
          return t.forms.validation.invalidDateFormat;
        break;
      case 'description':
        if (value.length > 500) return t.forms.validation.descriptionMaxLength;
        break;
    }
    return null;
  };

  // Manejar cambios en campos
  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    // Validar campo
    const error = validateField(name, value);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  // Manejar checkbox "Actualmente"
  const handleCurrentToggle = () => {
    const newCurrentState = !formData.is_current;
    setFormData(prev => ({
      ...prev,
      is_current: newCurrentState,
      end_date: newCurrentState ? '' : prev.end_date,
    }));
    if (newCurrentState) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.end_date;
        return newErrors;
      });
    }
  };

  // Manejar tecnologías
  const handleTechnologyAdd = (tech: string) => {
    if (tech.trim() && !selectedTechnologies.includes(tech.trim())) {
      const newTechnologies = [...selectedTechnologies, tech.trim()];
      setSelectedTechnologies(newTechnologies);
      setFormData(prev => ({ ...prev, technologies: newTechnologies.join(', ') }));
      setTechnologyInput('');
      setShowTechSuggestions(false);
    }
  };

  const handleTechnologyRemove = (index: number) => {
    setSelectedTechnologies(prev => prev.filter((_, i) => i !== index));
  };

  const handleTechnologyRemoveByName = (techName: string) => {
    setSelectedTechnologies(prev => prev.filter(tech => tech !== techName));
  };
  const handleTechnologyInputChange = (value: string) => {
    setTechnologyInput(value);
    setShowTechSuggestions(value.length > 0);
  };

  const handleTechnologyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && technologyInput.trim()) {
      e.preventDefault();
      handleTechnologyAdd(technologyInput);
    }
  };

  // Filtrar sugerencias
  const getFilteredSuggestions = () => {
    return TECHNOLOGY_SUGGESTIONS.filter(
      tech =>
        tech.toLowerCase().includes(technologyInput.toLowerCase()) &&
        !selectedTechnologies.includes(tech)
    ).slice(0, 8);
  };

  // Validar todo el formulario
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    // Campos obligatorios para experiencia únicamente
    const requiredFields = [
      { name: 'title', value: formData.title },
      { name: 'company', value: formData.company },
      { name: 'start_date', value: formData.start_date },
    ];

    // Validar campos obligatorios
    requiredFields.forEach(({ name, value }) => {
      const error = validateField(name, value);
      if (error) errors[name] = error;
    });

    // Requerir tecnologías para experiencia
    if (!selectedTechnologies || selectedTechnologies.length === 0) {
      errors.technologies = t.forms.validation.technologiesRequired;
    }

    // Validar fecha de fin si no es actual
    if (!formData.is_current) {
      const endDateError = validateField('end_date', formData.end_date);
      if (endDateError) errors.end_date = endDateError;
      if (formData.start_date && formData.end_date) {
        const parse = (s: string) => {
          const clean = s.replace(/\//g, '-');
          const [d, m, y] = clean.split('-');
          return new Date(Number(y), Number(m) - 1, Number(d));
        };
        try {
          const sd = parse(formData.start_date);
          const ed = parse(formData.end_date);
          if (ed < sd) {
            errors.end_date = t.forms.validation.endDateMustBeAfterStart;
          }
        } catch (e) {
          /* noop */
        }
      }
    }

    // Validar descripción
    const descError = validateField('description', formData.description);
    if (descError) errors.description = descError;

    setValidationErrors(errors);
    return errors;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      showError(t.forms.validation.validationErrors, t.forms.validation.pleaseFixErrors);
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
        // Lógica original para experiencias
        const experienceData = {
          position: formData.title,
          company: formData.company,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description,
          technologies: formData.technologies
            ? formData.technologies
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech)
            : [],
          is_current:
            formData.is_current || formData.end_date === '' || formData.end_date === 'Presente',
          order_index: formData.order_index,
          user_id: '1', // Por ahora fijo
        };

        if (editingExperience?._id) {
          await experiencesApi.updateExperience(editingExperience._id, experienceData);
          showSuccess(t.forms.notifications.experienceUpdated, t.forms.notifications.updateSuccess);
        } else {
          await experiencesApi.createExperience(experienceData as any);
          showSuccess('Nueva Experiencia', t.forms.notifications.createSuccess);
        }

        // Disparar evento para refrescar datos
        window.dispatchEvent(new CustomEvent('experience-changed'));
      }

      onSave();
    } catch (error) {
      console.error('Error al guardar:', error);
      showError(
        t.forms.notifications.saveError,
        error instanceof Error ? error.message : t.forms.notifications.unknownError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.ctrlKey && e.key === 'Enter') {
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isExperience = true; // Siempre será experience

  // Contenido interno del formulario - SIN barra de progreso (delegada a ModalShell)
  const innerForm = (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form || ''}>
        {/* Información Básica */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-id-badge"></i>
            {t.forms.experience.basicInfo}
          </h3>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="title" className={styles.label}>
                <i className="fas fa-briefcase"></i>
                {t.forms.experience.position} *
              </label>
              <input
                name="title"
                id="title"
                type="text"
                value={formData.title}
                onChange={e => handleFieldChange('title', e.target.value)}
                className={`${styles.input} ${
                  touchedFields.title && validationErrors.title
                    ? styles.inputError
                    : touchedFields.title && !validationErrors.title
                      ? styles.inputValid
                      : ''
                }`}
                placeholder={t.forms.experience.positionPlaceholder}
                required
              />
              <div className={styles.helperText}>{t.forms.experience.positionHelper}</div>
              {touchedFields.title && validationErrors.title && (
                <div className={styles.errorText}>{validationErrors.title}</div>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="company" className={styles.label}>
                <i className="fas fa-building"></i>
                {t.forms.experience.company} *
              </label>
              <input
                name="company"
                id="company"
                type="text"
                value={formData.company || ''}
                onChange={e => handleFieldChange('company', e.target.value)}
                className={`${styles.input} ${
                  touchedFields.company && validationErrors.company
                    ? styles.inputError
                    : touchedFields.company && !validationErrors.company
                      ? styles.inputValid
                      : ''
                }`}
                placeholder={t.forms.experience.companyPlaceholder}
                required
              />
              <div className={styles.helperText}>{t.forms.experience.companyHelper}</div>
              {touchedFields.company && validationErrors.company && (
                <div className={styles.errorText}>{validationErrors.company}</div>
              )}
            </div>
          </div>
        </div>

        {/* Time Period */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-clock"></i>
            {t.forms.experience.timePeriod}
          </h3>

          <div className={styles.dateRangeContainer}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="start_date" className={styles.label}>
                  <i className="fas fa-calendar-alt"></i>
                  {t.forms.experience.startDate} *
                </label>
                <Calendar
                  selectedDate={
                    formData.start_date
                      ? new Date(formData.start_date.split('-').reverse().join('-'))
                      : null
                  }
                  onChange={date =>
                    handleFieldChange(
                      'start_date',
                      date
                        ? `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
                        : ''
                    )
                  }
                  placeholderText="DD-MM-YYYY"
                  className={styles.input}
                />
                {touchedFields.start_date && validationErrors.start_date && (
                  <div className={styles.errorText}>{validationErrors.start_date}</div>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="end_date" className={styles.label}>
                  <i className="fas fa-calendar-alt"></i>
                  {t.forms.experience.endDate}
                </label>
                <Calendar
                  selectedDate={
                    formData.end_date
                      ? new Date(formData.end_date.split('-').reverse().join('-'))
                      : null
                  }
                  onChange={date =>
                    handleFieldChange(
                      'end_date',
                      date
                        ? `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
                        : ''
                    )
                  }
                  disabled={formData.is_current}
                  placeholderText="DD-MM-YYYY"
                  className={styles.input}
                />
                {touchedFields.end_date && validationErrors.end_date && (
                  <div className={styles.errorText}>{validationErrors.end_date}</div>
                )}
              </div>
            </div>

            <div className={styles.currentToggle}>
              <input
                type="checkbox"
                id="current-toggle"
                checked={formData.is_current}
                onChange={handleCurrentToggle}
                className={styles.checkbox}
              />
              <label htmlFor="current-toggle" className={styles.checkboxLabel}>
                {isExperience ? t.forms.experience.currentJob : t.forms.experience.currentStudies}
              </label>
            </div>
          </div>
        </div>

        {/* Tecnologías (solo para experiencia) */}
        {isExperience && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-code"></i>
              {t.forms.experience.technologies}
            </h3>

            <div className={styles.formField}>
              <label htmlFor="technologies_input" className={styles.label}>
                <i className="fas fa-tools"></i>
                {t.forms.experience.technologiesUsed}
              </label>

              <div className={styles.technologyContainer} style={{ position: 'relative' }}>
                <input
                  name="technologies_input"
                  id="technologies_input"
                  ref={techInputRef}
                  type="text"
                  value={technologyInput}
                  onChange={e => handleTechnologyInputChange(e.target.value)}
                  onKeyDown={handleTechnologyKeyDown}
                  onFocus={() => setShowTechSuggestions(technologyInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowTechSuggestions(false), 200)}
                  className={styles.technologyInput}
                  placeholder={t.forms.experience.technologiesPlaceholder}
                />

                {showTechSuggestions && getFilteredSuggestions().length > 0 && (
                  <div className={styles.suggestions}>
                    {getFilteredSuggestions().map(tech => (
                      <div
                        key={tech}
                        className={styles.suggestionItem}
                        onClick={() => handleTechnologyAdd(tech)}
                      >
                        {tech}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedTechnologies.length > 0 && (
                <div className={styles.technologyChips}>
                  {selectedTechnologies.map((tech, index) => (
                    <SkillPill
                      key={index}
                      name={tech}
                      colored={true}
                      closable={true}
                      onClose={handleTechnologyRemoveByName}
                      className={styles.skillChip}
                    />
                  ))}
                </div>
              )}

              <div className={styles.helperText}>{t.forms.experience.technologiesHelper}</div>
              {validationErrors.technologies && (
                <div className={styles.errorText}>{validationErrors.technologies}</div>
              )}
            </div>
          </div>
        )}

        {/* Calificación (solo para educación) */}
        {!isExperience && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-medal"></i>
              {t.forms.experience.academicDetails}
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="order_index" className={styles.label}>
                  <i className="fas fa-sort-numeric-up"></i>
                  {t.forms.experience.displayOrder}
                </label>
                <input
                  name="order_index"
                  id="order_index"
                  type="number"
                  value={formData.order_index || 0}
                  onChange={e => handleFieldChange('order_index', e.target.value)}
                  className={styles.input}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-align-left"></i>
            {t.forms.experience.details}
          </h3>

          <div className={styles.formField}>
            <label htmlFor="description" className={styles.label}>
              <i className="fas fa-file-text"></i>
              {t.forms.experience.description}
            </label>
            <div className={styles.textareaContainer} style={{ position: 'relative' }}>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                className={`${styles.textarea} ${touchedFields.description && validationErrors.description ? styles.textareaError : ''}`}
                rows={8}
                maxLength={500}
                placeholder={t.forms.experience.descriptionPlaceholder}
              />
              <div
                className={`${styles.characterCounter} ${formData.description.length > 450 ? styles.warning : formData.description.length > 480 ? styles.error : ''}`}
              >
                {formData.description.length}/500
              </div>
            </div>
            {touchedFields.description && validationErrors.description && (
              <div className={styles.errorText}>{validationErrors.description}</div>
            )}
            <div className={styles.helperText}>{t.forms.experience.descriptionHelper}</div>
          </div>
        </div>
      </form>
    </>
  );

  // Siempre devolvemos el contenido envuelto en el wrapper de ModalShell
  return <div className={styles.innerWrapper}>{innerForm}</div>;
};

export default AddExperienceForm;
