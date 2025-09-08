import express from 'express';
import { profileController } from '../controllers/profileController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { securityMiddleware } from '../middleware/security.js';

const router = express.Router();

// Middleware de seguridad para orígenes permitidos
const allowedOrigins = [
  'https://adavilag-portfolio.vercel.app',
  'http://localhost:5173', // Para desarrollo
  'http://localhost:3000', // Para desarrollo
];

const originValidation = securityMiddleware.strictOriginValidation(allowedOrigins);

// ENDPOINT ELIMINADO POR SEGURIDAD: /pattern/:id
// Este endpoint exponía información innecesaria y se ha removido permanentemente

// Rutas públicas con validación de origen
router.get('/:id/full', originValidation, profileController.getFullProfile);
router.get('/:id', originValidation, profileController.getProfile);

// Rutas autenticadas con validación de origen
router.get('/auth/profile', originValidation, authenticateAdmin, profileController.getAuthProfile);
router.put('/auth/profile', originValidation, authenticateAdmin, profileController.updateProfile);

export default router;
