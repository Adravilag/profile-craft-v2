/**
 * [TEST] SkillCard - Ocultar menu admin según autenticación
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillCard from './SkillCard';
import { useAuth } from '@/contexts/AuthContext';

// Mock del contexto de autenticación
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock de utilitarios
vi.mock('../../utils/skillUtils', () => ({
  getSkillSvg: () => '/mock-icon.svg',
  getSkillCssClass: () => 'mock-css-class',
  getDifficultyStars: () => 3,
  testSvgAvailability: () => Promise.resolve(true),
}));

vi.mock('@/components/utils/BlurImage', () => ({
  default: ({ src, alt, onError }: any) => (
    <img src={src} alt={alt} onError={onError} data-testid="skill-icon" />
  ),
}));

vi.mock('../../utils/iconLoader', () => ({
  findSkillIcon: () => '/mock-icon.svg',
}));

vi.mock('../../utils/normalizeSkillName', () => ({
  normalizeSkillName: (name: string) => ({
    canonical: name.toLowerCase(),
    normalized: name.toLowerCase(),
  }),
}));

const mockSkill = {
  id: '1',
  name: 'React',
  category: 'Frontend',
  level: 85,
  featured: true,
  icon_class: '/mock-icon.svg',
};

const mockSkillsIcons = [
  {
    name: 'React',
    svg_path: '/mock-icon.svg',
    color: '#61DAFB',
    difficulty_level: 'intermediate',
  },
];

const mockEditHandler = vi.fn();
const mockDeleteHandler = vi.fn();
const mockDragStart = vi.fn();
const mockDragOver = vi.fn();
const mockDrop = vi.fn();

describe('[TEST] SkillCard - Menú admin según autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[TEST] NO debe mostrar menú de administración cuando el usuario no está autenticado', () => {
    // ARRANGE: Usuario no autenticado
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    // ACT: Renderizar SkillCard sin admin
    render(
      <SkillCard
        skill={mockSkill}
        skillsIcons={mockSkillsIcons}
        onEdit={mockEditHandler}
        onDelete={mockDeleteHandler}
        onDragStart={mockDragStart}
        onDragOver={mockDragOver}
        onDrop={mockDrop}
        isDragging={false}
        isAdmin={false} // Esto debería ser determinado automáticamente por isAuthenticated
      />
    );

    // ASSERT: El menú de administración NO debe estar presente
    expect(screen.queryByLabelText('Opciones')).not.toBeInTheDocument();
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /opciones/i })).not.toBeInTheDocument();
  });

  it('[TEST] SÍ debe mostrar menú de administración cuando el usuario está autenticado', () => {
    // ARRANGE: Usuario autenticado
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Admin User', role: 'admin' },
    });

    // ACT: Renderizar SkillCard con admin
    render(
      <SkillCard
        skill={mockSkill}
        skillsIcons={mockSkillsIcons}
        onEdit={mockEditHandler}
        onDelete={mockDeleteHandler}
        onDragStart={mockDragStart}
        onDragOver={mockDragOver}
        onDrop={mockDrop}
        isDragging={false}
        isAdmin={true} // Esto debería ser determinado automáticamente por isAuthenticated
      />
    );

    // ASSERT: El menú de administración SÍ debe estar presente
    expect(screen.getByLabelText('Opciones')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /opciones/i })).toBeInTheDocument();
  });

  it('[TEST] debe mostrar el contenido base independientemente del estado de autenticación', () => {
    // ARRANGE: Usuario no autenticado
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    // ACT: Renderizar componente
    render(
      <SkillCard
        skill={mockSkill}
        skillsIcons={mockSkillsIcons}
        onEdit={mockEditHandler}
        onDelete={mockDeleteHandler}
        onDragStart={mockDragStart}
        onDragOver={mockDragOver}
        onDrop={mockDrop}
        isDragging={false}
        isAdmin={false}
      />
    );

    // ASSERT: El contenido principal siempre debe estar visible
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByTestId('skill-icon')).toBeInTheDocument();

    // Verificar que el ícono de destacado está presente
    expect(screen.getByTitle('Destacado')).toBeInTheDocument();
  });
});
