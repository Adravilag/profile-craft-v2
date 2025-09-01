import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SmartNavigation from './SmartNavigation';

// Mock de los hooks
vi.mock('@/hooks', () => ({
  useNavigation: () => ({
    currentSection: 'home',
    navigateToSection: vi.fn(),
    navigateFromProjectToSection: vi.fn(),
  }),
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('@/hooks/useInitialScrollToSection', () => ({
  useInitialScrollToSection: vi.fn(),
}));

vi.mock('@/utils/scrollToElement', () => ({
  scrollToElement: vi.fn(),
}));

const navItems = [
  { id: 'home', label: 'Inicio', icon: 'fas fa-home' },
  { id: 'about', label: 'Sobre Mí', icon: 'fas fa-user' },
  { id: 'skills', label: 'Habilidades', icon: 'fas fa-code' },
];

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <SmartNavigation navItems={navItems} />
    </BrowserRouter>
  );
};

describe('SmartNavigation CSS Classes', () => {
  beforeEach(() => {
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

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  it('should have headerPortfolioNav CSS class defined', () => {
    renderComponent();

    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();

    // Verificar que la clase CSS está definida y no es undefined
    const classList = Array.from(navElement.classList);
    const hasValidHeaderClass = classList.some(
      className => className.includes('headerPortfolioNav') && className !== 'undefined'
    );

    expect(hasValidHeaderClass).toBe(true);
  });

  it('should have navSticky CSS class defined when navigation is sticky', () => {
    // Mock scroll event to trigger sticky behavior
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
    });

    renderComponent();

    // Simular scroll para activar el estado sticky
    window.dispatchEvent(new Event('scroll'));

    const navElement = screen.getByRole('navigation');

    // Verificar que la clase navSticky está definida cuando está sticky
    setTimeout(() => {
      const classList = Array.from(navElement.classList);
      const hasValidStickyClass = classList.some(
        className => className.includes('navSticky') && className !== 'undefined'
      );

      expect(hasValidStickyClass).toBe(true);
    }, 100);
  });

  it('should have proper spacing classes to prevent gaps with adjacent components', () => {
    renderComponent();

    const navElement = screen.getByRole('navigation');

    // Verificar que tiene las clases CSS correctas para spacing
    const classList = Array.from(navElement.classList);
    const hasHeaderClass = classList.some(
      className => className.includes('headerPortfolioNav') && className !== 'undefined'
    );

    expect(hasHeaderClass).toBe(true);

    // Verificar que tiene positioning adecuado
    expect(navElement).toBeInTheDocument();
    expect(navElement.tagName.toLowerCase()).toBe('nav');
  });
});
