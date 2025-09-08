import express from 'express';
import { profileController } from '../controllers/profileController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { securityMiddleware } from '../middleware/security.js';
import { publicIdMiddleware } from '../middleware/publicId.js';

const router = express.Router();

// Middleware de seguridad para orígenes permitidos
const allowedOrigins = [
  'https://adravilag-portfolio.vercel.app',
  'http://localhost:5173', // Para desarrollo
  'http://localhost:5174', // Para desarrollo
  'http://localhost:3000', // Para desarrollo
];

const originValidation = securityMiddleware.strictOriginValidation(allowedOrigins);

// Nota: se elimina el rate limiting a nivel de endpoint público para evitar 429
// (la protección debe aplicarse a nivel del sitio o CDN si es necesario)

// Rutas públicas con validación de origen y resolución de ID público
router.get(
  '/:id/public',
  originValidation,
  publicIdMiddleware.resolveAdminAlias,
  profileController.getPublicProfile
);
router.get(
  '/:id/encrypted',
  originValidation,
  publicIdMiddleware.resolveAdminAlias,
  profileController.getEncryptedProfile
);
router.get(
  '/:id/pattern',
  originValidation,
  publicIdMiddleware.resolveAdminAlias,
  profileController.getPattern
);
router.get(
  '/:id',
  originValidation,
  publicIdMiddleware.resolveAdminAlias,
  profileController.getProfile
);

// Nueva ruta: Perfil público por username (alternativa segura al ID)
router.get(
  '/public/username/:username',
  originValidation,
  profileController.getPublicProfileByUsername
);

// Rutas privadas que requieren autenticación (información completa)
router.get('/:id/full', originValidation, authenticateAdmin, profileController.getFullProfile);

// Rutas autenticadas con validación de origen
router.get('/auth/profile', originValidation, authenticateAdmin, profileController.getAuthProfile);
router.put('/auth/profile', originValidation, authenticateAdmin, profileController.updateProfile);

export default router;
