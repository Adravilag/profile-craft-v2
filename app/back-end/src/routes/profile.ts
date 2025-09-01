import express from 'express';
import { profileController } from '../controllers/profileController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
// Nota: la ruta específica `/pattern/:id` debe registrarse antes de la ruta genérica `/:id`
// para evitar que Express haga match con `/:id` y nunca alcance el handler de pattern.
router.get('/pattern/:id', profileController.getPattern);
// Perfil completo (usuario + colecciones relacionadas)
router.get('/:id/full', profileController.getFullProfile);
router.get('/:id', profileController.getProfile);

// Rutas autenticadas
router.get('/auth/profile', authenticateAdmin, profileController.getAuthProfile);
router.put('/auth/profile', authenticateAdmin, profileController.updateProfile);

export default router;
