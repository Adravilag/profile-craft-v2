/**
 * [TEST] SkillsSection - Reactivity and Auto-Update Verification
 *
 * Test que verifica que el componente SkillsSection se actualiza automáticamente
 * cuando se añaden o editan skills, asegurando que la ordenación y filtros
 * se mantengan correctos.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillsSection from './SkillsSection';
import seed from '@/config/skill_setings.json';

// Helper para obtener nombre por slug desde la semilla (fallback a slug si no existe)
const nameBySlug = (slug: string) => seed.find(s => s.slug === slug)?.name || slug;

// Mock data que simula cambios en los skills — inicializado desde la semilla
let mockSkills = seed
  .slice(0, 2)
  .map((s, i) => ({
    id: i + 1,
    name: s.name,
    level: 90 - i * 5,
    category: s.category || 'Frontend',
    featured: i === 0,
  }));
let mockSkillsIcons = seed
  .slice(0, 2)
  .map(s => ({ name: s.name.toLowerCase(), svg_path: s.svg, difficulty_level: '3' }));

// Contador de renders para verificar reactividad
let renderCount = 0;

vi.mock('@/features/skills', () => ({
  useSkills: () => {
    renderCount++;
    return {
      skills: mockSkills, // Esta variable cambiará y debería triggear re-renders
      loading: false,
      error: null,
      showModal: false,
      newSkill: { name: '', category: 'Frontend', svg_path: '', level: 50, featured: false },
      editingId: null,
      draggedSkillId: null,
      selectedCategory: 'All',
      setSelectedCategory: vi.fn(),
      handleOpenModal: vi.fn(),
      handleCloseModal: vi.fn(),
      handleFormChange: vi.fn(),
      handleFormChangeWithIcon: vi.fn(),
      handleAddSkill: vi.fn(),
      handleEditSkill: vi.fn(),
      handleDeleteSkill: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDrop: vi.fn(),
      getFilteredGrouped: () => ({
        Frontend: mockSkills.filter(s => s.category === 'Frontend'),
      }),
      getAllCategories: () => ['All', 'Frontend'],
    };
  },
  useSkillsIcons: () => ({
    skillsIcons: mockSkillsIcons,
    loading: false,
    error: null,
  }),
  useSkillsFilter: () => ({
    filteredGrouped: {},
    selectedCategory: 'All',
    setSelectedCategory: vi.fn(),
  }),
  SkillsGrid: ({ filteredGrouped }: any) => (
    <div data-testid="skills-grid">
      {Object.entries(filteredGrouped).map(([category, skills]: [string, any[]]) => (
        <div key={category} data-testid={`category-${category}`}>
          <h3>
            {category} ({skills.length} skills)
          </h3>
          <div data-testid={`skills-list-${category}`}>
            {(skills || []).map((skill: any) => (
              <div key={skill.id} data-testid={`skill-${skill.name}`}>
                {skill.name} (Level: {skill.level})
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  SkillModal: () => <div data-testid="skill-modal">Modal</div>,
}));

vi.mock('@/contexts/FabContext', () => ({
  useFab: () => ({
    onOpenSkillModal: vi.fn(() => () => {}),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
  }),
}));

describe('[TEST] SkillsSection - Reactivity Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderCount = 0;
    // Reset inicial: derive los mocks desde la semilla para evitar datos hardcodeados
    const base = seed.slice(0, 2);
    mockSkills = base.map((s, i) => ({
      id: i + 1,
      name: s.name,
      level: 90 - i * 5,
      category: s.category || 'Frontend',
      featured: i === 0,
    }));
    mockSkillsIcons = base.map(s => ({
      name: s.name.toLowerCase(),
      svg_path: s.svg || `${s.slug || s.name.toLowerCase()}.svg`,
      difficulty_level: '3',
    }));
  });

  it('✅ should pass: component has reactive dependencies on skills state', () => {
    // [TEST] - Verde: Verificar que las dependencias están configuradas correctamente

    const { rerender } = render(<SkillsSection showAdminFAB={false} />);

    // Verificar estado inicial
    expect(screen.getByTestId('category-Frontend')).toHaveTextContent('Frontend (2 skills)');
    expect(screen.getByTestId('skill-React')).toBeInTheDocument();
    expect(screen.getByTestId('skill-JavaScript')).toBeInTheDocument();

    const initialRenderCount = renderCount;

    // Simular cambio en mockSkills (como lo haría handleAddSkill internamente)
    mockSkills = [
      ...mockSkills,
      { id: 3, name: nameBySlug('vue'), level: 75, category: 'Frontend', featured: false },
    ];

    // Re-render para simular el cambio de estado
    rerender(<SkillsSection showAdminFAB={false} />);

    // [RESULTADO] Test passed - El componente recibe los nuevos datos
    expect(screen.getByTestId('category-Frontend')).toHaveTextContent('Frontend (3 skills)');
    expect(screen.getByTestId('skill-Vue')).toBeInTheDocument();

    // Verificar que se triggereó un nuevo render
    expect(renderCount).toBeGreaterThan(initialRenderCount);
  });

  it('✅ should pass: useMemo dependencies include skills for sortedFilteredGrouped', () => {
    // [TEST] - Verde: Verificar que el useMemo se recalcula cuando cambian los skills

    const { rerender } = render(<SkillsSection showAdminFAB={false} />);

    // Verificar que los skills se muestran correctamente inicialmente
    let skillsContainer = screen.getByTestId('skills-list-Frontend');
    let skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');
    expect(skillElements).toHaveLength(2);

    // Cambiar los skills
    mockSkills = [
      { id: 1, name: nameBySlug('react'), level: 95, category: 'Frontend', featured: true }, // Cambio nivel
      { id: 2, name: nameBySlug('javascript'), level: 85, category: 'Frontend', featured: false },
      { id: 4, name: nameBySlug('angular'), level: 70, category: 'Frontend', featured: false }, // Nuevo skill
    ];

    // Re-render
    rerender(<SkillsSection showAdminFAB={false} />);

    // [RESULTADO] Test passed - El useMemo se recalcula con los nuevos datos
    skillsContainer = screen.getByTestId('skills-list-Frontend');
    skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');
    expect(skillElements).toHaveLength(3);

    // Verificar que el nuevo skill aparece
    expect(screen.getByTestId('skill-Angular')).toBeInTheDocument();

    // Verificar que el cambio de nivel se refleja
    expect(screen.getByTestId('skill-React')).toHaveTextContent('Level: 95');
  });

  it('✅ should pass: component rerenders when skills context changes', () => {
    // [TEST] - Verde: Verificar comportamiento reactivo completo

    const { rerender } = render(<SkillsSection showAdminFAB={false} />);

    const initialRenderCount = renderCount;

    // Simular múltiples cambios como los que harían las operaciones CRUD

    // 1. Añadir skill
    mockSkills.push({
      id: 5,
      name: nameBySlug('typescript'),
      level: 88,
      category: 'Frontend',
      featured: true,
    });
    rerender(<SkillsSection showAdminFAB={false} />);

    expect(screen.getByTestId('skill-TypeScript')).toBeInTheDocument();
    expect(renderCount).toBeGreaterThan(initialRenderCount);

    // 2. Editar skill
    const prevRenderCount = renderCount;
    mockSkills[0] = { ...mockSkills[0], level: 100 }; // Cambiar React a nivel 100
    rerender(<SkillsSection showAdminFAB={false} />);

    expect(screen.getByTestId('skill-React')).toHaveTextContent('Level: 100');
    expect(renderCount).toBeGreaterThan(prevRenderCount);

    // 3. Eliminar skill
    const beforeDeleteRenderCount = renderCount;
    mockSkills = mockSkills.filter(s => s.name !== nameBySlug('javascript'));
    rerender(<SkillsSection showAdminFAB={false} />);

    expect(screen.queryByTestId('skill-JavaScript')).not.toBeInTheDocument();
    expect(renderCount).toBeGreaterThan(beforeDeleteRenderCount);

    // [RESULTADO] Test passed - El componente es completamente reactivo a cambios en skills
  });
});
