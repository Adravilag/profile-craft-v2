import { renderHook } from '@testing-library/react';
import { useInitialScrollToSection } from './useInitialScrollToSection';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock para scrollToElement
vi.mock('@/utils/scrollToElement', () => ({
  scrollToElement: vi.fn().mockResolvedValue(undefined),
}));

// Mock para debugLog
vi.mock('@/utils/debugConfig', () => ({
  debugLog: {
    navigation: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock del DOM
const mockScrollTo = vi.fn();
const mockGetBoundingClientRect = vi.fn(() => ({
  top: 100,
  height: 200,
}));

Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
});

// Mock para document methods
const mockGetElementById = vi.fn();
const mockQuerySelector = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Mock del DOM
  Object.defineProperty(document, 'getElementById', {
    value: mockGetElementById,
    writable: true,
  });

  Object.defineProperty(document, 'querySelector', {
    value: mockQuerySelector,
    writable: true,
  });

  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 1000,
    writable: true,
  });

  Object.defineProperty(document.documentElement, 'style', {
    value: {
      setProperty: vi.fn(),
    },
    writable: true,
  });

  // Mock para getComputedStyle
  (window as any).getComputedStyle = vi.fn(() => ({
    getPropertyValue: vi.fn(() => '80px'),
  }));

  // Mock para requestAnimationFrame
  window.requestAnimationFrame = vi.fn(cb => {
    setTimeout(cb, 0);
    return 1;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock para useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

import { useLocation } from 'react-router-dom';

describe('useInitialScrollToSection', () => {
  describe('Navegación inmediata', () => {
    it('debería hacer scroll inmediatamente cuando se accede directamente a una sección', async () => {
      // Setup
      const mockNavigateToSection = vi.fn();
      const mockSetIsInitialLoading = vi.fn();
      const navItems = [{ id: 'home' }, { id: 'about' }, { id: 'skills' }, { id: 'projects' }];

      // Mock element that exists in DOM
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect,
        offsetHeight: 200,
      } as any;

      mockGetElementById.mockReturnValue(mockElement);

      // Mock useLocation to return skills path
      (useLocation as any).mockReturnValue({
        pathname: '/profile-craft/skills',
      });

      // Test
      renderHook(() =>
        useInitialScrollToSection({
          navItems,
          navigateToSection: mockNavigateToSection,
          setIsInitialLoading: mockSetIsInitialLoading,
        })
      );

      // Esperar a que se ejecute el efecto
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      expect(mockSetIsInitialLoading).toHaveBeenCalledWith(true);
      expect(mockNavigateToSection).toHaveBeenCalledWith('skills', undefined, true);
    });

    it('debería detectar la sección correcta desde diferentes formatos de URL', async () => {
      const testCases = [
        { pathname: '/skills', expected: 'skills' },
        { pathname: '/profile-craft/skills', expected: 'skills' },
        { pathname: '/about', expected: 'about' },
        { pathname: '/profile-craft/about', expected: 'about' },
      ];

      for (const { pathname, expected } of testCases) {
        const mockNavigateToSection = vi.fn();
        const mockSetIsInitialLoading = vi.fn();
        const navItems = [{ id: 'home' }, { id: 'about' }, { id: 'skills' }, { id: 'projects' }];

        const mockElement = {
          getBoundingClientRect: mockGetBoundingClientRect,
          offsetHeight: 200,
        } as any;

        mockGetElementById.mockReturnValue(mockElement);

        // Mock useLocation for this specific test case
        (useLocation as any).mockReturnValue({ pathname });

        renderHook(() =>
          useInitialScrollToSection({
            navItems,
            navigateToSection: mockNavigateToSection,
            setIsInitialLoading: mockSetIsInitialLoading,
          })
        );

        await new Promise(resolve => setTimeout(resolve, 50));

        expect(mockNavigateToSection).toHaveBeenCalledWith(expected, undefined, true);
      }
    });
  });
});
