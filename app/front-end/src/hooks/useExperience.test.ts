import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { Experience } from '@/types/api';

// Mock de las notificaciones con referencias persistentes
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

// Mock de los endpoints de experiencia
vi.mock('@/services/endpoints', () => ({
  experiences: {
    getExperiences: vi.fn(),
    createExperience: vi.fn(),
    updateExperience: vi.fn(),
    deleteExperience: vi.fn(),
  },
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

describe('useExperience', () => {
  let mockGetExperiences: any;
  let mockCreateExperience: any;
  let mockUpdateExperience: any;
  let mockDeleteExperience: any;
  let useExperience: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Obtener los mocks
    const { experiences } = await import('@/services/endpoints');

    mockGetExperiences = experiences.getExperiences;
    mockCreateExperience = experiences.createExperience;
    mockUpdateExperience = experiences.updateExperience;
    mockDeleteExperience = experiences.deleteExperience;

    // Import del hook
    const hookModule = await import('./useExperience');
    useExperience = hookModule.useExperience;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load experiences on mount', async () => {
    mockGetExperiences.mockResolvedValueOnce([mockExperience]);

    const { result } = renderHook(() => useExperience());

    expect(result.current.loading).toBe(true);
    expect(result.current.experiences).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.experiences).toEqual([mockExperience]);
    expect(result.current.error).toBe(null);
    expect(mockGetExperiences).toHaveBeenCalledTimes(1);
  });

  it('should handle loading errors', async () => {
    const errorMessage = 'Failed to load experiences';
    mockGetExperiences.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useExperience());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar experiencias');
    expect(result.current.experiences).toEqual([]);
  });

  it('should create new experience', async () => {
    const newExperienceData = {
      position: 'New Position',
      company: 'New Company',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      description: 'New description',
      technologies: ['Vue', 'JavaScript'],
      is_current: false,
      order_index: 2,
      user_id: '1',
    };

    const createdExperience = { ...newExperienceData, _id: '2' };

    mockGetExperiences.mockResolvedValueOnce([mockExperience]);
    mockCreateExperience.mockResolvedValueOnce(createdExperience);

    const { result } = renderHook(() => useExperience());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.create(newExperienceData);
    });

    await waitFor(() => {
      expect(result.current.experiences).toContainEqual(createdExperience);
    });

    expect(mockCreateExperience).toHaveBeenCalledWith(newExperienceData);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Nueva Experiencia Creada',
      'Se ha creado "New Position" correctamente'
    );
  });

  it('should update existing experience', async () => {
    const updatedData = {
      position: 'Updated Position',
      company: 'Updated Company',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      description: 'Updated description',
      technologies: ['React', 'TypeScript', 'Node.js'],
      is_current: false,
      order_index: 1,
      user_id: '1',
    };

    const updatedExperience = { ...updatedData, _id: '1' };

    mockGetExperiences.mockResolvedValueOnce([mockExperience]);
    mockUpdateExperience.mockResolvedValueOnce(updatedData); // Solo devolver los datos actualizados

    const { result } = renderHook(() => useExperience());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.update('1', updatedData);
    });

    await waitFor(() => {
      expect(result.current.experiences[0]).toEqual(expect.objectContaining(updatedData));
    });

    expect(mockUpdateExperience).toHaveBeenCalledWith('1', updatedData);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Experiencia Actualizada',
      'Se ha actualizado "Updated Position" correctamente'
    );
  });

  it('should delete experience', async () => {
    mockGetExperiences.mockResolvedValueOnce([mockExperience]);
    mockDeleteExperience.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useExperience());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.remove('1', 'Software Developer');
    });

    await waitFor(() => {
      expect(result.current.experiences).toEqual([]);
    });

    expect(mockDeleteExperience).toHaveBeenCalledWith('1');
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Experiencia Eliminada',
      'Se ha eliminado "Software Developer" correctamente'
    );
  });

  it('should handle retry functionality', async () => {
    mockGetExperiences
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([mockExperience]);

    const { result } = renderHook(() => useExperience());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar experiencias');
    expect(result.current.retryCount).toBe(1);

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.experiences).toEqual([mockExperience]);
    expect(result.current.error).toBe(null);
    expect(result.current.retryCount).toBe(0);
  });

  it('should stop retrying after max attempts', async () => {
    mockGetExperiences.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useExperience());

    // Simular 3 intentos fallidos
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.retryCount).toBe(1);

    await act(async () => {
      await result.current.retry();
    });
    await waitFor(() => expect(result.current.retryCount).toBe(2));

    await act(async () => {
      await result.current.retry();
    });
    await waitFor(() => expect(result.current.retryCount).toBe(3));

    // El cuarto intento no debería ejecutarse
    await act(async () => {
      await result.current.retry();
    });
    expect(result.current.retryCount).toBe(3);
    expect(mockGetExperiences).toHaveBeenCalledTimes(3);
  });
});
