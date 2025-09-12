/**
 * [TEST] SkillsSection - State Update on Add/Edit Skills
 *
 * Test que valida que al añadir o editar skills,
 * el estado de ordenación se actualice correctamente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SkillsSection from './SkillsSection';

// Mock data inicial
const initialSkills = [
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
];

const initialSkillsIcons = [
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
];

// Función mock que simula añadir una skill nueva
const mockHandleAddSkill = vi.fn();
const mockHandleEditSkill = vi.fn();

let currentSkills = [...initialSkills];
let currentSkillsIcons = [...initialSkillsIcons];

vi.mock('@/features/skills', () => ({
  useSkills: () => ({
    skills: currentSkills,
    loading: false,
    error: null,
    handleAddSkill: mockHandleAddSkill,
    handleEditSkill: mockHandleEditSkill,
    handleDeleteSkill: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDrop: vi.fn(),
    draggedSkillId: null,
    showModal: false,
    newSkill: { name: '', category: 'Frontend', svg_path: '', level: 50, featured: false },
    editingId: null,
    handleOpenModal: vi.fn(),
    handleCloseModal: vi.fn(),
    handleFormChange: vi.fn(),
    handleFormChangeWithIcon: vi.fn(),
    setSelectedCategory: vi.fn(),
    selectedCategory: 'All',
    getFilteredGrouped: () => ({
      Frontend: currentSkills.filter(s => s.category === 'Frontend'),
    }),
    getAllCategories: () => ['All', 'Frontend'],
  }),
  useSkillsIcons: () => ({
    skillsIcons: currentSkillsIcons,
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
            {(skills || []).map((skill: any) => {
              // Obtener dificultad desde skillsIcons
              const skillIcon = currentSkillsIcons.find(
                icon => icon.name.toLowerCase() === skill.name.toLowerCase()
              );
              const difficulty = skillIcon?.difficulty_level || '';

              return (
                <div key={skill.id} data-testid={`skill-${skill.name}`}>
                  {skill.name} (Level: {skill.level}, Difficulty: {difficulty})
                </div>
              );
            })}
          </div>
          {/* Botón para simular añadir skill */}
          <button
            data-testid={`add-skill-${category}`}
            onClick={() => {
              // Simular añadir nueva skill
              const newSkill = {
                id: Date.now(),
                name: 'Vue',
                level: 75,
                category: 'Frontend',
              };
              currentSkills = [...currentSkills, newSkill];

              // Añadir icono correspondiente
              const newIcon = {
                name: 'vue',
                svg_path: 'vue.svg',
                difficulty_level: '1', // Más fácil que las existentes
              };
              currentSkillsIcons = [...currentSkillsIcons, newIcon];

              mockHandleAddSkill();
            }}
          >
            Add Skill
          </button>
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

describe('[TEST] SkillsSection - State Update on Add/Edit Skills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset skills data
    currentSkills = [...initialSkills];
    currentSkillsIcons = [...initialSkillsIcons];
  });

  it('should maintain sorting state when adding a new skill', async () => {
    // [TEST] - Rojo: Verificar que el estado de ordenación se mantiene tras añadir skill

    const { rerender } = render(<SkillsSection showAdminFAB={false} />);

    // 1. Aplicar ordenación por dificultad
    const difficultyButton = screen.getByTestId('sort-difficulty-Frontend');
    fireEvent.click(difficultyButton);

    // Verificar ordenación inicial: JavaScript(2), React(3)
    let skillsContainer = screen.getByTestId('skills-Frontend');
    let skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');
    let skillNames = Array.from(skillElements).map(
      el => el.textContent?.split(' (Level:')[0] || ''
    );

    console.log('🔍 Skills before adding (sorted by difficulty):', skillNames);
    expect(skillNames).toEqual(['JavaScript', 'React']); // 2, 3

    // 2. Añadir nueva skill (Vue con difficulty 1)
    const addButton = screen.getByTestId('add-skill-Frontend');
    fireEvent.click(addButton);

    // 3. Re-render para simular actualización del componente
    rerender(<SkillsSection showAdminFAB={false} />);

    // 4. Verificar que el componente se actualizó pero ¿mantiene el sorting?
    await waitFor(() => {
      skillsContainer = screen.getByTestId('skills-Frontend');
      skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');
      skillNames = Array.from(skillElements).map(el => el.textContent?.split(' (Level:')[0] || '');

      console.log('🔍 Skills after adding Vue (should maintain sorting):', skillNames);
      console.log('🔍 Expected order by difficulty: Vue(1), JavaScript(2), React(3)');

      // [RESULTADO] Test failed - ¿Se mantiene la ordenación tras añadir?
      // Si el test falla, significa que el estado de ordenación se perdió
      expect(skillNames).toEqual(['Vue', 'JavaScript', 'React']); // 1, 2, 3
    });

    expect(mockHandleAddSkill).toHaveBeenCalled();
  });

  it('should re-sort automatically when skill difficulty changes after edit', async () => {
    // [TEST] - Validar que la ordenación se actualiza tras editar

    const { rerender } = render(<SkillsSection showAdminFAB={false} />);

    // 1. Aplicar ordenación por dificultad
    const difficultyButton = screen.getByTestId('sort-difficulty-Frontend');
    fireEvent.click(difficultyButton);

    // 2. Simular edición de JavaScript para cambiar su dificultad
    // Cambiar JavaScript de difficulty 2 a difficulty 4 (más difícil que React)
    const javascriptIndex = currentSkillsIcons.findIndex(icon => icon.name === 'javascript');
    if (javascriptIndex !== -1) {
      currentSkillsIcons[javascriptIndex] = {
        ...currentSkillsIcons[javascriptIndex],
        difficulty_level: '4', // Más difícil que React(3)
      };
    }

    // 3. Re-render para simular actualización tras edición
    rerender(<SkillsSection showAdminFAB={false} />);

    // 4. Verificar nueva ordenación: React(3), JavaScript(4)
    await waitFor(() => {
      const skillsContainer = screen.getByTestId('skills-Frontend');
      const skillElements = skillsContainer.querySelectorAll('[data-testid^="skill-"]');
      const skillNames = Array.from(skillElements).map(
        el => el.textContent?.split(' (Level:')[0] || ''
      );

      console.log('🔍 Skills after editing JavaScript difficulty (2→4):', skillNames);
      console.log('🔍 Expected new order: React(3), JavaScript(4)');

      // [RESULTADO] Test passed/failed - ¿Se actualiza automáticamente la ordenación?
      expect(skillNames).toEqual(['React', 'JavaScript']); // 3, 4
    });
  });
});
