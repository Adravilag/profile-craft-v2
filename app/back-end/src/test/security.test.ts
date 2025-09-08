import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Tests para verificar y mejorar la seguridad del backend
describe('Backend Security Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(() => {
    // Setup básico de Express para testing
    app = express();
    app.use(express.json());
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('Endpoint Security', () => {
    it('should reject pattern endpoint calls in production', async () => {
      // TEST 1: El endpoint /pattern/:id debería estar deshabilitado o protegido en producción
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Este test fallará inicialmente - necesitamos implementar la seguridad
      const response = await request(app).get('/api/profile/pattern/someId').expect(404); // O 403 para indicar que está deshabilitado

      process.env.NODE_ENV = originalEnv;
    });

    it('should block requests from unauthorized origins', async () => {
      // TEST 2: Verificar que CORS bloquee orígenes no autorizados
      const response = await request(app)
        .get('/api/profile/someId')
        .set('Origin', 'https://malicious-site.com')
        .expect(403);
    });

    it('should not expose debug endpoints in production', async () => {
      // TEST 3: Endpoints de desarrollo como devToken y devLogin deben estar bloqueados
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const devTokenResponse = await request(app).get('/api/auth/dev-token').expect(404);

      const devLoginResponse = await request(app).post('/api/auth/dev-login').expect(404);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Input Validation Security', () => {
    it('should validate and sanitize request body data', async () => {
      // TEST 4: Validación de entrada para prevenir inyecciones
      const maliciousPayload = {
        email: "<script>alert('xss')</script>@test.com",
        password: 'password123',
        name: "'; DROP TABLE users; --",
      };

      // Este test verificará que tenemos validación de entrada
      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousPayload)
        .expect(400); // Debería rechazar datos maliciosos

      expect(response.body.error).toMatch(/invalid|validation/i);
    });

    it('should limit request size to prevent DoS attacks', async () => {
      // TEST 5: Límites de tamaño de request
      const largePayload = {
        email: 'test@test.com',
        password: 'x'.repeat(10000), // Password muy largo
        name: 'Test User',
      };

      const response = await request(app).post('/api/auth/register').send(largePayload).expect(413); // Payload too large
    });
  });

  describe('Rate Limiting Security', () => {
    it('should implement rate limiting for auth endpoints', async () => {
      // TEST 6: Rate limiting para prevenir ataques de fuerza bruta
      const loginAttempts = Array(6)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: 'wrongpassword' })
        );

      const responses = await Promise.all(loginAttempts);

      // Los últimos intentos deberían ser bloqueados por rate limiting
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429); // Too Many Requests
    });

    it('should implement progressive delays for failed auth attempts', async () => {
      // TEST 7: Delays progresivos para slowing down attacks
      const startTime = Date.now();

      // Múltiples intentos fallidos
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrongpassword' });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Debería tomar más tiempo debido a los delays
      expect(duration).toBeGreaterThan(1000); // Al menos 1 segundo de delay
    });
  });

  describe('JWT Security', () => {
    it('should use strong JWT secret and short expiration', async () => {
      // TEST 8: Verificar configuración segura de JWT
      expect(config.JWT_SECRET).toBeDefined();
      expect(config.JWT_SECRET.length).toBeGreaterThan(32); // Secret fuerte

      // Crear un token y verificar que expira pronto
      const token = jwt.sign({ test: true }, config.JWT_SECRET, { expiresIn: '15m' });
      const decoded = jwt.decode(token) as any;

      const expirationTime = decoded.exp * 1000;
      const now = Date.now();
      const timeUntilExpiration = expirationTime - now;

      expect(timeUntilExpiration).toBeLessThan(16 * 60 * 1000); // Menos de 16 minutos
    });

    it('should invalidate tokens on logout', async () => {
      // TEST 9: Los tokens deberían invalidarse al hacer logout
      // Este test verificará que implementemos una blacklist de tokens
      const token = jwt.sign({ userId: 'test-user', role: 'admin' }, config.JWT_SECRET, {
        expiresIn: '1h',
      });

      // Hacer logout
      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `portfolio_auth_token=${token}`)
        .expect(200);

      // Intentar usar el token después del logout
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Cookie', `portfolio_auth_token=${token}`)
        .expect(401); // Token debería estar invalidado
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in all responses', async () => {
      // TEST 10: Headers de seguridad esenciales
      const response = await request(app).get('/api/profile/someId').expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should not expose server information', async () => {
      // TEST 11: No revelar información del servidor
      const response = await request(app).get('/api/profile/someId');

      expect(response.headers['server']).toBeUndefined();
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in error messages', async () => {
      // TEST 12: Los errores no deben revelar información sensible
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrongpass' })
        .expect(401);

      // No debería revelar si el usuario existe o no
      expect(response.body.error).toBe('Credenciales inválidas');
      expect(response.body.error).not.toMatch(/usuario no encontrado|user not found/i);
    });

    it('should log security events without exposing sensitive data', async () => {
      // TEST 13: Logging de eventos de seguridad sin exponer datos sensibles
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpass' });

      // Verificar que se logueó el evento pero sin la contraseña
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls.find(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('login'))
      );

      if (logCall) {
        const logMessage = logCall.join(' ');
        expect(logMessage).not.toMatch(/wrongpass|password/i);
      }

      consoleSpy.mockRestore();
    });
  });
});
