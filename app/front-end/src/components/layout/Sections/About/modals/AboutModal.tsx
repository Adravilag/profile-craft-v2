import React, { useState, useEffect, useRef } from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import * as endpoints from '@/services/endpoints';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AboutHighlight {
  _id?: string;
  icon: string;
  title: string;
  descriptionHtml: string;
  tech: string;
  imageSrc: string;
  imageCloudinaryId: string;
  order: number;
  isActive: boolean;
}

interface AboutData {
  aboutText: string;
  highlights: AboutHighlight[];
  collaborationNote: {
    title: string;
    description: string;
    icon: string;
  };
  isActive: boolean;
}

type TabType = 'about' | 'highlights' | 'collaboration';

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [aboutData, setAboutData] = useState<AboutData>({
    aboutText: '',
    highlights: [],
    collaborationNote: {
      title: '',
      description: '',
      icon: '',
    },
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Early return when modal is closed
  if (!isOpen) return null;

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await endpoints.about.getAboutSection();
        if (response.success && response.data) {
          setAboutData({
            aboutText: response.data.aboutText || '',
            highlights: response.data.highlights || [],
            collaborationNote: response.data.collaborationNote || {
              title: '',
              description: '',
              icon: '',
            },
            isActive: response.data.isActive !== undefined ? response.data.isActive : true,
          });
        }
      } catch (err) {
        setError('Error al cargar datos');
        console.error('Error loading about data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  const handleAboutTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAboutData(prev => ({
      ...prev,
      aboutText: e.target.value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleCollaborationChange = (field: string, value: string) => {
    setAboutData(prev => ({
      ...prev,
      collaborationNote: {
        ...prev.collaborationNote,
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [aboutData.aboutText]);

  // Keyboard navigation for tabs
  const handleTabKeydown = (e: React.KeyboardEvent, tab: TabType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await endpoints.about.updateAboutSection(aboutData);
      if (response.success) {
        onClose();
      } else {
        setError('Error al guardar cambios');
      }
    } catch (err) {
      setError('Error al guardar cambios');
      console.error('Error saving data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !aboutData.aboutText) {
    return (
      <ModalShell title="Cargando..." onClose={onClose}>
        <div className="about-modal__loading">
          <div className="about-modal__skeleton">
            <div className="about-modal__skeleton-tabs">
              <div className="about-modal__skeleton-tab"></div>
              <div className="about-modal__skeleton-tab"></div>
              <div className="about-modal__skeleton-tab"></div>
            </div>
            <div className="about-modal__skeleton-content">
              <div className="about-modal__skeleton-line about-modal__skeleton-line--title"></div>
              <div className="about-modal__skeleton-line"></div>
              <div className="about-modal__skeleton-line"></div>
              <div className="about-modal__skeleton-line about-modal__skeleton-line--short"></div>
            </div>
          </div>
        </div>
      </ModalShell>
    );
  }

  if (error) {
    return (
      <ModalShell
        title="Error"
        onClose={onClose}
        actionButtons={[
          {
            label: 'Cerrar',
            onClick: onClose,
            variant: 'secondary',
          },
        ]}
      >
        <div className="about-modal__error">{error}</div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="Editar Sección About"
      onClose={onClose}
      maxWidth="1000px"
      actionButtons={[
        {
          label: 'Cancelar',
          onClick: onClose,
          variant: 'secondary',
          disabled: loading,
        },
        {
          label: loading
            ? 'Guardando...'
            : hasUnsavedChanges
              ? 'Guardar Cambios •'
              : 'Guardar Cambios',
          onClick: () => {
            const form = document.querySelector('.about-modal__form') as HTMLFormElement;
            if (form) {
              form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
          },
          variant: 'primary',
          disabled: loading,
        },
      ]}
    >
      {/* Tabs Navigation */}
      <div className="about-modal__tabs">
        <nav className="about-modal__tab-nav" role="tablist" aria-label="Pestañas de edición">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'about'}
            aria-controls="about-panel"
            id="about-tab"
            tabIndex={activeTab === 'about' ? 0 : -1}
            onClick={() => setActiveTab('about')}
            onKeyDown={e => handleTabKeydown(e, 'about')}
            className={`about-modal__tab ${activeTab === 'about' ? 'about-modal__tab--active' : ''}`}
          >
            <span className="about-modal__tab-icon" aria-hidden="true">
              📝
            </span>
            Texto About
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'highlights'}
            aria-controls="highlights-panel"
            id="highlights-tab"
            tabIndex={activeTab === 'highlights' ? 0 : -1}
            onClick={() => setActiveTab('highlights')}
            onKeyDown={e => handleTabKeydown(e, 'highlights')}
            className={`about-modal__tab ${activeTab === 'highlights' ? 'about-modal__tab--active' : ''}`}
          >
            <span className="about-modal__tab-icon" aria-hidden="true">
              ⭐
            </span>
            Highlights
            <span className="about-modal__tab-badge">{aboutData.highlights.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'collaboration'}
            aria-controls="collaboration-panel"
            id="collaboration-tab"
            tabIndex={activeTab === 'collaboration' ? 0 : -1}
            onClick={() => setActiveTab('collaboration')}
            onKeyDown={e => handleTabKeydown(e, 'collaboration')}
            className={`about-modal__tab ${activeTab === 'collaboration' ? 'about-modal__tab--active' : ''}`}
          >
            <span className="about-modal__tab-icon" aria-hidden="true">
              🤝
            </span>
            Nota Colaboración
            {aboutData.collaborationNote.title && (
              <span
                className="about-modal__status-indicator about-modal__status-indicator--configured"
                aria-label="Configurado"
              ></span>
            )}
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="about-modal__form">
        {/* Tab: About Text */}
        {activeTab === 'about' && (
          <div
            className="about-modal__tab-content"
            role="tabpanel"
            id="about-panel"
            aria-labelledby="about-tab"
          >
            <div className="about-modal__text-section">
              <label htmlFor="aboutText" className="about-modal__label">
                <span className="about-modal__label-text">Texto About:</span>
                <span className="about-modal__label-hint">
                  Describe tu experiencia, objetivos y lo que te apasiona
                </span>
              </label>
              <div className="about-modal__textarea-wrapper">
                <textarea
                  ref={textareaRef}
                  id="aboutText"
                  value={aboutData.aboutText}
                  onChange={handleAboutTextChange}
                  rows={16}
                  className="about-modal__textarea"
                  disabled={loading}
                  placeholder="Soy un desarrollador de software con más de 4 años de experiencia..."
                  aria-describedby="aboutText-hint"
                />
                <div className="about-modal__textarea-counter">
                  {aboutData.aboutText.length}/1000 caracteres
                </div>
              </div>
              <div id="aboutText-hint" className="about-modal__field-hint">
                Tip: Usa <strong>HTML tags</strong> como &lt;b&gt;, &lt;br/&gt; para formato
              </div>
            </div>
          </div>
        )}

        {/* Tab: Highlights Management */}
        {activeTab === 'highlights' && (
          <div
            className="about-modal__tab-content"
            role="tabpanel"
            id="highlights-panel"
            aria-labelledby="highlights-tab"
          >
            <div className="about-modal__highlights-section">
              <div className="about-modal__highlights-header">
                <h4 className="about-modal__section-title">
                  Gestión de Highlights
                  <span className="about-modal__section-subtitle">
                    Puntos clave que quieres destacar
                  </span>
                </h4>
                <button
                  type="button"
                  data-testid="add-highlight-button"
                  className="about-modal__add-button"
                  aria-label="Agregar nuevo highlight"
                >
                  <span className="about-modal__button-icon" aria-hidden="true">
                    ✨
                  </span>
                  Agregar Highlight
                </button>
              </div>

              {/* Lista de highlights */}
              <div className="about-modal__highlights-list">
                {aboutData.highlights.length === 0 ? (
                  <div className="about-modal__empty-state">
                    <div className="about-modal__empty-icon" aria-hidden="true">
                      ⭐
                    </div>
                    <h3>No hay highlights</h3>
                    <p>Agrega tu primer highlight para comenzar a destacar tus fortalezas.</p>
                    <button
                      type="button"
                      className="about-modal__empty-action"
                      onClick={() => {
                        /* Implementar */
                      }}
                    >
                      Crear mi primer highlight
                    </button>
                  </div>
                ) : (
                  <div className="about-modal__highlights-grid">
                    {aboutData.highlights.map((highlight, index) => (
                      <div
                        key={highlight._id || index}
                        className={`about-modal__highlight-item ${!highlight.isActive ? 'about-modal__highlight-item--disabled' : ''}`}
                      >
                        <div className="about-modal__highlight-header">
                          <h5 className="about-modal__highlight-title">
                            <span className="about-modal__highlight-icon" aria-hidden="true">
                              <i className={highlight.icon}></i>
                            </span>
                            {highlight.title}
                            <div className="about-modal__highlight-badges">
                              <span className="about-modal__badge about-modal__badge--order">
                                #{highlight.order}
                              </span>
                              <span
                                className={`about-modal__status-pill ${highlight.isActive ? 'about-modal__status-pill--active' : 'about-modal__status-pill--inactive'}`}
                              >
                                {highlight.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </h5>
                          <div className="about-modal__highlight-actions">
                            <button
                              type="button"
                              className="about-modal__action-button about-modal__action-button--edit"
                              data-testid={`edit-highlight-${index}`}
                              aria-label={`Editar ${highlight.title}`}
                            >
                              <span aria-hidden="true">✏️</span>
                            </button>
                            <button
                              type="button"
                              className="about-modal__action-button about-modal__action-button--delete"
                              data-testid={`delete-highlight-${index}`}
                              aria-label={`Eliminar ${highlight.title}`}
                            >
                              <span aria-hidden="true">🗑️</span>
                            </button>
                          </div>
                        </div>
                        <div
                          className="about-modal__highlight-content"
                          dangerouslySetInnerHTML={{ __html: highlight.descriptionHtml }}
                        />
                        <div className="about-modal__highlight-tech">
                          <span className="about-modal__tech-label">Tech Stack:</span>
                          <div className="about-modal__tech-tags">
                            {highlight.tech.split(',').map((tech, techIndex) => (
                              <span key={techIndex} className="about-modal__tech-tag">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Collaboration Note */}
        {activeTab === 'collaboration' && (
          <div
            className="about-modal__tab-content"
            role="tabpanel"
            id="collaboration-panel"
            aria-labelledby="collaboration-tab"
          >
            <div className="about-modal__collaboration-section">
              <h4 className="about-modal__section-title">
                Configuración de Colaboración
                <span className="about-modal__section-subtitle">
                  Información para potenciales colaboradores
                </span>
              </h4>
              <div className="about-modal__collaboration-form">
                <div className="about-modal__field-group">
                  <div className="about-modal__field">
                    <label htmlFor="collab-title" className="about-modal__label">
                      <span className="about-modal__label-text">Título:</span>
                      <span className="about-modal__label-required" aria-label="Campo requerido">
                        *
                      </span>
                    </label>
                    <input
                      id="collab-title"
                      type="text"
                      value={aboutData.collaborationNote.title}
                      onChange={e => handleCollaborationChange('title', e.target.value)}
                      className="about-modal__input"
                      disabled={loading}
                      placeholder="¿Listo para colaborar?"
                      maxLength={50}
                      aria-describedby="collab-title-hint"
                    />
                    <div id="collab-title-hint" className="about-modal__field-hint">
                      Frase que invite a la colaboración (máx. 50 caracteres)
                    </div>
                  </div>
                  <div className="about-modal__field">
                    <label htmlFor="collab-icon" className="about-modal__label">
                      <span className="about-modal__label-text">Ícono:</span>
                    </label>
                    <div className="about-modal__icon-input-group">
                      <input
                        id="collab-icon"
                        type="text"
                        value={aboutData.collaborationNote.icon}
                        onChange={e => handleCollaborationChange('icon', e.target.value)}
                        className="about-modal__input"
                        disabled={loading}
                        placeholder="fas fa-handshake"
                        aria-describedby="collab-icon-hint"
                      />
                      <div className="about-modal__icon-preview">
                        {aboutData.collaborationNote.icon && (
                          <i className={aboutData.collaborationNote.icon} aria-hidden="true"></i>
                        )}
                      </div>
                    </div>
                    <div id="collab-icon-hint" className="about-modal__field-hint">
                      Clase CSS de FontAwesome (ej: fas fa-handshake)
                    </div>
                  </div>
                </div>
                <div className="about-modal__field about-modal__field--full">
                  <label htmlFor="collab-description" className="about-modal__label">
                    <span className="about-modal__label-text">Descripción:</span>
                    <span className="about-modal__label-required" aria-label="Campo requerido">
                      *
                    </span>
                  </label>
                  <textarea
                    id="collab-description"
                    value={aboutData.collaborationNote.description}
                    onChange={e => handleCollaborationChange('description', e.target.value)}
                    className="about-modal__textarea"
                    rows={4}
                    disabled={loading}
                    placeholder="Estoy siempre abierto a nuevos proyectos desafiantes y oportunidades de colaboración. ¡Hablemos sobre cómo puedo ayudarte a materializar tus ideas!"
                    maxLength={300}
                    aria-describedby="collab-description-hint"
                  />
                  <div className="about-modal__textarea-counter">
                    {aboutData.collaborationNote.description.length}/300 caracteres
                  </div>
                  <div id="collab-description-hint" className="about-modal__field-hint">
                    Mensaje personalizado para invitar a la colaboración (máx. 300 caracteres)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </ModalShell>
  );
};

export default AboutModal;
