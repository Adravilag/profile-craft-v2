// Vitest setup: polyfills and global test helpers
import { vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
// Extend expect with DOM matchers
import '@testing-library/jest-dom';
// Polyfill for window.matchMedia - enhanced for theme context compatibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => {
    // Check if query is for dark theme preference
    const isDarkQuery = query.includes('prefers-color-scheme: dark');
    const mockMediaQueryList = {
      matches: isDarkQuery ? false : true, // Default to light theme
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn().mockReturnValue(false),
    };
    return mockMediaQueryList;
  }),
});

// Polyfill for Element.prototype.scrollTo used in some components
if (typeof (Element.prototype as any).scrollTo !== 'function') {
  (Element.prototype as any).scrollTo = function () {
    // no-op in test environment
  };
}

// Mock IntersectionObserver for testing
global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => {
  const instance = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: options?.root || null,
    rootMargin: options?.rootMargin || '0px',
    thresholds: options?.threshold || [0],
  };
  return instance;
});

// Provide a minimal localStorage mock if not present
if (typeof (window as any).localStorage === 'undefined') {
  const storage: Record<string, string> = {};
  (window as any).localStorage = {
    getItem: (k: string) => (k in storage ? storage[k] : null),
    setItem: (k: string, v: string) => {
      storage[k] = v;
    },
    removeItem: (k: string) => {
      delete storage[k];
    },
    clear: () => {
      Object.keys(storage).forEach(k => delete storage[k]);
    },
  };
}

// Helper to wrap tests with common providers if needed (optional use)
// Test helper to wrap components with providers
export const withProviders = (ui: React.ReactElement) => {
  // Since we have global mocks for contexts, this can be simple for now
  return ui;
};

// Silence console.info during tests (optional)
const _info = console.info;
console.info = (...args: any[]) => {
  // filter noisy messages if required
  _info.apply(console, args);
};

// Global lightweight mocks to make tests more stable. Individual tests can still
// override these using vi.mock(...) inside the test file.
try {
  // vitest globals are available in setup files
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _vi = (global as any).vi as any;
  if (_vi) {
    // Match real hook shape: named exports and default
    _vi.mock('@/hooks/useNotification', () => {
      const make = () => ({ showSuccess: _vi.fn(), showError: _vi.fn(), showInfo: _vi.fn() });
      return {
        useNotificationContext: make,
        useNotification: make,
        default: make,
      };
    });

    // Mock the hooks barrel so imports from '@/hooks' resolve to safe functions
    _vi.mock('@/hooks', () => {
      const makeNotif = () => ({ showSuccess: _vi.fn(), showError: _vi.fn(), showInfo: _vi.fn() });
      const useNavigation = () => ({ currentSection: '', navigateToSection: _vi.fn() });
      const useUnifiedTheme = () => ({ theme: 'light', setTheme: _vi.fn() });
      return {
        useNavigation,
        useNotification: makeNotif,
        useNotificationContext: makeNotif,
        useUnifiedTheme,
        // minimal placeholders for hooks that may be imported from the barrel
        useTestimonials: () => ({ loading: false, testimonials: [] }),
        useExperience: () => ({ items: [] }),
        useEducation: () => ({ items: [] }),
        useExperienceSection: () => ({ loading: false, data: null }),
      };
    });

    // Provide a minimal contexts module to satisfy imports from '@/contexts'
    _vi.mock('@/contexts', () => {
      // Minimal useAuth implementation used across many components
      const useAuth = () => ({
        user: null,
        loading: false,
        isAuthenticated: false,
        login: _vi.fn(),
        logout: _vi.fn(),
      });

      // Notification context hook
      const useNotificationContext = () => ({
        showSuccess: _vi.fn(),
        showError: _vi.fn(),
        showInfo: _vi.fn(),
      });

      // UnifiedThemeProvider and hook
      const UnifiedThemeProvider = ({ children }: any) => children;
      const useUnifiedTheme = () => ({ theme: 'light', setTheme: _vi.fn() });

      // Fab context
      const FabProvider = ({ children }: any) => children;
      const useFab = () => ({
        openTestimonialModal: _vi.fn(),
        openTestimonialsAdmin: _vi.fn(),
        openSkillModal: _vi.fn(),
        onOpenExperienceModal: _vi.fn(),
        openAboutModal: _vi.fn(),
        onOpenSkillModal: _vi.fn(),
      });

      return {
        useAuth,
        useNotificationContext,
        UnifiedThemeProvider,
        useUnifiedTheme,
        FabProvider,
        useFab,
      };
    });

    // Hook that exports default boolean fn - ensure both named and default exports
    _vi.mock('@/hooks/useIsOnSkillsPage', () => {
      const hook = () => true;
      return {
        default: hook,
        useIsOnSkillsPage: hook,
      };
    });
  }
} catch (e) {
  // ignore if vi not present
}
