import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import SkillsGrid from './SkillsGrid';
import type { SkillIconData, SortOption } from '../../types/skills';
import styles from './SkillsGrid.module.css';

const rawSeed = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', '..', 'public', 'skill_settings.json'),
  'utf-8'
);
const seed = JSON.parse(rawSeed) as any[];

// derive small deterministic sets from seed
const seedSubset = seed.slice(0, 6);
const mockSkillsIcons: SkillIconData[] = seedSubset.map(
  s => ({ name: s.name.toLowerCase(), svg_path: s.svg }) as any
);
const mockSkills = seedSubset.slice(0, 3).map((s, idx) => ({
  id: idx + 1,
  name: s.name,
  level: 50 + idx * 20,
  difficulty_level: 3 - idx,
  category: 'Frontend',
}));
const mockFilteredGrouped = { Frontend: mockSkills };

describe('[TEST] SkillsGrid - Sorting Buttons', () => {
  const mockOnSortToggle = vi.fn();
  const defaultProps = {
    filteredGrouped: mockFilteredGrouped,
    skillsIcons: mockSkillsIcons,
    draggedSkillId: null,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    selectedSort: { Frontend: 'alphabetical' as SortOption },
    sortingClass: '',
    onSortToggle: mockOnSortToggle,
    onCategoryExpand: vi.fn(),
    isAdmin: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onSortToggle when alphabetical button is clicked', () => {
    render(<SkillsGrid {...defaultProps} />);

    const alphabeticalButton = screen.getByTitle('Ordenar alfabéticamente');
    fireEvent.click(alphabeticalButton);

    expect(mockOnSortToggle).toHaveBeenCalledWith('Frontend', 'alphabetical');
  });

  it('should call onSortToggle when difficulty button is clicked', () => {
    render(<SkillsGrid {...defaultProps} />);

    const difficultyButton = screen.getByTitle('Ordenar por dificultad');
    fireEvent.click(difficultyButton);

    expect(mockOnSortToggle).toHaveBeenCalledWith('Frontend', 'difficulty');
  });

  it('should call onSortToggle when level button is clicked', () => {
    render(<SkillsGrid {...defaultProps} />);

    const levelButton = screen.getByTitle('Ordenar por nivel');
    fireEvent.click(levelButton);

    expect(mockOnSortToggle).toHaveBeenCalledWith('Frontend', 'level');
  });

  it('should show active state for alphabetical sort when selected', () => {
    const propsWithAlphabeticalSort = {
      ...defaultProps,
      selectedSort: { Frontend: 'alphabetical' as SortOption },
    };

    render(<SkillsGrid {...propsWithAlphabeticalSort} />);

    const alphabeticalButton = screen.getByTitle('Ordenar alfabéticamente');
    expect(alphabeticalButton).toHaveClass(styles.active);
  });

  it('should show active state for difficulty sort when selected', () => {
    const propsWithDifficultySort = {
      ...defaultProps,
      selectedSort: { Frontend: 'difficulty' as SortOption },
    };

    render(<SkillsGrid {...propsWithDifficultySort} />);

    const difficultyButton = screen.getByTitle('Ordenar por dificultad');
    expect(difficultyButton).toHaveClass(styles.active);
  });

  it('should show active state for level sort when selected', () => {
    const propsWithLevelSort = {
      ...defaultProps,
      selectedSort: { Frontend: 'level' as SortOption },
    };

    render(<SkillsGrid {...propsWithLevelSort} />);

    const levelButton = screen.getByTitle('Ordenar por nivel');
    expect(levelButton).toHaveClass(styles.active);
  });

  it('should NOT override sorting from parent component - skills should be in order passed by filteredGrouped', () => {
    // CRÍTICO: SkillsGrid NO debe aplicar su propia ordenación
    // Debe respetar el orden que viene en filteredGrouped desde SkillsSection
    const skillsInSpecificOrder = [
      { id: 2, name: 'Angular', level: 40, difficulty_level: 4, category: 'Frontend' }, // Primer elemento: Angular (level bajo)
      { id: 1, name: 'React', level: 80, difficulty_level: 3, category: 'Frontend' }, // Segundo: React (level medio)
      { id: 3, name: 'Vue', level: 90, difficulty_level: 2, category: 'Frontend' }, // Tercero: Vue (level alto)
    ];

    const propsWithOrderedSkills = {
      ...defaultProps,
      filteredGrouped: { Frontend: skillsInSpecificOrder },
    };

    render(<SkillsGrid {...propsWithOrderedSkills} />);

    // Los skills deben aparecer en el orden EXACTO que viene del parent (Angular, React, Vue)
    // Si SkillsGrid aplica su ordenación hardcodeada por level, aparecerían: Vue(90), React(80), Angular(40)
    // Pero deben aparecer como el parent los ordenó: Angular, React, Vue
    const skillNames = screen.getAllByText(/Angular|React|Vue/);

    console.log(
      '🔍 Debug: Skills found:',
      skillNames.map(el => el.textContent)
    );

    expect(skillNames[0]).toHaveTextContent('Angular'); // Debe ser Angular primero
    expect(skillNames[1]).toHaveTextContent('React'); // Debe ser React segundo
    expect(skillNames[2]).toHaveTextContent('Vue'); // Debe ser Vue tercero
  });
});
