/**
 * [TEST] Pruebas para el error DOM removeChild en ProfileHero
 *
 * Este test está diseñado para reproducir el error:
 * "NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
 *
 * El error ocurre cuando React intenta hacer reconciliación del DOM tras cambios de estado
 * en los componentes de estadísticas del ProfileHero
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ProfileHero from './ProfileHero';

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
        yearsExperience: 'years experience',
        projectsCompleted: 'projects completed',
        profilePhotoAlt: 'Profile photo of {name}',
        downloadCV: 'Download CV',
        exploreCV: 'Explore CV',
        terminal: 'Terminal',
        videoCurriculum: 'Video CV',
        projects: 'Projects',
        available: 'Available',
        openToRemote: 'Open to Remote',
        locationAndAvailability: 'Location and availability',
        accountMenu: 'Account menu',
        logout: 'Logout',
        generating: 'Generating...',
        changeWidgets: 'Change widgets',
      },
      experience: {
        certifications: 'certifications',
      },
      states: {
        error: 'Error loading data',
      },
    },
    currentLanguage: 'en',
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
vi.mock('./hooks/useProfileStats', () => ({
  useProfileStats: vi.fn(),
}));

vi.mock('./hooks', () => ({
  useProfileData: () => ({
    userProfile: {
      id: 1,
      name: 'Test User',
      role_title: 'Software Developer',
      location: 'Test City',
      status: 'Available',
      profile_image: 'test-image.jpg',
    },
    loading: false,
    error: null,
    refetchProfile: vi.fn(),
  }),
  useProfileStats: vi.fn(),
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
    currentLanguage: 'en',
    changeLanguage: vi.fn(),
    t: {
      profileHero: {
        typingWords: ['Developer', 'Creator'],
        yearsExperience: 'years experience',
        projectsCompleted: 'projects completed',
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

// Mock APIs y utilidades
vi.mock('@/services/api', () => ({
  getProjects: vi.fn(),
  getExperiences: vi.fn(),
  getCertifications: vi.fn(),
}));

vi.mock('@/utils/imageAssets', () => ({
  getImageUrl: vi.fn(() => 'test-image.jpg'),
}));

vi.mock('@/utils/debugConfig', () => ({
  debugLog: {
    dataLoading: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/utils/scrollToElement', () => ({
  scrollToElement: vi.fn(),
}));

describe('[TEST] ProfileHero DOM Reconciliation', () => {
  let mockUseProfileStats: any;

  beforeEach(() => {
    // Importar el mock de useProfileStats
    const { useProfileStats } = vi.mocked(require('./hooks/useProfileStats'));
    mockUseProfileStats = useProfileStats;

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
      value: vi.fn(() => ({
        scrollIntoView: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('[VERDE] debería manejar la transición loading->loaded sin errores DOM removeChild', async () => {
    // [TEST ROJO] Este test debe fallar inicialmente para demostrar el problema DOM

    // Configurar estadísticas iniciales en estado loading
    mockUseProfileStats.mockReturnValueOnce({
      statsArray: [],
      remoteLoading: true,
      remoteStats: null,
    });

    const { rerender } = render(<ProfileHero isFirstTime={false} />);

    // Verificar que aparece el skeleton loading
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeDefined();

    // Simular cambio súbito de loading a loaded (causa del error removeChild)
    mockUseProfileStats.mockReturnValueOnce({
      statsArray: [
        {
          key: 'years_experience',
          label: '5+ years experience',
          icon: '👨‍💻',
          sectionId: 'experience',
          onClick: vi.fn(),
        },
        {
          key: 'projects_count',
          label: '3+ projects completed',
          icon: '📂',
          sectionId: 'projects',
          onClick: vi.fn(),
        },
      ],
      remoteLoading: false,
      remoteStats: { projects_count: 3, years_experience: 5 },
    });

    // Re-renderizar para provocar reconciliación DOM problemática
    await act(async () => {
      rerender(<ProfileHero isFirstTime={false} />);
    });

    // Buscar el botón de proyectos que debería aparecer después del loading
    await waitFor(() => {
      const projectButton = screen.getByRole('button', { name: /projects completed/i });
      expect(projectButton).toBeDefined();
    });

    const projectsButton = screen.getByRole('button', { name: /projects completed/i });

    // Este click puede disparar el error removeChild debido a reconciliación incorrecta
    expect(() => {
      fireEvent.click(projectsButton);
    }).not.toThrow(); // Esperamos que eventualmente NO falle

    expect(projectsButton).toBeDefined();
  });

  it('[TEST] debería manejar múltiples clicks sin errores de reconciliación DOM', async () => {
    // Configurar estadísticas completas
    mockUseProfileStats.mockReturnValue({
      statsArray: [
        {
          key: 'years_experience',
          label: '5+ years experience',
          icon: '👨‍💻',
          sectionId: 'experience',
          onClick: vi.fn(),
        },
        {
          key: 'projects_count',
          label: '3+ projects completed',
          icon: '📂',
          sectionId: 'projects',
          onClick: vi.fn(),
        },
      ],
      remoteLoading: false,
      remoteStats: { projects_count: 3, years_experience: 5 },
    });

    render(<ProfileHero isFirstTime={false} />);

    const projectsButton = await screen.findByRole('button', {
      name: /projects completed/i,
    });
    const experienceButton = await screen.findByRole('button', {
      name: /years experience/i,
    });

    // Clicks múltiples rápidos para forzar reconciliación
    expect(() => {
      fireEvent.click(projectsButton);
      fireEvent.click(experienceButton);
      fireEvent.click(projectsButton);
    }).not.toThrow();

    expect(projectsButton).toBeDefined();
    expect(experienceButton).toBeDefined();
  });
});
