/**
 * React Hook for Accessibility Features
 * Task 13: Add accessibility improvements
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  AccessibilityManager,
  type AccessibilityOptions,
  type FocusManagementOptions,
} from '@/utils/accessibilityUtils';

/**
 * Hook for managing accessibility features in React components
 */
export function useAccessibility(options?: AccessibilityOptions) {
  const managerRef = useRef<AccessibilityManager | null>(null);

  useEffect(() => {
    managerRef.current = AccessibilityManager.getInstance(options);

    return () => {
      // Cleanup is handled by the singleton pattern
    };
  }, []);

  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    managerRef.current?.announce(message, { politeness });
  }, []);

  const announceError = useCallback((message: string) => {
    managerRef.current?.announceError(message);
  }, []);

  const announceLoading = useCallback((message?: string) => {
    managerRef.current?.announceLoading(message);
  }, []);

  const announceComplete = useCallback((message?: string) => {
    managerRef.current?.announceComplete(message);
  }, []);

  const focusElement = useCallback((element: HTMLElement, options?: FocusManagementOptions) => {
    managerRef.current?.focusElement(element, options);
  }, []);

  const restoreFocus = useCallback(() => {
    managerRef.current?.restoreFocus();
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    return managerRef.current?.trapFocus(container) || (() => {});
  }, []);

  const enhanceForm = useCallback((form: HTMLFormElement) => {
    managerRef.current?.enhanceForm(form);
  }, []);

  const addKeyboardShortcut = useCallback(
    (key: string, callback: () => void, description: string) => {
      managerRef.current?.addKeyboardShortcut(key, callback, description);
    },
    []
  );

  const updatePageTitle = useCallback((title: string) => {
    managerRef.current?.updatePageTitle(title);
  }, []);

  return {
    announce,
    announceError,
    announceLoading,
    announceComplete,
    focusElement,
    restoreFocus,
    trapFocus,
    enhanceForm,
    addKeyboardShortcut,
    updatePageTitle,
    manager: managerRef.current,
  };
}

/**
 * Hook for managing focus within a component
 */
export function useFocusManagement() {
  const focusStackRef = useRef<HTMLElement[]>([]);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      focusStackRef.current.push(activeElement);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const lastFocused = focusStackRef.current.pop();
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
    }
  }, []);

  const clearFocusStack = useCallback(() => {
    focusStackRef.current = [];
  }, []);

  return {
    saveFocus,
    restoreFocus,
    clearFocusStack,
  };
}

/**
 * Hook for managing ARIA live regions
 */
export function useAriaLive() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'component-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', politeness);
      liveRegionRef.current.textContent = '';

      // Small delay to ensure screen readers pick up the change
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
        }
      }, 100);
    }
  }, []);

  return { announce };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation() {
  const isKeyboardUserRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardUserRef.current = true;
        document.body.classList.add('keyboard-navigation-active');
      }
    };

    const handleMouseDown = () => {
      isKeyboardUserRef.current = false;
      document.body.classList.remove('keyboard-navigation-active');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      callbacks: {
        onEnter?: () => void;
        onSpace?: () => void;
        onEscape?: () => void;
        onArrowUp?: () => void;
        onArrowDown?: () => void;
        onArrowLeft?: () => void;
        onArrowRight?: () => void;
      }
    ) => {
      switch (e.key) {
        case 'Enter':
          callbacks.onEnter?.();
          break;
        case ' ':
          e.preventDefault();
          callbacks.onSpace?.();
          break;
        case 'Escape':
          callbacks.onEscape?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          callbacks.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          callbacks.onArrowDown?.();
          break;
        case 'ArrowLeft':
          callbacks.onArrowLeft?.();
          break;
        case 'ArrowRight':
          callbacks.onArrowRight?.();
          break;
      }
    },
    []
  );

  return {
    isKeyboardUser: isKeyboardUserRef.current,
    handleKeyDown,
  };
}

/**
 * Hook for managing reduced motion preferences
 */
export function useReducedMotion() {
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      prefersReducedMotionRef.current = e.matches;

      if (e.matches) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    handleChange(mediaQuery);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotionRef.current;
}

/**
 * Hook for managing high contrast preferences
 */
export function useHighContrast() {
  const prefersHighContrastRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      prefersHighContrastRef.current = e.matches;

      if (e.matches) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    handleChange(mediaQuery);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersHighContrastRef.current;
}

/**
 * Hook for form accessibility enhancements
 */
export function useFormAccessibility(formRef: React.RefObject<HTMLFormElement>) {
  const { announce } = useAriaLive();

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleSubmit = (e: Event) => {
      const target = e.target as HTMLFormElement;
      const isValid = target.checkValidity();

      if (!isValid) {
        announce(
          'Formulario contiene errores. Por favor, revise los campos marcados.',
          'assertive'
        );
      }
    };

    const handleInvalid = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const label = form.querySelector(`label[for="${target.id}"]`);
      const fieldName = label?.textContent || target.name || 'Campo';

      announce(`Error en ${fieldName}: ${target.validationMessage}`, 'assertive');
    };

    form.addEventListener('submit', handleSubmit);
    form.addEventListener('invalid', handleInvalid, true);

    return () => {
      form.removeEventListener('submit', handleSubmit);
      form.removeEventListener('invalid', handleInvalid, true);
    };
  }, [announce]);

  const enhanceField = useCallback(
    (field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
      // Add required indicator
      if (field.required) {
        field.setAttribute('aria-required', 'true');

        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label && !label.classList.contains('required')) {
          label.classList.add('required');
        }
      }

      // Add describedby for help text
      const helpText = document.querySelector(`[data-help-for="${field.id}"]`);
      if (helpText) {
        const helpId = helpText.id || `${field.id}-help`;
        helpText.id = helpId;
        field.setAttribute('aria-describedby', helpId);
      }
    },
    []
  );

  return { enhanceField };
}

/**
 * Hook for managing modal accessibility
 */
export function useModalAccessibility(isOpen: boolean) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { saveFocus, restoreFocus } = useFocusManagement();
  const { announce } = useAriaLive();

  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Save current focus
    saveFocus();

    // Set up focus trap
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // This should trigger the modal close handler
        announce('Modal cerrado');
      }
    };

    // Focus first element
    firstElement?.focus();
    announce('Modal abierto');

    // Add event listeners
    modal.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      restoreFocus();
    };
  }, [isOpen, saveFocus, restoreFocus, announce]);

  return { modalRef };
}
