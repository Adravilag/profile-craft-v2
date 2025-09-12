/**
 * Custom hook for managing accessibility features in the ProjectEditor
 * Handles focus management, keyboard navigation, and ARIA announcements
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  announceToScreenReader,
  getFocusableElements,
  trapFocus,
  handleEditorKeyboardShortcut,
  prefersReducedMotion,
} from '@utils/accessibilityUtils';

export interface UseAccessibilityOptions {
  onModeChange?: (mode: string) => void;
  onToolbarAction?: (action: string) => void;
  onMediaLibraryToggle?: (isOpen: boolean) => void;
  onExternalPreviewToggle?: (isOpen: boolean) => void;
}

export interface UseAccessibilityReturn {
  // Focus management
  focusEditor: () => void;
  focusToolbar: () => void;
  focusFirstToolbarButton: () => void;
  focusLastToolbarButton: () => void;

  // Keyboard navigation
  handleToolbarKeyDown: (event: KeyboardEvent) => void;
  handleEditorKeyDown: (event: KeyboardEvent) => void;
  handleModalKeyDown: (event: KeyboardEvent) => void;

  // Announcements
  announceContentChange: (message: string) => void;
  announceModeChange: (mode: string) => void;
  announceToolbarAction: (action: string) => void;

  // State
  currentFocusIndex: number;
  isReducedMotion: boolean;

  // Refs for focus management
  editorRef: React.RefObject<HTMLTextAreaElement>;
  toolbarRef: React.RefObject<HTMLDivElement>;
  modalRef: React.RefObject<HTMLDivElement>;
}

export const useAccessibility = (options: UseAccessibilityOptions = {}): UseAccessibilityReturn => {
  const { onModeChange, onToolbarAction, onMediaLibraryToggle, onExternalPreviewToggle } = options;

  // Refs for focus management
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // State
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    setIsReducedMotion(prefersReducedMotion());

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Focus management functions
  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      announceToScreenReader('Editor focused');
    }
  }, []);

  const focusToolbar = useCallback(() => {
    if (toolbarRef.current) {
      const focusableElements = getFocusableElements(toolbarRef.current);
      if (focusableElements.length > 0) {
        focusableElements[currentFocusIndex]?.focus();
        announceToScreenReader('Toolbar focused');
      }
    }
  }, [currentFocusIndex]);

  const focusFirstToolbarButton = useCallback(() => {
    if (toolbarRef.current) {
      const focusableElements = getFocusableElements(toolbarRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        setCurrentFocusIndex(0);
        announceToScreenReader('First toolbar button focused');
      }
    }
  }, []);

  const focusLastToolbarButton = useCallback(() => {
    if (toolbarRef.current) {
      const focusableElements = getFocusableElements(toolbarRef.current);
      if (focusableElements.length > 0) {
        const lastIndex = focusableElements.length - 1;
        focusableElements[lastIndex].focus();
        setCurrentFocusIndex(lastIndex);
        announceToScreenReader('Last toolbar button focused');
      }
    }
  }, []);

  // Keyboard navigation handlers
  const handleToolbarKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!toolbarRef.current) return;

      const focusableElements = getFocusableElements(toolbarRef.current);
      if (focusableElements.length === 0) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = (currentFocusIndex + 1) % focusableElements.length;
          focusableElements[nextIndex].focus();
          setCurrentFocusIndex(nextIndex);
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex =
            currentFocusIndex === 0 ? focusableElements.length - 1 : currentFocusIndex - 1;
          focusableElements[prevIndex].focus();
          setCurrentFocusIndex(prevIndex);
          break;

        case 'Home':
          event.preventDefault();
          focusFirstToolbarButton();
          break;

        case 'End':
          event.preventDefault();
          focusLastToolbarButton();
          break;

        case 'Escape':
          event.preventDefault();
          focusEditor();
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          const currentElement = focusableElements[currentFocusIndex] as HTMLButtonElement;
          if (currentElement) {
            currentElement.click();
          }
          break;
      }
    },
    [currentFocusIndex, focusEditor, focusFirstToolbarButton, focusLastToolbarButton]
  );

  const handleEditorKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Handle keyboard shortcuts
      const shortcuts = {
        bold: () => {
          onToolbarAction?.('bold');
          announceToolbarAction('bold');
        },
        italic: () => {
          onToolbarAction?.('italic');
          announceToolbarAction('italic');
        },
        underline: () => {
          onToolbarAction?.('underline');
          announceToolbarAction('underline');
        },
        link: () => {
          onToolbarAction?.('link');
          announceToolbarAction('link');
        },
        h1: () => {
          onToolbarAction?.('h1');
          announceToolbarAction('heading 1');
        },
        h2: () => {
          onToolbarAction?.('h2');
          announceToolbarAction('heading 2');
        },
        h3: () => {
          onToolbarAction?.('h3');
          announceToolbarAction('heading 3');
        },
        h4: () => {
          onToolbarAction?.('h4');
          announceToolbarAction('heading 4');
        },
        h5: () => {
          onToolbarAction?.('h5');
          announceToolbarAction('heading 5');
        },
        h6: () => {
          onToolbarAction?.('h6');
          announceToolbarAction('heading 6');
        },
        quote: () => {
          onToolbarAction?.('quote');
          announceToolbarAction('blockquote');
        },
        table: () => {
          onToolbarAction?.('table');
          announceToolbarAction('table');
        },
        'list-ul': () => {
          onToolbarAction?.('list-ul');
          announceToolbarAction('unordered list');
        },
        'list-ol': () => {
          onToolbarAction?.('list-ol');
          announceToolbarAction('ordered list');
        },
      };

      const handled = handleEditorKeyboardShortcut(event, shortcuts);

      // Handle special navigation keys
      if (!handled) {
        switch (event.key) {
          case 'F6':
            event.preventDefault();
            if (event.shiftKey) {
              focusEditor();
            } else {
              focusFirstToolbarButton();
            }
            break;

          case 'Escape':
            // Close any open modals or return focus to editor
            if (modalRef.current) {
              onMediaLibraryToggle?.(false);
              focusEditor();
            }
            break;
        }
      }
    },
    [onToolbarAction, focusEditor, focusFirstToolbarButton, onMediaLibraryToggle]
  );

  const handleModalKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!modalRef.current) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onMediaLibraryToggle?.(false);
          focusEditor();
          break;

        case 'Tab':
          trapFocus(modalRef.current, event);
          break;
      }
    },
    [onMediaLibraryToggle, focusEditor]
  );

  // Announcement functions
  const announceContentChange = useCallback((message: string) => {
    announceToScreenReader(message, 'polite');
  }, []);

  const announceModeChange = useCallback(
    (mode: string) => {
      const modeNames: Record<string, string> = {
        html: 'HTML editing mode',
        markdown: 'Markdown editing mode',
        preview: 'Preview mode',
        'split-horizontal': 'Horizontal split view',
        'split-vertical': 'Vertical split view',
      };

      const modeName = modeNames[mode] || mode;
      announceToScreenReader(`Switched to ${modeName}`, 'assertive');
      onModeChange?.(mode);
    },
    [onModeChange]
  );

  const announceToolbarAction = useCallback((action: string) => {
    const actionNames: Record<string, string> = {
      bold: 'Bold formatting applied',
      italic: 'Italic formatting applied',
      underline: 'Underline formatting applied',
      link: 'Link dialog opened',
      image: 'Image insertion dialog opened',
      'list-ul': 'Unordered list inserted',
      'list-ol': 'Ordered list inserted',
      table: 'Table inserted',
      code: 'Code formatting applied',
      quote: 'Blockquote inserted',
      'heading 1': 'Heading 1 inserted',
      'heading 2': 'Heading 2 inserted',
      'heading 3': 'Heading 3 inserted',
      'heading 4': 'Heading 4 inserted',
      'heading 5': 'Heading 5 inserted',
      'heading 6': 'Heading 6 inserted',
      paragraph: 'Paragraph inserted',
      'media-library': 'Media library opened',
      'external-preview': 'External preview window opened',
    };

    const actionName = actionNames[action] || `${action} action performed`;
    announceToScreenReader(actionName, 'assertive');
  }, []);

  return {
    // Focus management
    focusEditor,
    focusToolbar,
    focusFirstToolbarButton,
    focusLastToolbarButton,

    // Keyboard navigation
    handleToolbarKeyDown,
    handleEditorKeyDown,
    handleModalKeyDown,

    // Announcements
    announceContentChange,
    announceModeChange,
    announceToolbarAction,

    // State
    currentFocusIndex,
    isReducedMotion,

    // Refs
    editorRef,
    toolbarRef,
    modalRef,
  };
};
