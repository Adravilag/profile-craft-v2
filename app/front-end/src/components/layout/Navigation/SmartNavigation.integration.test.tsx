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

describe('SmartNavigation Layout Integration', () => {
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

  it('should render navigation without gaps between ProfileHero and SmartNavigation', () => {
    renderComponent();

    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();

    // Verificar que el elemento nav tiene las clases correctas para eliminar espacios
    const classList = Array.from(navElement.classList);

    // Debe tener la clase principal headerPortfolioNav
    const hasHeaderClass = classList.some(
      className => className.includes('headerPortfolioNav') && className !== 'undefined'
    );
    expect(hasHeaderClass).toBe(true);

    // Verificar que es un elemento nav válido
    expect(navElement.tagName.toLowerCase()).toBe('nav');
  });

  it('should have proper CSS class structure for sticky navigation', () => {
    renderComponent();

    const navElement = screen.getByRole('navigation');

    // Verificar estructura de clases
    const classList = Array.from(navElement.classList);

    // Debe tener al menos una clase válida (no undefined)
    expect(classList.length).toBeGreaterThan(0);
    expect(classList.every(className => className !== 'undefined')).toBe(true);

    // Verificar que tiene clases relacionadas con navegación
    const hasNavRelatedClass = classList.some(
      className =>
        className.includes('headerPortfolioNav') ||
        className.includes('navigation') ||
        className.includes('nav')
    );
    expect(hasNavRelatedClass).toBe(true);
  });

  it('should render navigation items correctly', () => {
    renderComponent();

    // Verificar que los elementos de navegación están presentes
    navItems.forEach(item => {
      const navItem = screen.getByText(item.label);
      expect(navItem).toBeInTheDocument();
    });
  });
});
