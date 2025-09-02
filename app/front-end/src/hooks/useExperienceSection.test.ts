import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { Experience, Education } from '@/types/api';

// Mock de las notificaciones
vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

// Mock de otros hooks con factory functions
vi.mock('./useExperience', () => ({
  useExperience: vi.fn(),
}));

vi.mock('./useEducation', () => ({
  useEducation: vi.fn(),
}));

// Importar después de los mocks
import { useExperienceSection } from './useExperienceSection';
import { useExperience } from './useExperience';
import { useEducation } from './useEducation';

// Obtener referencias a los mocks
const mockUseExperience = vi.mocked(useExperience);
const mockUseEducation = vi.mocked(useEducation);

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
  title: 'Computer Science Degree',
  institution: 'Test University',
  start_date: '2020-01-01',
  end_date: '2024-01-01',
  description: 'Test education description',
  grade: '9.0',
  order_index: 1,
};

describe('useExperienceSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock por defecto de useExperience
    mockUseExperience.mockReturnValue({
      experiences: [mockExperience],
      loading: false,
      error: null,
      retryCount: 0,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      retry: vi.fn(),
      refresh: vi.fn(),
    });

    // Mock por defecto de useEducation
    mockUseEducation.mockReturnValue({
      education: [mockEducation],
      loading: false,
      error: null,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      refresh: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should combine experiences and education data', () => {
    const { result } = renderHook(() => useExperienceSection());

    expect(result.current.experiences).toEqual([mockExperience]);
    expect(result.current.education).toEqual([mockEducation]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle loading state when either experiences or education is loading', () => {
    mockUseExperience.mockReturnValue({
      experiences: [],
      loading: true,
      error: null,
      retryCount: 0,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      retry: vi.fn(),
      refresh: vi.fn(),
    });

    const { result } = renderHook(() => useExperienceSection());

    expect(result.current.loading).toBe(true);
  });

  it('should combine chronological timeline data', () => {
    const { result } = renderHook(() => useExperienceSection());

    const chronologicalData = result.current.chronologicalData;

    expect(chronologicalData).toHaveLength(2);
    // Computer Science Degree (2024) debería estar primero
    expect(chronologicalData[0]).toEqual({
      _id: '1',
      id: undefined,
      title: 'Computer Science Degree',
      start_date: '2020-01-01',
      end_date: '2024-01-01',
      description: 'Test education description',
      type: 'education',
      institution: 'Test University',
      grade: '9.0',
    });
    // Software Developer (2023) debería estar segundo
    expect(chronologicalData[1]).toEqual({
      _id: '1',
      title: 'Software Developer',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      description: 'Test description',
      type: 'experience',
      company: 'Test Company',
      technologies: ['React', 'TypeScript'],
    });
  });

  it('should sort chronological data by end date descending', () => {
    const olderEducation = {
      ...mockEducation,
      _id: '2',
      title: 'High School',
      end_date: '2019-01-01',
    };

    mockUseEducation.mockReturnValue({
      education: [mockEducation, olderEducation],
      loading: false,
      error: null,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      refresh: vi.fn(),
    });

    const { result } = renderHook(() => useExperienceSection());

    const chronologicalData = result.current.chronologicalData;

    // Debería estar ordenado por fecha de fin descendente (más reciente primero)
    expect(chronologicalData[0].title).toBe('Computer Science Degree'); // 2024 (más reciente)
    expect(chronologicalData[1].title).toBe('Software Developer'); // 2023
    expect(chronologicalData[2].title).toBe('High School'); // 2019 (más antigua)
  });

  it('should calculate statistics correctly', () => {
    const { result } = renderHook(() => useExperienceSection());

    const stats = result.current.stats;

    expect(stats.experienceCount).toBe(1);
    expect(stats.educationCount).toBe(1);
    expect(stats.technologiesCount).toBe(2); // React, TypeScript
  });

  it('should handle errors from either hook', () => {
    mockUseExperience.mockReturnValue({
      experiences: [],
      loading: false,
      error: 'Experience error',
      retryCount: 1,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      retry: vi.fn(),
      refresh: vi.fn(),
    });

    const { result } = renderHook(() => useExperienceSection());

    expect(result.current.error).toBe('Experience error');
  });

  it('should provide unified action handlers', async () => {
    const mockExperienceCreate = vi.fn();
    const mockEducationCreate = vi.fn();

    mockUseExperience.mockReturnValue({
      experiences: [mockExperience],
      loading: false,
      error: null,
      retryCount: 0,
      create: mockExperienceCreate,
      update: vi.fn(),
      remove: vi.fn(),
      retry: vi.fn(),
      refresh: vi.fn(),
    });

    mockUseEducation.mockReturnValue({
      education: [mockEducation],
      loading: false,
      error: null,
      create: mockEducationCreate,
      update: vi.fn(),
      remove: vi.fn(),
      refresh: vi.fn(),
    });

    const { result } = renderHook(() => useExperienceSection());

    const newExperienceData = {
      position: 'New Position',
      company: 'New Company',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      description: 'New description',
      technologies: ['Vue'],
      is_current: false,
      order_index: 2,
      user_id: '1',
    };

    await result.current.createExperience(newExperienceData);

    expect(mockExperienceCreate).toHaveBeenCalledWith(newExperienceData);
  });

  it('should refresh all data', async () => {
    const mockExperienceRefresh = vi.fn();
    const mockEducationRefresh = vi.fn();

    mockUseExperience.mockReturnValue({
      experiences: [mockExperience],
      loading: false,
      error: null,
      retryCount: 0,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      retry: vi.fn(),
      refresh: mockExperienceRefresh,
    });

    mockUseEducation.mockReturnValue({
      education: [mockEducation],
      loading: false,
      error: null,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      refresh: mockEducationRefresh,
    });

    const { result } = renderHook(() => useExperienceSection());

    await result.current.refreshAll();

    expect(mockExperienceRefresh).toHaveBeenCalled();
    expect(mockEducationRefresh).toHaveBeenCalled();
  });
});
