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
      matches = true; // Default to dark theme
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

// NOTE: Global mocks removed — tests should define their own `vi.mock(...)`
// when they require module-level overrides. The setup keeps only polyfills,
// minimal helpers and non-mockable shims (matchMedia, localStorage, timers).

// ---- Test environment cleanup helpers ----
// Track timeouts/intervals created by components so they can be cleared
const _createdTimers: number[] = [];
const _origSetTimeout = (global as any).setTimeout;
const _origSetInterval = (global as any).setInterval;

(global as any).setTimeout = (fn: (...args: any[]) => void, ms?: number, ...args: any[]) => {
  const id = _origSetTimeout(fn, ms, ...args) as unknown as number;
  _createdTimers.push(id);
  return id as unknown as any;
};

(global as any).setInterval = (fn: (...args: any[]) => void, ms?: number, ...args: any[]) => {
  const id = _origSetInterval(fn, ms, ...args) as unknown as number;
  _createdTimers.push(id);
  return id as unknown as any;
};

// Ensure timers are cleared between tests to avoid callbacks running after teardown
afterEach(() => {
  // clear timers
  while (_createdTimers.length) {
    const id = _createdTimers.pop();
    try {
      clearTimeout(id as any);
      clearInterval(id as any);
    } catch (e) {
      // ignore
    }
  }

  // restore mocks between tests
  try {
    // vitest global
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _vi = (global as any).vi;
    if (_vi) _vi.clearAllMocks();
  } catch (e) {
    // ignore
  }
});
