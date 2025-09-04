/**
 * Test para identificar el problema de auto-login en desarrollo
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock del servicio de auth
vi.mock('@/services/endpoints/auth', () => ({
  authLogout: vi.fn(),
}));

import { authLogout } from '@/services/endpoints/auth';

// Mock fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Componente de prueba
const TestComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-data">{user ? JSON.stringify(user) : 'no-user'}</div>
      <button data-testid="logout-button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

describe('[TEST] AuthContext - Problema de auto-login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear(); // Importante para simular sesión limpia

    // Mock para BroadcastChannel
    global.BroadcastChannel = vi.fn(() => ({
      postMessage: vi.fn(),
      close: vi.fn(),
      onmessage: null,
    })) as any;

    // Mock authLogout para que resuelva correctamente
    (authLogout as any).mockResolvedValue({ message: 'Logout successful' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('[TEST] NO debería auto-loguear en desarrollo si el usuario hizo logout explícito', async () => {
    // ARRANGE: Simular entorno de desarrollo
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    // Simular que el usuario hizo logout explícito
    localStorage.setItem('explicit_logout', 'true');

    // Mock: El endpoint dev-token está disponible, pero NO debería llamarse
    mockFetch.mockResolvedValueOnce({
      ok: false, // verify falla porque no hay sesión
      status: 401,
    });

    // ACT: Renderizar AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // ASSERT: NO debería auto-loguear porque hay logout explícito
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    // [TEST] No debería haber llamado al endpoint dev-token
    expect(mockFetch).not.toHaveBeenCalledWith('/api/auth/dev-token');
    expect(screen.getByTestId('user-data')).toHaveTextContent('no-user');
  });

  it('[TEST] SÍ debería auto-loguear en desarrollo si NO hay logout explícito', async () => {
    // ARRANGE: Simular entorno de desarrollo sin logout explícito
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

    // Mock: El endpoint dev-token devuelve un token (comportamiento esperado)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'auto-generated-dev-token',
            user: { id: '1', name: 'Auto Dev User', email: 'auto@dev.com', role: 'admin' },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: '1', name: 'Auto Dev User', email: 'auto@dev.com', role: 'admin' },
          }),
      });

    // ACT: Renderizar AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // ASSERT: Debería auto-loguear en desarrollo cuando no hay logout explícito
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/dev-token');
    expect(screen.getByTestId('user-data')).toHaveTextContent('Auto Dev User');
  });

  it('[TEST] debería setear flag de logout explícito al hacer logout', async () => {
    // ARRANGE: Usuario logueado en desarrollo
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com', role: 'admin' };

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

    // Esperar a que se loguee automáticamente
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // ACT: Hacer logout
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    // ASSERT: Debería setear el flag de logout explícito
    await waitFor(() => {
      expect(localStorage.getItem('explicit_logout')).toBe('true');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    expect(authLogout).toHaveBeenCalledTimes(1);
  });
});
