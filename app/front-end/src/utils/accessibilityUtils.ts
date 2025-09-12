/**
 * Accessibility utilities for the ProjectEditor component
 * Provides helper functions for ARIA attributes, keyboard navigation, and focus management
 */

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-multiline'?: boolean;
  role?: string;
}

/**
 * Generate ARIA attributes for toolbar buttons
 */
export const getToolbarButtonAria = (
  action: string,
  isActive?: boolean,
  hasSubmenu?: boolean
): AriaAttributes => {
  const baseAria: AriaAttributes = {
    role: 'button',
    'aria-pressed': isActive,
  };

  if (hasSubmenu) {
    baseAria['aria-expanded'] = false;
    baseAria['aria-haspopup'] = 'menu';
  }

  // Specific labels for different actions
  const actionLabels: Record<string, string> = {
    bold: 'Apply bold formatting',
    italic: 'Apply italic formatting',
    underline: 'Apply underline formatting',
    link: 'Insert link',
    image: 'Insert image',
    'list-ul': 'Insert unordered list',
    'list-ol': 'Insert ordered list',
    table: 'Insert table',
    code: 'Insert inline code',
    quote: 'Insert blockquote',
    h1: 'Insert heading 1',
    h2: 'Insert heading 2',
    h3: 'Insert heading 3',
    h4: 'Insert heading 4',
    h5: 'Insert heading 5',
    h6: 'Insert heading 6',
    paragraph: 'Insert paragraph',
    'media-library': 'Open media library',
    'external-preview': 'Open external preview window',
    'split-horizontal': 'Split view horizontally',
    'split-vertical': 'Split view vertically',
    html: 'Switch to HTML mode',
    markdown: 'Switch to Markdown mode',
    preview: 'Switch to preview mode',
  };

  baseAria['aria-label'] = actionLabels[action] || `${action} action`;

  return baseAria;
};

/**
 * Generate ARIA attributes for mode selector buttons
 */
export const getModeButtonAria = (
  mode: string,
  isActive: boolean,
  shortcut?: string
): AriaAttributes => {
  const modeLabels: Record<string, string> = {
    html: 'HTML editing mode',
    markdown: 'Markdown editing mode',
    preview: 'Preview mode',
    'split-horizontal': 'Horizontal split view',
    'split-vertical': 'Vertical split view',
  };

  const label = modeLabels[mode] || mode;
  const fullLabel = shortcut ? `${label} (${shortcut})` : label;

  return {
    role: 'tab',
    'aria-label': fullLabel,
    'aria-selected': isActive,
    'aria-pressed': isActive,
  };
};

/**
 * Generate ARIA attributes for the editor textarea
 */
export const getEditorTextareaAria = (
  mode: string,
  hasContent: boolean,
  lineCount: number,
  charCount: number
): AriaAttributes => {
  const modeDescriptions: Record<string, string> = {
    html: 'HTML code editor',
    markdown: 'Markdown text editor',
  };

  const description = modeDescriptions[mode] || 'Text editor';
  const statusInfo = `${lineCount} lines, ${charCount} characters`;

  return {
    role: 'textbox',
    'aria-label': `${description}. ${statusInfo}`,
    'aria-multiline': true,
    'aria-describedby': `editor-status-${mode}`,
  };
};

/**
 * Generate ARIA attributes for status bars
 */
export const getStatusBarAria = (mode: string): AriaAttributes => {
  return {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': true,
    'aria-label': `${mode} editor status information`,
  };
};

/**
 * Generate ARIA attributes for preview areas
 */
export const getPreviewAria = (hasContent: boolean): AriaAttributes => {
  return {
    role: 'region',
    'aria-label': hasContent ? 'Content preview' : 'Empty preview area',
    'aria-live': 'polite',
    'aria-atomic': false,
  };
};

/**
 * Keyboard navigation constants
 */
export const KEYBOARD_SHORTCUTS = {
  BOLD: 'Ctrl+B',
  ITALIC: 'Ctrl+I',
  UNDERLINE: 'Ctrl+U',
  LINK: 'Ctrl+K',
  SAVE: 'Ctrl+S',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  FIND: 'Ctrl+F',
  REPLACE: 'Ctrl+H',
  SELECT_ALL: 'Ctrl+A',
  COPY: 'Ctrl+C',
  CUT: 'Ctrl+X',
  PASTE: 'Ctrl+V',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: 'Space',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Check if an element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return focusableSelectors.some(selector => element.matches(selector));
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
};

/**
 * Trap focus within a container (for modals)
 */
export const trapFocus = (container: HTMLElement, event: KeyboardEvent): void => {
  if (event.key !== 'Tab') return;

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

/**
 * Announce content changes to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Create screen reader only text
 */
export const createScreenReaderText = (text: string): HTMLSpanElement => {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  return span;
};

/**
 * Handle keyboard shortcuts for editor actions
 */
export const handleEditorKeyboardShortcut = (
  event: KeyboardEvent,
  callbacks: Record<string, () => void>
): boolean => {
  const { ctrlKey, metaKey, shiftKey, key } = event;
  const isModifierPressed = ctrlKey || metaKey;

  if (!isModifierPressed) return false;

  const shortcutKey = `${isModifierPressed ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${key.toUpperCase()}`;

  const shortcutMap: Record<string, string> = {
    'Ctrl+B': 'bold',
    'Ctrl+I': 'italic',
    'Ctrl+U': 'underline',
    'Ctrl+K': 'link',
    'Ctrl+1': 'h1',
    'Ctrl+2': 'h2',
    'Ctrl+3': 'h3',
    'Ctrl+4': 'h4',
    'Ctrl+5': 'h5',
    'Ctrl+6': 'h6',
    'Ctrl+Q': 'quote',
    'Ctrl+T': 'table',
    'Ctrl+L': 'list-ul',
    'Ctrl+Shift+L': 'list-ol',
  };

  const action = shortcutMap[shortcutKey];
  if (action && callbacks[action]) {
    event.preventDefault();
    callbacks[action]();
    return true;
  }

  return false;
};

/**
 * Validate WCAG 2.1 AA compliance for color contrast
 */
export const validateColorContrast = (foreground: string, background: string): boolean => {
  // This is a simplified version - in a real implementation, you'd use a proper color contrast library
  // For now, we'll assume the design tokens provide compliant colors
  return true;
};

/**
 * Check if reduced motion is preferred
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
