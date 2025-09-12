import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as stories from './ProjectEditor.stories';
import { EditorMode } from '@hooks/useEditorModes';

// Compose all stories for testing
const {
  Default,
  WithHTMLContent,
  WithMarkdownContent,
  EmptyState,
  LongContent,
  HTMLMode,
  MarkdownMode,
  PreviewMode,
  SplitHorizontal,
  SplitVertical,
  MobileView,
  TabletView,
  AccessibilityDemo,
  ErrorState,
  PerformanceTest,
  DarkTheme,
} = composeStories(stories);

describe('ProjectEditor Visual Regression Tests', () => {
  // Mock implementations that will be updated per test
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

  describe('Basic Rendering', () => {
    it('should render default state correctly', () => {
      const { container } = render(<Default />);

      // Check main structure is present
      expect(container.querySelector('.project-editor')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__toolbar')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__content')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__status-bar')).toBeInTheDocument();

      // Snapshot test for visual regression
      expect(container.firstChild).toMatchSnapshot('default-state');
    });

    it('should render empty state correctly', () => {
      const { container } = render(<EmptyState />);

      expect(container.querySelector('.project-editor__textarea')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('empty-state');
    });

    it('should render with HTML content correctly', () => {
      const { container } = render(<WithHTMLContent />);

      expect(container.querySelector('.project-editor__textarea')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('html-content-state');
    });

    it('should render with Markdown content correctly', () => {
      const { container } = render(<WithMarkdownContent />);

      expect(container.querySelector('.project-editor__textarea')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('markdown-content-state');
    });
  });

  describe('Mode-Specific Rendering', () => {
    it('should render HTML mode correctly', () => {
      mockEditorModes.currentMode = 'html';
      const { container } = render(<HTMLMode />);

      expect(container.querySelector('.project-editor__format-toolbar')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('html-mode');
    });

    it('should render Markdown mode correctly', () => {
      mockEditorModes.currentMode = 'markdown';
      const { container } = render(<MarkdownMode />);

      expect(container.querySelector('.project-editor__format-toolbar')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('markdown-mode');
    });

    it('should render Preview mode correctly', () => {
      mockEditorModes.currentMode = 'preview';
      const { container } = render(<PreviewMode />);

      expect(container.querySelector('.project-editor__preview-container')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('preview-mode');
    });

    it('should render Split Horizontal mode correctly', () => {
      mockEditorModes.currentMode = 'split-horizontal';
      const { container } = render(<SplitHorizontal />);

      expect(container.querySelector('.project-editor--split-horizontal')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__preview-container')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('split-horizontal-mode');
    });

    it('should render Split Vertical mode correctly', () => {
      mockEditorModes.currentMode = 'split-vertical';
      const { container } = render(<SplitVertical />);

      expect(container.querySelector('.project-editor--split-vertical')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__preview-container')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('split-vertical-mode');
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile view correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<MobileView />);

      expect(container.querySelector('.project-editor')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('mobile-view');
    });

    it('should render tablet view correctly', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(<TabletView />);

      expect(container.querySelector('.project-editor')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('tablet-view');
    });
  });

  describe('Content Variations', () => {
    it('should render long content correctly', () => {
      const { container } = render(<LongContent />);

      expect(container.querySelector('.project-editor__textarea')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('long-content');
    });

    it('should render performance test content correctly', () => {
      const { container } = render(<PerformanceTest />);

      expect(container.querySelector('.project-editor__textarea')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('performance-test-content');
    });
  });

  describe('Theme Variations', () => {
    it('should render dark theme correctly', () => {
      const { container } = render(<DarkTheme />);

      expect(container.querySelector('.project-editor')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('dark-theme');
    });
  });

  describe('Accessibility States', () => {
    it('should render accessibility demo correctly', () => {
      const { container } = render(<AccessibilityDemo />);

      // Check for accessibility attributes
      const buttons = container.querySelectorAll('button[aria-label]');
      expect(buttons.length).toBeGreaterThan(0);

      const textarea = container.querySelector('textarea[aria-label]');
      expect(textarea).toBeInTheDocument();

      expect(container.firstChild).toMatchSnapshot('accessibility-demo');
    });
  });

  describe('Error States', () => {
    it('should render error state correctly', () => {
      const { container } = render(<ErrorState />);

      expect(container.querySelector('.project-editor')).toBeInTheDocument();
      expect(container.firstChild).toMatchSnapshot('error-state');
    });
  });

  describe('CSS Class Structure', () => {
    it('should have correct BEM class structure', () => {
      const { container } = render(<Default />);

      // Check BEM structure
      expect(container.querySelector('.project-editor')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__toolbar')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__mode-selector')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__actions')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__content')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__editor-container')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__textarea')).toBeInTheDocument();
      expect(container.querySelector('.project-editor__status-bar')).toBeInTheDocument();

      // Check for modifier classes in split modes
      mockEditorModes.currentMode = 'split-horizontal';
      const splitHorizontal = render(<SplitHorizontal />);
      expect(
        splitHorizontal.container.querySelector('.project-editor--split-horizontal')
      ).toBeInTheDocument();
      expect(
        splitHorizontal.container.querySelector('.project-editor--split-mode')
      ).toBeInTheDocument();

      mockEditorModes.currentMode = 'split-vertical';
      const splitVertical = render(<SplitVertical />);
      expect(
        splitVertical.container.querySelector('.project-editor--split-vertical')
      ).toBeInTheDocument();
      expect(
        splitVertical.container.querySelector('.project-editor--split-mode')
      ).toBeInTheDocument();
    });

    it('should apply active states correctly', () => {
      const { container } = render(<HTMLMode />);

      // Check for active mode button
      const htmlButton = container.querySelector('.project-editor__mode-btn--active');
      expect(htmlButton).toBeInTheDocument();
    });
  });

  describe('Layout Consistency', () => {
    it('should maintain consistent layout across modes', () => {
      const htmlMode = render(<HTMLMode />);
      const markdownMode = render(<MarkdownMode />);
      const previewMode = render(<PreviewMode />);

      // All should have the same basic structure
      [htmlMode, markdownMode, previewMode].forEach(({ container }) => {
        expect(container.querySelector('.project-editor')).toBeInTheDocument();
        expect(container.querySelector('.project-editor__toolbar')).toBeInTheDocument();
        expect(container.querySelector('.project-editor__status-bar')).toBeInTheDocument();
      });
    });

    it('should maintain consistent spacing and alignment', () => {
      const { container } = render(<WithHTMLContent />);

      // Check for consistent spacing classes
      const toolbar = container.querySelector('.project-editor__toolbar');
      const content = container.querySelector('.project-editor__content');
      const statusBar = container.querySelector('.project-editor__status-bar');

      expect(toolbar).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(statusBar).toBeInTheDocument();

      // Verify layout structure
      expect(container.firstChild).toMatchSnapshot('layout-consistency');
    });
  });

  describe('Interactive Elements', () => {
    it('should render all interactive elements correctly', () => {
      const { container } = render(<Default />);

      // Check for all buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check for textarea
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();

      // Check for proper attributes
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
        expect(button).toHaveAttribute('title');
      });

      expect(textarea).toHaveAttribute('aria-label');
    });
  });
});

// Helper function for visual regression testing with different viewports
export const testResponsiveDesign = (component: React.ReactElement, testName: string) => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1200, height: 800 },
    { name: 'large', width: 1920, height: 1080 },
  ];

  viewports.forEach(viewport => {
    it(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      // Mock viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: viewport.width,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: viewport.height,
      });

      const { container } = render(component);

      expect(container.firstChild).toMatchSnapshot(`${testName}-${viewport.name}`);
    });
  });
};

// Test responsive design for key components
describe('Responsive Visual Regression', () => {
  testResponsiveDesign(<Default />, 'default-responsive');
  testResponsiveDesign(<WithHTMLContent />, 'html-content-responsive');
  testResponsiveDesign(<SplitHorizontal />, 'split-horizontal-responsive');
  testResponsiveDesign(<SplitVertical />, 'split-vertical-responsive');
});
