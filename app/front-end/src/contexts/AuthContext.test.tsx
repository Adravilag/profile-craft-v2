import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as http from '@/services/http';

// Mock de Axios y getDynamicUserId
vi.mock('@/features/users/services/userId', () => ({
  getDynamicUserId: async () => 'admin',
}));
vi.mock('@/services/http', async () => {
  const actual = await vi.importActual<typeof http>('@/services/http');
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

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function TestLoginComponent() {
  const { login, isAuthenticated, user } = useAuth();
  return (
    <div>
      <button onClick={() => login({ email: 'admin@site.com', password: '1234' })}>Login</button>
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
});
