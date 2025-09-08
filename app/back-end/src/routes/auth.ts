import express from 'express';
import { authController } from '../controllers/authController.js';
import { profileController } from '../controllers/profileController.js';
import { authenticate, authenticateAdmin } from '../middleware/auth.js';
import { securityMiddleware, authSecurityMiddleware } from '../middleware/security.js';

const router = express.Router();

// Middleware de seguridad para todas las rutas de auth
const allowedOrigins = [
  'https://adavilag-portfolio.vercel.app',
  'http://localhost:5173', // Para desarrollo
  'http://localhost:3000', // Para desarrollo
];

const originValidation = securityMiddleware.strictOriginValidation(allowedOrigins);

// Rutas públicas (sin autenticación)
router.get('/has-user', originValidation, authController.hasUser);
router.get('/first-admin-user', originValidation, authController.firstAdminUser);

// Rutas de autenticación con rate limiting y validación
router.post(
  '/register',
  originValidation,
  securityMiddleware.sanitizeInput,
  securityMiddleware.limitPayloadSize(10 * 1024), // 10KB max
  authSecurityMiddleware.registerRateLimit,
  authSecurityMiddleware.validateCredentials,
  authController.register
);

router.post(
  '/login',
  originValidation,
  securityMiddleware.sanitizeInput,
  securityMiddleware.limitPayloadSize(10 * 1024), // 10KB max
  authSecurityMiddleware.loginRateLimit,
  authSecurityMiddleware.validateCredentials,
  authController.login
);

// Rutas autenticadas
router.get('/verify', originValidation, authenticate, authController.verify);
router.post('/logout', originValidation, authenticate, authController.logout);
router.get('/profile', originValidation, authenticate, profileController.getAuthProfile);
router.put(
  '/profile',
  originValidation,
  securityMiddleware.sanitizeInput,
  securityMiddleware.limitPayloadSize(50 * 1024), // 50KB max for profile data
  authenticate,
  profileController.updateProfile
);
router.post(
  '/change-password',
  originValidation,
  securityMiddleware.sanitizeInput,
  securityMiddleware.limitPayloadSize(10 * 1024),
  authenticate,
  authController.changePassword
);

// Rutas de desarrollo (bloqueadas en producción)
router.get(
  '/dev-token',
  securityMiddleware.blockInProduction,
  originValidation,
  authController.devToken
);

router.post(
  '/dev-login',
  securityMiddleware.blockInProduction,
  originValidation,
  authController.devLogin
);

export default router;
