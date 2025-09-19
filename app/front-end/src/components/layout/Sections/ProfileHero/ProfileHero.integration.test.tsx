import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfileHero from './ProfileHero';
import SmartNavigation from '../../Navigation/SmartNavigation';

// Mock de todos los hooks necesarios
vi.mock('@/hooks/usePDFExport', () => ({
  default: () => ({ exportToPDF: vi.fn() }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

vi.mock('@/hooks/useHeader', () => ({
  useHeader: () => ({
    state: {
      isScrolled: false,
      isCompact: false,
      isVisible: true,
    },
    actions: {},
    elementRef: { current: null },
  }),
}));

vi.mock('../ProfileHero/hooks', () => ({
  useProfileData: () => ({
    userProfile: null,
    loading: false,
    error: null,
    refetchProfile: vi.fn(),
  }),
  useProfileStats: () => ({
    statsArray: [],
    remoteLoading: false,
  }),
  useWidgetManager: () => ({
    activeWidget: null,
    setActiveWidget: vi.fn(),
    widgetHints: {},
  }),
  useAuthState: () => ({
    showPatternAuth: false,
    setShowPatternAuth: vi.fn(),
    setPatternError: vi.fn(),
  }),
  useLanguage: () => ({
    currentLanguage: 'es',
    changeLanguage: vi.fn(),
    t: null,
  }),
  useTypingRotator: () => ({
    currentText: 'Desarrollador',
    reset: vi.fn(),
    isTyping: false,
    isErasing: false,
  }),
  useSkills: () => ({
    skills: [],
  }),
}));

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

const navItems = [
  { id: 'home', label: 'Inicio', icon: 'fas fa-home' },
  { id: 'about', label: 'Sobre Mí', icon: 'fas fa-user' },
  { id: 'skills', label: 'Habilidades', icon: 'fas fa-code' },
];

const renderComponents = () => {
  return render(
    <BrowserRouter>
      <div>
  <ProfileHero />
        <SmartNavigation navItems={navItems} />
      </div>
    </BrowserRouter>
  );
};

describe('ProfileHero and SmartNavigation Integration - CSS Classes', () => {
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

  it('should have no undefined CSS classes in both ProfileHero and SmartNavigation', () => {
    const { container } = renderComponents();

    // Verificar ProfileHero
    const headerElement = container.querySelector('header');
    expect(headerElement).toBeInTheDocument();

    // Verificar SmartNavigation
    const navElement = container.querySelector('nav');
    expect(navElement).toBeInTheDocument();

    // Verificar que no hay clases undefined en ningún elemento
    const allElements = container.querySelectorAll('*');

    allElements.forEach(element => {
      const classList = Array.from(element.classList);
      const undefinedClasses = classList.filter(className => className === 'undefined');

      if (undefinedClasses.length > 0) {
        console.error(`Found undefined classes in element:`, element, undefinedClasses);
      }

      expect(undefinedClasses).toHaveLength(0);
    });
  });

  it('should have proper CSS classes for layout components', () => {
    const { container } = renderComponents();

    // Verificar ProfileHero tiene la clase principal
    const headerElement = container.querySelector('header');
    const headerClassList = Array.from(headerElement?.classList || []);
    const hasValidHeaderClass = headerClassList.some(
      className => className.includes('headerCurriculum') && className !== 'undefined'
    );
    expect(hasValidHeaderClass).toBe(true);

    // Verificar SmartNavigation tiene clases válidas
    const navElement = container.querySelector('nav');
    const navClassList = Array.from(navElement?.classList || []);
    const hasValidNavClass = navClassList.some(
      className => className.includes('headerPortfolioNav') && className !== 'undefined'
    );
    expect(hasValidNavClass).toBe(true);
  });

  it('should render layout components without spacing issues', () => {
    const { container } = renderComponents();

    const headerElement = container.querySelector('header');
    const navElement = container.querySelector('nav');

    expect(headerElement).toBeInTheDocument();
    expect(navElement).toBeInTheDocument();

    // Verificar que ambos componentes tienen clases válidas para el layout
    expect(headerElement?.className).not.toContain('undefined');
    expect(navElement?.className).not.toContain('undefined');
  });
});
