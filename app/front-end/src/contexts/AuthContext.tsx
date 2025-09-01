import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authLogout } from '@/services/endpoints/auth';

// Tipo mínimo para el usuario autenticado
export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (creds: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<any> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializar sesión intentando verificar sesión existente usando cookie HttpOnly
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Verificar si el usuario hizo logout explícitamente
        const explicitLogout = localStorage.getItem('explicit_logout');

        // En desarrollo, solo auto-loguear si NO hay logout explícito
        if (import.meta.env.DEV && !explicitLogout) {
          try {
            const dev = await fetch('/api/auth/dev-token');
            if (dev.ok) {
              const b = await dev.json();
              // cookie no-httpOnly para desarrollo local
              try {
                document.cookie = `portfolio_auth_token=${b.token}; path=/`;
              } catch {}
            }
          } catch {}
        }

        const res = await fetch('/api/auth/verify', { method: 'GET', credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
          // Si hay usuario válido, limpiar flag de logout explícito
          if (data.user) {
            localStorage.removeItem('explicit_logout');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (creds: { email: string; password: string }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
      credentials: 'include', // permite que el servidor setee refresh token HttpOnly
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Login failed');
    }
    const data = await res.json();
    setUser(data.user ?? null);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Marcar logout explícito para evitar auto-login en desarrollo
      localStorage.setItem('explicit_logout', 'true');

      // Usar el servicio de API que maneja tanto el endpoint como la limpieza
      await authLogout();
    } catch (e) {
      // ignore network errors during logout
    }

    // Limpiar completamente todos los tokens almacenados (backup adicional)
    try {
      // Limpiar localStorage (por si el servicio API no lo hizo)
      localStorage.removeItem('portfolio_auth_token');

      // Limpiar cookies de desarrollo (no-httpOnly)
      if (import.meta.env.DEV) {
        document.cookie = 'portfolio_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (e) {
      // ignore errors cleaning storage
    }

    setUser(null);
    // notify other tabs
    try {
      const bc = (window as any).BroadcastChannel && new BroadcastChannel('auth');
      bc && bc.postMessage({ type: 'logout' });
    } catch {}
  }, []);

  // Listen logout from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('auth');
        bc.onmessage = ev => {
          if (ev.data?.type === 'logout') {
            setUser(null);
          }
        };
      }
      // fallback to storage event
      const onStorage = (ev: StorageEvent) => {
        if (ev.key === 'auth:logout') setUser(null);
      };
      window.addEventListener('storage', onStorage);
      return () => {
        bc && bc.close();
        window.removeEventListener('storage', onStorage);
      };
    } catch {
      // ignore
    }
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // allow usage without provider in tests but keep predictable shape
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      login: async () => {
        throw new Error('No AuthProvider');
      },
      logout: async () => {},
    };
  }
  return ctx;
};

export default { AuthProvider, useAuth };
