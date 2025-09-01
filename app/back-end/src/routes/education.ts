import express from 'express';
import { educationController } from '../controllers/educationController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', educationController.getEducation);

// Rutas de debug (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/ids', educationController.debugEducationIds);
}

// Rutas de administración
router.post('/', authenticateAdmin, educationController.createEducation);
router.put('/:id', authenticateAdmin, educationController.updateEducation);
router.delete('/:id', authenticateAdmin, educationController.deleteEducation);

export default router;
