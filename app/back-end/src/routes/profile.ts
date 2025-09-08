import express from 'express';
import { profileController } from '../controllers/profileController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { securityMiddleware } from '../middleware/security.js';

const router = express.Router();

// Middleware de seguridad para orígenes permitidos
const allowedOrigins = [
  'https://adravilag-portfolio.vercel.app',
  'https://profile-craft-v2.vercel.app',
  'https://profile-craft-v2-adravilag.vercel.app',
  'http://localhost:5173', // Para desarrollo
  'http://localhost:3000', // Para desarrollo
];

const originValidation = securityMiddleware.strictOriginValidation(allowedOrigins);

// Rate limiting para endpoints públicos (más restrictivo)
const publicRateLimit = securityMiddleware.advancedRateLimit(30, 15 * 60 * 1000); // 30 requests por 15 minutos

// ENDPOINT ELIMINADO POR SEGURIDAD: /pattern/:id
// Este endpoint exponía información innecesaria y se ha removido permanentemente

// Rutas públicas con validación de origen y rate limiting (información limitada para portafolio)
router.get('/:id/public', originValidation, publicRateLimit, profileController.getPublicProfile);
router.get(
  '/:id/encrypted',
  originValidation,
  publicRateLimit,
  profileController.getEncryptedProfile
);
router.get('/:id', originValidation, publicRateLimit, profileController.getProfile);

// Rutas privadas que requieren autenticación (información completa)
router.get('/:id/full', originValidation, authenticateAdmin, profileController.getFullProfile);

// Rutas autenticadas con validación de origen
router.get('/auth/profile', originValidation, authenticateAdmin, profileController.getAuthProfile);
router.put('/auth/profile', originValidation, authenticateAdmin, profileController.updateProfile);

export default router;
