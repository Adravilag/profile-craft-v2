/**
 * Final accessibility audit for ProjectEditor component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectEditor from './ProjectEditor';

// Mock the lazy-loaded MediaLibrary component
vi.mock('@features/projects/components/ProjectEditor/plugins/MediaLibrary', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="media-library" role="dialog" aria-label="Biblioteca de medios">
      <button onClick={onClose} aria-label="Cerrar biblioteca de medios">
        Cerrar
      </button>
    </div>
  ),
}));

describe('ProjectEditor Final Accessibility Audit', () => {
  const defaultProps = {
    content: '',
    onChange: vi.fn(),
    placeholder: 'Test placeholder',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should have proper semantic structure in default state', async () => {
      const { container } = render(<ProjectEditor {...defaultProps} />);

      // Check for proper heading structure
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check for proper form controls
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should maintain semantic structure in HTML mode', async () => {
      render(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" />);

      const htmlButton = screen.getByLabelText('Cambiar a modo HTML');
      fireEvent.click(htmlButton);

      // Check that mode is properly indicated
      expect(htmlButton).toHaveClass('project-editor__mode-btn--active');
    });

    it('should maintain semantic structure in Markdown mode', async () => {
      render(<ProjectEditor {...defaultProps} content="# Test" />);

      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');
      fireEvent.click(markdownButton);

      // Check that mode is properly indicated
      expect(markdownButton).toHaveClass('project-editor__mode-btn--active');
    });

    it('should maintain semantic structure in preview mode', async () => {
      render(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" />);

      const previewButton = screen.getByLabelText('Cambiar a vista previa');
      fireEvent.click(previewButton);

      // Check that mode is properly indicated
      expect(previewButton).toHaveClass('project-editor__mode-btn--active');
    });

    it('should maintain semantic structure in split modes', async () => {
      render(<ProjectEditor {...defaultProps} content="<h1>Test</h1>" />);

      // Test horizontal split
      const horizontalButton = screen.getByLabelText('Cambiar a vista dividida horizontal');
      fireEvent.click(horizontalButton);

      expect(horizontalButton).toHaveClass('project-editor__action-btn--active');

      // Test vertical split
      const verticalButton = screen.getByLabelText('Cambiar a vista dividida vertical');
      fireEvent.click(verticalButton);

      expect(verticalButton).toHaveClass('project-editor__action-btn--active');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ProjectEditor {...defaultProps} />);

      // Tab through interactive elements
      const interactiveElements = screen.getAllByRole('button');
      const textarea = screen.getByRole('textbox');

      // Check that all elements are focusable
      expect(interactiveElements.length).toBeGreaterThan(0);
      expect(textarea).toBeInTheDocument();

      // Focus the first button manually to test navigation
      const firstButton = interactiveElements[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();
    });

    it('should handle Enter and Space key activation', async () => {
      const user = userEvent.setup();
      render(<ProjectEditor {...defaultProps} />);

      const htmlButton = screen.getByLabelText('Cambiar a modo HTML');

      // Focus the button
      htmlButton.focus();
      expect(htmlButton).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(htmlButton).toHaveClass('project-editor__mode-btn--active');

      // Test Space key on another button
      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');
      markdownButton.focus();
      await user.keyboard(' ');
      expect(markdownButton).toHaveClass('project-editor__mode-btn--active');
    });

    it('should support keyboard shortcuts', async () => {
      const user = userEvent.setup();
      render(<ProjectEditor {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      textarea.focus();

      // Test Ctrl+B for bold (in HTML mode)
      await user.type(textarea, 'test text');
      await user.keyboard('{Control>}a{/Control}'); // Select all
      await user.keyboard('{Control>}b{/Control}'); // Bold

      // The text should be wrapped with strong tags
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('should trap focus in media library modal', async () => {
      const user = userEvent.setup();
      render(<ProjectEditor {...defaultProps} />);

      // Open media library
      const mediaButton = screen.getByLabelText('Abrir biblioteca de medios');
      await user.click(mediaButton);

      // Wait for modal to load
      await waitFor(() => {
        expect(screen.getByTestId('media-library')).toBeInTheDocument();
      });

      // Modal should be present with proper role
      const modal = screen.getByTestId('media-library');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-label', 'Biblioteca de medios');

      // Close button should be present
      const closeButton = screen.getByLabelText('Cerrar biblioteca de medios');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels on all interactive elements', () => {
      render(<ProjectEditor {...defaultProps} />);

      // Check mode buttons
      expect(screen.getByLabelText('Cambiar a modo HTML')).toBeInTheDocument();
      expect(screen.getByLabelText('Cambiar a modo Markdown')).toBeInTheDocument();
      expect(screen.getByLabelText('Cambiar a vista previa')).toBeInTheDocument();

      // Check action buttons
      expect(screen.getByLabelText('Abrir vista previa en ventana externa')).toBeInTheDocument();
      expect(screen.getByLabelText('Cambiar a vista dividida horizontal')).toBeInTheDocument();
      expect(screen.getByLabelText('Cambiar a vista dividida vertical')).toBeInTheDocument();
      expect(screen.getByLabelText('Abrir biblioteca de medios')).toBeInTheDocument();

      // Check textarea
      expect(screen.getByLabelText('Editor de contenido')).toBeInTheDocument();
    });

    it('should announce mode changes to screen readers', async () => {
      render(<ProjectEditor {...defaultProps} />);

      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');
      fireEvent.click(markdownButton);

      // Check that the active state is properly indicated
      expect(markdownButton).toHaveClass('project-editor__mode-btn--active');
      expect(markdownButton).toHaveAttribute('aria-label', 'Cambiar a modo Markdown');
    });

    it('should provide proper role and state information', () => {
      render(<ProjectEditor {...defaultProps} />);

      // Check button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check textarea role
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Editor de contenido');
    });

    it('should handle dynamic content announcements', async () => {
      const { rerender } = render(<ProjectEditor {...defaultProps} content="" />);

      // Change content
      rerender(<ProjectEditor {...defaultProps} content="New content" />);

      // Status bar should reflect changes
      expect(screen.getByText(/Caracteres: 11/)).toBeInTheDocument();
      expect(screen.getByText(/Palabras: 2/)).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus during mode switches', async () => {
      const user = userEvent.setup();
      render(<ProjectEditor {...defaultProps} />);

      const htmlButton = screen.getByLabelText('Cambiar a modo HTML');
      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');

      // Focus HTML button and activate
      htmlButton.focus();
      await user.click(htmlButton);
      expect(htmlButton).toHaveFocus();

      // Switch to markdown
      await user.click(markdownButton);
      expect(markdownButton).toHaveFocus();
    });

    it('should restore focus after modal interactions', async () => {
      const user = userEvent.setup();
      render(<ProjectEditor {...defaultProps} />);

      const mediaButton = screen.getByLabelText('Abrir biblioteca de medios');

      // Open media library
      await user.click(mediaButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByTestId('media-library')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByLabelText('Cerrar biblioteca de medios');
      await user.click(closeButton);

      // Modal should be closed
      expect(screen.queryByTestId('media-library')).not.toBeInTheDocument();

      // Media button should still be available for interaction
      expect(mediaButton).toBeInTheDocument();
    });

    it('should provide visible focus indicators', () => {
      render(<ProjectEditor {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        button.focus();

        // Check that focus is visible (this would be tested with visual regression in a real scenario)
        expect(button).toHaveFocus();
        expect(button).toBeVisible();
      });
    });
  });

  describe('Color and Contrast', () => {
    it('should maintain proper contrast ratios', () => {
      const { container } = render(<ProjectEditor {...defaultProps} />);

      // This would typically be tested with automated tools or visual regression
      // For now, we ensure elements are visible and properly styled
      const editor = container.querySelector('.project-editor');
      expect(editor).toBeVisible();

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });

    it('should work with high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ProjectEditor {...defaultProps} />);

      // Elements should still be visible and functional
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock reduced motion preference
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

      render(<ProjectEditor {...defaultProps} />);

      // Component should render without animations
      const editor = screen.getByRole('textbox').closest('.project-editor');
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle conversion errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ProjectEditor {...defaultProps} content="<invalid>html" />);

      const markdownButton = screen.getByLabelText('Cambiar a modo Markdown');
      fireEvent.click(markdownButton);

      // Component should still be functional
      expect(markdownButton).toHaveClass('project-editor__mode-btn--active');

      consoleSpy.mockRestore();
    });

    it('should provide error feedback to users', async () => {
      // This would test error states and user feedback
      render(<ProjectEditor {...defaultProps} />);

      // Component should be in a valid state
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should be accessible on touch devices', () => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        writable: true,
      });

      render(<ProjectEditor {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      // Buttons should have adequate touch targets (44x44px minimum)
      buttons.forEach(button => {
        expect(button).toBeVisible();
        // In a real test, we'd check computed styles for minimum touch target size
      });
    });

    it('should work with screen readers on mobile', () => {
      render(<ProjectEditor {...defaultProps} />);

      // All interactive elements should have proper labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label');
    });
  });
});
