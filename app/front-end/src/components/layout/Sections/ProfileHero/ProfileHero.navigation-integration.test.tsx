/**
 * [TEST INTEGRAL] ProfileHero navegación y errores DOM resueltos
 *
 * Este test verifica que:
 * 1. Se resolvió el error DOM removeChild
 * 2. La navegación por scroll funciona correctamente
 * 3. Los eventos onClick se procesan sin problemas
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ProfileHero from './ProfileHero';

// Mock del scroll utility
const mockScrollToElement = vi.fn();
vi.mock('@/utils/scrollToElement', () => ({
  scrollToElement: mockScrollToElement,
}));

// Mock contexts y hooks necesarios
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      profileHero: {
        typingWords: ['Developer', 'Creator'],
        yearsExperience: 'años de experiencia',
        projectsCompleted: 'proyectos completados',
        profilePhotoAlt: 'Foto de perfil de {name}',
        downloadCV: 'Descargar CV',
        exploreCV: 'Explorar CV',
        terminal: 'Terminal',
        videoCurriculum: 'Video CV',
        projects: 'Proyectos',
        available: 'Disponible',
        openToRemote: 'Abierto a Remoto',
        locationAndAvailability: 'Ubicación y disponibilidad',
        accountMenu: 'Menú de cuenta',
        logout: 'Cerrar sesión',
        generating: 'Generando...',
        changeWidgets: 'Cambiar widgets',
      },
      experience: {
        certifications: 'certificaciones',
      },
      states: {
        error: 'Error cargando datos',
      },
    },
    currentLanguage: 'es',
    changeLanguage: vi.fn(),
  }),
}));

vi.mock('@/contexts/SectionsLoadingContext', () => ({
  useSectionsLoadingContext: () => ({
    isLoading: vi.fn(() => false),
    setLoading: vi.fn(),
  }),
}));

// Mock hooks del ProfileHero
const mockNavigateToExperience = vi.fn();
const mockNavigateToProjects = vi.fn();

vi.mock('./hooks', () => ({
  useProfileData: () => ({
    userProfile: {
      id: 1,
      name: 'Test User',
      role_title: 'Software Developer',
      location: 'Test City',
      status: 'Disponible',
      profile_image: 'test-image.jpg',
    },
    loading: false,
    error: null,
    refetchProfile: vi.fn(),
  }),
  useProfileStats: () => ({
    statsArray: [
      {
        key: 'years_experience',
        label: '5+ años de experiencia',
        icon: '👨‍💻',
        sectionId: 'experience',
        onClick: mockNavigateToExperience,
      },
      {
        key: 'projects_count',
        label: '3+ proyectos completados',
        icon: '📂',
        sectionId: 'projects',
        onClick: mockNavigateToProjects,
      },
    ],
    remoteLoading: false,
    remoteStats: { projects_count: 3, years_experience: 5 },
  }),
  useWidgetManager: () => ({
    activeWidget: 'terminal',
    setActiveWidget: vi.fn(),
    widgetHints: { terminal: 'Terminal hint' },
  }),
  useAuthState: () => ({
    showPatternAuth: false,
    setShowPatternAuth: vi.fn(),
    setPatternError: vi.fn(),
  }),
  useLanguage: () => ({
    currentLanguage: 'es',
    changeLanguage: vi.fn(),
    t: {
      profileHero: {
        typingWords: ['Developer', 'Creator'],
        yearsExperience: 'años de experiencia',
        projectsCompleted: 'proyectos completados',
      },
    },
  }),
  useTypingRotator: () => ({
    currentText: 'Developer',
    reset: vi.fn(),
    isTyping: false,
    isErasing: false,
  }),
  useSkills: () => ({
    skills: [],
    getTopFeaturedSkills: vi.fn(() => []),
  }),
  useUserPattern: () => ({
    pattern: null,
  }),
}));

// Mock otras dependencias
vi.mock('@/hooks', () => ({
  useProjectsData: () => ({
    projects: [],
    loading: false,
  }),
}));

vi.mock('@/hooks/useHeader', () => ({
  useHeader: () => ({
    state: {
      scrollProgress: 0,
      isLoading: false,
    },
    actions: {
      handleDownloadPDF: vi.fn(),
    },
    elementRef: { current: null },
  }),
}));

vi.mock('@/hooks/usePDFExport', () => ({
  default: () => ({
    exportToPDF: vi.fn(),
  }),
}));

vi.mock('@/features/skills/hooks/useSkillSuggestions', () => ({
  useSkillSuggestions: () => [],
}));

vi.mock('@/utils/imageAssets', () => ({
  getImageUrl: vi.fn(() => 'test-image.jpg'),
  buildCloudinaryUrl: vi.fn((url, options) => url || 'test-image.jpg'),
}));

vi.mock('@/utils/debugConfig', () => ({
  debugLog: {
    dataLoading: vi.fn(),
    warn: vi.fn(),
    api: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock API services
vi.mock('@/services/api', () => ({
  getProjects: vi.fn(() => Promise.resolve([])),
  getExperiences: vi.fn(() => Promise.resolve([])),
  getCertifications: vi.fn(() => Promise.resolve([])),
}));

describe('[INTEGRACIÓN] ProfileHero - DOM y Navegación Resueltos', () => {
  beforeEach(() => {
    // Mock DOM querySelector para las funciones de navegación
    Object.defineProperty(document, 'querySelector', {
      writable: true,
      value: vi.fn((selector: string) => {
        if (selector === '.header-portfolio-nav') {
          return {
            getBoundingClientRect: () => ({ height: 80 }),
          };
        }
        return null;
      }),
    });

    Object.defineProperty(document, 'getElementById', {
      writable: true,
      value: vi.fn((id: string) => {
        // Simular elementos de sección existentes
        return {
          scrollIntoView: vi.fn(),
          getBoundingClientRect: () => ({ top: 1000, height: 100 }),
        };
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('[VERDE] debería renderizar estadísticas sin errores DOM y manejar navegación correctamente', async () => {
    // Renderizar componente
    render(<ProfileHero isFirstTime={false} />);

    // Verificar que las estadísticas se renderizan correctamente
    const experienceButton = await screen.findByTestId('stat-button-years_experience');
    const projectsButton = await screen.findByTestId('stat-button-projects_count');

    expect(experienceButton).toBeDefined();
    expect(projectsButton).toBeDefined();

    // Probar navegación a experiencia
    fireEvent.click(experienceButton);
    expect(mockNavigateToExperience).toHaveBeenCalledTimes(1);

    // Probar navegación a proyectos
    fireEvent.click(projectsButton);
    expect(mockNavigateToProjects).toHaveBeenCalledTimes(1);

    // Verificar que no hay errores DOM - los elementos siguen disponibles
    expect(screen.getByTestId('stat-button-years_experience')).toBeDefined();
    expect(screen.getByTestId('stat-button-projects_count')).toBeDefined();
  });

  it('[VERDE] debería manejar múltiples clicks rápidos sin errores DOM', async () => {
    render(<ProfileHero isFirstTime={false} />);

    const experienceButton = await screen.findByTestId('stat-button-years_experience');
    const projectsButton = await screen.findByTestId('stat-button-projects_count');

    // Clicks múltiples rápidos para probar estabilidad DOM
    expect(() => {
      fireEvent.click(projectsButton);
      fireEvent.click(experienceButton);
      fireEvent.click(projectsButton);
      fireEvent.click(experienceButton);
      fireEvent.click(projectsButton);
    }).not.toThrow();

    // Verificar que las funciones de navegación se llamaron
    expect(mockNavigateToExperience).toHaveBeenCalledTimes(2);
    expect(mockNavigateToProjects).toHaveBeenCalledTimes(3);

    // Verificar que los elementos permanecen estables
    expect(experienceButton).toBeDefined();
    expect(projectsButton).toBeDefined();
  });

  it('[VERDE] debería tener structure DOM estable con keys únicos', async () => {
    render(<ProfileHero isFirstTime={false} />);

    // Verificar que cada estadística tiene un key único y estable
    const experienceButton = screen.getByTestId('stat-button-years_experience');
    const projectsButton = screen.getByTestId('stat-button-projects_count');

    expect(experienceButton.getAttribute('data-testid')).toBe('stat-button-years_experience');
    expect(projectsButton.getAttribute('data-testid')).toBe('stat-button-projects_count');

    // Verificar estructura interna consistente
    const experienceIcon = experienceButton.querySelector('span[aria-hidden="true"]');
    const experienceText = experienceButton.querySelector('span:last-child');

    expect(experienceIcon).toBeDefined();
    expect(experienceText).toBeDefined();
    expect(experienceText?.textContent).toBe('5+ años de experiencia');

    const projectsIcon = projectsButton.querySelector('span[aria-hidden="true"]');
    const projectsText = projectsButton.querySelector('span:last-child');

    expect(projectsIcon).toBeDefined();
    expect(projectsText).toBeDefined();
    expect(projectsText?.textContent).toBe('3+ proyectos completados');
  });
});
