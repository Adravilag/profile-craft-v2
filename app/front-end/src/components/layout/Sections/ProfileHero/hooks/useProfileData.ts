import { useState, useEffect, useCallback } from 'react';
import { profile as endpointsProfile } from '@/services/endpoints';
import type { UserProfile } from '@/types/api';
import { debugLog } from '@/utils/debugConfig';
import { useSectionsLoadingContext } from '@/contexts/SectionsLoadingContext';

const { getUserProfile } = endpointsProfile;

interface UseProfileDataReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
}

/**
 * Hook para gestionar los datos del perfil de usuario
 * Incluye la carga del perfil y el patrón de autenticación
 */
export function useProfileData(isFirstTime: boolean = false): UseProfileDataReturn {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sistema centralizado de loading
  const { isLoading: centralLoading, setLoading } = useSectionsLoadingContext();
  const loading = centralLoading('profile');

  const fetchProfile = useCallback(async () => {
    if (isFirstTime) {
      setLoading('profile', false);
      return;
    }

    try {
      setLoading('profile', true);
      setError(null);
      const data = await getUserProfile();
      setUserProfile(data);
    } catch (err) {
      debugLog.error('Failed to fetch user profile:', err);
      setError('Could not load the profile.');
    } finally {
      setLoading('profile', false);
    }
  }, [isFirstTime, setLoading]);

  // Fetch inicial del perfil
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetchProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    userProfile,
    loading,
    error,
    refetchProfile,
  };
}
