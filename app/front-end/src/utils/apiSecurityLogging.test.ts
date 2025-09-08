import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSecureLogger } from './secureLogging';

describe('API Security Logging Integration', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('no debe loggear tokens JWT en respuestas de autenticación', () => {
    const logger = createSecureLogger('AUTH');

    const mockAuthResponse = {
      user: { id: '123', email: 'user@example.com', name: 'John' },
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      refreshToken: 'refresh_abc123',
    };

    logger.info('Respuesta de login:', mockAuthResponse);

    // Verificar que se llamó console.log
    expect(consoleSpy).toHaveBeenCalled();

    // Obtener los argumentos del último log
    const logArgs = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    const loggedData = logArgs[2] as any; // El tercer argumento contiene los datos

    // Verificar que los tokens están censurados
    expect(loggedData.token).toBe('[JWT_TOKEN_REDACTED]');
    expect(loggedData.refreshToken).toBe('[REDACTED]');

    // Verificar que el email está parcialmente censurado
    expect(loggedData.user.email).toBe('u***@example.com');

    // Verificar que otros datos siguen disponibles
    expect(loggedData.user.name).toBe('John');
    expect(loggedData.user.id).toBe('123');
  });

  it('no debe loggear passwords en peticiones de registro', () => {
    const logger = createSecureLogger('AUTH');

    const mockRegisterData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'super_secret_password_123',
      confirmPassword: 'super_secret_password_123',
    };

    logger.info('Datos de registro:', mockRegisterData);

    const logArgs = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    const loggedData = logArgs[2] as any;

    // Verificar que las contraseñas están censuradas
    expect(loggedData.password).toBe('[REDACTED]');
    expect(loggedData.confirmPassword).toBe('[REDACTED]');

    // Verificar que el email está parcialmente censurado
    expect(loggedData.email).toBe('j***@example.com');

    // Verificar que el nombre sigue disponible
    expect(loggedData.name).toBe('John Doe');
  });

  it('no debe loggear respuestas completas con datos del perfil', () => {
    const logger = createSecureLogger('API');

    const mockProfileResponse = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      about_me: 'Información personal privada',
      role_title: 'Developer',
      social_links: {
        linkedin: 'https://linkedin.com/in/johndoe',
      },
    };

    logger.info('Perfil del usuario:', mockProfileResponse);

    const logArgs = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    const loggedData = logArgs[2] as any;

    // Verificar que el email está censurado
    expect(loggedData.email).toBe('j***@example.com');

    // Verificar que otros datos siguen disponibles
    expect(loggedData.name).toBe('John Doe');
    expect(loggedData.role_title).toBe('Developer');
    expect(loggedData.about_me).toBe('Información personal privada');
  });

  it('debe loggear errores sin exponer información sensible', () => {
    const logger = createSecureLogger('API');

    const mockError = {
      status: 401,
      statusText: 'Unauthorized',
      message: 'Token expired',
      config: {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token.signature',
        },
      },
      response: {
        data: {
          error: 'Invalid token',
          user_email: 'user@example.com',
        },
      },
    };

    logger.error('Error de autenticación:', mockError);

    // Verificar que se llamó console.error (los errores siempre se muestran)
    expect(consoleErrorSpy).toHaveBeenCalled();

    const errorArgs = consoleErrorSpy.mock.calls[consoleErrorSpy.mock.calls.length - 1];
    const loggedError = errorArgs[2] as any;

    // Verificar que la autorización está censurada
    expect(loggedError.config.headers.Authorization).toBe('[REDACTED]');

    // Verificar que el email en la respuesta está censurado
    expect(loggedError.response.data.user_email).toBe('u***@example.com');

    // Verificar que información de error útil sigue disponible
    expect(loggedError.status).toBe(401);
    expect(loggedError.statusText).toBe('Unauthorized');
    expect(loggedError.message).toBe('Token expired');
  });

  it('debe prevenir logs en producción excepto errores', () => {
    // Simular entorno de producción
    const originalProd = import.meta.env.PROD;
    (import.meta.env as any).PROD = true;

    const logger = createSecureLogger('API');

    logger.info('Este log no debería aparecer en producción');
    logger.warn('Este warning no debería aparecer en producción');
    logger.error('Este error sí debería aparecer en producción');

    // Solo el error debería aparecer
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    // Restaurar valor original
    (import.meta.env as any).PROD = originalProd;
  });
});
