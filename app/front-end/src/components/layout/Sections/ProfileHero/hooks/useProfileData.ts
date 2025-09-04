import { useState, useEffect, useCallback } from 'react';
import { profile as endpointsProfile } from '@/services/endpoints';
import { getProfilePattern } from '@/services/api';
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

  // Fetch del patrón de autenticación si no está disponible
  useEffect(() => {
    if (!userProfile) return;

    const currentPattern = (userProfile as any).pattern;
    if (currentPattern !== undefined && currentPattern !== null) return;

    let mounted = true;

    (async () => {
      try {
        const candidateId = (userProfile as any)._id ?? (userProfile as any).id;
        const isObjectId = typeof candidateId === 'string' && /^[0-9a-fA-F]{24}$/.test(candidateId);
        const uidToUse = isObjectId ? candidateId : undefined;

        debugLog.api(
          '🔄 Fetching pattern for user id (ProfileHero), candidate:',
          candidateId,
          'using:',
          uidToUse ?? '(dynamic)'
        );

        const resp = await getProfilePattern(uidToUse);
        debugLog.api('✅ pattern response:', resp);

        if (!mounted) return;

        if (resp && (resp.pattern ?? null) !== null) {
          setUserProfile(prev => (prev ? { ...prev, pattern: resp.pattern } : prev));
        }
      } catch (err) {
        debugLog.warn('No pattern available for user or failed to fetch pattern', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userProfile]);

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
