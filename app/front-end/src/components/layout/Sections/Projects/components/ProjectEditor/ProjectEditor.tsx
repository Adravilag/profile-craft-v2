import React, { useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { useEditorModes, type EditorMode } from '@hooks/useEditorModes';
import { useEditorToolbar } from '@hooks/useEditorToolbar';
import { useMediaLibrary } from '@hooks/useMediaLibrary';
import { useExternalPreview } from '@hooks/useExternalPreview';
import '@styles/04-features/project-editor.css';

// Lazy load MediaLibrary component for better performance
const MediaLibrary = lazy(
  () => import('@features/projects/components/ProjectEditor/plugins/MediaLibrary')
);

interface ProjectEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({
  content,
  onChange,
  placeholder = 'Escribe el contenido de tu artículo aquí...',
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Custom hooks for editor functionality
  const { currentMode, setMode, convertContent } = useEditorModes('html');
  const {
    wrapWithTag,
    insertContent,
    formatSelection,
    insertHeader,
    insertList,
    formatMarkdown,
    insertMarkdownHeader,
    insertMarkdownList,
  } = useEditorToolbar(textAreaRef, content, onChange);
  const {
    isOpen: isMediaLibraryOpen,
    openLibrary: openMediaLibrary,
    closeLibrary: closeMediaLibrary,
    insertMedia,
  } = useMediaLibrary(textAreaRef, content, onChange);
  const { openExternalPreview, isExternalOpen } = useExternalPreview(content, currentMode);

  // Memoize expensive calculations
  const wordCount = useMemo(() => {
    return content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }, [content]);

  // Handle mode conversion when switching modes
  const handleModeChange = useCallback(
    (newMode: EditorMode) => {
      if (newMode !== currentMode) {
        const convertedContent = convertContent(content, currentMode, newMode);
        if (convertedContent !== content) {
          onChange(convertedContent);
        }
      }
      setMode(newMode);
    },
    [currentMode, content, convertContent, onChange, setMode]
  );

  // Handle media selection from library
  const handleMediaSelection = useCallback(
    (url: string) => {
      insertMedia(url, 'image'); // Default to image, could be enhanced to detect type
    },
    [insertMedia]
  );

  // Handle textarea content changes
  const handleTextAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  // Memoize preview content to avoid unnecessary re-renders
  const previewContent = useMemo(() => {
    if (currentMode === 'markdown') {
      return convertContent(content, 'markdown', 'html');
    }
    return content;
  }, [content, currentMode, convertContent]);

  // Render preview content
  const renderPreview = useCallback(() => {
    const hasContent = content && content.trim() !== '';

    if (!hasContent) {
      return (
        <div className="project-editor__preview-placeholder">
          <div className="project-editor__placeholder-icon">
            <i className="fas fa-eye" />
          </div>
          <div className="project-editor__placeholder-text">
            La vista previa del contenido aparecerá aquí
          </div>
          <div className="project-editor__placeholder-hint">
            Escribe algo en el editor para ver la vista previa
          </div>
        </div>
      );
    }

    return (
      <div className="project-editor__preview-content">
        <div className="project-content" dangerouslySetInnerHTML={{ __html: previewContent }} />
      </div>
    );
  }, [content, previewContent]);

  // Render toolbar based on current mode
  const renderToolbar = useCallback(() => {
    const isHtmlMode = currentMode === 'html';
    const isMarkdownMode = currentMode === 'markdown';
    const isSplitMode = currentMode === 'split-horizontal' || currentMode === 'split-vertical';

    return (
      <div className="project-editor__toolbar">
        {/* Mode selector */}
        <div className="project-editor__mode-selector">
          <button
            className={`project-editor__mode-btn ${
              currentMode === 'html' ? 'project-editor__mode-btn--active' : ''
            }`}
            onClick={() => handleModeChange('html')}
            title="Modo HTML"
            aria-label="Cambiar a modo HTML"
          >
            <i className="fas fa-code project-editor__mode-icon" />
            HTML
          </button>
          <button
            className={`project-editor__mode-btn ${
              currentMode === 'markdown' ? 'project-editor__mode-btn--active' : ''
            }`}
            onClick={() => handleModeChange('markdown')}
            title="Modo Markdown"
            aria-label="Cambiar a modo Markdown"
          >
            <i className="fab fa-markdown project-editor__mode-icon" />
            Markdown
          </button>
          <button
            className={`project-editor__mode-btn ${
              currentMode === 'preview' ? 'project-editor__mode-btn--active' : ''
            }`}
            onClick={() => handleModeChange('preview')}
            title="Solo vista previa"
            aria-label="Cambiar a vista previa"
          >
            <i className="fas fa-eye project-editor__mode-icon" />
            Vista previa
          </button>
        </div>

        {/* Additional actions */}
        <div className="project-editor__actions">
          <button
            className="project-editor__action-btn"
            onClick={openExternalPreview}
            title="Abrir vista previa en ventana externa"
            aria-label="Abrir vista previa en ventana externa"
          >
            <i className="fas fa-external-link-alt" />
            Ventana externa
          </button>

          <button
            className={`project-editor__action-btn ${
              currentMode === 'split-horizontal' ? 'project-editor__action-btn--active' : ''
            }`}
            onClick={() => handleModeChange('split-horizontal')}
            title="Vista dividida horizontal"
            aria-label="Cambiar a vista dividida horizontal"
          >
            <i className="fas fa-grip-lines" />
            Horizontal
          </button>

          <button
            className={`project-editor__action-btn ${
              currentMode === 'split-vertical' ? 'project-editor__action-btn--active' : ''
            }`}
            onClick={() => handleModeChange('split-vertical')}
            title="Vista dividida vertical"
            aria-label="Cambiar a vista dividida vertical"
          >
            <i className="fas fa-grip-lines-vertical" />
            Vertical
          </button>

          <button
            className="project-editor__action-btn"
            onClick={openMediaLibrary}
            title="Abrir biblioteca de medios"
            aria-label="Abrir biblioteca de medios"
          >
            <i className="fas fa-photo-video" />
            Medios
          </button>

          {isExternalOpen && (
            <div className="project-editor__external-indicator">
              <i className="fas fa-circle project-editor__external-icon" />
              Ventana externa abierta
            </div>
          )}
        </div>

        {/* Format toolbar for HTML mode */}
        {isHtmlMode && (
          <div className="project-editor__format-toolbar">
            <button
              onClick={() => formatSelection('bold')}
              title="Negrita"
              aria-label="Aplicar formato negrita"
            >
              <i className="fas fa-bold" />
            </button>
            <button
              onClick={() => formatSelection('italic')}
              title="Cursiva"
              aria-label="Aplicar formato cursiva"
            >
              <i className="fas fa-italic" />
            </button>
            <button
              onClick={() => formatSelection('code')}
              title="Código"
              aria-label="Aplicar formato código"
            >
              <i className="fas fa-code" />
            </button>
            <button
              onClick={() => insertHeader(1)}
              title="Encabezado H1"
              aria-label="Insertar encabezado H1"
            >
              H1
            </button>
            <button
              onClick={() => insertHeader(2)}
              title="Encabezado H2"
              aria-label="Insertar encabezado H2"
            >
              H2
            </button>
            <button
              onClick={() => insertList('ul')}
              title="Lista no ordenada"
              aria-label="Insertar lista no ordenada"
            >
              <i className="fas fa-list-ul" />
            </button>
            <button
              onClick={() => insertList('ol')}
              title="Lista ordenada"
              aria-label="Insertar lista ordenada"
            >
              <i className="fas fa-list-ol" />
            </button>
          </div>
        )}

        {/* Format toolbar for Markdown mode */}
        {isMarkdownMode && (
          <div className="project-editor__format-toolbar">
            <button
              onClick={() => formatMarkdown('bold')}
              title="Negrita"
              aria-label="Aplicar formato negrita"
            >
              <i className="fas fa-bold" />
            </button>
            <button
              onClick={() => formatMarkdown('italic')}
              title="Cursiva"
              aria-label="Aplicar formato cursiva"
            >
              <i className="fas fa-italic" />
            </button>
            <button
              onClick={() => formatMarkdown('code')}
              title="Código"
              aria-label="Aplicar formato código"
            >
              <i className="fas fa-code" />
            </button>
            <button
              onClick={() => insertMarkdownHeader(1)}
              title="Encabezado H1"
              aria-label="Insertar encabezado H1"
            >
              H1
            </button>
            <button
              onClick={() => insertMarkdownHeader(2)}
              title="Encabezado H2"
              aria-label="Insertar encabezado H2"
            >
              H2
            </button>
            <button
              onClick={() => insertMarkdownList('ul')}
              title="Lista no ordenada"
              aria-label="Insertar lista no ordenada"
            >
              <i className="fas fa-list-ul" />
            </button>
            <button
              onClick={() => insertMarkdownList('ol')}
              title="Lista ordenada"
              aria-label="Insertar lista ordenada"
            >
              <i className="fas fa-list-ol" />
            </button>
          </div>
        )}
      </div>
    );
  }, [
    currentMode,
    handleModeChange,
    openExternalPreview,
    isExternalOpen,
    openMediaLibrary,
    formatSelection,
    insertHeader,
    insertList,
    formatMarkdown,
    insertMarkdownHeader,
    insertMarkdownList,
  ]);

  // Memoize CSS classes to avoid recalculation on every render
  const editorClasses = useMemo(() => {
    return [
      'project-editor',
      currentMode === 'split-horizontal' && 'project-editor--split-horizontal',
      currentMode === 'split-vertical' && 'project-editor--split-vertical',
      (currentMode === 'split-horizontal' || currentMode === 'split-vertical') &&
        'project-editor--split-mode',
    ]
      .filter(Boolean)
      .join(' ');
  }, [currentMode]);

  return (
    <div className={editorClasses}>
      {/* Media Library Modal - Lazy loaded with Suspense */}
      {isMediaLibraryOpen && (
        <Suspense
          fallback={
            <div className="media-library-loading">
              <div className="media-library-loading__spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
              <p>Cargando biblioteca de medios...</p>
            </div>
          }
        >
          <MediaLibrary onSelect={handleMediaSelection} onClose={closeMediaLibrary} />
        </Suspense>
      )}

      {/* Toolbar */}
      {renderToolbar()}

      {/* Content Area */}
      <div className="project-editor__content">
        {/* Editor Container - shown in all modes except preview-only */}
        {currentMode !== 'preview' && (
          <div className="project-editor__editor-container">
            <textarea
              ref={textAreaRef}
              className="project-editor__textarea"
              value={content}
              onChange={handleTextAreaChange}
              placeholder={placeholder}
              aria-label="Editor de contenido"
              spellCheck="false"
            />
          </div>
        )}

        {/* Preview Container - shown in preview and split modes */}
        {(currentMode === 'preview' ||
          currentMode === 'split-horizontal' ||
          currentMode === 'split-vertical') && (
          <div className="project-editor__preview-container">
            <div className="project-editor__preview-header">
              <i className="fas fa-eye project-editor__preview-icon" />
              Vista previa
            </div>
            {renderPreview()}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="project-editor__status-bar">
        <div className="project-editor__status-info">
          <span>Modo: {currentMode}</span>
          <span>Caracteres: {content.length}</span>
          <span>Palabras: {wordCount}</span>
        </div>
        <div className="project-editor__status-shortcuts">
          <span>Ctrl+B: Negrita</span>
          <span>Ctrl+I: Cursiva</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
