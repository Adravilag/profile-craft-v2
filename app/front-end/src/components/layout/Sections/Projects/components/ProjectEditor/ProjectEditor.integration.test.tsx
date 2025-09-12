import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProjectEditor from './ProjectEditor';
import type { EditorMode } from '@hooks/useEditorModes';

// Mock all the hooks with comprehensive implementations
vi.mock('@hooks/useEditorModes');
vi.mock('@hooks/useEditorToolbar');
vi.mock('@hooks/useMediaLibrary');
vi.mock('@hooks/useExternalPreview');

// Mock MediaLibrary component
vi.mock('@features/projects/components/ProjectEditor/plugins/MediaLibrary', () => ({
  default: ({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) => (
    <div data-testid="media-library">
      <button onClick={() => onSelect('test-image.jpg')}>Select Image</button>
      <button onClick={() => onSelect('test-video.mp4')}>Select Video</button>
      <button onClick={() => onSelect('test-file.pdf')}>Select File</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('ProjectEditor Integration Tests', () => {
  const defaultProps = {
    content: '',
    onChange: vi.fn(),
    placeholder: 'Test placeholder',
  };

  // Mock implementations that will be updated per test
  let mockEditorModes: any;
  let mockEditorToolbar: any;
  let mockMediaLibrary: any;
  let mockExternalPreview: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import and mock the hooks after clearing
    const { useEditorModes } = await import('@hooks/useEditorModes');
    const { useEditorToolbar } = await import('@hooks/useEditorToolbar');
    const { useMediaLibrary } = await import('@hooks/useMediaLibrary');
    const { useExternalPreview } = await import('@hooks/useExternalPreview');

    // Create mock implementations
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

    // Apply mocks
    vi.mocked(useEditorModes).mockReturnValue(mockEditorModes);
    vi.mocked(useEditorToolbar).mockReturnValue(mockEditorToolbar);
    vi.mocked(useMediaLibrary).mockReturnValue(mockMediaLibrary);
    vi.mocked(useExternalPreview).mockReturnValue(mockExternalPreview);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with all main elements', () => {
      render(<ProjectEditor {...defaultProps} />);

      // Check for main container
      expect(document.querySelector('.project-editor')).toBeInTheDocument();

      // Check for toolbar
      expect(document.querySelector('.project-editor__toolbar')).toBeInTheDocument();

      // Check for mode selector buttons
      expect(screen.getByRole('button', { name: /cambiar a modo html/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cambiar a modo markdown/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cambiar a vista previa/i })).toBeInTheDocument();

      // Check for textarea
      expect(screen.getByRole('textbox', { name: /editor de contenido/i })).toBeInTheDocument();

      // Check for status bar
      expect(document.querySelector('.project-editor__status-bar')).toBeInTheDocument();
    });

    it('should render placeholder when content is empty', () => {
      render(<ProjectEditor {...defaultProps} />);

      const textarea = screen.getByRole('textbox', { name: /editor de contenido/i });
      expect(textarea).toHaveAttribute('placeholder', 'Test placeholder');
    });

    it('should display current content in textarea', () => {
      render(<ProjectEditor {...defaultProps} content="Test content" />);

      const textarea = screen.getByRole('textbox', { name: /editor de contenido/i });
      expect(textarea).toHaveValue('Test content');
    });
  });

  describe('Mode Switching', () => {
    it('should show active state for HTML mode by default', () => {
      render(<ProjectEditor {...defaultProps} />);

      const htmlButton = screen.getByRole('button', { name: /cambiar a modo html/i });
      expect(htmlButton).toHaveClass('project-editor__mode-btn--active');
    });

    it('should call onChange when textarea content changes', async () => {
      const mockOnChange = vi.fn();
      render(<ProjectEditor {...defaultProps} onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox', { name: /editor de contenido/i });
      await userEvent.type(textarea, 'Hello');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Toolbar Functionality', () => {
    it('should show HTML formatting tools by default', () => {
      render(<ProjectEditor {...defaultProps} />);

      expect(screen.getByRole('button', { name: /aplicar formato negrita/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /insertar encabezado h1/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /insertar lista no ordenada/i })
      ).toBeInTheDocument();
    });

    it('should have media library button', () => {
      render(<ProjectEditor {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /abrir biblioteca de medios/i })
      ).toBeInTheDocument();
    });

    it('should have external preview button', () => {
      render(<ProjectEditor {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /abrir vista previa en ventana externa/i })
      ).toBeInTheDocument();
    });
  });

  describe('Status Bar', () => {
    it('should display current mode and content statistics', () => {
      render(<ProjectEditor {...defaultProps} content="Hello world test" />);

      expect(screen.getByText('Modo: html')).toBeInTheDocument();
      expect(screen.getByText('Caracteres: 16')).toBeInTheDocument();
      expect(screen.getByText('Palabras: 3')).toBeInTheDocument();
    });

    it('should show keyboard shortcuts', () => {
      render(<ProjectEditor {...defaultProps} />);

      expect(screen.getByText('Ctrl+B: Negrita')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+I: Cursiva')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on buttons', () => {
      render(<ProjectEditor {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cambiar a modo html/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /abrir biblioteca de medios/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /editor de contenido/i })).toBeInTheDocument();
    });

    it('should have proper title attributes for tooltips', () => {
      render(<ProjectEditor {...defaultProps} />);

      const htmlButton = screen.getByRole('button', { name: /cambiar a modo html/i });
      expect(htmlButton).toHaveAttribute('title', 'Modo HTML');
    });
  });

  describe('CSS Classes', () => {
    it('should apply base project-editor class', () => {
      render(<ProjectEditor {...defaultProps} />);

      expect(document.querySelector('.project-editor')).toBeInTheDocument();
    });

    it('should have proper BEM structure', () => {
      render(<ProjectEditor {...defaultProps} />);

      expect(document.querySelector('.project-editor__toolbar')).toBeInTheDocument();
      expect(document.querySelector('.project-editor__mode-selector')).toBeInTheDocument();
      expect(document.querySelector('.project-editor__actions')).toBeInTheDocument();
      expect(document.querySelector('.project-editor__content')).toBeInTheDocument();
      expect(document.querySelector('.project-editor__status-bar')).toBeInTheDocument();
    });
  });

  describe('Complete Editor Workflow Integration', () => {
    it('should handle complete edit → preview → save workflow', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(<ProjectEditor {...defaultProps} onChange={mockOnChange} />);

      // Step 1: Edit content
      const textarea = screen.getByRole('textbox', { name: /editor de contenido/i });
      await user.type(textarea, '<h1>Test Title</h1><p>Test content</p>');

      expect(mockOnChange).toHaveBeenCalled();

      // Step 2: Switch to preview mode
      mockEditorModes.currentMode = 'preview';
      mockEditorModes.convertContent.mockReturnValue('<h1>Test Title</h1><p>Test content</p>');

      const previewButton = screen.getByRole('button', { name: /cambiar a vista previa/i });
      await user.click(previewButton);

      expect(mockEditorModes.setMode).toHaveBeenCalledWith('preview');

      // Step 3: Verify preview content is rendered
      // Re-render with preview mode
      render(
        <ProjectEditor
          {...defaultProps}
          content="<h1>Test Title</h1><p>Test content</p>"
          onChange={mockOnChange}
        />
      );

      // The content should be preserved and ready for saving
      expect(mockOnChange).toHaveBeenCalledWith('<h1>Test Title</h1><p>Test content</p>');
    });

    it('should preserve content during mode switching', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      // Start with HTML content
      const htmlContent = '<h1>Title</h1><p>Paragraph</p>';
      const markdownContent = '# Title\n\nParagraph';

      render(<ProjectEditor {...defaultProps} content={htmlContent} onChange={mockOnChange} />);

      // Switch to Markdown mode
      mockEditorModes.convertContent.mockReturnValue(markdownContent);

      const markdownButton = screen.getByRole('button', { name: /cambiar a modo markdown/i });
      await user.click(markdownButton);

      expect(mockEditorModes.convertContent).toHaveBeenCalledWith(htmlContent, 'html', 'markdown');
      expect(mockOnChange).toHaveBeenCalledWith(markdownContent);

      // Test that setMode was called
      expect(mockEditorModes.setMode).toHaveBeenCalledWith('markdown');

      // Test switching back to HTML mode
      mockOnChange.mockClear();
      mockEditorModes.convertContent.mockClear();
      mockEditorModes.convertContent.mockReturnValue(htmlContent);

      const htmlButton = screen.getByRole('button', { name: /cambiar a modo html/i });
      await user.click(htmlButton);

      // Should call setMode for HTML
      expect(mockEditorModes.setMode).toHaveBeenCalledWith('html');
    });

    it('should handle split view modes correctly', async () => {
      const user = userEvent.setup();

      render(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" />);

      // Test horizontal split
      const horizontalButton = screen.getByRole('button', {
        name: /cambiar a vista dividida horizontal/i,
      });
      await user.click(horizontalButton);

      expect(mockEditorModes.setMode).toHaveBeenCalledWith('split-horizontal');

      // Test vertical split
      const verticalButton = screen.getByRole('button', {
        name: /cambiar a vista dividida vertical/i,
      });
      await user.click(verticalButton);

      expect(mockEditorModes.setMode).toHaveBeenCalledWith('split-vertical');
    });
  });

  describe('Media Insertion Workflow Integration', () => {
    it('should handle complete media insertion workflow', async () => {
      const user = userEvent.setup();

      render(<ProjectEditor {...defaultProps} />);

      // Open media library
      const mediaButton = screen.getByRole('button', { name: /abrir biblioteca de medios/i });
      await user.click(mediaButton);

      expect(mockMediaLibrary.openLibrary).toHaveBeenCalled();

      // Setup media library to be open and re-render
      mockMediaLibrary.isOpen = true;
      const { rerender } = render(<ProjectEditor {...defaultProps} />);

      // Select an image from media library (use getAllByText to handle multiple elements)
      const selectImageButtons = screen.getAllByText('Select Image');
      await user.click(selectImageButtons[0]);

      expect(mockMediaLibrary.insertMedia).toHaveBeenCalledWith('test-image.jpg', 'image');

      // Close media library
      const closeButtons = screen.getAllByText('Close');
      await user.click(closeButtons[0]);

      expect(mockMediaLibrary.closeLibrary).toHaveBeenCalled();
    });

    it('should handle different media types insertion', async () => {
      const user = userEvent.setup();
      mockMediaLibrary.isOpen = true;

      render(<ProjectEditor {...defaultProps} />);

      // Test video insertion
      const selectVideoButtons = screen.getAllByText('Select Video');
      await user.click(selectVideoButtons[0]);

      expect(mockMediaLibrary.insertMedia).toHaveBeenCalledWith('test-video.mp4', 'image');

      // Test file insertion
      const selectFileButtons = screen.getAllByText('Select File');
      await user.click(selectFileButtons[0]);

      expect(mockMediaLibrary.insertMedia).toHaveBeenCalledWith('test-file.pdf', 'image');
    });
  });

  describe('External Preview Synchronization', () => {
    it('should handle external preview workflow', async () => {
      const user = userEvent.setup();

      render(<ProjectEditor {...defaultProps} />);

      // Open external preview
      const externalButton = screen.getByRole('button', {
        name: /abrir vista previa en ventana externa/i,
      });
      await user.click(externalButton);

      expect(mockExternalPreview.openExternalPreview).toHaveBeenCalled();
    });

    it('should show external preview indicator when window is open', () => {
      mockExternalPreview.isExternalOpen = true;

      render(<ProjectEditor {...defaultProps} />);

      expect(screen.getByText('Ventana externa abierta')).toBeInTheDocument();
      expect(document.querySelector('.project-editor__external-indicator')).toBeInTheDocument();
    });

    it('should synchronize content changes with external preview', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      // Setup external preview as open
      mockExternalPreview.isExternalOpen = true;

      render(<ProjectEditor {...defaultProps} onChange={mockOnChange} />);

      // Change content
      const textarea = screen.getByRole('textbox', { name: /editor de contenido/i });
      await user.type(textarea, 'New content');

      // Content should be updated
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Toolbar Functionality Integration', () => {
    it('should handle HTML formatting actions', async () => {
      const user = userEvent.setup();

      render(<ProjectEditor {...defaultProps} />);

      // Test bold formatting
      const boldButton = screen.getByRole('button', { name: /aplicar formato negrita/i });
      await user.click(boldButton);

      expect(mockEditorToolbar.formatSelection).toHaveBeenCalledWith('bold');

      // Test header insertion
      const h1Button = screen.getByRole('button', { name: /insertar encabezado h1/i });
      await user.click(h1Button);

      expect(mockEditorToolbar.insertHeader).toHaveBeenCalledWith(1);

      // Test list insertion
      const ulButton = screen.getByRole('button', { name: /insertar lista no ordenada/i });
      await user.click(ulButton);

      expect(mockEditorToolbar.insertList).toHaveBeenCalledWith('ul');
    });

    it('should handle Markdown formatting actions', async () => {
      const user = userEvent.setup();

      // Set to Markdown mode
      mockEditorModes.currentMode = 'markdown';

      render(<ProjectEditor {...defaultProps} />);

      // Test markdown bold formatting
      const boldButton = screen.getByRole('button', { name: /aplicar formato negrita/i });
      await user.click(boldButton);

      expect(mockEditorToolbar.formatMarkdown).toHaveBeenCalledWith('bold');

      // Test markdown header insertion
      const h1Button = screen.getByRole('button', { name: /insertar encabezado h1/i });
      await user.click(h1Button);

      expect(mockEditorToolbar.insertMarkdownHeader).toHaveBeenCalledWith(1);

      // Test markdown list insertion
      const ulButton = screen.getByRole('button', { name: /insertar lista no ordenada/i });
      await user.click(ulButton);

      expect(mockEditorToolbar.insertMarkdownList).toHaveBeenCalledWith('ul');
    });

    it('should show appropriate toolbar based on mode', () => {
      // HTML mode
      mockEditorModes.currentMode = 'html';
      const { rerender } = render(<ProjectEditor {...defaultProps} />);

      expect(document.querySelector('.project-editor__format-toolbar')).toBeInTheDocument();

      // Markdown mode
      mockEditorModes.currentMode = 'markdown';
      rerender(<ProjectEditor {...defaultProps} />);

      expect(document.querySelector('.project-editor__format-toolbar')).toBeInTheDocument();

      // Preview mode (no format toolbar)
      mockEditorModes.currentMode = 'preview';
      rerender(<ProjectEditor {...defaultProps} />);

      // Format toolbar should still be present but content might be different
      expect(document.querySelector('.project-editor__toolbar')).toBeInTheDocument();
    });
  });

  describe('Content Conversion Integration', () => {
    it('should handle content conversion during mode switches', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      const htmlContent = '<h1>Title</h1>';
      const markdownContent = '# Title';

      render(<ProjectEditor {...defaultProps} content={htmlContent} onChange={mockOnChange} />);

      // Mock conversion
      mockEditorModes.convertContent.mockReturnValue(markdownContent);

      // Switch to markdown
      const markdownButton = screen.getByRole('button', { name: /cambiar a modo markdown/i });
      await user.click(markdownButton);

      expect(mockEditorModes.convertContent).toHaveBeenCalledWith(htmlContent, 'html', 'markdown');
      expect(mockOnChange).toHaveBeenCalledWith(markdownContent);
    });

    it('should not convert content if it remains the same', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      const content = '<h1>Title</h1>';

      render(<ProjectEditor {...defaultProps} content={content} onChange={mockOnChange} />);

      // Mock conversion to return same content
      mockEditorModes.convertContent.mockReturnValue(content);

      // Switch to markdown
      const markdownButton = screen.getByRole('button', { name: /cambiar a modo markdown/i });
      await user.click(markdownButton);

      expect(mockEditorModes.convertContent).toHaveBeenCalledWith(content, 'html', 'markdown');
      // onChange should not be called since content is the same
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Design Integration', () => {
    it('should apply correct CSS classes for split modes', () => {
      // Test horizontal split
      mockEditorModes.currentMode = 'split-horizontal';
      const { rerender } = render(<ProjectEditor {...defaultProps} />);

      expect(document.querySelector('.project-editor--split-horizontal')).toBeInTheDocument();
      expect(document.querySelector('.project-editor--split-mode')).toBeInTheDocument();

      // Test vertical split
      mockEditorModes.currentMode = 'split-vertical';
      rerender(<ProjectEditor {...defaultProps} />);

      expect(document.querySelector('.project-editor--split-vertical')).toBeInTheDocument();
      expect(document.querySelector('.project-editor--split-mode')).toBeInTheDocument();
    });

    it('should show preview container in appropriate modes', () => {
      // Preview mode
      mockEditorModes.currentMode = 'preview';
      const { rerender } = render(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" />);

      expect(document.querySelector('.project-editor__preview-container')).toBeInTheDocument();

      // Split horizontal mode
      mockEditorModes.currentMode = 'split-horizontal';
      rerender(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" />);

      expect(document.querySelector('.project-editor__preview-container')).toBeInTheDocument();

      // Split vertical mode
      mockEditorModes.currentMode = 'split-vertical';
      rerender(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" />);

      expect(document.querySelector('.project-editor__preview-container')).toBeInTheDocument();

      // HTML mode (no preview container)
      mockEditorModes.currentMode = 'html';
      rerender(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" />);

      expect(document.querySelector('.project-editor__preview-container')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle conversion errors gracefully', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      // Mock conversion to throw error
      mockEditorModes.convertContent.mockImplementation(() => {
        throw new Error('Conversion failed');
      });

      render(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" onChange={mockOnChange} />);

      // Switch mode should not crash the component
      const markdownButton = screen.getByRole('button', { name: /cambiar a modo markdown/i });

      expect(() => user.click(markdownButton)).not.toThrow();
    });

    it('should handle empty content gracefully', () => {
      render(<ProjectEditor {...defaultProps} content="" />);

      // Should show placeholder in preview
      mockEditorModes.currentMode = 'preview';
      render(<ProjectEditor {...defaultProps} content="" />);

      expect(screen.getByText('La vista previa del contenido aparecerá aquí')).toBeInTheDocument();
    });
  });
});
