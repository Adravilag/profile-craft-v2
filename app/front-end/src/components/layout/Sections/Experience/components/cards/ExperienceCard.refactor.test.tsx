import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Experience } from '@/types/api';

// Mock del hook useExperienceCard con factory function
vi.mock('./hooks/useExperienceCard', () => ({
  useExperienceCard: vi.fn(),
}));

// Importar componente y hook después de los mocks
import ExperienceCard from './ExperienceCard';
import { useExperienceCard } from './hooks/useExperienceCard';

// Obtener referencia al mock
const mockUseExperienceCard = vi.mocked(useExperienceCard);

// Mock del componente ChronologicalCard
vi.mock('../items/ChronologicalCard', () => ({
  default: ({
    item,
    onEdit,
    context,
  }: {
    item: any;
    onEdit?: (item: any) => void;
    context: string;
  }) => (
    <div data-testid="chronological-card">
      <h3>{item.title}</h3>
      <p>{item.company}</p>
      <span>{context}</span>
      {onEdit && <button onClick={() => onEdit(item)}>Editar</button>}
    </div>
  ),
}));

const mockExperience: Experience = {
  _id: '1',
  position: 'Senior Developer',
  company: 'Tech Company',
  start_date: '2020-01-01',
  end_date: '2023-12-31',
  technologies: ['React', 'TypeScript'],
  description: 'Great job',
  is_current: false,
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

describe('ExperienceCard (Refactor Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup del mock por defecto
    mockUseExperienceCard.mockReturnValue({
      isHovered: false,
      formattedDateRange: '2020 - 2023',
      animationDelay: '0.1s',
      technologiesList: ['React', 'TypeScript'],
      handleMouseEnter: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleEdit: vi.fn(),
      formattedItem: {
        ...mockExperience,
        title: 'Senior Developer',
        company: 'Tech Company',
        period: '2020 - 2023',
        animationDelay: '0.1s',
      },
    });
  });

  it('should render the component using the hook', () => {
    render(
      <ExperienceCard experience={mockExperience} index={1} animationDelay={0.1} onEdit={vi.fn()} />
    );

    // Verificar que el hook fue llamado con los parámetros correctos
    expect(mockUseExperienceCard).toHaveBeenCalledWith({
      experience: mockExperience,
      index: 1,
      animationDelay: 0.1,
      onEdit: expect.any(Function),
    });

    // Verificar que ChronologicalCard se renderiza
    expect(screen.getByTestId('chronological-card')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Company')).toBeInTheDocument();
  });

  it('should call hook handlers when mouse events occur', () => {
    const mockHandleMouseEnter = vi.fn();
    const mockHandleMouseLeave = vi.fn();

    mockUseExperienceCard.mockReturnValue({
      isHovered: false,
      formattedDateRange: '2020 - 2023',
      animationDelay: '0.1s',
      technologiesList: ['React', 'TypeScript'],
      handleMouseEnter: mockHandleMouseEnter,
      handleMouseLeave: mockHandleMouseLeave,
      handleEdit: vi.fn(),
      formattedItem: {
        ...mockExperience,
        title: 'Senior Developer',
        company: 'Tech Company',
        period: '2020 - 2023',
        animationDelay: '0.1s',
      },
    });

    render(
      <ExperienceCard experience={mockExperience} index={1} animationDelay={0.1} onEdit={vi.fn()} />
    );

    const card = screen.getByTestId('chronological-card');

    // Simular eventos de mouse
    fireEvent.mouseEnter(card);
    expect(mockHandleMouseEnter).toHaveBeenCalled();

    fireEvent.mouseLeave(card);
    expect(mockHandleMouseLeave).toHaveBeenCalled();
  });

  it('should call hook edit handler when edit button is clicked', () => {
    const mockHandleEdit = vi.fn();

    mockUseExperienceCard.mockReturnValue({
      isHovered: false,
      formattedDateRange: '2020 - 2023',
      animationDelay: '0.1s',
      technologiesList: ['React', 'TypeScript'],
      handleMouseEnter: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleEdit: mockHandleEdit,
      formattedItem: {
        ...mockExperience,
        title: 'Senior Developer',
        company: 'Tech Company',
        period: '2020 - 2023',
        animationDelay: '0.1s',
      },
    });

    render(
      <ExperienceCard experience={mockExperience} index={1} animationDelay={0.1} onEdit={vi.fn()} />
    );

    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    expect(mockHandleEdit).toHaveBeenCalledWith({
      ...mockExperience,
      title: 'Senior Developer',
      company: 'Tech Company',
      period: '2020 - 2023',
      animationDelay: '0.1s',
    });
  });

  it('should pass the correct context to ChronologicalCard', () => {
    render(
      <ExperienceCard experience={mockExperience} index={1} animationDelay={0.1} onEdit={vi.fn()} />
    );

    expect(screen.getByText('experience')).toBeInTheDocument();
  });

  it('should handle different animation delays correctly', () => {
    mockUseExperienceCard.mockReturnValue({
      isHovered: false,
      formattedDateRange: '2020 - 2023',
      animationDelay: '0.5s',
      technologiesList: ['React', 'TypeScript'],
      handleMouseEnter: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleEdit: vi.fn(),
      formattedItem: {
        ...mockExperience,
        title: 'Senior Developer',
        company: 'Tech Company',
        period: '2020 - 2023',
        animationDelay: '0.5s',
      },
    });

    render(
      <ExperienceCard experience={mockExperience} index={5} animationDelay={0.5} onEdit={vi.fn()} />
    );

    expect(mockUseExperienceCard).toHaveBeenCalledWith({
      experience: mockExperience,
      index: 5,
      animationDelay: 0.5,
      onEdit: expect.any(Function),
    });
  });

  it('should work without onEdit prop', () => {
    render(<ExperienceCard experience={mockExperience} index={1} animationDelay={0.1} />);

    expect(mockUseExperienceCard).toHaveBeenCalledWith({
      experience: mockExperience,
      index: 1,
      animationDelay: 0.1,
      onEdit: undefined,
    });

    expect(screen.getByTestId('chronological-card')).toBeInTheDocument();
  });
});
