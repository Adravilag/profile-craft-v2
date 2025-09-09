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

/**
 * Detecta si el navegador está ejecutándose en modo incógnito/privado.
 *
 * En modo incógnito:
 * - localStorage puede estar vacío o con capacidad limitada
 * - No deberían existir cookies persistentes de sesiones anteriores
 * - sessionStorage funciona normalmente
 *
 * @returns Promise<boolean> true si parece estar en modo incógnito
 */
const detectIncognitoMode = async (): Promise<boolean> => {
  try {
    // Método 1: Verificar si localStorage funciona correctamente
    const testKey = '__incognito_test__';
    try {
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch {
      // En algunos navegadores, localStorage puede lanzar errores en incógnito
      return true;
    }

    // Método 2: Verificar capacidad de almacenamiento
    // En modo incógnito, algunos navegadores limitan la capacidad de localStorage
    if (typeof navigator.storage?.estimate === 'function') {
      const estimate = await navigator.storage.estimate();
      // En incógnito, la cuota suele ser mucho menor (ejemplo: 120MB vs 2GB+)
      if (estimate.quota && estimate.quota < 200 * 1024 * 1024) {
        // < 200MB
        return true;
      }
    }

    // Método 3: Verificar si hay cookies de sesiones anteriores Y sessionStorage limpio
    // En incógnito, no debería haber cookies persistentes de desarrollo
    const hasDevCookie = document.cookie.includes('portfolio_auth_token=');
    const hasExplicitLogout = localStorage.getItem('explicit_logout');
    const sessionKeys = Object.keys(sessionStorage);

    // Si NO hay cookies de desarrollo Y NO hay flag de logout explícito Y sessionStorage está completamente limpio,
    // es muy probable que estemos en incógnito (sesión completamente nueva)
    if (!hasDevCookie && !hasExplicitLogout && sessionKeys.length === 0) {
      return true;
    }

    return false;
  } catch {
    // En caso de error, asumir modo normal para no bloquear funcionalidad
    return false;
  }
};

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

        // Detectar si estamos en modo incógnito
        const isIncognito = await detectIncognitoMode();

        // En desarrollo, solo auto-loguear si:
        // 1. NO hay logout explícito
        // 2. NO estamos en modo incógnito
        if (import.meta.env.DEV && !explicitLogout && !isIncognito) {
          try {
            // Preferir endpoint dev-login que setea la cookie httpOnly desde el servidor
            try {
              const devLogin = await fetch('/api/auth/dev-login', {
                method: 'POST',
                credentials: 'include',
              });
              if (!devLogin.ok) {
                // fallback: solicitar token y setear cookie no-HttpOnly (legacy)
                const dev = await fetch('/api/auth/dev-token');
                if (dev.ok) {
                  const b = await dev.json();
                  try {
                    document.cookie = `portfolio_auth_token=${b.token}; path=/`;
                  } catch {}
                }
              }
            } catch (e) {
              // Si dev-login falla por cualquier motivo, intentar dev-token
              try {
                const dev = await fetch('/api/auth/dev-token');
                if (dev.ok) {
                  const b = await dev.json();
                  try {
                    document.cookie = `portfolio_auth_token=${b.token}; path=/`;
                  } catch {}
                }
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
          // En desarrollo, intentar leer y loggear el cuerpo para ayudar a depurar 500/403
          try {
            if (import.meta.env.DEV) {
              const text = await res.text();
              // eslint-disable-next-line no-console
              console.warn('[AuthContext] verify failed', { status: res.status, body: text });
            }
          } catch (e) {
            // ignore
          }
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

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  const login = useCallback(async (creds: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Login failed');
    }
    const data = await res.json();
    // Guardar token JWT si viene en la respuesta
    if (data.token) {
      // Importar dinámicamente para evitar ciclo
      const { setAuthToken } = await import('@/services/http');
      setAuthToken(data.token);
    }
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
