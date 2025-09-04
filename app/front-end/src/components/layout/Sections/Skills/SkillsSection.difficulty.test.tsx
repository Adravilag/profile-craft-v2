import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SkillsSection from './SkillsSection';

// Mock de todos los hooks y contextos necesarios
vi.mock('@/features/skills', () => ({
  useSkills: () => ({
    skills: [
      {
        id: 1,
        name: 'JavaScript',
        level: 90,
        category: 'Frontend',
      },
      {
        id: 2,
        name: 'React',
        level: 85,
        category: 'Frontend',
      },
      {
        id: 3,
        name: 'Vue',
        level: 80,
        category: 'Frontend',
      },
      {
        id: 4,
        name: 'Angular',
        level: 75,
        category: 'Frontend',
      },
    ],
    loading: false,
    error: null,
    handleAddSkill: vi.fn(),
    handleEditSkill: vi.fn(),
    handleDeleteSkill: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDrop: vi.fn(),
    draggedSkillId: null,
    getFilteredGrouped: () => ({
      Frontend: [
        { id: 1, name: 'JavaScript', level: 90, category: 'Frontend' },
        { id: 2, name: 'React', level: 85, category: 'Frontend' },
        { id: 3, name: 'Vue', level: 80, category: 'Frontend' },
        { id: 4, name: 'Angular', level: 75, category: 'Frontend' },
      ],
    }),
    getAllCategories: () => ['Frontend'],
  }),
  useSkillsIcons: () => ({
    skillsIcons: [
      {
        name: 'javascript',
        svg_path: 'javascript.svg',
        difficulty_level: '2',
      },
      {
        name: 'react',
        svg_path: 'react.svg',
        difficulty_level: '3',
      },
      {
        name: 'vue',
        svg_path: 'vue.svg',
        difficulty_level: '2',
      },
      {
        name: 'angular',
        svg_path: 'angular.svg',
        difficulty_level: '4',
      },
    ],
    loading: false,
    error: null,
  }),
  useSkillsFilter: () => ({
    filteredGrouped: {},
    selectedCategory: 'All',
    setSelectedCategory: vi.fn(),
  }),
  SkillsGrid: ({ filteredGrouped, selectedSort, onSortToggle }: any) => (
    <div data-testid="skills-grid">
      {Object.entries(filteredGrouped).map(([category, skills]: [string, any[]]) => (
        <div key={category} data-testid={`category-${category}`}>
          <h3>{category}</h3>
          <button
            data-testid={`sort-difficulty-${category}`}
            onClick={() => onSortToggle?.(category, 'difficulty')}
          >
            Sort by Difficulty
          </button>
          <div data-testid={`skills-${category}`}>
            {(skills || []).map((skill: any) => {
              // Simular la lógica de obtener dificultad desde skillsIcons
              const skillIconsData = [
                { name: 'javascript', difficulty_level: '2' },
                { name: 'react', difficulty_level: '3' },
                { name: 'vue', difficulty_level: '2' },
                { name: 'angular', difficulty_level: '4' },
              ];
              const skillIcon = skillIconsData.find(
                icon => icon.name.toLowerCase() === skill.name.toLowerCase()
              );
              const difficulty = skillIcon?.difficulty_level || '';

              return (
                <div key={skill.id} data-testid={`skill-${skill.name}`}>
                  {skill.name} (Difficulty: {difficulty})
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  ),
  SkillModal: () => <div data-testid="skill-modal">Modal</div>,
}));

// Mock de contextos
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

vi.mock('@/features/skills/contexts/SkillsFilterContext', () => ({
  useSkillsFilterContext: () => ({
    filteredGrouped: {},
    selectedCategory: 'All',
    setSelectedCategory: vi.fn(),
  }),
}));

vi.mock('@/features/skills/hooks/useSkillsFilter', () => ({
  useSkillsFilter: () => ({
    filteredGrouped: {},
    selectedCategory: 'All',
    setSelectedCategory: vi.fn(),
  }),
}));

vi.mock('@/contexts/FabContext', () => ({
  useFab: () => ({
    onOpenSkillModal: vi.fn(() => vi.fn()),
  }),
}));

// Mock de componentes
vi.mock('@/components/layout/Sections/SectionHeader/HeaderSection', () => ({
  default: ({ title }: { title: string }) => <h2 data-testid="header">{title}</h2>,
}));

vi.mock('@/features/skills/components/grid/SkillsGrid', () => ({
  default: ({ filteredGrouped, selectedSort, onSortToggle }: any) => (
    <div data-testid="skills-grid">
      {Object.entries(filteredGrouped).map(([category, skills]: [string, any[]]) => (
        <div key={category} data-testid={`category-${category}`}>
          <h3>{category}</h3>
          <button
            data-testid={`sort-difficulty-${category}`}
            onClick={() => onSortToggle?.(category, 'difficulty')}
          >
            Sort by Difficulty
          </button>
          <div data-testid={`skills-${category}`}>
            {(skills || []).map((skill: any) => (
              <div key={skill.id} data-testid={`skill-${skill.name}`}>
                {skill.name} (Difficulty: {skill.difficulty_level})
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/features/skills/components/modals/SkillModal', () => ({
  default: () => <div data-testid="skill-modal">Modal</div>,
}));

describe('[TEST] SkillsSection - Difficulty Sorting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sort skills by difficulty level when difficulty sort is clicked', async () => {
    render(<SkillsSection showAdminFAB={true} />);

    // Verificar que las skills aparecen inicialmente
    await waitFor(() => {
      expect(screen.getByTestId('skills-grid')).toBeInTheDocument();
    });

    // Hacer click en el botón de ordenar por dificultad
    const difficultyButton = screen.getByTestId('sort-difficulty-Frontend');
    fireEvent.click(difficultyButton);

    // Verificar que las skills están ordenadas por difficulty_level ascendente
    // JavaScript (2), Vue (2), React (3), Angular (4)
    const skillsContainer = screen.getByTestId('skills-Frontend');
    const skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');

    console.log(
      '🔍 Skills after difficulty sort:',
      Array.from(skillElements).map(el => el.textContent)
    );

    // Primero deben aparecer las skills con menor difficulty_level
    expect(skillElements[0]).toHaveTextContent('JavaScript (Difficulty: 2)');
    expect(skillElements[1]).toHaveTextContent('Vue (Difficulty: 2)');
    expect(skillElements[2]).toHaveTextContent('React (Difficulty: 3)');
    expect(skillElements[3]).toHaveTextContent('Angular (Difficulty: 4)');
  });

  it('should sort skills by difficulty level descending when clicked twice', async () => {
    render(<SkillsSection showAdminFAB={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('skills-grid')).toBeInTheDocument();
    });

    // Hacer click dos veces para obtener orden descendente
    const difficultyButton = screen.getByTestId('sort-difficulty-Frontend');
    fireEvent.click(difficultyButton); // Primera vez: ascendente
    fireEvent.click(difficultyButton); // Segunda vez: descendente

    const skillsContainer = screen.getByTestId('skills-Frontend');
    const skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');

    console.log(
      '🔍 Skills after difficulty sort DESC:',
      Array.from(skillElements).map(el => el.textContent)
    );

    // Deben aparecer las skills con mayor difficulty_level primero
    expect(skillElements[0]).toHaveTextContent('Angular (Difficulty: 4)');
    expect(skillElements[1]).toHaveTextContent('React (Difficulty: 3)');
    expect(skillElements[2]).toHaveTextContent('JavaScript (Difficulty: 2)');
    expect(skillElements[3]).toHaveTextContent('Vue (Difficulty: 2)');
  });
});
