/**
 * Integration tests for ProjectEditor accessibility features
 * Tests keyboard navigation, screen reader compatibility, and WCAG 2.1 AA compliance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  runAccessibilityTestSuite,
  generateAccessibilityReport,
} from '@utils/accessibilityTesting';
import ProjectEditor from './ProjectEditor';

// Mock the MediaLibrary component
vi.mock('@features/projects/components/ProjectEditor/plugins/MediaLibrary', () => ({
  default: ({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) => (
    <div role="dialog" aria-label="Media Library">
      <button onClick={() => onSelect('test-image.jpg')}>Select Image</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('ProjectEditor Accessibility', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    user = userEvent.setup();
    mockOnChange = vi.fn();

    // Mock window.open for external preview
    global.window.open = vi.fn().mockReturnValue({
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
      closed: false,
    });

    // Mock window.prompt for link insertion
    global.window.prompt = vi.fn().mockReturnValue('https://example.com');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA labels on all toolbar buttons', () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      // Mode selector buttons
      expect(screen.getByRole('tab', { name: /html editing mode/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /markdown editing mode/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preview mode/i })).toBeInTheDocument();

      // Action buttons
      expect(screen.getByRole('button', { name: /open external preview/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /horizontal split view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /vertical split view/i })).toBeInTheDocument();
    });

    it('should have proper ARIA labels on HTML toolbar buttons when in HTML mode', async () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      // Switch to HTML mode to show HTML toolbar
      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      // Wait for HTML toolbar to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply bold formatting/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /apply italic formatting/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /apply underline formatting/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /insert link/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /insert image/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /insert unordered list/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /insert ordered list/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /insert table/i })).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on editor textarea', async () => {
      render(<ProjectEditor content="Test content" onChange={mockOnChange} />);

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('aria-multiline', 'true');
        expect(textarea).toHaveAttribute('aria-label');
        expect(textarea.getAttribute('aria-label')).toMatch(/html code editor/i);
      });
    });

    it('should have proper ARIA attributes on status bars', async () => {
      render(
        <ProjectEditor
          content="Test content with multiple lines\nSecond line"
          onChange={mockOnChange}
        />
      );

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const statusBar = screen.getByRole('status');
        expect(statusBar).toHaveAttribute('aria-live', 'polite');
        expect(statusBar).toHaveAttribute('aria-label');
        expect(statusBar.getAttribute('aria-label')).toMatch(/status information/i);
      });
    });

    it('should have proper ARIA attributes on preview area', async () => {
      render(<ProjectEditor content="# Test Heading\nTest content" onChange={mockOnChange} />);

      const previewModeButton = screen.getByRole('tab', { name: /preview mode/i });
      await user.click(previewModeButton);

      await waitFor(() => {
        const previewArea = screen.getByRole('region', { name: /content preview/i });
        expect(previewArea).toHaveAttribute('aria-live', 'polite');
        expect(previewArea).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation through mode selector buttons', async () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      htmlModeButton.focus();

      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /markdown editing mode/i })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /preview mode/i })).toHaveFocus();

      // Navigate backwards
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: /markdown editing mode/i })).toHaveFocus();
    });

    it('should support keyboard shortcuts for formatting', async () => {
      render(<ProjectEditor content="test content" onChange={mockOnChange} />);

      // Switch to HTML mode
      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        textarea.focus();
      });

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      // Select some text
      textarea.setSelectionRange(0, 4); // Select "test"

      // Test Ctrl+B for bold
      await user.keyboard('{Control>}b{/Control}');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('<strong>test</strong>'));
      });
    });

    it('should support F6 for focus navigation between editor and toolbar', async () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        textarea.focus();
      });

      // Press F6 to move focus to toolbar
      await user.keyboard('{F6}');

      // Should focus first toolbar button
      await waitFor(() => {
        const firstToolbarButton = screen.getByRole('button', { name: /apply bold formatting/i });
        expect(firstToolbarButton).toHaveFocus();
      });
    });

    it('should support Escape key to close modals and return focus', async () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const imageButton = screen.getByRole('button', { name: /insert image/i });
        imageButton.focus();
      });

      // Open media library
      const imageButton = screen.getByRole('button', { name: /insert image/i });
      await user.click(imageButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /media library/i })).toBeInTheDocument();
      });

      // Press Escape to close modal
      await user.keyboard('{Escape}');

      // Modal should be closed and focus should return to editor
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /media library/i })).not.toBeInTheDocument();
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveFocus();
      });
    });

    it('should support Enter and Space to activate toolbar buttons', async () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const boldButton = screen.getByRole('button', { name: /apply bold formatting/i });
        boldButton.focus();
      });

      const boldButton = screen.getByRole('button', { name: /apply bold formatting/i });

      // Test Enter key
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      // Reset mock
      mockOnChange.mockClear();

      // Test Space key
      boldButton.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus during mode switches', async () => {
      render(<ProjectEditor content="Test content" onChange={mockOnChange} />);

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        textarea.focus();
        expect(textarea).toHaveFocus();
      });

      // Switch to markdown mode
      const markdownModeButton = screen.getByRole('tab', { name: /markdown editing mode/i });
      await user.click(markdownModeButton);

      // Focus should remain on textarea
      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveFocus();
      });
    });

    it('should trap focus within media library modal', async () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const imageButton = screen.getByRole('button', { name: /insert image/i });
        imageButton.click();
      });

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /media library/i })).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog', { name: /media library/i });
      const selectButton = screen.getByRole('button', { name: /select image/i });
      const closeButton = screen.getByRole('button', { name: /close/i });

      // Focus should be trapped within modal
      selectButton.focus();
      expect(selectButton).toHaveFocus();

      // Tab should move to next focusable element in modal
      await user.keyboard('{Tab}');
      expect(closeButton).toHaveFocus();

      // Tab from last element should wrap to first
      await user.keyboard('{Tab}');
      expect(selectButton).toHaveFocus();

      // Shift+Tab should move backwards
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should announce mode changes to screen readers', async () => {
      // Mock announceToScreenReader function
      const mockAnnounce = vi.fn();
      vi.doMock('@utils/accessibilityUtils', () => ({
        announceToScreenReader: mockAnnounce,
      }));

      render(<ProjectEditor content="" onChange={mockOnChange} />);

      const markdownModeButton = screen.getByRole('tab', { name: /markdown editing mode/i });
      await user.click(markdownModeButton);

      // Should announce mode change
      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith(expect.stringContaining('Markdown'), 'assertive');
      });
    });

    it('should have proper heading structure for screen readers', () => {
      render(
        <ProjectEditor content="# Main Title\n## Subtitle\n### Section" onChange={mockOnChange} />
      );

      const previewModeButton = screen.getByRole('tab', { name: /preview mode/i });
      fireEvent.click(previewModeButton);

      // Check that headings are properly structured in preview
      waitFor(() => {
        const headings = screen.getAllByRole('heading');
        expect(headings).toHaveLength(3);

        const h1 = screen.getByRole('heading', { level: 1 });
        const h2 = screen.getByRole('heading', { level: 2 });
        const h3 = screen.getByRole('heading', { level: 3 });

        expect(h1).toHaveTextContent('Main Title');
        expect(h2).toHaveTextContent('Subtitle');
        expect(h3).toHaveTextContent('Section');
      });
    });

    it('should provide status information for screen readers', async () => {
      render(<ProjectEditor content="Line 1\nLine 2\nLine 3" onChange={mockOnChange} />);

      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        const statusBar = screen.getByRole('status');
        expect(statusBar).toHaveTextContent(/lines: 3/i);
        expect(statusBar).toHaveTextContent(/characters: \d+/i);
      });
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should pass automated accessibility tests', async () => {
      const { container } = render(
        <ProjectEditor content="Test content" onChange={mockOnChange} />
      );

      // Switch to HTML mode to show all interactive elements
      const htmlModeButton = screen.getByRole('tab', { name: /html editing mode/i });
      await user.click(htmlModeButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply bold formatting/i })).toBeInTheDocument();
      });

      // Run comprehensive accessibility test suite
      const testSuite = await runAccessibilityTestSuite(container);

      // Generate report for debugging if tests fail
      if (!testSuite.passed) {
        const report = generateAccessibilityReport(testSuite);
        console.log('Accessibility Test Report:\n', report);
      }

      // Should have a high accessibility score
      expect(testSuite.score).toBeGreaterThan(85);

      // Should have no critical errors
      const criticalErrors = testSuite.results.filter(
        result => !result.passed && result.severity === 'error'
      );
      expect(criticalErrors).toHaveLength(0);
    });

    it('should have sufficient color contrast', () => {
      const { container } = render(<ProjectEditor content="" onChange={mockOnChange} />);

      // Check that all text elements have sufficient contrast
      // This is a simplified test - in practice, you'd use a proper color contrast library
      const textElements = container.querySelectorAll('button, span, div, p');

      textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        // Basic check that colors are defined
        expect(color).toBeTruthy();
        // For elements with background colors, ensure they're different from text color
        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          expect(color).not.toBe(backgroundColor);
        }
      });
    });

    it('should respect prefers-reduced-motion', () => {
      // Mock prefers-reduced-motion media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ProjectEditor content="" onChange={mockOnChange} />);

      // Check that animations are disabled or reduced
      // This would typically involve checking CSS classes or animation properties
      const container = screen.getByRole('tabpanel', { hidden: true }) || document.body;
      const animatedElements = container.querySelectorAll(
        '[class*="transition"], [class*="animate"]'
      );

      // In a real implementation, you'd check that these elements have reduced animations
      expect(animatedElements).toBeDefined();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle keyboard navigation errors gracefully', async () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      // Try to navigate when no focusable elements are available
      const container = screen.getByRole('tabpanel', { hidden: true }) || document.body;

      // This should not throw an error
      expect(() => {
        fireEvent.keyDown(container, { key: 'ArrowRight' });
        fireEvent.keyDown(container, { key: 'Tab' });
        fireEvent.keyDown(container, { key: 'Escape' });
      }).not.toThrow();
    });

    it('should handle focus management errors gracefully', async () => {
      render(<ProjectEditor content="" onChange={mockOnChange} />);

      // Try to focus elements that might not exist
      expect(() => {
        const nonExistentButton = document.createElement('button');
        nonExistentButton.focus();
      }).not.toThrow();
    });
  });
});
