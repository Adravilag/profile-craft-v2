// src/contexts/AuthContext.incognito.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock del servicio de logout
vi.mock('@/services/endpoints/auth', () => ({
  authLogout: vi.fn(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const TestComponent = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-data">{user ? JSON.stringify(user) : 'no-user'}</div>
    </div>
  );
};

describe('[TEST] AuthContext - Comportamiento en ventana de incógnito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear(); // Importante para simular sesión limpia de incógnito
    // Mock para BroadcastChannel
    global.BroadcastChannel = vi.fn(() => ({
      postMessage: vi.fn(),
      close: vi.fn(),
      onmessage: null,
    })) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('[TEST] NO debería auto-loguear en desarrollo en ventana de incógnito', async () => {
    // ARRANGE: Simular entorno de desarrollo
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    // Simular comportamiento de ventana de incógnito:
    // localStorage está limpio (nueva sesión)
    expect(localStorage.getItem('explicit_logout')).toBeNull();

    // Mock del navigator.storage.estimate para simular cuota limitada de incógnito
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: vi.fn().mockResolvedValue({
          quota: 120 * 1024 * 1024, // 120MB - típico de modo incógnito
          usage: 0,
        }),
      },
      writable: true,
    });

    // Mock: El endpoint verify falla porque no hay sesión previa
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    // ACT: Renderizar AuthProvider en contexto de incógnito
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // ASSERT: En una ventana de incógnito, NO debería auto-loguear automáticamente
    // aún en desarrollo, porque debe respetar la naturaleza de la sesión privada
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    // [TEST] NO debería llamar al endpoint dev-token en incógnito
    expect(mockFetch).not.toHaveBeenCalledWith('/api/auth/dev-token');
    expect(screen.getByTestId('user-data')).toHaveTextContent('no-user');
  });

  it('[TEST] Debería detectar si está en modo incógnito por características específicas', async () => {
    // ARRANGE: Simular características de ventana de incógnito
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    // Simular indicadores de modo incógnito:
    // 1. localStorage limpio
    // 2. Falta de cookies persistentes
    // 3. sessionStorage disponible pero localStorage "restringido"

    // Mock del navigator.storage.estimate para simular cuota limitada
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: vi.fn().mockResolvedValue({
          quota: 100 * 1024 * 1024, // 100MB - claramente modo incógnito
          usage: 0,
        }),
      },
      writable: true,
    });

    // Mock para simular fallo de verify (sin cookies previas)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    // Verificar que no se intentó auto-login
    expect(mockFetch).toHaveBeenCalledTimes(1); // Solo verify
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify', {
      method: 'GET',
      credentials: 'include',
    });
  });

  it('[TEST] SÍ debería permitir login manual en ventana de incógnito', async () => {
    // ARRANGE: Ventana de incógnito donde el usuario quiere loguearse manualmente
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    const mockUser = { id: '1', name: 'Manual User', email: 'manual@test.com', role: 'admin' };

    // Mock inicial para verify (falla, como esperado en incógnito)
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
      // Mock para login manual exitoso
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      });

    const TestComponentWithLogin = () => {
      const { isAuthenticated, user, login } = useAuth();

      const handleLogin = async () => {
        try {
          await login({ email: 'test@test.com', password: 'password' });
        } catch (e) {
          // ignore for test
        }
      };

      return (
        <div>
          <div data-testid="auth-status">
            {isAuthenticated ? 'authenticated' : 'not-authenticated'}
          </div>
          <div data-testid="user-data">{user ? JSON.stringify(user) : 'no-user'}</div>
          <button data-testid="login-button" onClick={handleLogin}>
            Login
          </button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponentWithLogin />
      </AuthProvider>
    );

    // Inicialmente no autenticado
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    // ACT: Login manual
    const loginButton = screen.getByTestId('login-button');
    loginButton.click();

    // ASSERT: Debería permitir login manual incluso en incógnito
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user-data')).toHaveTextContent('Manual User');
  });

  it('[TEST] SÍ debería auto-loguear en desarrollo cuando NO está en incógnito', async () => {
    // ARRANGE: Simular entorno de desarrollo normal (NO incógnito)
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    // Mock del navigator.storage.estimate para simular cuota normal (NO incógnito)
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: vi.fn().mockResolvedValue({
          quota: 2 * 1024 * 1024 * 1024, // 2GB - típico de modo normal
          usage: 0,
        }),
      },
      writable: true,
    });

    // Simular que NO estamos en incógnito agregando algo al sessionStorage
    sessionStorage.setItem('theme', 'light'); // Datos de sesión típicos de navegador normal

    const mockUser = { id: '1', name: 'Dev User', email: 'dev@test.com', role: 'admin' };

    // Mock para dev-token (auto-login exitoso)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'dev-token', user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // ASSERT: En modo normal de desarrollo, SÍ debería auto-loguear
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Verificar que SÍ llamó al endpoint dev-token
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/dev-token');
    expect(screen.getByTestId('user-data')).toHaveTextContent('Dev User');
  });
});
