// ProjectForm component - Refactored from CreateProject to support both create and edit modes
import React, { useEffect, useCallback, memo } from 'react';
import { useProjectForm } from './hooks/useProjectForm';
import { useProjectData } from './hooks/useProjectData';
import ProjectFormContainer from '../CreateProject/ProjectFormContainer';
import styles from '../CreateProject/CreateProjectForm.module.css';
import ProjectEditor from '../ProjectEditor/ProjectEditor';
import { useTranslation } from '@/contexts/TranslationContext';
import type { ProjectFormProps } from './types/ProjectFormTypes';

/**
 * ProjectForm - A comprehensive form component for creating and editing projects
 *
 * This component was refactored from the original CreateProject component to support
 * both create and edit modes while maintaining backward compatibility. It provides
 * a tabbed interface with sections for basic info, links, content, and SEO metadata.
 *
 * Features:
 * - Create and edit modes with automatic mode detection
 * - Tabbed interface with keyboard navigation support
 * - Real-time form validation with error display
 * - Progress tracking based on completed fields
 * - Technology management (add/remove)
 * - Loading and error states for data operations
 * - Full accessibility support with ARIA attributes
 * - Responsive design with mobile support
 *
 * @param {ProjectFormProps} props - Component props
 * @param {'create' | 'edit'} [props.mode='create'] - Form mode
 * @param {string} [props.projectId] - Project ID for edit mode
 * @param {() => void} [props.onSuccess] - Success callback
 * @param {() => void} [props.onCancel] - Cancel callback
 *
 * @example
 * ```tsx
 * // Create mode (default)
 * <ProjectForm />
 *
 * // Edit mode
 * <ProjectForm
 *   mode="edit"
 *   projectId="123"
 *   onSuccess={() => navigate('/projects')}
 *   onCancel={() => navigate('/admin')}
 * />
 *
 * // With custom callbacks
 * <ProjectForm
 *   onSuccess={() => showSuccessMessage()}
 *   onCancel={() => confirmCancel()}
 * />
 * ```
 *
 * @since 1.0.0
 * @author ProjectForm Team
 */
const ProjectForm: React.FC<ProjectFormProps> = memo(
  ({ mode = 'create', projectId, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const { project, loading: loadingProject, error: loadError, loadProject } = useProjectData();

    const {
      form,
      setForm,
      techInput,
      setTechInput,
      saving,
      validationErrors,
      activeTab,
      setActiveTab,
      handleFormChange,
      handleAddTechnology,
      handleRemoveTechnology,
      handleSave,
      handleCancel,
      getProgressPercentage,
    } = useProjectForm(undefined, mode, projectId, onSuccess, onCancel);

    // Load project data when in edit mode
    useEffect(() => {
      if (mode === 'edit' && projectId) {
        loadProject(projectId);
      }
    }, [mode, projectId, loadProject]);

    // Pre-populate form when project data is loaded
    useEffect(() => {
      if (project && mode === 'edit') {
        setForm({
          user_id: project.user_id,
          title: project.title,
          description: project.description,
          image_url: project.image_url || '',
          github_url: project.github_url || '',
          live_url: project.live_url || '',
          project_url: project.project_url || '',
          project_content: project.project_content || '',
          video_demo_url: project.video_demo_url || '',
          status: project.status,
          order_index: project.order_index,
          type: project.type,
          technologies: project.technologies || [],
          seo_metadata: {
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
            is_featured: false,
            reading_time: 5,
          },
        });
      }
    }, [project, mode, setForm]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && techInput.trim()) {
          e.preventDefault();
          handleAddTechnology();
        }
      },
      [techInput, handleAddTechnology]
    );

    // Handle keyboard navigation for tabs
    const handleTabKeyDown = useCallback(
      (e: React.KeyboardEvent, tabKey: string) => {
        const tabs = ['basic', 'links', 'content', 'seo'];
        const currentIndex = tabs.indexOf(activeTab);

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            setActiveTab(tabs[prevIndex] as any);
            break;
          case 'ArrowRight':
            e.preventDefault();
            const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            setActiveTab(tabs[nextIndex] as any);
            break;
          case 'Home':
            e.preventDefault();
            setActiveTab('basic');
            break;
          case 'End':
            e.preventDefault();
            setActiveTab('seo');
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            setActiveTab(tabKey as any);
            break;
        }
      },
      [activeTab, setActiveTab]
    );

    // Show loading state when loading project data
    if (mode === 'edit' && loadingProject) {
      return (
        <ProjectFormContainer
          title="Cargando proyecto..."
          icon="fas fa-spinner fa-spin"
          subtitle="Obteniendo datos del proyecto"
        >
          <div className={styles.loadingContainer} role="status" aria-live="polite">
            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
            <p>Cargando datos del proyecto...</p>
          </div>
        </ProjectFormContainer>
      );
    }

    // Show error state when project loading fails
    if (mode === 'edit' && loadError) {
      return (
        <ProjectFormContainer
          title="Error al cargar proyecto"
          icon="fas fa-exclamation-triangle"
          subtitle="No se pudo cargar el proyecto"
        >
          <div className={styles.errorContainer} role="alert" aria-live="assertive">
            <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <p>Error: {loadError}</p>
            <button
              onClick={() => projectId && loadProject(projectId)}
              className={styles.retryButton}
              aria-label="Reintentar cargar el proyecto"
            >
              <i className="fas fa-redo" aria-hidden="true"></i>
              Reintentar
            </button>
          </div>
        </ProjectFormContainer>
      );
    }

    const title = mode === 'edit' ? 'Editar Proyecto' : 'Crear Nuevo Proyecto';
    const subtitle =
      mode === 'edit'
        ? 'Modifica los datos de tu proyecto'
        : 'Agrega un nuevo proyecto a tu portafolio';
    const icon = mode === 'edit' ? 'fas fa-edit' : 'fas fa-plus-circle';

    return (
      <React.Fragment>
        <ProjectFormContainer title={title} icon={icon} subtitle={subtitle}>
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={getProgressPercentage()}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso del formulario"
            >
              <div
                className={styles.progressFill}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <span className={styles.progressText} aria-live="polite">
              Progreso: {Math.round(getProgressPercentage())}%
            </span>
          </div>

          <div className={styles.formTabs} role="tablist" aria-label="Secciones del formulario">
            {[
              { key: 'basic', label: 'Básico', icon: 'fas fa-info-circle' },
              { key: 'links', label: 'Enlaces', icon: 'fas fa-link' },
              { key: 'content', label: 'Contenido', icon: 'fas fa-edit' },
              { key: 'seo', label: 'SEO', icon: 'fas fa-search' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`${styles.formTab} ${activeTab === tab.key ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.key as any)}
                onKeyDown={e => handleTabKeyDown(e, tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`${tab.key}-panel`}
                id={`${tab.key}-tab`}
                tabIndex={activeTab === tab.key ? 0 : -1}
              >
                <i className={tab.icon} aria-hidden="true"></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.formContent}>
            {activeTab === 'basic' && (
              <div
                className={styles.formSection}
                role="tabpanel"
                id="basic-panel"
                aria-labelledby="basic-tab"
              >
                <h3>
                  <i className="fas fa-info-circle" aria-hidden="true"></i>Información Básica
                </h3>

                <div className={styles.formColumns}>
                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">
                        Título del Proyecto *
                        {validationErrors.title && (
                          <span className={styles.errorText} role="alert" aria-live="polite">
                            {validationErrors.title}
                          </span>
                        )}
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={form.title}
                        onChange={e => handleFormChange('title', e.target.value)}
                        placeholder="Nombre de tu proyecto"
                        className={validationErrors.title ? styles.error : ''}
                        aria-required="true"
                        aria-invalid={validationErrors.title ? 'true' : 'false'}
                        aria-describedby={validationErrors.title ? 'title-error' : undefined}
                      />
                      {validationErrors.title && (
                        <div id="title-error" className="sr-only">
                          {validationErrors.title}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="description">
                        Descripción *
                        {validationErrors.description && (
                          <span className={styles.errorText} role="alert" aria-live="polite">
                            {validationErrors.description}
                          </span>
                        )}
                      </label>
                      <textarea
                        id="description"
                        value={form.description}
                        onChange={e => handleFormChange('description', e.target.value)}
                        placeholder="Describe brevemente tu proyecto"
                        rows={4}
                        className={validationErrors.description ? styles.error : ''}
                        aria-required="true"
                        aria-invalid={validationErrors.description ? 'true' : 'false'}
                        aria-describedby={
                          validationErrors.description ? 'description-error' : undefined
                        }
                      />
                      {validationErrors.description && (
                        <div id="description-error" className="sr-only">
                          {validationErrors.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="type">Tipo de Contenido</label>
                      <select
                        id="type"
                        value={form.type || 'proyecto'}
                        onChange={e => handleFormChange('type', e.target.value)}
                      >
                        <option value="proyecto">Proyecto</option>
                        <option value="articulo">Artículo</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="status">Estado del Proyecto</label>
                      <select
                        id="status"
                        value={form.status}
                        onChange={e => handleFormChange('status', e.target.value)}
                      >
                        <option value="En progreso">En progreso</option>
                        <option value="Completado">Completado</option>
                        <option value="Pausado">Pausado</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="tech-input">
                        Tecnologías Utilizadas
                        {validationErrors.technologies && (
                          <span className={styles.errorText} role="alert" aria-live="polite">
                            {validationErrors.technologies}
                          </span>
                        )}
                      </label>
                      <div className={styles.techInputContainer}>
                        <input
                          id="tech-input"
                          type="text"
                          value={techInput}
                          onChange={e => setTechInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ej: React, TypeScript, Node.js"
                          className={validationErrors.technologies ? styles.error : ''}
                          aria-describedby="tech-help"
                          aria-invalid={validationErrors.technologies ? 'true' : 'false'}
                        />
                        <button
                          type="button"
                          onClick={handleAddTechnology}
                          disabled={!techInput.trim()}
                          title="Agregar tecnología"
                          aria-label="Agregar tecnología a la lista"
                        >
                          <i className="fas fa-plus" aria-hidden="true"></i>
                        </button>
                      </div>
                      <small id="tech-help">
                        Presiona Enter o haz clic en + para agregar una tecnología
                      </small>

                      {form.technologies && form.technologies.length > 0 && (
                        <div
                          className={styles.techTags}
                          role="list"
                          aria-label="Tecnologías seleccionadas"
                        >
                          {form.technologies.map((tech, index) => (
                            <span key={index} className={styles.techTag} role="listitem">
                              {tech}
                              <button
                                type="button"
                                onClick={() => handleRemoveTechnology(index)}
                                aria-label={`Remover ${tech} de la lista de tecnologías`}
                                title={`Remover ${tech}`}
                              >
                                <i className="fas fa-times" aria-hidden="true"></i>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div
                className={styles.formSection}
                role="tabpanel"
                id="links-panel"
                aria-labelledby="links-tab"
              >
                <h3>
                  <i className="fas fa-link" aria-hidden="true"></i>Enlaces y Recursos
                </h3>

                <div className={styles.formColumns}>
                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="image_url">Imagen Principal del Proyecto</label>
                      <input
                        id="image_url"
                        type="url"
                        value={form.image_url || ''}
                        onChange={e => handleFormChange('image_url', e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="github_url">Repositorio de GitHub</label>
                      <input
                        id="github_url"
                        type="url"
                        value={form.github_url}
                        onChange={e => handleFormChange('github_url', e.target.value)}
                        placeholder="https://github.com/usuario/repositorio"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="live_url">Demo en Vivo</label>
                      <input
                        id="live_url"
                        type="url"
                        value={form.live_url}
                        onChange={e => handleFormChange('live_url', e.target.value)}
                        placeholder="https://miproyecto.netlify.app"
                      />
                    </div>
                  </div>

                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="project_url">Artículo/Blog</label>
                      <input
                        id="project_url"
                        type="url"
                        value={form.project_url}
                        onChange={e => handleFormChange('project_url', e.target.value)}
                        placeholder="https://blog.com/mi-articulo"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="video_demo_url">Video Demo</label>
                      <input
                        id="video_demo_url"
                        type="url"
                        value={form.video_demo_url}
                        onChange={e => handleFormChange('video_demo_url', e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div
                className={styles.formSection}
                role="tabpanel"
                id="content-panel"
                aria-labelledby="content-tab"
              >
                <h3>
                  <i className="fas fa-edit" aria-hidden="true"></i>Contenido del Artículo
                </h3>
                <div className={styles.editorContainer}>
                  <ProjectEditor
                    content={form.project_content || ''}
                    onChange={(value: string) => handleFormChange('project_content', value)}
                    placeholder="Escribe el contenido detallado de tu proyecto..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div
                className={styles.formSection}
                role="tabpanel"
                id="seo-panel"
                aria-labelledby="seo-tab"
              >
                <h3>
                  <i className="fas fa-search" aria-hidden="true"></i>Optimización SEO
                </h3>

                <div className={styles.formColumns}>
                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="meta_title">Meta Título</label>
                      <input
                        id="meta_title"
                        type="text"
                        value={form.seo_metadata?.meta_title || ''}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            seo_metadata: {
                              ...prev.seo_metadata,
                              meta_title: e.target.value,
                            },
                          }))
                        }
                        placeholder="Título optimizado para SEO"
                        maxLength={60}
                      />
                      <small>Máximo 60 caracteres</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="meta_description">Meta Descripción</label>
                      <textarea
                        id="meta_description"
                        value={form.seo_metadata?.meta_description || ''}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            seo_metadata: {
                              ...prev.seo_metadata,
                              meta_description: e.target.value,
                            },
                          }))
                        }
                        placeholder="Descripción breve para motores de búsqueda"
                        rows={3}
                        maxLength={160}
                      />
                      <small>Máximo 160 caracteres</small>
                    </div>
                  </div>

                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="meta_keywords">Palabras Clave</label>
                      <input
                        id="meta_keywords"
                        type="text"
                        value={form.seo_metadata?.meta_keywords || ''}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            seo_metadata: {
                              ...prev.seo_metadata,
                              meta_keywords: e.target.value,
                            },
                          }))
                        }
                        placeholder="react, javascript, web development"
                      />
                      <small>Separadas por comas</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.seo_metadata?.is_featured || false}
                          onChange={e =>
                            setForm(prev => ({
                              ...prev,
                              seo_metadata: {
                                ...prev.seo_metadata,
                                is_featured: e.target.checked,
                              },
                            }))
                          }
                        />
                        Proyecto Destacado
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="reading_time">Tiempo de Lectura (minutos)</label>
                      <input
                        id="reading_time"
                        type="number"
                        min="1"
                        max="60"
                        value={form.seo_metadata?.reading_time || 5}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            seo_metadata: {
                              ...prev.seo_metadata,
                              reading_time: parseInt(e.target.value) || 5,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={saving}
              aria-label="Cancelar y volver a la administración de proyectos"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
              {t.forms.experience.cancel}
            </button>
            <button
              className={`${styles.saveButton} ${saving ? 'loading' : ''}`}
              onClick={handleSave}
              disabled={saving}
              aria-label={
                saving
                  ? 'Guardando proyecto...'
                  : mode === 'edit'
                    ? 'Actualizar proyecto existente'
                    : 'Guardar nuevo proyecto'
              }
            >
              <i
                className={saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'}
                aria-hidden="true"
              ></i>
              {saving
                ? t.forms.experience.saving
                : mode === 'edit'
                  ? 'Actualizar'
                  : t.forms.experience.save}
            </button>
          </div>
        </ProjectFormContainer>
      </React.Fragment>
    );
  }
);

ProjectForm.displayName = 'ProjectForm';

export default ProjectForm;
