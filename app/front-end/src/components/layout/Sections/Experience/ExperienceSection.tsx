import React, { useEffect, useState, useCallback } from 'react';
import { experiences as experiencesApi, education as educationApi } from '@/services/endpoints';
const { getExperiences, createExperience, updateExperience, deleteExperience } = experiencesApi;
const { getEducation, createEducation, updateEducation, deleteEducation } = educationApi;
import type { Experience, Education } from '@/types/api';
import { useTimelineAnimation } from '@/hooks/useTimelineAnimation';
import { useNotificationContext } from '@/contexts';
import { convertSpanishDateToISO, formatDateRange } from '@/utils/dateUtils';
import HeaderSection from '../../HeaderSection/HeaderSection';
import styles from './ExperienceSection.module.css';
import ExperienceCard from './components/cards/ExperienceCard';
import EducationCard from './components/cards/EducationCard';
import ChronologicalItem from './components/items/ChronologicalItem';
import { FloatingActionButton, AdminModal } from '@/ui';
import { useFab } from '@/contexts/FabContext';
import ExperienceModal from './components/ExperienceModal';

interface ExperienceSectionProps {
  className?: string;
  showAdminFAB?: boolean;
  onAdminClick?: () => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  className,
  showAdminFAB = false,
  onAdminClick,
}) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'traditional' | 'chronological'>('traditional');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeAdminSection, setActiveAdminSection] = useState<'experience' | 'education'>(
    'experience'
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'experience' | 'education' | null>(null);
  const [experienceForm, setExperienceForm] = useState<any>({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: '',
    technologies: '',
    order_index: 0,
  });
  const [educationForm, setEducationForm] = useState<any>({
    title: '',
    institution: '',
    start_date: '',
    end_date: '',
    description: '',
    grade: '',
    order_index: 0,
  });
  // educationForm already defined above when initializing component state
  const { showSuccess, showError } = useNotificationContext();
  const timelineRef = useTimelineAnimation();

  // Helper para resolver nombres de clase desde CSS Modules.
  // Intenta variantes kebab-case y camelCase porque la convención de export puede variar.
  const resolveStyle = (key: string) => {
    if (!key) return '';
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    // comprobar varias variantes y devolver la primera encontrada
    return (
      (styles as any)[key] ||
      (styles as any)[camel] ||
      (styles as any)[key.replace(/-/g, '_')] ||
      ''
    );
  };

  const cx = (...keys: Array<string | null | undefined | false>) =>
    keys
      .map(k => (typeof k === 'string' ? resolveStyle(k) : ''))
      .filter(Boolean)
      .join(' ');

  // Función para cargar educación
  const loadEducation = useCallback(async () => {
    try {
      const data = await getEducation();
      setEducation(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading education:', err);
      // En caso de error, establecer array vacío para evitar errores de renderizado
      setEducation([]);
      showError('Error', 'No se pudo cargar la información de educación');
    }
  }, [showError]);

  // Función para reintentar la carga de experiencias
  const retryLoadExperiences = useCallback(async () => {
    if (retryCount >= 3) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getExperiences();
      setExperiences(data);
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      setRetryCount(prev => prev + 1);
      setError(`Error al cargar experiencias (Intento ${retryCount + 1}/3)`);
      setLoading(false);

      // Auto-retry después de 2 segundos si no hemos alcanzado el límite
      if (retryCount < 2) {
        setTimeout(() => retryLoadExperiences(), 2000);
      }
    }
  }, [retryCount]);

  // Efecto mejorado para cargar experiencias y educación
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar experiencias y educación en paralelo
        const [experiencesData, educationData] = await Promise.allSettled([
          getExperiences(),
          getEducation(),
        ]);

        // Procesar experiencias
        if (experiencesData.status === 'fulfilled') {
          setExperiences(Array.isArray(experiencesData.value) ? experiencesData.value : []);
        } else {
          console.error('Error loading experiences:', experiencesData.reason);
          setExperiences([]); // Asegurar que siempre sea un array
          setError('Usando datos de ejemplo para experiencias (API no disponible)');
        }

        // Procesar educación
        if (educationData.status === 'fulfilled') {
          setEducation(Array.isArray(educationData.value) ? educationData.value : []);
        } else {
          console.error('Error loading education:', educationData.reason);
          setEducation([]); // Asegurar que siempre sea un array
          // Llamar a loadEducation que maneja los datos mock
          await loadEducation();
          if (!error) {
            setError('Usando datos de ejemplo para educación (API no disponible)');
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar datos');
        setLoading(false);
      }
    };

    loadData();
  }, [loadEducation]); // Función para cambiar modo de vista
  const handleViewModeChange = useCallback((mode: 'traditional' | 'chronological') => {
    setViewMode(mode);
  }, []);
  // Funciones de manejo para administración
  const handleEditExperience = (experience: Experience) => {
    setExperienceForm({
      title: experience.position,
      company: experience.company,
      start_date: experience.start_date, // Mantener formato original de la API
      end_date: experience.end_date, // Mantener formato original de la API
      description: experience.description || '',
      technologies: experience.technologies?.join(', ') || '',
      order_index: experience.order_index,
    });
    setEditingId(experience._id);
    setEditingType('experience');
    setShowForm(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEducationForm({
      title: edu.title,
      institution: edu.institution,
      start_date: edu.start_date, // Mantener formato original de la API
      end_date: edu.end_date, // Mantener formato original de la API
      description: edu.description || '',
      grade: edu.grade || '',
      order_index: edu.order_index || 0,
    });
    setEditingId(edu.id?.toString() || '');
    setEditingType('education');
    setShowForm(true);
  };

  const handleDeleteExperience = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la experiencia "${title}"?`)) {
      return;
    }

    try {
      await deleteExperience(id);

      // Actualizar el estado local eliminando el elemento
      setExperiences(prev => (Array.isArray(prev) ? prev.filter(exp => exp._id !== id) : []));

      showSuccess('Experiencia Eliminada', `Se ha eliminado "${title}" correctamente`);
    } catch (error) {
      console.error('Error eliminando experiencia:', error);
      showError('Error', 'No se pudo eliminar la experiencia laboral');
    }
  };

  const handleDeleteEducation = async (id: number | string, title: string) => {
    if (!id) {
      showError('Error', 'ID de educación no válido');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la formación "${title}"?`)) {
      return;
    }

    try {
      // Convertir ID a string para la API y limpiar cualquier caracter extra
      const cleanId = String(id).trim();
      console.log('🗑️ Eliminando educación con ID:', cleanId);
      console.log('🔍 Tipo de ID original:', typeof id, 'Valor:', id);

      await deleteEducation(cleanId);

      // Actualizar el estado local eliminando el elemento
      setEducation(prev =>
        Array.isArray(prev)
          ? prev.filter(edu => {
              const eduId = edu._id || edu.id;
              return eduId !== id && eduId !== cleanId && String(eduId) !== cleanId;
            })
          : []
      );

      showSuccess('Formación Eliminada', `Se ha eliminado "${title}" correctamente`);
    } catch (error) {
      console.error('Error eliminando educación:', error);
      showError('Error', 'No se pudo eliminar la formación académica');
    }
  };
  const handleNewItem = () => {
    clearForms(); // Limpiar formularios antes de crear nuevo
    setEditingId(null);
    setEditingType(activeAdminSection);
    setShowForm(true);
  };

  // Registrar handler para que el FAB global pueda abrir el formulario de nueva experiencia/educación
  const { onOpenExperienceModal } = useFab();
  useEffect(() => {
    const unregister = onOpenExperienceModal(handleNewItem);
    return unregister;
  }, [onOpenExperienceModal, handleNewItem]);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingType(null);
    clearForms(); // Limpiar formularios al cerrar
  };

  // Funciones de administración para el modal común
  const renderExperienceList = () => {
    if (!Array.isArray(experiences) || experiences.length === 0) {
      return (
        <div className={styles.adminEmpty}>
          <i className="fas fa-briefcase"></i>
          <h3>No hay experiencias</h3>
          <p>Añade la primera experiencia laboral usando el botón flotante.</p>
        </div>
      );
    }

    return (
      <div className={styles.adminItemsList}>
        {experiences
          .sort((a, b) => {
            const dateA = parseDate(a.end_date);
            const dateB = parseDate(b.end_date);
            return dateB - dateA; // Ordenamiento descendente por fecha de fin (más reciente primero)
          })
          .map(experience => (
            <div key={experience._id} className={styles.adminItemCard}>
              <div className={styles.adminItemHeader}>
                <div className={styles.adminItemImage}>
                  <div className={styles.adminItemIcon}>
                    <i className="fas fa-briefcase"></i>
                  </div>
                </div>
                <div className={styles.adminItemInfo}>
                  <h3 className={styles.adminItemTitle}>{experience.position}</h3>
                  <p className={styles.adminItemSubtitle}>{experience.company}</p>{' '}
                  <div className={styles.adminExpMetadata}>
                    <div className={styles.adminItemDate}>
                      <i className="fas fa-calendar-alt"></i>
                      <span>{formatDateRange(experience.start_date, experience.end_date)}</span>
                    </div>
                  </div>
                  {experience.description && (
                    <div className={styles.adminItemDescription}>
                      <p>
                        {experience.description.length > 100
                          ? `${experience.description.substring(0, 100)}...`
                          : experience.description}
                      </p>
                    </div>
                  )}
                  {experience.technologies && experience.technologies.length > 0 && (
                    <div className={styles.adminItemTechnologies}>
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
              <div className={styles.adminItemActions}>
                <button
                  className={styles.adminBtnSecondary}
                  onClick={() => handleEditExperience(experience)}
                >
                  <i className="fas fa-edit"></i>
                  Editar
                </button>
                <button
                  className={styles.adminBtnDanger}
                  onClick={() => handleDeleteExperience(experience._id, experience.position)}
                >
                  <i className="fas fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
      </div>
    );
  };
  const renderEducationList = () => {
    if (!Array.isArray(education) || education.length === 0) {
      return (
        <div className={styles.adminEmpty}>
          <i className="fas fa-graduation-cap"></i>
          <h3>No hay formación académica</h3>
          <p>Añade la primera formación académica usando el botón flotante.</p>
        </div>
      );
    }

    return (
      <div className={styles.adminItemsList}>
        {education
          .sort((a, b) => {
            const dateA = parseDate(a.end_date);
            const dateB = parseDate(b.end_date);
            return dateB - dateA; // Ordenamiento descendente por fecha de fin (más reciente primero)
          })
          .map(edu => (
            <div key={edu._id || edu.id} className={styles.adminItemCard}>
              <div className={styles.adminItemHeader}>
                <div className={styles.adminItemImage}>
                  <div className={styles.adminItemIcon}>
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                </div>
                <div className={styles.adminItemInfo}>
                  <h3 className={styles.adminItemTitle}>{edu.title}</h3>
                  <p className={styles.adminItemSubtitle}>{edu.institution}</p>
                  <div className={styles.adminEduMetadata}>
                    <div className={styles.adminItemDate}>
                      <i className="fas fa-calendar-alt"></i>
                      <span>{formatDateRange(edu.start_date, edu.end_date)}</span>
                    </div>
                    {edu.grade && (
                      <div className={styles.adminItemGrade}>
                        <i className="fas fa-medal"></i>
                        <span>{edu.grade}</span>
                      </div>
                    )}
                  </div>
                  {edu.description && (
                    <div className={styles.adminItemDescription}>
                      <p>
                        {edu.description.length > 100
                          ? `${edu.description.substring(0, 100)}...`
                          : edu.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.adminItemActions}>
                <button
                  className={styles.adminBtnSecondary}
                  onClick={() => handleEditEducation(edu)}
                >
                  <i className="fas fa-edit"></i>
                  Editar
                </button>
                <button
                  className={styles.adminBtnDanger}
                  onClick={() => {
                    const eduId = edu._id || edu.id;
                    console.log('🎯 Educación seleccionada para eliminar:', {
                      eduId,
                      title: edu.title,
                      eduObject: edu,
                    });

                    if (eduId) {
                      handleDeleteEducation(eduId, edu.title);
                    } else {
                      console.error('❌ No se encontró ID válido para la educación:', edu);
                      showError('Error', 'No se puede eliminar: ID de educación no válido');
                    }
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
      </div>
    );
  }; // Función para convertir fecha "Mes Año" a número para ordenamiento
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

  // Función para manejar el envío del formulario mejorado
  const handleEnhancedFormSubmit = async (formData: any) => {
    try {
      const isExperience = editingType === 'experience';

      if (isExperience) {
        const experienceData = {
          position: formData.title, // La API espera 'position' no 'title'
          company: formData.company,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description,
          technologies: formData.technologies
            ? formData.technologies
                .split(',')
                .map((tech: string) => tech.trim())
                .filter((tech: string) => tech)
            : [],
          is_current: formData.end_date === '' || formData.end_date === 'Presente',
          order_index: formData.order_index,
          user_id: '1', // Por ahora fijo, se debe obtener del contexto de auth cuando esté implementado
        };

        if (editingId) {
          // Actualizar experiencia existente usando API
          const updatedExperience = await updateExperience(editingId, experienceData);
          const updatedExperiences = experiences.map(exp =>
            exp._id === editingId ? { ...exp, ...updatedExperience } : exp
          );
          setExperiences(updatedExperiences);
          showSuccess(
            'Experiencia Actualizada',
            `Se ha actualizado "${experienceData.position}" correctamente`
          );
        } else {
          // Crear nueva experiencia usando API
          const newExperience = await createExperience(experienceData as any);
          setExperiences([...experiences, newExperience]);
          showSuccess(
            'Nueva Experiencia Creada',
            `Se ha creado "${newExperience.position}" correctamente`
          );
        }
      } else {
        // Manejar educación
        const educationData = {
          title: formData.title,
          institution: formData.institution,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description,
          grade: formData.grade,
          order_index: formData.order_index,
          user_id: 1, // Por ahora fijo, se debe obtener del contexto de auth cuando esté implementado
        };

        if (editingId) {
          // Actualizar educación existente
          const updatedEducation = await updateEducation(parseInt(editingId), educationData);
          const updatedEducationList = (Array.isArray(education) ? education : []).map(edu => {
            const eduId = (edu._id || edu.id)?.toString();
            return eduId === editingId ? { ...edu, ...updatedEducation } : edu;
          });
          setEducation(updatedEducationList);
          showSuccess(
            'Educación Actualizada',
            `Se ha actualizado "${educationData.title}" correctamente`
          );
        } else {
          // Crear nueva educación
          const newEducation = await createEducation(educationData);
          setEducation([...(Array.isArray(education) ? education : []), newEducation]);
          showSuccess(
            'Nueva Formación Académica Creada',
            `Se ha creado "${newEducation.title}" correctamente`
          );
        }
      }

      // Limpiar formulario y cerrar
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const isExperience = editingType === 'experience';
      showError(
        'Error al Guardar',
        `No se pudo guardar ${isExperience ? 'la experiencia' : 'la educación'}: ${errorMessage}`
      );
    }
  };

  // Función para limpiar formularios
  const clearForms = () => {
    setExperienceForm({
      title: '',
      company: '',
      start_date: '',
      end_date: '',
      description: '',
      technologies: '',
      order_index: 0,
    });

    setEducationForm({
      title: '',
      institution: '',
      start_date: '',
      end_date: '',
      description: '',
      grade: '',
      order_index: 0,
    });
  };

  // Función para renderizar formulario usando el formulario mejorado
  const renderForm = () => {
    const isExperience = editingType === 'experience';
    const formData = isExperience ? experienceForm : educationForm;

    // Preparar datos iniciales para el formulario mejorado
    const processDateForForm = (dateStr: string) => {
      if (!dateStr) return '';
      if (/^\d{4}-\d{2}(-\d{2})?$/.test(dateStr)) return dateStr;
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateStr))
        return convertSpanishDateToISO(dateStr);
      return convertSpanishDateToISO(dateStr);
    };

    const initialData = {
      title: formData.title,
      company: isExperience ? experienceForm.company : undefined,
      institution: !isExperience ? educationForm.institution : undefined,
      start_date: processDateForForm(formData.start_date),
      end_date: processDateForForm(formData.end_date),
      description: formData.description,
      technologies: isExperience ? experienceForm.technologies : undefined,
      grade: !isExperience ? educationForm.grade : undefined,
      order_index: formData.order_index,
      is_current: formData.end_date === 'Actualmente' || formData.end_date === 'Presente',
    };

    return (
      <ExperienceModal
        isOpen={true}
        onClose={handleCloseForm}
        formType={editingType as 'experience' | 'education'}
        initialData={initialData}
        isEditing={!!editingId}
        onSubmit={handleEnhancedFormSubmit}
      />
    );
  };

  // Función para renderizar el contenido de administración
  const renderAdminContent = () => {
    if (showForm) {
      return renderForm();
    }

    if (activeAdminSection === 'experience') {
      return renderExperienceList();
    } else {
      return renderEducationList();
    }
  };

  // Estados de carga y error mejorados
  if (loading) {
    return (
      <div className={`${styles.sectionCv} ${className || ''}`}>
        <div className={styles.experienceLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando experiencia y formación...</p>
          <div className={styles.loadingDetails}>
            <small>Obteniendo datos del servidor...</small>
          </div>
        </div>
      </div>
    );
  }

  if (error && experiences.length === 0) {
    return (
      <div className={`${styles.sectionCv} ${className || ''}`}>
        <div className={styles.experienceError}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={retryLoadExperiences}
            disabled={retryCount >= 3}
          >
            <i className="fas fa-redo"></i>
            {retryCount >= 3 ? 'Límite de reintentos alcanzado' : 'Reintentar'}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`${styles.sectionCv} ${className || ''}`} id="experience">
      <HeaderSection
        icon="fas fa-route"
        title="Trayectoria Profesional"
        subtitle="Un recorrido por mi experiencia laboral y formación académica, mostrando las tecnologías y logros más relevantes."
        className={styles.experienceHeader}
        showNotification={!!(error && experiences.length > 0)}
        notificationMessage={error || undefined}
        notificationIcon="fas fa-info-circle"
      />
      <div className={styles.sectionContainer} ref={timelineRef}>
        {/* Botones de Vista mejorados */}
        <div className={styles.viewToggleContainer}>
          <button
            className={[
              'btn',
              cx('view-toggle-btn'),
              viewMode === 'traditional'
                ? cx('view-toggle-btn-active')
                : cx('view-toggle-btn-inactive'),
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleViewModeChange('traditional')}
            aria-label="Vista por categorías"
          >
            <i className="fas fa-columns"></i>
            <span>Vista por Categorías</span>
          </button>
          <button
            className={[
              'btn',
              cx('view-toggle-btn'),
              viewMode === 'chronological'
                ? cx('view-toggle-btn-active')
                : cx('view-toggle-btn-inactive'),
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleViewModeChange('chronological')}
            aria-label="Vista cronológica"
          >
            <i className="fas fa-clock"></i>
            <span>Vista Cronológica</span>
          </button>
        </div>
        {/* Estadísticas rápidas */}
        <div className={styles.experienceStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{experiences.length}</span>
            <span className={styles.statLabel}>Experiencias</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {Array.isArray(education) ? education.length : 0}
            </span>
            <span className={styles.statLabel}>Certificaciones</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {Array.isArray(experiences)
                ? experiences.reduce((acc, exp) => acc + (exp.technologies?.length || 0), 0)
                : 0}
            </span>
            <span className={styles.statLabel}>Tecnologías</span>
          </div>
        </div>
        {/* Vista Tradicional - 2 Columnas con Componentes Modulares */}
        {viewMode === 'traditional' && (
          <div className={`${styles.experienceGrid} ${styles.traditionalView}`}>
            {/* Columna de Experiencia Laboral */}
            <div className={styles.experienceColumn}>
              <div className={styles.columnHeader}>
                <div className={styles.columnIcon}>
                  <i className="fas fa-briefcase"></i>
                </div>
                <h3 className={`${styles.columnTitle} ${styles.strongContrast}`}>
                  Experiencia Laboral
                </h3>
              </div>

              <div className={styles.timelineContainer}>
                {Array.isArray(experiences) ? (
                  experiences
                    .sort((a, b) => {
                      const dateA = a.end_date ? parseDate(a.end_date) : 0;
                      const dateB = b.end_date ? parseDate(b.end_date) : 0;
                      return dateB - dateA;
                    })
                    .map((exp, index) => (
                      <ExperienceCard key={exp._id} experience={exp} index={index} />
                    ))
                ) : (
                  <div>Cargando experiencias...</div>
                )}
              </div>
            </div>

            {/* Columna de Educación */}
            <div className={styles.educationColumn}>
              <div className={styles.columnHeader}>
                <div className={styles.columnIcon}>
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 className={`${styles.columnTitle} ${styles.strongContrast}`}>
                  Formación Académica
                </h3>
              </div>
              <div className={styles.timelineContainer}>
                {(Array.isArray(education) ? education : [])
                  .sort((a, b) => {
                    const dateA = parseDate(a.end_date);
                    const dateB = parseDate(b.end_date);
                    return dateB - dateA;
                  })
                  .map((edu, index) => (
                    <EducationCard
                      key={edu._id || edu.id || index}
                      education={edu}
                      index={index + (Array.isArray(experiences) ? experiences.length : 0)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
        {/* Vista Cronológica - Timeline Unificado */}
        {viewMode === 'chronological' && (
          <div className={styles.chronologicalView}>
            <div className={styles.chronologicalTimeline}>
              <div className={styles.timelineLine}></div>

              {/* Timeline unificado con todas las experiencias y educación */}
              {(() => {
                // Combinar experiencias y educación
                const combinedItems: any[] = [
                  ...(Array.isArray(experiences) ? experiences : []).map(exp => ({
                    _id: exp._id,
                    title: exp.position, // En experiencias, el título es 'position'
                    start_date: exp.start_date,
                    end_date: exp.end_date,
                    description: exp.description,
                    type: 'experience' as const,
                    company: exp.company,
                    technologies: exp.technologies,
                  })),
                  ...(Array.isArray(education) ? education : []).map(edu => ({
                    _id: (edu._id || edu.id)?.toString() || '', // Convertir ID a string
                    id: typeof edu.id === 'number' ? edu.id : undefined,
                    title: edu.title,
                    start_date: edu.start_date,
                    end_date: edu.end_date,
                    description: edu.description,
                    type: 'education' as const,
                    institution: edu.institution,
                    grade: edu.grade,
                  })),
                ];

                // Ordenar por fecha de fin (de mayor a menor - más reciente primero)
                const sortedItems = combinedItems.sort((a, b) => {
                  // Validar que las fechas existan antes de intentar parsearlas
                  const dateA = a.end_date ? parseDate(a.end_date) : 0;
                  const dateB = b.end_date ? parseDate(b.end_date) : 0;
                  return dateB - dateA; // Ordenamiento descendente (más reciente primero)
                });

                return sortedItems.map((item, index) => (
                  <ChronologicalItem
                    key={`${item.type}-${item._id || String(item.id)}`}
                    item={item}
                    index={index}
                    position={index % 2 === 0 ? 'left' : 'right'}
                  />
                ));
              })()}
            </div>
          </div>
        )}
      </div>
      {/* Modal de administración */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Administración de Trayectoria"
        icon="fas fa-route"
        maxWidth="1300px"
        height="88vh"
        tabs={[
          {
            id: 'experience',
            label: 'Experiencia Laboral',
            icon: 'fas fa-briefcase',
            content: null,
          },
          {
            id: 'education',
            label: 'Formación Académica',
            icon: 'fas fa-graduation-cap',
            content: null,
          },
        ]}
        activeTab={activeAdminSection}
        onTabChange={(tabId: string) => setActiveAdminSection(tabId as 'experience' | 'education')}
        showTabs={true}
        floatingActions={
          showForm
            ? [
                {
                  id: 'cancel-form',
                  label: 'Cancelar',
                  icon: 'fas fa-times',
                  onClick: handleCloseForm,
                  variant: 'secondary',
                },
                {
                  id: 'save-form',
                  label: editingId
                    ? 'Guardar Cambios'
                    : `Crear ${activeAdminSection === 'experience' ? 'Experiencia' : 'Educación'}`,
                  icon: 'fas fa-save',
                  onClick: () => {
                    const form = document.querySelector('.admin-form') as HTMLFormElement;
                    if (form) {
                      form.requestSubmit();
                    }
                  },
                  variant: 'primary',
                },
              ]
            : [
                {
                  id: 'new-item',
                  label: `Nueva ${activeAdminSection === 'experience' ? 'Experiencia' : 'Educación'}`,
                  icon: 'fas fa-plus',
                  onClick: handleNewItem,
                  variant: 'primary',
                },
              ]
        }
      >
        {showAdminModal && (
          <div className={styles.adminContentWrapper}>
            {' '}
            {/* Contenido principal */}
            <div className={styles.adminMainContent}>{renderAdminContent()}</div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default ExperienceSection;
