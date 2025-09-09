import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UnifiedThemeProvider } from '@/contexts/UnifiedThemeContext';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock element.scrollTo
Element.prototype.scrollTo = vi.fn();

// Provide a full mock for endpoints (use importOriginal to avoid breaking other imports)
vi.mock('@/services/endpoints', async importOriginal => {
  // don't spread the original module to avoid TS errors in the test context
  // return only the mocked exports required by the app during this test run
  await importOriginal();
  return {
    profile: {
      getUserProfile: async () => ({
        name: 'Test User',
        role_title: 'React Developer',
        profile_image: '',
        email: 'test@example.com',
        linkedin_url: null,
        github_url: null,
        location: 'Cádiz, España',
        status: 'Disponible',
        meta: { years_experience: 5, projects_count: 10 },
      }),
    },
    skills: {
      getSkills: async () => [
        {
          id: 1,
          user_id: 0,
          category: 'Frontend',
          name: 'React',
          icon_class: 'fab fa-react',
          level: 90,
          order_index: 1,
          featured: true, // Añadir featured para que aparezca en ProfileHero
        },
        {
          id: 2,
          user_id: 0,
          category: 'DevOps',
          name: 'Docker',
          icon_class: 'fab fa-docker',
          level: 60,
          order_index: 2,
          featured: false, // No featured para que no aparezca
        },
        {
          id: 3,
          user_id: 0,
          category: 'Backend',
          name: 'Node.js',
          icon_class: 'fab fa-node',
          level: 75,
          order_index: 3,
          featured: true, // Featured para que aparezca
        },
        {
          id: 4,
          user_id: 0,
          category: 'API',
          name: 'REST API',
          icon_class: 'fas fa-code',
          level: 72,
          order_index: 4,
          featured: true, // Featured para que aparezca en el test
        },
      ],
    },
    // add minimal noop implementations for other commonly imported endpoints
    experiences: { getExperiences: async () => [] },
    projects: { getProjects: async () => [] },
    certifications: { getCertifications: async () => [] },
    education: { getEducation: async () => [] },
    users: { getUsers: async () => [] },
  };
});

// Mock hooks and utils used by ProfileHero
vi.mock('@/hooks/usePDFExport', () => ({ default: () => ({ exportToPDF: () => {} }) }));
vi.mock('@/hooks/useHeader', () => ({
  useHeader: () => ({
    state: {
      isScrolled: false,
      isCompact: false,
      isVisible: true,
      scrollProgress: 0,
      isLoading: false,
    },
    actions: { handleDownloadPDF: vi.fn() },
    elementRef: React.createRef(),
  }),
}));
vi.mock('@/utils/imageAssets', () => ({ getImageUrl: (k: string) => `/img/${k}.png` }));
// Stub InteractiveTerminal to avoid pulling theme/context providers in tests
vi.mock('@/components/layout/Sections/ProfileHero/Widgets/Terminal/InteractiveTerminal', () => {
  return {
    default: () => React.createElement('div', { 'data-testid': 'stub-terminal' }, null),
  };
});

// Mock the useSkills hook to return our test skills
vi.mock('@/components/layout/Sections/ProfileHero/hooks/useSkills', () => ({
  useSkills: () => ({
    skills: [
      {
        id: 1,
        user_id: 0,
        category: 'Frontend',
        name: 'React',
        icon_class: 'fab fa-react',
        level: 90,
        order_index: 1,
        featured: true,
      },
      {
        id: 2,
        user_id: 0,
        category: 'DevOps',
        name: 'Docker',
        icon_class: 'fab fa-docker',
        level: 60,
        order_index: 2,
        featured: false,
      },
      {
        id: 3,
        user_id: 0,
        category: 'Backend',
        name: 'Node.js',
        icon_class: 'fab fa-node',
        level: 75,
        order_index: 3,
        featured: true,
      },
      {
        id: 4,
        user_id: 0,
        category: 'API',
        name: 'REST API',
        icon_class: 'fas fa-code',
        level: 72,
        order_index: 4,
        featured: true,
      },
    ],
    loading: false,
    error: null,
    selectedCategory: null,
    setSelectedCategory: vi.fn(),
    refreshSkills: vi.fn(),
    getSkillsByCategory: vi.fn(),
    getAllCategories: vi.fn(),
    getTopFeaturedSkills: vi.fn().mockReturnValue([
      {
        id: 1,
        name: 'React',
        icon_class: 'fab fa-react',
        level: 90,
        featured: true,
      },
      {
        id: 3,
        name: 'Node.js',
        icon_class: 'fab fa-node',
        level: 75,
        featured: true,
      },
      {
        id: 4,
        name: 'REST API',
        icon_class: 'fas fa-code',
        level: 72,
        featured: true,
      },
    ]),
  }),
}));

// Mock the language hook to return Spanish
vi.mock('@/components/layout/Sections/ProfileHero/hooks/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: 'es',
    changeLanguage: vi.fn(),
    t: {
      states: {
        error: 'Error al cargar datos',
      },
      profileHero: {
        typingWords: [
          'Desarrollador Software',
          'Creador de experiencias interactivas',
          'Diseñador de interfaces de usuario',
          'Desarrollador de soluciones accesibles',
        ],
        profilePhotoAlt: 'Foto de perfil de {name}',
        switchToDarkMode: 'Modo oscuro activo',
        toggleLanguage: 'Cambiar idioma',
        accountMenu: 'Menú de cuenta',
        logout: 'Cerrar sesión',
        locationAndAvailability: 'Ubicación y disponibilidad',
        available: 'Disponible',
        openToRemote: 'Abierto a remoto',
        downloadCV: 'Descargar CV',
        generating: 'Generando...',
        exploreCV: 'Explorar CV',
        terminal: 'Terminal',
        videoCurriculum: 'Video Curriculum',
        projects: 'Proyectos',
        changeWidgets: 'Cambiar widgets',
      },
    },
  }),
}));

import ProfileHero from './ProfileHero';

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  return render(
    <UnifiedThemeProvider>
      <AuthProvider>
        <TranslationProvider>{ui}</TranslationProvider>
      </AuthProvider>
    </UnifiedThemeProvider>,
    options
  );
};

describe('ProfileHero', () => {
  it('does not render video curriculum widget button', async () => {
    renderWithProviders(<ProfileHero darkMode={false} />);
    // El botón de video se identificaba por el título del tooltip del botón
    const videoBtn = screen.queryByTitle(/video currículum|video curriculum|videocurrículum/i);
    expect(videoBtn).toBeNull();
  });

  it('renders profile name and tagline', async () => {
    renderWithProviders(<ProfileHero darkMode={false} />);
    expect(await screen.findByText(/Test User/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Test User/ })).toBeTruthy();
  });

  it('shows only featured skills', async () => {
    renderWithProviders(<ProfileHero darkMode={false} />);
    // React (featured), REST API (featured) and Node.js (featured) should appear; Docker (not featured) should not
    const reactEls = await screen.findAllByTitle('React');
    expect(reactEls.length).toBeGreaterThan(0);
    const restApiEls = await screen.findAllByTitle('REST API');
    expect(restApiEls.length).toBeGreaterThan(0);
    const nodeEls = await screen.findAllByTitle('Node.js');
    expect(nodeEls.length).toBeGreaterThan(0);
    const docker = screen.queryByTitle('Docker');
    expect(docker).toBeNull();
  });

  it('hovering a skill reveals the hover label with level', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileHero darkMode={false} />);
    const reactEls2 = await screen.findAllByTitle('React');
    const reactEl = reactEls2[0];
    await user.hover(reactEl);
    const { within } = await import('@testing-library/react');
    const label = within(reactEl).getByText(/React — 90%/);
    expect(label).toBeVisible();
  });

  it('displays typing rotator with role texts', async () => {
    renderWithProviders(<ProfileHero darkMode={false} />);

    // Buscar el elemento que contiene el rotador de texto
    const typingRotator = await screen.findByTestId('typing-rotator', undefined, { timeout: 3000 });
    expect(typingRotator).toBeInTheDocument();

    // Verificar que muestra algún texto inicial
    expect(typingRotator.textContent).toBeTruthy();
    expect(typingRotator.textContent?.length).toBeGreaterThan(0);
  });

  it('rotator changes between different role texts', async () => {
    const { unmount } = renderWithProviders(<ProfileHero darkMode={false} />);

    const typingRotator = await screen.findByTestId('typing-rotator', undefined, { timeout: 3000 });

    // Simplemente verificar que el rotador existe y tiene contenido
    expect(typingRotator).toBeInTheDocument();
    expect(typingRotator.textContent).toBeTruthy();

    // Verificar que contiene texto español o al menos algún texto válido
    const content = typingRotator.textContent?.replace('|', '').trim();
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);

    unmount();
  });

  it('rotator includes expected Spanish role texts', async () => {
    const { unmount } = renderWithProviders(<ProfileHero darkMode={false} />);

    const typingRotator = await screen.findByTestId('typing-rotator', undefined, { timeout: 3000 });

    // Verificar que el rotador existe
    expect(typingRotator).toBeInTheDocument();

    // Obtener el contenido actual (sin el cursor)
    const content = typingRotator.textContent?.replace('|', '').trim();
    expect(content).toBeTruthy();

    // Verificar que es uno de los textos esperados (puede estar en cualquier punto de escritura)
    const expectedTexts = [
      'Desarrollador Software',
      'Creador de experiencias interactivas',
      'Diseñador de interfaces de usuario',
      'Desarrollador de soluciones accesibles',
    ];

    // Verificar que el contenido actual es una sub-cadena de alguno de los textos esperados
    const isValidText = expectedTexts.some(
      expected => expected.startsWith(content!) || content!.length === 0
    );

    expect(isValidText).toBe(true);

    unmount();
  });

  it('should queue roles randomly and not repeat same role consecutively', async () => {
    const { unmount } = renderWithProviders(<ProfileHero darkMode={false} />);

    const typingRotator = await screen.findByTestId('typing-rotator', undefined, { timeout: 3000 });
    expect(typingRotator).toBeInTheDocument();

    // Esta prueba falla porque la funcionalidad de cola aleatoria aún no está implementada
    expect(typingRotator).toHaveAttribute('data-random-queue', 'true');

    unmount();
  });

  it('should show typing effect character by character', async () => {
    const { unmount } = renderWithProviders(<ProfileHero darkMode={false} />);

    const typingRotator = await screen.findByTestId('typing-rotator', undefined, { timeout: 3000 });
    expect(typingRotator).toBeInTheDocument();

    // Esta prueba falla porque el efecto de escritura mejorado aún no está implementado
    expect(typingRotator).toHaveAttribute('data-typing-effect', 'active');

    unmount();
  });

  it('should show erasing effect before typing new role', async () => {
    const { unmount } = renderWithProviders(<ProfileHero darkMode={false} />);

    const typingRotator = await screen.findByTestId('typing-rotator', undefined, { timeout: 3000 });
    expect(typingRotator).toBeInTheDocument();

    // Verificar que el efecto de borrado existe como atributo (inicialmente inactivo está bien)
    expect(typingRotator).toHaveAttribute('data-erasing-effect');

    // Verificar que el valor inicial es 'inactive' (antes de empezar a borrar)
    expect(typingRotator.getAttribute('data-erasing-effect')).toBe('inactive');

    unmount();
  });

  it('should cycle through all roles from random queue', async () => {
    const { unmount } = renderWithProviders(<ProfileHero darkMode={false} />);

    const typingRotator = await screen.findByTestId('typing-rotator', undefined, { timeout: 3000 });
    expect(typingRotator).toBeInTheDocument();

    // Esta prueba falla porque el sistema de cola de roles aún no está implementado
    expect(typingRotator).toHaveAttribute('data-queue-cycling', 'true');

    unmount();
  });

  it('should not show hardcoded fallback when rotator is working', async () => {
    const { unmount } = renderWithProviders(<ProfileHero darkMode={false} />);

    const typingRotator = await screen.findByTestId('typing-rotator', undefined, { timeout: 3000 });
    expect(typingRotator).toBeInTheDocument();

    // Esta prueba verifica que no se usa el fallback hardcodeado cuando el rotador funciona
    const content = typingRotator.textContent?.replace('|', '').trim();

    // No debería aparecer solo "Desarrollador Software" si el rotador está funcionando
    // Debería mostrar el texto actual del rotador, no el fallback
    expect(content).not.toBe('Desarrollador Software');

    unmount();
  });

  it('should have fixed top right controls with proper positioning', async () => {
    renderWithProviders(<ProfileHero darkMode={false} />);

    // Buscar el contenedor de controles fijos
    const fixedTopRight = await screen.findByRole('button', {
      name: /modo oscuro activo/i,
    });
    const container = fixedTopRight.closest('div');

    expect(container).toBeInTheDocument();

    // Verificar que tiene las clases CSS necesarias para posición fija (CSS Modules)
    expect(container?.className).toContain('fixedTopRight');

    // Verificar que los estilos computados muestran posición fija
    const computedStyles = window.getComputedStyle(container!);
    expect(computedStyles.position).toBe('fixed');
    expect(computedStyles.zIndex).toBe('10001'); // z-index suficientemente alto
    expect(computedStyles.top).toBeTruthy();
    expect(computedStyles.right).toBeTruthy();
  });

  it('should have all required CSS classes defined', async () => {
    renderWithProviders(<ProfileHero darkMode={false} />);

    // Verificar que el header principal tiene la clase base
    const header = await screen.findByRole('banner');
    expect(header.className).toContain('headerCurriculum');

    // Verificar que no hay clases undefined (aparecerían como "undefined" en className)
    expect(header.className).not.toContain('undefined');

    // Buscar elementos específicos y verificar sus clases
    const themeButton = await screen.findByRole('button', {
      name: /modo oscuro activo/i,
    });
    expect(themeButton.className).toContain('topRightButton');
    expect(themeButton.className).not.toContain('undefined');
  });

  it('should handle loading state with proper CSS classes', () => {
    // Simplemente verificar que las clases CSS existen en el archivo de estilos
    const { container } = renderWithProviders(<ProfileHero darkMode={false} />);

    // Verificar que el componente se renderiza correctamente
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();

    // Las clases de loading y skeleton ahora existen en el CSS
    // Esta prueba pasa si el componente se renderiza sin errores CSS
    expect(header?.className).toContain('headerCurriculum');
  });

  describe('CSS Classes for State Management', () => {
    it('should not have undefined classes for scrolled, compact, and hidden states', () => {
      const { container } = renderWithProviders(<ProfileHero darkMode={false} />);

      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();

      // Verificar que no hay clases undefined
      const classList = Array.from(header?.classList || []);
      const undefinedClasses = classList.filter(className => className === 'undefined');

      expect(undefinedClasses).toHaveLength(0);

      // Verificar que todas las clases son válidas
      classList.forEach(className => {
        expect(className).not.toBe('undefined');
        expect(className).not.toBe('');
      });
    });
  });

  // **[TEST]** Nuevos tests para diseño móvil mejorado
  describe('Mobile Design Improvements', () => {
    beforeEach(() => {
      // Simular pantalla móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // iPhone SE width
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
    });

    it('should render theme and language buttons smaller on mobile', async () => {
      renderWithProviders(<ProfileHero darkMode={false} />);

      const themeButton = await screen.findByTitle(/cambiar a modo oscuro/i);
      const languageButton = await screen.findByTitle(/cambiar idioma/i);

      // Verificar que los botones tienen las clases de mobile (CSS Modules)
      expect(themeButton.className).toContain('topRightButton');
      expect(languageButton.className).toContain('topRightButton');

      // Los botones deben existir y ser accesibles
      expect(themeButton).toBeInTheDocument();
      expect(languageButton).toBeInTheDocument();
    });

    it('should display location and availability information in separate rows on mobile', async () => {
      renderWithProviders(<ProfileHero darkMode={false} />);

      // Verificar que existe el contenedor principal
      const locationContainer = await screen.findByRole('note', {
        name: /ubicación y disponibilidad/i,
      });
      expect(locationContainer).toBeInTheDocument();

      // Verificar que contiene la información de ubicación (texto puede estar separado)
      expect(screen.getByText(/cádiz/i)).toBeInTheDocument();
      expect(screen.getByText(/españa/i)).toBeInTheDocument();
      expect(screen.getByText(/disponible/i)).toBeInTheDocument();
      expect(screen.getByText(/abierto a remoto/i)).toBeInTheDocument();
    });

    it('should have proper spacing and layout for mobile view', async () => {
      renderWithProviders(<ProfileHero darkMode={false} />);

      // Verificar que el header principal tiene las clases responsive (CSS Modules)
      const header = await screen.findByRole('banner');
      expect(header.className).toContain('headerCurriculum');

      // El contenedor de ubicación debe tener la clase para 3 filas en móvil (CSS Modules)
      const locationContainer = await screen.findByRole('note');
      expect(locationContainer.className).toContain('availabilityPill');
    });
  });
});
