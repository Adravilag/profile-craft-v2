/**
 * @fileoverview Tests para verificar diseño responsive de ProfileHero
 * Enfocado en burbujas de estadísticas en mobile
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileHero from './ProfileHero';

// Mock de dependencias
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

vi.mock('@/hooks/usePDFExport', () => ({
  default: () => ({
    exportToPDF: vi.fn(),
  }),
}));

// Mock de hooks
vi.mock('./hooks', () => ({
  useProfileData: () => ({
    userProfile: {
      id: 1,
      name: 'Test User',
      role_title: 'Desarrollador Full Stack',
      location: 'Test Location',
      status: 'Disponible',
      profile_image: '/test-image.jpg',
    },
    loading: false,
    error: null,
    refetchProfile: vi.fn(),
  }),
  useProfileStats: () => ({
    statsArray: [
      { key: 'years_experience', label: '+7 años de experiencia' },
      { key: 'projects', label: '2 proyectos completados' },
      { key: 'certifications', label: '2 Certificaciones' },
    ],
    remoteLoading: false,
  }),
  useWidgetManager: () => ({
    activeWidget: 'terminal',
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
    t: {
      profileHero: {
        profilePhotoAlt: 'Foto de perfil de {name}',
        accountMenu: 'Menú de cuenta',
        logout: 'Cerrar sesión',
        switchToDarkMode: 'Cambiar a modo oscuro',
        toggleLanguage: 'Cambiar idioma',
        available: 'Disponible',
        openToRemote: 'Abierto a remoto',
        downloadCV: 'Descargar CV',
        generating: 'Generando...',
        exploreCV: 'Explora mi CV',
        terminal: 'Terminal',
        videoCurriculum: 'Video CV',
        projects: 'Proyectos',
        changeWidgets: 'Cambiar widgets',
        locationAndAvailability: 'Ubicación y disponibilidad',
        typingWords: ['Desarrollador Software'],
      },
      states: {
        error: 'Error al cargar',
      },
    },
  }),
  useTypingRotator: () => ({
    currentText: 'Desarrollador Software',
    reset: vi.fn(),
    isTyping: false,
    isErasing: false,
  }),
  useSkills: () => ({
    skills: [],
    getTopFeaturedSkills: () => [],
  }),
  useUserPattern: () => ({
    pattern: null,
  }),
}));

vi.mock('@/hooks/useHeader', () => ({
  useHeader: () => ({
    state: { scrollProgress: 0, isLoading: false },
    actions: { handleDownloadPDF: vi.fn() },
    elementRef: { current: null },
  }),
}));

describe('[TEST] ProfileHero Responsive - Burbujas de Estadísticas', () => {
  /**
   * Test para verificar que las burbujas se adapten correctamente en móvil
   */
  test('las burbujas de estadísticas deben tener diseño responsive optimizado', () => {
    // Simular viewport móvil
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone SE width
    });

    const { container } = render(<ProfileHero darkMode={true} isFirstTime={false} />);

    // Verificar que las burbujas existen
    const statsContainer = container.querySelector('[class*="headerHighlights"]');
    expect(statsContainer).toBeInTheDocument();

    // Verificar que hay burbujas de estadísticas
    const statBadges = container.querySelectorAll('[class*="statBadge"]');
    expect(statBadges.length).toBeGreaterThan(0);

    // FALLO ESPERADO: Test fallerá porque aún no hemos implementado las mejoras móviles
    // Verificar que las burbujas tienen clases responsive
    const firstBubble = statBadges[0] as HTMLElement;

    // Test que debe fallar inicialmente - verificar que las burbujas tengan wrap responsive
    expect(statsContainer).toHaveClass('responsiveWrap'); // ❌ Esta clase no existe aún

    // Test que debe fallar - verificar espaciado móvil optimizado
    expect(firstBubble).toHaveClass('mobileOptimized'); // ❌ Esta clase no existe aún
  });

  test('las burbujas deben tener tamaño táctil adecuado en móvil', () => {
    const { container } = render(<ProfileHero darkMode={true} isFirstTime={false} />);

    const statBadges = container.querySelectorAll('[class*="statBadge"]');
    const firstBubble = statBadges[0] as HTMLElement;

    // FALLO ESPERADO: Verificar altura mínima táctil (44px en móvil)
    const computedStyle = window.getComputedStyle(firstBubble);
    const minHeight = parseInt(computedStyle.minHeight);

    // Este test fallará inicialmente porque no hemos implementado min-height táctil
    expect(minHeight).toBeGreaterThanOrEqual(44); // ❌ Actualmente no cumple estándar táctil
  });

  test('el contenedor de burbujas debe permitir wrap en pantallas pequeñas', () => {
    const { container } = render(<ProfileHero darkMode={true} isFirstTime={false} />);

    const statsContainer = container.querySelector('[class*="headerHighlights"]');
    const computedStyle = window.getComputedStyle(statsContainer!);

    // FALLO ESPERADO: Verificar que flex-wrap está habilitado
    expect(computedStyle.flexWrap).toBe('wrap'); // ❌ Actualmente es 'nowrap'
  });
});
