/**
 * [TEST] SmartNavigation Loading Integration - Integración con sistema centralizado
 *
 * Test para verificar que SmartNavigation se integra correctamente
 * con el sistema centralizado de loading.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SmartNavigation from './SmartNavigation';
import { SectionsLoadingProvider } from '@/contexts/SectionsLoadingContext';
import { useSectionsLoadingContext } from '@/contexts/SectionsLoadingContext';
import { vi } from 'vitest';

// Mock de los hooks requeridos
vi.mock('@/hooks', () => ({
  useNavigation: () => ({
    currentSection: 'home',
    navigateToSection: vi.fn(),
  }),
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('@/hooks/useInitialScrollToSection', () => ({
  useInitialScrollToSection: vi.fn(),
}));

// Componente de prueba para controlar el loading
const TestController: React.FC = () => {
  const { setLoading } = useSectionsLoadingContext();

  return (
    <div>
      <button data-testid="set-skills-loading" onClick={() => setLoading('skills', true)}>
        Set Skills Loading
      </button>
      <button data-testid="set-projects-loading" onClick={() => setLoading('projects', true)}>
        Set Projects Loading
      </button>
      <button
        data-testid="stop-all-loading"
        onClick={() => {
          setLoading('skills', false);
          setLoading('projects', false);
        }}
      >
        Stop All Loading
      </button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SectionsLoadingProvider>
        {component}
        <TestController />
      </SectionsLoadingProvider>
    </BrowserRouter>
  );
};

const mockNavItems = [
  { id: 'home', label: 'Inicio', icon: 'fas fa-home' },
  { id: 'about', label: 'Sobre mí', icon: 'fas fa-user' },
  { id: 'skills', label: 'Habilidades', icon: 'fas fa-cogs' },
  { id: 'projects', label: 'Proyectos', icon: 'fas fa-briefcase' },
];

describe('[TEST] SmartNavigation Loading Integration', () => {
  it('🔴 should show loading spinner when sections are loading', () => {
    // [TEST] - Rojo: Mostrar spinner cuando hay loading de secciones
    renderWithProviders(<SmartNavigation navItems={mockNavItems} />);

    // Verificar que no hay loading inicialmente
    expect(screen.queryByLabelText(/cargando datos/i)).not.toBeInTheDocument();

    // Activar loading de skills
    const skillsButton = screen.getByTestId('set-skills-loading');
    fireEvent.click(skillsButton);

    // Verificar que aparece el spinner con el mensaje correcto
    expect(screen.getByLabelText(/cargando datos/i)).toBeInTheDocument();
  });

  it('🔴 should hide loading spinner when no sections are loading', () => {
    // [TEST] - Rojo: Ocultar spinner cuando no hay loading
    renderWithProviders(<SmartNavigation navItems={mockNavItems} />);

    // Activar loading de múltiples secciones
    const skillsButton = screen.getByTestId('set-skills-loading');
    const projectsButton = screen.getByTestId('set-projects-loading');

    fireEvent.click(skillsButton);
    fireEvent.click(projectsButton);

    // Verificar que hay loading
    expect(screen.getByLabelText(/cargando datos/i)).toBeInTheDocument();

    // Detener todo el loading
    const stopButton = screen.getByTestId('stop-all-loading');
    fireEvent.click(stopButton);

    // Verificar que el spinner desaparece
    expect(screen.queryByLabelText(/cargando datos/i)).not.toBeInTheDocument();
  });

  it('🔴 should prioritize initial loading message over data loading', () => {
    // [TEST] - Rojo: El loading inicial debe tener prioridad sobre el de datos

    // Mock del hook de scroll inicial para simular loading inicial
    const mockSetIsInitialLoading = vi.fn();

    const MockedComponent = () => {
      const [isInitialLoading, setIsInitialLoading] = React.useState(true);

      React.useEffect(() => {
        mockSetIsInitialLoading.mockImplementation(setIsInitialLoading);
      }, []);

      return (
        <SmartNavigation
          navItems={mockNavItems.map(item => ({
            ...item,
            // Simular props del hook inicial
          }))}
        />
      );
    };

    renderWithProviders(<MockedComponent />);

    // Activar loading de datos mientras hay loading inicial
    const skillsButton = screen.getByTestId('set-skills-loading');
    fireEvent.click(skillsButton);

    // Verificar que muestra el mensaje de loading inicial
    expect(screen.getByLabelText(/cargando sección/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cargando datos/i)).not.toBeInTheDocument();
  });
});
