/**
 * [TEST] ChronologicalCard - Ocultar botones admin según autenticación
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChronologicalCard from './ChronologicalCard';
import { useAuth } from '@/contexts/AuthContext';

// Mock del contexto de autenticación
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock del contexto de traducción
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      experience: {
        title: 'Experiencia',
        education: 'Educación',
        admin: {
          edit: 'Editar',
          delete: 'Eliminar',
        },
      },
      forms: {
        experience: {
          technologies: 'Tecnologías',
          grade: 'Calificación',
        },
      },
    },
  }),
}));

// Mock de componentes utilitarios
vi.mock('@/components/ui/SkillPill/SkillPill', () => ({
  default: ({ name }: { name: string }) => <span data-testid="skill-pill">{name}</span>,
}));

vi.mock('@/utils/imageLookup', () => ({
  findImageForName: () => null,
}));

vi.mock('@/utils/dateUtils', () => ({
  formatDateRange: (start: string, end: string) => `${start} - ${end}`,
  calculateDuration: () => '2 años',
}));

vi.mock('@/components/utils/BlurImage', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const mockItem = {
  _id: '1',
  id: '1',
  title: 'Senior Developer',
  company: 'Tech Corp',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  description: 'Desarrollo de aplicaciones',
  type: 'experience' as const,
  technologies: ['React', 'TypeScript'],
};

const mockEditHandler = vi.fn();
const mockDeleteHandler = vi.fn();

describe('[TEST] ChronologicalCard - Botones admin según autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[TEST] NO debe mostrar botones de editar/eliminar cuando el usuario no está autenticado', () => {
    // ARRANGE: Usuario no autenticado
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    // ACT: Renderizar componente
    render(
      <ChronologicalCard item={mockItem} onEdit={mockEditHandler} onDelete={mockDeleteHandler} />
    );

    // ASSERT: Los botones de admin NO deben estar presentes
    expect(screen.queryByLabelText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Eliminar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('[TEST] SÍ debe mostrar botones de editar/eliminar cuando el usuario está autenticado', () => {
    // ARRANGE: Usuario autenticado
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Admin User', role: 'admin' },
    });

    // ACT: Renderizar componente
    render(
      <ChronologicalCard item={mockItem} onEdit={mockEditHandler} onDelete={mockDeleteHandler} />
    );

    // ASSERT: Los botones de admin SÍ deben estar presentes
    expect(screen.getByLabelText('Editar')).toBeInTheDocument();
    expect(screen.getByLabelText('Eliminar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });

  it('[TEST] debe mostrar el contenido base independientemente del estado de autenticación', () => {
    // ARRANGE: Usuario no autenticado
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    // ACT: Renderizar componente
    render(
      <ChronologicalCard item={mockItem} onEdit={mockEditHandler} onDelete={mockDeleteHandler} />
    );

    // ASSERT: El contenido principal siempre debe estar visible
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Desarrollo de aplicaciones')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01 - 2023-12-31')).toBeInTheDocument();
  });
});
