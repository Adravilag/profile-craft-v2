/**
 * Tests for useAccessibility hook
 * Covers keyboard navigation, focus management, and ARIA announcements
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAccessibility } from './useAccessibility';

// Mock the accessibility utils module
vi.mock('@utils/accessibilityUtils', () => ({
  announceToScreenReader: vi.fn(),
  getFocusableElements: vi.fn(() => []),
  trapFocus: vi.fn(),
  handleEditorKeyboardShortcut: vi.fn(() => false),
  prefersReducedMotion: vi.fn(() => false),
}));

describe('useAccessibility', () => {
  let mockOptions: any;
  let mockElement: HTMLDivElement;
  let mockTextarea: HTMLTextAreaElement;
  let mockButton: HTMLButtonElement;

  beforeEach(() => {
    mockOptions = {
      onModeChange: vi.fn(),
      onToolbarAction: vi.fn(),
      onMediaLibraryToggle: vi.fn(),
      onExternalPreviewToggle: vi.fn(),
    };

    // Create mock DOM elements
    mockElement = document.createElement('div');
    mockTextarea = document.createElement('textarea');
    mockButton = document.createElement('button');

    document.body.appendChild(mockElement);
    document.body.appendChild(mockTextarea);
    document.body.appendChild(mockButton);

    // Mock focus methods
    mockTextarea.focus = vi.fn();
    mockButton.focus = vi.fn();

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    document.body.removeChild(mockTextarea);
    document.body.removeChild(mockButton);
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.currentFocusIndex).toBe(0);
      expect(result.current.isReducedMotion).toBe(false);
      expect(result.current.editorRef.current).toBeNull();
      expect(result.current.toolbarRef.current).toBeNull();
      expect(result.current.modalRef.current).toBeNull();
    });

    it('should provide all expected functions', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(typeof result.current.focusEditor).toBe('function');
      expect(typeof result.current.focusToolbar).toBe('function');
      expect(typeof result.current.focusFirstToolbarButton).toBe('function');
      expect(typeof result.current.focusLastToolbarButton).toBe('function');
      expect(typeof result.current.handleToolbarKeyDown).toBe('function');
      expect(typeof result.current.handleEditorKeyDown).toBe('function');
      expect(typeof result.current.handleModalKeyDown).toBe('function');
      expect(typeof result.current.announceContentChange).toBe('function');
      expect(typeof result.current.announceModeChange).toBe('function');
      expect(typeof result.current.announceToolbarAction).toBe('function');
    });
  });

  describe('focus management', () => {
    it('should focus editor when focusEditor is called', () => {
      const { result } = renderHook(() => useAccessibility());

      // Set the ref
      act(() => {
        result.current.editorRef.current = mockTextarea;
      });

      act(() => {
        result.current.focusEditor();
      });

      expect(mockTextarea.focus).toHaveBeenCalled();
    });

    it('should handle null editor ref gracefully', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(() => {
        act(() => {
          result.current.focusEditor();
        });
      }).not.toThrow();
    });
  });

  describe('keyboard navigation', () => {
    it('should handle Escape key in toolbar', () => {
      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.editorRef.current = mockTextarea;
        result.current.toolbarRef.current = mockElement;
      });

      const mockEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      mockEvent.preventDefault = vi.fn();

      expect(() => {
        act(() => {
          result.current.handleToolbarKeyDown(mockEvent as any);
        });
      }).not.toThrow();
    });

    it('should handle F6 key for focus navigation', () => {
      const { result } = renderHook(() => useAccessibility());

      const mockEvent = new KeyboardEvent('keydown', { key: 'F6' });
      mockEvent.preventDefault = vi.fn();

      act(() => {
        result.current.handleEditorKeyDown(mockEvent as any);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle Escape key in editor', () => {
      const { result } = renderHook(() => useAccessibility(mockOptions));

      act(() => {
        result.current.editorRef.current = mockTextarea;
        result.current.modalRef.current = mockElement;
      });

      const mockEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      act(() => {
        result.current.handleEditorKeyDown(mockEvent as any);
      });

      expect(mockOptions.onMediaLibraryToggle).toHaveBeenCalledWith(false);
      expect(mockTextarea.focus).toHaveBeenCalled();
    });
  });

  describe('modal keyboard handling', () => {
    it('should handle Escape key in modal', () => {
      const { result } = renderHook(() => useAccessibility(mockOptions));

      act(() => {
        result.current.editorRef.current = mockTextarea;
        result.current.modalRef.current = mockElement;
      });

      const mockEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      mockEvent.preventDefault = vi.fn();

      act(() => {
        result.current.handleModalKeyDown(mockEvent as any);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOptions.onMediaLibraryToggle).toHaveBeenCalledWith(false);
      expect(mockTextarea.focus).toHaveBeenCalled();
    });
  });

  describe('announcements', () => {
    it('should provide announcement functions', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(() => {
        act(() => {
          result.current.announceContentChange('Content updated');
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.announceModeChange('html');
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.announceToolbarAction('bold');
        });
      }).not.toThrow();
    });

    it('should call onModeChange when announcing mode changes', () => {
      const { result } = renderHook(() => useAccessibility(mockOptions));

      act(() => {
        result.current.announceModeChange('html');
      });

      expect(mockOptions.onModeChange).toHaveBeenCalledWith('html');
    });
  });

  describe('reduced motion detection', () => {
    it('should update reduced motion preference when media query changes', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

      const { result } = renderHook(() => useAccessibility());

      expect(result.current.isReducedMotion).toBe(false);

      // Simulate media query change
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];
      act(() => {
        changeHandler({ matches: true });
      });

      expect(result.current.isReducedMotion).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle missing refs gracefully', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(() => {
        act(() => {
          result.current.focusToolbar();
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.focusFirstToolbarButton();
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.focusLastToolbarButton();
        });
      }).not.toThrow();
    });

    it('should handle keyboard events with missing refs', () => {
      const { result } = renderHook(() => useAccessibility());

      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      mockEvent.preventDefault = vi.fn();

      expect(() => {
        act(() => {
          result.current.handleToolbarKeyDown(mockEvent as any);
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.handleModalKeyDown(mockEvent as any);
        });
      }).not.toThrow();
    });
  });
});
