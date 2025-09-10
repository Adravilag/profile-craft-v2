/**
 * [TEST] ProjectsSection - Funcionalidad base sin administración
 *
 * NOTA: Los botones de administración están ahora en el FAB (Floating Action Button)
 * Este componente solo maneja la visualización de proyectos
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectsSection from './ProjectsSection';
import { useAuth } from '@/contexts/AuthContext';

// Mock del contexto de autenticación
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock de los hooks personalizados
vi.mock('@/hooks', () => ({
  useProjectsData: vi.fn(() => ({
    projects: [], // Array vacío para mostrar estado empty
    loading: false, // No está cargando
    error: null, // Sin errores
    hasLoadedLocal: true,
    retry: vi.fn(),
    refresh: vi.fn(),
  })),
  useProjectMapper: vi.fn(() => ({
    mapItemToProject: vi.fn(item => ({
      id: String(item.id),
      title: item.title,
      description: item.description,
      technologies: item.technologies || [],
    })),
    mapProjects: vi.fn(items =>
      items.map(item => ({
        id: String(item.id),
        title: item.title,
        description: item.description,
        technologies: item.technologies || [],
      }))
    ),
  })),
  useProjectsFilter: vi.fn(() => ({
    selectedFilter: 'all',
    filteredProjects: [],
    setFilter: vi.fn(),
    showFilters: false,
  })),
  usePagination: vi.fn(() => ({
    currentPage: 1,
    totalPages: 1,
    paginatedItems: vi.fn(items => items),
    handlePageChange: vi.fn(),
    isChangingPage: false,
  })),
  useProjectModal: vi.fn(() => ({
    activeProject: null,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: false,
  })),
}));

// Mock del contexto de traducción
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      projects: {
        title: 'Proyectos',
      },
      projectsCarousel: {
        noProjects: 'No hay proyectos disponibles',
        createProject: 'Crear proyecto',
        loadingProblem: 'Error al cargar proyectos',
        retry: 'Reintentar',
      },
      actions: {
        showAll: 'Mostrar todo',
      },
    },
  }),
}));

// Mock del servicio de proyectos
vi.mock('@/services/endpoints', () => ({
  projects: {
    getProjects: vi.fn().mockResolvedValue([]), // Devolver array vacío inmediatamente
  },
}));

// Mock de componentes
vi.mock('../../HeaderSection/HeaderSection', () => ({
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="header-section">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('@/ui/components/layout/Pagination', () => ({
  default: () => <div data-testid="pagination">Paginación</div>,
}));

vi.mock('@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard', () => ({
  default: () => <div data-testid="project-card">Project Card</div>,
}));

vi.mock('@/features/projects/components/ProjectModal/ProjectModal', () => ({
  default: () => <div data-testid="project-modal">Project Modal</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('[TEST] ProjectsSection - Funcionalidad base', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[TEST] debe renderizar correctamente sin botones de administración', async () => {
    // ARRANGE: Usuario no autenticado (no importa para este componente)
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    // ACT: Renderizar sección de proyectos
    renderWithRouter(<ProjectsSection />);

    // ASSERT: Esperar a que aparezca el header de la sección
    await waitFor(() => {
      expect(screen.getByText('Proyectos')).toBeInTheDocument();
    });

    // ASSERT: No debe tener botones de administración (están en el FAB)
    expect(screen.queryByText('Crear proyecto')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /crear proyecto/i })).not.toBeInTheDocument();
  });

  it('[TEST] debe mostrar contenido base independientemente del estado de autenticación', async () => {
    // ARRANGE: Usuario autenticado
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Admin User', role: 'admin' },
    });

    // ACT: Renderizar componente
    renderWithRouter(<ProjectsSection />);

    // ASSERT: El contenido principal siempre debe estar visible
    expect(screen.getByTestId('header-section')).toBeInTheDocument();
    expect(screen.getByText('Proyectos')).toBeInTheDocument();

    // ASSERT: Tampoco debe tener botones de administración (están en el FAB)
    expect(screen.queryByText('Crear proyecto')).not.toBeInTheDocument();
  });

  it('[TEST] debe funcionar con diferentes props de navegación', async () => {
    // ARRANGE: Mock de función de click
    const mockOnProjectClick = vi.fn();

    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    // ACT: Renderizar con prop de navegación
    renderWithRouter(<ProjectsSection onProjectClick={mockOnProjectClick} />);

    // ASSERT: El contenido base debe estar presente
    expect(screen.getByTestId('header-section')).toBeInTheDocument();
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
  });
});
