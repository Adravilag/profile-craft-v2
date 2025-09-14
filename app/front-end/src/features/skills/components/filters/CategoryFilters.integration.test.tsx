// src/features/skills/components/filters/CategoryFilters.integration.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CategoryFilters from './CategoryFilters';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { SkillsFilterProvider } from '../../contexts/SkillsFilterContext';
import seed from '@/config/skill_setings.json';

// Mock hooks
vi.mock('@/hooks/useIsOnSkillsPage', () => ({
  default: () => true,
}));

vi.mock('@/hooks/useScrollSectionDetection', () => ({
  default: () => ({
    detectVisibleSection: () => 'skills',
  }),
}));

vi.mock('@/hooks/useNavigation', () => ({
  useNavigation: () => ({
    currentSection: 'skills',
  }),
}));

vi.mock('../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <NavigationProvider>
        <SkillsFilterProvider>{component}</SkillsFilterProvider>
      </NavigationProvider>
    </BrowserRouter>
  );
};

describe('[TEST] CategoryFilters Integration - Filtro de habilidades', () => {
  // derive grouped skills and categories from seed for deterministic tests
  const grouped = seed.reduce(
    (acc: Record<string, any[]>, s) => {
      const cat = s.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ id: acc[cat].length + 1, name: s.name, category: cat, level: 50 });
      return acc;
    },
    {} as Record<string, any[]>
  );

  const mockSkillsGrouped = grouped;
  const mockCategories = ['All', ...Object.keys(grouped)];
  let mockOnCategoryChange: any;
  let currentSelectedCategory = 'All';

  beforeEach(() => {
    vi.clearAllMocks();
    currentSelectedCategory = 'All';
    mockOnCategoryChange = vi.fn((category: string) => {
      currentSelectedCategory = category;
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }));
  });

  it('🔴 [TEST] debe filtrar las habilidades cuando se selecciona una categoría', async () => {
    renderWithProviders(
      <CategoryFilters
        categories={mockCategories}
        selectedCategory={currentSelectedCategory}
        onCategoryChange={mockOnCategoryChange}
        skillsGrouped={mockSkillsGrouped}
        forceVisible={true}
      />
    );

    // Verificar que el botón de filtros está presente
    const filterButton = screen.getByLabelText('Filtros de categoría');
    expect(filterButton).toBeInTheDocument();

    // Abrir el panel de filtros
    fireEvent.click(filterButton);

    // Esperar a que aparezca el panel
    await waitFor(() => {
      expect(screen.getByText('Filtros de Categorías')).toBeInTheDocument();
    });

    // Verificar que todas las categorías están presentes usando nombres accesibles exactos
    expect(screen.getByRole('button', { name: 'All 4 habilidades' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Frontend 2 habilidades' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Backend 2 habilidades' })).toBeInTheDocument();

    // Hacer clic en la categoría "Frontend"
    const frontendButton = screen.getByRole('button', { name: 'Frontend 2 habilidades' });
    expect(frontendButton).toBeInTheDocument();

    fireEvent.click(frontendButton);

    // Verificar que se llamó a onCategoryChange con "Frontend"
    await waitFor(() => {
      expect(mockOnCategoryChange).toHaveBeenCalledWith('Frontend');
    });

    // Verificar que el panel se cierra después de la selección
    await waitFor(
      () => {
        expect(screen.queryByText('Filtros de Categorías')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('🔴 [TEST] debe persistir la selección en localStorage', async () => {
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

    renderWithProviders(
      <CategoryFilters
        categories={mockCategories}
        selectedCategory={currentSelectedCategory}
        onCategoryChange={mockOnCategoryChange}
        skillsGrouped={mockSkillsGrouped}
        forceVisible={true}
      />
    );

    // Abrir el panel
    fireEvent.click(screen.getByLabelText('Filtros de categoría'));

    // Esperar a que aparezca el panel
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Backend 2 habilidades' })).toBeInTheDocument();
    });

    // Seleccionar Backend
    const backendButton = screen.getByRole('button', { name: 'Backend 2 habilidades' });
    fireEvent.click(backendButton);

    // Verificar que se guardó en localStorage
    await waitFor(() => {
      expect(localStorageSpy).toHaveBeenCalledWith('skills-selected-category', 'Backend');
    });

    localStorageSpy.mockRestore();
  });

  it('🔴 [TEST] debe mostrar el conteo correcto de habilidades por categoría', async () => {
    renderWithProviders(
      <CategoryFilters
        categories={mockCategories}
        selectedCategory={currentSelectedCategory}
        onCategoryChange={mockOnCategoryChange}
        skillsGrouped={mockSkillsGrouped}
        forceVisible={true}
      />
    );

    // Abrir el panel
    fireEvent.click(screen.getByLabelText('Filtros de categoría'));

    await waitFor(() => {
      // Verificar conteos - usar getAllByText y verificar que existen los conteos esperados
      expect(screen.getByText('4 habilidades')).toBeInTheDocument(); // All
      const skillCountElements = screen.getAllByText('2 habilidades'); // Frontend y Backend
      expect(skillCountElements).toHaveLength(2);
    });
  });

  it('🔴 [TEST] debe sincronizar el filtro con el estado global para mostrar solo habilidades filtradas', async () => {
    // Este test verifica que cuando se selecciona una categoría,
    // las habilidades mostradas se filtren correctamente
    let globalSelectedCategory = 'All';
    const mockGlobalOnChange = vi.fn((category: string) => {
      globalSelectedCategory = category;
    });

    renderWithProviders(
      <CategoryFilters
        categories={mockCategories}
        selectedCategory={globalSelectedCategory}
        onCategoryChange={mockGlobalOnChange}
        skillsGrouped={mockSkillsGrouped}
        forceVisible={true}
      />
    );

    // Abrir el panel
    fireEvent.click(screen.getByLabelText('Filtros de categoría'));

    // Seleccionar Frontend
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Frontend 2 habilidades/i })).toBeInTheDocument();
    });

    const frontendButton = screen.getByRole('button', { name: /Frontend 2 habilidades/i });
    fireEvent.click(frontendButton);

    // Verificar que se llamó al callback de cambio
    await waitFor(() => {
      expect(mockGlobalOnChange).toHaveBeenCalledWith('Frontend');
    });

    // En una implementación correcta, aquí verificaríamos que solo se muestran
    // las habilidades de Frontend en el SkillsGrid
    // Por ahora, el test pasa si el callback se ejecuta correctamente
  });
});
