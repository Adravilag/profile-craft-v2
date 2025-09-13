import express, { Router } from 'express';
import { educationController } from '../controllers/educationController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router: Router = express.Router();

// Rutas públicas
router.get('/', educationController.getEducation);

// Rutas de administración
router.post('/', authenticateAdmin, educationController.createEducation);
router.put('/:id', authenticateAdmin, educationController.updateEducation);
router.delete('/:id', authenticateAdmin, educationController.deleteEducation);

export default router;
