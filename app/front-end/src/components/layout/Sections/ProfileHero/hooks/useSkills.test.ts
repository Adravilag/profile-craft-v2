import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { useSkills } from './useSkills';
import type { Skill } from '@/types/api';
import seed from '@/config/skill_setings.json';

// Mock del servicio API
vi.mock('../../../../../services/api', () => ({
  getSkills: vi.fn(),
}));

const mockGetSkills = vi.mocked(await import('../../../../../services/api')).getSkills;

describe('useSkills - ProfileHero', () => {
  // Derive deterministic mock data from the canonical seed to avoid duplication
  const mockSkills: Skill[] = seed.slice(0, 5).map(
    (s, i) =>
      ({
        id: i + 1,
        name: s.name,
        category: s.category || (i % 2 === 0 ? 'Frontend' : 'Backend'),
        level: [95, 85, 90, 100, 75][i] || 50,
        featured: i < 4, // first 4 are featured similar to previous expectations
      }) as Skill
  );

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
      { id: 1, name: seed[0].name, featured: true, level: 95 },
      { id: 2, name: seed[1].name, featured: true }, // Sin level
      { id: 3, name: seed[2].name, featured: true, level: 80 },
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
    const manyFeaturedSkills: Skill[] = seed.slice(0, 8).map(
      (s, i) =>
        ({
          id: i + 1,
          name: s.name,
          featured: true,
          level: [95, 90, 85, 100, 88, 92, 75, 80][i] || 80,
        }) as Skill
    );

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
    const actualNames = topSkills.map(skill => skill.name);

    // Compute expected order from the mock input so the test doesn't rely on
    // specific names in the external seed file.
    const expectedOrder = manyFeaturedSkills
      .slice()
      .sort((a, b) => (b.level || 0) - (a.level || 0))
      .slice(0, 6)
      .map(s => s.name);

    expect(actualNames).toEqual(expectedOrder);
  });
});
