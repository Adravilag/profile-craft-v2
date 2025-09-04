import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { useSkills } from './useSkills';
import type { Skill } from '@/types/api';

// Mock del servicio API
vi.mock('../../../../../services/api', () => ({
  getSkills: vi.fn(),
}));

const mockGetSkills = vi.mocked(await import('../../../../../services/api')).getSkills;

describe('useSkills - ProfileHero', () => {
  const mockSkills: Skill[] = [
    {
      id: 1,
      name: 'React',
      category: 'Frontend',
      level: 95,
      featured: true,
    },
    {
      id: 2,
      name: 'TypeScript',
      category: 'Frontend',
      level: 85,
      featured: true,
    },
    {
      id: 3,
      name: 'Node.js',
      category: 'Backend',
      level: 90,
      featured: true,
    },
    {
      id: 4,
      name: 'HTML',
      category: 'Frontend',
      level: 100,
      featured: true,
    },
    {
      id: 5,
      name: 'Python',
      category: 'Backend',
      level: 75,
      featured: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('[TEST] - Skills destacados deben estar ordenados por nivel de mayor a menor', async () => {
    // Arrange
    mockGetSkills.mockResolvedValue(mockSkills);

    // Act
    const { result } = renderHook(() => useSkills());

    // Wait for the hook to load the skills
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Get featured skills
    const featuredSkills = result.current.skills.filter(skill => skill.featured);

    // Assert - Los skills destacados deben estar ordenados por nivel descendente
    expect(featuredSkills).toHaveLength(4);

    // Verificar que están ordenados por nivel de mayor a menor
    const levels = featuredSkills.map(skill => skill.level || 0);
    const sortedLevels = [...levels].sort((a, b) => b - a);

    expect(levels).toEqual(sortedLevels);
    expect(levels).toEqual([100, 95, 90, 85]); // HTML, React, Node.js, TypeScript
  });

  test('[TEST] - Hook debe manejar skills sin nivel definido', async () => {
    // Arrange
    const skillsWithUndefinedLevel: Skill[] = [
      { id: 1, name: 'React', featured: true, level: 95 },
      { id: 2, name: 'Vue', featured: true }, // Sin level
      { id: 3, name: 'Angular', featured: true, level: 80 },
    ];

    mockGetSkills.mockResolvedValue(skillsWithUndefinedLevel);

    // Act
    const { result } = renderHook(() => useSkills());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const featuredSkills = result.current.skills.filter(skill => skill.featured);

    // Assert - Los skills sin nivel deben ir al final
    expect(featuredSkills).toHaveLength(3);
    const levels = featuredSkills.map(skill => skill.level || 0);
    expect(levels).toEqual([95, 80, 0]); // React, Angular, Vue (sin nivel = 0)
  });

  test('[TEST] - Hook debe proporcionar método para limitar skills destacados', async () => {
    // Arrange
    const manyFeaturedSkills: Skill[] = [
      { id: 1, name: 'React', featured: true, level: 95 },
      { id: 2, name: 'TypeScript', featured: true, level: 90 },
      { id: 3, name: 'Node.js', featured: true, level: 85 },
      { id: 4, name: 'HTML', featured: true, level: 100 },
      { id: 5, name: 'CSS', featured: true, level: 88 },
      { id: 6, name: 'JavaScript', featured: true, level: 92 },
      { id: 7, name: 'Vue', featured: true, level: 75 },
      { id: 8, name: 'Angular', featured: true, level: 80 },
    ];

    mockGetSkills.mockResolvedValue(manyFeaturedSkills);

    // Act
    const { result } = renderHook(() => useSkills());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert - El hook debe tener un método para obtener skills limitados
    expect(result.current.getTopFeaturedSkills).toBeDefined();
    expect(typeof result.current.getTopFeaturedSkills).toBe('function');

    // Verificar que el método limita correctamente a 6 skills
    const topSkills = result.current.getTopFeaturedSkills(6);
    expect(topSkills).toHaveLength(6);

    // Verificar que están ordenados por nivel y son los 6 mejores
    const expectedOrder = ['HTML', 'React', 'JavaScript', 'TypeScript', 'CSS', 'Node.js'];
    const actualNames = topSkills.map(skill => skill.name);
    expect(actualNames).toEqual(expectedOrder);
  });
});
