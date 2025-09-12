import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProfileData } from './useProfileData';

// Mock de los servicios API
vi.mock('@/services/endpoints', () => ({
  profile: {
    getUserProfile: vi.fn(),
  },
}));

// Mock del contexto de loading
vi.mock('@/contexts/SectionsLoadingContext', () => ({
  useSectionsLoadingContext: vi.fn(() => ({
    isLoading: vi.fn(() => false),
    setLoading: vi.fn(),
  })),
}));

// Mock de debugLog
vi.mock('@/utils/debugConfig', () => ({
  debugLog: {
    error: vi.fn(),
    api: vi.fn(),
    warn: vi.fn(),
  },
}));

import { profile as endpointsProfile } from '@/services/endpoints';

describe('useProfileData - Endpoint Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar el perfil correctamente sin llamadas adicionales', async () => {
    // Mock del perfil completo
    const mockProfile = {
      id: '68c3fb8a51694161d560442b',
      name: 'Test User',
      email: 'test@example.com',
      role_title: 'Developer',
      about_me: 'Test description',
    };

    (endpointsProfile.getUserProfile as any).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useProfileData(false));

    await waitFor(() => {
      expect(result.current.userProfile).toBeTruthy();
    });

    // Verificar que el perfil se cargó correctamente
    expect(result.current.userProfile?.name).toBe('Test User');
    expect(result.current.userProfile?.email).toBe('test@example.com');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Verificar que se llamó a getUserProfile (puede ser más de una vez por re-renders)
    expect(endpointsProfile.getUserProfile).toHaveBeenCalled();
  });

  it('debe manejar errores de carga del perfil', async () => {
    const mockError = new Error('Network error');
    (endpointsProfile.getUserProfile as any).mockRejectedValue(mockError);

    const { result } = renderHook(() => useProfileData(false));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.userProfile).toBe(null);
    expect(result.current.error).toBe('Could not load the profile.');
    expect(result.current.loading).toBe(false);
  });

  it('debe permitir refetch del perfil', async () => {
    const mockProfile = {
      id: '68c3fb8a51694161d560442b',
      name: 'Test User',
      email: 'test@example.com',
    };

    (endpointsProfile.getUserProfile as any).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useProfileData(false));

    await waitFor(() => {
      expect(result.current.userProfile).toBeTruthy();
    });

    // Limpiar el spy para contar solo el refetch
    vi.clearAllMocks();

    // Llamar refetch
    await result.current.refetchProfile();

    // Verificar que se llamó getUserProfile para el refetch
    expect(endpointsProfile.getUserProfile).toHaveBeenCalledTimes(1);
  });

  it('no debe cargar perfil cuando isFirstTime es true', async () => {
    const { result } = renderHook(() => useProfileData(true));

    // Esperar un poco para asegurarse de que no se dispara ninguna llamada
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.userProfile).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // No debe haber llamado a getUserProfile
    expect(endpointsProfile.getUserProfile).not.toHaveBeenCalled();
  });
});
