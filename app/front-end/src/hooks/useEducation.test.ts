import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { Education } from '@/types/api';

// Mock de las notificaciones
vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

// Mock de los endpoints de educación
vi.mock('@/services/endpoints', () => ({
  education: {
    getEducation: vi.fn(),
    createEducation: vi.fn(),
    updateEducation: vi.fn(),
    deleteEducation: vi.fn(),
  },
}));

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

describe('useEducation', () => {
  let mockGetEducation: any;
  let mockCreateEducation: any;
  let mockUpdateEducation: any;
  let mockDeleteEducation: any;
  let mockShowSuccess: any;
  let mockShowError: any;
  let useEducation: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Obtener los mocks
    const { education } = await import('@/services/endpoints');
    const { useNotificationContext } = await import('@/hooks/useNotification');

    mockGetEducation = education.getEducation;
    mockCreateEducation = education.createEducation;
    mockUpdateEducation = education.updateEducation;
    mockDeleteEducation = education.deleteEducation;

    const notifications = useNotificationContext();
    mockShowSuccess = notifications.showSuccess;
    mockShowError = notifications.showError;

    // Import del hook
    const hookModule = await import('./useEducation');
    useEducation = hookModule.useEducation;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load education on mount', async () => {
    mockGetEducation.mockResolvedValueOnce([mockEducation]);

    const { result } = renderHook(() => useEducation());

    expect(result.current.loading).toBe(true);
    expect(result.current.education).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.education).toEqual([mockEducation]);
    expect(result.current.error).toBe(null);
    expect(mockGetEducation).toHaveBeenCalledTimes(1);
  });

  it('should handle loading errors', async () => {
    const errorMessage = 'Failed to load education';
    mockGetEducation.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useEducation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar educación');
    expect(result.current.education).toEqual([]);
  });

  it('should create new education', async () => {
    const newEducationData = {
      title: 'Master Degree',
      institution: 'New University',
      start_date: '2024-01-01',
      end_date: '2026-01-01',
      description: 'Master description',
      grade: '8.5',
      order_index: 2,
      user_id: 1,
    };

    const createdEducation = { ...newEducationData, _id: '2' };

    mockGetEducation.mockResolvedValueOnce([mockEducation]);
    mockCreateEducation.mockResolvedValueOnce(createdEducation);

    const { result } = renderHook(() => useEducation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.create(newEducationData);

    expect(mockCreateEducation).toHaveBeenCalledWith(newEducationData);
    expect(result.current.education).toContainEqual(createdEducation);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Nueva Formación Académica Creada',
      'Se ha creado "Master Degree" correctamente'
    );
  });

  it('should update existing education', async () => {
    const updatedData = {
      title: 'Updated Degree',
      institution: 'Updated University',
      start_date: '2020-01-01',
      end_date: '2024-01-01',
      description: 'Updated description',
      grade: '9.5',
      order_index: 1,
      user_id: 1,
    };

    const updatedEducation = { ...updatedData, _id: '1' };

    mockGetEducation.mockResolvedValueOnce([mockEducation]);
    mockUpdateEducation.mockResolvedValueOnce(updatedEducation);

    const { result } = renderHook(() => useEducation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.update(1, updatedData);

    expect(mockUpdateEducation).toHaveBeenCalledWith(1, updatedData);
    expect(result.current.education[0]).toEqual(updatedEducation);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Educación Actualizada',
      'Se ha actualizado "Updated Degree" correctamente'
    );
  });

  it('should delete education', async () => {
    mockGetEducation.mockResolvedValueOnce([mockEducation]);
    mockDeleteEducation.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useEducation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.remove('1', 'Computer Science Degree');

    expect(mockDeleteEducation).toHaveBeenCalledWith('1');
    expect(result.current.education).toEqual([]);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Formación Eliminada',
      'Se ha eliminado "Computer Science Degree" correctamente'
    );
  });

  it('should handle invalid education ID on delete', async () => {
    mockGetEducation.mockResolvedValueOnce([mockEducation]);

    const { result } = renderHook(() => useEducation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.remove('', 'Test')).rejects.toThrow('ID de educación no válido');
    expect(mockShowError).toHaveBeenCalledWith('Error', 'ID de educación no válido');
  });

  it('should refresh education data', async () => {
    const newEducationList = [mockEducation, { ...mockEducation, _id: '2', title: 'New Degree' }];

    mockGetEducation.mockResolvedValueOnce([mockEducation]).mockResolvedValueOnce(newEducationList);

    const { result } = renderHook(() => useEducation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.education).toEqual([mockEducation]);

    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.education).toEqual(newEducationList);
    });

    expect(mockGetEducation).toHaveBeenCalledTimes(2);
  });
});
