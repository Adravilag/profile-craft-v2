import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isAllowedOrigin, createSecureApiClient, validateRequest } from './domainSecurity';

describe('domainSecurity', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  describe('isAllowedOrigin', () => {
    it('debe permitir el dominio oficial de producción', () => {
      expect(isAllowedOrigin('https://adavilag-portfolio.vercel.app')).toBe(true);
    });

    it('debe permitir localhost en desarrollo', () => {
      // Mock development environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
      expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
      expect(isAllowedOrigin('http://127.0.0.1:3000')).toBe(true);

      (import.meta.env as any).DEV = originalEnv;
    });

    it('debe rechazar dominios no autorizados', () => {
      expect(isAllowedOrigin('https://malicious-site.com')).toBe(false);
      expect(isAllowedOrigin('https://fake-portfolio.vercel.app')).toBe(false);
      expect(isAllowedOrigin('http://evil.com')).toBe(false);
    });

    it('debe rechazar subdominios no autorizados del dominio oficial', () => {
      expect(isAllowedOrigin('https://fake.adavilag-portfolio.vercel.app')).toBe(false);
      expect(isAllowedOrigin('https://adavilag-portfolio.vercel.app.evil.com')).toBe(false);
    });

    it('debe manejar URLs mal formadas', () => {
      expect(isAllowedOrigin('not-a-url')).toBe(false);
      expect(isAllowedOrigin('')).toBe(false);
      expect(isAllowedOrigin(null as any)).toBe(false);
      expect(isAllowedOrigin(undefined as any)).toBe(false);
    });
  });

  describe('validateRequest', () => {
    it('debe validar el origen actual en producción', () => {
      // Mock window.location
      const mockLocation = {
        origin: 'https://adavilag-portfolio.vercel.app',
        hostname: 'adavilag-portfolio.vercel.app',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const originalEnv = import.meta.env.PROD;
      (import.meta.env as any).PROD = true;

      expect(validateRequest()).toBe(true);

      (import.meta.env as any).PROD = originalEnv;
    });

    it('debe rechazar origen no autorizado en producción', () => {
      // Mock window.location with unauthorized origin
      const mockLocation = {
        origin: 'https://malicious-site.com',
        hostname: 'malicious-site.com',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const originalEnv = import.meta.env.PROD;
      (import.meta.env as any).PROD = true;

      expect(validateRequest()).toBe(false);

      (import.meta.env as any).PROD = originalEnv;
    });

    it('debe permitir cualquier origen en desarrollo', () => {
      const mockLocation = {
        origin: 'http://localhost:3000',
        hostname: 'localhost',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      expect(validateRequest()).toBe(true);

      (import.meta.env as any).DEV = originalEnv;
    });
  });

  describe('createSecureApiClient', () => {
    it('debe crear instancia de axios con interceptor de seguridad', () => {
      const client = createSecureApiClient();

      expect(client).toBeDefined();
      expect(client.interceptors).toBeDefined();
      expect(client.interceptors.request).toBeDefined();
    });

    it('debe rechazar peticiones desde origen no autorizado', async () => {
      // Mock unauthorized origin
      const mockLocation = {
        origin: 'https://malicious-site.com',
        hostname: 'malicious-site.com',
      };

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const originalEnv = import.meta.env.PROD;
      (import.meta.env as any).PROD = true;

      const client = createSecureApiClient();

      try {
        await client.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('no autorizado');
      }

      (import.meta.env as any).PROD = originalEnv;
    });
  });
});
