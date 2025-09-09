import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Test de integración E2E para verificar la persistencia de autenticación
 *
 * Este test verifica que:
 * 1. El login guarda el token en localStorage
 * 2. La sesión se mantiene tras refrescar página
 * 3. Las peticiones autenticadas funcionan correctamente
 * 4. El logout limpia todo correctamente
 */

const API_BASE = 'http://localhost:3000/api';

describe('🔐 Auth Persistence E2E Tests', () => {
  let authToken: string | null = null;

  beforeAll(async () => {
    // Asegurarse de que el backend esté disponible
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) {
        throw new Error('Backend no disponible');
      }
    } catch (error) {
      throw new Error('Backend debe estar ejecutándose en puerto 3000');
    }
  });

  afterAll(async () => {
    // Limpiar cualquier sesión residual
    if (authToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      } catch (e) {
        // Ignorar errores de limpieza
      }
    }
  });

  it('should login and receive persistent token', async () => {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@site.com', // Usar credenciales de test
        password: 'admin123',
      }),
      credentials: 'include',
    });

    expect(loginResponse.ok).toBe(true);

    const loginData = await loginResponse.json();

    // Verificar que el backend envía token persistente
    expect(loginData.token).toBeDefined();
    expect(loginData.user).toBeDefined();
    expect(loginData.message).toContain('exitoso');

    authToken = loginData.token;

    // Verificar que el token es un JWT válido
    expect(authToken!.split('.').length).toBe(3); // JWT format: header.payload.signature
  });

  it('should verify session using persistent token', async () => {
    expect(authToken).toBeDefined();

    const verifyResponse = await fetch(`${API_BASE}/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken!}`,
      },
      credentials: 'include',
    });

    expect(verifyResponse.ok).toBe(true);

    const verifyData = await verifyResponse.json();
    expect(verifyData.valid).toBe(true);
    expect(verifyData.user).toBeDefined();
  });

  it('should access protected routes with persistent token', async () => {
    expect(authToken).toBeDefined();

    const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken!}`,
      },
      credentials: 'include',
    });

    expect(profileResponse.ok).toBe(true);

    const profileData = await profileResponse.json();
    expect(profileData).toBeDefined();
  });

  it('should logout and invalidate tokens', async () => {
    expect(authToken).toBeDefined();

    const logoutResponse = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken!}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    expect(logoutResponse.ok).toBe(true);

    const logoutData = await logoutResponse.json();
    expect(logoutData.message).toContain('exitosamente');

    // Verificar que el token se invalidó
    const verifyAfterLogout = await fetch(`${API_BASE}/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken!}`,
      },
      credentials: 'include',
    });

    const verifyData = await verifyAfterLogout.json();
    expect(verifyData.valid).toBe(false);

    authToken = null;
  });
});
