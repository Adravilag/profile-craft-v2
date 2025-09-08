import { useState, useEffect } from 'react';
import { profile } from '@/services/endpoints';

interface UseUserPatternReturn {
  pattern: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para cargar el patrón de autenticación de un usuario
 */
export function useUserPattern(userId: string | null): UseUserPatternReturn {
  const [pattern, setPattern] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setPattern(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchPattern = async () => {
      try {
        setLoading(true);
        setError(null);
        const patternData = await profile.getUserPattern(userId);
        setPattern(patternData);
      } catch (err) {
        setError('Failed to load pattern');
      } finally {
        setLoading(false);
      }
    };

    fetchPattern();
  }, [userId]);

  return {
    pattern,
    loading,
    error,
  };
}
