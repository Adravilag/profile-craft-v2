import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de la instancia API ANTES de importar el módulo api
vi.mock('./http', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
      request: {
        use: vi.fn(),
      },
    },
  },
}));

// Mock del módulo de seguridad de dominio
vi.mock('../utils/domainSecurity', () => ({
  validateRequest: vi.fn(),
  isProductionDomain: vi.fn(),
}));

// Mock del logger seguro
vi.mock('../utils/secureLogging', () => ({
  createSecureLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// Mock de debugConfig
vi.mock('../utils/debugConfig', () => ({
  debugLog: {
    api: vi.fn(),
  },
}));

// Mock de userId services
vi.mock('@/features/users/services/userId', () => ({
  getDynamicUserId: vi.fn().mockResolvedValue('test-user-id'),
}));

vi.mock('@/features/users/utils/userConfig', () => ({
  getUserId: vi.fn().mockReturnValue('test-user-id'),
}));

import { authLogin, authRegister, getAuthenticatedUserProfile, updateProfile } from './api';
import { validateRequest, isProductionDomain } from '../utils/domainSecurity';

describe('API Domain Security Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('en dominio de producción', () => {
    beforeEach(() => {
      (isProductionDomain as any).mockReturnValue(true);
    });

    it('debe permitir authLogin cuando el dominio es válido', async () => {
      (validateRequest as any).mockReturnValue(true);
      const { API } = await import('./http');
      (API.post as any).mockResolvedValue({ data: { token: 'valid_token', user: { id: 1 } } });

      const credentials = { email: 'test@example.com', password: 'password123' };

      await expect(authLogin(credentials)).resolves.toBeDefined();
      expect(validateRequest).toHaveBeenCalled();
    });

    it('debe rechazar authLogin cuando el dominio es inválido', async () => {
      (validateRequest as any).mockReturnValue(false);

      const credentials = { email: 'test@example.com', password: 'password123' };

      await expect(authLogin(credentials)).rejects.toThrow(
        '🚫 Acceso no autorizado: Autenticación solo permitida desde el dominio oficial'
      );
    });

    it('debe rechazar authRegister cuando el dominio es inválido', async () => {
      (validateRequest as any).mockReturnValue(false);

      const userData = { name: 'Test', email: 'test@example.com', password: 'password123' };

      await expect(authRegister(userData)).rejects.toThrow(
        '🚫 Acceso no autorizado: Registro solo permitido desde el dominio oficial'
      );
    });

    it('debe rechazar getAuthenticatedUserProfile cuando el dominio es inválido', async () => {
      (validateRequest as any).mockReturnValue(false);

      await expect(getAuthenticatedUserProfile()).rejects.toThrow(
        '🚫 Acceso no autorizado desde este dominio'
      );
    });

    it('debe rechazar updateProfile cuando el dominio es inválido', async () => {
      (validateRequest as any).mockReturnValue(false);

      const profileData = { name: 'Test User', email: 'test@example.com' };

      expect(() => updateProfile(profileData)).toThrow(
        '🚫 Acceso no autorizado desde este dominio'
      );
    });
  });

  describe('en dominio de desarrollo', () => {
    beforeEach(() => {
      (isProductionDomain as any).mockReturnValue(false);
    });

    it('debe permitir todas las operaciones sin validación de dominio', async () => {
      const { API } = await import('./http');
      (API.post as any).mockResolvedValue({ data: { token: 'dev_token', user: { id: 1 } } });
      (API.get as any).mockResolvedValue({ data: { id: 1, name: 'Test User' } });
      (API.put as any).mockResolvedValue({ data: { id: 1, name: 'Updated User' } });

      // No debe llamar validateRequest en desarrollo
      const credentials = { email: 'test@example.com', password: 'password123' };
      await expect(authLogin(credentials)).resolves.toBeDefined();
      expect(validateRequest).not.toHaveBeenCalled();

      const userData = { name: 'Test', email: 'test@example.com', password: 'password123' };
      await expect(authRegister(userData)).resolves.toBeDefined();

      await expect(getAuthenticatedUserProfile()).resolves.toBeDefined();

      const profileData = { name: 'Test User', email: 'test@example.com' };
      expect(() => updateProfile(profileData)).not.toThrow();
    });
  });
});
