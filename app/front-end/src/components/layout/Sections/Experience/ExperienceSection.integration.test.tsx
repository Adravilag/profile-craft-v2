import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import type { Experience, Education } from '@/types/api';

// Mock de contextos y dependencias
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockOpenModal = vi.fn();
const mockCloseModal = vi.fn();
const mockOnOpenExperienceModal = vi.fn(() => vi.fn());

vi.mock('@/contexts', () => ({
  useNotificationContext: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      experience: {
        title: 'Experiencia',
        subtitle: 'Mi trayectoria profesional',
        loading: 'Cargando...',
        errorRetry: 'Reintentar',
        retryLimitReached: 'Límite alcanzado',
        workExperience: 'Experiencia Laboral',
        education: 'Educación',
        viewCategories: 'Por Categorías',
        viewChronological: 'Cronológica',
        stats: {
          experiences: 'Experiencias',
          certifications: 'Certificaciones',
          technologies: 'Tecnologías',
        },
        admin: {
          title: 'Administrar Experiencia',
          newExperience: 'Nueva Experiencia',
          newEducation: 'Nueva Educación',
          cancel: 'Cancelar',
          saveChanges: 'Guardar Cambios',
          create: 'Crear',
          edit: 'Editar',
          delete: 'Eliminar',
        },
      },
    },
  }),
}));

vi.mock('@/contexts/ModalContext', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}));

vi.mock('@/contexts/FabContext', () => ({
  useFab: () => ({
    onOpenExperienceModal: mockOnOpenExperienceModal,
  }),
}));

vi.mock('@/hooks/useTimelineAnimation', () => ({
  useTimelineAnimation: () => ({ current: null }),
}));

// Mock del hook principal con factory function
vi.mock('@/hooks/useExperienceSection', () => ({
  useExperienceSection: vi.fn(),
}));

// Importar después de los mocks
import ExperienceSection from './ExperienceSection';
import { useExperienceSection } from '@/hooks/useExperienceSection';

// Obtener referencia al mock
const mockUseExperienceSection = vi.mocked(useExperienceSection);

// Mock de componentes
vi.mock('../../HeaderSection/HeaderSection', () => ({
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="header-section">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('./components/cards/ExperienceCard', () => ({
  default: ({ experience, onEdit }: { experience: Experience; onEdit: () => void }) => (
    <div data-testid={`experience-card-${experience._id}`}>
      <h3>{experience.position}</h3>
      <p>{experience.company}</p>
      <button onClick={onEdit}>Editar</button>
    </div>
  ),
}));

vi.mock('./components/cards/EducationCard', () => ({
  default: ({ education, onEdit }: { education: Education; onEdit: () => void }) => (
    <div data-testid={`education-card-${education._id || education.id}`}>
      <h3>{education.title}</h3>
      <p>{education.institution}</p>
      <button onClick={onEdit}>Editar</button>
    </div>
  ),
}));

vi.mock('./components/items/ChronologicalItem', () => ({
  default: ({ item, onEdit }: { item: any; onEdit: (item: any) => void }) => (
    <div data-testid={`chronological-item-${item.type}-${item._id}`}>
      <h3>{item.title}</h3>
      <span>{item.type}</span>
      <button onClick={() => onEdit(item)}>Editar</button>
    </div>
  ),
}));

vi.mock('@/ui', () => ({
  AdminModal: ({
    isOpen,
    children,
    title,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    title: string;
  }) =>
    isOpen ? (
      <div data-testid="admin-modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

const mockExperience: Experience = {
  _id: '1',
  position: 'Software Developer',
  company: 'Test Company',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  description: 'Test description',
  technologies: ['React', 'TypeScript'],
  is_current: false,
  order_index: 1,
  user_id: '1',
};

const mockEducation: Education = {
  _id: '1',
  title: 'Computer Science',
  institution: 'Test University',
  start_date: '2020-01-01',
  end_date: '2024-01-01',
  description: 'Test education',
  grade: '9.0',
  order_index: 1,
};

describe('ExperienceSection Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock por defecto exitoso
    mockUseExperienceSection.mockReturnValue({
      experiences: [mockExperience],
      education: [mockEducation],
      chronologicalData: [
        {
          _id: '1',
          title: 'Computer Science',
          start_date: '2020-01-01',
          end_date: '2024-01-01',
          description: 'Test education',
          type: 'education',
          institution: 'Test University',
          grade: '9.0',
        },
        {
          _id: '1',
          title: 'Software Developer',
          start_date: '2023-01-01',
          end_date: '2023-12-31',
          description: 'Test description',
          type: 'experience',
          company: 'Test Company',
          technologies: ['React', 'TypeScript'],
        },
      ],
      loading: false,
      error: null,
      retryCount: 0,
      stats: {
        experienceCount: 1,
        educationCount: 1,
        technologiesCount: 2,
      },
      createExperience: vi.fn(),
      updateExperience: vi.fn(),
      removeExperience: vi.fn(),
      retryExperiences: vi.fn(),
      createEducation: vi.fn(),
      updateEducation: vi.fn(),
      removeEducation: vi.fn(),
      refreshAll: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render successfully with data from useExperienceSection hook', () => {
    render(<ExperienceSection />);

    expect(screen.getByTestId('header-section')).toBeInTheDocument();
    expect(screen.getByText('Experiencia')).toBeInTheDocument();
    expect(screen.getByText('Mi trayectoria profesional')).toBeInTheDocument();
  });

  it('should display statistics from the hook', () => {
    render(<ExperienceSection />);

    expect(screen.getAllByText('1')).toHaveLength(2); // experienceCount y educationCount
    expect(screen.getByText('Experiencias')).toBeInTheDocument();
    expect(screen.getByText('Certificaciones')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // technologiesCount
    expect(screen.getByText('Tecnologías')).toBeInTheDocument();
  });

  it('should render traditional view by default', () => {
    render(<ExperienceSection />);

    expect(screen.getByTestId('experience-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('education-card-1')).toBeInTheDocument();
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
  });

  it('should switch to chronological view when button is clicked', async () => {
    render(<ExperienceSection />);

    const chronologicalButton = screen.getByRole('button', { name: /vista cronológica/i });

    await act(async () => {
      fireEvent.click(chronologicalButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('chronological-item-education-1')).toBeInTheDocument();
      expect(screen.getByTestId('chronological-item-experience-1')).toBeInTheDocument();
    });
  });

  it('should show loading state when hook returns loading: true', () => {
    mockUseExperienceSection.mockReturnValue({
      experiences: [],
      education: [],
      chronologicalData: [],
      loading: true,
      error: null,
      retryCount: 0,
      stats: { experienceCount: 0, educationCount: 0, technologiesCount: 0 },
      createExperience: vi.fn(),
      updateExperience: vi.fn(),
      removeExperience: vi.fn(),
      retryExperiences: vi.fn(),
      createEducation: vi.fn(),
      updateEducation: vi.fn(),
      removeEducation: vi.fn(),
      refreshAll: vi.fn(),
    });

    render(<ExperienceSection />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should show error state and retry button when hook returns error', () => {
    const mockRetry = vi.fn();
    mockUseExperienceSection.mockReturnValue({
      experiences: [],
      education: [],
      chronologicalData: [],
      loading: false,
      error: 'Error al cargar datos',
      retryCount: 1,
      stats: { experienceCount: 0, educationCount: 0, technologiesCount: 0 },
      createExperience: vi.fn(),
      updateExperience: vi.fn(),
      removeExperience: vi.fn(),
      retryExperiences: mockRetry,
      createEducation: vi.fn(),
      updateEducation: vi.fn(),
      removeEducation: vi.fn(),
      refreshAll: vi.fn(),
    });

    render(<ExperienceSection />);

    expect(screen.getByText('Error al cargar datos')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('should call edit handlers when edit buttons are clicked in traditional view', async () => {
    render(<ExperienceSection />);

    const experienceEditButton = screen.getAllByText('Editar')[0];
    await act(async () => {
      fireEvent.click(experienceEditButton);
    });

    // Debería abrir el modal de edición
    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalled();
    });
  });

  it('should call edit handlers when edit buttons are clicked in chronological view', async () => {
    render(<ExperienceSection />);

    // Cambiar a vista cronológica
    const chronologicalButton = screen.getByRole('button', { name: /vista cronológica/i });
    await act(async () => {
      fireEvent.click(chronologicalButton);
    });

    await waitFor(() => {
      const chronologicalEditButton = screen
        .getByTestId('chronological-item-education-1')
        .querySelector('button');
      if (chronologicalEditButton) {
        fireEvent.click(chronologicalEditButton);
      }
    });

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalled();
    });
  });

  it('should handle view mode changes correctly', async () => {
    render(<ExperienceSection />);

    const traditionalButton = screen.getByRole('button', { name: /por categorías/i });
    const chronologicalButton = screen.getByRole('button', { name: /vista cronológica/i });

    // Verificar que traditional está activo por defecto (usar contains en lugar de exact class)
    expect(traditionalButton.className).toContain('view-toggle-btn-active');
    expect(chronologicalButton.className).toContain('view-toggle-btn-inactive');

    // Cambiar a cronológica
    await act(async () => {
      fireEvent.click(chronologicalButton);
    });

    await waitFor(() => {
      expect(chronologicalButton.className).toContain('view-toggle-btn-active');
      expect(traditionalButton.className).toContain('view-toggle-btn-inactive');
    });

    // Volver a traditional
    await act(async () => {
      fireEvent.click(traditionalButton);
    });

    await waitFor(() => {
      expect(traditionalButton.className).toContain('view-toggle-btn-active');
      expect(chronologicalButton.className).toContain('view-toggle-btn-inactive');
    });
  });
});
