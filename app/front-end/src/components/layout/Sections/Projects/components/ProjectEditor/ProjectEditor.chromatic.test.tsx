/**
 * Chromatic Visual Regression Tests for ProjectEditor
 *
 * This file contains tests specifically designed for Chromatic visual regression testing.
 * These tests ensure that the ProjectEditor component renders consistently across
 * different browsers, viewports, and states.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectEditor from './ProjectEditor';
import type { EditorMode } from '@hooks/useEditorModes';

// Mock all hooks for consistent visual testing
vi.mock('@hooks/useEditorModes');
vi.mock('@hooks/useEditorToolbar');
vi.mock('@hooks/useMediaLibrary');
vi.mock('@hooks/useExternalPreview');
vi.mock('@features/projects/components/ProjectEditor/plugins/MediaLibrary', () => ({
  default: () => null, // Don't render media library in visual tests
}));

describe('ProjectEditor Chromatic Visual Tests', () => {
  let mockEditorModes: any;
  let mockEditorToolbar: any;
  let mockMediaLibrary: any;
  let mockExternalPreview: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { useEditorModes } = await import('@hooks/useEditorModes');
    const { useEditorToolbar } = await import('@hooks/useEditorToolbar');
    const { useMediaLibrary } = await import('@hooks/useMediaLibrary');
    const { useExternalPreview } = await import('@hooks/useExternalPreview');

    mockEditorModes = {
      currentMode: 'html' as EditorMode,
      setMode: vi.fn(),
      convertContent: vi.fn((content: string) => content),
      isConverting: false,
    };

    mockEditorToolbar = {
      wrapWithTag: vi.fn(),
      insertContent: vi.fn(),
      formatSelection: vi.fn(),
      insertHeader: vi.fn(),
      insertList: vi.fn(),
      formatMarkdown: vi.fn(),
      insertMarkdownHeader: vi.fn(),
      insertMarkdownList: vi.fn(),
    };

    mockMediaLibrary = {
      isOpen: false,
      openLibrary: vi.fn(),
      closeLibrary: vi.fn(),
      insertMedia: vi.fn(),
    };

    mockExternalPreview = {
      openExternalPreview: vi.fn(),
      isExternalOpen: false,
    };

    vi.mocked(useEditorModes).mockReturnValue(mockEditorModes);
    vi.mocked(useEditorToolbar).mockReturnValue(mockEditorToolbar);
    vi.mocked(useMediaLibrary).mockReturnValue(mockMediaLibrary);
    vi.mocked(useExternalPreview).mockReturnValue(mockExternalPreview);
  });

  describe('Base States', () => {
    it('renders empty editor correctly', () => {
      const { container } = render(
        <ProjectEditor content="" onChange={vi.fn()} placeholder="Escribe aquí..." />
      );

      expect(container.firstChild).toMatchSnapshot('empty-editor');
    });

    it('renders with basic HTML content', () => {
      const { container } = render(
        <ProjectEditor content="<h1>Título</h1><p>Contenido básico</p>" onChange={vi.fn()} />
      );

      expect(container.firstChild).toMatchSnapshot('basic-html-content');
    });

    it('renders with complex HTML content', () => {
      const complexContent = `
        <h1>Proyecto Complejo</h1>
        <h2>Descripción</h2>
        <p>Este es un proyecto con <strong>contenido complejo</strong> que incluye:</p>
        <ul>
          <li>Listas no ordenadas</li>
          <li>Texto en <em>cursiva</em></li>
          <li>Enlaces a <a href="https://example.com">sitios web</a></li>
        </ul>
        <h3>Código de ejemplo</h3>
        <pre><code>const ejemplo = "Hola mundo";</code></pre>
        <ol>
          <li>Primer paso</li>
          <li>Segundo paso</li>
          <li>Tercer paso</li>
        </ol>
      `;

      const { container } = render(<ProjectEditor content={complexContent} onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('complex-html-content');
    });
  });

  describe('Editor Modes', () => {
    it('renders HTML mode correctly', () => {
      mockEditorModes.currentMode = 'html';

      const { container } = render(
        <ProjectEditor content="<h1>HTML Mode</h1>" onChange={vi.fn()} />
      );

      expect(container.firstChild).toMatchSnapshot('html-mode');
    });

    it('renders Markdown mode correctly', () => {
      mockEditorModes.currentMode = 'markdown';

      const { container } = render(<ProjectEditor content="# Markdown Mode" onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('markdown-mode');
    });

    it('renders Preview mode correctly', () => {
      mockEditorModes.currentMode = 'preview';

      const { container } = render(
        <ProjectEditor content="<h1>Preview Mode</h1><p>Solo vista previa</p>" onChange={vi.fn()} />
      );

      expect(container.firstChild).toMatchSnapshot('preview-mode');
    });

    it('renders Split Horizontal mode correctly', () => {
      mockEditorModes.currentMode = 'split-horizontal';

      const { container } = render(
        <ProjectEditor
          content="<h1>Split Horizontal</h1><p>Editor y preview lado a lado</p>"
          onChange={vi.fn()}
        />
      );

      expect(container.firstChild).toMatchSnapshot('split-horizontal-mode');
    });

    it('renders Split Vertical mode correctly', () => {
      mockEditorModes.currentMode = 'split-vertical';

      const { container } = render(
        <ProjectEditor
          content="<h1>Split Vertical</h1><p>Editor arriba, preview abajo</p>"
          onChange={vi.fn()}
        />
      );

      expect(container.firstChild).toMatchSnapshot('split-vertical-mode');
    });
  });

  describe('External Preview States', () => {
    it('renders with external preview closed', () => {
      mockExternalPreview.isExternalOpen = false;

      const { container } = render(
        <ProjectEditor content="<h1>External Preview Closed</h1>" onChange={vi.fn()} />
      );

      expect(container.firstChild).toMatchSnapshot('external-preview-closed');
    });

    it('renders with external preview open', () => {
      mockExternalPreview.isExternalOpen = true;

      const { container } = render(
        <ProjectEditor content="<h1>External Preview Open</h1>" onChange={vi.fn()} />
      );

      expect(container.firstChild).toMatchSnapshot('external-preview-open');
    });
  });

  describe('Content Length Variations', () => {
    it('renders with short content', () => {
      const { container } = render(<ProjectEditor content="<p>Corto</p>" onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('short-content');
    });

    it('renders with medium content', () => {
      const mediumContent = Array.from(
        { length: 10 },
        (_, i) => `<p>Párrafo ${i + 1} con contenido de longitud media.</p>`
      ).join('');

      const { container } = render(<ProjectEditor content={mediumContent} onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('medium-content');
    });

    it('renders with very long content', () => {
      const longContent = Array.from(
        { length: 50 },
        (_, i) =>
          `<h2>Sección ${i + 1}</h2><p>Este es un párrafo muy largo que demuestra cómo el editor maneja contenido extenso. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`
      ).join('');

      const { container } = render(<ProjectEditor content={longContent} onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('long-content');
    });
  });

  describe('Toolbar States', () => {
    it('renders HTML toolbar correctly', () => {
      mockEditorModes.currentMode = 'html';

      const { container } = render(
        <ProjectEditor content="<p>HTML toolbar test</p>" onChange={vi.fn()} />
      );

      const toolbar = container.querySelector('.project-editor__format-toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('html-toolbar');
    });

    it('renders Markdown toolbar correctly', () => {
      mockEditorModes.currentMode = 'markdown';

      const { container } = render(
        <ProjectEditor content="Markdown toolbar test" onChange={vi.fn()} />
      );

      const toolbar = container.querySelector('.project-editor__format-toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('markdown-toolbar');
    });
  });

  describe('Status Bar Variations', () => {
    it('renders status bar with empty content', () => {
      const { container } = render(<ProjectEditor content="" onChange={vi.fn()} />);

      const statusBar = container.querySelector('.project-editor__status-bar');
      expect(statusBar).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('status-bar-empty');
    });

    it('renders status bar with content statistics', () => {
      const content = 'Hola mundo esto es una prueba';

      const { container } = render(<ProjectEditor content={content} onChange={vi.fn()} />);

      const statusBar = container.querySelector('.project-editor__status-bar');
      expect(statusBar).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('status-bar-with-stats');
    });
  });

  describe('Preview Content Variations', () => {
    it('renders preview with empty content placeholder', () => {
      mockEditorModes.currentMode = 'preview';

      const { container } = render(<ProjectEditor content="" onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('preview-empty-placeholder');
    });

    it('renders preview with HTML content', () => {
      mockEditorModes.currentMode = 'preview';

      const { container } = render(
        <ProjectEditor
          content="<h1>Preview Content</h1><p>Contenido renderizado</p>"
          onChange={vi.fn()}
        />
      );

      expect(container.firstChild).toMatchSnapshot('preview-html-content');
    });

    it('renders preview with Markdown converted to HTML', () => {
      mockEditorModes.currentMode = 'preview';
      mockEditorModes.convertContent.mockReturnValue(
        '<h1>Converted Title</h1><p>Converted content</p>'
      );

      const { container } = render(
        <ProjectEditor content="# Converted Title\n\nConverted content" onChange={vi.fn()} />
      );

      expect(container.firstChild).toMatchSnapshot('preview-markdown-converted');
    });
  });

  describe('Responsive Breakpoints', () => {
    const testResponsiveBreakpoint = (width: number, name: string) => {
      // Mock window width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });

      const { container } = render(
        <ProjectEditor
          content="<h1>Responsive Test</h1><p>Testing responsive design</p>"
          onChange={vi.fn()}
        />
      );

      expect(container.firstChild).toMatchSnapshot(`responsive-${name}-${width}px`);
    };

    it('renders correctly at mobile breakpoint (375px)', () => {
      testResponsiveBreakpoint(375, 'mobile');
    });

    it('renders correctly at tablet breakpoint (768px)', () => {
      testResponsiveBreakpoint(768, 'tablet');
    });

    it('renders correctly at desktop breakpoint (1024px)', () => {
      testResponsiveBreakpoint(1024, 'desktop');
    });

    it('renders correctly at large desktop breakpoint (1440px)', () => {
      testResponsiveBreakpoint(1440, 'large-desktop');
    });
  });

  describe('Focus and Interaction States', () => {
    it('renders with focused textarea', () => {
      const { container } = render(<ProjectEditor content="Focused content" onChange={vi.fn()} />);

      const textarea = container.querySelector('.project-editor__textarea') as HTMLTextAreaElement;
      textarea?.focus();

      expect(container.firstChild).toMatchSnapshot('focused-textarea');
    });

    it('renders with active mode button', () => {
      mockEditorModes.currentMode = 'html';

      const { container } = render(<ProjectEditor content="Active mode test" onChange={vi.fn()} />);

      const activeButton = container.querySelector('.project-editor__mode-btn--active');
      expect(activeButton).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('active-mode-button');
    });
  });

  describe('Error and Edge Cases', () => {
    it('renders with malformed HTML content', () => {
      const malformedContent =
        '<h1>Unclosed header<p>Missing closing tag<div>Nested incorrectly</h1>';

      const { container } = render(<ProjectEditor content={malformedContent} onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('malformed-html');
    });

    it('renders with special characters', () => {
      const specialContent = '<h1>Título con acentos: ñáéíóú</h1><p>Símbolos: @#$%^&*()_+</p>';

      const { container } = render(<ProjectEditor content={specialContent} onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('special-characters');
    });

    it('renders with very long single line', () => {
      const longLine = '<p>' + 'A'.repeat(1000) + '</p>';

      const { container } = render(<ProjectEditor content={longLine} onChange={vi.fn()} />);

      expect(container.firstChild).toMatchSnapshot('very-long-line');
    });
  });

  describe('Accessibility Visual States', () => {
    it('renders with high contrast focus indicators', () => {
      const { container } = render(
        <ProjectEditor content="Accessibility test" onChange={vi.fn()} />
      );

      // Focus first button to show focus indicator
      const firstButton = container.querySelector('button');
      firstButton?.focus();

      expect(container.firstChild).toMatchSnapshot('accessibility-focus');
    });

    it('renders with proper ARIA attributes visible', () => {
      const { container } = render(<ProjectEditor content="ARIA test" onChange={vi.fn()} />);

      // Verify ARIA attributes are present
      const textarea = container.querySelector('textarea[aria-label]');
      const buttons = container.querySelectorAll('button[aria-label]');

      expect(textarea).toBeInTheDocument();
      expect(buttons.length).toBeGreaterThan(0);
      expect(container.firstChild).toMatchSnapshot('aria-attributes');
    });
  });
});
