import express, { Router } from 'express';
import { skillsController } from '../controllers/skillsController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { publicIdMiddleware } from '../middleware/publicId.js';

const router: Router = express.Router();

// Rutas públicas
router.get('/', publicIdMiddleware.resolveUserIdQuery, skillsController.getSkills);

// Rutas de administración
router.post('/', authenticateAdmin, skillsController.createSkill);
router.put('/:id', authenticateAdmin, skillsController.updateSkill);
router.delete('/:id', authenticateAdmin, skillsController.deleteSkill);

export default router;
