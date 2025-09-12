// CreateProject backward compatibility tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateProject from '../CreateProject';

// Mock the dependencies
vi.mock('@/contexts', () => ({
  useNotificationContext: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  }),
  useUnifiedTheme: () => ({
    currentGlobalTheme: 'light',
    toggleGlobalTheme: vi.fn(),
  }),
}));

vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      forms: {
        experience: {
          cancel: 'Cancelar',
          save: 'Guardar',
          saving: 'Guardando...',
        },
      },
    },
  }),
}));

vi.mock('@/services/endpoints/projects', () => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
  getProjectById: vi.fn(),
}));

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CreateProject (Backward Compatibility)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without props (backward compatibility)', () => {
    render(
      <TestWrapper>
        <CreateProject />
      </TestWrapper>
    );

    // Should render the create form by default
    expect(screen.getByText('Crear Nuevo Proyecto')).toBeInTheDocument();
    expect(screen.getByText('Agrega un nuevo proyecto a tu portafolio')).toBeInTheDocument();
  });

  it('should maintain the same interface as before', () => {
    render(
      <TestWrapper>
        <CreateProject />
      </TestWrapper>
    );

    // Check that all the expected form elements are present
    expect(screen.getByLabelText(/Título del Proyecto/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/)).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('should render all tabs like the original component', () => {
    render(
      <TestWrapper>
        <CreateProject />
      </TestWrapper>
    );

    expect(screen.getByText('Básico')).toBeInTheDocument();
    expect(screen.getByText('Enlaces')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(screen.getByText('SEO')).toBeInTheDocument();
  });
});
