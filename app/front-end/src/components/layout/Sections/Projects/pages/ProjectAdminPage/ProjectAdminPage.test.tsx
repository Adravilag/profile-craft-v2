// ProjectAdminPage integration tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Create mock functions
const mockNavigate = vi.fn();

// Mock all external dependencies
vi.mock('@/hooks/useAuthGuard', () => ({
  default: () => ({
    isLoading: false,
    isAuthenticated: true,
    shouldRender: true,
    error: null,
  }),
}));

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/ui', () => ({
  SmartNavigation: ({ navItems }: { navItems: any[] }) => (
    <nav data-testid="smart-navigation">
      {navItems.map(item => (
        <div key={item.id} data-testid={`nav-${item.id}`}>
          {item.label}
        </div>
      ))}
    </nav>
  ),
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../../admin/ProjectsAdmin', () => ({
  default: () => <div data-testid="projects-admin">Projects Admin</div>,
}));

vi.mock('../../components/ProjectForm/ProjectForm', () => ({
  default: ({ mode, projectId, onSuccess, onCancel }: any) => (
    <div data-testid="project-form">
      <div data-testid="project-form-mode">{mode || 'create'}</div>
      <div data-testid="project-form-project-id">{projectId || 'none'}</div>
      <button data-testid="project-form-success" onClick={onSuccess}>
        Success
      </button>
      <button data-testid="project-form-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

import ProjectAdminPage from './ProjectAdminPage';

const renderWithRouter = (initialEntries: string[] = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ProjectAdminPage />
    </MemoryRouter>
  );
};

describe('ProjectAdminPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Route-based Mode Detection', () => {
    it('should render ProjectsAdmin for base admin route', () => {
      renderWithRouter(['/projects/admin']);

      expect(screen.getByTestId('projects-admin')).toBeInTheDocument();
      expect(screen.getByText('Administración de Proyectos')).toBeInTheDocument();
    });

    it('should render ProjectForm in create mode for /projects/new', () => {
      renderWithRouter(['/projects/new']);

      expect(screen.getByTestId('project-form')).toBeInTheDocument();
      expect(screen.getByTestId('project-form-mode')).toHaveTextContent('create');
      expect(screen.getByTestId('project-form-project-id')).toHaveTextContent('none');
      expect(screen.queryByText('Administración de Proyectos')).not.toBeInTheDocument();
    });

    it('should render ProjectForm in edit mode for /projects/edit/:id', () => {
      renderWithRouter(['/projects/edit/123']);

      expect(screen.getByTestId('project-form')).toBeInTheDocument();
      expect(screen.getByTestId('project-form-mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('project-form-project-id')).toHaveTextContent('123');
      expect(screen.queryByText('Administración de Proyectos')).not.toBeInTheDocument();
    });
  });

  describe('Navigation and Layout', () => {
    it('should render SmartNavigation with correct nav items', () => {
      renderWithRouter(['/projects/admin']);

      const navigation = screen.getByTestId('smart-navigation');
      expect(navigation).toBeInTheDocument();

      // Check that all expected navigation items are present
      expect(screen.getByTestId('nav-home')).toHaveTextContent('Inicio');
      expect(screen.getByTestId('nav-projects')).toHaveTextContent('Proyectos');
      expect(screen.getByTestId('nav-contact')).toHaveTextContent('Contacto');
    });

    it('should render Footer component', () => {
      renderWithRouter(['/projects/admin']);

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should show header only in admin mode, not in create/edit modes', () => {
      // Admin mode - should show header
      renderWithRouter(['/projects/admin']);
      expect(screen.getByText('Administración de Proyectos')).toBeInTheDocument();
    });

    it('should not show header in create mode', () => {
      // Create mode - should not show header
      renderWithRouter(['/projects/new']);
      expect(screen.queryByText('Administración de Proyectos')).not.toBeInTheDocument();
    });

    it('should not show header in edit mode', () => {
      // Edit mode - should not show header
      renderWithRouter(['/projects/edit/123']);
      expect(screen.queryByText('Administración de Proyectos')).not.toBeInTheDocument();
    });
  });

  describe('ProjectForm Integration', () => {
    it('should pass correct props to ProjectForm in edit mode', () => {
      renderWithRouter(['/projects/edit/456']);

      const projectForm = screen.getByTestId('project-form');
      expect(projectForm).toBeInTheDocument();
      expect(screen.getByTestId('project-form-mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('project-form-project-id')).toHaveTextContent('456');
    });

    it('should pass correct props to ProjectForm in create mode', () => {
      renderWithRouter(['/projects/new']);

      const projectForm = screen.getByTestId('project-form');
      expect(projectForm).toBeInTheDocument();
      expect(screen.getByTestId('project-form-mode')).toHaveTextContent('create');
      expect(screen.getByTestId('project-form-project-id')).toHaveTextContent('none');
    });

    it('should provide success and cancel callbacks to ProjectForm', () => {
      renderWithRouter(['/projects/new']);

      expect(screen.getByTestId('project-form-success')).toBeInTheDocument();
      expect(screen.getByTestId('project-form-cancel')).toBeInTheDocument();
    });
  });

  describe('URL Parameter Extraction', () => {
    it('should extract projectId from edit URL correctly', () => {
      renderWithRouter(['/projects/edit/test-project-123']);

      // Verify that the component is rendered in edit mode with correct projectId
      expect(screen.getByTestId('project-form')).toBeInTheDocument();
      expect(screen.getByTestId('project-form-mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('project-form-project-id')).toHaveTextContent('test-project-123');
    });

    it('should handle complex project IDs in URL', () => {
      renderWithRouter(['/projects/edit/project-with-dashes-123']);

      expect(screen.getByTestId('project-form')).toBeInTheDocument();
      expect(screen.getByTestId('project-form-mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('project-form-project-id')).toHaveTextContent(
        'project-with-dashes-123'
      );
    });
  });

  describe('Navigation Callbacks', () => {
    it('should handle success callback navigation', () => {
      renderWithRouter(['/projects/new']);

      // Simulate success callback
      const successButton = screen.getByTestId('project-form-success');
      successButton.click();

      // Should navigate back to admin page
      expect(mockNavigate).toHaveBeenCalledWith('/projects/admin');
    });

    it('should handle cancel callback navigation', () => {
      renderWithRouter(['/projects/edit/123']);

      // Simulate cancel callback
      const cancelButton = screen.getByTestId('project-form-cancel');
      cancelButton.click();

      // Should navigate back to admin page
      expect(mockNavigate).toHaveBeenCalledWith('/projects/admin');
    });

    it('should provide proper navigation structure for ProjectForm callbacks', () => {
      renderWithRouter(['/projects/new']);

      // Verify that the navigation structure is in place
      // This will be important for ProjectForm success/cancel callbacks
      expect(screen.getByTestId('smart-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });
});
