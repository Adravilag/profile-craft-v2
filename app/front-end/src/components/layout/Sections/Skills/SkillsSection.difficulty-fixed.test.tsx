/**
 * [TEST] SkillsSection - Difficulty Sorting FIXED
 *
 * Test que valida que la ordenación por dificultad funciona
 * obteniendo difficulty_level desde skillsIcons
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillsSection from './SkillsSection';

// Mock con datos reales + skillsIcons con difficulty_level
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
        difficulty_level: '2', // beginner-intermediate
      },
      {
        name: 'react',
        svg_path: 'react.svg',
        difficulty_level: '3', // intermediate-advanced
      },
      {
        name: 'vue',
        svg_path: 'vue.svg',
        difficulty_level: '2', // beginner-intermediate
      },
      {
        name: 'angular',
        svg_path: 'angular.svg',
        difficulty_level: '4', // advanced-expert
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
            className={selectedSort?.[category]?.startsWith('difficulty') ? 'active' : ''}
          >
            Sort by Difficulty {selectedSort?.[category]?.includes('desc') ? '↓' : '↑'}
          </button>
          <div data-testid={`skills-${category}`}>
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

describe('[TEST] SkillsSection - Difficulty Sorting FIXED', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sort skills by difficulty level from skillsIcons when difficulty sort is clicked', () => {
    // [TEST] - Rojo -> Verde: Validar que la ordenación funciona con datos de skillsIcons

    render(<SkillsSection showAdminFAB={false} />);

    const difficultyButton = screen.getByTestId('sort-difficulty-Frontend');
    fireEvent.click(difficultyButton);

    const skillsContainer = screen.getByTestId('skills-Frontend');
    const skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');

    const skillNames = Array.from(skillElements).map(
      el => el.textContent?.split(' (Level:')[0] || ''
    );

    console.log('🔍 Skills sorted by difficulty (ASC):', skillNames);

    // [RESULTADO] Test passed - Ordenación por dificultad: 2, 2, 3, 4
    // JavaScript(2), Vue(2), React(3), Angular(4)
    expect(skillNames).toEqual([
      'JavaScript', // difficulty: 2
      'Vue', // difficulty: 2
      'React', // difficulty: 3
      'Angular', // difficulty: 4
    ]);
  });

  it('should sort skills by difficulty level descending when clicked twice', () => {
    // [TEST] - Validar ordenación descendente

    render(<SkillsSection showAdminFAB={false} />);

    const difficultyButton = screen.getByTestId('sort-difficulty-Frontend');
    fireEvent.click(difficultyButton); // Primer clic: ASC
    fireEvent.click(difficultyButton); // Segundo clic: DESC

    const skillsContainer = screen.getByTestId('skills-Frontend');
    const skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');

    const skillNames = Array.from(skillElements).map(
      el => el.textContent?.split(' (Level:')[0] || ''
    );

    console.log('🔍 Skills sorted by difficulty (DESC):', skillNames);

    // [RESULTADO] Test passed - Ordenación por dificultad descendente: 4, 3, 2, 2
    // Angular(4), React(3), JavaScript(2), Vue(2)
    expect(skillNames).toEqual([
      'Angular', // difficulty: 4
      'React', // difficulty: 3
      'JavaScript', // difficulty: 2
      'Vue', // difficulty: 2
    ]);
  });
});
