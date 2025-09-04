/**
 * [TEST] SkillsSection - Difficulty Sorting con datos reales
 *
 * Este test reproduce el problema de ordenación por dificultad
 * usando la estructura de datos real (sin difficulty_level en Skill)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillsSection from './SkillsSection';

// Mock con datos reales (sin difficulty_level en el modelo Skill)
vi.mock('@/features/skills', () => ({
  useSkills: () => ({
    skills: [
      {
        id: 1,
        name: 'JavaScript',
        level: 90,
        // NOTE: NO hay difficulty_level en el modelo Skill real
        category: 'Frontend',
      },
      {
        id: 2,
        name: 'React',
        level: 85,
        // NOTE: NO hay difficulty_level en el modelo Skill real
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
      ],
    }),
    getAllCategories: () => ['Frontend'],
  }),
  useSkillsIcons: () => ({
    skillsIcons: [
      {
        name: 'javascript',
        svg_path: 'javascript.svg',
        difficulty_level: '2', // La dificultad está en skillsIcons, no en Skill
      },
      {
        name: 'react',
        svg_path: 'react.svg',
        difficulty_level: '3', // La dificultad está en skillsIcons, no en Skill
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
                {/* NOTE: skill.difficulty_level será undefined */}
                {skill.difficulty_level
                  ? ` (Difficulty: ${skill.difficulty_level})`
                  : ' (No Difficulty)'}
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

describe('[TEST] SkillsSection - Difficulty Sorting Real Data Problem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should FAIL to sort by difficulty because skills do not have difficulty_level property', () => {
    // [TEST] - Rojo: Este test demuestra que la ordenación por dificultad no funciona
    // porque los datos reales de Skill no tienen difficulty_level

    render(<SkillsSection showAdminFAB={false} />);

    const difficultyButton = screen.getByTestId('sort-difficulty-Frontend');
    fireEvent.click(difficultyButton);

    // Verificar que las skills aparecen en el mismo orden porque no tienen difficulty_level
    const skillsContainer = screen.getByTestId('skills-Frontend');
    const skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');

    const skillTexts = Array.from(skillElements).map(el => el.textContent);

    console.log('🔍 Skills without difficulty_level:', skillTexts);

    // [RESULTADO] Test failed - Las skills no se pueden ordenar por dificultad
    // porque el campo difficulty_level no existe en el modelo Skill
    expect(skillTexts).toEqual([
      'JavaScript (Level: 90) (No Difficulty)',
      'React (Level: 85) (No Difficulty)',
    ]);

    // Los textos confirman que no hay información de dificultad disponible
    expect(skillTexts.every(text => text.includes('(No Difficulty)'))).toBe(true);
  });
});
