import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExperienceAdmin } from './useExperienceAdmin';

// Mock de notificaciones
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

// Mock de Experience y Education hooks
const mockExperiences = [
  {
    _id: '1',
    position: 'Developer',
    company: 'Tech Corp',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    description: 'Testing role',
    technologies: ['React', 'TypeScript'],
    is_current: false,
    order_index: 1,
    user_id: '1',
  },
];

const mockEducation = [
  {
    _id: '1',
    id: 1,
    title: 'Computer Science',
    institution: 'University',
    start_date: '2020-01-01',
    end_date: '2024-01-01',
    description: 'Bachelor degree',
    grade: 'Excellent',
    order_index: 1,
  },
];

vi.mock('@/hooks/useExperience', () => ({
  useExperience: () => ({
    experiences: mockExperiences,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock('@/hooks/useEducation', () => ({
  useEducation: () => ({
    education: mockEducation,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }),
}));

describe('useExperienceAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    expect(result.current.showAdminModal).toBe(false);
    expect(result.current.activeAdminSection).toBe('experience');
    expect(result.current.showForm).toBe(false);
    expect(result.current.editingId).toBeNull();
    expect(result.current.editingType).toBeNull();
  });

  it('should toggle admin modal', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    act(() => {
      result.current.openAdminModal();
    });

    expect(result.current.showAdminModal).toBe(true);

    act(() => {
      result.current.closeAdminModal();
    });

    expect(result.current.showAdminModal).toBe(false);
  });

  it('should switch between admin sections', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    act(() => {
      result.current.setActiveAdminSection('education');
    });

    expect(result.current.activeAdminSection).toBe('education');

    act(() => {
      result.current.setActiveAdminSection('experience');
    });

    expect(result.current.activeAdminSection).toBe('experience');
  });

  it('should handle new item creation', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    act(() => {
      result.current.handleNewItem();
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.editingId).toBeNull();
    expect(result.current.editingType).toBe('experience');
  });

  it('should handle editing experience', () => {
    const { result } = renderHook(() => useExperienceAdmin());
    const experience = mockExperiences[0];

    act(() => {
      result.current.handleEditExperience(experience);
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.editingId).toBe('1');
    expect(result.current.editingType).toBe('experience');
  });

  it('should handle editing education', () => {
    const { result } = renderHook(() => useExperienceAdmin());
    const education = mockEducation[0];

    act(() => {
      result.current.handleEditEducation(education);
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.editingId).toBe('1');
    expect(result.current.editingType).toBe('education');
  });

  it('should handle form closure', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    // First open form
    act(() => {
      result.current.handleNewItem();
    });

    expect(result.current.showForm).toBe(true);

    // Then close it
    act(() => {
      result.current.handleCloseForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingId).toBeNull();
    expect(result.current.editingType).toBeNull();
  });

  it('should provide sorted experiences list', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    // Los datos vienen de los hooks mockeados, que deberían proporcionar arrays vacíos por defecto
    expect(Array.isArray(result.current.sortedExperiences)).toBe(true);
    expect(result.current.experiences).toEqual(mockExperiences);
  });

  it('should provide sorted education list', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    // Los datos vienen de los hooks mockeados, que deberían proporcionar arrays vacíos por defecto
    expect(Array.isArray(result.current.sortedEducation)).toBe(true);
    expect(result.current.education).toEqual(mockEducation);
  });

  it('should provide experience and education counts', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    expect(result.current.experienceCount).toBe(mockExperiences.length);
    expect(result.current.educationCount).toBe(mockEducation.length);
  });

  it('should have proper TypeScript return type', () => {
    const { result } = renderHook(() => useExperienceAdmin());

    // Verificar que todas las propiedades esperadas estén presentes
    expect(typeof result.current.showAdminModal).toBe('boolean');
    expect(typeof result.current.activeAdminSection).toBe('string');
    expect(typeof result.current.showForm).toBe('boolean');
    expect(typeof result.current.experienceCount).toBe('number');
    expect(typeof result.current.educationCount).toBe('number');

    // Verificar funciones
    expect(typeof result.current.openAdminModal).toBe('function');
    expect(typeof result.current.closeAdminModal).toBe('function');
    expect(typeof result.current.handleNewItem).toBe('function');
    expect(typeof result.current.handleEditExperience).toBe('function');
    expect(typeof result.current.handleEditEducation).toBe('function');
    expect(typeof result.current.handleCloseForm).toBe('function');
  });
});
