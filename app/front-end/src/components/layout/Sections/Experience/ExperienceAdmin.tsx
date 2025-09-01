// src/components/sections/experience/ExperienceAdmin.tsx

import React, { useState, useEffect, useRef } from 'react';
import type { Experience } from '@/types/api';
import { experiences as experiencesApi, education as educationApi } from '@/services/endpoints';
const { getExperiences, createExperience, updateExperience, deleteExperience } = experiencesApi;
const { getEducation, createEducation, updateEducation, deleteEducation } = educationApi;
import { useNotification } from '@/hooks/useNotification';
import { formatDateRange } from '@/utils/dateUtils';
import ModalShell from '@/components/ui/Modal/ModalShell';
import styles from './ExperienceAdmin.module.css';
import enhancedStyles from './components/forms/EnhancedExperienceForm.module.css';

interface Education {
  _id?: string; // ID de MongoDB
  id?: number | string; // Para compatibilidad con código antiguo
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
  order_index?: number;
}

interface ExperienceAdminProps {
  onClose: () => void;
}

const ExperienceAdmin: React.FC<ExperienceAdminProps> = ({ onClose }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [activeTab, setActiveTab] = useState<'experience' | 'education'>('experience');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'experience' | 'education'>('experience');
  const [saving, setSaving] = useState(false);
  const [technologyInput, setTechnologyInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsIndex, setSuggestionsIndex] = useState(-1);
  const { showSuccess, showError } = useNotification();

  // Referencias para funcionalidad avanzada
  const technologyInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Sugerencias de tecnologías comunes
  const technologySuggestions = [
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

  // Estados del formulario para experiencia
  const [experienceForm, setExperienceForm] = useState({
    title: '',
    company: '',
    header_image: '',
    logo_image: '',
    start_date: '',
    end_date: '',
    description: '',
    technologies: [] as string[],
    order_index: 0,
    is_current: false,
  });

  // Estados del formulario para educación
  const [educationForm, setEducationForm] = useState({
    title: '',
    institution: '',
    header_image: '',
    logo_image: '',
    start_date: '',
    end_date: '',
    description: '',
    grade: '',
    order_index: 0,
    is_current: false,
  });

  // Estados de validación
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string | undefined }>(
    {}
  );
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});

  const emptyExperienceForm = {
    title: '',
    company: '',
    header_image: '',
    logo_image: '',
    start_date: '',
    end_date: '',
    description: '',
    technologies: [] as string[],
    order_index: 0,
    is_current: false,
  };

  const emptyEducationForm = {
    title: '',
    institution: '',
    header_image: '',
    logo_image: '',
    start_date: '',
    end_date: '',
    description: '',
    grade: '',
    order_index: 0,
    is_current: false,
  };
  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await getExperiences();
      setExperiences(data);
    } catch (error) {
      console.error('Error cargando experiencias:', error);
      showError('Error', 'No se pudieron cargar las experiencias');
    } finally {
      setLoading(false);
    }
  };

  const loadEducation = async () => {
    try {
      setLoading(true);
      const data = await getEducation();
      setEducation(data);
    } catch (error) {
      console.error('Error cargando educación:', error);
      showError('Error', 'No se pudo cargar la información de educación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
    loadEducation();
  }, []);

  // ...existing code...

  // Función de validación
  const validateField = (name: string, value: string, isExperience: boolean = true) => {
    const errors: { [key: string]: string } = {};

    if (isExperience) {
      switch (name) {
        case 'title':
          if (!value.trim()) errors.title = 'El título del puesto es obligatorio';
          else if (value.length < 2) errors.title = 'El título debe tener al menos 2 caracteres';
          break;
        case 'company':
          if (!value.trim()) errors.company = 'El nombre de la empresa es obligatorio';
          else if (value.length < 2) errors.company = 'El nombre debe tener al menos 2 caracteres';
          break;
        case 'start_date':
          if (!value) errors.start_date = 'La fecha de inicio es obligatoria';
          break;
        case 'description':
          if (value.length > 500)
            errors.description = 'La descripción no puede exceder 500 caracteres';
          break;
      }
    } else {
      switch (name) {
        case 'title':
          if (!value.trim()) errors.title = 'El título o grado es obligatorio';
          else if (value.length < 2) errors.title = 'El título debe tener al menos 2 caracteres';
          break;
        case 'institution':
          if (!value.trim()) errors.institution = 'El nombre de la institución es obligatorio';
          else if (value.length < 2)
            errors.institution = 'El nombre debe tener al menos 2 caracteres';
          break;
        case 'start_date':
          if (!value) errors.start_date = 'La fecha de inicio es obligatoria';
          break;
        case 'description':
          if (value.length > 500)
            errors.description = 'La descripción no puede exceder 500 caracteres';
          break;
      }
    }

    return errors;
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Actualizar el formulario
    setExperienceForm(prev => ({
      ...prev,
      [name]: name === 'order_index' ? parseInt(value) || 0 : value,
    }));

    // Marcar el campo como tocado
    setTouchedFields(prev => ({ ...prev, [name]: true }));

    // Validar el campo
    const fieldErrors = validateField(name, value, true);
    setValidationErrors(prev => ({
      ...prev,
      ...fieldErrors,
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined }),
    }));
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Actualizar el formulario
    setEducationForm(prev => ({
      ...prev,
      [name]: name === 'order_index' ? parseInt(value) || 0 : value,
    }));

    // Marcar el campo como tocado
    setTouchedFields(prev => ({ ...prev, [name]: true }));

    // Validar el campo
    const fieldErrors = validateField(name, value, false);
    setValidationErrors(prev => ({
      ...prev,
      ...fieldErrors,
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined }),
    }));
  };

  // Función para obtener clases de validación
  const getValidationClasses = (fieldName: string) => {
    if (!touchedFields[fieldName]) return '';
    const hasError = validationErrors[fieldName];
    return hasError ? styles.invalid : styles.valid;
  };

  const handleTechnologyAdd = (tech: string) => {
    if (tech.trim() && !experienceForm.technologies.includes(tech.trim())) {
      setExperienceForm(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech.trim()],
      }));
      setTechnologyInput('');
      setShowSuggestions(false);
      setSuggestionsIndex(-1);
    }
  };

  const handleTechnologyRemove = (index: number) => {
    setExperienceForm(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const handleTechnologyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTechnologyInput(value);
    setShowSuggestions(value.length > 0);
    setSuggestionsIndex(-1);
  };

  const handleTechnologyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredSuggestions = getFilteredSuggestions();

    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestionsIndex >= 0 && filteredSuggestions[suggestionsIndex]) {
        handleTechnologyAdd(filteredSuggestions[suggestionsIndex]);
      } else if (technologyInput.trim()) {
        handleTechnologyAdd(technologyInput);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionsIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionsIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSuggestionsIndex(-1);
    }
  };

  const getFilteredSuggestions = () => {
    return technologySuggestions.filter(
      tech =>
        tech.toLowerCase().includes(technologyInput.toLowerCase()) &&
        !experienceForm.technologies.includes(tech)
    );
  };

  const handleCurrentToggle = (isExperience: boolean) => {
    if (isExperience) {
      setExperienceForm(prev => ({
        ...prev,
        is_current: !prev.is_current,
        end_date: !prev.is_current ? '' : prev.end_date,
      }));
    } else {
      setEducationForm(prev => ({
        ...prev,
        is_current: !prev.is_current,
        end_date: !prev.is_current ? '' : prev.end_date,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingType === 'experience') {
      await handleExperienceSubmit();
    } else {
      await handleEducationSubmit();
    }
  };

  const handleExperienceSubmit = async () => {
    if (
      !experienceForm.title.trim() ||
      !experienceForm.company.trim() ||
      !experienceForm.start_date.trim()
    ) {
      showError('Error de validación', 'Título, empresa y fecha de inicio son obligatorios');
      return;
    }

    try {
      setSaving(true);

      // Preparar campos básicos comunes para crear y actualizar
      const commonFields = {
        position: experienceForm.title,
        company: experienceForm.company,
        header_image: experienceForm.header_image || undefined,
        logo_image: experienceForm.logo_image || undefined,
        start_date: experienceForm.start_date,
        end_date: experienceForm.end_date || '',
        description: experienceForm.description,
        technologies: experienceForm.technologies,
        is_current: experienceForm.is_current,
        order_index: experienceForm.order_index || experiences.length,
      };

      if (editingId) {
        // Para actualizar, usamos Partial<Experience>
        await updateExperience(editingId, commonFields);
        showSuccess('Experiencia actualizada', 'Los cambios se han guardado correctamente');
      } else {
        // Para crear, necesitamos asegurar todos los campos requeridos
        const newExperience = {
          ...commonFields,
          user_id: '1', // En un caso real, obtendríamos este valor de forma dinámica
        };

        await createExperience(newExperience as any); // Usando 'as any' temporalmente para resolver problemas de tipo
        showSuccess('Experiencia creada', 'La nueva experiencia se ha añadido correctamente');
      }

      await loadExperiences();
      handleCloseForm();
    } catch (error) {
      console.error('Error guardando experiencia:', error);
      showError('Error', 'No se pudo guardar la experiencia');
    } finally {
      setSaving(false);
    }
  };

  const handleEducationSubmit = async () => {
    if (
      !educationForm.title.trim() ||
      !educationForm.institution.trim() ||
      !educationForm.start_date.trim()
    ) {
      showError('Error de validación', 'Título, institución y fecha de inicio son obligatorios');
      return;
    }

    try {
      setSaving(true);

      // Preparar datos para enviar a la API
      const educationData = {
        title: educationForm.title,
        institution: educationForm.institution,
        header_image: educationForm.header_image || undefined,
        logo_image: educationForm.logo_image || undefined,
        start_date: educationForm.start_date,
        end_date: educationForm.end_date || '',
        description: educationForm.description,
        grade: educationForm.grade,
        is_current: educationForm.is_current,
        order_index: educationForm.order_index || education.length,
        user_id: '1', // En un caso real, obtendríamos este valor de forma dinámica
      };

      console.log(
        'Preparado para guardar educación:',
        editingId ? 'actualizar' : 'crear',
        educationData
      );

      // Implementar API para educación
      if (editingId) {
        await updateEducation(parseInt(editingId), educationData);
        showSuccess('Educación actualizada', 'Los cambios se han guardado correctamente');
      } else {
        await createEducation(educationData);
        showSuccess('Nueva educación creada', 'La educación se ha creado correctamente');
      }

      // Recargar datos
      await loadEducation();
      handleCloseForm();
    } catch (error) {
      console.error('Error guardando educación:', error);
      showError('Error', 'No se pudo guardar la educación');
    } finally {
      setSaving(false);
    }
  };

  const handleEditExperience = (experience: Experience) => {
    setExperienceForm({
      title: experience.position,
      company: experience.company,
      header_image: (experience as any).header_image || '',
      logo_image: (experience as any).logo_image || '',
      start_date: experience.start_date,
      end_date: experience.end_date,
      description: experience.description || '',
      technologies: experience.technologies || [],
      order_index: experience.order_index,
      is_current: !experience.end_date || experience.end_date === 'Presente',
    });
    setEditingId(experience._id);
    setEditingType('experience');
    setShowForm(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEducationForm({
      title: edu.title,
      institution: edu.institution,
      header_image: (edu as any).header_image || '',
      logo_image: (edu as any).logo_image || '',
      start_date: edu.start_date,
      end_date: edu.end_date,
      description: edu.description || '',
      grade: edu.grade || '',
      order_index: edu.order_index || 0, // Usamos order_index o 0 por defecto
      is_current: !edu.end_date || edu.end_date === 'En curso',
    });
    setEditingId(edu._id || null);
    setEditingType('education');
    setShowForm(true);
  };

  const handleDeleteExperience = async (id: string, title: string) => {
    if (!id) {
      showError('Error', 'ID de experiencia no válido');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la experiencia "${title}"?`)) {
      return;
    }

    try {
      await deleteExperience(id);
      showSuccess('Experiencia eliminada', 'La experiencia se ha eliminado correctamente');
      await loadExperiences();
    } catch (error) {
      console.error('Error eliminando experiencia:', error);
      showError('Error', 'No se pudo eliminar la experiencia');
    }
  };

  const handleDeleteEducation = async (id: string | undefined, title: string) => {
    if (!id) {
      showError('Error', 'ID de educación no válido');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la educación "${title}"?`)) {
      return;
    }

    try {
      setSaving(true);
      await deleteEducation(id);
      showSuccess('Educación eliminada', 'La educación se ha eliminado correctamente');
      await loadEducation(); // Recargar la lista
    } catch (error) {
      console.error('Error eliminando educación:', error);
      showError('Error', 'No se pudo eliminar la educación');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setExperienceForm(emptyExperienceForm);
    setEducationForm(emptyEducationForm);
    setEditingId(null);
    // Reset technology input
    setTechnologyInput('');
    setShowSuggestions(false);
    setSuggestionsIndex(-1);
  };

  const handleNewItem = (type: 'experience' | 'education') => {
    if (type === 'experience') {
      setExperienceForm({
        ...emptyExperienceForm,
        order_index: experiences.length,
      });
    } else {
      setEducationForm({
        ...emptyEducationForm,
        order_index: education.length,
      });
    }
    setEditingId(null);
    setEditingType(type);
    setShowForm(true);
    // Reset technology input
    setTechnologyInput('');
    setShowSuggestions(false);
    setSuggestionsIndex(-1);
  };

  // Tipado local para los botones del ModalShell
  type ActionButton = {
    key?: string;
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    disabled?: boolean;
    ariaLabel?: string;
    submit?: boolean;
    formId?: string;
  };

  // Botones de acción delegados al ModalShell
  const actionButtons: ActionButton[] = showForm
    ? [
        {
          key: 'cancelForm',
          label: 'Cancelar',
          onClick: handleCloseForm,
          variant: 'ghost',
          disabled: saving,
        },
        {
          key: 'saveForm',
          label: editingId
            ? 'Guardar Cambios'
            : `Crear ${editingType === 'experience' ? 'Experiencia' : 'Educación'}`,
          submit: true,
          variant: 'primary',
          disabled: saving,
        },
      ]
    : [
        {
          key: 'newItem',
          label: `Nueva ${activeTab === 'experience' ? 'Experiencia' : 'Educación'}`,
          onClick: () => handleNewItem(activeTab),
          variant: 'primary',
        },
      ];

  // Función para convertir fecha "Mes Año" a número para ordenamiento
  const parseDate = (dateString: string | null | undefined): number => {
    // Validar que dateString no sea null, undefined o vacío
    if (!dateString || dateString.trim() === '') {
      return 0; // Valor por defecto para fechas inválidas
    }

    if (dateString === 'Presente') {
      return new Date().getFullYear() * 12 + new Date().getMonth();
    }

    // Si es solo año (formato legacy)
    if (/^\d{4}$/.test(dateString)) {
      return parseInt(dateString) * 12;
    }

    // Si es formato "Mes Año"
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const parts = dateString.split(' ');
    if (parts.length >= 2) {
      const [monthStr, yearStr] = parts;
      const monthIndex = months.indexOf(monthStr);
      const year = parseInt(yearStr);

      if (monthIndex !== -1 && !isNaN(year)) {
        return year * 12 + monthIndex;
      }
    }

    // Fallback: intentar parsear como año
    const fallbackYear = parseInt(dateString);
    return !isNaN(fallbackYear) ? fallbackYear * 12 : 0;
  };

  return (
    <ModalShell
      title="Administración de Trayectoria"
      onClose={onClose}
      maxWidth={1200}
      formRef={formRef}
      actionButtons={actionButtons}
    >
      <div className={styles.experienceAdminOverlay}>
        <div className={styles.experienceAdminModal}>
          {/* Tabs para experiencia y educación */}
          <div className={styles.adminTabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'experience' ? styles.active : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <i className="fas fa-briefcase"></i>
              Experiencia Laboral
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'education' ? styles.active : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <i className="fas fa-graduation-cap"></i>
              Formación Académica
            </button>
          </div>

          {/* admin-toolbar: acciones adicionales (el botón "Nueva" lo provee ModalShell ahora) */}
          <div className={styles.adminToolbar} />

          <div className={styles.adminContent}>
            {showForm ? (
              <div className={enhancedStyles.innerWrapper}>
                {/* Progress indicator (uses EnhancedExperienceForm styles) */}
                <div className={enhancedStyles.progressIndicator}>
                  <div className={enhancedStyles.progressBar}>
                    <div
                      className={enhancedStyles.progressFill}
                      style={{
                        width: `${
                          editingType === 'experience'
                            ? (((experienceForm.title ? 1 : 0) +
                                (experienceForm.company ? 1 : 0) +
                                (experienceForm.start_date ? 1 : 0) +
                                (experienceForm.description ? 1 : 0)) /
                                4) *
                              100
                            : (((educationForm.title ? 1 : 0) +
                                (educationForm.institution ? 1 : 0) +
                                (educationForm.start_date ? 1 : 0) +
                                (educationForm.description ? 1 : 0)) /
                                4) *
                              100
                        }%`,
                      }}
                    />
                  </div>
                  <div>
                    <span className={enhancedStyles.progressText}>
                      Completa este formulario para{' '}
                      {editingType === 'experience'
                        ? 'agregar tu experiencia'
                        : 'agregar tu educación'}
                    </span>
                  </div>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className={enhancedStyles.form}>
                  {editingType === 'experience' ? (
                    <>
                      <div className={enhancedStyles.formSection}>
                        <h3 className={enhancedStyles.sectionTitle}>
                          <i className="fas fa-info-circle"></i>
                          Información Básica
                        </h3>
                        <div className={enhancedStyles.formGrid}>
                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="exp-title">
                              <i className="fas fa-briefcase"></i>
                              Título del puesto *
                            </label>
                            <input
                              type="text"
                              id="exp-title"
                              name="title"
                              value={experienceForm.title}
                              onChange={handleExperienceChange}
                              className={`${enhancedStyles.input} ${getValidationClasses('title')}`}
                              required
                              placeholder="Ej: Desarrollador Full Stack Senior"
                            />
                            {touchedFields.title && validationErrors.title && (
                              <div className={enhancedStyles.errorText}>
                                <i className="fas fa-exclamation-triangle"></i>
                                {validationErrors.title}
                              </div>
                            )}
                          </div>

                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="exp-company">
                              <i className="fas fa-building"></i>
                              Empresa *
                            </label>
                            <input
                              type="text"
                              id="exp-company"
                              name="company"
                              value={experienceForm.company}
                              onChange={handleExperienceChange}
                              className={`${enhancedStyles.input} ${getValidationClasses('company')}`}
                              required
                              placeholder="Ej: TechCorp Solutions"
                            />
                            {touchedFields.company && validationErrors.company && (
                              <div className={enhancedStyles.errorText}>
                                <i className="fas fa-exclamation-triangle"></i>
                                {validationErrors.company}
                              </div>
                            )}
                          </div>

                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="exp-header">
                              <i className="fas fa-image"></i>
                              Imagen de cabecera (URL o public id)
                            </label>
                            <input
                              type="text"
                              id="exp-header"
                              name="header_image"
                              value={experienceForm.header_image}
                              onChange={handleExperienceChange}
                              className={enhancedStyles.input}
                              placeholder="Ej: companies/companie_header_abcd1234 o https://..."
                            />
                          </div>

                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="exp-logo">
                              <i className="fas fa-id-badge"></i>
                              Logo (URL o public id)
                            </label>
                            <input
                              type="text"
                              id="exp-logo"
                              name="logo_image"
                              value={experienceForm.logo_image}
                              onChange={handleExperienceChange}
                              className={enhancedStyles.input}
                              placeholder="Ej: companies/companie_logo_abcd1234 o https://..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className={enhancedStyles.formSection}>
                        <h3 className={enhancedStyles.sectionTitle}>
                          <i className="fas fa-clock"></i>
                          Período de Tiempo
                        </h3>
                        <div className={enhancedStyles.dateRangeContainer}>
                          <div className={enhancedStyles.formGrid}>
                            <div className={enhancedStyles.formField}>
                              <label className={enhancedStyles.label} htmlFor="exp-start">
                                <i className="fas fa-play"></i>
                                Fecha de inicio *
                              </label>
                              <input
                                type="month"
                                id="exp-start"
                                name="start_date"
                                value={experienceForm.start_date}
                                onChange={handleExperienceChange}
                                className={enhancedStyles.input}
                                required
                              />
                            </div>
                            <div className={enhancedStyles.formField}>
                              <label className={enhancedStyles.label} htmlFor="exp-end">
                                <i className="fas fa-stop"></i>
                                Fecha de fin
                              </label>
                              <input
                                type="month"
                                id="exp-end"
                                name="end_date"
                                value={experienceForm.end_date}
                                onChange={handleExperienceChange}
                                className={enhancedStyles.input}
                                disabled={experienceForm.is_current}
                                placeholder={experienceForm.is_current ? 'Actualidad' : ''}
                              />
                            </div>
                          </div>
                          <div className={enhancedStyles.currentToggle}>
                            <input
                              type="checkbox"
                              id="exp-current"
                              checked={experienceForm.is_current}
                              onChange={() => handleCurrentToggle(true)}
                              className={enhancedStyles.checkbox}
                            />
                            <label htmlFor="exp-current" className={enhancedStyles.checkboxLabel}>
                              Trabajo actual
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className={enhancedStyles.formSection}>
                        <h3 className={enhancedStyles.sectionTitle}>
                          <i className="fas fa-align-left"></i>
                          Descripción y Responsabilidades
                        </h3>
                        <div className={enhancedStyles.formField}>
                          <label className={enhancedStyles.label} htmlFor="exp-description">
                            <i className="fas fa-file-text"></i>
                            Descripción
                          </label>
                          <div className={enhancedStyles.textareaContainer}>
                            <textarea
                              id="exp-description"
                              name="description"
                              value={experienceForm.description}
                              onChange={handleExperienceChange}
                              className={`${enhancedStyles.textarea} ${getValidationClasses('description')}`}
                              rows={5}
                              maxLength={500}
                              placeholder="Describe tus responsabilidades, logros y proyectos destacados en este puesto..."
                            />
                            <div className={enhancedStyles.characterCounter}>
                              {experienceForm.description.length}/500 caracteres
                            </div>
                            {touchedFields.description && validationErrors.description && (
                              <div className={enhancedStyles.errorText}>
                                <i className="fas fa-exclamation-triangle"></i>
                                {validationErrors.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={enhancedStyles.formSection}>
                        <h3 className={enhancedStyles.sectionTitle}>
                          <i className="fas fa-code"></i>
                          Tecnologías y Herramientas
                        </h3>
                        <div className={enhancedStyles.formField}>
                          <label className={enhancedStyles.label}>
                            <i className="fas fa-tools"></i>
                            Tecnologías utilizadas
                          </label>
                          <div
                            className={enhancedStyles.technologyContainer}
                            style={{ position: 'relative' }}
                          >
                            <input
                              ref={technologyInputRef}
                              type="text"
                              value={technologyInput}
                              onChange={handleTechnologyInputChange}
                              onKeyDown={handleTechnologyKeyDown}
                              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                              onFocus={() => setShowSuggestions(technologyInput.length > 0)}
                              className={enhancedStyles.technologyInput}
                              placeholder="Escribe y presiona Enter para agregar tecnologías..."
                            />
                            {experienceForm.technologies.length > 0 && (
                              <div className={enhancedStyles.technologyChips}>
                                {experienceForm.technologies.map((tech, index) => (
                                  <div key={index} className={enhancedStyles.chip}>
                                    {tech}
                                    <button
                                      type="button"
                                      onClick={() => handleTechnologyRemove(index)}
                                      className={enhancedStyles.chipRemove}
                                    >
                                      <i className="fas fa-times" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {showSuggestions && getFilteredSuggestions().length > 0 && (
                              <div ref={suggestionsRef} className={enhancedStyles.suggestions}>
                                {getFilteredSuggestions().map((suggestion, index) => (
                                  <div
                                    key={suggestion}
                                    className={enhancedStyles.suggestionItem}
                                    onClick={() => handleTechnologyAdd(suggestion)}
                                    style={
                                      index === suggestionsIndex
                                        ? { background: 'var(--md-surface-variant)' }
                                        : undefined
                                    }
                                  >
                                    {suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={enhancedStyles.helperText}>
                            Agrega las tecnologías más relevantes de este puesto
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Educación - reutiliza las mismas clases */}
                      <div className={enhancedStyles.formSection}>
                        <h3 className={enhancedStyles.sectionTitle}>
                          <i className="fas fa-info-circle"></i>
                          Información Básica
                        </h3>
                        <div className={enhancedStyles.formGrid}>
                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="edu-title">
                              <i className="fas fa-graduation-cap"></i>
                              Título o Grado *
                            </label>
                            <input
                              type="text"
                              id="edu-title"
                              name="title"
                              value={educationForm.title}
                              onChange={handleEducationChange}
                              className={`${enhancedStyles.input} ${getValidationClasses('title')}`}
                              required
                              placeholder="Ej: Grado en Ingeniería Informática"
                            />
                            {touchedFields.title && validationErrors.title && (
                              <div className={enhancedStyles.errorText}>
                                <i className="fas fa-exclamation-triangle"></i>
                                {validationErrors.title}
                              </div>
                            )}
                          </div>

                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="edu-institution">
                              <i className="fas fa-university"></i>
                              Institución *
                            </label>
                            <input
                              type="text"
                              id="edu-institution"
                              name="institution"
                              value={educationForm.institution}
                              onChange={handleEducationChange}
                              className={`${enhancedStyles.input} ${getValidationClasses('institution')}`}
                              required
                              placeholder="Ej: Universidad Tecnológica"
                            />
                            {touchedFields.institution && validationErrors.institution && (
                              <div className={enhancedStyles.errorText}>
                                <i className="fas fa-exclamation-triangle"></i>
                                {validationErrors.institution}
                              </div>
                            )}
                          </div>

                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="edu-header">
                              <i className="fas fa-image"></i>
                              Imagen de cabecera (URL o public id)
                            </label>
                            <input
                              type="text"
                              id="edu-header"
                              name="header_image"
                              value={educationForm.header_image}
                              onChange={handleEducationChange}
                              className={enhancedStyles.input}
                              placeholder="Ej: schools/uca_qooynm o https://..."
                            />
                          </div>

                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="edu-logo">
                              <i className="fas fa-id-badge"></i>
                              Logo (URL o public id)
                            </label>
                            <input
                              type="text"
                              id="edu-logo"
                              name="logo_image"
                              value={educationForm.logo_image}
                              onChange={handleEducationChange}
                              className={enhancedStyles.input}
                              placeholder="Ej: UCA-Logo_ws2n5i o https://..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className={enhancedStyles.formSection}>
                        <h3 className={enhancedStyles.sectionTitle}>
                          <i className="fas fa-calendar-alt"></i>
                          Período de Tiempo
                        </h3>
                        <div className={enhancedStyles.dateRangeContainer}>
                          <div className={enhancedStyles.formGrid}>
                            <div className={enhancedStyles.formField}>
                              <label className={enhancedStyles.label} htmlFor="edu-start">
                                <i className="fas fa-play"></i>
                                Fecha de inicio *
                              </label>
                              <input
                                type="month"
                                id="edu-start"
                                name="start_date"
                                value={educationForm.start_date}
                                onChange={handleEducationChange}
                                className={enhancedStyles.input}
                                required
                              />
                            </div>
                            <div className={enhancedStyles.formField}>
                              <label className={enhancedStyles.label} htmlFor="edu-end">
                                <i className="fas fa-stop"></i>
                                Fecha de fin
                              </label>
                              <input
                                type="month"
                                id="edu-end"
                                name="end_date"
                                value={educationForm.end_date}
                                onChange={handleEducationChange}
                                className={enhancedStyles.input}
                                disabled={educationForm.is_current}
                                placeholder={educationForm.is_current ? 'En curso' : ''}
                              />
                            </div>
                          </div>
                          <div className={enhancedStyles.currentToggle}>
                            <input
                              type="checkbox"
                              id="edu-current"
                              checked={educationForm.is_current}
                              onChange={() => handleCurrentToggle(false)}
                              className={enhancedStyles.checkbox}
                            />
                            <label htmlFor="edu-current" className={enhancedStyles.checkboxLabel}>
                              Estudios en curso
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className={enhancedStyles.formSection}>
                        <h3 className={enhancedStyles.sectionTitle}>
                          <i className="fas fa-medal"></i>
                          Detalles Académicos
                        </h3>
                        <div className={enhancedStyles.formGrid}>
                          <div className={enhancedStyles.formField}>
                            <label className={enhancedStyles.label} htmlFor="edu-grade">
                              <i className="fas fa-star"></i>
                              Calificación
                            </label>
                            <input
                              type="text"
                              id="edu-grade"
                              name="grade"
                              value={educationForm.grade}
                              onChange={handleEducationChange}
                              className={enhancedStyles.input}
                              placeholder="Ej: Sobresaliente, 8.5/10, Matrícula de Honor"
                            />
                          </div>
                        </div>
                        <div className={enhancedStyles.formField}>
                          <label className={enhancedStyles.label} htmlFor="edu-description">
                            <i className="fas fa-file-text"></i>
                            Descripción
                          </label>
                          <div className={enhancedStyles.textareaContainer}>
                            <textarea
                              id="edu-description"
                              name="description"
                              value={educationForm.description}
                              onChange={handleEducationChange}
                              className={enhancedStyles.textarea}
                              rows={4}
                              maxLength={500}
                              placeholder="Describe la especialización, proyectos destacados, etc..."
                            />
                            <div className={enhancedStyles.characterCounter}>
                              {educationForm.description.length}/500 caracteres
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </form>
              </div>
            ) : loading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <>
                {/* Panel de Experiencia */}
                {activeTab === 'experience' && (
                  <>
                    {experiences.length === 0 ? (
                      <div className={styles.emptyState}>
                        <i className="fas fa-briefcase"></i>
                        <h3>No hay experiencias</h3>
                        <p>Añade la primera experiencia laboral usando el botón de arriba.</p>
                      </div>
                    ) : (
                      <div className={styles.itemsList}>
                        {experiences
                          .sort((a, b) => {
                            const dateA = parseDate(a.end_date);
                            const dateB = parseDate(b.end_date);
                            return dateB - dateA; // Ordenamiento descendente por fecha de fin (más reciente primero)
                          })
                          .map(experience => (
                            <div key={experience._id} className={styles.adminItemCard}>
                              <div className={styles.itemHeader}>
                                <div className={styles.itemInfo}>
                                  <h3>{experience.position}</h3>
                                  <p className={styles.company}>{experience.company}</p>
                                  <p className={styles.date}>
                                    <i className="fas fa-calendar-alt"></i>
                                    {formatDateRange(experience.start_date, experience.end_date)}
                                  </p>
                                  {experience.technologies &&
                                    experience.technologies.length > 0 && (
                                      <div className={styles.adminItemTechnologies}>
                                        <div className={styles.adminTechLabel}>
                                          <i className="fas fa-code"></i>
                                          Tecnologías usadas
                                        </div>
                                        <div className={styles.adminTechList}>
                                          {experience.technologies.map((tech, index) => (
                                            <span key={index} className={styles.adminTechTag}>
                                              {tech}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>

                              <div className={styles.itemActions}>
                                <button
                                  className={`${styles.actionBtn} ${styles.editBtn}`}
                                  onClick={() => handleEditExperience(experience)}
                                >
                                  <i className="fas fa-edit"></i>
                                  Editar
                                </button>
                                <button
                                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                  onClick={() =>
                                    handleDeleteExperience(experience._id, experience.position)
                                  }
                                >
                                  <i className="fas fa-trash"></i>
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}

                {/* Panel de Educación */}
                {activeTab === 'education' && (
                  <>
                    {education.length === 0 ? (
                      <div className={styles.emptyState}>
                        <i className="fas fa-graduation-cap"></i>
                        <h3>No hay formación académica</h3>
                        <p>Añade la primera formación académica usando el botón de arriba.</p>
                      </div>
                    ) : (
                      <div className={styles.itemsList}>
                        {education.map(edu => (
                          <div key={edu._id || edu.id} className={styles.adminItemCard}>
                            <div className={styles.itemHeader}>
                              <div className={styles.itemInfo}>
                                <h3>{edu.title}</h3>
                                <p className={styles.institution}>{edu.institution}</p>
                                <p className={styles.date}>
                                  <i className="fas fa-calendar-alt"></i>
                                  {formatDateRange(edu.start_date, edu.end_date)}
                                </p>
                                {edu.grade && (
                                  <p className={styles.grade}>
                                    <i className="fas fa-medal"></i>
                                    {edu.grade}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className={styles.itemActions}>
                              <button
                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                onClick={() => handleEditEducation(edu)}
                              >
                                <i className="fas fa-edit"></i>
                                Editar
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                onClick={() => handleDeleteEducation(edu._id, edu.title)}
                              >
                                <i className="fas fa-trash"></i>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default ExperienceAdmin;
