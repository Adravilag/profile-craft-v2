// src/features/skills/components/filters/CategoryFilters.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CategoryFilters from './CategoryFilters';
import { SkillsFilterProvider } from '../../contexts/SkillsFilterContext';
import '@testing-library/jest-dom';

// Mock para hooks
vi.mock('@/hooks/useIsOnSkillsPage', () => ({
  default: () => true,
}));

vi.mock('@/hooks/useScrollSectionDetection', () => ({
  default: () => ({
    detectVisibleSection: () => 'skills',
  }),
}));

const mockProps = {
  categories: ['All', 'Frontend', 'Backend', 'DevOps & Tools'],
  selectedCategory: 'All',
  onCategoryChange: vi.fn(),
  skillsGrouped: {
    Frontend: [
      { id: '1', name: 'React', featured: false },
      { id: '2', name: 'Vue', featured: true },
    ],
    Backend: [{ id: '3', name: 'Node.js', featured: false }],
    'DevOps & Tools': [{ id: '4', name: 'Docker', featured: true }],
  },
  forceVisible: true, // Para que siempre sea visible en tests
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SkillsFilterProvider>{component}</SkillsFilterProvider>
    </BrowserRouter>
  );
};

describe('CategoryFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🔴 Rojo - Tests que deben fallar inicialmente', () => {
    it('[TEST] debería mostrar un campo de búsqueda de categorías', () => {
      renderWithRouter(<CategoryFilters {...mockProps} />);

      // Hacer clic en el botón FAB para abrir el panel
      const fabButton = screen.getByRole('button', { name: /filtros de categoría/i });
      fireEvent.click(fabButton);

      const searchInput = screen.getByPlaceholderText(/buscar categorías/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('[TEST] debería filtrar categorías cuando se escribe en la búsqueda', async () => {
      renderWithRouter(<CategoryFilters {...mockProps} />);

      // Hacer clic en el botón FAB para abrir el panel
      const fabButton = screen.getByRole('button', { name: /filtros de categoría/i });
      fireEvent.click(fabButton);

      const searchInput = screen.getByPlaceholderText(/buscar categorías/i);
      fireEvent.change(searchInput, { target: { value: 'Front' } });

      await waitFor(() => {
        expect(screen.getByText('Frontend')).toBeInTheDocument();
        expect(screen.queryByText('Backend')).not.toBeInTheDocument();
      });
    });

    it('[TEST] debería mostrar estadísticas visuales por categoría', () => {
      renderWithRouter(<CategoryFilters {...mockProps} />);

      // Hacer clic en el botón FAB para abrir el panel
      const fabButton = screen.getByRole('button', { name: /filtros de categoría/i });
      fireEvent.click(fabButton);

      const frontendProgress = screen.getByTestId('category-progress-Frontend');
      expect(frontendProgress).toBeInTheDocument();
      expect(frontendProgress).toHaveStyle('width: 50%'); // 2 de 4 skills
    });

    it('[TEST] debería persistir el filtro seleccionado en localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      renderWithRouter(<CategoryFilters {...mockProps} />);

      // Hacer clic en el botón FAB para abrir el panel
      const fabButton = screen.getByRole('button', { name: /filtros de categoría/i });
      fireEvent.click(fabButton);

      const frontendButton = screen.getByText('Frontend');
      fireEvent.click(frontendButton);

      expect(setItemSpy).toHaveBeenCalledWith('skills-selected-category', 'Frontend');
    });

    it('[TEST] debería mostrar animación de carga suave al cambiar filtros', () => {
      renderWithRouter(<CategoryFilters {...mockProps} />);

      // Hacer clic en el botón FAB para abrir el panel
      const fabButton = screen.getByRole('button', { name: /filtros de categoría/i });
      fireEvent.click(fabButton);

      const frontendButton = screen.getByText('Frontend');
      fireEvent.click(frontendButton);

      const loadingIndicator = screen.getByTestId('filter-loading');
      expect(loadingIndicator).toBeInTheDocument();
      expect(loadingIndicator.className).toContain('fadeIn');
    });
  });

  describe('🟢 Verde - Funcionalidad básica existente', () => {
    it('debería renderizar todas las categorías', () => {
      renderWithRouter(<CategoryFilters {...mockProps} />);

      // Hacer clic en el botón FAB para abrir el panel
      const fabButton = screen.getByRole('button', { name: /filtros de categoría/i });
      fireEvent.click(fabButton);

      // Usar los nombres accesibles que realmente generan los botones
      expect(screen.getByRole('button', { name: /all 4 habilidades/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /frontend 2 habilidades/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /backend 1 habilidades/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /devops & tools 1 habilidades/i })
      ).toBeInTheDocument();
    });

    it('debería mostrar el contador de skills por categoría', () => {
      renderWithRouter(<CategoryFilters {...mockProps} />);

      // Hacer clic en el botón FAB para abrir el panel
      const fabButton = screen.getByRole('button', { name: /filtros de categoría/i });
      fireEvent.click(fabButton);

      expect(screen.getByText('2 habilidades')).toBeInTheDocument(); // Frontend
      expect(screen.getAllByText('1 habilidades')).toHaveLength(2); // Backend + DevOps & Tools
    });

    it('debería llamar onCategoryChange al hacer clic en una categoría', () => {
      renderWithRouter(<CategoryFilters {...mockProps} />);

      // Hacer clic en el botón FAB para abrir el panel
      const fabButton = screen.getByRole('button', { name: /filtros de categoría/i });
      fireEvent.click(fabButton);

      const frontendButton = screen.getByText('Frontend');
      fireEvent.click(frontendButton);

      expect(mockProps.onCategoryChange).toHaveBeenCalledWith('Frontend');
    });
  });
});
