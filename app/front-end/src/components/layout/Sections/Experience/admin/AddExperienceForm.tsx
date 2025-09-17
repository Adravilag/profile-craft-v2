// admin/AddExperienceForm.tsx - Componente unificado que siempre usa ModalShell

import React, { useState, useEffect, useRef } from 'react';
import type { Experience } from '@/types/api';
import { experiences as experiencesApi } from '@/services/endpoints';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/contexts/TranslationContext';
import SkillPill from '@/components/ui/SkillPill/SkillPill';
import { resolvePillFromTech } from '@/features/skills/utils/pillUtils';
import CalendarPicker from '@/components/ui/Calendar/CalendarPicker';
import styles from './AddExperienceForm.module.css';

interface FormData {
  title: string;
  company: string; // Solo company, no institution
  start_date: string;
  end_date: string;
  description: string;
  technologies?: string | string[];
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

// (La carga de sugerencias se realiza dentro del componente más abajo.)

const AddExperienceForm: React.FC<AddExperienceFormProps> = ({
  editingExperience,
  onSave,
  onCancel,
  initialData = {},
  onSubmit,
  formRef: externalFormRef,
  useModalShell = false,
  onFormDataChange,
  onValidationErrorsChange,
  onSelectedTechnologiesChange,
}) => {
  const { showSuccess, showError } = useNotification();
  const { t } = useTranslation();

  // Sugerencias de tecnologías cargadas desde el JSON público
  type SkillItem = { name: string; slug: string; category?: string; color?: string; svg?: string };
  const [technologySuggestions, setTechnologySuggestions] = useState<SkillItem[]>([]);

  // Cargar sugerencias desde `/skill_settings.json` al montar el componente
  useEffect(() => {
    let mounted = true;

    const loadSuggestions = async () => {
      try {
        const res = await fetch('/skill_settings.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          // Mapear a SkillItem y eliminar duplicados por nombre
          const items: SkillItem[] = data
            .map((item: any) => ({
              name: item?.name ? String(item.name) : '',
              slug: item?.slug ? String(item.slug) : String(item?.name || ''),
              category: item?.category ? String(item.category) : undefined,
              color: item?.color ? String(item.color) : undefined,
              svg: item?.svg ? String(item.svg) : undefined,
            }))
            .filter(i => i.name)
            .reduce((acc: SkillItem[], it) => {
              if (!acc.find(a => a.name === it.name)) acc.push(it);
              return acc;
            }, [] as SkillItem[])
            .sort((a, b) => a.name.localeCompare(b.name));

          setTechnologySuggestions(items);

          // Extraer categorías
          const cats = Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];
          cats.sort();
          setCategories(['all', ...cats]);
        }
      } catch (e) {
        // Si falla la carga, dejar el array vacío (sin fallback hardcodeado)
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development')
          console.warn(
            'No se pudieron cargar las sugerencias de tecnologías desde /skill_settings.json:',
            e
          );
      }
    };

    loadSuggestions();
    return () => {
      mounted = false;
    };
  }, []);

  // Estados del formulario - Simplificado para experiencia únicamente
  const [formData, setFormData] = useState<FormData>(() => ({
    title: editingExperience?.position || initialData.title || '',
    company: editingExperience?.company || initialData.company || '',
    start_date: editingExperience?.start_date || initialData.start_date || '',
    end_date: editingExperience?.end_date || initialData.end_date || '',
    description: editingExperience?.description || initialData.description || '',
    // No normalizamos aquí: mantenemos el valor tal cual viene (string o array)
    technologies: editingExperience?.technologies ?? initialData.technologies ?? '',
    order_index: editingExperience?.order_index || initialData.order_index || 0,
    is_current: initialData.is_current || false,
  }));

  // Si cambia `editingExperience` o `initialData` (por ejemplo al abrir el modal para editar),
  // re-inicializar el state del formulario para reflejar los nuevos datos.
  useEffect(() => {
    setFormData({
      title: editingExperience?.position || initialData.title || '',
      company: editingExperience?.company || initialData.company || '',
      start_date: editingExperience?.start_date || initialData.start_date || '',
      end_date: editingExperience?.end_date || initialData.end_date || '',
      description: editingExperience?.description || initialData.description || '',
      // Mantener el tipo original (string o array) proveniente del editingExperience o initialData
      technologies: editingExperience?.technologies ?? initialData.technologies ?? '',
      order_index: editingExperience?.order_index || initialData.order_index || 0,
      is_current: initialData.is_current || false,
    });
  }, [editingExperience, initialData]);

  // Estados de validación y UX - Sin barra de progreso (delegada a ModalShell)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Dropdown / búsqueda de tecnologías
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<SkillItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Referencias
  const localFormRef = useRef<HTMLFormElement | null>(null);
  const formRef = externalFormRef ?? localFormRef;
  const techInputRef = useRef<HTMLInputElement>(null);

  // Inicializar tecnologías seleccionadas
  useEffect(() => {
    // Cuando formData.technologies cambia, lo inicializamos como objetos SkillItem
    const buildSelected = () => {
      if (!formData.technologies) return [] as SkillItem[];
      let techArray: string[] = [];
      if (Array.isArray(formData.technologies)) techArray = formData.technologies.filter(Boolean);
      else if (typeof formData.technologies === 'string')
        techArray = formData.technologies
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);

      // Mapear nombres a objetos disponibles en technologySuggestions por name o slug
      const mapped: SkillItem[] = techArray.map(name => {
        const found = technologySuggestions.find(
          i =>
            i.name.toLowerCase() === name.toLowerCase() ||
            i.slug.toLowerCase() === name.toLowerCase()
        );
        if (found) return found;
        // Fallback: crear objeto con slug simple
        return {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          category: undefined,
          color: undefined,
        };
      });
      setSelectedTechnologies(mapped.filter(Boolean));
    };

    buildSelected();
  }, [formData.technologies]);

  // Cuando cambian las sugerencias (carga del JSON) intentar reconciliar technologies existentes
  useEffect(() => {
    if (!technologySuggestions || technologySuggestions.length === 0) return;
    if (!formData.technologies) return;
    // Re-run mapping to pick up slugs/colors
    let techArray: string[] = [];
    if (typeof formData.technologies === 'string') {
      techArray = formData.technologies
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(formData.technologies)) {
      techArray = (formData.technologies as unknown as string[]).filter(Boolean);
    }
    const mapped = techArray.map(name => {
      const found = technologySuggestions.find(
        i =>
          i.name.toLowerCase() === name.toLowerCase() || i.slug.toLowerCase() === name.toLowerCase()
      );
      if (found) return found;
      return {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        category: undefined,
        color: undefined,
      };
    });
    setSelectedTechnologies(mapped.filter(Boolean));
  }, [technologySuggestions]);

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
      // Notificar solo slugs para compatibilidad con consumidores que esperan strings
      const slugs = selectedTechnologies.map(s => s.slug || s.name);
      onSelectedTechnologiesChange(slugs);
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
        // Accept both DD-MM-YYYY and YYYY-MM (month picker)
        if (!/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value) && !/^\d{4}-\d{2}$/.test(value))
          return t.forms.validation.invalidDateFormat;
        break;
      case 'end_date':
        if (!value && !formData.is_current) return t.forms.validation.endDateRequired;
        if (
          value &&
          !/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.test(value) &&
          !/^\d{4}-\d{2}$/.test(value)
        )
          return t.forms.validation.invalidDateFormat;
        break;
      case 'description':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.trim().length < 20) return 'La descripción debe tener al menos 20 caracteres';
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
  const handleTechnologyAdd = (input: SkillItem | string) => {
    // Normalize to SkillItem
    let item: SkillItem | undefined;
    if (typeof input === 'string') {
      const name = input.trim();
      if (!name) return;
      item = technologySuggestions.find(
        i =>
          i.name.toLowerCase() === name.toLowerCase() || i.slug.toLowerCase() === name.toLowerCase()
      );
      if (!item)
        item = {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          category: undefined,
          color: undefined,
        };
    } else {
      item = input;
    }

    if (!item) return;
    if (selectedTechnologies.find(s => s.slug === item!.slug)) return;

    const newTechnologies = [...selectedTechnologies, item];
    setSelectedTechnologies(newTechnologies);
    setFormData(prev => ({ ...prev, technologies: newTechnologies.map(n => n.slug).join(', ') }));
    setSearchTerm('');
    setDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleTechnologyRemove = (index: number) => {
    const newSel = selectedTechnologies.filter((_, i) => i !== index);
    setSelectedTechnologies(newSel);
    setFormData(prev => ({ ...prev, technologies: newSel.map(n => n.slug).join(', ') }));
  };

  const handleTechnologyRemoveBySlug = (slug: string) => {
    const newSel = selectedTechnologies.filter(tech => tech.slug !== slug);
    setSelectedTechnologies(newSel);
    setFormData(prev => ({ ...prev, technologies: newSel.map(n => n.slug).join(', ') }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setDropdownOpen(value.length > 0 || true);
    setHighlightedIndex(-1);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    const suggestions = getFilteredSuggestions();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      setDropdownOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleTechnologyAdd(suggestions[highlightedIndex]);
      } else if (searchTerm.trim()) {
        // If user typed a custom string, create a simple SkillItem
        handleTechnologyAdd(searchTerm.trim());
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  // Filtrar sugerencias
  const getFilteredSuggestions = (): SkillItem[] => {
    const q = searchTerm.trim().toLowerCase();
    return (
      technologySuggestions
        .filter(item => {
          if (!item) return false;
          if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
          if (selectedTechnologies.some(s => s.name === item.name || s.slug === item.slug))
            return false;
          if (!q) return true;
          return (
            item.name.toLowerCase().includes(q) ||
            (item.slug && item.slug.toLowerCase().includes(q))
          );
        })
        // Si no hay búsqueda y estamos en 'all', mostrar todo (o un número alto)
        .slice(0, selectedCategory === 'all' && !q ? 200 : 8)
    );
  };

  // Validar todo el formulario
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    // Campos obligatorios para experiencia únicamente
    const requiredFields = [
      { name: 'title', value: formData.title },
      { name: 'company', value: formData.company },
      { name: 'start_date', value: formData.start_date },
      { name: 'description', value: formData.description },
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
        const parseFlexible = (s: string) => {
          // Accept 'DD-MM-YYYY' or 'YYYY-MM' or ISO-like
          if (/^\d{4}-\d{2}$/.test(s)) {
            const [y, m] = s.split('-');
            return new Date(Number(y), Number(m) - 1, 1);
          }
          const clean = s.replace(/\//g, '-');
          const parts = clean.split('-');
          if (parts.length === 3) {
            const [d, m, y] = parts;
            return new Date(Number(y), Number(m) - 1, Number(d));
          }
          // Fallback to Date constructor
          return new Date(s);
        };
        try {
          const sd = parseFlexible(formData.start_date);
          const ed = parseFlexible(formData.end_date);
          if (ed < sd) {
            errors.end_date = t.forms.validation.endDateMustBeAfterStart;
          }
        } catch (e) {
          /* noop */
        }
      }
    }

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
        // Normalizar fechas a ISO (YYYY-MM-DD) antes de enviar
        const { convertSpanishDateToISO } = await import('@/utils/dateUtils');
        const startIso = convertSpanishDateToISO(formData.start_date);
        const endIso = formData.end_date ? convertSpanishDateToISO(formData.end_date) : '';

        const experienceData = {
          position: formData.title,
          company: formData.company,
          start_date: startIso,
          end_date: endIso,
          description: formData.description,
          // Enviar slugs de tecnologías seleccionadas
          technologies:
            selectedTechnologies && selectedTechnologies.length > 0
              ? selectedTechnologies.map(t => t.slug)
              : [],
          is_current: formData.is_current || endIso === '' || /presente/i.test(endIso),
          order_index: formData.order_index,
          user_id: '1', // Por ahora fijo
        };

        if (editingExperience?._id) {
          await experiencesApi.updateExperience(editingExperience._id, experienceData);
          showSuccess(t.forms.notifications.experienceUpdated, t.forms.notifications.updateSuccess);
        } else {
          // Unconditional console log of payload so it's visible in DevTools
          // además de usar debugLog si está activado
          // eslint-disable-next-line no-console
          try {
            const { debugLog } = await import('@/utils/debugConfig');
            debugLog.api('📤 Payload createExperience:', experienceData);
          } catch (e) {
            /* noop */
          }

          await experiencesApi.createExperience(experienceData as any);
          showSuccess('Nueva Experiencia', t.forms.notifications.createSuccess);
        }

        // Disparar evento para refrescar datos
        window.dispatchEvent(new CustomEvent('experience-changed'));
      }

      onSave();
    } catch (error: any) {
      console.error('Error al guardar:', error);

      // Log request payload present in axios error config (si existe)
      try {
        // eslint-disable-next-line no-console
        console.error('Axios error.config.data:', error?.config?.data);
      } catch (e) {
        /* noop */
      }

      // Si el backend devuelve body con detalles, mostrarlo
      const backendDetails = error?.response?.data;
      if (backendDetails) {
        console.error('Backend error details:', backendDetails);
        showError(t.forms.notifications.saveError, JSON.stringify(backendDetails));
      } else {
        showError(
          t.forms.notifications.saveError,
          error instanceof Error ? error.message : t.forms.notifications.unknownError
        );
      }
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
                <CalendarPicker
                  initial={formData.start_date ? new Date(formData.start_date) : null}
                  onSelect={ym => handleFieldChange('start_date', ym ? String(ym) : '')}
                  placeholder="DD-MM-YYYY"
                  className={styles.input}
                  id="start_date"
                  name="start_date"
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
                <CalendarPicker
                  initial={formData.end_date ? new Date(formData.end_date) : null}
                  onSelect={ym => handleFieldChange('end_date', ym ? String(ym) : '')}
                  disabled={formData.is_current}
                  placeholder="DD-MM-YYYY"
                  className={styles.input}
                  id="end_date"
                  name="end_date"
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
                <div className={styles.dropdownHeader}>
                  <select
                    aria-label={'Categoría'}
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className={styles.categorySelect}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'Todas' : cat}
                      </option>
                    ))}
                  </select>
                  <input
                    name="technologies_input"
                    id="technologies_input"
                    ref={techInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={e => handleSearchChange(e.target.value)}
                    onKeyDown={handleDropdownKeyDown}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    className={styles.technologyInput}
                    placeholder={t.forms.experience.technologiesPlaceholder}
                    aria-expanded={dropdownOpen}
                    aria-controls="tech-suggestions-list"
                  />

                  {dropdownOpen && getFilteredSuggestions().length > 0 && (
                    <div className={styles.suggestions} role="listbox" id="tech-suggestions-list">
                      {getFilteredSuggestions().map((tech, idx) => (
                        <div
                          key={tech.slug || tech.name}
                          role="option"
                          aria-selected={highlightedIndex === idx}
                          className={`${styles.suggestionItem} ${highlightedIndex === idx ? styles.highlighted : ''}`}
                          onMouseDown={() => handleTechnologyAdd(tech)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                          {tech.svg ? (
                            <img
                              src={`/assets/svg/${tech.svg}`}
                              alt={`${tech.name} icon`}
                              className={styles.icon}
                              onError={(e: any) => {
                                // fallback to public root if asset not found
                                e.currentTarget.src = `/${tech.svg}`;
                              }}
                            />
                          ) : (
                            <span
                              className={styles.colorDot}
                              style={{ backgroundColor: tech.color || '#ddd' }}
                            />
                          )}
                          <span className={styles.suggestionName}>{tech.name}</span>
                          <span className={styles.suggestionCategory}>{tech.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedTechnologies.length > 0 && (
                <div className={styles.technologyChips}>
                  {selectedTechnologies.map((tech, index) => {
                    const pill = resolvePillFromTech(tech, technologySuggestions, index);

                    return (
                      <SkillPill
                        key={pill.slug || index}
                        slug={pill.slug}
                        svg={pill.svg}
                        name={pill.name}
                        colored={true}
                        closable={true}
                        onClose={handleTechnologyRemoveBySlug}
                        className={styles.skillChip}
                        color={pill.color}
                      />
                    );
                  })}
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
