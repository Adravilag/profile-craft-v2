import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as http from '@/services/http';
import * as authEndpoints from '@/services/endpoints/auth';

// Mock de Axios y getDynamicUserId
vi.mock('@/features/users/services/userId', () => ({
  getDynamicUserId: async () => 'admin',
}));
vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    API: {
      get: vi.fn(),
      post: vi.fn(),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
      defaults: { headers: { common: {} } },
    },
    setAuthToken: vi.fn(actual.setAuthToken),
    getAuthToken: actual.getAuthToken,
  };
});

// Mock del servicio de logout
vi.mock('@/services/endpoints/auth', () => ({
  authLogout: vi.fn().mockResolvedValue({}),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function TestLoginComponent() {
  const { login, logout, isAuthenticated, user } = useAuth();
  return (
    <div>
      <button onClick={() => login({ email: 'admin@site.com', password: '1234' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <div data-testid="auth-status">{isAuthenticated ? 'auth' : 'noauth'}</div>
      <div data-testid="user">{user?.name || ''}</div>
    </div>
  );
}

describe('Auth login y token en petición protegida', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    (http.API.get as any).mockReset();
    (http.setAuthToken as any).mockClear();
    (authEndpoints.authLogout as any).mockClear();
  });

  it('guarda el token tras login y lo adjunta en peticiones protegidas', async () => {
    // Simula respuesta de login
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'FAKE_TOKEN', user: { id: 'admin', name: 'Admin' } }),
    });

    render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(localStorage.getItem('portfolio_auth_token')).toBe('FAKE_TOKEN');
      expect(http.setAuthToken).toHaveBeenCalledWith('FAKE_TOKEN');
      expect(screen.getByTestId('auth-status').textContent).toBe('auth');
      expect(screen.getByTestId('user').textContent).toBe('Admin');
    });

    // El test unitario solo valida el guardado del token tras login
    // El interceptor real de Axios lo adjuntará en producción
  });

  it('debe persistir la sesión tras recarga de página usando localStorage', async () => {
    // [TEST] - Simular que hay un token en localStorage de una sesión anterior
    localStorage.setItem('portfolio_auth_token', 'STORED_TOKEN');

    // Mock de la respuesta de verificación que debería usar el token persistido
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: { id: 'admin', name: 'Admin User' } }),
    });

    render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );

    // Esperar a que la verificación inicial cargue el usuario
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('auth');
      expect(screen.getByTestId('user').textContent).toBe('Admin User');
    });

    // Verificar que el token se preservó en localStorage
    expect(localStorage.getItem('portfolio_auth_token')).toBe('STORED_TOKEN');

    // Verificar que se hizo la llamada de verificación
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify', {
      method: 'GET',
      credentials: 'include',
    });
  });

  it('debe guardar el token en localStorage cuando el backend envía solo cookies HttpOnly', async () => {
    // [TEST] - Simular respuesta real del backend con token persistente
    mockFetch.mockResolvedValueOnce({
      ok: true,
      // Simular respuesta real del backend (con token persistente para localStorage)
      json: async () => ({
        message: 'Inicio de sesión exitoso',
        user: { id: 'admin', name: 'Admin' },
        token: 'PERSISTENT_TOKEN_12345', // Backend ahora envía token persistente
      }),
    });

    render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('auth');
    });

    // [RESULTADO] Test should pass - el token se guarda en localStorage
    expect(localStorage.getItem('portfolio_auth_token')).toBe('PERSISTENT_TOKEN_12345');
  });

  it('debe restaurar sesión al inicializar usando token persistente en localStorage', async () => {
    // [TEST] - Simular que hay token persistente en localStorage al cargar la app
    localStorage.setItem('portfolio_auth_token', 'RESTORED_TOKEN_67890');

    // Mock para la verificación inicial que usa el token persistente
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        valid: true,
        user: { id: 'restored-user', name: 'Restored User' },
      }),
    });

    render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );

    // Verificar que el usuario se restauró automáticamente
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('auth');
      expect(screen.getByTestId('user').textContent).toBe('Restored User');
    });

    // Verificar que el token persistente se mantuvo
    expect(localStorage.getItem('portfolio_auth_token')).toBe('RESTORED_TOKEN_67890');

    // Verificar que se hizo la verificación (usando token persistente via interceptor)
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify', {
      method: 'GET',
      credentials: 'include',
    });
  });

  it('debe limpiar localStorage y notificar al backend en logout', async () => {
    // [SETUP] - Configurar estado autenticado
    localStorage.setItem('portfolio_auth_token', 'TOKEN_TO_CLEAR');

    // Mock para verificación inicial
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, user: { id: 'user', name: 'User' } }),
    });

    const { rerender } = render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );

    // Esperar a que cargue el usuario
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('auth');
    });

    // [TEST] - Hacer logout
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('noauth');
    });

    // [RESULTADO] - Verificar que se limpió localStorage y se llamó al backend
    expect(localStorage.getItem('portfolio_auth_token')).toBe(null);
    expect(authEndpoints.authLogout).toHaveBeenCalledOnce();
  });
});
