import express from 'express';
import { experiencesController } from '../controllers/experiencesController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', experiencesController.getExperiences);

// Rutas de administración
router.post('/', authenticateAdmin, experiencesController.createExperience);
router.put('/:id', authenticateAdmin, experiencesController.updateExperience);
router.delete('/:id', authenticateAdmin, experiencesController.deleteExperience);

export default router;
