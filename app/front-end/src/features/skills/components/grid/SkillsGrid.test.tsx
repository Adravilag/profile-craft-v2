// src/features/skills/components/grid/SkillsGrid.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import SkillsGrid from './SkillsGrid';
import type { SkillsGridProps } from '../../types/skills';

// Load seed JSON from public at test runtime to avoid bundler path issues
const rawSeed = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', '..', 'public', 'skill_settings.json'),
  'utf-8'
);
const seed = JSON.parse(rawSeed) as any[];

describe('[TEST] SkillsGrid - Funcionalidad "Mostrar más"', () => {
  // Build a small deterministic subset from seed for test
  const firstThree = seed.slice(0, 6);
  const mockSkillsIcons = firstThree.map(s => ({
    name: s.name,
    svg: `<svg>${s.name}</svg>`,
    svg_path: `/${s.svg || ''}`,
  }));

  const mockFilteredGrouped = {
    Destacados: [
      { id: 1, name: firstThree[0].name, category: 'Frontend', level: 95, featured: true },
      { id: 2, name: firstThree[1].name, category: 'Backend', level: 90, featured: true },
    ],
    Frontend: [
      { id: 1, name: firstThree[0].name, category: 'Frontend', level: 95, featured: true },
      { id: 3, name: firstThree[2].name, category: 'Frontend', level: 85 },
      { id: 4, name: firstThree[3]?.name || 'Angular', category: 'Frontend', level: 80 },
    ],
    Backend: [
      { id: 2, name: firstThree[1].name, category: 'Backend', level: 90, featured: true },
      // Use further entries from the seed for backend examples when available
      {
        id: 5,
        name: seed.find(s => s.category === 'Backend')?.name || 'Python',
        category: 'Backend',
        level: 85,
      },
      {
        id: 6,
        name: seed.find(s => s.slug === 'java')?.name || 'Java',
        category: 'Backend',
        level: 75,
      },
    ],
  };

  const defaultProps: SkillsGridProps = {
    filteredGrouped: mockFilteredGrouped,
    skillsIcons: mockSkillsIcons,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    draggedSkillId: null,
    selectedSort: {},
    sortingClass: '',
    onSortToggle: vi.fn(),
    isAdmin: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🔴 Test Rojo - Funcionalidad inicial que debe fallar', () => {
    it('debe mostrar por defecto la categoría "Destacados" como primera', () => {
      render(<SkillsGrid {...defaultProps} />);

      // Buscar todas las categorías renderizadas
      const categoryTitles = screen.getAllByRole('heading', { level: 3 });

      // El primer título debe ser "Destacados"
      expect(categoryTitles[0]).toHaveTextContent(/Destacados/);
    });

    it('debe mostrar un botón "Mostrar más" debajo del grid de Destacados', () => {
      render(<SkillsGrid {...defaultProps} />);

      // Debe haber un botón "Mostrar más" visible
      const showMoreButton = screen.getByRole('button', { name: /mostrar más/i });
      expect(showMoreButton).toBeInTheDocument();
    });

    it('debe ocultar otras categorías por defecto cuando está en modo "Destacados"', () => {
      render(<SkillsGrid {...defaultProps} />);

      // Solo debe mostrar la categoría "Destacados" inicialmente
      // Buscar específicamente los títulos de categoría por su clase o contenido
      const categoryTitles = screen
        .getAllByRole('heading', { level: 3 })
        .filter(heading => heading.className.includes('categoryTitle'));

      expect(categoryTitles).toHaveLength(1);
      expect(categoryTitles[0]).toHaveTextContent(/Destacados/);
    });

    it('debe expandir a mostrar todas las categorías al hacer click en "Mostrar más"', () => {
      render(<SkillsGrid {...defaultProps} />);

      // Inicialmente solo "Destacados"
      const initialCategoryTitles = screen
        .getAllByRole('heading', { level: 3 })
        .filter(heading => heading.className.includes('categoryTitle'));
      expect(initialCategoryTitles).toHaveLength(1);

      // Click en "Mostrar más"
      const showMoreButton = screen.getByRole('button', { name: /mostrar más/i });
      fireEvent.click(showMoreButton);

      // Ahora debe mostrar todas las categorías
      const allCategories = screen
        .getAllByRole('heading', { level: 3 })
        .filter(heading => heading.className.includes('categoryTitle'));
      expect(allCategories).toHaveLength(3); // Destacados, Frontend, Backend

      // Verificar que están todas las categorías esperadas
      const categoryNames = allCategories.map(title => title.textContent);
      expect(categoryNames.some(name => name?.includes('Destacados'))).toBe(true);
      expect(categoryNames.some(name => name?.includes('Frontend'))).toBe(true);
      expect(categoryNames.some(name => name?.includes('Backend'))).toBe(true);
    });

    it('debe cambiar el texto del botón a "Mostrar menos" cuando está expandido', () => {
      render(<SkillsGrid {...defaultProps} />);

      const showMoreButton = screen.getByRole('button', { name: /mostrar más/i });
      fireEvent.click(showMoreButton);

      // El texto del botón debe cambiar
      expect(screen.getByRole('button', { name: /mostrar menos/i })).toBeInTheDocument();
    });
  });

  describe('🔴 Test Rojo - Funcionalidad para categorías específicas', () => {
    it('NO debe mostrar botón "Mostrar más" cuando se filtra por una categoría específica sin Destacados', () => {
      const frontendOnlyFiltered = {
        Frontend: mockFilteredGrouped.Frontend,
      };

      render(<SkillsGrid {...defaultProps} filteredGrouped={frontendOnlyFiltered} />);

      // NO debe haber un botón "Mostrar más" porque no hay Destacados
      expect(screen.queryByRole('button', { name: /mostrar más/i })).not.toBeInTheDocument();
    });

    it('debe mostrar botón "Mostrar más" solo cuando hay Destacados Y otras categorías', () => {
      // Este es el caso donde SÍ debe aparecer el botón
      render(<SkillsGrid {...defaultProps} filteredGrouped={mockFilteredGrouped} />);

      // Debe haber un botón "Mostrar más" porque hay Destacados + Frontend + Backend
      const showMoreButton = screen.getByRole('button', { name: /mostrar más/i });
      expect(showMoreButton).toBeInTheDocument();
    });

    it('debe mantener el filtro de categoría actual cuando se expande a "All"', () => {
      const mockOnCategoryExpand = vi.fn();

      render(
        <SkillsGrid
          {...defaultProps}
          filteredGrouped={mockFilteredGrouped}
          onCategoryExpand={mockOnCategoryExpand}
        />
      );

      const showMoreButton = screen.getByRole('button', { name: /mostrar más/i });
      fireEvent.click(showMoreButton);

      // Debe llamar a la función con 'All' para mostrar todas las categorías
      expect(mockOnCategoryExpand).toHaveBeenCalledWith('All');
    });
  });
});
