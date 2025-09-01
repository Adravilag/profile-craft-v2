// src/hooks/useAuthGuard.ts
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';

interface UseAuthGuardOptions {
  redirectTo?: string;
  redirectDelay?: number;
  requireAuth?: boolean;
}

interface AuthGuardState {
  isLoading: boolean;
  isAuthenticated: boolean;
  shouldRender: boolean;
  error: string | null;
}

const useAuthGuard = (options: UseAuthGuardOptions = {}): AuthGuardState => {
  const { redirectTo = '/', redirectDelay = 100, requireAuth = true } = options;

  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  const [authState, setAuthState] = useState<AuthGuardState>({
    isLoading: true,
    isAuthenticated: false,
    shouldRender: false,
    error: null,
  });
  useEffect(() => {
    console.log('🛡️ useAuthGuard: Auth state changed -', {
      loading,
      isAuthenticated,
      user: user ? user.name : null,
      requireAuth,
    });

    // Si aún está cargando, mantener estado de loading
    if (loading) {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        shouldRender: false,
      }));
      return;
    }

    // Una vez terminado el loading, evaluar la autenticación
    if (requireAuth && !isAuthenticated) {
      console.log('🚫 useAuthGuard: Auth required but user not authenticated, redirecting...');

      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        shouldRender: false,
        error: 'Acceso no autorizado',
      });

      // Redirigir con delay para evitar redirecciones inmediatas
      const redirectTimer = setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, redirectDelay);

      return () => clearTimeout(redirectTimer);
    }

    // Usuario autenticado o no se requiere autenticación
    console.log('✅ useAuthGuard: Auth check passed, allowing render');
    setAuthState({
      isLoading: false,
      isAuthenticated,
      shouldRender: true,
      error: null,
    });
  }, [loading, isAuthenticated, user, requireAuth, navigate, redirectTo, redirectDelay]);

  return authState;
};

export default useAuthGuard;
