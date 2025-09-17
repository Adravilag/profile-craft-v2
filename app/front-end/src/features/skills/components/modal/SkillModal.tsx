import React, { useState, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { SkillModalProps } from '../../types/skills';
import type { LogoHubResult } from '../../types/skills';
import { loadJson } from '@/features/skills/utils/iconLoader';
import { normalizeSvgPath } from '@/features/skills/utils/skillUtils';
import { debugLog } from '@/utils/debugConfig';
import styles from './SkillModal.module.css';

const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'DevOps & Tools',
  'Data Science',
  'Mobile',
  'Cloud',
  'Testing',
  'UI/UX',
  'Security',
  'MCP',
  'Other',
];

const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  editingId,
  formData,
  skillsIcons,
  onClose,
  onSubmit,
  onFormChange,
  onFormChangeWithIcon,
  isAdmin = false,
  maxWidth,
  maxHeight,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [logoHubResults, setLogoHubResults] = useState<LogoHubResult[]>([]);
  const [logoHubLoading, setLogoHubLoading] = useState(false);
  const [showLogoHubSuggestions, setShowLogoHubSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Clear search state when modal closes
      setLogoHubResults([]);
      setShowLogoHubSuggestions(false);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [isOpen, searchTimeout]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstInput = modalRef.current.querySelector(
        'input, select, button, textarea'
      ) as HTMLElement | null;
      firstInput?.focus();
    }
  }, [isOpen]);

  // Actualizar el icono de preview cuando cambia el nombre
  useEffect(() => {
    if (formData.name && skillsIcons.length > 0) {
      const matchingIcon = skillsIcons.find(
        icon => icon.name.toLowerCase() === formData.name.toLowerCase()
      );
      setPreviewIcon(matchingIcon?.svg_path || null);
    } else {
      setPreviewIcon(null);
    }
  }, [formData.name, skillsIcons]);

  // Local search: use skillsIcons and local seed JSON (public) to provide suggestions
  let cachedSeed: any[] | null = null;
  const searchLogoHubFunction = async (query: string) => {
    const q = (query || '').toLowerCase().trim();
    if (!q || q.length < 2) {
      setLogoHubResults([]);
      setShowLogoHubSuggestions(false);
      setLogoHubLoading(false);
      return;
    }

    setLogoHubLoading(true);
    try {
      const results: LogoHubResult[] = [];

      // Search in provided skillsIcons first
      for (const icon of skillsIcons || []) {
        const name = (icon.name || '').toString();
        const slug = (icon as any).slug ? String((icon as any).slug) : '';
        if (
          name.toLowerCase().includes(q) ||
          slug.toLowerCase().includes(q) ||
          (icon.category || '').toLowerCase().includes(q)
        ) {
          results.push({
            id: slug || name.replace(/\s+/g, '-').toLowerCase(),
            name,
            description: icon.category || undefined,
            category: icon.category || undefined,
            tags: [],
            colors: { primary: (icon as any).color || '#000000' },
            files: {
              svg: normalizeSvgPath(
                (icon as any).svg_path ||
                  (icon as any).svg ||
                  `/assets/svg/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`
              ),
            },
            slug: slug || undefined,
          } as LogoHubResult);
        }
        if (results.length >= 8) break;
      }

      // If not enough results, search in local seed JSON (public/skill_settings.json)
      if (results.length < 8) {
        try {
          if (!cachedSeed) {
            const loaded = await loadJson<any[]>('/skill_settings.json');
            cachedSeed = Array.isArray(loaded) ? loaded : [];
          }
        } catch (e) {
          cachedSeed = [];
        }

        if (Array.isArray(cachedSeed)) {
          for (const s of cachedSeed as any[]) {
            const name = String(s.name || '');
            const slug = String(s.slug || name.replace(/\s+/g, '-').toLowerCase());
            if (results.find(r => r.id === slug)) continue;
            if (name.toLowerCase().includes(q) || slug.toLowerCase().includes(q)) {
              results.push({
                id: slug,
                name,
                description: s.category || undefined,
                category: s.category || undefined,
                tags: [],
                colors: { primary: s.color || '#000000' },
                files: { svg: normalizeSvgPath(s.svg || `/assets/svg/${slug}.svg`) },
                slug,
              } as LogoHubResult);
            }
            if (results.length >= 8) break;
          }
        }
      }

      setLogoHubResults(results);
      setShowLogoHubSuggestions(results.length > 0);
    } catch (err) {
      console.error('❌ [SkillModal] local search failed', err);
      setLogoHubResults([]);
      setShowLogoHubSuggestions(false);
    } finally {
      setLogoHubLoading(false);
    }
  };

  // Handle search input: clear external suggestions (external searches disabled)
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange(e);
    // Ensure no external suggestions are shown
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    setLogoHubResults([]);
    setShowLogoHubSuggestions(false);
    setLogoHubLoading(false);
  };

  // Handle LogoHub result selection
  const handleLogoHubSelect = async (result: LogoHubResult) => {
    const svgUrl = result.files.svg;
    if (svgUrl) {
      setPreviewIcon(svgUrl); // Auto-detect category - first try LogoHub category, then fallback to manual detection
      let suggestedCategory = formData.category;

      // Use LogoHub's category if available and map to our categories
      if (result.category) {
        const logoHubCategory = result.category.toLowerCase();
        switch (logoHubCategory) {
          case 'ai':
          case 'machine-learning':
            suggestedCategory = 'AI & Data Science';
            break;
          case 'cloud':
          case 'devops':
            suggestedCategory = 'DevOps & Tools';
            break;
          case 'fintech':
          case 'api':
            suggestedCategory = 'Backend';
            break;
          case 'design':
            suggestedCategory = 'Design & UI/UX';
            break;
          case 'gaming':
            suggestedCategory = 'Game Development';
            break;
          case 'analytics':
            suggestedCategory = 'AI & Data Science';
            break;
          default:
            // Keep manual detection as fallback
            break;
        }
      }

      // Manual detection based on name/tags if no category mapping worked
      if (suggestedCategory === formData.category) {
        const name = result.name.toLowerCase();
        const tags = result.tags?.join(' ').toLowerCase() || '';
        const searchText = `${name} ${tags}`;

        if (
          [
            'react',
            'vue',
            'angular',
            'svelte',
            'html',
            'css',
            'javascript',
            'typescript',
            'frontend',
          ].some(tech => searchText.includes(tech))
        ) {
          suggestedCategory = 'Frontend';
        } else if (
          ['node', 'python', 'java', 'go', 'rust', 'php', 'ruby', 'backend', 'api'].some(tech =>
            searchText.includes(tech)
          )
        ) {
          suggestedCategory = 'Backend';
        } else if (
          ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'devops', 'cloud'].some(
            tech => searchText.includes(tech)
          )
        ) {
          suggestedCategory = 'DevOps & Tools';
        } else if (
          ['android', 'ios', 'flutter', 'react native', 'mobile'].some(tech =>
            searchText.includes(tech)
          )
        ) {
          suggestedCategory = 'Mobile';
        } else if (
          ['machine learning', 'ai', 'artificial intelligence', 'data', 'analytics'].some(tech =>
            searchText.includes(tech)
          )
        ) {
          suggestedCategory = 'AI & Data Science';
        } else if (['game', 'unity', 'unreal', 'gaming'].some(tech => searchText.includes(tech))) {
          suggestedCategory = 'Game Development';
        }
      }

      console.log(
        `🏷️ [SkillModal] Categoría sugerida: "${suggestedCategory}" (original: "${result.category}")`
      );

      // Use the new handler if available, otherwise fallback to individual events
      if (onFormChangeWithIcon) {
        // Use the new handler and pass the chosen SVG URL as `svg_path`.
        // Do NOT write legacy `icon_class` here anymore — migration should normalize
        // legacy data in a single place (useSkillsIcons / backend) to avoid dupes.
        onFormChangeWithIcon({
          name: result.name,
          category: suggestedCategory,
          svg_path: svgUrl,
        });
      } else {
        // Fallback: create synthetic events
        const nameEvent = {
          target: {
            name: 'name',
            value: result.name,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onFormChange(nameEvent);

        // Update category if detected
        if (suggestedCategory !== formData.category) {
          const categoryEvent = {
            target: {
              name: 'category',
              value: suggestedCategory,
            },
          } as React.ChangeEvent<HTMLSelectElement>;

          onFormChange(categoryEvent);
        }
      }
    }

    setShowLogoHubSuggestions(false);
    setLogoHubResults([]);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    debugLog.dataLoading('🚀 SkillModal: Enviando formulario', formData);

    try {
      await onSubmit(e);
      handleClose();
    } catch (error) {
      debugLog.dataLoading('❌ SkillModal: Error al enviar formulario', error);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`}
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        ref={modalRef}
        style={{
          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || undefined,
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight || undefined,
        }}
      >
        <div className={styles.modalHeader}>
          <h2 id={titleId} className={styles.modalTitle}>
            <i className="fas fa-tools" aria-hidden="true"></i>
            {editingId ? 'Editar Habilidad' : 'Nueva Habilidad'}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label htmlFor="skillName" className={styles.label}>
                Nombre de la Habilidad *
                {logoHubLoading && <span className={styles.loadingIndicator}> 🔍 Buscando...</span>}
              </label>
              <div className={styles.inputContainer}>
                <input
                  id="skillName"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleNameInputChange}
                  className={styles.input}
                  placeholder="Ej: React, Python, Docker... (se buscará automáticamente)"
                  required
                  autoFocus
                  ref={searchRef}
                />

                {/* LogoHub Suggestions Dropdown */}
                {showLogoHubSuggestions && logoHubResults.length > 0 && (
                  <div className={styles.suggestionsDropdown}>
                    <div className={styles.suggestionsHeader}>
                      <i className="fas fa-search"></i>
                      Sugerencias:
                    </div>
                    {logoHubResults.map(result => (
                      <button
                        key={result.id}
                        type="button"
                        className={styles.suggestionItem}
                        onClick={() => handleLogoHubSelect(result)}
                      >
                        {result.files.svg && (
                          <img
                            src={result.files.svg}
                            alt={result.name}
                            className={styles.suggestionIcon}
                          />
                        )}
                        <div className={styles.suggestionInfo}>
                          <span className={styles.suggestionName}>{result.name}</span>
                          {result.category && (
                            <span className={styles.suggestionCategory}>{result.category}</span>
                          )}
                          {result.description && (
                            <span className={styles.suggestionDescription}>
                              {result.description.substring(0, 60)}
                              {result.description.length > 60 ? '...' : ''}
                            </span>
                          )}
                          {result.tags && result.tags.length > 0 && (
                            <div className={styles.suggestionTags}>
                              {result.tags.slice(0, 3).map(tag => (
                                <span key={tag} className={styles.suggestionTag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={styles.suggestionActions}>
                          {result.colors?.primary && (
                            <div
                              className={styles.colorPreview}
                              style={{ backgroundColor: result.colors.primary }}
                              title={`Color principal: ${result.colors.primary}`}
                            />
                          )}
                          <i className="fas fa-plus" aria-hidden="true"></i>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="skillCategory" className={styles.label}>
                Categoría *
              </label>
              <select
                id="skillCategory"
                name="category"
                value={formData.category}
                onChange={onFormChange}
                className={styles.select}
                required
              >
                {SKILL_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="skillLevel" className={styles.label}>
                Nivel de Dominio: {formData.level}%
              </label>
              <input
                id="skillLevel"
                name="level"
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.level}
                onChange={onFormChange}
                className={styles.range}
                style={
                  {
                    '--range-progress': `${formData.level}%`,
                  } as React.CSSProperties
                }
              />
              <div className={styles.rangeLabels}>
                <span>Principiante</span>
                <span>Intermedio</span>
                <span>Avanzado</span>
                <span>Experto</span>
              </div>
            </div>

            {isAdmin && (
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    name="featured"
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={onFormChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    <i className="fas fa-star"></i>
                    Destacar esta habilidad
                  </span>
                </label>
              </div>
            )}

            {previewIcon && (
              <div className={styles.iconPreview}>
                <span className={styles.previewLabel}>Vista previa del icono:</span>
                <img
                  src={previewIcon}
                  alt={`Icono de ${formData.name}`}
                  className={styles.previewIcon}
                />
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleClose}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                <i className="fas fa-times"></i>
                Cancelar
              </button>
              <button
                type="submit"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={!formData.name.trim() || !formData.category.trim()}
              >
                <i className={editingId ? 'fas fa-save' : 'fas fa-plus'}></i>
                {editingId ? 'Guardar Cambios' : 'Añadir Habilidad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SkillModal;
