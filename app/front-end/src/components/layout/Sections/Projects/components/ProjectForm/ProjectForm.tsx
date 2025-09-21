// ProjectForm component - Refactored from CreateProject to support both create and edit modes
import React, { useEffect, useCallback, memo, useState, useRef } from 'react';
import { useProjectForm } from './hooks/useProjectForm';
import { useProjectData } from './hooks/useProjectData';
import ProjectFormContainer from '../CreateProject/ProjectFormContainer';
import TextEditor from '@components/common/TextEditor/TextEditor';
import ImageGallery from '@/components/ui/ImageGallery/ImageGallery';
import { useTranslation } from '@/contexts/TranslationContext';
import type { ProjectFormProps } from './types/ProjectFormTypes';
import { resolvePillFromTech } from '@/features/skills/utils/pillUtils';
import TechnologyChips from '@/components/ui/TechnologyChips/TechnologyChips';
import styles from './ProjectForm.module.css';

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
  ({
    mode = 'create',
    projectId,
    onSuccess,
    onCancel,
    language: propLanguage,
    onLanguageChange,
  }) => {
    // Allow internal language state if parent doesn't provide it
    const [language, setLanguage] = useState<'es' | 'en'>(propLanguage || 'es');
    const handleLanguageChange = (lang: 'es' | 'en') => {
      setLanguage(lang);
      if (onLanguageChange) onLanguageChange(lang);
    };
    const { t, getText } = useTranslation();
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
        const maybeGallery = (project as any)?.gallery_images;
        const initialGallery = Array.isArray(maybeGallery)
          ? maybeGallery
          : maybeGallery
            ? [maybeGallery]
            : [];

        // Ensure image_url is included in gallery_images when available
        const galleryWithCover = project.image_url
          ? Array.from(new Set([project.image_url, ...initialGallery]))
          : initialGallery;

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
          gallery_images: galleryWithCover,
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

    // Note: handleKeyDown will be declared below after suggestion helpers so it can access them

    // Handle keyboard navigation for tabs
    const handleTabKeyDown = useCallback(
      (e: React.KeyboardEvent, tabKey: string) => {
        const tabs = ['basic', 'gallery', 'links', 'content', 'seo'];
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

    // --- Technology suggestions and SkillPill integration (similar to AddExperienceForm)
    type SuggestionItem = {
      name: string;
      slug: string;
      svg?: string;
      color?: string;
      category?: string;
    };
    const [technologySuggestions, setTechnologySuggestions] = useState<SuggestionItem[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const techInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      let mounted = true;
      const loadSuggestions = async () => {
        try {
          const { default: loadSkillSettings } = await import(
            '@/features/skills/utils/skillSettingsLoader'
          );
          const data = await loadSkillSettings();
          if (!mounted) return;
          if (Array.isArray(data)) {
            const items: SuggestionItem[] = data
              .map((item: any) => ({
                name: item?.name ? String(item.name) : '',
                slug: item?.slug ? String(item.slug) : String(item?.name || ''),
                category: item?.category ? String(item.category) : undefined,
                color: item?.color ? String(item.color) : undefined,
                svg: item?.svg ? String(item.svg) : undefined,
              }))
              .filter(i => i.name)
              .reduce((acc: SuggestionItem[], it) => {
                if (!acc.find(a => a.name === it.name)) acc.push(it);
                return acc;
              }, [] as SuggestionItem[])
              .sort((a, b) => a.name.localeCompare(b.name));

            setTechnologySuggestions(items);
          }
        } catch (e) {
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

    const getFilteredSuggestions = () => {
      const q = techInput.trim().toLowerCase();
      return technologySuggestions
        .filter(item => {
          if (!item) return false;
          // Excluir ya seleccionadas
          if (form.technologies && form.technologies.includes(item.name)) return false;
          if (!q) return true;
          return (
            item.name.toLowerCase().includes(q) ||
            (item.slug && item.slug.toLowerCase().includes(q))
          );
        })
        .slice(0, 8);
    };

    const addTechnologyFromSuggestion = (item: SuggestionItem | string) => {
      const name = typeof item === 'string' ? item.trim() : (item.name || '').trim();
      if (!name) return;
      // Evitar duplicados
      if (form.technologies && form.technologies.includes(name)) return;
      setForm(prev => ({ ...prev, technologies: [...(prev.technologies || []), name] }));
      setTechInput('');
      setDropdownOpen(false);
      setHighlightedIndex(-1);
      if (techInputRef.current) techInputRef.current.focus();
    };

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
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
            addTechnologyFromSuggestion(suggestions[highlightedIndex]);
          } else if (techInput.trim()) {
            handleAddTechnology();
          }
        } else if (e.key === 'Escape') {
          setDropdownOpen(false);
        }
      },
      [getFilteredSuggestions, highlightedIndex, techInput, handleAddTechnology]
    );

    // Show loading state when loading project data
    if (mode === 'edit' && loadingProject) {
      return (
        <ProjectFormContainer
          title={getText('projects.form.loadingTitle', 'Cargando proyecto...')}
          icon="fas fa-spinner fa-spin"
          subtitle={getText('projects.form.loadingSubtitle', 'Obteniendo datos del proyecto')}
        >
          <div className={styles.loadingContainer} role="status" aria-live="polite">
            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
            <p>{getText('projects.form.loadingData', 'Cargando datos del proyecto...')}</p>
          </div>
        </ProjectFormContainer>
      );
    }

    // Show error state when project loading fails
    if (mode === 'edit' && loadError) {
      return (
        <ProjectFormContainer
          title={getText('projects.form.loadErrorTitle', 'Error al cargar proyecto')}
          icon="fas fa-exclamation-triangle"
          subtitle={getText('projects.form.loadErrorSubtitle', 'No se pudo cargar el proyecto')}
        >
          <div className={styles.errorContainer} role="alert" aria-live="assertive">
            <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <p>
              {getText('projects.form.loadErrorMessage', 'Error')}: {loadError}
            </p>
            <button
              onClick={() => projectId && loadProject(projectId)}
              className={styles.retryButton}
              aria-label={getText('projects.form.retryAria', 'Reintentar carga')}
            >
              <i className="fas fa-redo" aria-hidden="true"></i>
              {getText('projects.form.retryButton', 'Reintentar')}
            </button>
          </div>
        </ProjectFormContainer>
      );
    }

    const title =
      mode === 'edit'
        ? getText('projects.form.title.edit', 'Editar proyecto')
        : getText('projects.form.title.create', 'Crear nuevo proyecto');
    const subtitle =
      mode === 'edit'
        ? getText('projects.form.subtitle.edit', 'Modifica los detalles de tu proyecto')
        : getText('projects.form.subtitle.create', 'Agrega un nuevo proyecto a tu portafolio');
    const icon = mode === 'edit' ? 'fas fa-edit' : 'fas fa-plus-circle';

    return (
      <React.Fragment>
        <ProjectFormContainer
          title={title}
          icon={icon}
          subtitle={subtitle}
          language={language}
          onLanguageChange={handleLanguageChange}
        >
          <div className={styles.topRow}>
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
                {getText('projects.form.progressLabel', 'Progreso')}:{' '}
                {Math.round(getProgressPercentage())}%
              </span>
            </div>

            <div className={styles.formTabs} role="tablist" aria-label="Secciones del formulario">
              {[
                {
                  key: 'basic',
                  label: getText('projects.form.tabs.basic', 'Básico'),
                  icon: 'fas fa-info-circle',
                },
                {
                  key: 'gallery',
                  label: getText('projects.form.tabs.gallery', 'Galería'),
                  icon: 'far fa-images',
                },
                {
                  key: 'links',
                  label: getText('projects.form.tabs.links', 'Enlaces'),
                  icon: 'fas fa-link',
                },
                {
                  key: 'content',
                  label: getText('projects.form.tabs.content', 'Contenido'),
                  icon: 'fas fa-edit',
                },
                {
                  key: 'seo',
                  label: getText('projects.form.tabs.seo', 'SEO'),
                  icon: 'fas fa-search',
                },
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

            {/* Language toggle inside formContent (aligned right in the same row) */}
            <div className={styles.localesToggleWrapper}>
              <div className={styles.localesToggle} role="tablist" aria-label="Seleccionar idioma">
                <button
                  type="button"
                  className={styles.localeBtn}
                  onClick={() => handleLanguageChange('es')}
                  aria-pressed={language === 'es'}
                  aria-label="Español"
                >
                  ES
                </button>
                <button
                  type="button"
                  className={styles.localeBtn}
                  onClick={() => handleLanguageChange('en')}
                  aria-pressed={language === 'en'}
                  aria-label="English"
                >
                  EN
                </button>
              </div>
            </div>
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
                  <i className="fas fa-info-circle" aria-hidden="true"></i>Basic Information
                </h3>
                {/* Technology suggestions and SkillPill integration handled in component body */}

                <div className={styles.formColumns}>
                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">
                        {getText('projects.form.labels.title', 'Título del proyecto')} *
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
                        placeholder={getText(
                          'projects.form.placeholders.projectName',
                          'Nombre del proyecto'
                        )}
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
                        {getText('projects.form.labels.description', 'Descripción')} *
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
                        placeholder={getText(
                          'projects.form.placeholders.description',
                          'Describe brevemente tu proyecto'
                        )}
                        rows={10}
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
                    {/* Content Type removed per request */}

                    <div className={styles.formGroup}>
                      <label htmlFor="status">
                        {getText('projects.form.labels.status', 'Estado del proyecto')}
                      </label>
                      <select
                        id="status"
                        value={form.status}
                        onChange={e => handleFormChange('status', e.target.value)}
                      >
                        <option value="En progreso">
                          {getText('projects.form.status.inProgress', 'En progreso')}
                        </option>
                        <option value="Completado">
                          {getText('projects.form.status.completed', 'Completado')}
                        </option>
                        <option value="Pausado">
                          {getText('projects.form.status.paused', 'Pausado')}
                        </option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="tech-input">
                        {getText('projects.form.labels.technologies', 'Tecnologías usadas')}
                        {validationErrors.technologies && (
                          <span className={styles.errorText} role="alert" aria-live="polite">
                            {validationErrors.technologies}
                          </span>
                        )}
                      </label>
                      <div className={styles.techInputContainer} style={{ position: 'relative' }}>
                        <input
                          id="tech-input"
                          ref={techInputRef}
                          type="text"
                          value={techInput}
                          onChange={e => {
                            setTechInput(e.target.value);
                            setDropdownOpen(true);
                          }}
                          onKeyDown={handleKeyDown}
                          onFocus={() => setDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                          placeholder={getText(
                            'projects.form.placeholders.techInput',
                            'Ej.: React, TypeScript, Node.js'
                          )}
                          className={validationErrors.technologies ? styles.error : ''}
                          aria-describedby="tech-help"
                          aria-invalid={validationErrors.technologies ? 'true' : 'false'}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (techInput.trim()) handleAddTechnology();
                          }}
                          disabled={!techInput.trim()}
                          title={getText(
                            'projects.form.actions.addTechTitle',
                            'Agregar tecnología'
                          )}
                          aria-label={getText(
                            'projects.form.actions.addTechAria',
                            'Agregar tecnología a la lista'
                          )}
                        >
                          <i className="fas fa-plus" aria-hidden="true"></i>
                        </button>

                        {dropdownOpen && getFilteredSuggestions().length > 0 && (
                          <div className={styles.suggestionsDropdown} role="listbox">
                            {getFilteredSuggestions().map((sug, idx) => {
                              const isHighlighted = idx === highlightedIndex;
                              return (
                                <div
                                  key={sug.slug || sug.name}
                                  role="option"
                                  aria-selected={isHighlighted}
                                  className={`${styles.suggestionItem} ${isHighlighted ? styles.highlighted : ''}`}
                                  onMouseDown={() => addTechnologyFromSuggestion(sug)}
                                  onMouseEnter={() => setHighlightedIndex(idx)}
                                >
                                  {sug.svg ? (
                                    <img
                                      src={`/assets/svg/${sug.svg}`}
                                      alt={`${sug.name} icon`}
                                      className={styles.icon}
                                    />
                                  ) : (
                                    <span
                                      className={styles.colorDot}
                                      style={{ backgroundColor: sug.color || '#ddd' }}
                                    />
                                  )}
                                  <span className={styles.suggestionName}>{sug.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <small id="tech-help">
                        {getText(
                          'projects.form.hints.addTech',
                          'Presiona Enter o haz clic en + para agregar una tecnología'
                        )}
                      </small>

                      {form.technologies && form.technologies.length > 0 && (
                        <div
                          className={styles.techTags}
                          role="list"
                          aria-label="Tecnologías seleccionadas"
                        >
                          <TechnologyChips
                            items={form.technologies.map((tech: any, index: number) => {
                              const pill = resolvePillFromTech(tech, technologySuggestions, index);
                              return { slug: pill.slug, name: pill.name };
                            })}
                            onRemove={(slug: string) => {
                              // find index by slug and remove
                              const idx = form.technologies.findIndex((t: string) => {
                                const p = resolvePillFromTech(t, technologySuggestions, 0);
                                return p.slug === slug || p.name === slug;
                              });
                              if (idx >= 0) handleRemoveTechnology(idx);
                            }}
                            colored={true}
                            closable={true}
                            itemClassName={styles.skillChip}
                          />
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
                  <i className="fas fa-link" aria-hidden="true"></i>
                  {getText('projects.form.sections.linksTitle', 'Enlaces y recursos')}
                </h3>

                <div className={styles.formColumns}>
                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="github_url">Repositorio de GitHub</label>
                      <input
                        id="github_url"
                        type="url"
                        value={form.github_url}
                        onChange={e => handleFormChange('github_url', e.target.value)}
                        placeholder={getText(
                          'projects.form.placeholders.github',
                          'https://github.com/user/repo'
                        )}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="live_url">Demo en Vivo</label>
                      <input
                        id="live_url"
                        type="url"
                        value={form.live_url}
                        onChange={e => handleFormChange('live_url', e.target.value)}
                        placeholder={getText(
                          'projects.form.placeholders.liveDemo',
                          'https://myproject.netlify.app'
                        )}
                      />
                    </div>
                  </div>

                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="project_url">
                        {getText('projects.form.labels.article', 'Artículo / Blog')}
                      </label>
                      <input
                        id="project_url"
                        type="url"
                        value={form.project_url}
                        onChange={e => handleFormChange('project_url', e.target.value)}
                        placeholder={getText(
                          'projects.form.placeholders.article',
                          'https://blog.com/mi-articulo'
                        )}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="video_demo_url">
                        {getText('projects.form.labels.videoDemo', 'Video de demo')}
                      </label>
                      <input
                        id="video_demo_url"
                        type="url"
                        value={form.video_demo_url}
                        onChange={e => handleFormChange('video_demo_url', e.target.value)}
                        placeholder={getText(
                          'projects.form.placeholders.videoDemo',
                          'https://youtube.com/watch?v=...'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <>
                <div
                  className={styles.formSection}
                  role="tabpanel"
                  id="gallery-panel"
                  aria-labelledby="gallery-tab"
                >
                  <h3>
                    <i className="far fa-images" aria-hidden="true"></i>
                    {getText('projects.form.sections.galleryTitle', 'Galería de imágenes')}
                  </h3>
                  <div className={`${styles.formColumns} galleryFormColumns`}>
                    <div className={styles.galleryWrapper}>
                      <div className={styles.coverBox}>
                        <div className={styles.coverLabel} style={{ marginBottom: '8px' }}>
                          Imagen de portada
                        </div>
                        <aside className={styles.coverManager} aria-label="Gestión de portada">
                          <div className={styles.coverPreview}>
                            {form.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={form.image_url} alt="Portada actual" />
                            ) : (
                              <div className={styles.coverPlaceholder}>
                                <i className="far fa-image" aria-hidden="true" />
                                <div>
                                  {getText('projects.form.labels.noCover', 'No hay portada')}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className={styles.coverActions}>
                            <button
                              type="button"
                              onClick={() => {
                                // Clear cover
                                handleFormChange('image_url', '');
                              }}
                              disabled={!form.image_url}
                              className={styles.cancelButton}
                            >
                              {getText('projects.form.actions.removeCover', 'Quitar portada')}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                // If gallery has images, set first as cover
                                const list = Array.isArray(form.gallery_images)
                                  ? form.gallery_images
                                  : form.gallery_images
                                    ? [form.gallery_images]
                                    : [];
                                if (list && list.length > 0) {
                                  const first = list[0];
                                  handleFormChange('image_url', first || '');
                                  setForm(
                                    prev =>
                                      ({
                                        ...prev,
                                        gallery_images: [
                                          first,
                                          ...list.filter((i: string) => i !== first),
                                        ],
                                      }) as any
                                  );
                                }
                              }}
                              disabled={
                                !form.gallery_images ||
                                (Array.isArray(form.gallery_images) &&
                                  form.gallery_images.length === 0)
                              }
                              className={styles.selectButton}
                            >
                              {getText('projects.form.actions.useFirst', 'Usar primera imagen')}
                            </button>
                          </div>
                        </aside>
                      </div>

                      <div className={styles.galleryColumn}>
                        <div className={styles.formGroup}>
                          <label>
                            {getText('projects.form.labels.gallery', 'Galería de imágenes')}
                          </label>
                          <ImageGallery
                            value={form.gallery_images || []}
                            coverUrl={form.image_url || ''}
                            onSetCover={(url: string | null) => {
                              handleFormChange('image_url', url || '');
                              setForm(prev => {
                                const imgs = Array.isArray(prev.gallery_images)
                                  ? prev.gallery_images
                                  : prev.gallery_images
                                    ? [prev.gallery_images]
                                    : [];

                                if (!url) {
                                  return prev;
                                }

                                const next = [url, ...imgs.filter((i: string) => i !== url)];
                                handleFormChange('gallery_images', next);
                                return { ...prev, gallery_images: next } as any;
                              });
                            }}
                            onChange={urls => {
                              handleFormChange('gallery_images', urls);
                              if (form.image_url && !urls.includes(form.image_url)) {
                                handleFormChange('image_url', '');
                              }
                            }}
                            uploadHandler={async (file: File) => {
                              try {
                                const { default: apiFetch } = await import(
                                  '@/services/api/apiFetch'
                                );

                                const signRes = await apiFetch('/api/media/sign', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ folder: 'proyectos' }),
                                });

                                if (!signRes.ok) {
                                  const fallback = new FormData();
                                  fallback.append('image', file);
                                  fallback.append('imageType', 'project');

                                  const r = await apiFetch('/api/media/upload', {
                                    method: 'POST',
                                    body: fallback,
                                  });
                                  if (!r.ok) {
                                    const txt = await r.text();
                                    throw new Error('Server upload failed: ' + txt);
                                  }
                                  const d = await r.json();
                                  if (!d?.file?.url)
                                    throw new Error(
                                      'Server upload did not return a valid file URL'
                                    );
                                  return d.file.url;
                                }

                                const signData = await signRes.json();
                                const { signature, timestamp, apiKey, cloudName } = signData;

                                if (!cloudName || !apiKey || !signature) {
                                  throw new Error('Signed upload not available from server');
                                }

                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('api_key', apiKey);
                                formData.append('timestamp', String(timestamp));
                                formData.append('signature', signature);
                                formData.append('folder', 'proyectos');

                                const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

                                const uploadRes = await fetch(cloudUrl, {
                                  method: 'POST',
                                  body: formData,
                                });
                                if (!uploadRes.ok) {
                                  const text = await uploadRes.text();
                                  throw new Error('Cloudinary upload failed: ' + text);
                                }
                                const uploaded = await uploadRes.json();
                                const uploadedUrl = uploaded?.secure_url || uploaded?.url;
                                if (!uploadedUrl)
                                  throw new Error('Cloudinary upload did not return a valid URL');
                                return uploadedUrl;
                              } catch (err) {
                                console.error('Signed upload error:', err);
                                if (err instanceof Error) throw err;
                                throw new Error(String(err));
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'content' && (
              <div
                className={styles.formSection}
                role="tabpanel"
                id="content-panel"
                aria-labelledby="content-tab"
              >
                <h3>
                  <i className="fas fa-edit" aria-hidden="true"></i>
                  {getText('projects.form.sections.contentTitle', 'Contenido del artículo')}
                </h3>
                <div className={styles.editorContainer}>
                  <TextEditor
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
                  <i className="fas fa-search" aria-hidden="true"></i>
                  {getText('projects.form.sections.seoTitle', 'Optimización SEO')}
                </h3>

                <div className={styles.formColumns}>
                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="meta_title">
                        {getText('projects.form.labels.metaTitle', 'Meta título')}
                      </label>
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
                        placeholder="SEO-optimized title"
                        maxLength={60}
                      />
                      <small>{getText('projects.form.hints.max60', 'Máximo 60 caracteres')}</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="meta_description">
                        {getText('projects.form.labels.metaDescription', 'Meta descripción')}
                      </label>
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
                        placeholder="Short description for search engines"
                        rows={3}
                        maxLength={160}
                      />
                      <small>
                        {getText('projects.form.hints.max160', 'Máximo 160 caracteres')}
                      </small>
                    </div>
                  </div>

                  <div className={styles.formColumn}>
                    <div className={styles.formGroup}>
                      <label htmlFor="meta_keywords">
                        {getText('projects.form.labels.metaKeywords', 'Meta keywords')}
                      </label>
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
                      <small>
                        {getText('projects.form.hints.commaSeparated', 'Separadas por comas')}
                      </small>
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
                        {getText('projects.form.labels.featured', 'Proyecto destacado')}
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="reading_time">Reading Time (minutes)</label>
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
            {/* Move form actions into the formContent footer so they stay at the bottom */}
            <div className={styles.footActions}>
              <div className={styles.formActions}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={saving}
                  aria-label={getText(
                    'projects.form.actions.cancelAria',
                    'Cancelar y volver a la administración de proyectos'
                  )}
                >
                  <i className="fas fa-times" aria-hidden="true"></i>
                  {t.forms.experience.cancel}
                </button>
                <button
                  type="button"
                  className={`${styles.saveButton} ${saving ? 'loading' : ''}`}
                  onClick={() => {
                    console.debug('[ProjectForm] Save button clicked');
                    handleSave();
                  }}
                  disabled={saving}
                  aria-label={
                    saving
                      ? getText('projects.form.aria.saving', 'Guardando proyecto...')
                      : mode === 'edit'
                        ? getText('projects.form.aria.update', 'Actualizar proyecto existente')
                        : getText('projects.form.aria.save', 'Guardar nuevo proyecto')
                  }
                >
                  <i
                    className={saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'}
                    aria-hidden="true"
                  ></i>
                  {saving
                    ? t.forms.experience.saving
                    : mode === 'edit'
                      ? getText('projects.form.actions.update', 'Actualizar')
                      : t.forms.experience.save}
                </button>
              </div>
            </div>
          </div>
        </ProjectFormContainer>
      </React.Fragment>
    );
  }
);

ProjectForm.displayName = 'ProjectForm';

export default ProjectForm;
