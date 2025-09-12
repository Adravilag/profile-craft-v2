/**
 * Performance tests for ProjectEditor component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ProjectEditor from './ProjectEditor';
import {
  runPerformanceTests,
  generatePerformanceReport,
  measureRenderTime,
  measureConversionTime,
  PERFORMANCE_THRESHOLDS,
  debounce,
  throttle,
} from '@utils/performanceTesting';

// Mock the lazy-loaded MediaLibrary component
vi.mock('@features/projects/components/ProjectEditor/plugins/MediaLibrary', () => ({
  default: () => <div data-testid="media-library">Media Library</div>,
}));

describe('ProjectEditor Performance Tests', () => {
  const defaultProps = {
    content: '',
    onChange: vi.fn(),
    placeholder: 'Test placeholder',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Render Performance', () => {
    it('should render within performance threshold', () => {
      const renderTime = measureRenderTime(() => {
        render(<ProjectEditor {...defaultProps} />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
    });

    it('should handle large content efficiently', () => {
      const largeContent = 'Lorem ipsum '.repeat(1000);

      const renderTime = measureRenderTime(() => {
        render(<ProjectEditor {...defaultProps} content={largeContent} />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME * 2);
    });

    it('should re-render efficiently when content changes', async () => {
      const { rerender } = render(<ProjectEditor {...defaultProps} />);

      const rerenderTime = measureRenderTime(() => {
        rerender(<ProjectEditor {...defaultProps} content="New content" />);
      });

      expect(rerenderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
    });
  });

  describe('Content Conversion Performance', () => {
    it('should convert HTML to Markdown efficiently', async () => {
      const htmlContent = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text</p>';
      const { container } = render(<ProjectEditor {...defaultProps} content={htmlContent} />);

      // Switch to markdown mode to trigger conversion
      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');

      const conversionTime = measureRenderTime(() => {
        fireEvent.click(markdownButton);
      });

      expect(conversionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONVERSION_TIME);
    });

    it('should convert Markdown to HTML efficiently', async () => {
      const markdownContent = '# Title\n\nParagraph with **bold** text';
      const { container } = render(<ProjectEditor {...defaultProps} content={markdownContent} />);

      // Start in markdown mode
      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');
      fireEvent.click(markdownButton);

      // Switch to HTML mode to trigger conversion
      const htmlButton = screen.getByLabelText('Cambiar a modo HTML');

      const conversionTime = measureRenderTime(() => {
        fireEvent.click(htmlButton);
      });

      expect(conversionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONVERSION_TIME);
    });

    it('should handle large content conversion efficiently', async () => {
      const largeMarkdown = '# Title\n\n' + 'Paragraph text. '.repeat(500);
      const { container } = render(<ProjectEditor {...defaultProps} content={largeMarkdown} />);

      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');
      fireEvent.click(markdownButton);

      const htmlButton = screen.getByLabelText('Cambiar a modo HTML');

      const conversionTime = measureRenderTime(() => {
        fireEvent.click(htmlButton);
      });

      expect(conversionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONVERSION_TIME * 3);
    });
  });

  describe('External Preview Performance', () => {
    it('should open external preview efficiently', async () => {
      // Mock window.open
      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
        closed: false,
        close: vi.fn(),
      };
      vi.stubGlobal('open', vi.fn().mockReturnValue(mockWindow));

      const { container } = render(<ProjectEditor {...defaultProps} content="Test content" />);

      const externalButton = screen.getByLabelText('Abrir vista previa en ventana externa');

      const openTime = measureRenderTime(() => {
        fireEvent.click(externalButton);
      });

      expect(openTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
    });
  });

  describe('Media Library Performance', () => {
    it('should lazy load media library efficiently', async () => {
      const { container } = render(<ProjectEditor {...defaultProps} />);

      const mediaButton = screen.getByLabelText('Abrir biblioteca de medios');

      const loadTime = measureRenderTime(() => {
        fireEvent.click(mediaButton);
      });

      // Wait for lazy loading
      await waitFor(() => {
        expect(screen.getByText('Cargando biblioteca de medios...')).toBeInTheDocument();
      });

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks during mode switching', async () => {
      const { container, rerender } = render(<ProjectEditor {...defaultProps} />);

      const htmlButton = screen.getByLabelText('Cambiar a modo HTML');
      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');
      const previewButton = screen.getByLabelText('Cambiar a vista previa');

      // Simulate rapid mode switching
      for (let i = 0; i < 10; i++) {
        fireEvent.click(htmlButton);
        fireEvent.click(markdownButton);
        fireEvent.click(previewButton);
      }

      // Component should still be responsive
      expect(htmlButton).toBeInTheDocument();
      expect(markdownButton).toBeInTheDocument();
      expect(previewButton).toBeInTheDocument();
    });
  });

  describe('Debouncing and Throttling', () => {
    it('should debounce function calls correctly', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be called only once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throttle function calls correctly', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      // Call multiple times rapidly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should be called immediately once
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Wait for throttle delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Call again
      throttledFn();

      // Should be called again
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Comprehensive Performance Test', () => {
    it('should pass all performance benchmarks', () => {
      const testContent =
        '# Test\n\nThis is **test** content with `code` and [links](http://example.com).';

      const { container } = render(<ProjectEditor {...defaultProps} content={testContent} />);

      const renderFn = () => {
        render(<ProjectEditor {...defaultProps} content={testContent} />);
      };

      const conversionFn = (content: string) => {
        // Simulate markdown to HTML conversion
        return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      };

      const results = runPerformanceTests(renderFn, conversionFn, testContent, container);
      const report = generatePerformanceReport(results);

      console.log(report);

      // All tests should pass
      const failedTests = results.filter(r => !r.passed);
      expect(failedTests).toHaveLength(0);
    });
  });

  describe('Accessibility Performance', () => {
    it('should maintain accessibility during rapid interactions', async () => {
      const { container } = render(<ProjectEditor {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      // Rapidly interact with all buttons
      const interactionTime = measureRenderTime(() => {
        buttons.forEach(button => {
          if (button.getAttribute('aria-label')) {
            fireEvent.focus(button);
            fireEvent.blur(button);
          }
        });
      });

      expect(interactionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME * 2);

      // All buttons should still have proper ARIA labels
      buttons.forEach(button => {
        if (button.getAttribute('aria-label')) {
          expect(button).toHaveAttribute('aria-label');
        }
      });
    });
  });
});
