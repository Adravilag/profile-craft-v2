import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock del hook useEducationCard con factory function
vi.mock('./hooks/useEducationCard', () => ({
  useEducationCard: vi.fn(),
}));

// Importar componente y hook después de los mocks
import EducationCard from './EducationCard';
import { useEducationCard } from './hooks/useEducationCard';

// Obtener referencia al mock
const mockUseEducationCard = vi.mocked(useEducationCard);

// Mock del componente ChronologicalCard
vi.mock('../items/ChronologicalCard', () => ({
  default: ({ item, onEdit, context }: { item: any; onEdit?: () => void; context: string }) => (
    <div data-testid="chronological-card">
      <h3>{item.title}</h3>
      <p>{item.institution}</p>
      <span>{context}</span>
      {onEdit && <button onClick={onEdit}>Editar</button>}
    </div>
  ),
}));

const mockEducation = {
  _id: '1',
  title: 'Computer Science',
  institution: 'Test University',
  start_date: '2020-01-01',
  end_date: '2024-01-01',
  description: 'Test education',
  grade: '9.0',
};

describe('EducationCard (Refactor Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup del mock por defecto
    mockUseEducationCard.mockReturnValue({
      isHovered: false,
      formattedDateRange: '2020 - 2024',
      animationDelay: '0.1s',
      gradeDisplay: 'Grade: 9.0',
      handleMouseEnter: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleEdit: vi.fn(),
      formattedItem: {
        _id: '1',
        id: undefined,
        title: 'Computer Science',
        institution: 'Test University',
        start_date: '2020-01-01',
        end_date: '2024-01-01',
        description: 'Test education',
        type: 'education',
        grade: '9.0',
        animationDelay: '0.1s',
      },
    });
  });

  it('should render the component using the hook', () => {
    render(
      <EducationCard education={mockEducation} index={1} animationDelay={0.1} onEdit={vi.fn()} />
    );

    // Verificar que el hook fue llamado con los parámetros correctos
    expect(mockUseEducationCard).toHaveBeenCalledWith({
      education: mockEducation,
      index: 1,
      animationDelay: 0.1,
      onEdit: expect.any(Function),
    });

    // Verificar que ChronologicalCard se renderiza
    expect(screen.getByTestId('chronological-card')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Test University')).toBeInTheDocument();
  });

  it('should call hook edit handler when edit button is clicked', () => {
    const mockHandleEdit = vi.fn();

    mockUseEducationCard.mockReturnValue({
      isHovered: false,
      formattedDateRange: '2020 - 2024',
      animationDelay: '0.1s',
      gradeDisplay: 'Grade: 9.0',
      handleMouseEnter: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleEdit: mockHandleEdit,
      formattedItem: {
        _id: '1',
        id: undefined,
        title: 'Computer Science',
        institution: 'Test University',
        start_date: '2020-01-01',
        end_date: '2024-01-01',
        description: 'Test education',
        type: 'education',
        grade: '9.0',
        animationDelay: '0.1s',
      },
    });

    render(
      <EducationCard education={mockEducation} index={1} animationDelay={0.1} onEdit={vi.fn()} />
    );

    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    expect(mockHandleEdit).toHaveBeenCalled();
  });

  it('should pass the correct context to ChronologicalCard', () => {
    render(
      <EducationCard education={mockEducation} index={1} animationDelay={0.1} onEdit={vi.fn()} />
    );

    expect(screen.getByText('education')).toBeInTheDocument();
  });

  it('should handle different animation delays correctly', () => {
    mockUseEducationCard.mockReturnValue({
      isHovered: false,
      formattedDateRange: '2020 - 2024',
      animationDelay: '0.5s',
      gradeDisplay: 'Grade: 9.0',
      handleMouseEnter: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleEdit: vi.fn(),
      formattedItem: {
        _id: '1',
        id: undefined,
        title: 'Computer Science',
        institution: 'Test University',
        start_date: '2020-01-01',
        end_date: '2024-01-01',
        description: 'Test education',
        type: 'education',
        grade: '9.0',
        animationDelay: '0.5s',
      },
    });

    render(
      <EducationCard education={mockEducation} index={5} animationDelay={0.1} onEdit={vi.fn()} />
    );

    expect(mockUseEducationCard).toHaveBeenCalledWith({
      education: mockEducation,
      index: 5,
      animationDelay: 0.1,
      onEdit: expect.any(Function),
    });
  });

  it('should work without onEdit prop', () => {
    render(<EducationCard education={mockEducation} index={1} animationDelay={0.1} />);

    expect(mockUseEducationCard).toHaveBeenCalledWith({
      education: mockEducation,
      index: 1,
      animationDelay: 0.1,
      onEdit: undefined,
    });

    expect(screen.getByTestId('chronological-card')).toBeInTheDocument();
  });

  it('should handle education without grade', () => {
    const educationWithoutGrade = {
      ...mockEducation,
      grade: undefined,
    };

    mockUseEducationCard.mockReturnValue({
      isHovered: false,
      formattedDateRange: '2020 - 2024',
      animationDelay: '0.1s',
      gradeDisplay: '',
      handleMouseEnter: vi.fn(),
      handleMouseLeave: vi.fn(),
      handleEdit: vi.fn(),
      formattedItem: {
        _id: '1',
        id: undefined,
        title: 'Computer Science',
        institution: 'Test University',
        start_date: '2020-01-01',
        end_date: '2024-01-01',
        description: 'Test education',
        type: 'education',
        grade: undefined,
        animationDelay: '0.1s',
      },
    });

    render(
      <EducationCard
        education={educationWithoutGrade}
        index={1}
        animationDelay={0.1}
        onEdit={vi.fn()}
      />
    );

    expect(mockUseEducationCard).toHaveBeenCalledWith({
      education: educationWithoutGrade,
      index: 1,
      animationDelay: 0.1,
      onEdit: expect.any(Function),
    });
  });
});
