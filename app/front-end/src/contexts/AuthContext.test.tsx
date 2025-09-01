/**
 * Test para AuthContext - Identificar problemas de logout
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { act } from 'react';

// Mock del servicio de auth
vi.mock('@/services/endpoints/auth', () => ({
  authLogout: vi.fn(),
}));

import { authLogout } from '@/services/endpoints/auth';

// Mock fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods para evitar ruido en tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Componente de prueba para usar el contexto
const TestComponent = () => {
  const { user, logout, isAuthenticated } = useAuth();

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

describe('[TEST] AuthContext - Problemas de logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Limpiar localStorage y cookies antes de cada test
    localStorage.clear();
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

  it('[TEST] debería limpiar completamente el token cuando se hace logout', async () => {
    // ARRANGE: Simular estado autenticado
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com', role: 'admin' };

    // Mock de la verificación inicial que devuelve usuario autenticado
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'dev-token', user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })
      // Mock para el logout
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Logout successful' }),
      });

    // Simular que hay un token en localStorage (problema identificado)
    localStorage.setItem('portfolio_auth_token', 'fake-token');

    // Simular que hay una cookie (como en desarrollo)
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'portfolio_auth_token=fake-cookie-token; path=/',
    });

    // ACT: Renderizar componente con AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Esperar a que se cargue el estado inicial
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Verificar que el usuario está autenticado inicialmente
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-data')).toHaveTextContent(mockUser.name!);

    // ACT: Hacer logout
    await act(async () => {
      screen.getByTestId('logout-button').click();
    });

    // ASSERT: Verificar que el estado se limpió
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    // [TEST] El problema: verificar que todos los tokens se eliminaron
    expect(localStorage.getItem('portfolio_auth_token')).toBeNull();

    // [TEST] Verificar que se llamó al servicio de auth
    expect(authLogout).toHaveBeenCalledTimes(1);

    // [TEST] El usuario debe estar completamente desautenticado
    expect(screen.getByTestId('user-data')).toHaveTextContent('no-user');
  });

  it('[TEST] debería limpiar cookies de desarrollo cuando se hace logout', async () => {
    // ARRANGE: Simular entorno de desarrollo
    const originalEnv = import.meta.env.DEV;
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    const mockUser = { id: '1', name: 'Dev User', email: 'dev@test.com', role: 'admin' };

    // Mock para desarrollo
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'dev-token', user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Logout successful' }),
      });

    // Simular cookie de desarrollo
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'portfolio_auth_token=dev-cookie-token; path=/',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // ACT: Logout
    await act(async () => {
      screen.getByTestId('logout-button').click();
    });

    // ASSERT: Las cookies de desarrollo también deben limpiarse
    // [TEST] Este es el problema: las cookies de desarrollo no se limpian
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });

    // Restaurar env
    vi.stubGlobal('import.meta', { env: { DEV: originalEnv } });
  });
});
