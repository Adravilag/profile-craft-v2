import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSecureLogger, sanitizeLogData } from './secureLogging';

describe('secureLogging', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('sanitizeLogData', () => {
    it('debe censurar tokens en objetos', () => {
      const data = {
        token: 'jwt_token_123',
        authToken: 'bearer_abc',
        authorization: 'Bearer xyz',
        normalData: 'visible',
      };

      const result = sanitizeLogData(data);

      expect(result.token).toBe('[REDACTED]');
      expect(result.authToken).toBe('[REDACTED]');
      expect(result.authorization).toBe('[REDACTED]');
      expect(result.normalData).toBe('visible');
    });

    it('debe censurar passwords en objetos', () => {
      const data = {
        password: 'secret123',
        currentPassword: 'old_pass',
        newPassword: 'new_pass',
        name: 'John',
      };

      const result = sanitizeLogData(data);

      expect(result.password).toBe('[REDACTED]');
      expect(result.currentPassword).toBe('[REDACTED]');
      expect(result.newPassword).toBe('[REDACTED]');
      expect(result.name).toBe('John');
    });

    it('debe censurar emails parcialmente', () => {
      const data = {
        email: 'user@example.com',
        contactEmail: 'contact@domain.org',
        username: 'testuser',
      };

      const result = sanitizeLogData(data);

      expect(result.email).toBe('u***@example.com');
      expect(result.contactEmail).toBe('c***@domain.org');
      expect(result.username).toBe('testuser');
    });

    it('debe manejar arrays con objetos sensibles', () => {
      const data = {
        users: [
          { email: 'user1@test.com', token: 'abc123' },
          { email: 'user2@test.com', password: 'secret' },
        ],
      };

      const result = sanitizeLogData(data);

      expect(result.users[0].email).toBe('u***@test.com');
      expect(result.users[0].token).toBe('[REDACTED]');
      expect(result.users[1].email).toBe('u***@test.com');
      expect(result.users[1].password).toBe('[REDACTED]');
    });

    it('debe retornar strings sin cambios si no contienen datos sensibles', () => {
      const data = 'información normal';
      const result = sanitizeLogData(data);
      expect(result).toBe('información normal');
    });

    it('debe censurar strings que parezcan tokens JWT', () => {
      const data =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const result = sanitizeLogData(data);
      expect(result).toBe('[JWT_TOKEN_REDACTED]');
    });
  });

  describe('createSecureLogger', () => {
    it('debe crear logger que sanitiza automáticamente', () => {
      const logger = createSecureLogger('test');

      logger.info('Usuario logueado:', {
        email: 'test@example.com',
        token: 'secret_token',
        name: 'John',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[test]',
        'Usuario logueado:',
        expect.objectContaining({
          email: 't***@example.com',
          token: '[REDACTED]',
          name: 'John',
        })
      );
    });

    it('debe permitir deshabilitar el logging en producción', () => {
      const originalEnv = import.meta.env.PROD;
      (import.meta.env as any).PROD = true;

      const logger = createSecureLogger('test');
      logger.info('Este mensaje no debería aparecer');

      expect(consoleSpy).not.toHaveBeenCalled();

      (import.meta.env as any).PROD = originalEnv;
    });
  });
});
