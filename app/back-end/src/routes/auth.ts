import express from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController.js';
import { profileController } from '../controllers/profileController.js';
import { authenticate, optionalAuth, authenticateAdmin } from '../middleware/auth.js';
import { securityMiddleware, authSecurityMiddleware } from '../middleware/security.js';

const router = express.Router();

// Middleware de seguridad para todas las rutas de auth
import { config as appConfig } from '../config/index.js';
const originValidation = securityMiddleware.strictOriginValidation(appConfig.ALLOWED_ORIGINS);

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
router.get('/verify', originValidation, optionalAuth, authController.verify);
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

// Endpoints públicos para recuperación de contraseña
router.post(
  '/request-reset',
  securityMiddleware.sanitizeInput,
  securityMiddleware.limitPayloadSize(10 * 1024),
  authController.requestPasswordReset
);

router.post(
  '/confirm-reset',
  securityMiddleware.sanitizeInput,
  securityMiddleware.limitPayloadSize(10 * 1024),
  authController.confirmPasswordReset
);

// Ruta administrativa para resetear contraseñas
router.post(
  '/admin/reset-password',
  authenticateAdmin,
  [body('email').isEmail(), body('newPassword').isLength({ min: 6 })],
  authController.resetUserPassword
);

export default router;
