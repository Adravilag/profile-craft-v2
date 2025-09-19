import React, { useState, useEffect, useRef } from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import * as endpoints from '@/services/endpoints';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional initial tab for testing or controlled opens */
  initialTab?: TabType;
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

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => initialTab ?? 'about');
  const { language } = useTranslation();
  const { getLocalizedText } = useLocalizedContent();
  const [lang, setLang] = useState<'es' | 'en'>(() => (language === 'en' ? 'en' : 'es'));

  // Local UI state to track which highlight is being edited
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<number | null>(null);

  const startEditHighlight = (index: number) => {
    setEditingHighlightIndex(index);
  };

  const stopEditHighlight = () => {
    setEditingHighlightIndex(null);
    setHasUnsavedChanges(true);
  };

  // localized storage used for saving both languages
  const [localizedData, setLocalizedData] = useState<any>({
    aboutText: { es: '', en: '' },
    highlights: [],
    collaborationNote: { title: { es: '', en: '' }, description: { es: '', en: '' }, icon: '' },
  });

  // Compute a new localized copy by persisting visible aboutData into the localized structure for targetLang
  const persistVisibleToLocalized = (targetLang: 'es' | 'en') => {
    const prev = localizedData || {};
    const copy = { ...(prev || {}) } as any;

    // aboutText
    copy.aboutText = { ...(copy.aboutText || { es: '', en: '' }) };
    copy.aboutText[targetLang] = aboutData.aboutText || '';

    // highlights
    const prevHighlights = (copy.highlights || []) as any[];
    const visibleHighlights = (aboutData.highlights || []) as any[];
    const length = Math.max(prevHighlights.length, visibleHighlights.length);
    copy.highlights = Array.from({ length }).map((_, i) => {
      const existing = (prevHighlights[i] || {}) as any;
      const visible = (visibleHighlights[i] || {}) as any;
      return {
        ...existing,
        // title and descriptionHtml should be objects with es/en
        title: { ...(existing.title || { es: '', en: '' }), [targetLang]: visible.title || '' },
        descriptionHtml: {
          ...(existing.descriptionHtml || { es: '', en: '' }),
          [targetLang]: visible.descriptionHtml || '',
        },
        // copy other non-localized fields if present
        icon: visible.icon ?? existing.icon ?? '',
        tech: visible.tech ?? existing.tech ?? '',
        imageSrc: visible.imageSrc ?? existing.imageSrc ?? '',
        imageCloudinaryId: visible.imageCloudinaryId ?? existing.imageCloudinaryId ?? '',
        order: visible.order ?? existing.order ?? i + 1,
        isActive: visible.isActive ?? existing.isActive ?? true,
        _id: existing._id ?? visible._id,
      };
    });

    // collaborationNote
    copy.collaborationNote = copy.collaborationNote || {
      title: { es: '', en: '' },
      description: { es: '', en: '' },
      icon: '',
    };
    copy.collaborationNote.title = {
      ...(copy.collaborationNote.title || { es: '', en: '' }),
      [targetLang]: aboutData.collaborationNote.title || '',
    };
    copy.collaborationNote.description = {
      ...(copy.collaborationNote.description || { es: '', en: '' }),
      [targetLang]: aboutData.collaborationNote.description || '',
    };
    copy.collaborationNote.icon =
      aboutData.collaborationNote.icon || copy.collaborationNote.icon || '';

    return copy;
  };

  const handleLangChange = (newLang: 'es' | 'en') => {
    if (newLang === lang) return;
    // persist current visible edits into localizedData under current lang and get the new localized object
    const nextLocalized = persistVisibleToLocalized(lang);
    setLocalizedData(nextLocalized);

    // map localized -> visible for the new language
    const mapForLang = (t: any) => (t ? (typeof t === 'string' ? t : (t[newLang] ?? '')) : '');
    setAboutData({
      aboutText: mapForLang(nextLocalized.aboutText),
      highlights: (nextLocalized.highlights || []).map((h: any, i: number) => ({
        _id: h._id,
        icon: h.icon || '',
        title: (h.title && h.title[newLang]) || '',
        descriptionHtml: (h.descriptionHtml && h.descriptionHtml[newLang]) || '',
        tech: h.tech || '',
        imageSrc: h.imageSrc || '',
        imageCloudinaryId: h.imageCloudinaryId || '',
        order: h.order ?? i + 1,
        isActive: h.isActive ?? true,
      })),
      collaborationNote: {
        title: nextLocalized.collaborationNote?.title?.[newLang] ?? '',
        description: nextLocalized.collaborationNote?.description?.[newLang] ?? '',
        icon: nextLocalized.collaborationNote?.icon ?? '',
      },
      isActive: aboutData.isActive,
    });

    setLang(newLang);
  };

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
          const toLocalized = (v: any) => {
            if (v == null) return { es: '', en: '' };
            if (typeof v === 'string') return { es: v, en: v };
            return { es: v.es ?? v.en ?? '', en: v.en ?? v.es ?? '' };
          };

          const hs = (response.data.highlights || []).map((h: any) => ({
            ...h,
            title: toLocalized(h.title),
            descriptionHtml: toLocalized(h.descriptionHtml),
          }));

          const coll = response.data.collaborationNote || { title: '', description: '', icon: '' };

          const localized = {
            aboutText: toLocalized(response.data.aboutText),
            highlights: hs,
            collaborationNote: {
              title: toLocalized(coll.title),
              description: toLocalized(coll.description),
              icon: coll.icon || '',
            },
          };

          setLocalizedData(localized);

          // populate visible fields for selected lang
          const mapForLang = (t: any) => (t ? (typeof t === 'string' ? t : (t[lang] ?? '')) : '');
          setAboutData({
            aboutText: mapForLang(localized.aboutText),
            highlights: (localized.highlights || []).map((h: any) => ({
              ...h,
              title: h.title[lang] ?? '',
              descriptionHtml: h.descriptionHtml[lang] ?? '',
            })),
            collaborationNote: {
              title: localized.collaborationNote.title[lang] ?? '',
              description: localized.collaborationNote.description[lang] ?? '',
              icon: localized.collaborationNote.icon || '',
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
    const value = e.target.value;
    setAboutData(prev => ({ ...prev, aboutText: value }));
    setLocalizedData(prev => ({
      ...prev,
      aboutText: { ...(prev.aboutText || {}), [lang]: value },
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
    // update localizedData
    if (field === 'title' || field === 'description') {
      setLocalizedData(prev => ({
        ...prev,
        collaborationNote: {
          ...(prev.collaborationNote || {}),
          [field === 'title' ? 'title' : 'description']: {
            ...(prev.collaborationNote?.[field === 'title' ? 'title' : 'description'] || {}),
            [lang]: value,
          },
          icon: prev.collaborationNote?.icon || '',
        },
      }));
    } else if (field === 'icon') {
      setLocalizedData(prev => ({
        ...prev,
        collaborationNote: {
          ...(prev.collaborationNote || {}),
          icon: value,
        },
      }));
    }
    setHasUnsavedChanges(true);
  };

  const handleChangeHighlightField = (index: number, field: string, value: string) => {
    setAboutData(prev => {
      const copy = { ...prev } as any;
      copy.highlights = (copy.highlights || []).map((h: any, i: number) =>
        i === index ? { ...h, [field]: value } : h
      );
      return copy;
    });
    setLocalizedData(prev => {
      const copy = { ...(prev || {}) } as any;
      copy.highlights = (copy.highlights || []).map((h: any, i: number) => {
        if (i !== index) return h;
        const newH = { ...h };
        if (field === 'title' || field === 'descriptionHtml') {
          const key = field === 'title' ? 'title' : 'descriptionHtml';
          newH[key] = { ...(newH[key] || {}), [lang]: value };
        } else {
          newH[field] = value;
        }
        return newH;
      });
      return copy;
    });
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
      // Build payload sending localized objects to preserve separate languages
      // Helper to ensure legacy string values are converted to { es, en }
      const ensureLocalized = (v: any) => {
        if (v == null) return { es: '', en: '' };
        if (typeof v === 'string') return { es: v, en: v };
        if (typeof v === 'object' && ('es' in v || 'en' in v)) {
          return { es: v.es ?? v.en ?? '', en: v.en ?? v.es ?? '' };
        }
        return { es: String(v), en: String(v) };
      };

      const payload: any = {
        // Send the full localized object so backend doesn't mirror the same string in both locales
        aboutText: ensureLocalized(localizedData.aboutText),
        highlights: (localizedData.highlights || []).map((h: any, i: number) => ({
          _id: h._id,
          icon: h.icon || '',
          // title/descriptionHtml expected as localized objects
          title: ensureLocalized(h.title),
          descriptionHtml: ensureLocalized(h.descriptionHtml),
          tech: h.tech || '',
          imageSrc: h.imageSrc || '',
          imageCloudinaryId: h.imageCloudinaryId || '',
          order: h.order ?? i + 1,
          isActive: h.isActive ?? true,
        })),
        collaborationNote: {
          title: ensureLocalized(localizedData.collaborationNote?.title),
          description: ensureLocalized(localizedData.collaborationNote?.description),
          icon: localizedData.collaborationNote?.icon || '',
        },
        isActive: aboutData.isActive,
      };

      const response = await endpoints.about.updateAboutSection(payload);
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
      headerActions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            aria-pressed={lang === 'es'}
            onClick={() => handleLangChange('es')}
            className={`about-modal__lang-btn ${lang === 'es' ? 'about-modal__lang-btn--active' : ''}`}
            style={{ padding: '6px 8px', borderRadius: 6 }}
          >
            ES
          </button>
          <button
            type="button"
            aria-pressed={lang === 'en'}
            onClick={() => handleLangChange('en')}
            className={`about-modal__lang-btn ${lang === 'en' ? 'about-modal__lang-btn--active' : ''}`}
            style={{ padding: '6px 8px', borderRadius: 6 }}
          >
            EN
          </button>
        </div>
      }
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
                              onClick={() => startEditHighlight(index)}
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
                        {/* Inline editor when this highlight is being edited */}
                        {editingHighlightIndex === index && (
                          <div className="about-modal__highlight-editor">
                            <label>
                              Título:
                              <input
                                type="text"
                                value={highlight.title}
                                onChange={e =>
                                  handleChangeHighlightField(index, 'title', e.target.value)
                                }
                                className="about-modal__input"
                              />
                            </label>
                            <label>
                              Descripción (HTML):
                              <textarea
                                value={highlight.descriptionHtml}
                                onChange={e =>
                                  handleChangeHighlightField(
                                    index,
                                    'descriptionHtml',
                                    e.target.value
                                  )
                                }
                                className="about-modal__textarea"
                                rows={4}
                              />
                            </label>
                            <label>
                              Tech (comma separated):
                              <input
                                type="text"
                                value={highlight.tech}
                                onChange={e =>
                                  handleChangeHighlightField(index, 'tech', e.target.value)
                                }
                                className="about-modal__input"
                              />
                            </label>
                            <label>
                              Icon class:
                              <input
                                type="text"
                                value={highlight.icon}
                                onChange={e =>
                                  handleChangeHighlightField(index, 'icon', e.target.value)
                                }
                                className="about-modal__input"
                              />
                            </label>
                            <div style={{ marginTop: 8 }}>
                              <button
                                type="button"
                                className="about-modal__button"
                                onClick={stopEditHighlight}
                              >
                                Hecho
                              </button>
                            </div>
                          </div>
                        )}
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
                      data-testid="collaboration-title-input"
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
                        data-testid="collaboration-icon-input"
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
                    data-testid="collaboration-description-input"
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
