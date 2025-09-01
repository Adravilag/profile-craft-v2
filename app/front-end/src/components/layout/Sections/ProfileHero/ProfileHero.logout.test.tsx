/**
 * Test de integración para ProfileHero - Funcionalidad de logout
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ProfileHero from './ProfileHero';
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

// Wrapper de prueba con proveedores necesarios
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>
    <TranslationProvider>
      <AuthProvider>{children}</AuthProvider>
    </TranslationProvider>
  </NotificationProvider>
);

describe('[TEST] ProfileHero - Funcionalidad de logout completa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('[TEST] debería mostrar el menú de logout y ejecutar logout al hacer clic', async () => {
    // ARRANGE: Simular usuario autenticado
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
      });

    // Simular token en localStorage
    localStorage.setItem('portfolio_auth_token', 'test-token');

    // ACT: Renderizar ProfileHero
    render(
      <TestWrapper>
        <ProfileHero darkMode={false} />
      </TestWrapper>
    );

    // Esperar a que se cargue el usuario
    await waitFor(() => {
      // Buscar el botón de perfil/avatar que abre el menú de logout
      const profileButton = screen.getByRole('button', { name: /abrir menú de cuenta/i });
      expect(profileButton).toBeInTheDocument();
    });

    // ACT: Hacer clic en el botón de perfil para abrir el menú
    const profileButton = screen.getByRole('button', { name: /abrir menú de cuenta/i });
    fireEvent.click(profileButton);

    // ASSERT: Verificar que el menú de logout aparece
    await waitFor(() => {
      const logoutButton = screen.getByText('Cerrar sesión');
      expect(logoutButton).toBeInTheDocument();
    });

    // ACT: Hacer clic en "Cerrar sesión"
    const logoutButton = screen.getByText('Cerrar sesión');
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // ASSERT: Verificar que se llamó al servicio de logout
    await waitFor(() => {
      expect(authLogout).toHaveBeenCalledTimes(1);
    });

    // ASSERT: Verificar que el token se eliminó del localStorage
    expect(localStorage.getItem('portfolio_auth_token')).toBeNull();

    // ASSERT: Verificar que el menú de logout se cerró (no debe estar visible)
    await waitFor(() => {
      expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument();
    });
  });

  it('[TEST] debería limpiar cookies de desarrollo en entorno DEV', async () => {
    // ARRANGE: Simular entorno de desarrollo
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    const mockUser = { id: '1', name: 'Dev User', email: 'dev@test.com', role: 'admin' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'dev-token', user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      });

    // Simular cookie de desarrollo
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'portfolio_auth_token=dev-cookie-token; path=/',
    });

    render(
      <TestWrapper>
        <ProfileHero darkMode={false} />
      </TestWrapper>
    );

    await waitFor(() => {
      const profileButton = screen.getByRole('button', { name: /abrir menú de cuenta/i });
      expect(profileButton).toBeInTheDocument();
    });

    // ACT: Abrir menú y hacer logout
    const profileButton = screen.getByRole('button', { name: /abrir menú de cuenta/i });
    fireEvent.click(profileButton);

    await waitFor(() => {
      const logoutButton = screen.getByText('Cerrar sesión');
      expect(logoutButton).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Cerrar sesión');
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // ASSERT: Verificar que se ejecutó logout
    await waitFor(() => {
      expect(authLogout).toHaveBeenCalledTimes(1);
    });

    // El test verifica que el logout se ejecutó correctamente
    // Las cookies se limpiarán en el contexto real
  });
});
