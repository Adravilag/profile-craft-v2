import { useState, useCallback } from 'react';

interface UseAuthStateReturn {
  showPatternAuth: boolean;
  patternError: string;
  setShowPatternAuth: (show: boolean) => void;
  setPatternError: (error: string) => void;
  resetAuthState: () => void;
  handleAuthSuccess: () => void;
  handleAuthError: (error: string) => void;
}

/**
 * Hook para gestionar el estado de autenticación del ProfileHero
 * Controla la visualización del patrón de autenticación y errores
 */
export function useAuthState(): UseAuthStateReturn {
  const [showPatternAuth, setShowPatternAuth] = useState(false);
  const [patternError, setPatternError] = useState('');

  const resetAuthState = useCallback(() => {
    setShowPatternAuth(false);
    setPatternError('');
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setShowPatternAuth(false);
    setPatternError('');
  }, []);

  const handleAuthError = useCallback((error: string) => {
    setPatternError(error);
    // No cerrar el modal automáticamente para que el usuario pueda intentar de nuevo
  }, []);

  return {
    showPatternAuth,
    patternError,
    setShowPatternAuth,
    setPatternError,
    resetAuthState,
    handleAuthSuccess,
    handleAuthError,
  };
}
