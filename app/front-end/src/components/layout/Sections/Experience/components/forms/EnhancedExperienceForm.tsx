// src/components/sections/experience/EnhancedExperienceForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNotificationContext } from '@/contexts';
import styles from './EnhancedExperienceForm.module.css';
import DateInput from '@/components/ui/DateInput/DateInput';

interface FormData {
  title: string;
  company?: string;
  institution?: string;
  start_date: string;
  end_date: string;
  description: string;
  technologies?: string;
  grade?: string;
  order_index: number;
  is_current?: boolean;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface EnhancedExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  formType: 'experience' | 'education';
  initialData?: Partial<FormData>;
  isEditing: boolean;
  onSubmit: (data: FormData) => Promise<void>;
  /**
   * When true the component will render only the inner form/content
   * without the overlay/container so it can be wrapped by a ModalShell.
   */
  useModalShell?: boolean;
  /**
   * Optional ref to the form element (used when ModalShell controls submit)
   */
  formRef?: React.RefObject<HTMLFormElement | null>;
  /**
   * If true, the component will not render its sticky footer and expects
   * the parent (ModalShell) to render action buttons.
   */
  useExternalFooter?: boolean;
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

const EnhancedExperienceForm: React.FC<EnhancedExperienceFormProps> = ({
  isOpen,
  onClose,
  formType,
  initialData = {},
  isEditing,
  onSubmit,
  useModalShell = false,
  formRef: externalFormRef,
  useExternalFooter = false,
}) => {
  const { showError, showSuccess } = useNotificationContext();

  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    title: '',
    company: '',
    institution: '',
    start_date: '',
    end_date: '',
    description: '',
    technologies: '',
    grade: '',
    order_index: 0,
    is_current: false,
    ...initialData,
  });
  // Estados de validación y UX
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technologyInput, setTechnologyInput] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Referencias
  const localFormRef = useRef<HTMLFormElement | null>(null);
  const formRef = externalFormRef ?? localFormRef;
  const techInputRef = useRef<HTMLInputElement>(null);

  // Calcular progreso del formulario
  // Calcular progreso por pasos: Basic Info (20), Period (20), Technologies (30), Description (30)
  useEffect(() => {
    const isExperience = formType === 'experience';

    const stepCompletion: { [key: string]: boolean } = {
      basic: false, // título + empresa/institución
      period: false, // fecha inicio (+ fin o actual)
      technologies: false, // solo para experience
      description: false,
    };

    // Basic info
    const titleValid = (() => {
      const v = (formData.title || '').toString().trim();
      return v.length >= 3 && /[\p{L}]/u.test(v);
    })();

    const orgValid = (() => {
      const key = isExperience ? 'company' : 'institution';
      const v = (formData[key as keyof FormData] || '').toString().trim();
      return v.length >= 2;
    })();

    stepCompletion.basic = titleValid && orgValid;

    // Period
    const startValid = (() => {
      const s = (formData.start_date || '').toString().trim();
      const m = s.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
      if (!m) return false;
      const d = Number(m[1]),
        mo = Number(m[2]),
        y = Number(m[3]);
      const dt = new Date(y, mo - 1, d);
      return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
    })();

    const endValid = (() => {
      if (formData.is_current) return true;
      const e = (formData.end_date || '').toString().trim();
      if (!e) return false;
      const m = e.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
      if (!m) return false;
      const d = Number(m[1]),
        mo = Number(m[2]),
        y = Number(m[3]);
      const dt = new Date(y, mo - 1, d);
      return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
    })();

    stepCompletion.period = startValid && endValid;

    // Technologies
    stepCompletion.technologies = isExperience ? selectedTechnologies.length > 0 : true;

    // Description
    stepCompletion.description = (formData.description || '').toString().trim().length >= 20;

    // Pesos
    const weights = {
      basic: 20,
      period: 20,
      technologies: isExperience ? 30 : 0,
      description: 30,
    } as const;

    const total = Object.keys(weights).reduce((acc, k) => acc + (weights as any)[k], 0);
    const achieved = Object.keys(stepCompletion).reduce(
      (acc, k) => (acc + (stepCompletion as any)[k] ? (weights as any)[k] : 0),
      0
    );

    const percent = total > 0 ? Math.round((achieved / total) * 100) : 0;
    setFormProgress(percent);
    // store which steps are complete on state via refless variables used in render
    // We'll compute requiredStepsComplete on render when needed
  }, [formData, formType, selectedTechnologies]);

  // ...existing code...

  // Inicializar tecnologías seleccionadas
  useEffect(() => {
    if (formData.technologies) {
      setSelectedTechnologies(
        formData.technologies
          .split(',')
          .map(tech => tech.trim())
          .filter(Boolean)
      );
    }
  }, [formData.technologies]);

  // Validación de campos
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'El título es obligatorio';
        if (value.trim().length < 3) return 'El título debe tener al menos 3 caracteres';
        // No aceptar títulos que sean solo números o símbolos: debe contener al menos una letra
        if (!/[\p{L}]/u.test(value)) return 'El título debe contener letras';
        break;
      case 'company':
      case 'institution':
        if (!value.trim())
          return `${formType === 'experience' ? 'La empresa' : 'La institución'} es obligatoria`;
        if (value.trim().length < 2) return 'Debe tener al menos 2 caracteres';
        // No aceptar nombres compuestos únicamente por números o símbolos — debe contener letras
        if (!/[\p{L}]/u.test(value))
          return `${formType === 'experience' ? 'La empresa' : 'La institución'} debe contener letras`;
        break;
      case 'start_date':
        if (!value) return 'La fecha de inicio es obligatoria';
        // formato DD-MM-YYYY o DD/MM/YYYY
        if (!/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value))
          return 'Formato de fecha inválido (DD-MM-YYYY)';
        break;
      case 'end_date':
        if (!value && !formData.is_current) return 'La fecha de fin es obligatoria';
        if (value && !/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value))
          return 'Formato de fecha inválido (DD-MM-YYYY)';
        // comparison is handled in validateForm for robustness
        break;
      case 'description':
        if (value.length > 500) return 'La descripción no puede exceder 500 caracteres';
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
        delete newErrors[name]; // Eliminar la clave si no hay error
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
        delete newErrors.end_date; // Eliminar error de fecha de fin si está actualmente
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
    const newTechnologies = selectedTechnologies.filter((_, i) => i !== index);
    setSelectedTechnologies(newTechnologies);
    setFormData(prev => ({ ...prev, technologies: newTechnologies.join(', ') }));
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
    const requiredFields =
      formType === 'experience'
        ? [
            { name: 'title', value: formData.title },
            { name: 'company', value: formData.company || '' },
            { name: 'start_date', value: formData.start_date },
          ]
        : [
            { name: 'title', value: formData.title },
            { name: 'institution', value: formData.institution || '' },
            { name: 'start_date', value: formData.start_date },
          ];

    // Validar campos obligatorios
    requiredFields.forEach(({ name, value }) => {
      const error = validateField(name, value);
      if (error) errors[name] = error;
    });

    // Para experience, requerir tecnologías
    if (formType === 'experience') {
      if (!selectedTechnologies || selectedTechnologies.length === 0) {
        errors.technologies = 'Agrega al menos una tecnología o herramienta';
      }
    }

    // Validar fecha de fin si no es actual
    if (!formData.is_current) {
      const endDateError = validateField('end_date', formData.end_date);
      if (endDateError) errors.end_date = endDateError;
      // compare dates if both present and in DD-MM-YYYY or DD/MM/YYYY
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
            errors.end_date = 'La fecha de fin debe ser posterior a la de inicio';
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
      showError('Errores de Validación', 'Por favor corrige los errores antes de continuar');
      // focus al primer campo con error
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
      // Normalizar fechas a ISO YYYY-MM-DD para el backend
      const normalizeToISO = (s?: string) => {
        if (!s) return '';
        const trimmed = s.trim();
        // ya en ISO
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        // permitir formatos con guiones o slashes: DD-MM-YYYY o DD/MM/YYYY
        const clean = trimmed.replace(/\//g, '-');
        const parts = clean.split('-').map(p => p.trim());
        if (parts.length === 3) {
          let [d, m, y] = parts;
          // si vino en formato YYYY-MM-DD accidentalmente
          if (d.length === 4 && y.length === 2) {
            // improbable, fallback
          }
          // asegurar dos dígitos
          d = d.padStart(2, '0');
          m = m.padStart(2, '0');
          // si el año tiene 2 dígitos, no lo convertimos aquí
          return `${y}-${m}-${d}`;
        }
        return trimmed;
      };

      const payload: FormData = {
        ...formData,
        start_date: normalizeToISO(formData.start_date),
        end_date: formData.is_current ? '' : normalizeToISO(formData.end_date),
      };

      await onSubmit(payload);
      showSuccess(
        `${formType === 'experience' ? 'Experiencia' : 'Educación'} ${isEditing ? 'Actualizada' : 'Creada'}`,
        `Se ha ${isEditing ? 'actualizado' : 'creado'} "${formData.title}" correctamente`
      );
      onClose();
    } catch (error) {
      showError('Error al Guardar', error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 'Enter') {
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Autofocus primer input cuando se renderiza dentro de ModalShell
  useEffect(() => {
    if (!useModalShell || !isOpen) return;
    try {
      const firstInput = formRef.current?.querySelector(
        'input, textarea, select'
      ) as HTMLElement | null;
      if (firstInput) firstInput.focus();
    } catch (e) {
      /* noop */
    }
  }, [useModalShell, isOpen]);

  if (!isOpen) return null;

  const isExperience = formType === 'experience';
  const formTitle = isEditing
    ? `Editar ${isExperience ? 'Experiencia' : 'Educación'}`
    : `Nueva ${isExperience ? 'Experiencia' : 'Educación'}`;

  // Contenido interno del formulario (sin overlay)
  // Cuando usamos ModalShell externo (`useModalShell`=true) renderizamos sólo
  // el contenido interior (form + footer) para evitar duplicar contenedores y scrolls.
  const innerForm = (
    <>
      {/* si estamos dentro de ModalShell, movemos el indicador de progreso aquí */}
      {useModalShell &&
        (() => {
          return (
            <div className={styles.progressIndicator}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${formProgress}%` }}></div>
              </div>
              <div>
                <span className={styles.progressText}>
                  {formProgress === 0
                    ? 'Completa este formulario para agregar tu experiencia'
                    : `Completado: ${formProgress}%`}
                </span>
              </div>
            </div>
          );
        })()}

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        {/* Información Básica */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-id-badge"></i>
            Información Básica
          </h3>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.label}>
                <i className={`fas ${isExperience ? 'fa-briefcase' : 'fa-graduation-cap'}`}></i>
                {isExperience ? 'Título del puesto' : 'Título o grado'} *
              </label>
              <input
                name="title"
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
                placeholder={
                  isExperience
                    ? 'Ej: Desarrollador Full Stack Senior'
                    : 'Ej: Grado en Ingeniería Informática'
                }
              />
              <div className={styles.helperText}>
                {isExperience
                  ? 'Especifica tu rol o cargo principal'
                  : 'Indica el nombre completo del título'}
              </div>
              {touchedFields.title && validationErrors.title && (
                <div className={styles.errorText}>
                  <i className="fas fa-exclamation-triangle"></i>
                  {validationErrors.title}
                </div>
              )}
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>
                <i className={`fas ${isExperience ? 'fa-building' : 'fa-university'}`}></i>
                {isExperience ? 'Empresa' : 'Institución'} *
              </label>
              <input
                name={isExperience ? 'company' : 'institution'}
                type="text"
                value={isExperience ? formData.company || '' : formData.institution || ''}
                onChange={e =>
                  handleFieldChange(isExperience ? 'company' : 'institution', e.target.value)
                }
                className={`${styles.input} ${
                  touchedFields[isExperience ? 'company' : 'institution'] &&
                  validationErrors[isExperience ? 'company' : 'institution']
                    ? styles.inputError
                    : touchedFields[isExperience ? 'company' : 'institution'] &&
                        !validationErrors[isExperience ? 'company' : 'institution']
                      ? styles.inputValid
                      : ''
                }`}
                placeholder={
                  isExperience ? 'Ej: TechCorp Solutions' : 'Ej: Universidad Tecnológica'
                }
              />
              <div className={styles.helperText}>
                {isExperience
                  ? 'Nombre de la empresa u organización'
                  : 'Nombre de la universidad o centro educativo'}
              </div>
              {touchedFields[isExperience ? 'company' : 'institution'] &&
                validationErrors[isExperience ? 'company' : 'institution'] && (
                  <div className={styles.errorText}>
                    <i className="fas fa-exclamation-triangle"></i>
                    {validationErrors[isExperience ? 'company' : 'institution']}
                  </div>
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

          <div className={styles.dateRangeContainer}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.label}>
                  <i className="fas fa-play"></i>
                  Fecha de inicio *
                </label>
                <div>
                  <DateInput
                    name="start_date"
                    value={formData.start_date}
                    onChange={v => handleFieldChange('start_date', v)}
                    placeholder="DD/MM/AAAA"
                    ariaLabel="Fecha de inicio (dd/mm/aaaa)"
                    disabled={false}
                  />
                  <div className={styles.helperText}>
                    Formato: DD/MM/AAAA — también puedes escribir la fecha manualmente.
                  </div>
                </div>
                {touchedFields.start_date && validationErrors.start_date && (
                  <div className={styles.errorText}>
                    <i className="fas fa-exclamation-triangle"></i>
                    {validationErrors.start_date}
                  </div>
                )}
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  <i className="fas fa-stop"></i>
                  Fecha de fin {!formData.is_current && '*'}
                </label>
                <div>
                  <DateInput
                    name="end_date"
                    value={formData.end_date}
                    onChange={v => handleFieldChange('end_date', v)}
                    placeholder={formData.is_current ? 'Actualidad' : 'DD/MM/AAAA'}
                    ariaLabel="Fecha de fin (dd/mm/aaaa)"
                    disabled={formData.is_current}
                  />
                </div>
                {touchedFields.end_date && validationErrors.end_date && (
                  <div className={styles.errorText}>
                    <i className="fas fa-exclamation-triangle"></i>
                    {validationErrors.end_date}
                  </div>
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
                {isExperience ? 'Trabajo actual' : 'Estudios en curso'}
              </label>
            </div>
          </div>
        </div>

        {/* Tecnologías (solo para experiencia) */}
        {isExperience && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-code"></i>
              Tecnologías y Herramientas
            </h3>

            <div className={styles.formField}>
              <label className={styles.label}>
                <i className="fas fa-tools"></i>
                Tecnologías utilizadas
              </label>

              <div className={styles.technologyContainer}>
                <input
                  name="technologies_input"
                  ref={techInputRef}
                  type="text"
                  value={technologyInput}
                  onChange={e => handleTechnologyInputChange(e.target.value)}
                  onKeyDown={handleTechnologyKeyDown}
                  onFocus={() => setShowTechSuggestions(technologyInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowTechSuggestions(false), 200)}
                  className={styles.technologyInput}
                  placeholder="Escribe y presiona Enter para agregar..."
                />

                {showTechSuggestions && getFilteredSuggestions().length > 0 && (
                  <div className={styles.suggestions}>
                    {getFilteredSuggestions().map(suggestion => (
                      <div
                        key={suggestion}
                        className={styles.suggestionItem}
                        onClick={() => handleTechnologyAdd(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedTechnologies.length > 0 && (
                <div className={styles.technologyChips}>
                  {selectedTechnologies.map((tech, index) => (
                    <span key={index} className={styles.chip}>
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleTechnologyRemove(index)}
                        className={styles.chipRemove}
                        aria-label={`Eliminar ${tech}`}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.helperText}>
                Agrega las tecnologías más relevantes de este puesto
              </div>
            </div>
          </div>
        )}

        {/* Calificación (solo para educación) */}
        {!isExperience && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-medal"></i>
              Detalles Académicos
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.label}>
                  <i className="fas fa-star"></i>
                  Calificación
                </label>
                <input
                  type="text"
                  value={formData.grade || ''}
                  onChange={e => handleFieldChange('grade', e.target.value)}
                  className={styles.input}
                  placeholder="Ej: Sobresaliente, 8.5/10, Matrícula de Honor"
                />
                <div className={styles.helperText}>
                  Nota media, mención o reconocimiento obtenido
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>
                  <i className="fas fa-sort-numeric-up"></i>
                  Orden de visualización
                </label>
                <input
                  type="number"
                  value={formData.order_index || 0}
                  onChange={e => handleFieldChange('order_index', e.target.value)}
                  className={styles.input}
                  min="0"
                  placeholder="0"
                />
                <div className={styles.helperText}>Número para ordenar la visualización</div>
              </div>
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-align-left"></i>
            Descripción y Detalles
          </h3>

          <div className={styles.formField}>
            <label className={styles.label}>
              <i className="fas fa-file-text"></i>
              Descripción
            </label>
            <div className={styles.textareaContainer}>
              <textarea
                name="description"
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                className={`${styles.textarea} ${touchedFields.description && validationErrors.description ? styles.textareaError : ''}`}
                rows={8}
                maxLength={500}
                placeholder={
                  isExperience
                    ? 'Describe tus responsabilidades, logros y proyectos destacados...'
                    : 'Describe la especialización, proyectos destacados, etc...'
                }
              />
              <div
                className={`${styles.characterCounter} ${formData.description.length > 450 ? styles.warning : formData.description.length > 480 ? styles.error : ''}`}
              >
                {formData.description.length}/500 caracteres
              </div>
            </div>
            {touchedFields.description && validationErrors.description && (
              <div className={styles.errorText}>
                <i className="fas fa-exclamation-triangle"></i>
                {validationErrors.description}
              </div>
            )}
            <div className={styles.helperText}>
              Máximo 500 caracteres. Enfócate en logros y responsabilidades clave
            </div>
          </div>
        </div>
      </form>

      {!useExternalFooter && (
        <div className={styles.stickyFooter}>
          <div className={styles.footerContent}>
            <div className={styles.saveIndicator}>
              {isSubmitting && (
                <>
                  <i className={`fas fa-spinner ${styles.spinning}`}></i>
                  Guardando cambios...
                </>
              )}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (() => {
                    // determinar estado habilitado según pasos
                    const isExp = formType === 'experience';
                    const titleOk = !validateField('title', formData.title);
                    const orgOk = !validateField(
                      isExp ? 'company' : 'institution',
                      isExp ? formData.company || '' : formData.institution || ''
                    );
                    const startOk = !validateField('start_date', formData.start_date);
                    const endOk = formData.is_current
                      ? true
                      : !validateField('end_date', formData.end_date);
                    const techOk = isExp ? selectedTechnologies.length > 0 : true;
                    const descOk = (formData.description || '').toString().trim().length >= 20;
                    return !(titleOk && orgOk && startOk && endOk && techOk && descOk);
                  })()
                }
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                {isSubmitting ? (
                  <>
                    <i className={`fas fa-spinner ${styles.spinning}`}></i>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    {isEditing
                      ? 'Guardar Cambios'
                      : `Crear ${isExperience ? 'Experiencia' : 'Educación'}`}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Indicadores de atajos */}
          <div className={styles.shortcuts}>
            <span>
              <kbd>Esc</kbd> Cerrar
            </span>
            <span>
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd> Guardar
            </span>
          </div>
        </div>
      )}
    </>
  );

  // Si el consumidor ya proporciona un ModalShell, devolvemos sólo el interior
  if (useModalShell) {
    return <div className={styles.innerWrapper}>{innerForm}</div>;
  }

  // Si no usamos ModalShell, renderizamos el overlay + nuestro propio container
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Header con progreso */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTop}>
            <button
              type="button"
              className={styles.backButton}
              onClick={onClose}
              aria-label="Cerrar formulario"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className={styles.modalTitle}>
              <i className={`fas ${isExperience ? 'fa-briefcase' : 'fa-graduation-cap'}`}></i>
              {formTitle}
            </h2>
          </div>
          <div className={styles.progressIndicator}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${formProgress}%` }}></div>
            </div>
            <div>
              <span className={styles.progressText}>
                {formProgress === 0
                  ? 'Completa este formulario para agregar tu experiencia'
                  : `Completado: ${formProgress}%`}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.modalContent}>{innerForm}</div>
      </div>
    </div>
  );
};

export default EnhancedExperienceForm;
