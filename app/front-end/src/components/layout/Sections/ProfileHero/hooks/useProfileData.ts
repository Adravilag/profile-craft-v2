import { useState, useEffect } from 'react';
import { profile as endpointsProfile } from '@/services/endpoints';
import { getProfilePattern } from '@/services/api';
import type { UserProfile } from '@/types/api';
import { debugLog } from '@/utils/debugConfig';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (isFirstTime) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfile();
      setUserProfile(data);
    } catch (err) {
      debugLog.error('Failed to fetch user profile:', err);
      setError('Could not load the profile.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inicial del perfil
  useEffect(() => {
    fetchProfile();
  }, [isFirstTime]);

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

  const refetchProfile = async () => {
    await fetchProfile();
  };

  return {
    userProfile,
    loading,
    error,
    refetchProfile,
  };
}
