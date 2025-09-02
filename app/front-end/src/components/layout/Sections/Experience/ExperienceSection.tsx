import React, { useEffect, useState, useCallback } from 'react';
import { useExperienceSection } from '@/hooks/useExperienceSection';
import type { Experience, Education } from '@/types/api';
import { useTimelineAnimation } from '@/hooks/useTimelineAnimation';
import { useNotificationContext } from '@/contexts';
import { useTranslation } from '@/contexts/TranslationContext';
import { convertSpanishDateToISO, formatDateRange } from '@/utils/dateUtils';
import HeaderSection from '../../HeaderSection/HeaderSection';
import styles from './ExperienceSection.module.css';
import ExperienceCard from './components/cards/ExperienceCard';
import EducationCard from './components/cards/EducationCard';
import ChronologicalItem from './components/items/ChronologicalItem';
import { useFab } from '@/contexts/FabContext';
import { useAuth } from '@/contexts';
import { useModal } from '@/contexts/ModalContext';
import FormModal from './components/FormModal';

interface ExperienceSectionProps {
  className?: string;
  showAdminFAB?: boolean;
  onAdminClick?: () => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ className }) => {
  const { t } = useTranslation();
  const { openModal, closeModal } = useModal();
  const { showSuccess, showError } = useNotificationContext();
  const timelineRef = useTimelineAnimation();

  // Usar el hook unificado de experiencia
  const {
    experiences,
    education,
    chronologicalData,
    loading,
    error,
    retryCount,
    stats,
    createExperience,
    updateExperience,
    removeExperience,
    retryExperiences,
    createEducation,
    updateEducation,
    removeEducation,
    refreshAll,
  } = useExperienceSection();

  // Estados para UI y administración
  const [viewMode, setViewMode] = useState<'traditional' | 'chronological'>('traditional');
  const [showForm, setShowForm] = useState(false);
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
  const handleViewModeChange = useCallback((mode: 'traditional' | 'chronological') => {
    setViewMode(mode);
  }, []);

  // Funciones de manejo para administración usando los hooks
  const handleEditExperience = async (experience: Experience) => {
    console.log('handleEditExperience llamado con:', experience);
    try {
      const mod = await import('./components/FormModal');
      const FormModalComp = mod.default;

      const modalContent = React.createElement(FormModalComp, {
        isOpen: true,
        onClose: () => {
          closeModal('edit-experience');
          // Refrescar datos después de la edición
          refreshAll();
        },
        formType: 'experience',
        isEditing: true,
        initialData: experience,
        onSubmit: async (data: any) => {
          console.log('Actualizando experiencia:', data);
          // Aquí iría la lógica de actualización
          closeModal('edit-experience');
          refreshAll();
        },
      });

      console.log('Abriendo modal edit-experience');
      openModal('edit-experience', modalContent, {
        title: 'Editar Experiencia',
        disableAutoFocus: true,
      });
    } catch (err) {
      console.error('Error al abrir modal de edición de experiencia:', err);
    }
  };

  const handleEditEducation = async (edu: Education) => {
    console.log('handleEditEducation llamado con:', edu);
    try {
      const mod = await import('./components/FormModal');
      const FormModalComp = mod.default;

      const modalContent = React.createElement(FormModalComp, {
        isOpen: true,
        onClose: () => {
          closeModal('edit-education');
          // Refrescar datos después de la edición
          refreshAll();
        },
        formType: 'education',
        isEditing: true,
        initialData: edu,
        onSubmit: async (data: any) => {
          console.log('Actualizando educación:', data);
          // Aquí iría la lógica de actualización
          closeModal('edit-education');
          refreshAll();
        },
      });

      console.log('Abriendo modal edit-education');
      openModal('edit-education', modalContent, {
        title: 'Editar Educación',
        disableAutoFocus: true,
      });
    } catch (err) {
      console.error('Error al abrir modal de edición de educación:', err);
    }
  };

  const handleAddEducation = async () => {
    console.log('handleAddEducation llamado');
    try {
      const mod = await import('./components/FormModal');
      const FormModalComp = mod.default;

      const modalContent = React.createElement(FormModalComp, {
        isOpen: true,
        onClose: () => {
          closeModal('add-education');
          // Refrescar datos después de la creación
          refreshAll();
        },
        formType: 'education',
        isEditing: false,
        onSubmit: async (data: any) => {
          console.log('Creando nueva educación:', data);
          // Aquí iría la lógica de creación
          closeModal('add-education');
          refreshAll();
        },
      });

      console.log('Abriendo modal add-education');
      openModal('add-education', modalContent, {
        title: 'Nueva Educación',
        disableAutoFocus: true,
      });
    } catch (err) {
      console.error('Error al abrir modal de nueva educación:', err);
    }
  };

  const handleAddExperience = async () => {
    console.log('handleAddExperience llamado');
    try {
      const mod = await import('./components/FormModal');
      const FormModalComp = mod.default;

      const modalContent = React.createElement(FormModalComp, {
        isOpen: true,
        onClose: () => {
          closeModal('add-experience');
          // Refrescar datos después de la creación
          refreshAll();
        },
        formType: 'experience',
        isEditing: false,
        onSubmit: async (data: any) => {
          console.log('Creando nueva experiencia:', data);
          // Aquí iría la lógica de creación
          closeModal('add-experience');
          refreshAll();
        },
      });

      console.log('Abriendo modal add-experience');
      openModal('add-experience', modalContent, {
        title: 'Nueva Experiencia',
        disableAutoFocus: true,
      });
    } catch (err) {
      console.error('Error al abrir modal de nueva experiencia:', err);
    }
  };

  // Función para manejar edición desde vista cronológica (puede ser experiencia o educación)
  const handleEditCombined = (item: any) => {
    console.log('handleEditCombined llamado con:', item);
    if (!item) return;

    if (item.type === 'experience') {
      // Convertir el item a formato Experience
      const experience: Experience = {
        _id: item._id,
        id: item.id,
        position: item.title,
        company: item.company,
        start_date: item.start_date,
        end_date: item.end_date,
        description: item.description,
        technologies: item.technologies,
        is_current: item.is_current,
        order_index: item.order_index,
        user_id: item.user_id || '1',
      };
      handleEditExperience(experience);
    } else if (item.type === 'education') {
      // Convertir el item a formato Education
      const education: Education = {
        _id: item._id,
        id: item.id,
        title: item.title,
        institution: item.institution,
        start_date: item.start_date,
        end_date: item.end_date,
        description: item.description,
        grade: item.grade,
        order_index: item.order_index,
      };
      handleEditEducation(education);
    }
  };

  // Handler combinado para eliminación desde la vista cronológica
  const handleDeleteCombined = (item: any) => {
    if (!item) return;

    if (item.type === 'experience') {
      const id = item._id || item.id;
      const title = item.title || item.company || 'Experiencia';
      if (id) handleDeleteExperience(id, title);
    } else if (item.type === 'education') {
      const id = item._id || item.id;
      const title = item.title || item.institution || 'Educación';
      if (id) handleDeleteEducation(id, title);
    }
  };

  // Usar los hooks para eliminar
  const handleDeleteExperience = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la experiencia "${title}"?`)) {
      return;
    }

    try {
      await removeExperience(id, title);
    } catch (error) {
      console.error('Error eliminando experiencia:', error);
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
      await removeEducation(id, title);
    } catch (error) {
      console.error('Error eliminando educación:', error);
    }
  };
  const handleNewItem = () => {
    clearForms(); // Limpiar formularios antes de crear nuevo
    setEditingId(null);
    setEditingType(null);
    setShowForm(true);
  };

  // Registrar handler para que el FAB global pueda abrir el formulario de nueva experiencia/educación
  const { onOpenExperienceModal } = useFab();
  const { isAuthenticated } = useAuth();
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
          <h3>{t.experience.admin.noExperiences}</h3>
          <p>{t.experience.admin.noExperiencesDesc}</p>
        </div>
      );
    }

    return (
      <div className={styles.adminItemsList}>
        {experiences
          .sort((a, b) => {
            // Ordenamiento simple por fecha de fin descendente
            const dateA = new Date(a.end_date || '').getTime() || 0;
            const dateB = new Date(b.end_date || '').getTime() || 0;
            return dateB - dateA;
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
                  {t.experience.admin.edit}
                </button>
                <button
                  className={styles.adminBtnDanger}
                  onClick={() => handleDeleteExperience(experience._id, experience.position)}
                >
                  <i className="fas fa-trash"></i>
                  {t.experience.admin.delete}
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
          <h3>{t.experience.admin.noEducation}</h3>
          <p>{t.experience.admin.noEducationDesc}</p>
          <button className={styles.addButton} onClick={handleAddEducation}>
            <i className="fas fa-plus"></i>
            Añadir Primera Educación
          </button>
        </div>
      );
    }

    return (
      <div className={styles.adminItemsList}>
        {education
          .sort((a, b) => {
            // Ordenamiento simple por fecha de fin descendente
            const dateA = new Date(a.end_date || '').getTime() || 0;
            const dateB = new Date(b.end_date || '').getTime() || 0;
            return dateB - dateA;
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
                  {t.experience.admin.edit}
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
                  {t.experience.admin.delete}
                </button>
              </div>
            </div>
          ))}
        <div className={styles.addNewContainer}>
          <button className={styles.addNewButton} onClick={handleAddEducation}>
            <i className="fas fa-plus"></i>
            Añadir Nueva Educación
          </button>
        </div>
      </div>
    );
  };

  // Función para manejar el envío del formulario usando los hooks
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
          // Actualizar experiencia existente usando hook
          await updateExperience(editingId, experienceData);
          showSuccess(
            'Experiencia Actualizada',
            `Se ha actualizado "${experienceData.position}" correctamente`
          );
        } else {
          // Crear nueva experiencia usando hook
          await createExperience(experienceData as any);
          showSuccess(
            'Nueva Experiencia Creada',
            `Se ha creado "${experienceData.position}" correctamente`
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
          // Actualizar educación existente usando hook
          await updateEducation(parseInt(editingId), educationData);
          showSuccess(
            'Educación Actualizada',
            `Se ha actualizado "${educationData.title}" correctamente`
          );
        } else {
          // Crear nueva educación usando hook
          await createEducation(educationData);
          showSuccess(
            'Nueva Formación Académica Creada',
            `Se ha creado "${educationData.title}" correctamente`
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
      <FormModal
        isOpen={true}
        onClose={handleCloseForm}
        formType={editingType as 'experience' | 'education'}
        initialData={initialData}
        isEditing={!!editingId}
        onSubmit={handleEnhancedFormSubmit}
      />
    );
  };

  // Estados de carga y error mejorados
  if (loading) {
    return (
      <div className={`${styles.sectionCv} ${className || ''}`}>
        <div className={styles.experienceLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>{t.experience.loading}</p>
          <div className={styles.loadingDetails}>
            <small>{t.experience.loadingDetails}</small>
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
            onClick={retryExperiences}
            disabled={retryCount >= 3}
          >
            <i className="fas fa-redo"></i>
            {retryCount >= 3 ? t.experience.retryLimitReached : t.experience.errorRetry}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`${styles.sectionCv} ${className || ''}`} id="experience">
      <HeaderSection
        icon="fas fa-route"
        title={t.experience.title}
        subtitle={t.experience.subtitle}
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
            <span>{t.experience.viewCategories}</span>
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
            <span>{t.experience.viewChronological}</span>
          </button>
        </div>
        {/* Estadísticas rápidas usando stats del hook */}
        <div className={styles.experienceStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.experienceCount}</span>
            <span className={styles.statLabel}>{t.experience.stats.experiences}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.educationCount}</span>
            <span className={styles.statLabel}>{t.experience.stats.certifications}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.technologiesCount}</span>
            <span className={styles.statLabel}>{t.experience.stats.technologies}</span>
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
                  {t.experience.workExperience}
                </h3>
              </div>

              <div className={styles.timelineContainer}>
                {Array.isArray(experiences) ? (
                  experiences
                    .sort((a, b) => {
                      // Ordenamiento simple por fecha de fin descendente
                      const dateA = new Date(a.end_date || '').getTime() || 0;
                      const dateB = new Date(b.end_date || '').getTime() || 0;
                      return dateB - dateA;
                    })
                    .map((exp, index) => (
                      <ExperienceCard
                        key={exp._id}
                        experience={exp}
                        index={index}
                        onEdit={() => handleEditExperience(exp)}
                      />
                    ))
                ) : (
                  <div>Cargando experiencias...</div>
                )}

                {/* Botón para añadir nueva experiencia (visible solo para usuarios autenticados) */}
                {isAuthenticated && (
                  <div className={styles.addNewContainer}>
                    <button className={styles.addNewButton} onClick={handleAddExperience}>
                      <i className="fas fa-plus"></i>
                      Añadir Nueva Experiencia
                    </button>
                  </div>
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
                  {t.experience.education}
                </h3>
              </div>
              <div className={styles.timelineContainer}>
                {(Array.isArray(education) ? education : [])
                  .sort((a, b) => {
                    // Ordenamiento simple por fecha de fin descendente
                    const dateA = new Date(a.end_date || '').getTime() || 0;
                    const dateB = new Date(b.end_date || '').getTime() || 0;
                    return dateB - dateA;
                  })
                  .map((edu, index) => (
                    <EducationCard
                      key={edu._id || edu.id || index}
                      education={edu}
                      index={index + (Array.isArray(experiences) ? experiences.length : 0)}
                      onEdit={() => handleEditEducation(edu)}
                    />
                  ))}

                {/* Botón para añadir nueva educación */}
                {isAuthenticated && (
                  <div className={styles.addNewContainer}>
                    <button className={styles.addNewButton} onClick={handleAddEducation}>
                      <i className="fas fa-plus"></i>
                      Añadir Nueva Educación
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Vista Cronológica - Timeline Unificado */}
        {viewMode === 'chronological' && (
          <div className={styles.chronologicalView}>
            <div className={styles.chronologicalTimeline}>
              <div className={styles.timelineLine}></div>

              {/* Timeline unificado usando chronologicalData del hook */}
              {chronologicalData.map((item, index) => (
                <ChronologicalItem
                  key={`${item.type}-${item._id || String(item.id)}`}
                  item={item}
                  index={index}
                  position={index % 2 === 0 ? 'left' : 'right'}
                  onEdit={handleEditCombined}
                  onDelete={handleDeleteCombined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceSection;
