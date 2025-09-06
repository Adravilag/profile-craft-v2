// Vitest setup: polyfills and global test helpers
import { vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
// Extend expect with DOM matchers
import '@testing-library/jest-dom';

// Mock window dimensions for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024, // Default desktop width
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768, // Default desktop height
});

// Polyfill for window.matchMedia - enhanced for theme context compatibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => {
    // Check if query is for dark theme preference
    const isDarkQuery = query.includes('prefers-color-scheme: dark');
    const isMobileQuery = query.includes('max-width') || query.includes('min-width');

    let matches = false;
    if (isDarkQuery) {
      matches = false; // Default to light theme
    } else if (isMobileQuery) {
      // Check window.innerWidth if defined for mobile queries
      const width = window.innerWidth || 1024;
      if (query.includes('max-width')) {
        const maxWidth = parseInt(query.match(/(\d+)px/)?.[1] || '768');
        matches = width <= maxWidth;
      } else if (query.includes('min-width')) {
        const minWidth = parseInt(query.match(/(\d+)px/)?.[1] || '768');
        matches = width >= minWidth;
      }
    } else {
      matches = true; // Default for other queries
    }

    const mockMediaQueryList = {
      matches,
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
      const useUnifiedTheme = () => ({
        theme: 'light',
        setTheme: _vi.fn(),
        preferences: { globalTheme: 'light' },
        currentGlobalTheme: 'light',
        setGlobalTheme: _vi.fn(),
      });
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
      const useUnifiedTheme = () => ({
        theme: 'light',
        setTheme: _vi.fn(),
        preferences: { globalTheme: 'light' },
        currentGlobalTheme: 'light',
        setGlobalTheme: _vi.fn(),
      });

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

      // SectionsLoading context
      const SectionsLoadingProvider = ({ children }: any) => children;
      const useSectionsLoadingContext = () => ({
        isLoading: _vi.fn().mockReturnValue(false),
        setLoading: _vi.fn(),
        isAnyLoading: _vi.fn().mockReturnValue(false),
        getLoadingSections: _vi.fn().mockReturnValue([]),
        resetAllLoading: _vi.fn(),
        setMultipleLoading: _vi.fn(),
        getLoadingState: _vi.fn().mockReturnValue({}),
      });

      return {
        useAuth,
        useNotificationContext,
        UnifiedThemeProvider,
        useUnifiedTheme,
        FabProvider,
        useFab,
        SectionsLoadingProvider,
        useSectionsLoadingContext,
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

    // Mock UnifiedThemeContext specifically to avoid matchMedia issues
    _vi.mock('@/contexts/UnifiedThemeContext', () => {
      const UnifiedThemeProvider = ({ children }: any) => children;
      const useUnifiedTheme = () => ({
        theme: 'light',
        setTheme: _vi.fn(),
        preferences: { globalTheme: 'light' },
        currentGlobalTheme: 'light',
        setGlobalTheme: _vi.fn(),
      });
      return {
        UnifiedThemeProvider,
        useUnifiedTheme,
        default: UnifiedThemeProvider,
      };
    });

    // Mock SectionsLoadingContext
    _vi.mock('@/contexts/SectionsLoadingContext', () => {
      const SectionsLoadingProvider = ({ children }: any) => children;
      const useSectionsLoadingContext = () => ({
        isLoading: _vi.fn().mockReturnValue(false),
        setLoading: _vi.fn(),
        isAnyLoading: _vi.fn().mockReturnValue(false),
        getLoadingSections: _vi.fn().mockReturnValue([]),
        resetAllLoading: _vi.fn(),
        setMultipleLoading: _vi.fn(),
        getLoadingState: _vi.fn().mockReturnValue({}),
      });
      return {
        SectionsLoadingProvider,
        useSectionsLoadingContext,
        default: SectionsLoadingProvider,
      };
    });
  }
} catch (e) {
  // ignore if vi not present
}
