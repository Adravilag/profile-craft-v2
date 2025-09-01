/**
 * Accessibility Utilities for Terminal Interface
 * Task 13: Add accessibility improvements
 */

// Types for accessibility features
export interface AccessibilityOptions {
  announceChanges?: boolean;
  manageKeyboardNavigation?: boolean;
  enableHighContrast?: boolean;
  reducedMotion?: boolean;
}

export interface FocusManagementOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  skipLinks?: boolean;
}

export interface AriaLiveOptions {
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

/**
 * Accessibility Manager Class
 * Handles focus management, ARIA announcements, and keyboard navigation
 */
export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private focusStack: HTMLElement[] = [];
  private keyboardNavigationActive = false;
  private announceRegion: HTMLElement | null = null;
  private options: AccessibilityOptions;

  constructor(options: AccessibilityOptions = {}) {
    this.options = {
      announceChanges: true,
      manageKeyboardNavigation: true,
      enableHighContrast: false,
      reducedMotion: false,
      ...options,
    };

    this.init();
  }

  static getInstance(options?: AccessibilityOptions): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager(options);
    }
    return AccessibilityManager.instance;
  }

  private init(): void {
    this.createAnnounceRegion();
    this.setupKeyboardNavigation();
    this.setupReducedMotion();
    this.setupHighContrast();
    this.addSkipLinks();
  }

  /**
   * Create ARIA live region for announcements
   */
  private createAnnounceRegion(): void {
    if (!this.options.announceChanges) return;

    this.announceRegion = document.createElement('div');
    this.announceRegion.setAttribute('aria-live', 'polite');
    this.announceRegion.setAttribute('aria-atomic', 'true');
    this.announceRegion.className = 'live-region';
    this.announceRegion.id = 'accessibility-announcements';
    document.body.appendChild(this.announceRegion);
  }

  /**
   * Announce message to screen readers
   */
  public announce(message: string, options: AriaLiveOptions = {}): void {
    if (!this.announceRegion || !this.options.announceChanges) return;

    const { politeness = 'polite', atomic = true, relevant = 'all' } = options;

    this.announceRegion.setAttribute('aria-live', politeness);
    this.announceRegion.setAttribute('aria-atomic', atomic.toString());
    this.announceRegion.setAttribute('aria-relevant', relevant);

    // Clear previous message and set new one
    this.announceRegion.textContent = '';
    setTimeout(() => {
      if (this.announceRegion) {
        this.announceRegion.textContent = message;
      }
    }, 100);
  }

  /**
   * Setup keyboard navigation detection
   */
  private setupKeyboardNavigation(): void {
    if (!this.options.manageKeyboardNavigation) return;

    // Detect keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        this.keyboardNavigationActive = true;
        document.body.classList.add('keyboard-navigation-active');
      }
    });

    // Detect mouse usage
    document.addEventListener('mousedown', () => {
      this.keyboardNavigationActive = false;
      document.body.classList.remove('keyboard-navigation-active');
    });

    // Handle Escape key for closing modals/overlays
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
    });
  }

  /**
   * Handle Escape key press
   */
  private handleEscapeKey(): void {
    // Close any open modals or overlays
    const modals = document.querySelectorAll('[role="dialog"], .modal, .overlay');
    modals.forEach(modal => {
      if (modal instanceof HTMLElement && modal.style.display !== 'none') {
        this.closeModal(modal);
      }
    });
  }

  /**
   * Setup reduced motion preferences
   */
  private setupReducedMotion(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleReducedMotion = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
        this.options.reducedMotion = true;
      } else {
        document.body.classList.remove('reduced-motion');
        this.options.reducedMotion = false;
      }
    };

    prefersReducedMotion.addEventListener('change', handleReducedMotion);
    handleReducedMotion(prefersReducedMotion);
  }

  /**
   * Setup high contrast mode
   */
  private setupHighContrast(): void {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');

    const handleHighContrast = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.body.classList.add('high-contrast');
        this.options.enableHighContrast = true;
      } else {
        document.body.classList.remove('high-contrast');
        this.options.enableHighContrast = false;
      }
    };

    prefersHighContrast.addEventListener('change', handleHighContrast);
    handleHighContrast(prefersHighContrast);
  }

  /**
   * Add skip links for keyboard navigation
   */
  private addSkipLinks(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Saltar al contenido principal';
    skipLink.setAttribute('aria-label', 'Saltar navegación e ir al contenido principal');

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Ensure main content has proper ID
    const mainContent = document.querySelector('main, [role="main"], .main-content');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }

  /**
   * Focus Management
   */
  public focusElement(element: HTMLElement, options: FocusManagementOptions = {}): void {
    const { restoreFocus = true } = options;

    if (restoreFocus && document.activeElement instanceof HTMLElement) {
      this.focusStack.push(document.activeElement);
    }

    element.focus();

    // Announce focus change if element has aria-label or accessible name
    const accessibleName = this.getAccessibleName(element);
    if (accessibleName) {
      this.announce(`Enfocado: ${accessibleName}`);
    }
  }

  /**
   * Restore previous focus
   */
  public restoreFocus(): void {
    const previousElement = this.focusStack.pop();
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }

  /**
   * Trap focus within a container
   */
  public trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.classList.add('focus-trap-active');

    // Focus first element
    firstElement.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.classList.remove('focus-trap-active');
    };
  }

  /**
   * Get focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)).filter(el => {
      const element = el as HTMLElement;
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hidden &&
        window.getComputedStyle(element).visibility !== 'hidden'
      );
    }) as HTMLElement[];
  }

  /**
   * Get accessible name for an element
   */
  private getAccessibleName(element: HTMLElement): string {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    // Check associated label
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent || '';
    }

    // Check title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    // Check text content for buttons and links
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      return element.textContent || '';
    }

    return '';
  }

  /**
   * Close modal and restore focus
   */
  private closeModal(modal: HTMLElement): void {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    this.restoreFocus();
    this.announce('Modal cerrado');
  }

  /**
   * Enhance form accessibility
   */
  public enhanceForm(form: HTMLFormElement): void {
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

      // Add required indicator
      if (element.required) {
        const label = form.querySelector(`label[for="${element.id}"]`);
        if (label && !label.classList.contains('required')) {
          label.classList.add('required');
          element.setAttribute('aria-required', 'true');
        }
      }

      // Add error handling
      element.addEventListener('invalid', e => {
        const target = e.target as HTMLInputElement;
        this.handleFormError(target);
      });

      // Add success handling
      element.addEventListener('input', e => {
        const target = e.target as HTMLInputElement;
        if (target.validity.valid && target.getAttribute('aria-invalid') === 'true') {
          this.clearFormError(target);
        }
      });
    });
  }

  /**
   * Handle form validation errors
   */
  private handleFormError(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ): void {
    element.setAttribute('aria-invalid', 'true');

    const errorId = `${element.id}-error`;
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'form-error';
      errorElement.setAttribute('role', 'alert');
      element.parentNode?.insertBefore(errorElement, element.nextSibling);
    }

    errorElement.textContent = element.validationMessage;
    element.setAttribute('aria-describedby', errorId);

    this.announce(`Error en ${this.getAccessibleName(element)}: ${element.validationMessage}`, {
      politeness: 'assertive',
    });
  }

  /**
   * Clear form validation errors
   */
  private clearFormError(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ): void {
    element.setAttribute('aria-invalid', 'false');

    const errorId = `${element.id}-error`;
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.remove();
      element.removeAttribute('aria-describedby');
    }
  }

  /**
   * Add keyboard shortcuts
   */
  public addKeyboardShortcut(key: string, callback: () => void, description: string): void {
    document.addEventListener('keydown', e => {
      if (e.key === key && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        callback();
        this.announce(`Atajo de teclado activado: ${description}`);
      }
    });
  }

  /**
   * Update page title for screen readers
   */
  public updatePageTitle(title: string): void {
    document.title = title;
    this.announce(`Página cambiada a: ${title}`);
  }

  /**
   * Announce loading states
   */
  public announceLoading(message: string = 'Cargando...'): void {
    this.announce(message, { politeness: 'polite' });
  }

  /**
   * Announce completion
   */
  public announceComplete(message: string = 'Completado'): void {
    this.announce(message, { politeness: 'polite' });
  }

  /**
   * Announce errors
   */
  public announceError(message: string): void {
    this.announce(`Error: ${message}`, { politeness: 'assertive' });
  }

  /**
   * Clean up accessibility manager
   */
  public destroy(): void {
    if (this.announceRegion) {
      this.announceRegion.remove();
      this.announceRegion = null;
    }

    this.focusStack = [];
    document.body.classList.remove('keyboard-navigation-active', 'reduced-motion', 'high-contrast');
  }
}

/**
 * Utility functions for accessibility
 */

/**
 * Check if an element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return !(
    element.hidden ||
    element.getAttribute('aria-hidden') === 'true' ||
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  );
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Simple luminance calculation - in a real implementation,
    // you'd want a more robust color parsing library
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(c => {
      const val = parseInt(c) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsContrastRequirement(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(color1, color2);

  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  } else {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
}

/**
 * Create accessible tooltip
 */
export function createAccessibleTooltip(
  trigger: HTMLElement,
  content: string,
  options: { position?: 'top' | 'bottom' | 'left' | 'right' } = {}
): HTMLElement {
  const { position = 'top' } = options;
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  const tooltip = document.createElement('div');
  tooltip.id = tooltipId;
  tooltip.className = `tooltip tooltip-${position}`;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = content;
  tooltip.style.position = 'absolute';
  tooltip.style.zIndex = '1000';
  tooltip.style.visibility = 'hidden';

  document.body.appendChild(tooltip);

  trigger.setAttribute('aria-describedby', tooltipId);

  const showTooltip = () => {
    tooltip.style.visibility = 'visible';
  };

  const hideTooltip = () => {
    tooltip.style.visibility = 'hidden';
  };

  trigger.addEventListener('mouseenter', showTooltip);
  trigger.addEventListener('mouseleave', hideTooltip);
  trigger.addEventListener('focus', showTooltip);
  trigger.addEventListener('blur', hideTooltip);

  return tooltip;
}

/**
 * Initialize accessibility features for the application
 */
export function initializeAccessibility(options?: AccessibilityOptions): AccessibilityManager {
  return AccessibilityManager.getInstance(options);
}

// Export default instance
export const accessibilityManager = AccessibilityManager.getInstance();
