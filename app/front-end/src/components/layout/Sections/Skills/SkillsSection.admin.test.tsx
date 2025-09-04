import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import SkillsSection from './SkillsSection';
import type { Skill } from '@/types/api';

// Mock de los hooks y servicios necesarios
vi.mock('@/features/skills', () => ({
  useSkills: () => ({
    loading: false,
    error: null,
    showModal: false,
    newSkill: { name: '', category: 'Frontend', icon_class: '', level: 50, featured: false },
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
      Frontend: [
        { id: 1, name: 'React', level: 95, featured: true },
        { id: 2, name: 'TypeScript', level: 90, featured: false },
      ] as Skill[],
    }),
    getAllCategories: () => ['Frontend'],
  }),
  useSkillsIcons: () => ({
    skillsIcons: [
      { name: 'React', svg_path: '/icons/react.svg' },
      { name: 'TypeScript', svg_path: '/icons/typescript.svg' },
    ],
    loading: false,
  }),
  SkillsGrid: ({ isAdmin, filteredGrouped, onEdit, onDelete }: any) => (
    <div data-testid="skills-grid" data-is-admin={isAdmin}>
      {Object.entries(filteredGrouped).map(([category, skills]: [string, Skill[]]) =>
        skills.map(skill => (
          <div key={skill.id} data-testid={`skill-${skill.name}`}>
            <span>{skill.name}</span>
            {isAdmin && (
              <>
                <button data-testid={`edit-${skill.name}`} onClick={() => onEdit(skill)}>
                  Editar
                </button>
                <button data-testid={`delete-${skill.name}`} onClick={() => onDelete(skill.id)}>
                  Eliminar
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  ),
  SkillModal: () => null,
  useSkillsFilter: () => ({
    filteredGrouped: {},
    selectedCategory: 'All',
    handleCategoryChange: vi.fn(),
  }),
}));

vi.mock('@/contexts/FabContext', () => ({
  useFab: () => ({
    onOpenSkillModal: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../HeaderSection/HeaderSection', () => ({
  default: () => <div data-testid="header-section">Header</div>,
}));

const mockUseAuth = vi.mocked(await import('@/contexts/AuthContext')).useAuth;

describe('SkillsSection - Admin Mode Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('[TEST] - Los botones de editar deben mostrarse cuando el usuario está autenticado y showAdminFAB es true', async () => {
    // Arrange - Usuario autenticado
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Admin User' },
      loading: false,
      logout: vi.fn(),
      login: vi.fn(),
    });

    // Act
    render(<SkillsSection showAdminFAB={true} />);

    // Assert
    await waitFor(() => {
      const skillsGrid = screen.getByTestId('skills-grid');
      expect(skillsGrid).toHaveAttribute('data-is-admin', 'true');
    });

    // Verificar que los botones de editar están presentes
    expect(screen.getByTestId('edit-React')).toBeInTheDocument();
    expect(screen.getByTestId('edit-TypeScript')).toBeInTheDocument();
    expect(screen.getByTestId('delete-React')).toBeInTheDocument();
    expect(screen.getByTestId('delete-TypeScript')).toBeInTheDocument();
  });

  test('[TEST] - Los botones de editar NO deben mostrarse cuando el usuario no está autenticado', async () => {
    // Arrange - Usuario NO autenticado
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
      logout: vi.fn(),
      login: vi.fn(),
    });

    // Act
    render(<SkillsSection showAdminFAB={true} />);

    // Assert
    await waitFor(() => {
      const skillsGrid = screen.getByTestId('skills-grid');
      expect(skillsGrid).toHaveAttribute('data-is-admin', 'false');
    });

    // Verificar que los botones de editar NO están presentes
    expect(screen.queryByTestId('edit-React')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-TypeScript')).not.toBeInTheDocument();
  });

  test('[TEST] - Los botones de editar NO deben mostrarse cuando showAdminFAB es false', async () => {
    // Arrange - Usuario autenticado pero showAdminFAB es false
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Admin User' },
      loading: false,
      logout: vi.fn(),
      login: vi.fn(),
    });

    // Act
    render(<SkillsSection showAdminFAB={false} />);

    // Assert
    await waitFor(() => {
      const skillsGrid = screen.getByTestId('skills-grid');
      expect(skillsGrid).toHaveAttribute('data-is-admin', 'false');
    });

    // Verificar que los botones de editar NO están presentes
    expect(screen.queryByTestId('edit-React')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-TypeScript')).not.toBeInTheDocument();
  });
});
